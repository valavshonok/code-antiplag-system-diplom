package com.example.demo.service;

import com.example.demo.dto.SubmissionComparisonSummary;
import com.example.demo.entities.*;
import com.example.demo.entities.Process;
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
class SubmissionComparisonServiceTest {

    @Mock
    private SubmissionComparisonRepository comparisonRepository;

    @Mock
    private Processrepository processRepository;

    @Mock
    private ContestRepository contestRepository;

    @Mock
    private SubmissionRepository submissionRepository;

    @InjectMocks
    private SubmissionComparisonService service;

    // ======================================================
    // setPlagiarism - SUCCESS
    // ======================================================

    @Test
    void setPlagiarism_shouldReturnUpdatedEntity() {
        User user = new User();
        user.setId(1L);

        Contest contest = new Contest(10L, "c", null, 1L);

        SubmissionComparison comp = new SubmissionComparison();
        comp.setId(100L);

        when(contestRepository.getById(10L)).thenReturn(contest);
        when(processRepository.hasRunningProcesses(10L)).thenReturn(false);
        when(comparisonRepository.setPlagiarism(100L, true)).thenReturn(comp);

        SubmissionComparison result =
                service.setPlagiarism(user, 10L, 100L, true);

        assertEquals(comp, result);
        verify(comparisonRepository).setPlagiarism(100L, true);
    }

    // ======================================================
    // setPlagiarism - ERRORS
    // ======================================================

    @Test
    void setPlagiarism_shouldThrowIfContestNotFound() {
        User user = new User();
        user.setId(1L);

        when(contestRepository.getById(10L)).thenReturn(null);

        assertThrows(IllegalArgumentException.class, () ->
                service.setPlagiarism(user, 10L, 100L, true)
        );
    }

    @Test
    void setPlagiarism_shouldThrowIfWrongAuthor() {
        User user = new User();
        user.setId(1L);

        Contest contest = new Contest(10L, "c", null, 2L);

        when(contestRepository.getById(10L)).thenReturn(contest);

        assertThrows(IllegalArgumentException.class, () ->
                service.setPlagiarism(user, 10L, 100L, true)
        );
    }

    @Test
    void setPlagiarism_shouldThrowIfRunningProcessExists() {
        User user = new User();
        user.setId(1L);

        Contest contest = new Contest(10L, "c", null, 1L);

        when(contestRepository.getById(10L)).thenReturn(contest);
        when(processRepository.hasRunningProcesses(10L)).thenReturn(true);

        assertThrows(IllegalStateException.class, () ->
                service.setPlagiarism(user, 10L, 100L, true)
        );
    }

    // ======================================================
    // getAllComparisonsByContestId - SUCCESS
    // ======================================================

    @Test
    void getAllComparisons_shouldReturnAll() {
        User user = new User();
        user.setId(1L);

        Contest contest = new Contest(10L, "c", null, 1L);

        Process p1 = new Process(1L, 10L, "comparison", "running", 0, null);
        Process p2 = new Process(2L, 10L, "comparison", "running", 0, null);

        SubmissionComparison c1 = new SubmissionComparison();
        SubmissionComparison c2 = new SubmissionComparison();

        when(contestRepository.getById(10L)).thenReturn(contest);
        when(processRepository.hasRunningProcessByType(10L, "comparison")).thenReturn(false);
        when(processRepository.getByContestIdAndType(10L, "comparison"))
                .thenReturn(List.of(p1, p2));

        when(comparisonRepository.getAllByProcessId(1L))
                .thenReturn(List.of(c1));

        when(comparisonRepository.getAllByProcessId(2L))
                .thenReturn(List.of(c2));

        List<SubmissionComparison> result =
                service.getAllComparisonsByContestId(user, 10L);

        assertEquals(2, result.size());
    }

    // ======================================================
    // getAllComparisons - ERRORS
    // ======================================================

    @Test
    void getAllComparisons_shouldThrowIfContestNotFound() {
        User user = new User();
        user.setId(1L);

        when(contestRepository.getById(10L)).thenReturn(null);

        assertThrows(IllegalArgumentException.class, () ->
                service.getAllComparisonsByContestId(user, 10L)
        );
    }

    @Test
    void getAllComparisons_shouldThrowIfWrongAuthor() {
        User user = new User();
        user.setId(1L);

        Contest contest = new Contest(10L, "c", null, 2L);

        when(contestRepository.getById(10L)).thenReturn(contest);

        assertThrows(IllegalArgumentException.class, () ->
                service.getAllComparisonsByContestId(user, 10L)
        );
    }

    @Test
    void getAllComparisons_shouldThrowIfRunningComparisonExists() {
        User user = new User();
        user.setId(1L);

        Contest contest = new Contest(10L, "c", null, 1L);

        when(contestRepository.getById(10L)).thenReturn(contest);
        when(processRepository.hasRunningProcessByType(10L, "comparison"))
                .thenReturn(true);

        assertThrows(IllegalStateException.class, () ->
                service.getAllComparisonsByContestId(user, 10L)
        );
    }

    // ======================================================
    // getAllComparisonsSummaryByContestId - SUCCESS
    // ======================================================

    @Test
    void getAllComparisonsSummary_shouldReturnSummaries() {
        User user = new User();
        user.setId(1L);

        Contest contest = new Contest(10L, "c", null, 1L);

        Process p = new Process(1L, 10L, "comparison", "running", 0, null);

        SubmissionComparisonSummary s = new SubmissionComparisonSummary();

        when(contestRepository.getById(10L)).thenReturn(contest);
        when(processRepository.hasRunningProcessByType(10L, "comparison")).thenReturn(false);
        when(processRepository.getByContestIdAndType(10L, "comparison"))
                .thenReturn(List.of(p));

        when(comparisonRepository.getAllSummariesByProcessId(1L))
                .thenReturn(List.of(s));

        List<SubmissionComparisonSummary> result =
                service.getAllComparisonsSummaryByContestId(user, 10L);

        assertEquals(1, result.size());
    }

    // ======================================================
    // getComparisonByComparisonId - SUCCESS
    // ======================================================

    @Test
    void getComparisonById_shouldReturnComparison() {
        User user = new User();
        user.setId(1L);

        SubmissionComparison comp = new SubmissionComparison();
        comp.setProcessId(5L);

        Process proc = new Process(5L, 10L, "comparison", "done", 0, null);
        Contest contest = new Contest(10L, "c", null, 1L);

        when(comparisonRepository.getByComparisonId(100L)).thenReturn(comp);
        when(processRepository.getById(5L)).thenReturn(proc);
        when(contestRepository.getById(10L)).thenReturn(contest);

        SubmissionComparison result =
                service.getComparisonByComparisonId(user, 100L);

        assertEquals(comp, result);
    }

    // ======================================================
    // getComparisonByComparisonId - ERRORS
    // ======================================================

    @Test
    void getComparisonById_shouldThrowIfContestNotFound() {
        User user = new User();
        user.setId(1L);

        SubmissionComparison comp = new SubmissionComparison();
        comp.setProcessId(5L);

        Process proc = new Process(5L, 10L, "comparison", "done", 0, null);

        when(comparisonRepository.getByComparisonId(100L)).thenReturn(comp);
        when(processRepository.getById(5L)).thenReturn(proc);
        when(contestRepository.getById(10L)).thenReturn(null);

        assertThrows(IllegalArgumentException.class, () ->
                service.getComparisonByComparisonId(user, 100L)
        );
    }

    @Test
    void getComparisonById_shouldThrowIfWrongAuthor() {
        User user = new User();
        user.setId(1L);

        SubmissionComparison comp = new SubmissionComparison();
        comp.setProcessId(5L);

        Process proc = new Process(5L, 10L, "comparison", "done", 0, null);
        Contest contest = new Contest(10L, "c", null, 2L);

        when(comparisonRepository.getByComparisonId(100L)).thenReturn(comp);
        when(processRepository.getById(5L)).thenReturn(proc);
        when(contestRepository.getById(10L)).thenReturn(contest);

        assertThrows(IllegalArgumentException.class, () ->
                service.getComparisonByComparisonId(user, 100L)
        );
    }
}