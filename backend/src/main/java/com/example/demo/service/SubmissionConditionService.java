package com.example.demo.service;

import com.example.demo.entities.Process;
import com.example.demo.entities.SubmissionCondition;
import com.example.demo.repositories.Processrepository;
import com.example.demo.repositories.SubmissionConditionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class SubmissionConditionService {

    private final SubmissionConditionRepository conditionRepository;
    private final Processrepository processRepository;

    public SubmissionConditionService(
            SubmissionConditionRepository conditionRepository,
            Processrepository processRepository
    ) {
        this.conditionRepository = conditionRepository;
        this.processRepository = processRepository;
    }

    private void ensureNoRunningConditionProcess(Long contestId) {
        if (processRepository.hasRunningProcessByType(contestId, "condition")) {
            throw new IllegalStateException(
                    "Contest " + contestId + ": выполняется condition процесс"
            );
        }
    }

    @Transactional(readOnly = true)
    public List<SubmissionCondition> getAllByContestId(Long contestId) {

        ensureNoRunningConditionProcess(contestId);

        return conditionRepository.getAllByContestId(contestId);
    }

    /**
     * Обновление expert_verdict.
     * conditionIndex — индекс условия в массиве conditions.
     */
    @Transactional
    public boolean setExpertVerdict(Long contestId,
                                    Long submissionConditionId,
                                    int conditionIndex,
                                    Boolean expertVerdict) {

        ensureNoRunningConditionProcess(contestId);

        return conditionRepository.updateExpertVerdict(
                submissionConditionId,
                conditionIndex,
                expertVerdict
        );
    }
}