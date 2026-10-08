package com.example.demo.repositories;

import com.example.demo.entities.Submission;
import com.example.demo.utils.AppLogger;
import org.springframework.stereotype.Repository;

import javax.sql.DataSource;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

@Repository
public class SubmissionRepository {

    private final DataSource dataSource;

    public SubmissionRepository(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    public long create(Submission submission) {
        String sql = "INSERT INTO submissions(contestant_id, code, normalized_code, verdict, problem, language) " +
                     "VALUES (?, ?, ?, ?, ?, ?) RETURNING id";

        try (Connection con = dataSource.getConnection();
             PreparedStatement st = con.prepareStatement(sql)) {

            st.setLong(1, submission.getContestantId());
            st.setString(2, submission.getCode());
            st.setString(3, submission.getNormalizedCode());
            st.setString(4, submission.getVerdict());
            st.setString(5, submission.getProblem());
            st.setString(6, submission.getLanguage());

            try (ResultSet rs = st.executeQuery()) {
                if (rs.next()) {
                    long id = rs.getLong(1);
                    AppLogger.success("Добавлена посылка id=" + id + " для участника id=" + submission.getContestantId());
                    return id;
                }
            }

        } catch (SQLException e) {
            AppLogger.error("Ошибка добавления посылки для участника id=" + submission.getContestantId() + ": " + e.getMessage(), e);
        }
        return -1;
    }

    public boolean update(Submission submission) {
        String sql = "UPDATE submissions SET contestant_id=?, code=?, normalized_code=?, verdict=?, problem=?, language=? " +
                     "WHERE id=?";

        try (Connection con = dataSource.getConnection();
             PreparedStatement st = con.prepareStatement(sql)) {

            st.setLong(1, submission.getContestantId());
            st.setString(2, submission.getCode());
            st.setString(3, submission.getNormalizedCode());
            st.setString(4, submission.getVerdict());
            st.setString(5, submission.getProblem());
            st.setString(6, submission.getLanguage());
            st.setLong(7, submission.getId());

            int rows = st.executeUpdate();
            if (rows > 0) {
                AppLogger.success("Обновлена посылка id=" + submission.getId());
                return true;
            } else {
                AppLogger.warn("Попытка обновить несуществующую посылку id=" + submission.getId());
                return false;
            }

        } catch (SQLException e) {
            AppLogger.error("Ошибка обновления посылки id=" + submission.getId() + ": " + e.getMessage(), e);
            return false;
        }
    }

    public boolean delete(long id) {
        String sql = "DELETE FROM submissions WHERE id=?";

        try (Connection con = dataSource.getConnection();
             PreparedStatement st = con.prepareStatement(sql)) {

            st.setLong(1, id);
            int rows = st.executeUpdate();

            if (rows > 0) {
                AppLogger.success("Удалена посылка id=" + id);
                return true;
            } else {
                AppLogger.warn("Попытка удалить несуществующую посылку id=" + id);
                return false;
            }

        } catch (SQLException e) {
            AppLogger.error("Ошибка удаления посылки id=" + id + ": " + e.getMessage(), e);
            return false;
        }
    }

    public Submission getById(long id) {
        String sql = "SELECT id, contestant_id, code, normalized_code, verdict, problem, language FROM submissions WHERE id=?";

        try (Connection con = dataSource.getConnection();
             PreparedStatement st = con.prepareStatement(sql)) {

            st.setLong(1, id);

            try (ResultSet rs = st.executeQuery()) {
                if (rs.next()) {
                    AppLogger.info("Получена посылка id=" + id);
                    return new Submission(
                            rs.getLong("id"),
                            rs.getLong("contestant_id"),
                            rs.getString("code"),
                            rs.getString("normalized_code"),
                            rs.getString("verdict"),
                            rs.getString("problem"),
                            rs.getString("language")
                    );
                } else {
                    AppLogger.warn("Посылка не найдена id=" + id);
                    return null;
                }
            }

        } catch (SQLException e) {
            AppLogger.error("Ошибка получения посылки id=" + id + ": " + e.getMessage(), e);
            return null;
        }
    }

    public List<Submission> getAllByContestId(long contestId) {
        String sql = """
            SELECT s.id, s.contestant_id, s.code, s.normalized_code,
                s.verdict, s.problem, s.language
            FROM submissions s
            JOIN contestants c ON s.contestant_id = c.id
            WHERE c.contest_id = ?
            ORDER BY s.id
        """;

        List<Submission> submissions = new ArrayList<>();

        try (Connection con = dataSource.getConnection();
            PreparedStatement st = con.prepareStatement(sql)) {

            st.setLong(1, contestId);

            try (ResultSet rs = st.executeQuery()) {
                while (rs.next()) {
                    submissions.add(new Submission(
                            rs.getLong("id"),
                            rs.getLong("contestant_id"),
                            rs.getString("code"),
                            rs.getString("normalized_code"),
                            rs.getString("verdict"),
                            rs.getString("problem"),
                            rs.getString("language")
                    ));
                }
            }

            AppLogger.info("Получены все посылки для contest_id=" + contestId +
                    ", total=" + submissions.size());

        } catch (SQLException e) {
            AppLogger.error("Ошибка получения посылок для contest_id=" + contestId +
                    ": " + e.getMessage(), e);
        }

        return submissions;
    }

    public List<Submission> getAllByContestantId(long contestantId) {
        String sql = "SELECT id, contestant_id, code, normalized_code, verdict, problem, language " +
                     "FROM submissions WHERE contestant_id=? ORDER BY id";
        List<Submission> submissions = new ArrayList<>();

        try (Connection con = dataSource.getConnection();
             PreparedStatement st = con.prepareStatement(sql)) {

            st.setLong(1, contestantId);

            try (ResultSet rs = st.executeQuery()) {
                while (rs.next()) {
                    submissions.add(new Submission(
                            rs.getLong("id"),
                            rs.getLong("contestant_id"),
                            rs.getString("code"),
                            rs.getString("normalized_code"),
                            rs.getString("verdict"),
                            rs.getString("problem"),
                            rs.getString("language")
                    ));
                }
            }

            AppLogger.info("Получены все посылки для участника id=" + contestantId + ", total=" + submissions.size());

        } catch (SQLException e) {
            AppLogger.error("Ошибка получения посылок для участника id=" + contestantId + ": " + e.getMessage(), e);
        }

        return submissions;
    }

    public boolean exists(long id) {
        String sql = "SELECT COUNT(*) FROM submissions WHERE id=?";

        try (Connection con = dataSource.getConnection();
             PreparedStatement st = con.prepareStatement(sql)) {

            st.setLong(1, id);
            try (ResultSet rs = st.executeQuery()) {
                if (rs.next()) {
                    return rs.getInt(1) > 0;
                }
            }

        } catch (SQLException e) {
            AppLogger.error("Ошибка проверки существования посылки id=" + id + ": " + e.getMessage(), e);
        }

        return false;
    }
}
