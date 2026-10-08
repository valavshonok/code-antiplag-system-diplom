package com.example.demo.service;

import com.example.demo.entities.Contest;
import com.example.demo.entities.Process;
import com.example.demo.entities.User;
import com.example.demo.integration.PythonImportClient;
import com.example.demo.repositories.ContestRepository;
import com.example.demo.repositories.ContestantRepository;
import com.example.demo.repositories.Processrepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.config.ComparisonConfigDefaults;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

@Service
public class ContestService {

    private final ContestRepository contestRepository;
    private final ContestantRepository contestantRepository;
    private final Processrepository processRepository;
    private final PythonImportClient pythonImportClient;

    public ContestService(
            ContestRepository contestRepository,
            ContestantRepository contestantRepository,
            Processrepository processRepository,
            PythonImportClient pythonImportClient
    ) {
        this.contestRepository = contestRepository;
        this.contestantRepository = contestantRepository;
        this.processRepository = processRepository;
        this.pythonImportClient = pythonImportClient;
    }

    private void ensureNoRunningProcesses(Long contestId) {
        if (processRepository.hasRunningProcesses(contestId)) {
            throw new IllegalStateException(
                    "Нельзя изменять контест: есть активные процессы"
            );
        }
    }

    @Transactional
    public Contest create(User currentUser, String name, Map<String, Object> config) {
        if (config == null) {
            config = new HashMap<>(ComparisonConfigDefaults.DEFAULT_CONFIG);
        } else {
            // merge с дефолтным
            Map<String, Object> merged = new HashMap<>(ComparisonConfigDefaults.DEFAULT_CONFIG);
            merged.putAll(config);
            config = merged;
        }
        Contest contest = new Contest(null, name, config, currentUser.getId());
        return contestRepository.create(contest);
    }

    @Transactional
    public Contest update(User currentUser, Long id, String name, Map<String, Object> config) {
        Contest contest = contestRepository.getById(id);
        if (contest == null) {
            throw new IllegalArgumentException("Контест не найден");
        }

        if (!Objects.equals(contest.getAuthorId(), currentUser.getId())){
            throw new IllegalArgumentException("Контест не принадлежит этому автору");
        }

        ensureNoRunningProcesses(id);

        if (name != null && !name.isBlank()) {
            contest.setName(name);
        }

        if (config != null) {
            Map<String, Object> merged = new HashMap<>(ComparisonConfigDefaults.DEFAULT_CONFIG);
            merged.putAll(config);
            contest.setConfig(merged);
        }

        return contestRepository.update(contest);
    }

    @Transactional
    public Contest delete(User currentUser, Long id) {
        Contest contest = contestRepository.getById(id);
        if (contest == null) {
            throw new IllegalArgumentException("Контест не найден");
        }

        if (!Objects.equals(contest.getAuthorId(), currentUser.getId())){
            throw new IllegalArgumentException("Контест не принадлежит этому автору");
        }

        ensureNoRunningProcesses(id);

        return contestRepository.delete(id);
    }

    @Transactional
    public Process startImport(
            User currentUser,
            Long contestId,
            String apiKey,
            String apiSecret,
            String cfContestId,
            byte[] fileBytes
    ) {
        Contest contest = contestRepository.getById(contestId);
        if (contest == null) {
            throw new IllegalArgumentException("Контест не найден");
        }

        if (!Objects.equals(contest.getAuthorId(), currentUser.getId())){
            throw new IllegalArgumentException("Контест не принадлежит этому автору");
        }

        ensureNoRunningProcesses(contestId);

        contestantRepository.deleteAllByContestId(contestId);
        processRepository.deleteAllByContestId(contestId);

        Process process = new Process(
                null,
                contestId,
                "import",
                "running",
                0,
                null
        );

        Process createdProcess = processRepository.create(process);
        pythonImportClient.startImport(
                createdProcess.getId(),
                apiKey,
                apiSecret,
                cfContestId,
                fileBytes
        );

        return createdProcess;
    }

    @Transactional
    public Process startImportYandexContest(
            User currentUser,
            Long contestId,
            byte[] fileBytes
    ) {
        Contest contest = contestRepository.getById(contestId);
        if (contest == null) {
            throw new IllegalArgumentException("Контест не найден");
        }

        if (!Objects.equals(contest.getAuthorId(), currentUser.getId())){
            throw new IllegalArgumentException("Контест не принадлежит этому автору");
        }

        ensureNoRunningProcesses(contestId);

        contestantRepository.deleteAllByContestId(contestId);
        processRepository.deleteAllByContestId(contestId);

        Process process = new Process(
                null,
                contestId,
                "import",
                "running",
                0,
                null
        );

        Process createdProcess = processRepository.create(process);
        pythonImportClient.startImportYandexContest(
                createdProcess.getId(),
                fileBytes
        );

        return createdProcess;
    }

    @Transactional
    public Process startComparison(User currentUser, Long contestId) {
        Contest contest = contestRepository.getById(contestId);
        if (contest == null) {
            throw new IllegalArgumentException("Контест не найден");
        }

        if (!Objects.equals(contest.getAuthorId(), currentUser.getId())){
            throw new IllegalArgumentException("Контест не принадлежит этому автору");
        }

        ensureNoRunningProcesses(contestId);


        processRepository.deleteByContestIdAndType(contestId, "comparison");

        Process process = new Process(
                null,
                contestId,
                "comparison",
                "running",
                0,
                null
        );

        Process createdProcess = processRepository.create(process);
        pythonImportClient.startComparison(createdProcess.getId());

        return createdProcess;
    }

    @Transactional
    public Process startCondition(Long contestId) {
        ensureNoRunningProcesses(contestId);

        processRepository.deleteByContestIdAndType(contestId, "condition");

        Process process = new Process(
                null,
                contestId,
                "condition",
                "running",
                0,
                null
        );

        Process createdProcess = processRepository.create(process);
        pythonImportClient.startCondition(createdProcess.getId());

        return createdProcess;
    }

    @Transactional(readOnly = true)
    public Contest getById(User currentUser, Long id) {
        Contest contest = contestRepository.getById(id);
        if (contest == null) {
            throw new IllegalArgumentException("Контест не найден");
        }

        if (!Objects.equals(contest.getAuthorId(), currentUser.getId())){
            throw new IllegalArgumentException("Контест не принадлежит этому автору");
        }
        return contest;
    }

    @Transactional(readOnly = true)
    public List<Contest> getAll(User currentUser) {
        return contestRepository.getAll(currentUser.getId());
    }
}