package com.example.demo.service;

import com.example.demo.entities.Contest;
import com.example.demo.entities.Submission;
import com.example.demo.entities.Contestant;
import com.example.demo.entities.User;
import com.example.demo.repositories.ContestRepository;
import com.example.demo.repositories.SubmissionRepository;
import com.example.demo.repositories.ContestantRepository;
import com.example.demo.repositories.Processrepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Service
public class SubmissionService {

    private final SubmissionRepository submissionRepository;
    private final ContestantRepository contestantRepository;
    private final Processrepository processRepository;
    private final ContestRepository contestRepository;

    public SubmissionService(
            SubmissionRepository submissionRepository,
            ContestantRepository contestantRepository,
            Processrepository processRepository, ContestRepository contestRepository
    ) {
        this.submissionRepository = submissionRepository;
        this.contestantRepository = contestantRepository;
        this.processRepository = processRepository;
        this.contestRepository = contestRepository;
    }

    private void ensureNoRunningProcesses(Long contestId) {
        if (processRepository.hasRunningProcesses(contestId)) {
            throw new IllegalStateException(
                    "Нельзя изменять посылки: есть активные процессы"
            );
        }
    }

    private void ensureNoRunningImportForContest(Long contestId) {
        if (processRepository.hasRunningProcessByType(contestId, "import")) {
            throw new IllegalStateException(
                    "Contest " + contestId + ": выполняется import процесс"
            );
        }
    }

    @Transactional
    public Long create(Submission submission) {
        Contestant contestant = contestantRepository.getById(submission.getContestantId());
        if (contestant == null) {
            throw new IllegalArgumentException("Участник не найден");
        }

        ensureNoRunningProcesses(contestant.getContestId());
        return submissionRepository.create(submission);
    }

    @Transactional
    public void update(Submission submission) {
        Submission existing = submissionRepository.getById(submission.getId());
        if (existing == null) {
            throw new IllegalArgumentException("Посылка не найдена");
        }

        Contestant contestant = contestantRepository.getById(existing.getContestantId());
        ensureNoRunningProcesses(contestant.getContestId());

        submissionRepository.update(submission);
    }

    @Transactional
    public void delete(Long id) {
        Submission submission = submissionRepository.getById(id);
        if (submission == null) {
            throw new IllegalArgumentException("Посылка не найдена");
        }

        Contestant contestant = contestantRepository.getById(submission.getContestantId());
        ensureNoRunningProcesses(contestant.getContestId());

        submissionRepository.delete(id);
    }

    @Transactional(readOnly = true)
    public List<Submission> getAllSubmissionsByContestId(User currentUser, Long contestId) {
        Contest contest = contestRepository.getById(contestId);
        if (contest == null) {
            throw new IllegalArgumentException("Контест не найден");
        }

        if (!Objects.equals(contest.getAuthorId(), currentUser.getId())){
            throw new IllegalArgumentException("Контест не принадлежит этому автору");
        }

        ensureNoRunningImportForContest(contestId);
        return submissionRepository.getAllByContestId(contestId);
    }
}
