import logging
import time
import json
from celery_app import celery_app
from itertools import product
import comparison_engine

from ..normalizator.normalize_code import normalize_code
from . import db

logging.basicConfig(level=logging.INFO, format='%(asctime)s [%(levelname)s] %(message)s')
logger = logging.getLogger(__name__)

CONFIG_JSON = """
{
  "rename_variables": true,
  "remove_comments": true,
  "apply_preprocessing": true,
  "remove_using_namespace": true,
  "normalize_types": true,
  "remove_empty_lines": true,
  "format_code": true
}
"""
CONFIG = json.loads(CONFIG_JSON)



@celery_app.task(bind=True, name="comparison")
def comparison(self, process_id: int):
    logger.info(f"Start comparison process_id={process_id}")
    time.sleep(5)  # небольшой демо-таймаут

    try:
        # -----------------------
        # Получаем процесс
        # -----------------------
        process = db.get_process(process_id)
        if not process:
            logger.warning(f"Process {process_id} not found.")
            return

        if process.process_type != "comparison":
            logger.warning(f"Process {process_id} is not of type comparison.")
            return

        contest_id = process.contest_id

        # Обновляем прогресс
        db.update_process_status(process_id, status="running", progress=0)

        # -----------------------
        # Этап 1: нормализация
        # -----------------------
        submissions = db.get_submissions_by_contest(contest_id)
        logger.info(f"Найдено {len(submissions)} посылок contest_id={contest_id}")
        total_subs = len(submissions)
        if total_subs == 0:
            db.update_process_status(
                process_id,
                status="done",
                progress=100,
                message={"info": "no submissions"}
            )
            logger.info(f"No submissions found for contest {contest_id}")
            return

        raw_config = db.get_contest_config(contest_id)

        if isinstance(raw_config, dict) and isinstance(raw_config.get("comparison"), dict):
            config = raw_config["comparison"]
        else:
            config = CONFIG

        for idx, sub in enumerate(submissions, start=1):
            proc = db.get_process(process_id)
            if proc == None or proc.status != "running":
                break
            normalized = normalize_code(sub.code, sub.language, config)
            db.update_submission_normalized(sub.id, normalized)

            progress = int(idx / total_subs / 2 * 100)  # первый этап 0-50%
            db.update_process_status(process_id, progress=progress)
            logger.info(f"Normalized submission {sub.id} ({idx}/{total_subs}), progress={progress}%")

        # -----------------------
        # Этап 2: сравнение
        # -----------------------
        submissions = db.get_submissions_by_contest(contest_id)

        def ensure_utf8(value):
            if value is None:
                return ""
            if isinstance(value, bytes):
                return value.decode("utf-8", errors="replace")
            return value
    
        cpp_subs = []
        for s in submissions:
            sub = comparison_engine.Submission()
            sub.id = s.id
            sub.contestant_id = s.contestant_id

            sub.code = ensure_utf8(s.code)
            sub.normalized_code = ensure_utf8(s.normalized_code)

            sub.problem = ensure_utf8(s.problem)
            sub.language = ensure_utf8(s.language)

            cpp_subs.append(sub)

        def progress_callback(done, total, progress, results):
            db.bulk_insert_submission_comparisons(results)
            logger.info(
                f"Сравнение {process_id}: "
                f"{done}/{total} "
                f"({progress}%)"
            )
            db.update_process_status(process_id, status="running", progress=progress)

        comparison_engine.run_comparison(
            process_id,
            cpp_subs,
            0,                  # min match percent
            20,                 # batch_size
            progress_callback
        )


        # -----------------------
        # Завершение процесса
        # -----------------------
        db.update_process_status(process_id, status="done", progress=100)
        logger.info(f"Process {process_id} finished successfully.")

    except Exception as e:
        logger.exception(f"Process {process_id} failed: {e}")
        db.update_process_status(
            process_id, 
            status="error",
            message={"error": str(e)}
        )
        raise
