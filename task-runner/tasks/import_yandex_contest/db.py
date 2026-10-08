# db.py
import json
from sqlalchemy import create_engine, text

engine = create_engine("postgresql://postgres:123@db:5432/diplom")


def get_process(process_id: int):
    with engine.begin() as conn:
        return conn.execute(
            text("""
                SELECT id, contest_id, process_type
                FROM processes
                WHERE id = :pid
            """),
            {"pid": process_id}
        ).fetchone()


def start_process(process_id: int):
    with engine.begin() as conn:
        conn.execute(
            text("""
                UPDATE processes
                SET progress = 0, status = 'running'
                WHERE id = :pid
            """),
            {"pid": process_id}
        )


def update_process_progress(process_id: int, progress: int):
    with engine.begin() as conn:
        conn.execute(
            text("""
                UPDATE processes
                SET progress = :progress
                WHERE id = :pid
            """),
            {"progress": progress, "pid": process_id}
        )


def finish_process(process_id: int):
    with engine.begin() as conn:
        conn.execute(
            text("""
                UPDATE processes
                SET progress = 100, status = 'done'
                WHERE id = :pid
            """),
            {"pid": process_id}
        )


def insert_contestant(contest_id: int, name: str):
    with engine.begin() as conn:
        res = conn.execute(
            text("""
                INSERT INTO contestants (contest_id, name)
                VALUES (:cid, :name)
                RETURNING id
            """),
            {"cid": contest_id, "name": name}
        )
        return res.fetchone().id


def insert_submission(contestant_id: int, code: str, verdict: str, problem: str, language: str):
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
                "verdict": verdict,
                "problem": problem,
                "language": language
            }
        )

# -------------------------
# Настройки контеста
# -------------------------
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
    
def update_contest_config(contest_id: int, config: dict):
    with engine.begin() as conn:
        conn.execute(
            text("""
                UPDATE contests
                SET config = :config
                WHERE id = :cid
            """),
            {
                "cid": contest_id,
                "config": json.dumps(config)
            }
        )