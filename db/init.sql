-- =========================
-- ENUM TYPES
-- =========================

CREATE TYPE process_type_enum AS ENUM ('comparison', 'import', 'condition');
CREATE TYPE process_status_enum AS ENUM ('none', 'running', 'done', 'error');

-- =========================
-- TABLE: users
-- =========================
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) NOT NULL
);



-- =========================
-- TABLE: contests
-- =========================

CREATE TABLE contests (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    config JSONB NOT NULL,
    author_id INT NOT NULL
        REFERENCES users(id)
        ON DELETE RESTRICT
);

-- =========================
-- TABLE: contestants
-- =========================
-- Участник принадлежит ровно одному контесту

CREATE TABLE contestants (
    id SERIAL PRIMARY KEY,
    contest_id INT NOT NULL
        REFERENCES contests(id)
        ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL
);

CREATE INDEX idx_contestants_contest_id
    ON contestants(contest_id);

-- =========================
-- TABLE: processes
-- =========================

CREATE TABLE processes (
    id SERIAL PRIMARY KEY,
    contest_id INT NOT NULL
        REFERENCES contests(id)
        ON DELETE CASCADE,
    process_type process_type_enum NOT NULL,
    status process_status_enum NOT NULL DEFAULT 'none',
    progress INT NOT NULL DEFAULT 0
        CHECK (progress >= 0 AND progress <= 100),
    message JSONB
);

CREATE INDEX idx_processes_contest_id
    ON processes(contest_id);

-- =========================
-- TABLE: submissions
-- =========================
-- Посылка принадлежит участнику

CREATE TABLE submissions (
    id SERIAL PRIMARY KEY,
    contestant_id INT NOT NULL
        REFERENCES contestants(id)
        ON DELETE CASCADE,

    code TEXT NOT NULL,
    normalized_code TEXT,

    verdict VARCHAR(30) NOT NULL,
    problem VARCHAR(10) NOT NULL,
    language VARCHAR(30) NOT NULL


);

CREATE INDEX idx_submissions_contestant_id
    ON submissions(contestant_id);

-- =========================
-- TABLE: submission_comparisons
-- =========================
-- Хранит сравнение пары посылок

CREATE TABLE submission_comparisons (
    id SERIAL PRIMARY KEY,

    process_id INT NOT NULL
        REFERENCES processes(id)
        ON DELETE CASCADE,

    submission1_id INT NOT NULL
        REFERENCES submissions(id)
        ON DELETE CASCADE,

    submission2_id INT NOT NULL
        REFERENCES submissions(id)
        ON DELETE CASCADE,

    diff_string_blocks JSONB,
    diff_string_blocks_normalized JSONB,

    diff_char_blocks JSONB,
    diff_char_blocks_normalized JSONB,

    match_percent INT NOT NULL DEFAULT 0
        CHECK (match_percent >= 0 AND match_percent <= 100),
    match_percent_normalized INT NOT NULL DEFAULT 0
        CHECK (match_percent_normalized >= 0 AND match_percent_normalized <= 100),
	
	is_plagiarism BOOLEAN NOT NULL DEFAULT FALSE,

    CHECK (submission1_id <> submission2_id)
);

CREATE INDEX idx_submission_comparisons_sub1
    ON submission_comparisons(submission1_id);

CREATE INDEX idx_submission_comparisons_sub2
    ON submission_comparisons(submission2_id);

-- =========================
-- TABLE: submission_conditions
-- =========================
-- Хранит для каждой посылки соответствие условиям

CREATE TABLE submission_conditions (
    id SERIAL PRIMARY KEY,

    process_id INT NOT NULL
        REFERENCES processes(id)
        ON DELETE CASCADE,

    submission_id INT NOT NULL
        REFERENCES submissions(id)
        ON DELETE CASCADE,
    
    condition_results JSONB
);




