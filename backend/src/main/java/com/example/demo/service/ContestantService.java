package com.example.demo.service;

import com.example.demo.entities.Contest;
import com.example.demo.entities.Contestant;
import com.example.demo.entities.User;
import com.example.demo.repositories.ContestRepository;
import com.example.demo.repositories.ContestantRepository;
import com.example.demo.repositories.Processrepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Service
public class ContestantService {

    private final ContestantRepository contestantRepository;
    private final Processrepository processRepository;
    private final ContestRepository contestRepository;

    public ContestantService(
            ContestantRepository contestantRepository,
            Processrepository processRepository, ContestRepository contestRepository
    ) {
        this.contestantRepository = contestantRepository;
        this.processRepository = processRepository;
        this.contestRepository = contestRepository;
    }

    private void ensureNoRunningProcesses(Long contestId) {
        if (processRepository.hasRunningProcesses(contestId)) {
            throw new IllegalStateException(
                    "Нельзя изменять участников: есть активные процессы"
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
    public Long create(Contestant contestant) {
        ensureNoRunningProcesses(contestant.getContestId());
        return contestantRepository.create(contestant);
    }

    @Transactional
    public void update(Contestant contestant) {
        ensureNoRunningProcesses(contestant.getContestId());

        if (!contestantRepository.update(contestant)) {
            throw new IllegalArgumentException("Участник не найден");
        }
    }

    @Transactional
    public void delete(Long id) {
        Contestant contestant = contestantRepository.getById(id);
        if (contestant == null) {
            throw new IllegalArgumentException("Участник не найден");
        }

        ensureNoRunningProcesses(contestant.getContestId());
        contestantRepository.delete(id);
    }

    @Transactional(readOnly = true)
    public List<Contestant> getAllContestantsByContestId(User currentUser, Long contestId) {
        Contest contest = contestRepository.getById(contestId);
        if (contest == null) {
            throw new IllegalArgumentException("Контест не найден");
        }

        if (!Objects.equals(contest.getAuthorId(), currentUser.getId())){
            throw new IllegalArgumentException("Контест не принадлежит этому автору");
        }
        ensureNoRunningImportForContest(contestId);
        return contestantRepository.getAllByContestId(contestId);
    }
}
