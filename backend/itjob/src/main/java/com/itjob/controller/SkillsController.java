package com.itjob.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.itjob.entities.Skills;
import com.itjob.services.AdminService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/skills")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class SkillsController {

    private final AdminService adminService;

    @GetMapping
    public ResponseEntity<List<Skills>> getAllSkills(
            @RequestParam(required = false) String search
    ) {
        if (search != null && !search.isBlank()) {
            return ResponseEntity.ok(adminService.searchSkills(search));
        }
        return ResponseEntity.ok(adminService.getAllSkills());
    }
}
