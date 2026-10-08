import logging
import time
import json
from celery_app import celery_app
from sqlalchemy import create_engine, text
from .codeforcesAPI import CodeforcesAPI
from .extract_zip_submissions import extract_code_from_zip_bytes
from ..formater.format_code import format_code
from .normalize_cf_language import normalize_cf_language
from . import db

logging.basicConfig(level=logging.INFO, format='%(asctime)s [%(levelname)s] %(message)s')
logger = logging.getLogger(__name__)

engine = create_engine("postgresql://postgres:123@db:5432/diplom")

CONFIG_JSON = """
{
    "import_only_OK_verdict": true,
    "remove_empty_lines": true,
    "format_code": true
}
"""
CONFIG = json.loads(CONFIG_JSON)

@celery_app.task(bind=True, name="import")
def import_contest_cf(self, process_id: int, cf_api_key: str, cf_api_secret: str, cf_contest_id: str, file_bytes: bytes):
    logger.info(f"Start import process_id={process_id}")
    
    time.sleep(5)

    cf = CodeforcesAPI(cf_api_key, cf_api_secret)

    # Разбираем архив
    try:
        code_dict = extract_code_from_zip_bytes(file_bytes)
    except ValueError as e:
        logger.error(f"Failed to extract archive: {e}")
        return

    # Получаем процесс и contest_id короткой транзакцией
    with engine.begin() as conn:
        process = conn.execute(
            text("SELECT id, contest_id, process_type FROM processes WHERE id = :pid"),
            {"pid": process_id}
        ).fetchone()

        if not process:
            logger.warning(f"Process {process_id} not found. Exiting.")
            return
        if process.process_type != 'import':
            logger.warning(f"Process {process_id} is not of type import. Exiting.")
            return

        contest_id = process.contest_id

        conn.execute(
            text("UPDATE processes SET progress = 0, status = 'running' WHERE id = :pid"),
            {"pid": process_id}
        )

    raw_config = db.get_contest_config(contest_id)

    if isinstance(raw_config, dict) and isinstance(raw_config.get("import"), dict):
        config = raw_config["import"]
    else:
        config = CONFIG

    submissions = cf.get_contest_status(contestId=cf_contest_id)

    handle_to_db_id = {}
    problem_set = set()

    # Добавляем участников и фиксируем каждого сразу
    for sub in submissions:
        problem_set.add(sub["problem"]["index"])
        for member in sub["author"]["members"]:
            handle = member["handle"]
            if handle not in handle_to_db_id:
                try:
                    with engine.begin() as conn:
                        result = conn.execute(
                            text("INSERT INTO contestants (contest_id, name) VALUES (:cid, :name) RETURNING id"),
                            {"cid": contest_id, "name": member["name"]}
                        )
                        contestant_id = result.fetchone().id
                        handle_to_db_id[handle] = contestant_id
                except Exception as e:
                    logger.warning(f"Failed to insert contestant {handle}: {e}")
                    continue

    logger.info(f"Total contestants added/loaded: {len(handle_to_db_id)}")

    # Добавляем посылки, фиксируя каждую вставку сразу
    total = len(submissions)
    for idx, sub in enumerate(submissions, start=1):
        if config.get("import_only_OK_verdict", False):
            if sub.get("verdict", "unknown") not in ["OK", ""] and (not "points" in sub or sub["points"] == 0):
                continue
        member = sub["author"]["members"][0]
        handle = member["handle"]
        submission_id = sub["id"]
        contestant_id = handle_to_db_id.get(handle)
        if not contestant_id:
            logger.warning(f"No contestant id for handle {handle}, skipping submission {submission_id}")
            continue

        code = code_dict.get(submission_id)
        if not code:
            logger.warning(f"Skipping submission {submission_id}: no source code")
            continue
        
        if config.get("format_code", False):
            code = format_code(code, language=normalize_cf_language(sub.get("programmingLanguage", "unknown")))

        try:
            with engine.begin() as conn:
                conn.execute(
                    text("""
                        INSERT INTO submissions 
                            (contestant_id, code, verdict, problem, language)
                        VALUES 
                            (:cid, :code, :verdict, :problem, :language)
                    """),
                    {
                        "cid": contestant_id,
                        "code": code,
                        "verdict": sub.get("verdict", "unknown"),
                        "problem": sub["problem"]["index"],
                        "language": normalize_cf_language(sub.get("programmingLanguage", "unknown"))
                    }
                )

                progress = int(idx / total * 100)
                conn.execute(
                    text("UPDATE processes SET progress = :prog WHERE id = :pid"),
                    {"prog": progress, "pid": process_id}
                )
        except Exception as e:
            logger.error(f"Failed to insert submission {submission_id}: {e}")
            continue

        logger.info(f"Processed submission {idx}/{total}, id={submission_id}")

    # Обновляем список задач в контесте
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

    # Завершаем процесс
    with engine.begin() as conn:
        conn.execute(
            text("UPDATE processes SET progress = 100, status = 'done' WHERE id = :pid"),
            {"pid": process_id}
        )

    logger.info(f"Process {process_id} import finished.")
