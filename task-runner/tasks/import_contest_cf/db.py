# db.py
import json
from sqlalchemy import create_engine, text

engine = create_engine("postgresql://postgres:123@db:5432/diplom")

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