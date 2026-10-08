package com.example.demo.controller;

import com.example.demo.entities.Contest;
import com.example.demo.entities.Contestant;
import com.example.demo.entities.Process;
import com.example.demo.entities.User;
import com.example.demo.entities.Submission;
import com.example.demo.entities.SubmissionComparison;
import com.example.demo.repositories.UserRepository;
import com.example.demo.service.ContestService;
import com.example.demo.service.ContestantService;
import com.example.demo.service.ProcessService;
import com.example.demo.service.SubmissionComparisonService;
import com.example.demo.service.SubmissionService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import com.example.demo.security.JwtUtils;

import com.example.demo.service.SubmissionConditionService;
import com.example.demo.entities.SubmissionCondition;

import com.example.demo.dto.ContestRequest;
import com.example.demo.dto.StopProcessRequest;
import com.example.demo.dto.SubmissionComparisonSummary;

import java.util.List;

@RestController
@RequestMapping("/api/contests")
public class ContestController {

    private final ContestService contestService;
    private final ContestantService contestantService;
    private final SubmissionService submissionService;
    private final SubmissionComparisonService comparisonService;
    private final ProcessService processService;
    private final JwtUtils jwtUtils;
    private final SubmissionConditionService conditionService;

    private final UserRepository userRepository;

    public ContestController(
            ContestService contestService,
            ContestantService contestantService,
            SubmissionService submissionService,
            SubmissionComparisonService comparisonService,
            ProcessService processService,
            JwtUtils jwtUtils,
            UserRepository userRepository,
            SubmissionConditionService conditionService

    ) {
        this.contestService = contestService;
        this.contestantService = contestantService;
        this.submissionService = submissionService;
        this.comparisonService = comparisonService;
        this.processService = processService;
        this.jwtUtils = jwtUtils;
        this.userRepository = userRepository;
        this.conditionService = conditionService;
    }

    @PostMapping
    public ResponseEntity<Contest> createContest(@RequestHeader("Authorization") String authHeader, @RequestBody ContestRequest request) {
        User currentUser = getCurrentUser(authHeader);

        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }

        Contest contest = contestService.create(currentUser, request.getName(), request.getConfig());
        return ResponseEntity.ok(contest);
    }

    @PutMapping("/{contestId}")
    public ResponseEntity<Contest> updateContest(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long contestId,
            @RequestBody ContestRequest request
    ) {
        User currentUser = getCurrentUser(authHeader);

        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }

        Contest updated = contestService.update(currentUser, contestId, request.getName(), request.getConfig());
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{contestId}")
    public ResponseEntity<Contest> deleteContest(@RequestHeader("Authorization") String authHeader,
                                                 @PathVariable Long contestId) {

        User currentUser = getCurrentUser(authHeader);

        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }

        Contest deleted = contestService.delete(currentUser, contestId);
        return ResponseEntity.ok(deleted);
    }

    @PostMapping("/{contestId}/processes/import")
    public ResponseEntity<Process> startImport(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long contestId,
            @RequestParam String apiKey,
            @RequestParam String apiSecret,
            @RequestParam String cfContestId,
            @RequestParam MultipartFile file
    ) throws Exception {
        User currentUser = getCurrentUser(authHeader);

        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }

        Process process = contestService.startImport(
                currentUser,
                contestId,
                apiKey,
                apiSecret,
                cfContestId,
                file.getBytes()
        );
        return ResponseEntity.ok(process);
    }

    @PostMapping("/{contestId}/processes/import-yandex-contest")
    public ResponseEntity<Process> startImportYandexContest(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long contestId,
            @RequestParam MultipartFile file
    ) throws Exception {
        User currentUser = getCurrentUser(authHeader);

        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }

        Process process = contestService.startImportYandexContest(
                currentUser,
                contestId,
                file.getBytes()
        );
        return ResponseEntity.ok(process);
    }

    @PostMapping("/{contestId}/processes/comparison")
    public ResponseEntity<Process> startComparison(@RequestHeader("Authorization") String authHeader,
                                                   @PathVariable Long contestId) {
        User currentUser = getCurrentUser(authHeader);

        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }

        Process process = contestService.startComparison(currentUser, contestId);
        return ResponseEntity.ok(process);
    }

    @PostMapping("/{contestId}/processes/condition")
    public ResponseEntity<Process> startCondition(@PathVariable Long contestId) {
        Process process = contestService.startCondition(contestId);
        return ResponseEntity.ok(process);
    }

    @PostMapping("/{contestId}/processes/stop")
    public ResponseEntity<Void> stopProcess(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long contestId,
            @RequestBody StopProcessRequest request
    ) {
        User currentUser = getCurrentUser(authHeader);

        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }

        if (request.getProcessId() == null) {
            throw new IllegalArgumentException("processId обязателен");
        }
        processService.stopProcess(currentUser, contestId, request.getProcessId());
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{contestId}")
    public ResponseEntity<Contest> getContest(@RequestHeader("Authorization") String authHeader,
                                              @PathVariable Long contestId) {
        User currentUser = getCurrentUser(authHeader);

        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }

        Contest contest = contestService.getById(currentUser, contestId);
        return ResponseEntity.ok(contest);
    }

    @GetMapping
    public ResponseEntity<List<Contest>> getAllContests(@RequestHeader("Authorization") String authHeader) {
        User currentUser = getCurrentUser(authHeader);

        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }

        List<Contest> contests = contestService.getAll(currentUser);
        return ResponseEntity.ok(contests);
    }

    @GetMapping("/{contestId}/submissions")
    public ResponseEntity<List<Submission>> getAllSubmissions(@RequestHeader("Authorization") String authHeader,
                                                              @PathVariable Long contestId) {
        User currentUser = getCurrentUser(authHeader);

        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }

        List<Submission> submissions = submissionService.getAllSubmissionsByContestId(currentUser, contestId);
        return ResponseEntity.ok(submissions);
    }

    @GetMapping("/{contestId}/contestants")
    public ResponseEntity<List<Contestant>> getAllContestants(@RequestHeader("Authorization") String authHeader,
                                                              @PathVariable Long contestId) {
        User currentUser = getCurrentUser(authHeader);

        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }

        List<Contestant> contestants = contestantService.getAllContestantsByContestId(currentUser, contestId);
        return ResponseEntity.ok(contestants);
    }

    @GetMapping("/{contestId}/comparisons/full")
    public ResponseEntity<List<SubmissionComparison>> getAllComparisonsFull(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long contestId) {
        User currentUser = getCurrentUser(authHeader);

        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }


        return ResponseEntity.ok(
                comparisonService.getAllComparisonsByContestId(currentUser, contestId)
        );
    }

    @GetMapping("/{contestId}/comparisons")
    public ResponseEntity<List<SubmissionComparisonSummary>> getAllComparisons(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long contestId) {
        User currentUser = getCurrentUser(authHeader);

        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }


        return ResponseEntity.ok(
                comparisonService.getAllComparisonsSummaryByContestId(currentUser, contestId)
        );
    }

    @GetMapping("/{contestId}/comparisons/{comparisonId}")
    public ResponseEntity<SubmissionComparison> getComparison(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long contestId,
            @PathVariable Long comparisonId
    ) {
        User currentUser = getCurrentUser(authHeader);

        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }

        SubmissionComparison comparison =
                comparisonService.getComparisonByComparisonId(currentUser, comparisonId);
        return ResponseEntity.ok(comparison);
    }


    @PutMapping("/{contestId}/comparisons/{comparisonId}/plagiarism")
    public ResponseEntity<SubmissionComparison> setPlagiarismComparison(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long contestId,
            @PathVariable Long comparisonId,
            @RequestBody Boolean plagiarism
    ) {
        User currentUser = getCurrentUser(authHeader);

        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }

        SubmissionComparison updated = comparisonService.setPlagiarism(currentUser, contestId, comparisonId, plagiarism);
        return ResponseEntity.ok(updated);
    }

    @GetMapping("/{contestId}/conditions")
    public ResponseEntity<List<SubmissionCondition>> getAllConditions(
            @PathVariable Long contestId
    ) {
        return ResponseEntity.ok(
                conditionService.getAllByContestId(contestId)
        );
    }
    @PutMapping("/{contestId}/conditions/{submissionConditionId}/expert-verdict")
    public ResponseEntity<Void> setExpertVerdict(
            @PathVariable Long contestId,
            @PathVariable Long submissionConditionId,
            @RequestParam int conditionIndex,
            @RequestBody Boolean expertVerdict
    ) {

        conditionService.setExpertVerdict(
                contestId,
                submissionConditionId,
                conditionIndex,
                expertVerdict
        );

        return ResponseEntity.ok().build();
    }

    @GetMapping("/{contestId}/processes")
    public ResponseEntity<List<Process>> getAllProcesses(@RequestHeader("Authorization") String authHeader,
                                                         @PathVariable Long contestId) {
        User currentUser = getCurrentUser(authHeader);

        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }

        List<Process> processes = processService.getAllProcessesByContestId(currentUser, contestId);
        return ResponseEntity.ok(processes);
    }

    private User getCurrentUser(String authHeader) {
        String token = authHeader.replace("Bearer ", "");
        String username = jwtUtils.getUsernameFromJwt(token);
        return userRepository.findByUsername(username)
                .orElse(null);
    }
}