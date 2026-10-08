import subprocess
import logging

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

# ----------------------------
# FORMAT STRUCTURE (clang-format)
# ----------------------------
def format_cpp_code(code: str) -> str:
    try:
        process = subprocess.run(
            ["clang-format", "-style=LLVM"],
            input=code.encode("utf-8"),
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            check=True,
        )
        return process.stdout.decode("utf-8")

    except Exception as e:
        logger.exception(f"Ошибка при форматировании: {e}")
        return code
   