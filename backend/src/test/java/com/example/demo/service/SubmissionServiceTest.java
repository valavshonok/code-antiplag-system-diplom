package com.example.demo.service;

import com.example.demo.entities.*;
import com.example.demo.repositories.*;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class SubmissionServiceTest {

    @Mock
    private SubmissionRepository submissionRepository;

    @Mock
    private ContestantRepository contestantRepository;

    @Mock
    private Processrepository processRepository;

    @Mock
    private ContestRepository contestRepository;

    @InjectMocks
    private SubmissionService submissionService;

    // ======================================================
    // CREATE
    // ======================================================

    @Test
    void create_shouldReturnId() {
        Contestant contestant = new Contestant();
        contestant.setId(1L);
        contestant.setContestId(10L);

        Submission submission = new Submission();
        submission.setContestantId(1L);

        when(contestantRepository.getById(1L)).thenReturn(contestant);
        when(processRepository.hasRunningProcesses(10L)).thenReturn(false);
        when(submissionRepository.create(submission)).thenReturn(100L);

        Long result = submissionService.create(submission);

        assertEquals(100L, result);
        verify(submissionRepository).create(submission);
    }

    @Test
    void create_shouldThrowIfContestantNotFound() {
        Submission submission = new Submission();
        submission.setContestantId(1L);

        when(contestantRepository.getById(1L)).thenReturn(null);

        assertThrows(IllegalArgumentException.class,
                () -> submissionService.create(submission));
    }

    @Test
    void create_shouldThrowIfRunningProcessExists() {
        Contestant contestant = new Contestant();
        contestant.setId(1L);
        contestant.setContestId(10L);

        Submission submission = new Submission();
        submission.setContestantId(1L);

        when(contestantRepository.getById(1L)).thenReturn(contestant);
        when(processRepository.hasRunningProcesses(10L)).thenReturn(true);

        assertThrows(IllegalStateException.class,
                () -> submissionService.create(submission));
    }

    // ======================================================
    // UPDATE
    // ======================================================

    @Test
    void update_shouldWork() {
        Submission existing = new Submission();
        existing.setId(1L);
        existing.setContestantId(2L);

        Contestant contestant = new Contestant();
        contestant.setContestId(10L);

        Submission updated = new Submission();
        updated.setId(1L);

        when(submissionRepository.getById(1L)).thenReturn(existing);
        when(contestantRepository.getById(2L)).thenReturn(contestant);
        when(processRepository.hasRunningProcesses(10L)).thenReturn(false);

        submissionService.update(updated);

        verify(submissionRepository).update(updated);
    }

    @Test
    void update_shouldThrowIfNotFound() {
        Submission submission = new Submission();
        submission.setId(1L);

        when(submissionRepository.getById(1L)).thenReturn(null);

        assertThrows(IllegalArgumentException.class,
                () -> submissionService.update(submission));
    }

    @Test
    void update_shouldThrowIfRunningProcessExists() {
        Submission existing = new Submission();
        existing.setId(1L);
        existing.setContestantId(2L);

        Contestant contestant = new Contestant();
        contestant.setContestId(10L);

        Submission updated = new Submission();
        updated.setId(1L);

        when(submissionRepository.getById(1L)).thenReturn(existing);
        when(contestantRepository.getById(2L)).thenReturn(contestant);
        when(processRepository.hasRunningProcesses(10L)).thenReturn(true);

        assertThrows(IllegalStateException.class,
                () -> submissionService.update(updated));
    }

    // ======================================================
    // DELETE
    // ======================================================

    @Test
    void delete_shouldWork() {
        Submission submission = new Submission();
        submission.setId(1L);
        submission.setContestantId(2L);

        Contestant contestant = new Contestant();
        contestant.setContestId(10L);

        when(submissionRepository.getById(1L)).thenReturn(submission);
        when(contestantRepository.getById(2L)).thenReturn(contestant);
        when(processRepository.hasRunningProcesses(10L)).thenReturn(false);

        submissionService.delete(1L);

        verify(submissionRepository).delete(1L);
    }

    @Test
    void delete_shouldThrowIfNotFound() {
        when(submissionRepository.getById(1L)).thenReturn(null);

        assertThrows(IllegalArgumentException.class,
                () -> submissionService.delete(1L));
    }

    @Test
    void delete_shouldThrowIfRunningProcessExists() {
        Submission submission = new Submission();
        submission.setId(1L);
        submission.setContestantId(2L);

        Contestant contestant = new Contestant();
        contestant.setContestId(10L);

        when(submissionRepository.getById(1L)).thenReturn(submission);
        when(contestantRepository.getById(2L)).thenReturn(contestant);
        when(processRepository.hasRunningProcesses(10L)).thenReturn(true);

        assertThrows(IllegalStateException.class,
                () -> submissionService.delete(1L));
    }

    // ======================================================
    // GET ALL BY CONTEST
    // ======================================================

    @Test
    void getAll_shouldReturnList() {
        User user = new User();
        user.setId(1L);

        Contest contest = new Contest(10L, "c", null, 1L);

        List<Submission> submissions = List.of(
                new Submission(),
                new Submission()
        );

        when(contestRepository.getById(10L)).thenReturn(contest);
        when(processRepository.hasRunningProcessByType(10L, "import")).thenReturn(false);
        when(submissionRepository.getAllByContestId(10L)).thenReturn(submissions);

        List<Submission> result =
                submissionService.getAllSubmissionsByContestId(user, 10L);

        assertEquals(2, result.size());
    }

    @Test
    void getAll_shouldThrowIfContestNotFound() {
        User user = new User();
        user.setId(1L);

        when(contestRepository.getById(10L)).thenReturn(null);

        assertThrows(IllegalArgumentException.class,
                () -> submissionService.getAllSubmissionsByContestId(user, 10L));
    }

    @Test
    void getAll_shouldThrowIfWrongAuthor() {
        User user = new User();
        user.setId(1L);

        Contest contest = new Contest(10L, "c", null, 2L);

        when(contestRepository.getById(10L)).thenReturn(contest);

        assertThrows(IllegalArgumentException.class,
                () -> submissionService.getAllSubmissionsByContestId(user, 10L));
    }

    @Test
    void getAll_shouldThrowIfImportRunning() {
        User user = new User();
        user.setId(1L);

        Contest contest = new Contest(10L, "c", null, 1L);

        when(contestRepository.getById(10L)).thenReturn(contest);
        when(processRepository.hasRunningProcessByType(10L, "import")).thenReturn(true);

        assertThrows(IllegalStateException.class,
                () -> submissionService.getAllSubmissionsByContestId(user, 10L));
    }
}