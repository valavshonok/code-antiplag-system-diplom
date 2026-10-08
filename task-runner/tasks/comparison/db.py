# db.py
import json
from sqlalchemy import create_engine, text

engine = create_engine("postgresql://postgres:123@db:5432/diplom")


def safe_str(value):
    """
    Безопасное преобразование bytes → str.
    Никаких падений из-за UTF-8.
    """
    if value is None:
        return None

    if isinstance(value, bytes):
        return value.decode("utf-8", errors="replace")

    return str(value)


from sqlalchemy import Table, Column, Integer, Boolean
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy import MetaData

metadata = MetaData()

submission_comparisons = Table(
    "submission_comparisons",
    metadata,
    Column("process_id", Integer),
    Column("submission1_id", Integer),
    Column("submission2_id", Integer),
    Column("diff_string_blocks", JSONB),
    Column("diff_string_blocks_normalized", JSONB),
    Column("diff_char_blocks", JSONB),
    Column("diff_char_blocks_normalized", JSONB),
    Column("match_percent", Integer),
    Column("match_percent_normalized", Integer),
    Column("is_plagiarism", Boolean),
)

def bulk_insert_submission_comparisons(results):
    if not results:
        return

    rows = []

    for r in results:
        rows.append({
            "process_id": int(r.processId),
            "submission1_id": int(r.submission1Id),
            "submission2_id": int(r.submission2Id),

            "diff_string_blocks": [
                {
                    "type": safe_str(b.type),
                    "text1": b.text1,
                    "text2": b.text2,
                }
                for b in r.diffStringBlocks
            ],

            "diff_string_blocks_normalized": [
                {
                    "type": safe_str(b.type),
                    "text1": b.text1,
                    "text2": b.text2,
                }
                for b in r.diffStringBlocksNormalized
            ],

            "diff_char_blocks": [
                {
                    "type": safe_str(b.type),
                    "text1": safe_str(b.text1),
                    "text2": safe_str(b.text2),
                }
                for b in r.diffCharBlocks
            ],

            "diff_char_blocks_normalized": [
                {
                    "type": safe_str(b.type),
                    "text1": safe_str(b.text1),
                    "text2": safe_str(b.text2),
                }
                for b in r.diffCharBlocksNormalized
            ],

            "match_percent": int(r.matchPercent),
            "match_percent_normalized": int(r.matchPercentNormalized),
            "is_plagiarism": bool(r.plagiarism),
        })

    with engine.begin() as conn:
        conn.execute(submission_comparisons.insert(), rows)


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


def update_submission_normalized(submission_id: int, normalized_code: str):
    with engine.begin() as conn:
        conn.execute(
            text("""
                UPDATE submissions
                SET normalized_code = :norm
                WHERE id = :sid
            """),
            {"norm": normalized_code, "sid": submission_id}
        )


# -------------------------
# Сравнения
# -------------------------
def insert_submission_comparison(
    process_id: int,
    s1_id: int,
    s2_id: int,
    diff_blocks,
    diff_blocks_norm,
    diff_chars,
    diff_chars_norm,
    match_percent,
    match_percent_norm,
    is_plagiarism: bool
):
    with engine.begin() as conn:
        conn.execute(
            text("""
                INSERT INTO submission_comparisons (
                    process_id,
                    submission1_id,
                    submission2_id,
                    diff_string_blocks,
                    diff_string_blocks_normalized,
                    diff_char_blocks,
                    diff_char_blocks_normalized,
                    match_percent,
                    match_percent_normalized,
                    is_plagiarism
                )
                VALUES (
                    :pid, :s1, :s2, :dsb, :dsbn, :dcb, :dcbn, :mp, :mpn, :plag
                )
            """),
            {
                "pid": process_id,
                "s1": s1_id,
                "s2": s2_id,
                "dsb": json.dumps(diff_blocks),
                "dsbn": json.dumps(diff_blocks_norm),
                "dcb": json.dumps(diff_chars),
                "dcbn": json.dumps(diff_chars_norm),
                "mp": match_percent,
                "mpn": match_percent_norm,
                "plag": is_plagiarism
            }
        )

# -------------------------
# Настройки сравнения
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
