#include <pybind11/pybind11.h>
#include <pybind11/stl.h>
#include <vector>
#include <string>
#include <functional>
#include <algorithm>

namespace py = pybind11;

/* =========================
   DATA STRUCTURES
   ========================= */

struct Submission {
    int id;
    int contestant_id;
    std::string code;
    std::string normalized_code;
    std::string problem;
    std::string language;

    Submission() = default;

    Submission(
        int id_,
        int contestant_id_,
        std::string code_,
        std::string normalized_code_,
        std::string problem_,
        std::string language_
    )
        : id(id_),
          contestant_id(contestant_id_),
          code(std::move(code_)),
          normalized_code(std::move(normalized_code_)),
          problem(std::move(problem_)),
          language(std::move(language_))
    {}
};

struct DiffCharBlock {
    std::string type;
    std::string text1;
    std::string text2;

    DiffCharBlock() = default;

    DiffCharBlock(
        std::string type_,
        std::string text1_,
        std::string text2_
    )
        : type(std::move(type_)),
          text1(std::move(text1_)),
          text2(std::move(text2_))
    {}
};

struct DiffStringBlock {
    std::string type;
    std::vector<std::string> text1;
    std::vector<std::string> text2;

    DiffStringBlock() = default;

    DiffStringBlock(
        std::string type_,
        std::vector<std::string> text1_,
        std::vector<std::string> text2_
    )
        : type(std::move(type_)),
          text1(std::move(text1_)),
          text2(std::move(text2_))
    {}
};

struct SubmissionComparison {
    int processId;
    int submission1Id;
    int submission2Id;

    std::vector<DiffStringBlock> diffStringBlocks;
    std::vector<DiffStringBlock> diffStringBlocksNormalized;
    std::vector<DiffCharBlock> diffCharBlocks;
    std::vector<DiffCharBlock> diffCharBlocksNormalized;

    int matchPercent;
    int matchPercentNormalized;
    bool plagiarism = false;

    SubmissionComparison() = default;

    SubmissionComparison(
        int processId_,
        int submission1Id_,
        int submission2Id_,
        std::vector<DiffStringBlock> diffStringBlocks_,
        std::vector<DiffStringBlock> diffStringBlocksNormalized_,
        std::vector<DiffCharBlock> diffCharBlocks_,
        std::vector<DiffCharBlock> diffCharBlocksNormalized_,
        int matchPercent_,
        int matchPercentNormalized_,
        bool plagiarism_
    )
        : processId(processId_),
          submission1Id(submission1Id_),
          submission2Id(submission2Id_),
          diffStringBlocks(std::move(diffStringBlocks_)),
          diffStringBlocksNormalized(std::move(diffStringBlocksNormalized_)),
          diffCharBlocks(std::move(diffCharBlocks_)),
          diffCharBlocksNormalized(std::move(diffCharBlocksNormalized_)),
          matchPercent(matchPercent_),
          matchPercentNormalized(matchPercentNormalized_),
          plagiarism(plagiarism_)
    {}
};

/* =========================
   UTILS
   ========================= */

static inline int weight(char c) {
    if (c == ' ' || c == '\t' || c == '\n' || c == '\r')
        return 0;
    return 1;
}

/* =========================
   STRING SIMILARITY
   ========================= */

int string_similarity(const std::string& s1, const std::string& s2) {
    int n = s1.size();
    int m = s2.size();

    std::vector<int> prev(m + 1, 0), curr(m + 1, 0);

    for (int i = 1; i <= n; ++i) {
        std::swap(prev, curr);
        for (int j = 1; j <= m; ++j) {
            if (s1[i - 1] == s2[j - 1])
                curr[j] = prev[j - 1] + weight(s1[i - 1]);
            else
                curr[j] = std::max(prev[j], curr[j - 1]);
        }
    }

    int weight_lcs = curr[m];

    int total_weight = 0;
    for (char c : s1) total_weight += weight(c);
    for (char c : s2) total_weight += weight(c);

    if (total_weight == 0)
        return 100;

    return (2ll * weight_lcs * 100 / total_weight) ;
}

/* =========================
   SPLIT LINES
   ========================= */

std::vector<std::string> split_lines(const std::string& s) {
    std::vector<std::string> lines;
    std::string current;

    for (char c : s) {
        if (c == '\n') {
            lines.push_back(current);
            current.clear();
        } else {
            current.push_back(c);
        }
    }
    lines.push_back(current);
    return lines;
}

/* =========================
   DIFF STRING BLOCKS
   ========================= */

std::vector<DiffStringBlock> diff_string_blocks(
    const std::string& text1,
    const std::string& text2,
    int threshold = 95
) {
    auto lines1 = split_lines(text1);
    auto lines2 = split_lines(text2);

    int n = lines1.size();
    int m = lines2.size();

    std::vector<std::vector<char>> match(n, std::vector<char>(m, false));

    for (int i = 0; i < n; ++i)
        for (int j = 0; j < m; ++j)
            if (string_similarity(lines1[i], lines2[j]) >= threshold)
                match[i][j] = true;

    std::vector<std::vector<int>> dp(n + 1, std::vector<int>(m + 1, 0));

    for (int i = 0; i < n; ++i)
        for (int j = 0; j < m; ++j)
            if (match[i][j])
                dp[i + 1][j + 1] = dp[i][j] + 1;
            else
                dp[i + 1][j + 1] = std::max(dp[i][j + 1], dp[i + 1][j]);

    int i = n, j = m;
    std::vector<std::pair<int,int>> lcs;

    while (i > 0 && j > 0) {
        if (match[i - 1][j - 1]) {
            lcs.emplace_back(i - 1, j - 1);
            i--; j--;
        }
        else if (dp[i - 1][j] >= dp[i][j - 1])
            i--;
        else
            j--;
    }

    std::reverse(lcs.begin(), lcs.end());

    std::vector<DiffStringBlock> blocks;

    int i1 = 0, i2 = 0, idx = 0;

    while (idx < (int)lcs.size()) {
        int li1 = lcs[idx].first;
        int li2 = lcs[idx].second;

        if (i1 < li1 || i2 < li2) {
            blocks.emplace_back(
                "different",
                std::vector<std::string>(lines1.begin()+i1, lines1.begin()+li1),
                std::vector<std::string>(lines2.begin()+i2, lines2.begin()+li2)
            );
        }

        std::vector<std::string> eq1{lines1[li1]};
        std::vector<std::string> eq2{lines2[li2]};

        i1 = li1 + 1;
        i2 = li2 + 1;
        idx++;

        while (idx < (int)lcs.size() &&
               lcs[idx].first == i1 &&
               lcs[idx].second == i2) {
            eq1.push_back(lines1[i1]);
            eq2.push_back(lines2[i2]);
            i1++; i2++; idx++;
        }

        blocks.emplace_back("equal", eq1, eq2);
    }

    if (i1 < n || i2 < m) {
        blocks.emplace_back(
            "different",
            std::vector<std::string>(lines1.begin()+i1, lines1.end()),
            std::vector<std::string>(lines2.begin()+i2, lines2.end())
        );
    }

    return blocks;
}

/* =========================
   DIFF CHAR BLOCKS
   ========================= */

std::vector<DiffCharBlock> diff_char_blocks(
    const std::string& s1,
    const std::string& s2
) {
    int n = s1.size();
    int m = s2.size();

    std::vector<std::vector<int>> dp(n + 1, std::vector<int>(m + 1, 0));

    for (int i = 0; i < n; ++i)
        for (int j = 0; j < m; ++j)
            if (s1[i] == s2[j])
                dp[i + 1][j + 1] = dp[i][j] + 1;
            else
                dp[i + 1][j + 1] = std::max(dp[i][j + 1], dp[i + 1][j]);

    int i = n, j = m;
    std::vector<std::pair<int,int>> lcs;

    while (i > 0 && j > 0) {
        if (s1[i - 1] == s2[j - 1]) {
            lcs.push_back({i - 1, j - 1});
            i--; j--;
        }
        else if (dp[i - 1][j] >= dp[i][j - 1])
            i--;
        else
            j--;
    }

    std::reverse(lcs.begin(), lcs.end());

    std::vector<DiffCharBlock> blocks;

    int i1 = 0, i2 = 0, idx = 0;

    while (idx < (int)lcs.size()) {
        int li1 = lcs[idx].first;
        int li2 = lcs[idx].second;

        if (i1 < li1 || i2 < li2) {
            blocks.emplace_back(
                "different",
                s1.substr(i1, li1 - i1),
                s2.substr(i2, li2 - i2)
            );
        }

        int start1 = li1;
        int start2 = li2;

        i1 = li1 + 1;
        i2 = li2 + 1;
        idx++;

        while (idx < (int)lcs.size() &&
               lcs[idx].first == i1 &&
               lcs[idx].second == i2) {
            i1++; i2++; idx++;
        }

        blocks.emplace_back(
            "equal",
            s1.substr(start1, i1 - start1),
            s2.substr(start2, i2 - start2)
        );
    }

    if (i1 < n || i2 < m) {
        blocks.emplace_back(
            "different",
            s1.substr(i1),
            s2.substr(i2)
        );
    }

    return blocks;
}

/* =========================
   MAIN ENGINE
   ========================= */

void run_comparison(
    int processId,
    // std::vector<Submission> submissions,
    const std::vector<Submission>& submissions,
    int min_percent,
    int batch_size,
    py::function progress_callback
) {
    py::gil_scoped_release release;

    batch_size = std::clamp(batch_size, 1, 100);

    std::vector<SubmissionComparison> results;
    results.reserve(batch_size);

    // std::sort(submissions.begin(), submissions.end(), [&](const Submission& l, const Submission& r){
    //     return l.code.size() < r.code.size();
    // });

    size_t total_pairs = 0;
    for (size_t i = 0; i < submissions.size(); ++i)
        for (size_t j = i + 1; j < submissions.size(); ++j)
            if (submissions[i].problem == submissions[j].problem &&
                submissions[i].language == submissions[j].language &&
                submissions[i].contestant_id != submissions[j].contestant_id)
                total_pairs++;

    size_t done = 0;

    for (size_t i = 0; i < submissions.size(); ++i) {
        for (size_t j = i + 1; j < submissions.size(); ++j) {

            const auto& s1 = submissions[i];
            const auto& s2 = submissions[j];

            if (s1.problem != s2.problem ||
                s1.language != s2.language ||
                s1.contestant_id == s2.contestant_id)
                continue;

            int mp = string_similarity(s1.code, s2.code);
            int mpn = string_similarity(s1.normalized_code, s2.normalized_code);

            if (mp < min_percent && mpn < min_percent)
                continue;

            SubmissionComparison cmp;
            cmp.processId = processId;
            cmp.submission1Id = s1.id;
            cmp.submission2Id = s2.id;

            cmp.matchPercent = (int)mp;
            cmp.matchPercentNormalized = (int)mpn;

            cmp.diffStringBlocks = diff_string_blocks(s1.code, s2.code);
            cmp.diffStringBlocksNormalized = diff_string_blocks(s1.normalized_code, s2.normalized_code);
            cmp.diffCharBlocks = diff_char_blocks(s1.code, s2.code);
            cmp.diffCharBlocksNormalized = diff_char_blocks(s1.normalized_code, s2.normalized_code);

            results.push_back(cmp);


            cmp.submission1Id = s2.id;
            cmp.submission2Id = s1.id;

            // Меняем местами diff-блоки
            for (auto &b : cmp.diffStringBlocks) {
                std::swap(b.text1, b.text2);
            }

            for (auto &b : cmp.diffStringBlocksNormalized) {
                std::swap(b.text1, b.text2);
            }

            for (auto &b : cmp.diffCharBlocks) {
                std::swap(b.text1, b.text2);
            }

            for (auto &b : cmp.diffCharBlocksNormalized) {
                std::swap(b.text1, b.text2);
            }

            results.push_back(cmp);

            done++;

            if (done % batch_size == 0 && total_pairs > 0) {
                int progress = (int)(done * 100 / total_pairs);

                py::gil_scoped_acquire acquire;
                progress_callback((int)done, (int)total_pairs, progress, results);

                results.clear();
            }
        }
    }
    
    py::gil_scoped_acquire acquire;
    progress_callback((int)done, (int)total_pairs, 100, results);
    results.clear();
}

/* =========================
   PYBIND
   ========================= */

PYBIND11_MODULE(comparison_engine, m) {

    py::class_<Submission>(m, "Submission")
        .def(py::init<>())
        .def_readwrite("id", &Submission::id)
        .def_readwrite("contestant_id", &Submission::contestant_id)
        .def_readwrite("code", &Submission::code)
        .def_readwrite("normalized_code", &Submission::normalized_code)
        .def_readwrite("problem", &Submission::problem)
        .def_readwrite("language", &Submission::language);

    // 🔹 ВАЖНО: возвращаем bytes вместо str
    py::class_<DiffCharBlock>(m, "DiffCharBlock")
        .def_property_readonly("type", [](const DiffCharBlock &b) {
            return py::bytes(b.type);
        })
        .def_property_readonly("text1", [](const DiffCharBlock &b) {
            return py::bytes(b.text1);
        })
        .def_property_readonly("text2", [](const DiffCharBlock &b) {
            return py::bytes(b.text2);
        });

    py::class_<DiffStringBlock>(m, "DiffStringBlock")
        .def_property_readonly("type", [](const DiffStringBlock &b) {
            return py::bytes(b.type);
        })
        .def_property_readonly("text1", [](const DiffStringBlock &b) {
            return py::cast(b.text1);
        })
        .def_property_readonly("text2", [](const DiffStringBlock &b) {
            return py::cast(b.text2);
        });

    py::class_<SubmissionComparison>(m, "SubmissionComparison")
        .def_readonly("processId", &SubmissionComparison::processId)
        .def_readonly("submission1Id", &SubmissionComparison::submission1Id)
        .def_readonly("submission2Id", &SubmissionComparison::submission2Id)
        .def_readonly("diffStringBlocks", &SubmissionComparison::diffStringBlocks)
        .def_readonly("diffStringBlocksNormalized", &SubmissionComparison::diffStringBlocksNormalized)
        .def_readonly("diffCharBlocks", &SubmissionComparison::diffCharBlocks)
        .def_readonly("diffCharBlocksNormalized", &SubmissionComparison::diffCharBlocksNormalized)
        .def_readonly("matchPercent", &SubmissionComparison::matchPercent)
        .def_readonly("matchPercentNormalized", &SubmissionComparison::matchPercentNormalized)
        .def_readonly("plagiarism", &SubmissionComparison::plagiarism);

    m.def("run_comparison", &run_comparison);
    m.def("string_similarity", &string_similarity);
    
}