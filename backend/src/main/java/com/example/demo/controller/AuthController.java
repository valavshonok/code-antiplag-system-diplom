package com.example.demo.controller;

import com.example.demo.dto.AuthResponse;
import com.example.demo.entities.SubmissionComparison;
import com.example.demo.entities.User;
import com.example.demo.repositories.UserRepository;
import com.example.demo.security.JwtUtils;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepo;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;
    private final UserRepository userRepository;

    public AuthController(UserRepository userRepo, PasswordEncoder passwordEncoder, JwtUtils jwtUtils, UserRepository userRepository) {
        this.userRepo = userRepo;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtils = jwtUtils;
        this.userRepository = userRepository;
    }


    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> body) {
        String username = body.get("username");
        String email = body.get("email");
        String password = body.get("password");

        if (userRepo.existsByUsername(username)) {
            return ResponseEntity.badRequest().body("Пользователь уже существует");
        }

        User user = new User();
        user.setUsername(username);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password));
        userRepo.save(user);

        String token = jwtUtils.generateJwt(username);

        User resUser = userRepo.findByUsername(username).orElse(null);

        return ResponseEntity.ok(new AuthResponse(token, resUser));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        String username = body.get("username");
        String password = body.get("password");

        User user = userRepo.findByUsername(username).orElse(null);
        if (user == null || !passwordEncoder.matches(password, user.getPassword())) {
            return ResponseEntity.status(401).body("Неверное имя пользователь или пароль");
        }

        String token = jwtUtils.generateJwt(username);

        return ResponseEntity.ok(new AuthResponse(token, user));
    }

    

    @GetMapping("/whoami")
    public ResponseEntity<?> whoami(@RequestHeader("Authorization") String authHeader) {
        User currentUser = getCurrentUser(authHeader);

        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
        
        String token = authHeader.replace("Bearer ", "");

        return ResponseEntity.ok(new AuthResponse(token, currentUser));
    }

    private User getCurrentUser(String authHeader) {
        String token = authHeader.replace("Bearer ", "");
        String username = jwtUtils.getUsernameFromJwt(token);
        return userRepository.findByUsername(username)
                .orElse(null);
    }
}
