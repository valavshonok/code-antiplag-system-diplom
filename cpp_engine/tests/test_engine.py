import comparison_engine as ce

# =========================
# string_similarity tests
# =========================

def test_similarity_equal():
    # идентичные строки
    result = ce.string_similarity("print(1)", "print(1)")
    assert result == 100


def test_similarity_completely_different():
    # полностью разные строки
    result = ce.string_similarity("abc", "xyz")
    assert result == 0


def test_similarity_ignores_whitespace():
    # пробелы игнорируются (weight=0)
    result = ce.string_similarity("a b c", "abc")
    assert result == 100


def test_similarity_partial_match():
    # частичное совпадение
    result = ce.string_similarity("abcde", "abzzz")
    assert 0 < result < 100


def test_similarity_empty_strings():
    # оба пустые
    result = ce.string_similarity("", "")
    assert result == 100


# =========================
# run_comparison tests
# =========================

def _make_submission(id_, contestant, code, problem="A", lang="py"):
    s = ce.Submission()
    s.id = id_
    s.contestant_id = contestant
    s.code = code
    s.normalized_code = code
    s.problem = problem
    s.language = lang
    return s


def test_run_comparison_basic_match():
    # одинаковые решения - должно быть сравнение

    subs = [
        _make_submission(1, 1, "print(1)"),
        _make_submission(2, 2, "print(1)")
    ]

    results = []

    def cb(done, total, progress, batch):
        results.extend(batch)

    ce.run_comparison(1, subs, 0, 10, cb)

    assert len(results) >= 2


def test_run_comparison_filters_by_problem():
    # разные задачи - нет сравнения

    subs = [
        _make_submission(1, 1, "a", problem="A"),
        _make_submission(2, 2, "a", problem="B")
    ]

    results = []

    ce.run_comparison(1, subs, 0, 10, lambda *args: results.extend(args[3]))

    assert len(results) == 0


def test_run_comparison_filters_by_language():
    # разные языки - нет сравнения

    subs = [
        _make_submission(1, 1, "a", lang="py"),
        _make_submission(2, 2, "a", lang="cpp")
    ]

    results = []

    ce.run_comparison(1, subs, 0, 10, lambda *args: results.extend(args[3]))

    assert len(results) == 0


def test_run_comparison_filters_same_contestant():
    # один участник - не сравнивается сам с собой

    subs = [
        _make_submission(1, 1, "a"),
        _make_submission(2, 1, "a")
    ]

    results = []

    ce.run_comparison(1, subs, 0, 10, lambda *args: results.extend(args[3]))

    assert len(results) == 0


def test_run_comparison_min_percent_filter():
    # если similarity ниже порога - результата нет

    subs = [
        _make_submission(1, 1, "abc"),
        _make_submission(2, 2, "xyz")
    ]

    results = []

    ce.run_comparison(1, subs, 90, 10, lambda *args: results.extend(args[3]))

    assert len(results) == 0


def test_run_comparison_callback_batches():
    subs = [
        _make_submission(1, 1, "a"),
        _make_submission(2, 2, "a"),
        _make_submission(3, 3, "a")
    ]
    batches = []
    def cb(done, total, progress, batch):
        batches.append(len(batch))
    ce.run_comparison(1, subs, 0, 1, cb)
    assert len(batches) == 4