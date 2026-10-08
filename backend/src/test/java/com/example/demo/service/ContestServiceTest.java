package com.example.demo.service;

import com.example.demo.entities.*;
import com.example.demo.entities.Process;
import com.example.demo.integration.PythonImportClient;
import com.example.demo.repositories.*;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Map;

@ExtendWith(MockitoExtension.class)
class ContestServiceTest {

    @Mock
    private ContestRepository contestRepository;

    @Mock
    private ContestantRepository contestantRepository;

    @Mock
    private Processrepository processRepository;

    @Mock
    private PythonImportClient pythonImportClient;

    @InjectMocks
    private ContestService contestService;

    // ================= CREATE =================

    @Test
    void create_shouldUseDefaultConfig_whenNull() {
        User user = new User();
        user.setId(1L);

        when(contestRepository.create(any()))
                .thenAnswer(inv -> inv.getArgument(0));

        Contest result = contestService.create(user, "test", null);

        assertNotNull(result.getConfig());
        verify(contestRepository).create(any());
    }

    @Test
    void create_shouldMergeConfig() {
        User user = new User();
        user.setId(1L);

        when(contestRepository.create(any()))
                .thenAnswer(inv -> inv.getArgument(0));

        Contest result = contestService.create(user, "test", Map.of("a", 1));

        assertTrue(result.getConfig().containsKey("a"));
    }

    // ================= UPDATE =================

    @Test
    void update_shouldThrowIfNotFound() {
        when(contestRepository.getById(1L)).thenReturn(null);

        assertThrows(IllegalArgumentException.class, () ->
                contestService.update(new User(), 1L, "name", null)
        );
    }

    @Test
    void update_shouldThrowIfWrongAuthor() {
        User user = new User();
        user.setId(1L);

        Contest contest = new Contest(1L, "name", Map.of(), 2L);

        when(contestRepository.getById(1L)).thenReturn(contest);

        assertThrows(IllegalArgumentException.class, () ->
                contestService.update(user, 1L, "new", null)
        );
    }

    @Test
    void update_shouldThrowIfRunningProcess() {
        User user = new User();
        user.setId(1L);

        Contest contest = new Contest(1L, "name", Map.of(), 1L);

        when(contestRepository.getById(1L)).thenReturn(contest);
        when(processRepository.hasRunningProcesses(1L)).thenReturn(true);

        assertThrows(IllegalStateException.class, () ->
                contestService.update(user, 1L, "new", null)
        );
    }

    @Test
    void update_shouldUpdateSuccessfully() {
        User user = new User();
        user.setId(1L);

        Contest contest = new Contest(1L, "old", Map.of(), 1L);

        when(contestRepository.getById(1L)).thenReturn(contest);
        when(processRepository.hasRunningProcesses(1L)).thenReturn(false);
        when(contestRepository.update(any()))
                .thenAnswer(inv -> inv.getArgument(0));

        Contest updated = contestService.update(user, 1L, "new", Map.of("x", 1));

        assertEquals("new", updated.getName());
        assertTrue(updated.getConfig().containsKey("x"));
    }

    // ================= DELETE =================

    @Test
    void delete_shouldThrowIfNotFound() {
        when(contestRepository.getById(1L)).thenReturn(null);

        assertThrows(IllegalArgumentException.class, () ->
                contestService.delete(new User(), 1L)
        );
    }

    @Test
    void delete_shouldWork() {
        User user = new User();
        user.setId(1L);

        Contest contest = new Contest(1L, "name", Map.of(), 1L);

        when(contestRepository.getById(1L)).thenReturn(contest);
        when(processRepository.hasRunningProcesses(1L)).thenReturn(false);

        contestService.delete(user, 1L);

        verify(contestRepository).delete(1L);
    }

    // ================= START IMPORT =================

    @Test
    void startImport_shouldCallPython() {
        User user = new User();
        user.setId(1L);

        Contest contest = new Contest(1L, "name", Map.of(), 1L);

        when(contestRepository.getById(1L)).thenReturn(contest);
        when(processRepository.hasRunningProcesses(1L)).thenReturn(false);

        Process process = new Process(100L, 1L, "import", "running", 0, null);
        when(processRepository.create(any())).thenReturn(process);

        contestService.startImport(user, 1L, "k", "s", "cf", new byte[]{});

        verify(contestantRepository).deleteAllByContestId(1L);
        verify(processRepository).deleteAllByContestId(1L);
        verify(pythonImportClient).startImport(eq(100L), any(), any(), any(), any());
    }

    // ================= START IMPORT YANDEX =================

    @Test
    void startImportYandex_shouldCallPython() {
        User user = new User();
        user.setId(1L);

        Contest contest = new Contest(1L, "name", Map.of(), 1L);

        when(contestRepository.getById(1L)).thenReturn(contest);
        when(processRepository.hasRunningProcesses(1L)).thenReturn(false);

        Process process = new Process(200L, 1L, "import", "running", 0, null);
        when(processRepository.create(any())).thenReturn(process);

        contestService.startImportYandexContest(user, 1L, new byte[]{});

        verify(pythonImportClient).startImportYandexContest(eq(200L), any());
    }

    // ================= START COMPARISON =================

    @Test
    void startComparison_shouldCallPython() {
        User user = new User();
        user.setId(1L);

        Contest contest = new Contest(1L, "name", Map.of(), 1L);

        when(contestRepository.getById(1L)).thenReturn(contest);
        when(processRepository.hasRunningProcesses(1L)).thenReturn(false);

        Process process = new Process(300L, 1L, "comparison", "running", 0, null);
        when(processRepository.create(any())).thenReturn(process);

        contestService.startComparison(user, 1L);

        verify(processRepository).deleteByContestIdAndType(1L, "comparison");
        verify(pythonImportClient).startComparison(300L);
    }

    // ================= GET =================

    @Test
    void getById_shouldThrowIfNotFound() {
        when(contestRepository.getById(1L)).thenReturn(null);

        assertThrows(IllegalArgumentException.class, () ->
                contestService.getById(new User(), 1L)
        );
    }

    @Test
    void getById_shouldReturnContest() {
        User user = new User();
        user.setId(1L);

        Contest contest = new Contest(1L, "name", Map.of(), 1L);

        when(contestRepository.getById(1L)).thenReturn(contest);

        Contest result = contestService.getById(user, 1L);

        assertNotNull(result);
    }

    @Test
    void getAll_shouldReturnList() {
        User user = new User();
        user.setId(1L);

        when(contestRepository.getAll(1L)).thenReturn(List.of());

        List<Contest> result = contestService.getAll(user);

        assertNotNull(result);
    }
}