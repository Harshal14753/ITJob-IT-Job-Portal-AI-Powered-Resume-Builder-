package com.itjob.services.impl;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.itjob.dto.AIApplySettingsRequest;
import com.itjob.dto.AIApplySettingsResponse;
import com.itjob.entities.AIApplySettings;
import com.itjob.entities.Application;
import com.itjob.entities.Candidate;
import com.itjob.entities.Enums.ApplicationStatus;
import com.itjob.entities.Enums.JobType;
import com.itjob.entities.Enums.WorkLocation;
import com.itjob.entities.Job;
import com.itjob.entities.Recruiter;
import com.itjob.entities.Skills;
import com.itjob.entities.SystemConfig;
import com.itjob.exception.ResourceNotFoundException;
import com.itjob.repository.AIApplySettingsRepo;
import com.itjob.repository.ApplicationRepo;
import com.itjob.repository.CandidateRepo;
import com.itjob.repository.JobRepo;
import com.itjob.repository.SystemConfigRepo;
import com.itjob.services.MatchService;
import com.itjob.services.NotificationService;

@ExtendWith(MockitoExtension.class)
class AIApplyServiceImplTest {

    /* =====================================================================
     *  Mock Dependencies – all injected into AIApplyServiceImpl via
     *  @RequiredArgsConstructor constructor
     * ===================================================================== */

    @Mock
    private AIApplySettingsRepo settingsRepo;

    @Mock
    private CandidateRepo candidateRepo;

    @Mock
    private JobRepo jobRepo;

    @Mock
    private ApplicationRepo applicationRepo;

    @Mock
    private SystemConfigRepo systemConfigRepo;

    @Mock
    private MatchService matchService;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private AIApplyServiceImpl aiApplyService;

    /* =====================================================================
     *  Captors – used to capture arguments passed to save()
     * ===================================================================== */

    @Captor
    private ArgumentCaptor<AIApplySettings> settingsCaptor;

    @Captor
    private ArgumentCaptor<Application> applicationCaptor;

    /* =====================================================================
     *  Shared test fixtures
     * ===================================================================== */

    private Candidate testCandidate;
    private AIApplySettings testSettings;
    private Recruiter testRecruiter;
    private Job testJob;
    private Skills skillJava;
    private Skills skillPython;
    private SystemConfig globalEnabledConfig;

    @BeforeEach
    void setUp() {
        // 1 second — Create a test candidate
        testCandidate = new Candidate();
        testCandidate.setEmail("candidate@test.com");
        testCandidate.setFullName("Test Candidate");
        testCandidate.setAddress("Mumbai");

        // 1 second — Create a test recruiter with a company name
        testRecruiter = new Recruiter();
        testRecruiter.setCompanyName("Tech Corp");
        testRecruiter.setEmail("recruiter@techcorp.com");

        // 1 second — Create skill objects
        skillJava = new Skills();
        skillJava.setId(1L);
        skillJava.setSkill("Java");

        skillPython = new Skills();
        skillPython.setId(2L);
        skillPython.setSkill("Python");

        // 1 second — Create a test job with all fields populated
        testJob = new Job();
        testJob.setId(UUID.randomUUID());
        testJob.setTitle("Senior Java Developer");
        testJob.setLocation("Mumbai");
        testJob.setJobType(JobType.FULL_TIME);
        testJob.setWorkLocation(WorkLocation.HYBRID);
        testJob.setSalaryMin(800000);
        testJob.setSalaryMax(1500000);
        testJob.setMinExperience(3);
        testJob.setSkills(new ArrayList<>(List.of(skillJava, skillPython)));
        testJob.setRecruiter(testRecruiter);
        testJob.setApproved(true);
        testJob.setActive(true);

        // 1 second — Create a global config with auto-apply enabled
        globalEnabledConfig = new SystemConfig();
        globalEnabledConfig.setConfigKey("ai_auto_apply_enabled");
        globalEnabledConfig.setConfigValue("true");

        // 1 second — Create AIApplySettings with all preferences populated
        testSettings = new AIApplySettings();
        testSettings.setId(UUID.randomUUID().toString());
        testSettings.setCandidate(testCandidate);
        testSettings.setEnabled(true);
        testSettings.setMatchThreshold(70);
        testSettings.setScheduleTime(LocalTime.of(9, 0));
        testSettings.setPreferredSkills("Java, Spring Boot");
        testSettings.setPreferredLocation("Mumbai");
        testSettings.setPreferredJobType("FULL_TIME");
        testSettings.setPreferredMinSalary(500000);
        testSettings.setPreferredWorkLocation("HYBRID");
        testSettings.setPreferredTitles("Developer, Engineer");
        testSettings.setPreferredMinExperience(5);
        testSettings.setCreatedAt(LocalDateTime.now().minusDays(1));
        testSettings.setUpdatedAt(LocalDateTime.now().minusDays(1));
    }

    /* =====================================================================
     *  getSettings() — 2 tests        Total: ~2 seconds
     * ===================================================================== */

    /* >>> getSettings: When no settings exist in DB, return defaults <<<
     *  Time: ~1 second */
    @Test
    void getSettings_NoExistingSettings_ReturnsDefaults() {
        // Arrange — settings not found in DB
        when(settingsRepo.findByCandidateEmail("candidate@test.com")).thenReturn(Optional.empty());

        // Act
        AIApplySettingsResponse response = aiApplyService.getSettings("candidate@test.com");

        // Assert — defaults returned
        assertFalse(response.isEnabled());
        assertEquals(80, response.getMatchThreshold());
        assertEquals("09:00", response.getScheduleTime());
        assertEquals(0, response.getTotalAutoApplied());
        assertNull(response.getPreferredSkills());
        // Verify the repo was queried
        verify(settingsRepo).findByCandidateEmail("candidate@test.com");
    }

    /* >>> getSettings: When settings exist in DB, return them <<<
     *  Time: ~1 second */
    @Test
    void getSettings_ExistingSettings_ReturnsThem() {
        // Arrange — settings found in DB
        when(settingsRepo.findByCandidateEmail("candidate@test.com")).thenReturn(Optional.of(testSettings));
        // toResponse calls findByCandidateEmail to count auto-applied apps
        when(applicationRepo.findByCandidateEmail("candidate@test.com")).thenReturn(new ArrayList<>());

        // Act
        AIApplySettingsResponse response = aiApplyService.getSettings("candidate@test.com");

        // Assert — settings match testSettings
        assertTrue(response.isEnabled());
        assertEquals(70, response.getMatchThreshold());
        assertEquals("09:00", response.getScheduleTime());
        assertEquals("Java, Spring Boot", response.getPreferredSkills());
        assertEquals("Mumbai", response.getPreferredLocation());
        assertEquals("FULL_TIME", response.getPreferredJobType());
        assertEquals(500000, response.getPreferredMinSalary());
        assertEquals("HYBRID", response.getPreferredWorkLocation());
        assertEquals("Developer, Engineer", response.getPreferredTitles());
        assertEquals(5, response.getPreferredMinExperience());
        verify(settingsRepo).findByCandidateEmail("candidate@test.com");
    }

    /* =====================================================================
     *  saveSettings() — 4 tests        Total: ~4 seconds
     * ===================================================================== */

    /* >>> saveSettings: Creating new settings for the first time <<<
     *  Time: ~1 second */
    @Test
    void saveSettings_CreatesNewSettings_WhenNoneExist() {
        // Arrange — candidate exists but no settings yet
        when(candidateRepo.findByEmail("candidate@test.com")).thenReturn(Optional.of(testCandidate));
        when(settingsRepo.findByCandidateEmail("candidate@test.com")).thenReturn(Optional.empty());
        when(settingsRepo.save(any(AIApplySettings.class))).thenAnswer(inv -> inv.getArgument(0));
        when(applicationRepo.findByCandidateEmail("candidate@test.com")).thenReturn(new ArrayList<>());

        AIApplySettingsRequest request = AIApplySettingsRequest.builder()
                .enabled(true)
                .matchThreshold(85)
                .scheduleTime("10:30")
                .preferredSkills("Java, React")
                .preferredLocation("Pune")
                .preferredJobType("FULL_TIME")
                .preferredMinSalary(600000)
                .preferredWorkLocation("REMOTE")
                .preferredTitles("Developer")
                .preferredMinExperience(4)
                .build();

        // Act
        AIApplySettingsResponse response = aiApplyService.saveSettings("candidate@test.com", request);

        // Assert — new settings saved with all preference fields
        verify(settingsRepo).save(settingsCaptor.capture());
        AIApplySettings saved = settingsCaptor.getValue();

        assertTrue(saved.isEnabled());
        assertEquals(85, saved.getMatchThreshold());
        assertEquals(LocalTime.of(10, 30), saved.getScheduleTime());
        assertEquals("Java, React", saved.getPreferredSkills());
        assertEquals("Pune", saved.getPreferredLocation());
        assertEquals("FULL_TIME", saved.getPreferredJobType());
        assertEquals(600000, saved.getPreferredMinSalary());
        assertEquals("REMOTE", saved.getPreferredWorkLocation());
        assertEquals("Developer", saved.getPreferredTitles());
        assertEquals(4, saved.getPreferredMinExperience());
        assertNotNull(saved.getCreatedAt());
        assertNotNull(saved.getUpdatedAt());
        assertEquals(testCandidate, saved.getCandidate());

        // Assert response matches
        assertEquals(85, response.getMatchThreshold());
        assertEquals("Java, React", response.getPreferredSkills());
        assertEquals("Pune", response.getPreferredLocation());
    }

    /* >>> saveSettings: Updating existing settings <<<
     *  Time: ~1 second */
    @Test
    void saveSettings_UpdatesExistingSettings() {
        // Arrange — settings already exist
        when(candidateRepo.findByEmail("candidate@test.com")).thenReturn(Optional.of(testCandidate));
        when(settingsRepo.findByCandidateEmail("candidate@test.com")).thenReturn(Optional.of(testSettings));
        when(settingsRepo.save(any(AIApplySettings.class))).thenAnswer(inv -> inv.getArgument(0));
        when(applicationRepo.findByCandidateEmail("candidate@test.com")).thenReturn(new ArrayList<>());

        AIApplySettingsRequest updateRequest = AIApplySettingsRequest.builder()
                .enabled(false)
                .matchThreshold(50)
                .scheduleTime("08:00")
                .preferredSkills("Python")
                .build();

        // Act
        AIApplySettingsResponse response = aiApplyService.saveSettings("candidate@test.com", updateRequest);

        // Assert — settings updated (fields NOT in the request default to null via Lombok builder)
        verify(settingsRepo).save(settingsCaptor.capture());
        AIApplySettings saved = settingsCaptor.getValue();

        assertFalse(saved.isEnabled());
        assertEquals(50, saved.getMatchThreshold());
        assertEquals(LocalTime.of(8, 0), saved.getScheduleTime());
        assertEquals("Python", saved.getPreferredSkills());
        // Fields not included in the request default to null (Lombok @Builder default)
        assertNull(saved.getPreferredLocation());
        assertNull(saved.getPreferredJobType());
        assertNotNull(saved.getUpdatedAt());
    }

    /* >>> saveSettings: Throws when candidate is not found <<<
     *  Time: ~1 second */
    @Test
    void saveSettings_ThrowsException_WhenCandidateNotFound() {
        // Arrange — candidate does not exist
        when(candidateRepo.findByEmail("unknown@test.com")).thenReturn(Optional.empty());

        AIApplySettingsRequest request = AIApplySettingsRequest.builder()
                .enabled(true)
                .matchThreshold(80)
                .build();

        // Act & Assert
        assertThrows(ResourceNotFoundException.class,
                () -> aiApplyService.saveSettings("unknown@test.com", request));
        verify(settingsRepo, never()).save(any());
    }

    /* >>> saveSettings: Saves with null preferences (clearing previous values) <<<
     *  Time: ~1 second */
    @Test
    void saveSettings_CanClearPreferencesWithNull() {
        // Arrange
        when(candidateRepo.findByEmail("candidate@test.com")).thenReturn(Optional.of(testCandidate));
        when(settingsRepo.findByCandidateEmail("candidate@test.com")).thenReturn(Optional.of(testSettings));
        when(settingsRepo.save(any(AIApplySettings.class))).thenAnswer(inv -> inv.getArgument(0));
        when(applicationRepo.findByCandidateEmail("candidate@test.com")).thenReturn(new ArrayList<>());

        // Send null for all preference fields
        AIApplySettingsRequest clearRequest = AIApplySettingsRequest.builder()
                .enabled(true)
                .matchThreshold(70)
                .scheduleTime("09:00")
                .preferredSkills(null)
                .preferredLocation(null)
                .preferredJobType(null)
                .preferredMinSalary(null)
                .preferredWorkLocation(null)
                .preferredTitles(null)
                .preferredMinExperience(null)
                .build();

        // Act
        aiApplyService.saveSettings("candidate@test.com", clearRequest);

        // Assert — preferences are null
        verify(settingsRepo).save(settingsCaptor.capture());
        AIApplySettings saved = settingsCaptor.getValue();
        assertNull(saved.getPreferredSkills());
        assertNull(saved.getPreferredLocation());
        assertNull(saved.getPreferredJobType());
        assertNull(saved.getPreferredMinSalary());
        assertNull(saved.getPreferredWorkLocation());
        assertNull(saved.getPreferredTitles());
        assertNull(saved.getPreferredMinExperience());
    }

    /* =====================================================================
     *  runAutoApply() — 7 tests        Total: ~7 seconds
     * ===================================================================== */

    /* >>> runAutoApply: Returns 0 when globally disabled <<<
     *  Time: ~1 second */
    @Test
    void runAutoApply_ReturnsZero_WhenGloballyDisabled() {
        // Arrange — global config says disabled
        SystemConfig disabledConfig = new SystemConfig();
        disabledConfig.setConfigKey("ai_auto_apply_enabled");
        disabledConfig.setConfigValue("false");
        when(systemConfigRepo.findByConfigKey("ai_auto_apply_enabled"))
                .thenReturn(Optional.of(disabledConfig));

        // Act
        int count = aiApplyService.runAutoApply("candidate@test.com");

        // Assert — no applications made
        assertEquals(0, count);
        verify(applicationRepo, never()).save(any());
        verify(settingsRepo, never()).save(any());
    }

    /* >>> runAutoApply: Returns 0 when global config is missing (defaults to enabled) <<<
     *  Time: ~1 second */
    @Test
    void runAutoApply_DefaultsToEnabled_WhenGlobalConfigMissing() {
        // Arrange — global config not found, defaults to enabled; no active jobs available
        when(systemConfigRepo.findByConfigKey("ai_auto_apply_enabled"))
                .thenReturn(Optional.empty());
        when(candidateRepo.findByEmail("candidate@test.com")).thenReturn(Optional.of(testCandidate));
        when(settingsRepo.findByCandidateEmail("candidate@test.com")).thenReturn(Optional.of(testSettings));
        when(jobRepo.findActiveApprovedJobs(any(LocalDateTime.class))).thenReturn(new ArrayList<>());

        // Act
        int count = aiApplyService.runAutoApply("candidate@test.com");

        // Assert — proceeds normally (defaults to enabled) but no jobs to apply to
        assertEquals(0, count);
    }

    /* >>> runAutoApply: Returns 0 when candidate settings are disabled <<<
     *  Time: ~1 second */
    @Test
    void runAutoApply_ReturnsZero_WhenCandidateSettingsDisabled() {
        // Arrange — globally enabled but candidate disabled
        testSettings.setEnabled(false);
        when(systemConfigRepo.findByConfigKey("ai_auto_apply_enabled"))
                .thenReturn(Optional.of(globalEnabledConfig));
        when(candidateRepo.findByEmail("candidate@test.com")).thenReturn(Optional.of(testCandidate));
        when(settingsRepo.findByCandidateEmail("candidate@test.com")).thenReturn(Optional.of(testSettings));

        // Act
        int count = aiApplyService.runAutoApply("candidate@test.com");

        // Assert
        assertEquals(0, count);
        verify(applicationRepo, never()).save(any());
    }

    /* >>> runAutoApply: Throws when candidate not found <<<
     *  Time: ~1 second */
    @Test
    void runAutoApply_ThrowsException_WhenCandidateNotFound() {
        // Arrange
        when(systemConfigRepo.findByConfigKey("ai_auto_apply_enabled"))
                .thenReturn(Optional.of(globalEnabledConfig));
        when(candidateRepo.findByEmail("unknown@test.com")).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResourceNotFoundException.class,
                () -> aiApplyService.runAutoApply("unknown@test.com"));
    }

    /* >>> runAutoApply: Throws when settings not found <<<
     *  Time: ~1 second */
    @Test
    void runAutoApply_ThrowsException_WhenSettingsNotFound() {
        // Arrange
        when(systemConfigRepo.findByConfigKey("ai_auto_apply_enabled"))
                .thenReturn(Optional.of(globalEnabledConfig));
        when(candidateRepo.findByEmail("candidate@test.com")).thenReturn(Optional.of(testCandidate));
        when(settingsRepo.findByCandidateEmail("candidate@test.com")).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResourceNotFoundException.class,
                () -> aiApplyService.runAutoApply("candidate@test.com"));
    }

    /* >>> runAutoApply: Applies to matching jobs and saves applications <<<
     *  Time: ~1 second */
    @Test
    void runAutoApply_AppliesToMatchingJobs() {
        // Arrange — one active job that matches preferences and has high match score
        when(systemConfigRepo.findByConfigKey("ai_auto_apply_enabled"))
                .thenReturn(Optional.of(globalEnabledConfig));
        when(candidateRepo.findByEmail("candidate@test.com")).thenReturn(Optional.of(testCandidate));
        when(settingsRepo.findByCandidateEmail("candidate@test.com")).thenReturn(Optional.of(testSettings));
        when(jobRepo.findActiveApprovedJobs(any(LocalDateTime.class))).thenReturn(List.of(testJob));
        when(applicationRepo.existsByCandidateAndJob(testCandidate, testJob)).thenReturn(false);
        when(matchService.computeMatchScore(testCandidate, testJob, testSettings)).thenReturn(85); // >= 70 threshold
        when(applicationRepo.save(any(Application.class))).thenAnswer(inv -> {
            Application app = inv.getArgument(0);
            app.setId(UUID.randomUUID());
            return app;
        });

        // Act
        int count = aiApplyService.runAutoApply("candidate@test.com");

        // Assert — 1 application created
        assertEquals(1, count);
        verify(applicationRepo).save(applicationCaptor.capture());
        Application savedApp = applicationCaptor.getValue();
        assertTrue(savedApp.isAutoApplied());
        assertEquals(ApplicationStatus.PENDING, savedApp.getStatus());
        assertEquals(testCandidate, savedApp.getCandidate());
        assertEquals(testJob, savedApp.getJob());
        assertNotNull(savedApp.getApplicationDate());
        assertNotNull(savedApp.getStatusUpdatedAt());

        // Verify notification was sent
        verify(notificationService).createNotification(
                eq("candidate@test.com"),
                eq("APPLICATION_STATUS"),
                eq("AI Auto-Applied"),
                contains("Senior Java Developer"),
                anyString(),
                eq("application"));

        // Verify lastRunAt was updated (settings saved once at the end)
        verify(settingsRepo, times(1)).save(any(AIApplySettings.class));
    }

    /* >>> runAutoApply: Skips jobs that candidate already applied to <<<
     *  Time: ~1 second */
    @Test
    void runAutoApply_SkipsAlreadyAppliedJobs() {
        // Arrange — already applied, so existsByCandidateAndJob returns true
        when(systemConfigRepo.findByConfigKey("ai_auto_apply_enabled"))
                .thenReturn(Optional.of(globalEnabledConfig));
        when(candidateRepo.findByEmail("candidate@test.com")).thenReturn(Optional.of(testCandidate));
        when(settingsRepo.findByCandidateEmail("candidate@test.com")).thenReturn(Optional.of(testSettings));
        when(jobRepo.findActiveApprovedJobs(any(LocalDateTime.class))).thenReturn(List.of(testJob));
        when(applicationRepo.existsByCandidateAndJob(testCandidate, testJob)).thenReturn(true);

        // Act
        int count = aiApplyService.runAutoApply("candidate@test.com");

        // Assert — 0 new applications, save never called
        assertEquals(0, count);
        verify(applicationRepo, never()).save(any());
        verify(matchService, never()).computeMatchScore(any(), any(), any());
        // lastRunAt still updated
        verify(settingsRepo, times(1)).save(any(AIApplySettings.class));
    }

    /* =====================================================================
     *  passesPreferenceFilters() — 14 tests        Total: ~14 seconds
     *
     *  Note: passesPreferenceFilters is a private method. We test its
     *  behavior indirectly through runAutoApply by setting up the
     *  corresponding preferences on the AIApplySettings.
     * ===================================================================== */

    /* >>> Preference Filter: Job matches ALL criteria — should pass <<<
     *  Time: ~1 second */
    @Test
    void preferenceFilter_Passes_WhenAllCriteriaMatch() {
        // Arrange — testJob has all matching fields
        when(systemConfigRepo.findByConfigKey("ai_auto_apply_enabled"))
                .thenReturn(Optional.of(globalEnabledConfig));
        when(candidateRepo.findByEmail("candidate@test.com")).thenReturn(Optional.of(testCandidate));
        when(settingsRepo.findByCandidateEmail("candidate@test.com")).thenReturn(Optional.of(testSettings));
        when(jobRepo.findActiveApprovedJobs(any(LocalDateTime.class))).thenReturn(List.of(testJob));
        when(applicationRepo.existsByCandidateAndJob(testCandidate, testJob)).thenReturn(false);
        when(matchService.computeMatchScore(testCandidate, testJob, testSettings)).thenReturn(85);
        when(applicationRepo.save(any(Application.class))).thenAnswer(inv -> {
            Application app = inv.getArgument(0);
            app.setId(UUID.randomUUID());
            return app;
        });

        // Act
        int count = aiApplyService.runAutoApply("candidate@test.com");

        // Assert — job passed all filters and was applied
        assertEquals(1, count);
    }

    /* >>> Preference Filter: Job title does NOT contain any preferred title <<<
     *  Time: ~1 second */
    @Test
    void preferenceFilter_Fails_WhenTitleDoesNotMatch() {
        // Arrange — set a very specific title that won't match
        testSettings.setPreferredTitles("Data Scientist, Architect");
        testJob.setTitle("Junior Tester");

        when(systemConfigRepo.findByConfigKey("ai_auto_apply_enabled"))
                .thenReturn(Optional.of(globalEnabledConfig));
        when(candidateRepo.findByEmail("candidate@test.com")).thenReturn(Optional.of(testCandidate));
        when(settingsRepo.findByCandidateEmail("candidate@test.com")).thenReturn(Optional.of(testSettings));
        when(jobRepo.findActiveApprovedJobs(any(LocalDateTime.class))).thenReturn(List.of(testJob));
        when(applicationRepo.existsByCandidateAndJob(testCandidate, testJob)).thenReturn(false);

        // Act
        int count = aiApplyService.runAutoApply("candidate@test.com");

        // Assert — filtered out, no match score computed
        assertEquals(0, count);
        verify(matchService, never()).computeMatchScore(any(), any(), any());
    }

    /* >>> Preference Filter: Job location does NOT match <<<
     *  Time: ~1 second */
    @Test
    void preferenceFilter_Fails_WhenLocationDoesNotMatch() {
        // Arrange — job is in a different city
        testSettings.setPreferredLocation("Delhi");
        testJob.setLocation("Bangalore");

        when(systemConfigRepo.findByConfigKey("ai_auto_apply_enabled"))
                .thenReturn(Optional.of(globalEnabledConfig));
        when(candidateRepo.findByEmail("candidate@test.com")).thenReturn(Optional.of(testCandidate));
        when(settingsRepo.findByCandidateEmail("candidate@test.com")).thenReturn(Optional.of(testSettings));
        when(jobRepo.findActiveApprovedJobs(any(LocalDateTime.class))).thenReturn(List.of(testJob));
        when(applicationRepo.existsByCandidateAndJob(testCandidate, testJob)).thenReturn(false);

        // Act
        int count = aiApplyService.runAutoApply("candidate@test.com");

        // Assert — filtered out
        assertEquals(0, count);
        verify(matchService, never()).computeMatchScore(any(), any(), any());
    }

    /* >>> Preference Filter: Job location is null when preference is set <<<
     *  Time: ~1 second */
    @Test
    void preferenceFilter_Fails_WhenJobLocationIsNull() {
        // Arrange — job has no location but candidate prefers one
        testJob.setLocation(null);

        when(systemConfigRepo.findByConfigKey("ai_auto_apply_enabled"))
                .thenReturn(Optional.of(globalEnabledConfig));
        when(candidateRepo.findByEmail("candidate@test.com")).thenReturn(Optional.of(testCandidate));
        when(settingsRepo.findByCandidateEmail("candidate@test.com")).thenReturn(Optional.of(testSettings));
        when(jobRepo.findActiveApprovedJobs(any(LocalDateTime.class))).thenReturn(List.of(testJob));
        when(applicationRepo.existsByCandidateAndJob(testCandidate, testJob)).thenReturn(false);

        // Act
        int count = aiApplyService.runAutoApply("candidate@test.com");

        // Assert — filtered out because preference requires location but job has none
        assertEquals(0, count);
    }

    /* >>> Preference Filter: Job type does NOT match <<<
     *  Time: ~1 second */
    @Test
    void preferenceFilter_Fails_WhenJobTypeDoesNotMatch() {
        // Arrange — job type differs
        testSettings.setPreferredJobType("CONTRACT");
        testJob.setJobType(JobType.FULL_TIME);

        when(systemConfigRepo.findByConfigKey("ai_auto_apply_enabled"))
                .thenReturn(Optional.of(globalEnabledConfig));
        when(candidateRepo.findByEmail("candidate@test.com")).thenReturn(Optional.of(testCandidate));
        when(settingsRepo.findByCandidateEmail("candidate@test.com")).thenReturn(Optional.of(testSettings));
        when(jobRepo.findActiveApprovedJobs(any(LocalDateTime.class))).thenReturn(List.of(testJob));
        when(applicationRepo.existsByCandidateAndJob(testCandidate, testJob)).thenReturn(false);

        // Act
        int count = aiApplyService.runAutoApply("candidate@test.com");

        // Assert — filtered out
        assertEquals(0, count);
    }

    /* >>> Preference Filter: Work location does NOT match <<<
     *  Time: ~1 second */
    @Test
    void preferenceFilter_Fails_WhenWorkLocationDoesNotMatch() {
        // Arrange — work location differs
        testSettings.setPreferredWorkLocation("REMOTE");
        testJob.setWorkLocation(WorkLocation.ON_SITE);

        when(systemConfigRepo.findByConfigKey("ai_auto_apply_enabled"))
                .thenReturn(Optional.of(globalEnabledConfig));
        when(candidateRepo.findByEmail("candidate@test.com")).thenReturn(Optional.of(testCandidate));
        when(settingsRepo.findByCandidateEmail("candidate@test.com")).thenReturn(Optional.of(testSettings));
        when(jobRepo.findActiveApprovedJobs(any(LocalDateTime.class))).thenReturn(List.of(testJob));
        when(applicationRepo.existsByCandidateAndJob(testCandidate, testJob)).thenReturn(false);

        // Act
        int count = aiApplyService.runAutoApply("candidate@test.com");

        // Assert — filtered out
        assertEquals(0, count);
    }

    /* >>> Preference Filter: Job max salary is below the candidate's minimum <<<
     *  Time: ~1 second */
    @Test
    void preferenceFilter_Fails_WhenSalaryTooLow() {
        // Arrange — job pays too little
        testSettings.setPreferredMinSalary(2000000); // 20L
        testJob.setSalaryMax(1000000);               // 10L max

        when(systemConfigRepo.findByConfigKey("ai_auto_apply_enabled"))
                .thenReturn(Optional.of(globalEnabledConfig));
        when(candidateRepo.findByEmail("candidate@test.com")).thenReturn(Optional.of(testCandidate));
        when(settingsRepo.findByCandidateEmail("candidate@test.com")).thenReturn(Optional.of(testSettings));
        when(jobRepo.findActiveApprovedJobs(any(LocalDateTime.class))).thenReturn(List.of(testJob));
        when(applicationRepo.existsByCandidateAndJob(testCandidate, testJob)).thenReturn(false);

        // Act
        int count = aiApplyService.runAutoApply("candidate@test.com");

        // Assert — filtered out
        assertEquals(0, count);
    }

    /* >>> Preference Filter: Job requires more experience than candidate prefers <<<
     *  Time: ~1 second */
    @Test
    void preferenceFilter_Fails_WhenExperienceTooHigh() {
        // Arrange — job requires more experience than the max candidate prefers
        testSettings.setPreferredMinExperience(3);  // can handle jobs requiring ≤ 3 years
        testJob.setMinExperience(5);                // job requires 5 years

        when(systemConfigRepo.findByConfigKey("ai_auto_apply_enabled"))
                .thenReturn(Optional.of(globalEnabledConfig));
        when(candidateRepo.findByEmail("candidate@test.com")).thenReturn(Optional.of(testCandidate));
        when(settingsRepo.findByCandidateEmail("candidate@test.com")).thenReturn(Optional.of(testSettings));
        when(jobRepo.findActiveApprovedJobs(any(LocalDateTime.class))).thenReturn(List.of(testJob));
        when(applicationRepo.existsByCandidateAndJob(testCandidate, testJob)).thenReturn(false);

        // Act
        int count = aiApplyService.runAutoApply("candidate@test.com");

        // Assert — filtered out
        assertEquals(0, count);
    }

    /* >>> Preference Filter: Job has none of the preferred skills <<<
     *  Time: ~1 second */
    @Test
    void preferenceFilter_Fails_WhenSkillsDoNotMatch() {
        // Arrange — job has different skills
        Skills skillRuby = new Skills();
        skillRuby.setId(3L);
        skillRuby.setSkill("Ruby");
        Skills skillGo = new Skills();
        skillGo.setId(4L);
        skillGo.setSkill("Go");
        testJob.setSkills(List.of(skillRuby, skillGo));

        when(systemConfigRepo.findByConfigKey("ai_auto_apply_enabled"))
                .thenReturn(Optional.of(globalEnabledConfig));
        when(candidateRepo.findByEmail("candidate@test.com")).thenReturn(Optional.of(testCandidate));
        when(settingsRepo.findByCandidateEmail("candidate@test.com")).thenReturn(Optional.of(testSettings));
        when(jobRepo.findActiveApprovedJobs(any(LocalDateTime.class))).thenReturn(List.of(testJob));
        when(applicationRepo.existsByCandidateAndJob(testCandidate, testJob)).thenReturn(false);

        // Act
        int count = aiApplyService.runAutoApply("candidate@test.com");

        // Assert — filtered out
        assertEquals(0, count);
    }

    /* >>> Preference Filter: Job has empty skills list when preference set <<<
     *  Time: ~1 second */
    @Test
    void preferenceFilter_Fails_WhenJobHasNoSkills() {
        // Arrange — job has no skills
        testJob.setSkills(new ArrayList<>());

        when(systemConfigRepo.findByConfigKey("ai_auto_apply_enabled"))
                .thenReturn(Optional.of(globalEnabledConfig));
        when(candidateRepo.findByEmail("candidate@test.com")).thenReturn(Optional.of(testCandidate));
        when(settingsRepo.findByCandidateEmail("candidate@test.com")).thenReturn(Optional.of(testSettings));
        when(jobRepo.findActiveApprovedJobs(any(LocalDateTime.class))).thenReturn(List.of(testJob));
        when(applicationRepo.existsByCandidateAndJob(testCandidate, testJob)).thenReturn(false);

        // Act
        int count = aiApplyService.runAutoApply("candidate@test.com");

        // Assert — filtered out because job has no skills to match
        assertEquals(0, count);
    }

    /* >>> Preference Filter: Job title contains preferred title (partial match) <<<
     *  Time: ~1 second */
    @Test
    void preferenceFilter_Passes_TitlePartialMatch() {
        // Arrange — job title contains partial match
        testSettings.setPreferredTitles("Java");
        testJob.setTitle("Senior Java Developer");

        when(systemConfigRepo.findByConfigKey("ai_auto_apply_enabled"))
                .thenReturn(Optional.of(globalEnabledConfig));
        when(candidateRepo.findByEmail("candidate@test.com")).thenReturn(Optional.of(testCandidate));
        when(settingsRepo.findByCandidateEmail("candidate@test.com")).thenReturn(Optional.of(testSettings));
        when(jobRepo.findActiveApprovedJobs(any(LocalDateTime.class))).thenReturn(List.of(testJob));
        when(applicationRepo.existsByCandidateAndJob(testCandidate, testJob)).thenReturn(false);
        when(matchService.computeMatchScore(testCandidate, testJob, testSettings)).thenReturn(75); // >= 70
        when(applicationRepo.save(any(Application.class))).thenAnswer(inv -> {
            Application app = inv.getArgument(0);
            app.setId(UUID.randomUUID());
            return app;
        });

        // Act
        int count = aiApplyService.runAutoApply("candidate@test.com");

        // Assert — passed filter and applied
        assertEquals(1, count);
    }

    /* >>> Preference Filter: All preferences null — everything passes <<<
     *  Time: ~1 second */
    @Test
    void preferenceFilter_Passes_WhenNoPreferencesSet() {
        // Arrange — clear all preferences (null)
        testSettings.setPreferredTitles(null);
        testSettings.setPreferredLocation(null);
        testSettings.setPreferredJobType(null);
        testSettings.setPreferredWorkLocation(null);
        testSettings.setPreferredMinSalary(null);
        testSettings.setPreferredMinExperience(null);
        testSettings.setPreferredSkills(null);

        when(systemConfigRepo.findByConfigKey("ai_auto_apply_enabled"))
                .thenReturn(Optional.of(globalEnabledConfig));
        when(candidateRepo.findByEmail("candidate@test.com")).thenReturn(Optional.of(testCandidate));
        when(settingsRepo.findByCandidateEmail("candidate@test.com")).thenReturn(Optional.of(testSettings));
        when(jobRepo.findActiveApprovedJobs(any(LocalDateTime.class))).thenReturn(List.of(testJob));
        when(applicationRepo.existsByCandidateAndJob(testCandidate, testJob)).thenReturn(false);
        when(matchService.computeMatchScore(testCandidate, testJob, testSettings)).thenReturn(90);
        when(applicationRepo.save(any(Application.class))).thenAnswer(inv -> {
            Application app = inv.getArgument(0);
            app.setId(UUID.randomUUID());
            return app;
        });

        // Act
        int count = aiApplyService.runAutoApply("candidate@test.com");

        // Assert — all passed and applied
        assertEquals(1, count);
    }

    /* =====================================================================
     *  processScheduledAutoApply() — 1 test        Total: ~1 second
     *
     *  Note: This method is @Scheduled and runs every hour. We test that
     *  it correctly fetches ready settings and calls runAutoApply for each.
     * ===================================================================== */

    /* >>> processScheduledAutoApply: Processes ready candidates <<<
     *  Time: ~1 second */
    @Test
    void processScheduledAutoApply_ProcessesReadyCandidates() {
        // Arrange — create a second candidate/settings pair
        Candidate secondCandidate = new Candidate();
        secondCandidate.setEmail("candidate2@test.com");

        AIApplySettings secondSettings = new AIApplySettings();
        secondSettings.setCandidate(secondCandidate);
        secondSettings.setEnabled(true);

        when(settingsRepo.findSettingsReadyToRun(any(LocalTime.class), any(LocalDateTime.class)))
                .thenReturn(List.of(testSettings, secondSettings));

        // Mock runAutoApply for both candidates
        when(systemConfigRepo.findByConfigKey("ai_auto_apply_enabled"))
                .thenReturn(Optional.of(globalEnabledConfig));
        when(candidateRepo.findByEmail("candidate@test.com")).thenReturn(Optional.of(testCandidate));
        when(candidateRepo.findByEmail("candidate2@test.com")).thenReturn(Optional.of(secondCandidate));
        when(settingsRepo.findByCandidateEmail("candidate@test.com")).thenReturn(Optional.of(testSettings));
        when(settingsRepo.findByCandidateEmail("candidate2@test.com")).thenReturn(Optional.of(secondSettings));

        // No active jobs for either candidate
        when(jobRepo.findActiveApprovedJobs(any(LocalDateTime.class))).thenReturn(new ArrayList<>());

        // Act
        aiApplyService.processScheduledAutoApply();

        // Assert — both candidates were processed
        verify(settingsRepo).findSettingsReadyToRun(any(LocalTime.class), any(LocalDateTime.class));
        verify(candidateRepo).findByEmail("candidate@test.com");
        verify(candidateRepo).findByEmail("candidate2@test.com");
    }

    /* >>> processScheduledAutoApply: Continues processing even if one candidate fails <<<
     *  Time: ~1 second */
    @Test
    void processScheduledAutoApply_ContinuesOnError() {
        // Arrange — first candidate throws, second should still be processed
        AIApplySettings failingSettings = new AIApplySettings();
        Candidate failingCandidate = new Candidate();
        failingCandidate.setEmail("failing@test.com");
        failingSettings.setCandidate(failingCandidate);
        failingSettings.setEnabled(true);

        when(settingsRepo.findSettingsReadyToRun(any(LocalTime.class), any(LocalDateTime.class)))
                .thenReturn(List.of(failingSettings, testSettings));

        // First candidate fails
        when(systemConfigRepo.findByConfigKey("ai_auto_apply_enabled"))
                .thenReturn(Optional.of(globalEnabledConfig));
        when(candidateRepo.findByEmail("failing@test.com")).thenThrow(new RuntimeException("DB Error"));

        // Second candidate succeeds
        when(candidateRepo.findByEmail("candidate@test.com")).thenReturn(Optional.of(testCandidate));
        when(settingsRepo.findByCandidateEmail("candidate@test.com")).thenReturn(Optional.of(testSettings));
        when(jobRepo.findActiveApprovedJobs(any(LocalDateTime.class))).thenReturn(new ArrayList<>());

        // Act — should not throw despite the first candidate's error
        aiApplyService.processScheduledAutoApply();

        // Assert — second candidate was still processed
        verify(candidateRepo).findByEmail("candidate@test.com");
    }

    /* =====================================================================
     *  toResponse() — 1 test        Total: ~1 second
     *
     *  This is a private helper method. We test it indirectly through
     *  getSettings and saveSettings, which use it to build responses.
     * ===================================================================== */

    /* >>> toResponse: Builds correct response with all fields <<<
     *  Time: ~1 second */
    @Test
    void toResponse_MapsAllFieldsCorrectly() {
        // Arrange — fetch existing settings which internally calls toResponse
        when(settingsRepo.findByCandidateEmail("candidate@test.com")).thenReturn(Optional.of(testSettings));
        when(applicationRepo.findByCandidateEmail("candidate@test.com")).thenReturn(new ArrayList<>());

        // Act
        AIApplySettingsResponse response = aiApplyService.getSettings("candidate@test.com");

        // Assert — all fields match
        assertEquals(testSettings.getId(), response.getId());
        assertTrue(response.isEnabled());
        assertEquals(70, response.getMatchThreshold());
        assertEquals("09:00", response.getScheduleTime());
        assertEquals("Java, Spring Boot", response.getPreferredSkills());
        assertEquals("Mumbai", response.getPreferredLocation());
        assertEquals("FULL_TIME", response.getPreferredJobType());
        assertEquals(500000, response.getPreferredMinSalary());
        assertEquals("HYBRID", response.getPreferredWorkLocation());
        assertEquals("Developer, Engineer", response.getPreferredTitles());
        assertEquals(5, response.getPreferredMinExperience());
        assertEquals(0, response.getTotalAutoApplied()); // empty list
    }

}
