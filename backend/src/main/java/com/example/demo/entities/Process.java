package com.example.demo.entities;

public class Process {
    private Long id;
    private Long contestId;
    private String processType;
    private String status;
    private int progress;
    private String message;

    public Process() {}

    public Process(Long id, Long contestId, String processType,
                   String status, int progress, String message) {
        this.id = id;
        this.contestId = contestId;
        this.processType = processType;
        this.status = status;
        this.progress = progress;
        this.message = message;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getContestId() { return contestId; }
    public void setContestId(Long contestId) { this.contestId = contestId; }

    public String getProcessType() { return processType; }
    public void setProcessType(String processType) { this.processType = processType; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public int getProgress() { return progress; }
    public void setProgress(int progress) { this.progress = progress; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
}
