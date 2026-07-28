package com.itjob.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.itjob.dto.ResumeData;
import com.itjob.services.AIService;
import com.itjob.services.JwtService;

import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/api/v1/ai")
@RequiredArgsConstructor
public class AIController {

    private final AIService aiService;
    private final JwtService jwtService;

    @PostMapping("/parse-resume")
    public ResponseEntity<?> parseResume(
            @RequestParam("file") MultipartFile file,
            HttpServletRequest request) {

            System.out.println("AI Controller calls");

        // --- Manual JWT validation (bypasses Spring Security filter chain for multipart) ---
        System.out.println("1. Controller entered");

        String authHeader = request.getHeader("Authorization");
        System.out.println("2. Authorization = " + authHeader);

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            log.warn("[AI] No Authorization header");
            return ResponseEntity.status(401).body("{\"error\":\"Authentication required\"}");
        }

        String accessToken = authHeader.substring(7);
        try {
            System.out.println("3. Before JWT validation");

            String username = jwtService.extractUsername(accessToken);
            System.out.println("4. Username = " + username);
            if (username == null || jwtService.isTokenExpired(accessToken)) {
                log.warn("[AI] Invalid or expired token");
                return ResponseEntity.status(401).body("{\"error\":\"Invalid or expired token\"}");
            }
            log.info("[AI] Token valid for user: {}", username);
        } catch (ExpiredJwtException e) {
            log.warn("[AI] Token expired");
            return ResponseEntity.status(401).body("{\"error\":\"TOKEN_EXPIRED\"}");
        } catch (JwtException e) {
            log.warn("[AI] Token invalid: {}", e.getMessage());
            return ResponseEntity.status(401).body("{\"error\":\"INVALID_TOKEN\"}");
        }
        // --------------------------------------------------------------------------

        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body("{\"error\":\"Empty file\"}");
        }

        // Validate file type
        String contentType = file.getContentType();
        if (contentType == null) {
            contentType = "";
        }
        if (!contentType.contains("pdf") && !contentType.contains("doc") && !contentType.contains("word")) {
            return ResponseEntity.badRequest().body("{\"error\":\"Unsupported file type. Use PDF or DOC.\"}");
        }

        try {
            System.out.println("5. Before AI Service");
            ResumeData resumeData = aiService.parseResume(file);
            System.out.println("6. AI Service completed");
            return ResponseEntity.ok(resumeData);
        } catch (Exception e) {
            log.error("Resume parsing failed: {}", e.getMessage());
            return ResponseEntity.status(502).body("{\"error\":\"" + e.getMessage().replace("\"", "\\\"") + "\"}");
        }
    }
}
