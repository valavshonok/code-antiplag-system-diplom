package com.example.demo.dto;

import java.util.Map;

public class ContestRequest {

    private String name;
    private Map<String, Object> config;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Map<String, Object> getConfig() {
        return config;
    }

    public void setConfig(Map<String, Object> config) {
        this.config = config;
    }
}
