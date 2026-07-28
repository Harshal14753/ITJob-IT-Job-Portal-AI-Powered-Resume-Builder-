package com.itjob.config;

import java.time.LocalDateTime;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import com.itjob.entities.Enums.Role;
import com.itjob.entities.Skills;
import com.itjob.entities.SystemConfig;
import com.itjob.entities.User;
import com.itjob.repository.SkillsRepo;
import com.itjob.repository.SystemConfigRepo;
import com.itjob.repository.UserRepo;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UserRepo userRepo;
    private final SystemConfigRepo systemConfigRepo;
    private final SkillsRepo skillsRepo;

    @Override
    public void run(String... args) throws Exception {
        seedAdminUser();
        seedSystemConfigs();
        seedSkills();
    }

    private void seedAdminUser() {
        String adminEmail = "admin@admin.com";

        if (!userRepo.existsByEmail(adminEmail)) {
            User admin = new User();
            admin.setEmail(adminEmail);
            admin.setRole(Role.ADMIN);
            admin.setOtp("000000");
            admin.setExpiresAt(LocalDateTime.now().plusDays(365));
            admin.setIsUsed(false);
            admin.setProfileCompleted(true);

            userRepo.save(admin);

            System.out.println("========================================");
            System.out.println("  Admin user seeded successfully!");
            System.out.println("  Email: " + adminEmail);
            System.out.println("  Role: ADMIN");
            System.out.println("========================================");
        } else {
            System.out.println("Admin user already exists. Skipping seed.");
        }
    }

    private void seedSystemConfigs() {
        // ==================== 1. General Settings ====================
        seedConfig("general_website_name", "IT Job Hunt", "text", "General", "Website display name");
        seedConfig("general_company_name", "IT Job Hunt Pvt Ltd", "text", "General", "Legal company name");
        seedConfig("general_support_email", "support@ithunt.com", "email", "General", "Customer support email address");
        seedConfig("general_contact_number", "+91 9876543210", "text", "General", "Customer support phone number");
        seedConfig("general_time_zone", "Asia/Kolkata", "text", "General", "System timezone");

        // ==================== 2. Authentication & Security ====================
        seedConfig("auth_jwt_access_expiry", "1", "number", "Auth & Security", "JWT access token expiry in hours");
        seedConfig("auth_jwt_refresh_expiry", "15", "number", "Auth & Security", "JWT refresh token expiry in days");
        seedConfig("auth_otp_expiry_time", "5", "number", "Auth & Security", "OTP expiry time in minutes");
        seedConfig("auth_max_login_attempts", "5", "number", "Auth & Security", "Maximum failed login attempts before lockout");
        seedConfig("auth_enable_registration", "true", "toggle", "Auth & Security", "Allow new user registration");

        // ==================== 3. Email (SMTP) Settings ====================
        // NOTE: smtp_password is NOT seeded here — it is read from application-dev.properties
        // (app.smtp.password) for security. Non-sensitive SMTP configs remain in the DB.
        seedConfig("smtp_host", "smtp.gmail.com", "text", "SMTP", "SMTP server hostname");
        seedConfig("smtp_port", "587", "number", "SMTP", "SMTP server port");
        seedConfig("smtp_username", "harshaljambhale16", "email", "SMTP", "SMTP authentication username");
        seedConfig("smtp_sender_email", "harshaljambhale16@gmail.com", "email", "SMTP", "Email address shown in From field");
        seedConfig("smtp_sender_name", "Harshal Jambhale", "text", "SMTP", "Name shown in From field");

        // ==================== 4. Cloud Storage ====================
        // NOTE: cloudinary_cloud_name, cloudinary_api_key, and cloudinary_api_secret are NOT seeded here.
        // They are read from application-dev.properties (app.cloudinary.*) for security.
        seedConfig("cloudinary_upload_folder", "itjob-portal/resumes", "text", "Cloud Storage", "Default upload folder in Cloudinary");
        seedConfig("storage_max_resume_size", "10", "number", "Cloud Storage", "Maximum resume file size in MB");
        seedConfig("storage_allowed_file_types", "pdf,doc,docx", "text", "Cloud Storage", "Comma-separated allowed file extensions");

        // ==================== 5. Job Settings ====================
        seedConfig("job_max_per_recruiter", "50", "number", "Job Settings", "Maximum active jobs a recruiter can post");
        seedConfig("job_expiry_days", "30", "number", "Job Settings", "Default job posting expiry in days");
        seedConfig("job_auto_close_expired", "true", "toggle", "Job Settings", "Automatically close expired job postings");
        seedConfig("job_featured_duration", "7", "number", "Job Settings", "Featured job duration in days");
        seedConfig("job_require_admin_approval", "false", "toggle", "Job Settings", "Require admin approval before job goes live");
        seedConfig("job_allow_duplicates", "false", "toggle", "Job Settings", "Allow recruiters to post duplicate job listings");

        // ==================== 6. Candidate Settings ====================
        seedConfig("candidate_max_resume_size", "10", "number", "Candidate Settings", "Maximum resume upload size in MB");
        seedConfig("candidate_allow_multiple_resumes", "false", "toggle", "Candidate Settings", "Allow candidates to upload multiple resumes");
        seedConfig("candidate_profile_completion_required", "true", "toggle", "Candidate Settings", "Require profile completion before applying");
        seedConfig("candidate_default_resume_visibility", "public", "select", "Candidate Settings", "Default resume visibility (public/private/contacts_only)");

        // ==================== 7. Recruiter Settings ====================
        seedConfig("recruiter_company_verification_required", "true", "toggle", "Recruiter Settings", "Require company verification before posting jobs");
        seedConfig("recruiter_approval_required", "false", "toggle", "Recruiter Settings", "Require admin approval for new recruiters");
        seedConfig("recruiter_max_active_jobs", "50", "number", "Recruiter Settings", "Maximum active job postings per recruiter");
        seedConfig("recruiter_allow_company_logo_upload", "true", "toggle", "Recruiter Settings", "Allow recruiters to upload company logo");

        // ==================== 8. AI Settings ====================
        seedConfig("ai_auto_apply_enabled", "true", "toggle", "AI Settings", "Globally enable or disable AI Auto-Apply for all candidates");

        System.out.println("System configurations seeded successfully!");
    }

    private void seedSkills() {
        String[] defaultSkills = {
            // Java & JVM
            "Java", "Spring Boot", "Spring Security", "Spring Data JPA", "Spring Cloud",
            "Hibernate", "JPA", "JDBC", "JSP", "Servlets", "Thymeleaf",
            "Kotlin", "Groovy", "Gradle", "Maven",
            // Databases
            "PostgreSQL", "MySQL", "MongoDB", "Redis", "Elasticsearch",
            "Oracle", "SQL Server", "MariaDB", "Cassandra", "Firebase",
            // Web & Frontend
            "JavaScript", "TypeScript", "React", "Angular", "Vue.js",
            "HTML", "CSS", "SASS", "Tailwind CSS", "Bootstrap",
            "Next.js", "Node.js", "Express.js", "REST APIs", "GraphQL",
            // Cloud & DevOps
            "AWS", "Azure", "Google Cloud", "Docker", "Kubernetes",
            "Jenkins", "GitHub Actions", "GitLab CI", "Terraform", "Ansible",
            // Testing
            "JUnit", "Mockito", "Selenium", "Cypress", "Postman",
            // Other Languages
            "Python", "C", "C++", "C#", "Go", "Rust", "PHP", "Ruby",
            // Tools
            "Git", "Linux", "IntelliJ IDEA", "VS Code", "Eclipse",
            "Docker Compose", "Kafka", "RabbitMQ", "Nginx", "Apache"
        };

        int seeded = 0;
        for (String skillName : defaultSkills) {
            if (!skillsRepo.existsBySkillIgnoreCase(skillName)) {
                Skills skill = new Skills();
                skill.setSkill(skillName);
                skillsRepo.save(skill);
                seeded++;
            }
        }

        if (seeded > 0) {
            System.out.println("Seeded " + seeded + " default skills successfully!");
        } else {
            System.out.println("All default skills already exist. Skipping skill seed.");
        }
    }

    private void seedConfig(String key, String value, String inputType, String group, String description) {
        if (!systemConfigRepo.existsByConfigKey(key)) {
            SystemConfig config = new SystemConfig();
            config.setConfigKey(key);
            config.setConfigValue(value);
            config.setInputType(inputType);
            config.setGroupName(group);
            config.setDescription(description);
            config.setUpdatedAt(LocalDateTime.now());
            systemConfigRepo.save(config);
        }
    }
}
