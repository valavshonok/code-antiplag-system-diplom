package com.example.demo.repositories;

import com.example.demo.entities.Contest;
import com.example.demo.utils.AppLogger;
import org.springframework.stereotype.Repository;
import com.fasterxml.jackson.databind.ObjectMapper;

import javax.sql.DataSource;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@Repository
public class ContestRepository {

    private final DataSource dataSource;
    private final ObjectMapper objectMapper;

    public ContestRepository(DataSource dataSource, ObjectMapper objectMapper) {
        this.dataSource = dataSource;
        this.objectMapper = objectMapper;
    }

    public Contest create(Contest contest) {
        String sql = "INSERT INTO contests(name, config, author_id) VALUES (?, ?::jsonb, ?) RETURNING id, name, config, author_id";
        try (Connection con = dataSource.getConnection();
            PreparedStatement st = con.prepareStatement(sql)) {

            st.setString(1, contest.getName());
            st.setString(2, objectMapper.writeValueAsString(contest.getConfig()));
            st.setLong(3, contest.getAuthorId());

            try (ResultSet rs = st.executeQuery()) {
                if (rs.next()) {
                    Map<String, Object> config = objectMapper.readValue(rs.getString("config"), Map.class);
                    Contest created = new Contest(rs.getLong("id"), rs.getString("name"), config, rs.getLong("author_id"));
                    AppLogger.success("Добавлен контест id=" + created.getId());
                    return created;
                }
            }

        } catch (Exception e) {
            AppLogger.error("Ошибка добавления контеста: " + e.getMessage(), e);
        }
        return null;
    }

    public Contest update(Contest contest) {
        String sql = "UPDATE contests SET name=?, config=?::jsonb WHERE id=? RETURNING id, name, config, author_id";
        try (Connection con = dataSource.getConnection();
            PreparedStatement st = con.prepareStatement(sql)) {

            st.setString(1, contest.getName());
            st.setString(2, objectMapper.writeValueAsString(contest.getConfig()));
            st.setLong(3, contest.getId());

            try (ResultSet rs = st.executeQuery()) {
                if (rs.next()) {
                    Map<String, Object> config = objectMapper.readValue(rs.getString("config"), Map.class);
                    Contest updated = new Contest(rs.getLong("id"), rs.getString("name"), config, rs.getLong("author_id"));
                    AppLogger.success("Обновлён контест id=" + updated.getId());
                    return updated;
                } else {
                    AppLogger.warn("Попытка обновить несуществующий контест id=" + contest.getId());
                }
            }

        } catch (Exception e) {
            AppLogger.error("Ошибка обновления контеста id=" + contest.getId() + ": " + e.getMessage(), e);
        }
        return null;
    }

    public Contest delete(long id) {
        String sql = "DELETE FROM contests WHERE id=? RETURNING id, name, config, author_id";
        try (Connection con = dataSource.getConnection();
            PreparedStatement st = con.prepareStatement(sql)) {

            st.setLong(1, id);
            try (ResultSet rs = st.executeQuery()) {
                if (rs.next()) {
                    Map<String, Object> config = objectMapper.readValue(rs.getString("config"), Map.class);
                    Contest deleted = new Contest(rs.getLong("id"), rs.getString("name"), config, rs.getLong("author_id"));
                    AppLogger.success("Удалён контест id=" + deleted.getId());
                    return deleted;
                } else {
                    AppLogger.warn("Попытка удалить несуществующий контест id=" + id);
                }
            }

        } catch (Exception e) {
            AppLogger.error("Ошибка удаления контеста id=" + id + ": " + e.getMessage(), e);
        }
        return null;
    }

    public Contest getById(long id) {
        String sql = "SELECT id, name, config, author_id FROM contests WHERE id=?";
        try (Connection con = dataSource.getConnection();
            PreparedStatement st = con.prepareStatement(sql)) {

            st.setLong(1, id);
            try (ResultSet rs = st.executeQuery()) {
                if (rs.next()) {
                    Map<String, Object> config = objectMapper.readValue(rs.getString("config"), Map.class);
                    AppLogger.info("Получен контест id=" + id);
                    return new Contest(rs.getLong("id"), rs.getString("name"), config, rs.getLong("author_id"));
                } else {
                    AppLogger.warn("Контест не найден id=" + id);
                    return null;
                }
            }

        } catch (Exception e) {
            AppLogger.error("Ошибка получения контеста id=" + id + ": " + e.getMessage(), e);
            return null;
        }
    }

    public List<Contest> getAll(Long authorId) {
        String sql = "SELECT id, name, config, author_id FROM contests WHERE author_id = ? ORDER BY id";
        List<Contest> contests = new ArrayList<>();

        try (Connection con = dataSource.getConnection();
             PreparedStatement st = con.prepareStatement(sql)) {

            st.setLong(1, authorId);

            try (ResultSet rs = st.executeQuery()) {
                while (rs.next()) {
                    Map<String, Object> config = objectMapper.readValue(rs.getString("config"), Map.class);
                    contests.add(new Contest(
                            rs.getLong("id"),
                            rs.getString("name"),
                            config,
                            rs.getLong("author_id")
                    ));
                }
            }

            AppLogger.info("Получен список контестов для authorId=" + authorId + ", total=" + contests.size());

        } catch (Exception e) {
            AppLogger.error("Ошибка получения списка контестов: " + e.getMessage(), e);
        }

        return contests;
    }





    public boolean exists(long id) {
        String sql = "SELECT COUNT(*) FROM contests WHERE id=?";
        try (Connection con = dataSource.getConnection();
             PreparedStatement st = con.prepareStatement(sql)) {

            st.setLong(1, id);
            try (ResultSet rs = st.executeQuery()) {
                if (rs.next()) {
                    return rs.getInt(1) > 0;
                }
            }

        } catch (SQLException e) {
            AppLogger.error("Ошибка проверки существования контеста id=" + id + ": " + e.getMessage(), e);
        }
        return false;
    }
}
