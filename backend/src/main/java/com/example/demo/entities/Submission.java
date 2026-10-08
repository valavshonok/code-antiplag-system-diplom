package com.example.demo.entities;

public class Submission {
    private Long id;
    private Long contestantId;
    private String code;
    private String normalizedCode;
    private String verdict;
    private String problem;
    private String language;

    public Submission() {}

    public Submission(Long id, Long contestantId, String code, String normalizedCode,
                      String verdict, String problem, String language) {
        this.id = id;
        this.contestantId = contestantId;
        this.code = code;
        this.normalizedCode = normalizedCode;
        this.verdict = verdict;
        this.problem = problem;
        this.language = language;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getContestantId() { return contestantId; }
    public void setContestantId(Long contestantId) { this.contestantId = contestantId; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getNormalizedCode() { return normalizedCode; }
    public void setNormalizedCode(String normalizedCode) { this.normalizedCode = normalizedCode; }

    public String getVerdict() { return verdict; }
    public void setVerdict(String verdict) { this.verdict = verdict; }

    public String getProblem() { return problem; }
    public void setProblem(String problem) { this.problem = problem; }

    public String getLanguage() { return language; }
    public void setLanguage(String language) { this.language = language; }
}
