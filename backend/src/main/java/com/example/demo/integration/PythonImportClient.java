package com.example.demo.integration;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

@Component
public class PythonImportClient {

    private final RestTemplate restTemplate;

    @Value("${python.service.url}")
    private String pythonUrl;

    public PythonImportClient(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public void startImport(
            Long processId,
            String apiKey,
            String apiSecret,
            String contestId,
            byte[] fileBytes
    ) {

        String url = pythonUrl + "/start/import_contest_cf/" + processId;

        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("cf_api_key", apiKey);
        body.add("cf_api_secret", apiSecret);
        body.add("cf_contest_id", contestId);

        ByteArrayResource resource = new ByteArrayResource(fileBytes) {
            @Override
            public String getFilename() {
                return "upload.zip";
            }
        };

        body.add("file", resource);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);

        HttpEntity<MultiValueMap<String, Object>> request =
                new HttpEntity<>(body, headers);

        ResponseEntity<String> response =
                restTemplate.postForEntity(url, request, String.class);

        if (!response.getStatusCode().is2xxSuccessful()) {
            throw new RuntimeException("Python import failed");
        }
    }

    public void startImportYandexContest(
            Long processId,
            byte[] fileBytes
    ) {

        String url = pythonUrl + "/start/import_yandex_contest/" + processId;

        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        ByteArrayResource resource = new ByteArrayResource(fileBytes) {
            @Override
            public String getFilename() {
                return "upload.zip";
            }
        };

        body.add("file", resource);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);

        HttpEntity<MultiValueMap<String, Object>> request =
                new HttpEntity<>(body, headers);

        ResponseEntity<String> response =
                restTemplate.postForEntity(url, request, String.class);

        if (!response.getStatusCode().is2xxSuccessful()) {
            throw new RuntimeException("Python import failed");
        }
    }

    public void startComparison(Long processId) {
        String url = pythonUrl + "/start/comparison/" + processId;

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Void> request = new HttpEntity<>(headers);

        ResponseEntity<String> response = restTemplate.postForEntity(url, request, String.class);

        if (!response.getStatusCode().is2xxSuccessful()) {
            throw new RuntimeException("Python comparison process failed");
        }
    }

    

    public void startCondition(Long processId) {
        String url = pythonUrl + "/start/condition/" + processId;

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Void> request = new HttpEntity<>(headers);

        ResponseEntity<String> response = restTemplate.postForEntity(url, request, String.class);

        if (!response.getStatusCode().is2xxSuccessful()) {
            throw new RuntimeException("Python condition process failed");
        }
    }


    public void stopProcess(Long processId) {
        String url = pythonUrl + "/stop/" + processId;

        ResponseEntity<String> response = restTemplate.postForEntity(url, null, String.class);
        if (!response.getStatusCode().is2xxSuccessful()) {
            throw new RuntimeException("Python import failed");
        }
    }

}
