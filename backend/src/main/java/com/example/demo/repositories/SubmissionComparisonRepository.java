package com.example.demo.repositories;

import com.example.demo.entities.SubmissionComparison;
import com.example.demo.dto.SubmissionComparisonSummary;
import com.example.demo.utils.AppLogger;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import org.springframework.stereotype.Repository;

import javax.sql.DataSource;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

@Repository
public class SubmissionComparisonRepository {

    private final DataSource dataSource;
    private final ObjectMapper objectMapper;

    public SubmissionComparisonRepository(DataSource dataSource,
                                          ObjectMapper objectMapper) {
        this.dataSource = dataSource;
        this.objectMapper = objectMapper;
    }

   
    public SubmissionComparison setPlagiarism(Long comparisonId, Boolean plagiarism) {
        String sql = """
                UPDATE submission_comparisons
                SET is_plagiarism = ?
                WHERE id = ?
                """;

        try (Connection con = dataSource.getConnection();
            PreparedStatement st = con.prepareStatement(sql)) {

            st.setBoolean(1, plagiarism);
            st.setLong(2, comparisonId);

            int updated = st.executeUpdate();

            if (updated == 0) {
                AppLogger.warn("Сравнение не обновлено, id=" +comparisonId);
                return null;
            }

            AppLogger.info("Сравнение обновлено id=" + comparisonId);
            return getById(comparisonId);

        } catch (Exception e) {
            AppLogger.error("Ошибка обновления сравнения id="
                    + comparisonId + ": " + e.getMessage(), e);
            return null;
        }
    }

    public SubmissionComparison getById(long id) {

        String sql = """
                SELECT id, process_id, submission1_id, submission2_id,
                       diff_string_blocks, diff_string_blocks_normalized,
                       diff_char_blocks, diff_char_blocks_normalized,
                       match_percent, match_percent_normalized, is_plagiarism
                FROM submission_comparisons
                WHERE id=?
                """;

        try (Connection con = dataSource.getConnection();
             PreparedStatement st = con.prepareStatement(sql)) {

            st.setLong(1, id);

            try (ResultSet rs = st.executeQuery()) {
                if (rs.next()) {
                    AppLogger.info("Получено сравнение id=" + id);
                    return mapRow(rs);
                } else {
                    AppLogger.warn("Сравнение не найдено id=" + id);
                }
            }

        } catch (Exception e) {
            AppLogger.error("Ошибка получения сравнения id=" + id + ": " + e.getMessage(), e);
        }

        return null;
    }

    public List<SubmissionComparison> getAllByProcessId(long processId) {

        String sql = """
                SELECT id, process_id, submission1_id, submission2_id,
                       diff_string_blocks, diff_string_blocks_normalized,
                       diff_char_blocks, diff_char_blocks_normalized,
                       match_percent, match_percent_normalized, is_plagiarism
                FROM submission_comparisons
                WHERE process_id=?
                ORDER BY id
                """;

        List<SubmissionComparison> list = new ArrayList<>();

        try (Connection con = dataSource.getConnection();
             PreparedStatement st = con.prepareStatement(sql)) {

            st.setLong(1, processId);

            try (ResultSet rs = st.executeQuery()) {
                while (rs.next()) {
                    list.add(mapRow(rs));
                }
            }

        } catch (Exception e) {
            AppLogger.error("Ошибка получения сравнений process_id="
                    + processId + ": " + e.getMessage(), e);
        }

        return list;
    }

    public SubmissionComparison getByComparisonId(long comparisonId) {
        return getById(comparisonId);
    }

    public List<SubmissionComparisonSummary> getAllSummariesByProcessId(long processId) {

        String sql = """
                SELECT id,
                       process_id,
                       submission1_id,
                       submission2_id,
                       match_percent,
                       match_percent_normalized,
                       is_plagiarism
                FROM submission_comparisons
                WHERE process_id = ?
                ORDER BY id
                """;

        List<SubmissionComparisonSummary> list = new ArrayList<>();

        try (Connection con = dataSource.getConnection();
             PreparedStatement st = con.prepareStatement(sql)) {

            st.setLong(1, processId);

            try (ResultSet rs = st.executeQuery()) {
                while (rs.next()) {
                    list.add(new SubmissionComparisonSummary(
                            rs.getLong("id"),
                            rs.getLong("process_id"),
                            rs.getLong("submission1_id"),
                            rs.getLong("submission2_id"),
                            rs.getInt("match_percent"),
                            rs.getInt("match_percent_normalized"),
                            rs.getBoolean("is_plagiarism")
                    ));
                }
            }

            AppLogger.info("Получены summary сравнения для process_id="
                    + processId + ", total=" + list.size());

        } catch (SQLException e) {
            AppLogger.error("Ошибка получения summary сравнений для process_id="
                    + processId + ": " + e.getMessage(), e);
        }

        return list;
    }

    public boolean exists(long id) {

        String sql = "SELECT COUNT(*) FROM submission_comparisons WHERE id=?";

        try (Connection con = dataSource.getConnection();
             PreparedStatement st = con.prepareStatement(sql)) {

            st.setLong(1, id);

            try (ResultSet rs = st.executeQuery()) {
                if (rs.next()) {
                    return rs.getInt(1) > 0;
                }
            }

        } catch (SQLException e) {
            AppLogger.error("Ошибка проверки существования сравнения id=" + id + ": " + e.getMessage(), e);
        }

        return false;
    }

    private JsonNode readJsonArray(ResultSet rs, String column) throws SQLException {

        String json = rs.getString(column);

        if (json == null || json.isBlank()) {
            return objectMapper.createArrayNode();
        }

        try {
            JsonNode node = objectMapper.readTree(json);

            if (!node.isArray()) {
                throw new SQLException("Ожидался JSON-массив в колонке: " + column);
            }

            return node;

        } catch (Exception e) {
            throw new SQLException("Ошибка парсинга JSON в колонке: " + column, e);
        }
    }

    private SubmissionComparison mapRow(ResultSet rs) throws SQLException {

        JsonNode diffStringBlocks =
                readJsonArray(rs, "diff_string_blocks");

        JsonNode diffStringBlocksNormalized =
                readJsonArray(rs, "diff_string_blocks_normalized");

        JsonNode diffCharBlocks =
                readJsonArray(rs, "diff_char_blocks");

        JsonNode diffCharBlocksNormalized =
                readJsonArray(rs, "diff_char_blocks_normalized");

        return new SubmissionComparison(
                rs.getLong("id"),
                rs.getLong("process_id"),
                rs.getLong("submission1_id"),
                rs.getLong("submission2_id"),
                diffStringBlocks,
                diffStringBlocksNormalized,
                diffCharBlocks,
                diffCharBlocksNormalized,
                rs.getInt("match_percent"),
                rs.getInt("match_percent_normalized"),
                rs.getBoolean("is_plagiarism")
        );
    }
}