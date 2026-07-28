package com.itjob.services;

import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.itjob.dto.AdminContactResponse;
import com.itjob.dto.AdminDashboardResponse;
import com.itjob.dto.AdminJobResponse;
import com.itjob.dto.AdminUserResponse;
import com.itjob.dto.CategoryRequest;
import com.itjob.dto.SystemConfigRequest;
import com.itjob.entities.Category;
import com.itjob.entities.Skills;
import com.itjob.entities.SystemConfig;

public interface AdminService {

    // Dashboard
    AdminDashboardResponse getDashboardStats();

    // User Management
    List<AdminUserResponse> getAllUsers();

    List<AdminUserResponse> searchUsers(String query);

    void deleteUser(UUID userId);

    // Job Moderation
    Page<AdminJobResponse> getAllJobs(Pageable pageable);

    List<AdminJobResponse> getPendingJobs();

    void approveJob(UUID jobId);

    void rejectJob(UUID jobId);

    void toggleFeatured(UUID jobId);

    void deleteJob(UUID jobId);

    // Categories
    List<Category> getAllCategories();

    Category createCategory(CategoryRequest request);

    Category updateCategory(UUID categoryId, CategoryRequest request);

    void deleteCategory(UUID categoryId);

    // Contact Management
    List<AdminContactResponse> getAllContacts();

    List<AdminContactResponse> getPendingContacts();

    void resolveContact(UUID contactId);

    void deleteContact(UUID contactId);

    // Contact Creation (public facing)
    void createContact(com.itjob.dto.ContactRequest request);

    // ========== Skills Management ==========

    List<Skills> getAllSkills();

    List<Skills> searchSkills(String query);

    Skills createSkill(com.itjob.dto.SkillRequest request);

    Skills updateSkill(Long skillId, com.itjob.dto.SkillRequest request);

    void deleteSkill(Long skillId);

    // System Configuration
    List<SystemConfig> getAllConfigs();

    SystemConfig updateConfig(UUID configId, SystemConfigRequest request);

    // Seed admin user for initial setup
    void seedAdminUser();
}
