package com.example.demo.dto;

import java.io.Serializable;

public class SubmissionComparisonSummary implements Serializable {

    private static final long serialVersionUID = 1L;

    private Long id;
    private Long processId;
    private Long submission1Id;
    private Long submission2Id;
    private int matchPercent;
    private int matchPercentNormalized;
    private boolean plagiarism;

    public SubmissionComparisonSummary() {
    }

    public SubmissionComparisonSummary(Long id,
                                       Long processId,
                                       Long submission1Id,
                                       Long submission2Id,
                                       int matchPercent,
                                       int matchPercentNormalized,
                                       boolean plagiarism) {
        this.id = id;
        this.processId = processId;
        this.submission1Id = submission1Id;
        this.submission2Id = submission2Id;
        this.matchPercent = matchPercent;
        this.matchPercentNormalized = matchPercentNormalized;
        this.plagiarism = plagiarism;
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

    public Long getSubmission1Id() {
        return submission1Id;
    }

    public void setSubmission1Id(Long submission1Id) {
        this.submission1Id = submission1Id;
    }

    public Long getSubmission2Id() {
        return submission2Id;
    }

    public void setSubmission2Id(Long submission2Id) {
        this.submission2Id = submission2Id;
    }

    public int getMatchPercent() {
        return matchPercent;
    }

    public void setMatchPercent(int matchPercent) {
        this.matchPercent = matchPercent;
    }

    public int getMatchPercentNormalized() {
        return matchPercentNormalized;
    }

    public void setMatchPercentNormalized(int matchPercentNormalized) {
        this.matchPercentNormalized = matchPercentNormalized;
    }

    public boolean getPlagiarism() {
        return plagiarism;
    }

    public void setPlagiarism(boolean plagiarism) {
        this.plagiarism = plagiarism;
    }
}