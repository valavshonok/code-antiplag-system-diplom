import logging
import time
import datetime
import json
from celery_app import celery_app
from .check_conditions import check_conditions, Condition

from . import db

logging.basicConfig(level=logging.INFO, format='%(asctime)s [%(levelname)s] %(message)s')
logger = logging.getLogger(__name__)

@celery_app.task(bind=True, name="condition")
def condition(self, process_id: int):
    logger.info(f"Start condition process_id={process_id}")
    time.sleep(5)  # небольшой демо-таймаут

    start_time = time.time()

    try:
        # -----------------------
        # Получаем процесс
        # -----------------------
        process = db.get_process(process_id)
        if not process:
            logger.warning(f"Process {process_id} not found.")
            return

        if process.process_type != "condition":
            logger.warning(f"Process {process_id} is not of type condition.")
            return

        contest_id = process.contest_id

        # Обновляем прогресс
        db.update_process_status(process_id, status="running", progress=0)

        # -----------------------
        # Проверка соответствия
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

        config = db.get_contest_config(contest_id)

        problems = config.get("problems", [])

        for idx, sub in enumerate(submissions, start=1):

            problem_config = next(
                (p for p in problems if p["problem"] == sub.problem),
                None
            )

            if not problem_config:
                continue

            conditions = problem_config.get("conditions", [])

            # преобразуем в формат модели
            llm_conditions = [
                Condition(title=c["title"], description=c["description"])
                for c in conditions
            ]

            results = check_conditions(sub.code, llm_conditions)

           
            # формируем итоговую структуру
            condition_payload = {
                "conditions": [
                    {
                        **conditions[i],
                        "satisfied": results[i].satisfied if i < len(results) else False,
                        "comment": results[i].comment if i < len(results) else "",
                        "expert_verdict": None
                    }
                    for i in range(len(conditions))
                ],
                "score": problem_config.get("score", 0)
            }

            db.save_submission_conditions(
                process_id=process_id,
                submission_id=sub.id,
                condition_results=condition_payload
            )

            progress = int(idx / total_subs * 100)
            db.update_process_status(process_id, progress=progress)


            try:
                # Лог прогресса с ETA
                progress = idx / total_subs * 100
                elapsed = time.time() - start_time
                avg_time_per_submission = elapsed / idx
                remaining = total_subs - idx
                eta_seconds = avg_time_per_submission * remaining
                eta_str = str(datetime.timedelta(seconds=int(eta_seconds)))

                logger.info(
                    f"Processed {idx}/{total_subs} submissions. Progress: {progress:.1f}%. ETA: {eta_str}"
                )
            except:
                pass


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
