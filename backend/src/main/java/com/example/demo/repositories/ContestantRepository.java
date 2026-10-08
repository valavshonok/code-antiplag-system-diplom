package com.example.demo.repositories;

import com.example.demo.entities.Contestant;
import com.example.demo.utils.AppLogger;
import org.springframework.stereotype.Repository;

import javax.sql.DataSource;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

@Repository
public class ContestantRepository {

    private final DataSource dataSource;

    public ContestantRepository(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    public long create(Contestant contestant) {
        String sql = "INSERT INTO contestants(contest_id, name) VALUES (?, ?) RETURNING id";

        try (Connection con = dataSource.getConnection();
             PreparedStatement st = con.prepareStatement(sql)) {

            st.setLong(1, contestant.getContestId());
            st.setString(2, contestant.getName());

            try (ResultSet rs = st.executeQuery()) {
                if (rs.next()) {
                    long id = rs.getLong(1);
                    AppLogger.success("Добавлен участник id=" + id + " для контеста id=" + contestant.getContestId());
                    return id;
                }
            }

        } catch (SQLException e) {
            AppLogger.error("Ошибка добавления участника для контеста id=" + contestant.getContestId() + ": " + e.getMessage(), e);
        }

        return -1;
    }

    public boolean update(Contestant contestant) {
        String sql = "UPDATE contestants SET contest_id=?, name=? WHERE id=?";

        try (Connection con = dataSource.getConnection();
             PreparedStatement st = con.prepareStatement(sql)) {

            st.setLong(1, contestant.getContestId());
            st.setString(2, contestant.getName());
            st.setLong(3, contestant.getId());

            int rows = st.executeUpdate();
            if (rows > 0) {
                AppLogger.success("Обновлён участник id=" + contestant.getId());
                return true;
            } else {
                AppLogger.warn("Попытка обновить несуществующего участника id=" + contestant.getId());
                return false;
            }

        } catch (SQLException e) {
            AppLogger.error("Ошибка обновления участника id=" + contestant.getId() + ": " + e.getMessage(), e);
            return false;
        }
    }

    public boolean delete(long id) {
        String sql = "DELETE FROM contestants WHERE id=?";

        try (Connection con = dataSource.getConnection();
             PreparedStatement st = con.prepareStatement(sql)) {

            st.setLong(1, id);
            int rows = st.executeUpdate();

            if (rows > 0) {
                AppLogger.success("Удалён участник id=" + id);
                return true;
            } else {
                AppLogger.warn("Попытка удалить несуществующего участника id=" + id);
                return false;
            }

        } catch (SQLException e) {
            AppLogger.error("Ошибка удаления участника id=" + id + ": " + e.getMessage(), e);
            return false;
        }
    }

    public Contestant getById(long id) {
        String sql = "SELECT id, contest_id, name FROM contestants WHERE id=?";

        try (Connection con = dataSource.getConnection();
             PreparedStatement st = con.prepareStatement(sql)) {

            st.setLong(1, id);

            try (ResultSet rs = st.executeQuery()) {
                if (rs.next()) {
                    AppLogger.info("Получен участник id=" + id);
                    return new Contestant(
                            rs.getLong("id"),
                            rs.getLong("contest_id"),
                            rs.getString("name")
                    );
                } else {
                    AppLogger.warn("Участник не найден id=" + id);
                    return null;
                }
            }

        } catch (SQLException e) {
            AppLogger.error("Ошибка получения участника id=" + id + ": " + e.getMessage(), e);
            return null;
        }
    }

    public List<Contestant> getAll() {
        String sql = "SELECT id, contest_id, name FROM contestants ORDER BY id";
        List<Contestant> contestants = new ArrayList<>();

        try (Connection con = dataSource.getConnection();
             PreparedStatement st = con.prepareStatement(sql);
             ResultSet rs = st.executeQuery()) {

            while (rs.next()) {
                contestants.add(new Contestant(
                        rs.getLong("id"),
                        rs.getLong("contest_id"),
                        rs.getString("name")
                ));
            }

            AppLogger.info("Получен список всех участников, total=" + contestants.size());

        } catch (SQLException e) {
            AppLogger.error("Ошибка получения списка участников: " + e.getMessage(), e);
        }

        return contestants;
    }

    public List<Contestant> getAllByContestId(long contestId) {
        String sql = "SELECT id, contest_id, name FROM contestants WHERE contest_id=? ORDER BY id";
        List<Contestant> contestants = new ArrayList<>();

        try (Connection con = dataSource.getConnection();
             PreparedStatement st = con.prepareStatement(sql)) {

            st.setLong(1, contestId);

            try (ResultSet rs = st.executeQuery()) {
                while (rs.next()) {
                    contestants.add(new Contestant(
                            rs.getLong("id"),
                            rs.getLong("contest_id"),
                            rs.getString("name")
                    ));
                }
            }

            AppLogger.info("Получен список участников для контеста id=" + contestId + ", total=" + contestants.size());

        } catch (SQLException e) {
            AppLogger.error("Ошибка получения участников для контеста id=" + contestId + ": " + e.getMessage(), e);
        }

        return contestants;
    }

    public boolean deleteAllByContestId(long contestId) {
        String sql = "DELETE FROM contestants WHERE contest_id=?";

        try (Connection con = dataSource.getConnection();
            PreparedStatement st = con.prepareStatement(sql)) {

            st.setLong(1, contestId);
            st.executeUpdate();
            return true;

        } catch (SQLException e) {
            AppLogger.error("Ошибка удаления участников контеста id=" + contestId, e);
        }

        return false;
    }


    public boolean exists(long id) {
        String sql = "SELECT COUNT(*) FROM contestants WHERE id=?";

        try (Connection con = dataSource.getConnection();
             PreparedStatement st = con.prepareStatement(sql)) {

            st.setLong(1, id);
            try (ResultSet rs = st.executeQuery()) {
                if (rs.next()) {
                    return rs.getInt(1) > 0;
                }
            }

        } catch (SQLException e) {
            AppLogger.error("Ошибка проверки существования участника id=" + id + ": " + e.getMessage(), e);
        }

        return false;
    }
}
