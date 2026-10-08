from tasks.normalizator.python_normalizer import (
    remove_python_comments,
    normalize_python_identifiers,
)


# =========================
# COMMENTS
# =========================

def test_python_remove_comment():
    code = """
    # comment
    x = 1
    """

    result = remove_python_comments(code)

    assert "#" not in result


def test_python_inline_comment():
    code = """
    x = 1  # comment
    y = 2
    """

    result = remove_python_comments(code)

    assert "#" not in result


def test_python_comment_preserves_code():
    code = """
    # comment
    def f():
        return 1
    """

    result = remove_python_comments(code)

    assert "def" in result
    assert "return" in result


# =========================
# IDENTIFIERS
# =========================

def test_python_function_normalization():
    code = """
    def add(x, y):
        return x + y
    """

    result = normalize_python_identifiers(code)

    assert "var" in result


def test_python_variables_normalization():
    code = """
    x = 10
    y = 20
    return x + y
    """

    result = normalize_python_identifiers(code)

    assert "var" in result


def test_python_literals_normalization():
    code = """
    x = "hello"
    y = 123
    z = 1.5
    """

    result = normalize_python_identifiers(code)

    assert "literal" in result


def test_python_stable_output():
    code = """
    def f(x): return x
    """

    r1 = normalize_python_identifiers(code)
    r2 = normalize_python_identifiers(code)

    assert r1 == r2