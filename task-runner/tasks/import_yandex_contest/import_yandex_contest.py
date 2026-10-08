import logging
import json

from celery_app import celery_app
from .extract_zip_submissions import extract_submissions_from_zip_bytes
from ..formater.format_code import format_code
from .normalize_language import normalize_language
from . import db

logger = logging.getLogger(__name__)

CONFIG_JSON = """
{
    "import_only_OK_verdict": true,
    "remove_empty_lines": true,
    "format_code": true
}
"""
CONFIG = json.loads(CONFIG_JSON)


@celery_app.task(bind=True, name="import_yandex")
def import_yandex_contest(self, process_id: int, submission_bytes: bytes):

    logger.info(f"Start Yandex import process_id={process_id}")

    process = db.get_process(process_id)

    if not process:
        logger.warning(f"Process {process_id} not found")
        return

    if process.process_type != "import":
        logger.warning(f"Process {process_id} wrong type")
        return

    contest_id = process.contest_id

    db.start_process(process_id)

    try:
        submissions = extract_submissions_from_zip_bytes(submission_bytes)
    except ValueError as e:
        logger.error(f"Bad archive: {e}")
        return

    raw_config = db.get_contest_config(contest_id)

    if isinstance(raw_config, dict) and isinstance(raw_config.get("import"), dict):
        config = raw_config["import"]
    else:
        config = CONFIG

    contestant_map = {}
    problem_set = set()

    total = len(submissions)

    for idx, sub in enumerate(submissions, start=1):

        verdict = sub["verdict"]

        if verdict not in ("OK", "AC"):
            continue

        author_id = sub["authorId"]
        author_name = sub["author"]

        if author_id not in contestant_map:
            try:
                cid = db.insert_contestant(contest_id, author_name)
                contestant_map[author_id] = cid
            except Exception as e:
                logger.warning(f"Failed to insert contestant {author_name}: {e}")
                continue

        contestant_id = contestant_map[author_id]

        problem = sub["problem"]
        language = normalize_language(sub["language"])
        code = sub["code"]

        problem_set.add(problem)

        if config.get("format_code", False):
            code = format_code(code, language=language)

        try:
            db.insert_submission(
                contestant_id,
                code,
                verdict,
                problem,
                language
            )
        except Exception as e:
            logger.error(f"Failed to insert submission {sub['submissionId']}: {e}")
            continue

        progress = int(idx / total * 100)
        db.update_process_progress(process_id, progress)

    # обновляем список задач

    problems_list = []

    for name in sorted(problem_set):
        problems_list.append({
            "problem": name,
            "conditions": [],
            "score": 1
        })

    raw_config = db.get_contest_config(contest_id)

    if not isinstance(raw_config, dict):
        raw_config = {}

    raw_config["problems"] = problems_list

    db.update_contest_config(contest_id, raw_config)

    db.finish_process(process_id)

    logger.info(f"Process {process_id} import finished")