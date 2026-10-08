package com.example.demo.service;

import com.example.demo.entities.Contest;
import com.example.demo.entities.Process;
import com.example.demo.entities.User;
import com.example.demo.integration.PythonImportClient;
import com.example.demo.repositories.ContestRepository;
import com.example.demo.repositories.Processrepository;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class ProcessServiceTest {

    @Mock
    private Processrepository processRepository;

    @Mock
    private PythonImportClient pythonImportClient;

    @Mock
    private ContestRepository contestRepository;

    @InjectMocks
    private ProcessService processService;

    // =========================
    // getById
    // =========================

    @Test
    void getById_shouldReturnProcess() {
        Process process = new Process(1L, 10L, "import", "running", 50, null);

        when(processRepository.getById(1L)).thenReturn(process);

        Process result = processService.getById(1L);

        assertEquals(process, result);
    }

    // =========================
    // stopProcess SUCCESS
    // =========================

    @Test
    void stopProcess_shouldStopAndUpdateProcess() {
        User user = new User();
        user.setId(1L);

        Contest contest = new Contest(10L, "test", null, 1L);
        Process process = new Process(100L, 10L, "import", "running", 50, null);

        when(contestRepository.getById(10L)).thenReturn(contest);
        when(processRepository.existsByIdAndContestId(100L, 10L)).thenReturn(true);
        when(processRepository.getById(100L)).thenReturn(process);

        processService.stopProcess(user, 10L, 100L);

        verify(pythonImportClient).stopProcess(100L);
        verify(processRepository).update(process);

        assertEquals("none", process.getStatus());
        assertEquals(0, process.getProgress());
    }

    // =========================
    // stopProcess ERRORS
    // =========================

    @Test
    void stopProcess_shouldThrowIfContestNotFound() {
        User user = new User();
        user.setId(1L);

        when(contestRepository.getById(10L)).thenReturn(null);

        assertThrows(IllegalArgumentException.class, () ->
                processService.stopProcess(user, 10L, 100L)
        );
    }

    @Test
    void stopProcess_shouldThrowIfWrongAuthor() {
        User user = new User();
        user.setId(1L);

        Contest contest = new Contest(10L, "test", null, 2L);

        when(contestRepository.getById(10L)).thenReturn(contest);

        assertThrows(IllegalArgumentException.class, () ->
                processService.stopProcess(user, 10L, 100L)
        );
    }

    @Test
    void stopProcess_shouldThrowIfProcessNotExistsForContest() {
        User user = new User();
        user.setId(1L);

        Contest contest = new Contest(10L, "test", null, 1L);

        when(contestRepository.getById(10L)).thenReturn(contest);
        when(processRepository.existsByIdAndContestId(100L, 10L)).thenReturn(false);

        assertThrows(IllegalArgumentException.class, () ->
                processService.stopProcess(user, 10L, 100L)
        );
    }

    @Test
    void stopProcess_shouldThrowIfNotRunning() {
        User user = new User();
        user.setId(1L);

        Contest contest = new Contest(10L, "test", null, 1L);
        Process process = new Process(100L, 10L, "import", "done", 100, null);

        when(contestRepository.getById(10L)).thenReturn(contest);
        when(processRepository.existsByIdAndContestId(100L, 10L)).thenReturn(true);
        when(processRepository.getById(100L)).thenReturn(process);

        assertThrows(IllegalStateException.class, () ->
                processService.stopProcess(user, 10L, 100L)
        );
    }

    // =========================
    // getAllProcessesByContestId SUCCESS
    // =========================

    @Test
    void getAllProcesses_shouldReturnList() {
        User user = new User();
        user.setId(1L);

        Contest contest = new Contest(10L, "test", null, 1L);

        List<Process> processes = List.of(
                new Process(1L, 10L, "import", "running", 10, null),
                new Process(2L, 10L, "comparison", "done", 100, null)
        );

        when(contestRepository.getById(10L)).thenReturn(contest);
        when(processRepository.getAllByContestId(10L)).thenReturn(processes);

        List<Process> result = processService.getAllProcessesByContestId(user, 10L);

        assertEquals(2, result.size());
    }

    // =========================
    // getAllProcesses ERRORS
    // =========================

    @Test
    void getAllProcesses_shouldThrowIfContestNotFound() {
        User user = new User();
        user.setId(1L);

        when(contestRepository.getById(10L)).thenReturn(null);

        assertThrows(IllegalArgumentException.class, () ->
                processService.getAllProcessesByContestId(user, 10L)
        );
    }

    @Test
    void getAllProcesses_shouldThrowIfWrongAuthor() {
        User user = new User();
        user.setId(1L);

        Contest contest = new Contest(10L, "test", null, 2L);

        when(contestRepository.getById(10L)).thenReturn(contest);

        assertThrows(IllegalArgumentException.class, () ->
                processService.getAllProcessesByContestId(user, 10L)
        );
    }
}