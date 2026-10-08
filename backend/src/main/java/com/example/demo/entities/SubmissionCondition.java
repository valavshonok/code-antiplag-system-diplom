package com.example.demo.entities;

import com.fasterxml.jackson.databind.JsonNode;

public class SubmissionCondition {

    private Long id;
    private Long processId;
    private Long submissionId;
    private JsonNode conditionResults;

    public SubmissionCondition() {}

    public SubmissionCondition(Long id,
                               Long processId,
                               Long submissionId,
                               JsonNode conditionResults) {
        this.id = id;
        this.processId = processId;
        this.submissionId = submissionId;
        this.conditionResults = conditionResults;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getProcessId() {
        return processId;
    }

    public void setProcessId(Long processId) {
        this.processId = processId;
    }

    public Long getSubmissionId() {
        return submissionId;
    }

    public void setSubmissionId(Long submissionId) {
        this.submissionId = submissionId;
    }

    public JsonNode getConditionResults() {
        return conditionResults;
    }

    public void setConditionResults(JsonNode conditionResults) {
        this.conditionResults = conditionResults;
    }
}