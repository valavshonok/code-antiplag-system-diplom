package com.example.demo.service;

import com.example.demo.entities.*;
import com.example.demo.repositories.*;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

@ExtendWith(MockitoExtension.class)
class ContestantServiceTest {

    @Mock
    private ContestantRepository contestantRepository;

    @Mock
    private Processrepository processRepository;

    @Mock
    private ContestRepository contestRepository;

    @InjectMocks
    private ContestantService contestantService;

    // ================= CREATE =================

    @Test
    void create_shouldThrowIfRunningProcess() {
        Contestant contestant = new Contestant();
        contestant.setContestId(1L);

        when(processRepository.hasRunningProcesses(1L)).thenReturn(true);

        assertThrows(IllegalStateException.class, () ->
                contestantService.create(contestant)
        );
    }

    @Test
    void create_shouldCallRepository() {
        Contestant contestant = new Contestant();
        contestant.setContestId(1L);

        when(processRepository.hasRunningProcesses(1L)).thenReturn(false);
        when(contestantRepository.create(contestant)).thenReturn(10L);

        Long id = contestantService.create(contestant);

        assertEquals(10L, id);
        verify(contestantRepository).create(contestant);
    }

    // ================= UPDATE =================

    @Test
    void update_shouldThrowIfRunningProcess() {
        Contestant contestant = new Contestant();
        contestant.setContestId(1L);

        when(processRepository.hasRunningProcesses(1L)).thenReturn(true);

        assertThrows(IllegalStateException.class, () ->
                contestantService.update(contestant)
        );
    }

    @Test
    void update_shouldThrowIfNotFound() {
        Contestant contestant = new Contestant();
        contestant.setContestId(1L);

        when(processRepository.hasRunningProcesses(1L)).thenReturn(false);
        when(contestantRepository.update(contestant)).thenReturn(false);

        assertThrows(IllegalArgumentException.class, () ->
                contestantService.update(contestant)
        );
    }

    @Test
    void update_shouldWork() {
        Contestant contestant = new Contestant();
        contestant.setContestId(1L);

        when(processRepository.hasRunningProcesses(1L)).thenReturn(false);
        when(contestantRepository.update(contestant)).thenReturn(true);

        contestantService.update(contestant);

        verify(contestantRepository).update(contestant);
    }

    // ================= DELETE =================

    @Test
    void delete_shouldThrowIfNotFound() {
        when(contestantRepository.getById(1L)).thenReturn(null);

        assertThrows(IllegalArgumentException.class, () ->
                contestantService.delete(1L)
        );
    }

    @Test
    void delete_shouldThrowIfRunningProcess() {
        Contestant contestant = new Contestant();
        contestant.setContestId(1L);

        when(contestantRepository.getById(1L)).thenReturn(contestant);
        when(processRepository.hasRunningProcesses(1L)).thenReturn(true);

        assertThrows(IllegalStateException.class, () ->
                contestantService.delete(1L)
        );
    }

    @Test
    void delete_shouldWork() {
        Contestant contestant = new Contestant();
        contestant.setContestId(1L);

        when(contestantRepository.getById(1L)).thenReturn(contestant);
        when(processRepository.hasRunningProcesses(1L)).thenReturn(false);

        contestantService.delete(1L);

        verify(contestantRepository).delete(1L);
    }

    // ================= GET ALL =================

    @Test
    void getAll_shouldThrowIfContestNotFound() {
        User user = new User();
        user.setId(1L);

        when(contestRepository.getById(1L)).thenReturn(null);

        assertThrows(IllegalArgumentException.class, () ->
                contestantService.getAllContestantsByContestId(user, 1L)
        );
    }

    @Test
    void getAll_shouldThrowIfWrongAuthor() {
        User user = new User();
        user.setId(1L);

        Contest contest = new Contest(1L, "name", null, 2L);

        when(contestRepository.getById(1L)).thenReturn(contest);

        assertThrows(IllegalArgumentException.class, () ->
                contestantService.getAllContestantsByContestId(user, 1L)
        );
    }

    @Test
    void getAll_shouldThrowIfImportRunning() {
        User user = new User();
        user.setId(1L);

        Contest contest = new Contest(1L, "name", null, 1L);

        when(contestRepository.getById(1L)).thenReturn(contest);
        when(processRepository.hasRunningProcessByType(1L, "import")).thenReturn(true);

        assertThrows(IllegalStateException.class, () ->
                contestantService.getAllContestantsByContestId(user, 1L)
        );
    }

    @Test
    void getAll_shouldReturnList() {
        User user = new User();
        user.setId(1L);

        Contest contest = new Contest(1L, "name", null, 1L);

        when(contestRepository.getById(1L)).thenReturn(contest);
        when(processRepository.hasRunningProcessByType(1L, "import")).thenReturn(false);
        when(contestantRepository.getAllByContestId(1L)).thenReturn(List.of());

        List<Contestant> result =
                contestantService.getAllContestantsByContestId(user, 1L);

        assertNotNull(result);
        verify(contestantRepository).getAllByContestId(1L);
    }
}