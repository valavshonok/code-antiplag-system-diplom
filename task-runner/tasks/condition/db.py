# db.py
import json
from sqlalchemy import create_engine, text

engine = create_engine("postgresql://postgres:123@db:5432/diplom")

def get_contest_config(contest_id: int):
    with engine.begin() as conn:
        row = conn.execute(
            text("""
                SELECT config
                FROM contests
                WHERE id = :cid
            """),
            {"cid": contest_id}
        ).fetchone()

        if not row or not row.config:
            return None

        config = row.config

        # Если это уже dict (JSON/JSONB колонка)
        if isinstance(config, dict):
            return config

        # Если это строка (TEXT колонка)
        if isinstance(config, str):
            return json.loads(config)

        return None

def save_submission_conditions(process_id: int, submission_id: int, condition_results: dict):
    with engine.begin() as conn:
        conn.execute(
            text("""
                INSERT INTO submission_conditions
                (process_id, submission_id, condition_results)
                VALUES (:pid, :sid, :results)
            """),
            {
                "pid": process_id,
                "sid": submission_id,
                "results": json.dumps(condition_results)
            }
        )

# -------------------------
# Процессы
# -------------------------
def get_process(process_id: int):
    with engine.begin() as conn:
        return conn.execute(
            text("""
                SELECT id, contest_id, process_type, progress, status
                FROM processes
                WHERE id = :pid
            """),
            {"pid": process_id}
        ).fetchone()


def update_process_status(process_id: int, status: str = None, progress: int = None, message: dict = None):
    with engine.begin() as conn:
        params = {"pid": process_id}
        set_clause = []
        if status is not None:
            set_clause += ["status = :status"]
            params["status"] = status
        if progress is not None:
            set_clause += ["progress = :progress"]
            params["progress"] = progress
        if message is not None:
            set_clause += ["message = :msg"]
            params["msg"] = json.dumps(message)
        conn.execute(
            text(f"""
                UPDATE processes
                SET {", ".join(set_clause)}
                WHERE id = :pid
            """),
            params
        )


# -------------------------
# Посылки
# -------------------------
def get_submissions_by_contest(contest_id: int):
    fields = "s.id, s.code, s.language, s.problem, s.verdict, s.contestant_id, s.normalized_code"

    with engine.begin() as conn:
        return conn.execute(
            text(f"""
                SELECT {fields}
                FROM submissions s
                JOIN contestants c ON s.contestant_id = c.id
                WHERE c.contest_id = :cid
            """),
            {"cid": contest_id}
        ).fetchall()



