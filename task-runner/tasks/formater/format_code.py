from .python_formater import (
    format_python_code,
)

from .cpp_formater import (
    format_cpp_code,
)

def format_code(code: str, language: str = "") -> str:
    if language == "cpp":
        code = format_cpp_code(code)
    if language == "py":
        code = format_python_code(code)
    return code



