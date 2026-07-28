package com.itjob.controller;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.itjob.dto.AdminContactResponse;
import com.itjob.dto.AdminDashboardResponse;
import com.itjob.dto.AdminJobResponse;
import com.itjob.dto.AdminUserResponse;
import com.itjob.dto.CategoryRequest;
import com.itjob.dto.SkillRequest;
import com.itjob.dto.SystemConfigRequest;
import com.itjob.entities.Category;
import com.itjob.entities.Skills;
import com.itjob.entities.SystemConfig;

import com.itjob.services.AdminService;
import com.itjob.services.EmailService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class AdminController {

    private final AdminService adminService;
    private final EmailService emailService;

    // ========== Dashboard ==========

    @GetMapping("/dashboard")
    public ResponseEntity<AdminDashboardResponse> getDashboard() {
        return ResponseEntity.ok(adminService.getDashboardStats());
    }

    // ========== User Management ==========

    @GetMapping("/users")
    public ResponseEntity<List<AdminUserResponse>> getAllUsers(
            @RequestParam(required = false) String search
    ) {
        if (search != null && !search.isBlank()) {
            return ResponseEntity.ok(adminService.searchUsers(search));
        }
        return ResponseEntity.ok(adminService.getAllUsers());
    }

    @DeleteMapping("/users/{userId}")
    public ResponseEntity<String> deleteUser(@PathVariable UUID userId) {
        adminService.deleteUser(userId);
        return ResponseEntity.ok("User deleted successfully");
    }

    // ========== Job Moderation ==========

    @GetMapping("/jobs")
    public ResponseEntity<Page<AdminJobResponse>> getAllJobs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir
    ) {
        Sort sort = sortDir.equalsIgnoreCase("asc")
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        return ResponseEntity.ok(adminService.getAllJobs(pageable));
    }

    @GetMapping("/jobs/pending")
    public ResponseEntity<List<AdminJobResponse>> getPendingJobs() {
        return ResponseEntity.ok(adminService.getPendingJobs());
    }

    @PutMapping("/jobs/{jobId}/approve")
    public ResponseEntity<String> approveJob(@PathVariable UUID jobId) {
        adminService.approveJob(jobId);
        return ResponseEntity.ok("Job approved successfully");
    }

    @PutMapping("/jobs/{jobId}/reject")
    public ResponseEntity<String> rejectJob(@PathVariable UUID jobId) {
        adminService.rejectJob(jobId);
        return ResponseEntity.ok("Job rejected and closed");
    }

    @PutMapping("/jobs/{jobId}/feature")
    public ResponseEntity<String> toggleFeatured(@PathVariable UUID jobId) {
        adminService.toggleFeatured(jobId);
        return ResponseEntity.ok("Featured status toggled");
    }

    @DeleteMapping("/jobs/{jobId}")
    public ResponseEntity<String> deleteJob(@PathVariable UUID jobId) {
        adminService.deleteJob(jobId);
        return ResponseEntity.ok("Job deleted successfully");
    }

    // ========== Categories ==========

    @GetMapping("/categories")
    public ResponseEntity<List<Category>> getAllCategories() {
        return ResponseEntity.ok(adminService.getAllCategories());
    }

    @PostMapping("/categories")
    public ResponseEntity<Category> createCategory(@RequestBody CategoryRequest request) {
        return ResponseEntity.ok(adminService.createCategory(request));
    }

    @PutMapping("/categories/{categoryId}")
    public ResponseEntity<Category> updateCategory(
            @PathVariable UUID categoryId,
            @RequestBody CategoryRequest request
    ) {
        return ResponseEntity.ok(adminService.updateCategory(categoryId, request));
    }

    @DeleteMapping("/categories/{categoryId}")
    public ResponseEntity<String> deleteCategory(@PathVariable UUID categoryId) {
        adminService.deleteCategory(categoryId);
        return ResponseEntity.ok("Category deleted successfully");
    }

    // ========== Contact Management ==========

    @GetMapping("/contacts")
    public ResponseEntity<List<AdminContactResponse>> getAllContacts(
            @RequestParam(required = false, defaultValue = "false") boolean pendingOnly
    ) {
        if (pendingOnly) {
            return ResponseEntity.ok(adminService.getPendingContacts());
        }
        return ResponseEntity.ok(adminService.getAllContacts());
    }

    @PutMapping("/contacts/{contactId}/resolve")
    public ResponseEntity<String> resolveContact(@PathVariable UUID contactId) {
        adminService.resolveContact(contactId);
        return ResponseEntity.ok("Contact resolved successfully");
    }

    @DeleteMapping("/contacts/{contactId}")
    public ResponseEntity<String> deleteContact(@PathVariable UUID contactId) {
        adminService.deleteContact(contactId);
        return ResponseEntity.ok("Contact deleted successfully");
    }

    // ========== System Configuration ==========

    @GetMapping("/config")
    public ResponseEntity<List<SystemConfig>> getAllConfigs() {
        return ResponseEntity.ok(adminService.getAllConfigs());
    }

    @PutMapping("/config/{configId}")
    public ResponseEntity<SystemConfig> updateConfig(
            @PathVariable UUID configId,
            @RequestBody SystemConfigRequest request
    ) {
        return ResponseEntity.ok(adminService.updateConfig(configId, request));
    }

    // ========== Skills Management ==========

    @GetMapping("/skills")
    public ResponseEntity<List<Skills>> getAllSkills(
            @RequestParam(required = false) String search
    ) {
        if (search != null && !search.isBlank()) {
            return ResponseEntity.ok(adminService.searchSkills(search));
        }
        return ResponseEntity.ok(adminService.getAllSkills());
    }

    @PostMapping("/skills")
    public ResponseEntity<Skills> createSkill(@RequestBody @jakarta.validation.Valid SkillRequest request) {
        return ResponseEntity.ok(adminService.createSkill(request));
    }

    @PutMapping("/skills/{skillId}")
    public ResponseEntity<Skills> updateSkill(
            @PathVariable Long skillId,
            @RequestBody @jakarta.validation.Valid SkillRequest request
    ) {
        return ResponseEntity.ok(adminService.updateSkill(skillId, request));
    }

    @DeleteMapping("/skills/{skillId}")
    public ResponseEntity<String> deleteSkill(@PathVariable Long skillId) {
        adminService.deleteSkill(skillId);
        return ResponseEntity.ok("Skill deleted successfully");
    }

    // ========== Test Email ==========

    @PostMapping("/test-email")
    public ResponseEntity<String> sendTestEmail(
            @RequestBody Map<String, String> request
    ) {
        String toEmail = request.get("email");
        if (toEmail == null || toEmail.isBlank()) {
            return ResponseEntity.badRequest().body("Email is required");
        }
        try {
            emailService.sendTestEmail(toEmail);
            return ResponseEntity.ok("Test email sent successfully to " + toEmail);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to send test email: " + e.getMessage());
        }
    }

    // ========== Seed Admin (for initial setup) ==========

    @PostMapping("/seed-admin")
    public ResponseEntity<String> seedAdmin() {
        try {
            adminService.seedAdminUser();
            return ResponseEntity.ok("Admin user seeded successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
