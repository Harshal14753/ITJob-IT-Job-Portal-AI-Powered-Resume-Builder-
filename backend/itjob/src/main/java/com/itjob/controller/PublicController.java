package com.itjob.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.itjob.dto.ContactRequest;
import com.itjob.entities.SystemConfig;
import com.itjob.services.AdminService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/public")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class PublicController {

    private final AdminService adminService;

    @GetMapping("/config")
    public ResponseEntity<Map<String, String>> getPublicConfig() {
        List<SystemConfig> allConfigs = adminService.getAllConfigs();
        Map<String, String> configMap = new HashMap<>();

        // Only expose non-sensitive, public-facing configs
        String[] publicKeys = {
            "general_website_name",
            "general_company_name",
            "general_support_email",
            "general_contact_number",
            "general_time_zone"
        };

        for (String key : publicKeys) {
            configMap.put(key, "");
        }

        for (SystemConfig config : allConfigs) {
            if (configMap.containsKey(config.getConfigKey())) {
                configMap.put(config.getConfigKey(), config.getConfigValue());
            }
        }

        return ResponseEntity.ok(configMap);
    }

    @PostMapping("/contact")
    public ResponseEntity<String> submitContact(@Valid @RequestBody ContactRequest request) {
        adminService.createContact(request);
        return ResponseEntity.ok("Thank you for your message! We will get back to you soon.");
    }
}
