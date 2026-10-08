import subprocess
import logging
from tree_sitter import Language, Parser
import tree_sitter_cpp as tscpp

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

CPP_LANGUAGE = Language(tscpp.language())


# ----------------------------
# 1. REMOVE COMMENTS
# ----------------------------
def remove_cpp_comments(code: str) -> str:
    parser = Parser(CPP_LANGUAGE)
    tree = parser.parse(code.encode("utf-8"))

    removals = []

    def walk(node):
        if node.type == "comment":
            removals.append((node.start_byte, node.end_byte))
        for c in node.children:
            walk(c)

    walk(tree.root_node)

    if removals:
        code_bytes = code.encode("utf-8")
        result = bytearray()
        last = 0

        for start, end in sorted(removals):
            result += code_bytes[last:start]
            last = end

        result += code_bytes[last:]
        code = result.decode("utf-8", errors="ignore")

    lines = code.splitlines()

    cleaned = []
    prev_empty = False

    for line in lines:
        line = line.rstrip()

        if not line.strip():
            if not prev_empty:
                cleaned.append("")
            prev_empty = True
        else:
            cleaned.append(line)
            prev_empty = False

    return "\n".join(cleaned).strip() + "\n"


# ----------------------------
# 2. NORMALIZE TYPES / VARS / FUNCS
# ----------------------------
def normalize_cpp_identifiers(code: str) -> str:
    parser = Parser(CPP_LANGUAGE)
    tree = parser.parse(code.encode("utf-8"))

    replacements = []

    def add(node, value):
        replacements.append((node.start_byte, node.end_byte, value))

    def walk(node):
        t = node.type

        if t == "function_declarator":
            d = node.child_by_field_name("declarator")
            if d and d.type == "identifier":
                add(d, "func")

        elif t in ("parameter_declaration", "init_declarator"):
            d = node.child_by_field_name("declarator")
            if d and d.type == "identifier":
                add(d, "var")

        elif t in ("class_specifier", "struct_specifier"):
            n = node.child_by_field_name("name")
            if n:
                add(n, "type")

        elif t == "identifier":
            add(node, "var")

        elif t == "type_identifier":
            add(node, "type")

        for c in node.children:
            walk(c)

    walk(tree.root_node)

    unique = {(s, e): v for s, e, v in replacements}
    items = sorted(unique.items(), key=lambda x: x[0][0], reverse=True)

    for (start, end), value in items:
        code = code[:start] + value + code[end:]

    return code


# ----------------------------
# 3. FORMAT STRUCTURE (clang-format)
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
    