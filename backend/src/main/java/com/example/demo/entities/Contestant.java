package com.example.demo.entities;

public class Contestant {
    private Long id;
    private Long contestId;
    private String name;

    public Contestant() {}

    public Contestant(Long id, Long contestId, String name) {
        this.id = id;
        this.contestId = contestId;
        this.name = name;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getContestId() { return contestId; }
    public void setContestId(Long contestId) { this.contestId = contestId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
}
