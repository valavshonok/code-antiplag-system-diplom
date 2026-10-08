from tasks.normalizator.cpp_normalizer import (
    remove_cpp_comments,
    normalize_cpp_identifiers,
)


# =========================
# COMMENTS
# =========================

def test_cpp_remove_line_comment():
    code = """
    int a; // comment
    int b;
    """

    result = remove_cpp_comments(code)

    assert "//" not in result
    assert "int a" in result
    assert "int b" in result


def test_cpp_remove_block_comment():
    code = """
    int a;
    /* block comment */
    int b;
    """

    result = remove_cpp_comments(code)

    assert "block comment" not in result


def test_cpp_comment_compaction():
    code = """
    int a;


    int b;
    """

    result = remove_cpp_comments(code)

    assert "\n\n\n" not in result


# =========================
# IDENTIFIERS
# =========================

def test_cpp_function_normalization():
    code = """
    int sum(int a, int b) {
        return a + b;
    }
    """

    result = normalize_cpp_identifiers(code)

    assert "var" in result


def test_cpp_variables_normalization():
    code = """
    int x = 10;
    int y = 20;
    return x + y;
    """

    result = normalize_cpp_identifiers(code)

    assert "var" in result


def test_cpp_class_normalization():
    code = """
    class MyClass {
        int value;
    };
    """

    result = normalize_cpp_identifiers(code)

    assert "type" in result


def test_cpp_stable_output():
    code = """
    int f(int x) { return x; }
    """

    r1 = normalize_cpp_identifiers(code)
    r2 = normalize_cpp_identifiers(code)

    assert r1 == r2