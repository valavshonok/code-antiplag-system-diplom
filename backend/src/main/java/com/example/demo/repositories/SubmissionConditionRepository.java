package com.example.demo.repositories;

import com.example.demo.entities.SubmissionCondition;
import com.example.demo.utils.AppLogger;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Repository;

import javax.sql.DataSource;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

@Repository
public class SubmissionConditionRepository {

    private final DataSource dataSource;
    private final ObjectMapper objectMapper;

    public SubmissionConditionRepository(DataSource dataSource,
                                         ObjectMapper objectMapper) {
        this.dataSource = dataSource;
        this.objectMapper = objectMapper;
    }

    // =====================================================
    // Получить все проверки по contestId
    // =====================================================

    public List<SubmissionCondition> getAllByContestId(long contestId) {

        String sql = """
                SELECT sc.id,
                       sc.process_id,
                       sc.submission_id,
                       sc.condition_results
                FROM submission_conditions sc
                JOIN submissions s ON s.id = sc.submission_id
                JOIN contestants c ON c.id = s.contestant_id
                WHERE c.contest_id = ?
                ORDER BY sc.id
                """;

        List<SubmissionCondition> list = new ArrayList<>();

        try (Connection con = dataSource.getConnection();
             PreparedStatement st = con.prepareStatement(sql)) {

            st.setLong(1, contestId);

            try (ResultSet rs = st.executeQuery()) {
                while (rs.next()) {
                    list.add(mapRow(rs));
                }
            }

            AppLogger.info("Получены проверки для contest_id=" +
                    contestId + ", total=" + list.size());

        } catch (Exception e) {
            AppLogger.error("Ошибка получения проверок для contest_id="
                    + contestId + ": " + e.getMessage(), e);
        }

        return list;
    }

    // =====================================================
    // Изменить expert_verdict внутри JSONB
    // =====================================================

   public boolean updateExpertVerdict(long submissionConditionId,
                                   int conditionIndex,
                                   Boolean expertVerdict) {

    String sql = """
            UPDATE submission_conditions
            SET condition_results =
                jsonb_set(
                    condition_results,
                    ?::text[],
                    to_jsonb(?::boolean),
                    true
                )
            WHERE id = ?
            """;

    try (Connection con = dataSource.getConnection();
         PreparedStatement st = con.prepareStatement(sql)) {

        String path = String.format("{conditions,%d,expert_verdict}",
                conditionIndex);

        st.setString(1, path);

        if (expertVerdict == null) {
            st.setNull(2, Types.BOOLEAN);
        } else {
            st.setBoolean(2, expertVerdict);
        }

        st.setLong(3, submissionConditionId);

        return st.executeUpdate() > 0;

    } catch (Exception e) {
        AppLogger.error("Ошибка обновления expert_verdict id="
                + submissionConditionId + ": " + e.getMessage(), e);
        return false;
    }
}
    // =====================================================
    // Получить по processId
    // =====================================================

    public List<SubmissionCondition> getAllByProcessId(long processId) {

        String sql = """
                SELECT id,
                       process_id,
                       submission_id,
                       condition_results
                FROM submission_conditions
                WHERE process_id = ?
                ORDER BY id
                """;

        List<SubmissionCondition> list = new ArrayList<>();

        try (Connection con = dataSource.getConnection();
             PreparedStatement st = con.prepareStatement(sql)) {

            st.setLong(1, processId);

            try (ResultSet rs = st.executeQuery()) {
                while (rs.next()) {
                    list.add(mapRow(rs));
                }
            }

        } catch (Exception e) {
            AppLogger.error("Ошибка получения проверок process_id="
                    + processId + ": " + e.getMessage(), e);
        }

        return list;
    }

    // =====================================================
    // Маппинг строки
    // =====================================================

    private SubmissionCondition mapRow(ResultSet rs) throws SQLException {

        JsonNode conditionResults;

        String json = rs.getString("condition_results");

        try {
            if (json == null || json.isBlank()) {
                conditionResults = objectMapper.createObjectNode();
            } else {
                conditionResults = objectMapper.readTree(json);
            }
        } catch (Exception e) {
            throw new SQLException("Ошибка парсинга condition_results", e);
        }

        return new SubmissionCondition(
                rs.getLong("id"),
                rs.getLong("process_id"),
                rs.getLong("submission_id"),
                conditionResults
        );
    }
}