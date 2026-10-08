import subprocess
import logging
from tree_sitter import Language, Parser
import tree_sitter_python as tspython

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

PY_LANGUAGE = Language(tspython.language())


# ----------------------------
# 1. REMOVE COMMENTS
# ----------------------------
def remove_python_comments(code: str) -> str:
    parser = Parser(PY_LANGUAGE)
    tree = parser.parse(code.encode("utf-8"))

    removals = []

    def walk(node):
        # Python comments are "comment"
        if node.type == "comment":
            removals.append((node.start_byte, node.end_byte))

        for c in node.children:
            walk(c)

    walk(tree.root_node)

    for start, end in sorted(removals, reverse=True):
        code = code[:start] + " " * (end - start) + code[end:]

    return code


# ----------------------------
# 2. NORMALIZE IDENTIFIERS
# ----------------------------
def normalize_python_identifiers(code: str) -> str:
    parser = Parser(PY_LANGUAGE)
    tree = parser.parse(code.encode("utf-8"))

    replacements = []

    def add(node, value):
        replacements.append((node.start_byte, node.end_byte, value))

    def walk(node):
        t = node.type

        # function names
        if t == "function_definition":
            name = node.child_by_field_name("name")
            if name:
                add(name, "func")

        # class names
        elif t == "class_definition":
            name = node.child_by_field_name("name")
            if name:
                add(name, "type")

        # parameters
        elif t == "parameters":
            for c in node.children:
                if c.type == "identifier":
                    add(c, "var")

        # variables / identifiers
        elif t == "identifier":
            add(node, "var")

        # literals
        elif t in ("string", "integer", "float"):
            add(node, "literal")

        for c in node.children:
            walk(c)

    walk(tree.root_node)

    unique = {(s, e): v for s, e, v in replacements}
    items = sorted(unique.items(), key=lambda x: x[0][0], reverse=True)

    for (start, end), value in items:
        code = code[:start] + value + code[end:]

    return code


# ----------------------------
# 3. FORMAT STRUCTURE (black)
# ----------------------------
def format_python_code(code: str) -> str:
    try:
        process = subprocess.run(
            ["black", "-"],
            input=code.encode("utf-8"),
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            check=True,
        )
        return process.stdout.decode("utf-8")

    except Exception as e:
        logger.exception(f"Ошибка при форматировании: {e}")
        return code