package com.example.demo.entities;

import com.fasterxml.jackson.databind.JsonNode;

public class SubmissionComparison {

    private Long id;
    private Long processId;
    private Long submission1Id;
    private Long submission2Id;

    private JsonNode diffStringBlocks;
    private JsonNode diffStringBlocksNormalized;
    private JsonNode diffCharBlocks;
    private JsonNode diffCharBlocksNormalized;

    private int matchPercent;
    private int matchPercentNormalized;
    private boolean plagiarism;

    public SubmissionComparison() {}

    public SubmissionComparison(Long id,
                                Long processId,
                                Long submission1Id,
                                Long submission2Id,
                                JsonNode diffStringBlocks,
                                JsonNode diffStringBlocksNormalized,
                                JsonNode diffCharBlocks,
                                JsonNode diffCharBlocksNormalized,
                                int matchPercent,
                                int matchPercentNormalized,
                                boolean plagiarism) {
        this.id = id;
        this.processId = processId;
        this.submission1Id = submission1Id;
        this.submission2Id = submission2Id;
        this.diffStringBlocks = diffStringBlocks;
        this.diffStringBlocksNormalized = diffStringBlocksNormalized;
        this.diffCharBlocks = diffCharBlocks;
        this.diffCharBlocksNormalized = diffCharBlocksNormalized;
        this.matchPercent = matchPercent;
        this.matchPercentNormalized = matchPercentNormalized;
        this.plagiarism = plagiarism;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getProcessId() { return processId; }
    public void setProcessId(Long processId) { this.processId = processId; }

    public Long getSubmission1Id() { return submission1Id; }
    public void setSubmission1Id(Long submission1Id) { this.submission1Id = submission1Id; }

    public Long getSubmission2Id() { return submission2Id; }
    public void setSubmission2Id(Long submission2Id) { this.submission2Id = submission2Id; }

    public JsonNode getDiffStringBlocks() { return diffStringBlocks; }
    public void setDiffStringBlocks(JsonNode diffStringBlocks) { this.diffStringBlocks = diffStringBlocks; }

    public JsonNode getDiffStringBlocksNormalized() { return diffStringBlocksNormalized; }
    public void setDiffStringBlocksNormalized(JsonNode diffStringBlocksNormalized) {
        this.diffStringBlocksNormalized = diffStringBlocksNormalized;
    }

    public JsonNode getDiffCharBlocks() { return diffCharBlocks; }
    public void setDiffCharBlocks(JsonNode diffCharBlocks) { this.diffCharBlocks = diffCharBlocks; }

    public JsonNode getDiffCharBlocksNormalized() { return diffCharBlocksNormalized; }
    public void setDiffCharBlocksNormalized(JsonNode diffCharBlocksNormalized) {
        this.diffCharBlocksNormalized = diffCharBlocksNormalized;
    }

    public int getMatchPercent() { return matchPercent; }
    public void setMatchPercent(int matchPercent) { this.matchPercent = matchPercent; }

    public int getMatchPercentNormalized() { return matchPercentNormalized; }
    public void setMatchPercentNormalized(int matchPercentNormalized) {
        this.matchPercentNormalized = matchPercentNormalized;
    }

    public boolean getPlagiarism() { return plagiarism; }
    public void setPlagiarism(boolean plagiarism) { this.plagiarism = plagiarism; }
}