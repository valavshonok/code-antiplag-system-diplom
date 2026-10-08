package com.example.demo.repositories;

import com.example.demo.entities.Process;
import com.example.demo.utils.AppLogger;
import org.springframework.stereotype.Repository;

import javax.sql.DataSource;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

@Repository
public class Processrepository {

    private final DataSource dataSource;

    public Processrepository(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    public Process create(Process process) {
        String sql = """
            INSERT INTO processes(contest_id, process_type, status, progress, message)
            VALUES (?, ?::process_type_enum, ?::process_status_enum, ?, ?::jsonb)
            RETURNING id, contest_id, process_type, status, progress, message
        """;

        try (Connection con = dataSource.getConnection();
             PreparedStatement st = con.prepareStatement(sql)) {

            st.setLong(1, process.getContestId());
            st.setString(2, process.getProcessType());
            st.setString(3, process.getStatus());
            st.setInt(4, process.getProgress());
            st.setString(5, process.getMessage());

            try (ResultSet rs = st.executeQuery()) {
                if (rs.next()) {
                    Process created = mapRow(rs);
                    AppLogger.info("Добавлен процесс id=" + created.getId());
                    return created;
                }
            }

        } catch (SQLException e) {
            AppLogger.error("Ошибка добавления процесса", e);
        }

        return null;
    }


    public boolean update(Process process) {
        String sql = """
            UPDATE processes
            SET process_type=?::process_type_enum, status=?::process_status_enum, progress=?, message=?::jsonb
            WHERE id=?
        """;

        try (Connection con = dataSource.getConnection();
             PreparedStatement st = con.prepareStatement(sql)) {

            st.setString(1, process.getProcessType());
            st.setString(2, process.getStatus());
            st.setInt(3, process.getProgress());
            st.setString(4, process.getMessage());
            st.setLong(5, process.getId());

            int rows = st.executeUpdate();
            return rows > 0;

        } catch (SQLException e) {
            AppLogger.error("Ошибка обновления процесса id=" + process.getId(), e);
        }

        return false;
    }

    public boolean delete(long id) {
        String sql = "DELETE FROM processes WHERE id=?";

        try (Connection con = dataSource.getConnection();
             PreparedStatement st = con.prepareStatement(sql)) {

            st.setLong(1, id);
            int rows = st.executeUpdate();
            return rows > 0;

        } catch (SQLException e) {
            AppLogger.error("Ошибка удаления процесса id=" + id, e);
        }

        return false;
    }

    public Process getById(long id) {
        String sql = "SELECT * FROM processes WHERE id=?";
        try (Connection con = dataSource.getConnection();
             PreparedStatement st = con.prepareStatement(sql)) {

            st.setLong(1, id);
            try (ResultSet rs = st.executeQuery()) {
                if (rs.next()) {
                    return mapRow(rs);
                }
            }

        } catch (SQLException e) {
            AppLogger.error("Ошибка получения процесса по id", e);
        }
        return null;
    }

    public List<Process> getAllByContestId(long contestId) {
        String sql = "SELECT * FROM processes WHERE contest_id=? ORDER BY id";
        List<Process> list = new ArrayList<>();

        try (Connection con = dataSource.getConnection();
             PreparedStatement st = con.prepareStatement(sql)) {

            st.setLong(1, contestId);
            try (ResultSet rs = st.executeQuery()) {
                while (rs.next()) {
                    list.add(mapRow(rs));
                }
            }

        } catch (SQLException e) {
            AppLogger.error("Ошибка получения процессов для контеста id=" + contestId, e);
        }
        return list;
    }

    public List<Process> getByContestIdAndType(long contestId, String type) {
        String sql = "SELECT * FROM processes WHERE contest_id=? AND process_type=?::process_type_enum ORDER BY id";
        List<Process> list = new ArrayList<>();

        try (Connection con = dataSource.getConnection();
             PreparedStatement st = con.prepareStatement(sql)) {

            st.setLong(1, contestId);
            st.setString(2, type);

            try (ResultSet rs = st.executeQuery()) {
                while (rs.next()) {
                    list.add(mapRow(rs));
                }
            }

        } catch (SQLException e) {
            AppLogger.error("Ошибка получения процессов для контеста id=" + contestId + " с типом=" + type, e);
        }
        return list;
    }

    public boolean existsByIdAndContestId(long processId, long contestId) {
        String sql = "SELECT EXISTS(SELECT 1 FROM processes WHERE id=? AND contest_id=?)";
        try (Connection con = dataSource.getConnection();
             PreparedStatement st = con.prepareStatement(sql)) {

            st.setLong(1, processId);
            st.setLong(2, contestId);

            try (ResultSet rs = st.executeQuery()) {
                if (rs.next()) {
                    return rs.getBoolean(1);
                }
            }

        } catch (SQLException e) {
            AppLogger.error("Ошибка проверки принадлежности процесса id=" + processId + " к контесту id=" + contestId, e);
        }

        return false;
    }

    public boolean deleteAllByContestId(long contestId) {
        String sql = "DELETE FROM processes WHERE contest_id=?";

        try (Connection con = dataSource.getConnection();
            PreparedStatement st = con.prepareStatement(sql)) {

            st.setLong(1, contestId);
            st.executeUpdate();
            return true;

        } catch (SQLException e) {
            AppLogger.error("Ошибка удаления процессов контеста id=" + contestId, e);
        }

        return false;
    }

    public boolean deleteByContestIdAndType(long contestId, String type) {
        String sql = """
            DELETE FROM processes
            WHERE contest_id=? AND process_type=?::process_type_enum
        """;

        try (Connection con = dataSource.getConnection();
            PreparedStatement st = con.prepareStatement(sql)) {

            st.setLong(1, contestId);
            st.setString(2, type);
            st.executeUpdate();
            return true;

        } catch (SQLException e) {
            AppLogger.error("Ошибка удаления процессов типа " + type +
                    " для контеста id=" + contestId, e);
        }

        return false;
    }


    public boolean hasRunningProcesses(long contestId) {
        String sql = "SELECT COUNT(*) FROM processes WHERE contest_id=? AND status='running'";
        try (Connection con = dataSource.getConnection();
             PreparedStatement st = con.prepareStatement(sql)) {

            st.setLong(1, contestId);

            try (ResultSet rs = st.executeQuery()) {
                if (rs.next()) {
                    int count = rs.getInt(1);
                    AppLogger.debug("Контест id=" + contestId + " имеет " + count + " активных процессов");
                    return count > 0;
                }
            }

        } catch (SQLException e) {
            AppLogger.error("Ошибка проверки активных процессов для контеста id=" + contestId + ": " + e.getMessage(), e);
        }

        return false;
    }

    public boolean hasRunningProcessByType(long contestId, String type) {
        String sql = """
            SELECT COUNT(*)
            FROM processes
            WHERE contest_id=? 
            AND status='running'
            AND process_type=?::process_type_enum
        """;

        try (Connection con = dataSource.getConnection();
            PreparedStatement st = con.prepareStatement(sql)) {

            st.setLong(1, contestId);
            st.setString(2, type);

            try (ResultSet rs = st.executeQuery()) {
                if (rs.next()) {
                    return rs.getInt(1) > 0;
                }
            }

        } catch (SQLException e) {
            AppLogger.error("Ошибка проверки running процесса типа " + type, e);
        }

        return false;
    }


    private Process mapRow(ResultSet rs) throws SQLException {
        return new Process(
                rs.getLong("id"),
                rs.getLong("contest_id"),
                rs.getString("process_type"),
                rs.getString("status"),
                rs.getInt("progress"),
                rs.getString("message")
        );
    }
}
