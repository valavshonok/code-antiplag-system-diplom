package com.example.demo.entities;

import java.util.Map;

public class Contest {
    private Long id;
    private String name;
    private Map<String, Object> config;
    private Long author_id;

    public Contest() {}

    public Contest(Long id, String name, Map<String, Object> config, Long author_id) {
        this.id = id;
        this.name = name;
        this.config = config;
        this.author_id = author_id;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public Map<String, Object> getConfig() { return config; }
    public void setConfig(Map<String, Object> config) { this.config = config; }

    public Long getAuthorId(){ return author_id;}
    public void setAuthorId(Long author_id) {this.author_id = author_id;}
}