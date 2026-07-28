package com.itjob.services.impl;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.itjob.dto.AdminContactResponse;
import com.itjob.dto.AdminDashboardResponse;
import com.itjob.dto.AdminJobResponse;
import com.itjob.dto.AdminUserResponse;
import com.itjob.dto.CategoryRequest;
import com.itjob.dto.SystemConfigRequest;
import com.itjob.entities.Application;
import com.itjob.entities.Candidate;
import com.itjob.entities.Category;
import com.itjob.entities.Contact;
import com.itjob.entities.Skills;
import com.itjob.entities.Job;
import com.itjob.entities.Recruiter;
import com.itjob.entities.SystemConfig;
import com.itjob.entities.User;
import com.itjob.exception.ResourceNotFoundException;
import com.itjob.repository.AIApplySettingsRepo;
import com.itjob.repository.ApplicationRepo;
import com.itjob.repository.CandidateRepo;
import com.itjob.repository.CategoryRepo;
import com.itjob.repository.ContactRepo;
import com.itjob.repository.JobRepo;
import com.itjob.repository.SkillsRepo;
import com.itjob.repository.RecruiterRepo;
import com.itjob.repository.SystemConfigRepo;
import com.itjob.repository.UserRepo;
import com.itjob.services.AdminService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService {

    private final UserRepo userRepo;
    private final CandidateRepo candidateRepo;
    private final RecruiterRepo recruiterRepo;
    private final JobRepo jobRepo;
    private final ApplicationRepo applicationRepo;
    private final CategoryRepo categoryRepo;
    private final ContactRepo contactRepo;
    private final SkillsRepo skillsRepo;
    private final SystemConfigRepo systemConfigRepo;
    private final AIApplySettingsRepo aiApplySettingsRepo;

    @Override
    public AdminDashboardResponse getDashboardStats() {
        long totalUsers = userRepo.count();
        long totalCandidates = candidateRepo.count();
        long totalRecruiters = recruiterRepo.count();
        long totalJobs = jobRepo.count();
        long totalApplications = applicationRepo.count();
        long totalContacts = contactRepo.count();
        long pendingContacts = contactRepo.findByResolvedOrderByCreatedAtDesc(false).size();
        long totalCategories = categoryRepo.count();
        long totalSkills = skillsRepo.count();

        // Count job stats using the new job settings fields
        List<Job> allJobs = jobRepo.findAll();
        long activeJobs = allJobs.stream().filter(Job::isActive).count();
        long closedJobs = allJobs.stream().filter(j -> !j.isActive()).count();
        long pendingJobs = allJobs.stream().filter(j -> !j.isApproved() && j.isActive()).count();
        long featuredJobs = allJobs.stream().filter(Job::isFeatured).count();

        // New users in the last 7 days (using OTP creation time as approximation)
        LocalDateTime weekAgo = LocalDateTime.now().minusDays(7);
        long newUsersThisWeek = userRepo.findAll().stream()
                .filter(u -> u.getExpiresAt() != null && u.getExpiresAt().isAfter(weekAgo))
                .count();

        // AI Auto-Apply stats — using efficient COUNT queries
        long totalAutoAppliedJobs = applicationRepo.countAutoApplied();
        long activeAutoApplyUsers = aiApplySettingsRepo.countEnabled();

        return AdminDashboardResponse.builder()
                .totalUsers(totalUsers)
                .totalCandidates(totalCandidates)
                .totalRecruiters(totalRecruiters)
                .totalJobs(totalJobs)
                .totalApplications(totalApplications)
                .totalContacts(totalContacts)
                .pendingContacts(pendingContacts)
                .totalCategories(totalCategories)
                .totalSkills(totalSkills)
                .newUsersThisWeek(newUsersThisWeek)
                .activeJobs(activeJobs)
                .closedJobs(closedJobs)
                .pendingJobs(pendingJobs)
                .featuredJobs(featuredJobs)
                .totalAutoAppliedJobs(totalAutoAppliedJobs)
                .activeAutoApplyUsers(activeAutoApplyUsers)
                .build();
    }

    @Override
    public List<AdminUserResponse> getAllUsers() {
        List<User> users = userRepo.findAll();
        List<AdminUserResponse> responses = new ArrayList<>();

        for (User user : users) {
            responses.add(buildUserResponse(user));
        }

        return responses;
    }

    @Override
    public List<AdminUserResponse> searchUsers(String query) {
        List<User> users = userRepo.findAll();
        String lowerQuery = query.toLowerCase();

        return users.stream()
                .filter(u -> {
                    // Search by email
                    if (u.getEmail().toLowerCase().contains(lowerQuery)) return true;

                    // Search by name (Candidate)
                    if (u instanceof Candidate) {
                        Candidate c = (Candidate) u;
                        if (c.getFullName() != null && c.getFullName().toLowerCase().contains(lowerQuery)) return true;
                    }

                    // Search by company name (Recruiter)
                    if (u instanceof Recruiter) {
                        Recruiter r = (Recruiter) u;
                        if (r.getCompanyName() != null && r.getCompanyName().toLowerCase().contains(lowerQuery)) return true;
                    }

                    return false;
                })
                .map(this::buildUserResponse)
                .toList();
    }

    @Override
    @Transactional
    public void deleteUser(UUID userId) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (user.getRole() == com.itjob.entities.Enums.Role.ADMIN) {
            throw new RuntimeException("Cannot delete admin users");
        }

        userRepo.delete(user);
    }

    // ========== Job Moderation ==========

    @Override
    public Page<AdminJobResponse> getAllJobs(Pageable pageable) {
        Page<Job> jobPage = jobRepo.findAll(pageable);
        List<AdminJobResponse> responses = jobPage.getContent().stream()
                .map(this::buildJobResponse)
                .toList();
        return new PageImpl<>(responses, pageable, jobPage.getTotalElements());
    }

    @Override
    public List<AdminJobResponse> getPendingJobs() {
        List<Job> pendingJobs = jobRepo.findPendingJobs();

        return pendingJobs.stream().map(this::buildJobResponse).toList();
    }

    @Override
    @Transactional
    public void approveJob(UUID jobId) {
        Job job = jobRepo.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found"));

        job.setApproved(true);
        jobRepo.save(job);
    }

    @Override
    @Transactional
    public void rejectJob(UUID jobId) {
        Job job = jobRepo.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found"));

        // Soft delete — mark as inactive so it's not visible to candidates
        job.setActive(false);
        jobRepo.save(job);
    }

    @Override
    @Transactional
    public void toggleFeatured(UUID jobId) {
        Job job = jobRepo.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found"));

        if (job.isFeatured()) {
            // Un-feature
            job.setFeatured(false);
            job.setFeaturedUntil(null);
        } else {
            // Feature with duration from config
            String featuredDurationStr = systemConfigRepo.findByConfigKey("job_featured_duration")
                    .map(SystemConfig::getConfigValue)
                    .orElse("7");
            int featuredDays;
            try {
                featuredDays = Integer.parseInt(featuredDurationStr);
            } catch (NumberFormatException e) {
                featuredDays = 7;
            }
            job.setFeatured(true);
            job.setFeaturedUntil(LocalDateTime.now().plusDays(featuredDays));
        }

        jobRepo.save(job);
    }

    @Override
    @Transactional
    public void deleteJob(UUID jobId) {
        Job job = jobRepo.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found"));
        jobRepo.delete(job);
    }

    // ========== Categories ==========

    @Override
    public List<Category> getAllCategories() {
        return categoryRepo.findAll();
    }

    @Override
    public Category createCategory(CategoryRequest request) {
        if (categoryRepo.existsByName(request.getName())) {
            throw new RuntimeException("Category with this name already exists");
        }

        Category category = new Category();
        category.setName(request.getName());
        category.setDescription(request.getDescription());
        category.setActive(request.isActive());

        return categoryRepo.save(category);
    }

    @Override
    public Category updateCategory(UUID categoryId, CategoryRequest request) {
        Category category = categoryRepo.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        category.setName(request.getName());
        category.setDescription(request.getDescription());
        category.setActive(request.isActive());

        return categoryRepo.save(category);
    }

    @Override
    @Transactional
    public void deleteCategory(UUID categoryId) {
        Category category = categoryRepo.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
        categoryRepo.delete(category);
    }

    // ========== Contact Management ==========

    @Override
    public List<AdminContactResponse> getAllContacts() {
        List<Contact> contacts = contactRepo.findAllByOrderByCreatedAtDesc();
        return contacts.stream().map(this::buildContactResponse).toList();
    }

    @Override
    public List<AdminContactResponse> getPendingContacts() {
        List<Contact> contacts = contactRepo.findByResolvedOrderByCreatedAtDesc(false);
        return contacts.stream().map(this::buildContactResponse).toList();
    }

    @Override
    @Transactional
    public void createContact(com.itjob.dto.ContactRequest request) {
        Contact contact = new Contact();
        contact.setName(request.getName());
        contact.setEmail(request.getEmail());
        contact.setPhone(request.getPhone());
        contact.setSubject(request.getSubject());
        contact.setMessage(request.getMessage());
        contact.setResolved(false);
        contactRepo.save(contact);
    }

    @Override
    public void resolveContact(UUID contactId) {
        Contact contact = contactRepo.findById(contactId)
                .orElseThrow(() -> new ResourceNotFoundException("Contact not found"));
        contact.setResolved(true);
        contact.setResolvedAt(LocalDateTime.now());
        contactRepo.save(contact);
    }

    @Override
    @Transactional
    public void deleteContact(UUID contactId) {
        Contact contact = contactRepo.findById(contactId)
                .orElseThrow(() -> new ResourceNotFoundException("Contact not found"));
        contactRepo.delete(contact);
    }

    // ========== System Configuration ==========

    @Override
    public List<SystemConfig> getAllConfigs() {
        return systemConfigRepo.findAll();
    }

    @Override
    public SystemConfig updateConfig(UUID configId, SystemConfigRequest request) {
        SystemConfig config = systemConfigRepo.findById(configId)
                .orElseThrow(() -> new ResourceNotFoundException("Config not found"));

        config.setConfigValue(request.getConfigValue());

        // Only update description if provided
        if (request.getDescription() != null) {
            config.setDescription(request.getDescription());
        }

        config.setUpdatedAt(LocalDateTime.now());

        return systemConfigRepo.save(config);
    }

    // ========== Skills Management ==========

    @Override
    public List<Skills> getAllSkills() {
        return skillsRepo.findAllByOrderBySkillAsc();
    }

    @Override
    public List<Skills> searchSkills(String query) {
        if (query == null || query.isBlank()) {
            return getAllSkills();
        }
        return skillsRepo.findBySkillContainingIgnoreCaseOrderBySkillAsc(query);
    }

    @Override
    @Transactional
    public Skills createSkill(com.itjob.dto.SkillRequest request) {
        if (skillsRepo.existsBySkillIgnoreCase(request.getSkill())) {
            throw new RuntimeException("Skill \"" + request.getSkill() + "\" already exists");
        }

        Skills skill = new Skills();
        skill.setSkill(request.getSkill());
        return skillsRepo.save(skill);
    }

    @Override
    @Transactional
    public Skills updateSkill(Long skillId, com.itjob.dto.SkillRequest request) {
        Skills skill = skillsRepo.findById(skillId)
                .orElseThrow(() -> new ResourceNotFoundException("Skill not found"));

        // Check if another skill with the same name already exists (exclude current one)
        List<Skills> existing = skillsRepo.findBySkillContainingIgnoreCaseOrderBySkillAsc(request.getSkill());
        boolean duplicate = existing.stream()
                .anyMatch(s -> !s.getId().equals(skillId) && s.getSkill().equalsIgnoreCase(request.getSkill()));
        if (duplicate) {
            throw new RuntimeException("Skill \"" + request.getSkill() + "\" already exists");
        }

        skill.setSkill(request.getSkill());
        return skillsRepo.save(skill);
    }

    @Override
    @Transactional
    public void deleteSkill(Long skillId) {
        Skills skill = skillsRepo.findById(skillId)
                .orElseThrow(() -> new ResourceNotFoundException("Skill not found"));
        skillsRepo.delete(skill);
    }

    // ========== Seed Admin ==========

    @Override
    @Transactional
    public void seedAdminUser() {
        String adminEmail = "admin@admin.com";

        if (userRepo.existsByEmail(adminEmail)) {
            throw new RuntimeException("Admin user already exists");
        }

        User admin = new User();
        admin.setEmail(adminEmail);
        admin.setRole(com.itjob.entities.Enums.Role.ADMIN);
        admin.setOtp("000000");
        admin.setExpiresAt(LocalDateTime.now().plusDays(365));
        admin.setIsUsed(false);
        admin.setProfileCompleted(true);

        userRepo.save(admin);
    }

    // ========== Helper methods ==========

    private AdminUserResponse buildUserResponse(User user) {
        String fullName = null;
        String companyName = null;

        if (user instanceof Candidate) {
            Candidate candidate = (Candidate) user;
            fullName = candidate.getFullName();
        }

        if (user instanceof Recruiter) {
            Recruiter recruiter = (Recruiter) user;
            companyName = recruiter.getCompanyName();
        }

        return AdminUserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .role(user.getRole())
                .profileCompleted(user.isProfileCompleted())
                .fullName(fullName)
                .companyName(companyName)
                .build();
    }

    private AdminContactResponse buildContactResponse(Contact contact) {
        return AdminContactResponse.builder()
                .id(contact.getId())
                .name(contact.getName())
                .email(contact.getEmail())
                .phone(contact.getPhone())
                .subject(contact.getSubject())
                .message(contact.getMessage())
                .resolved(contact.isResolved())
                .createdAt(contact.getCreatedAt())
                .resolvedAt(contact.getResolvedAt())
                .build();
    }

    private AdminJobResponse buildJobResponse(Job job) {
        int totalApplicants = (job.getApplications() != null) ? job.getApplications().size() : 0;
        String companyName = job.getRecruiter() != null ? job.getRecruiter().getCompanyName() : "Unknown";

        // Determine status string
        String status;
        if (!job.isActive()) {
            status = "Closed";
        } else if (!job.isApproved()) {
            status = "Pending Approval";
        } else if (job.isFeatured()) {
            status = "Featured";
        } else if (job.getExpiresAt() != null && job.getExpiresAt().isBefore(LocalDateTime.now())) {
            status = "Expired";
        } else {
            status = "Active";
        }

        return AdminJobResponse.builder()
                .id(job.getId())
                .title(job.getTitle())
                .companyName(companyName)
                .location(job.getLocation())
                .jobType(job.getJobType())
                .workLocation(job.getWorkLocation())
                .salaryMin(job.getSalaryMin())
                .salaryMax(job.getSalaryMax())
                .totalApplicants(totalApplicants)
                .recruiterEmail(job.getRecruiter() != null ? job.getRecruiter().getEmail() : "")
                .skills(job.getSkills() != null
                        ? job.getSkills().stream()
                                .map(Skills::getSkillName)
                                .collect(Collectors.toList())
                        : null)
                .createdAt(job.getCreatedAt())
                .approved(job.isApproved())
                .featured(job.isFeatured())
                .active(job.isActive())
                .expiresAt(job.getExpiresAt())
                .featuredUntil(job.getFeaturedUntil())
                .status(status)
                .build();
    }
}
