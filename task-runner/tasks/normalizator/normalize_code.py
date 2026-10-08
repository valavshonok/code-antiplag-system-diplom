from .python_normalizer import (
    remove_python_comments,
    normalize_python_identifiers,
    format_python_code,
)

from .cpp_normalizer import (
    remove_cpp_comments,
    normalize_cpp_identifiers,
    format_cpp_code,
)

def normalize_code(code: str, language: str = "", config: dict | None = None) -> str:
    config = config or {}

    if language == "cpp":
        code = format_cpp_code(code)
        code = remove_cpp_comments(code)

        if config.get("normalize_types", False):
            code = normalize_cpp_identifiers(code)

    elif language == "py":
        code = format_python_code(code)
        code = remove_python_comments(code)

        if config.get("normalize_types", False):
            code = normalize_python_identifiers(code)

    return code

