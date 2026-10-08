package com.example.demo.service;

import com.example.demo.entities.Contest;
import com.example.demo.entities.Process;
import com.example.demo.entities.User;
import com.example.demo.integration.PythonImportClient;
import com.example.demo.repositories.ContestRepository;
import com.example.demo.repositories.Processrepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Service
public class ProcessService {

    private final Processrepository processRepository;
    private final PythonImportClient pythonImportClient;
    private final ContestRepository contestRepository;

    public ProcessService(
            Processrepository processRepository,
            PythonImportClient pythonImportClient, ContestRepository contestRepository
    ) {
        this.processRepository = processRepository;
        this.pythonImportClient = pythonImportClient;
        this.contestRepository = contestRepository;
    }

    @Transactional(readOnly = true)
    public Process getById(Long id) {
        return processRepository.getById(id);
    }

    @Transactional
    public void stopProcess(User currentUser, Long contestId, Long processId) {

        Contest contest = contestRepository.getById(contestId);
        if (contest == null) {
            throw new IllegalArgumentException("Контест не найден");
        }

        if (!Objects.equals(contest.getAuthorId(), currentUser.getId())){
            throw new IllegalArgumentException("Контест не принадлежит этому автору");
        }

        if (!processRepository.existsByIdAndContestId(processId, contestId)) {
            throw new IllegalArgumentException("Процесс не найден для данного контеста");
        }

        Process process = processRepository.getById(processId);

        if (!"running".equals(process.getStatus())) {
            throw new IllegalStateException("Процесс не находится в состоянии running");
        }

        pythonImportClient.stopProcess(processId);

        process.setStatus("none");
        process.setProgress(0);
        processRepository.update(process);
    }

    @Transactional(readOnly = true)
    public List<Process> getAllProcessesByContestId(User currentUser, Long contestId) {
        Contest contest = contestRepository.getById(contestId);
        if (contest == null) {
            throw new IllegalArgumentException("Контест не найден");
        }

        if (!Objects.equals(contest.getAuthorId(), currentUser.getId())){
            throw new IllegalArgumentException("Контест не принадлежит этому автору");
        }
        return processRepository.getAllByContestId(contestId);
    }
}
