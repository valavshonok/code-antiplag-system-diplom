package com.example.demo.service;

import com.example.demo.entities.*;
import com.example.demo.entities.Process;
import com.example.demo.repositories.ContestRepository;
import com.example.demo.repositories.SubmissionComparisonRepository;
import com.example.demo.repositories.Processrepository;
import com.example.demo.repositories.SubmissionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.example.demo.dto.SubmissionComparisonSummary;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Service
public class SubmissionComparisonService {

    private final SubmissionComparisonRepository comparisonRepository;
    private final Processrepository processRepository;
    private final ContestRepository contestRepository;

    private final SubmissionRepository submissionRepository;

    public SubmissionComparisonService(
            SubmissionComparisonRepository comparisonRepository,
            Processrepository processRepository, ContestRepository contestRepository, SubmissionRepository submissionRepository
    ) {
        this.comparisonRepository = comparisonRepository;
        this.processRepository = processRepository;
        this.contestRepository = contestRepository;
        this.submissionRepository = submissionRepository;
    }

    private void ensureNoRunningProcesses(Long contestId) {
        if (processRepository.hasRunningProcesses(contestId)) {
            throw new IllegalStateException(
                    "Нельзя изменять сравнения: есть активные процессы"
            );
        }
    }

    private void ensureNoRunningComparisonForContest(Long contestId) {
        if (processRepository.hasRunningProcessByType(contestId, "comparison")) {
            throw new IllegalStateException(
                    "Contest " + contestId + ": выполняется comparison процесс"
            );
        }
    }

    @Transactional
    public SubmissionComparison setPlagiarism(User currentUser, Long contestId, Long comparisonId, Boolean plagiarism) {
        Contest contest = contestRepository.getById(contestId);
        if (contest == null) {
            throw new IllegalArgumentException("Контест не найден");
        }

        if (!Objects.equals(contest.getAuthorId(), currentUser.getId())){
            throw new IllegalArgumentException("Контест не принадлежит этому автору");
        }
        ensureNoRunningProcesses(contestId);
        return comparisonRepository.setPlagiarism(comparisonId, plagiarism);
    }
   
    @Transactional(readOnly = true)
    public List<SubmissionComparison> getAllComparisonsByContestId(User currentUser, Long contestId) {
        Contest contest = contestRepository.getById(contestId);
        if (contest == null) {
            throw new IllegalArgumentException("Контест не найден");
        }

        if (!Objects.equals(contest.getAuthorId(), currentUser.getId())){
            throw new IllegalArgumentException("Контест не принадлежит этому автору");
        }

        ensureNoRunningComparisonForContest(contestId);

        List<Process> comparisonProcesses =
                processRepository.getByContestIdAndType(contestId, "comparison");

        List<SubmissionComparison> result = new ArrayList<>();

        for (Process p : comparisonProcesses) {
            result.addAll(
                    comparisonRepository.getAllByProcessId(p.getId())
            );
        }

        return result;
    }

    @Transactional(readOnly = true)
    public List<SubmissionComparisonSummary> getAllComparisonsSummaryByContestId(User currentUser, Long contestId) {
        Contest contest = contestRepository.getById(contestId);
        if (contest == null) {
            throw new IllegalArgumentException("Контест не найден");
        }

        if (!Objects.equals(contest.getAuthorId(), currentUser.getId())){
            throw new IllegalArgumentException("Контест не принадлежит этому автору");
        }

        ensureNoRunningComparisonForContest(contestId);

        List<Process> comparisonProcesses =
                processRepository.getByContestIdAndType(contestId, "comparison");

        List<SubmissionComparisonSummary> result = new ArrayList<>();

        for (Process p : comparisonProcesses) {
            result.addAll(
                    comparisonRepository.getAllSummariesByProcessId(p.getId())
            );
        }

        return result;
    }

    @Transactional(readOnly = true)
    public SubmissionComparison getComparisonByComparisonId(User currentUser, Long comparisonId) {
        SubmissionComparison comp = comparisonRepository.getByComparisonId(comparisonId);

        Process proc = processRepository.getById(comp.getProcessId());

        Contest contest = contestRepository.getById(proc.getContestId());
        if (contest == null) {
            throw new IllegalArgumentException("Контест не найден");
        }

        if (!Objects.equals(contest.getAuthorId(), currentUser.getId())){
            throw new IllegalArgumentException("Контест не принадлежит этому автору");
        }

        return comp;
    }
}
