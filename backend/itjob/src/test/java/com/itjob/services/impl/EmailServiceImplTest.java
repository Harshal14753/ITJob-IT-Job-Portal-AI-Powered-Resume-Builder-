package com.itjob.services.impl;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.MailException;

import com.itjob.entities.SystemConfig;
import com.itjob.repository.SystemConfigRepo;

@ExtendWith(MockitoExtension.class)
class EmailServiceImplTest {

    @Mock
    private SystemConfigRepo systemConfigRepo;

    @InjectMocks
    private EmailServiceImpl emailService;

    private SystemConfig hostConfig;
    private SystemConfig portConfig;
    private SystemConfig usernameConfig;
    private SystemConfig passwordConfig;
    private SystemConfig senderEmailConfig;
    private SystemConfig senderNameConfig;
    private SystemConfig websiteNameConfig;

    @BeforeEach
    void setUp() {
        hostConfig = createConfig("smtp_host", "smtp.example.com");
        portConfig = createConfig("smtp_port", "587");
        usernameConfig = createConfig("smtp_username", "test@example.com");
        passwordConfig = createConfig("smtp_password", "testpass123");
        senderEmailConfig = createConfig("smtp_sender_email", "noreply@example.com");
        senderNameConfig = createConfig("smtp_sender_name", "Test Platform");
        websiteNameConfig = createConfig("general_website_name", "Test Job Portal");
    }

    private SystemConfig createConfig(String key, String value) {
        SystemConfig config = new SystemConfig();
        config.setConfigKey(key);
        config.setConfigValue(value);
        return config;
    }

    private void mockSmtpAuthConfigs() {
        when(systemConfigRepo.findByConfigKey("smtp_host")).thenReturn(Optional.of(hostConfig));
        when(systemConfigRepo.findByConfigKey("smtp_port")).thenReturn(Optional.of(portConfig));
        when(systemConfigRepo.findByConfigKey("smtp_username")).thenReturn(Optional.of(usernameConfig));
        when(systemConfigRepo.findByConfigKey("smtp_password")).thenReturn(Optional.of(passwordConfig));
    }

    private void mockEmailContentConfigs() {
        when(systemConfigRepo.findByConfigKey("smtp_sender_email")).thenReturn(Optional.of(senderEmailConfig));
        when(systemConfigRepo.findByConfigKey("smtp_sender_name")).thenReturn(Optional.of(senderNameConfig));
        when(systemConfigRepo.findByConfigKey("general_website_name")).thenReturn(Optional.of(websiteNameConfig));
    }

    // ========== sendOtpEmail — Config Reading ==========

    @Test
    void sendOtpEmail_QueriesAllSevenConfigKeys() {
        mockSmtpAuthConfigs();
        mockEmailContentConfigs();

        assertThrows(MailException.class,
                () -> emailService.sendOtpEmail("user@test.com", "123456", "Candidate"));

        verify(systemConfigRepo).findByConfigKey("smtp_host");
        verify(systemConfigRepo).findByConfigKey("smtp_port");
        verify(systemConfigRepo).findByConfigKey("smtp_username");
        verify(systemConfigRepo).findByConfigKey("smtp_password");
        verify(systemConfigRepo).findByConfigKey("smtp_sender_email");
        verify(systemConfigRepo).findByConfigKey("smtp_sender_name");
        verify(systemConfigRepo).findByConfigKey("general_website_name");
    }

    @Test
    void sendOtpEmail_QueriesConfigsForRecruiterRole() {
        mockSmtpAuthConfigs();
        mockEmailContentConfigs();

        assertThrows(MailException.class,
                () -> emailService.sendOtpEmail("recruiter@test.com", "999999", "Recruiter"));

        verify(systemConfigRepo).findByConfigKey("smtp_host");
        verify(systemConfigRepo).findByConfigKey("smtp_sender_name");
        verify(systemConfigRepo).findByConfigKey("general_website_name");
    }

    // ========== sendOtpEmail — Fallback Behavior ==========

    @Test
    void sendOtpEmail_FallsBackToDefaultsWhenAllConfigsMissing() {
        when(systemConfigRepo.findByConfigKey(anyString())).thenReturn(Optional.empty());

        // Should still attempt connection with default smtp.gmail.com:587
        assertThrows(MailException.class,
                () -> emailService.sendOtpEmail("user@test.com", "123456", "Candidate"));

        verify(systemConfigRepo, atLeast(4)).findByConfigKey(anyString());
    }

    @Test
    void sendOtpEmail_FallsBackToPort587WhenPortIsInvalidText() {
        when(systemConfigRepo.findByConfigKey("smtp_host")).thenReturn(Optional.of(hostConfig));
        when(systemConfigRepo.findByConfigKey("smtp_port")).thenReturn(Optional.of(createConfig("smtp_port", "not-a-number")));
        when(systemConfigRepo.findByConfigKey("smtp_username")).thenReturn(Optional.of(usernameConfig));
        when(systemConfigRepo.findByConfigKey("smtp_password")).thenReturn(Optional.of(passwordConfig));
        mockEmailContentConfigs();

        // Parsing "not-a-number" should fall back to port 587
        assertThrows(MailException.class,
                () -> emailService.sendOtpEmail("user@test.com", "123456", "Candidate"));

        verify(systemConfigRepo).findByConfigKey("smtp_port");
    }

    @Test
    void sendOtpEmail_UsesEmptyPasswordWhenPasswordNotConfigured() {
        when(systemConfigRepo.findByConfigKey("smtp_host")).thenReturn(Optional.of(hostConfig));
        when(systemConfigRepo.findByConfigKey("smtp_port")).thenReturn(Optional.of(portConfig));
        when(systemConfigRepo.findByConfigKey("smtp_username")).thenReturn(Optional.of(usernameConfig));
        when(systemConfigRepo.findByConfigKey("smtp_password")).thenReturn(Optional.of(createConfig("smtp_password", "")));
        mockEmailContentConfigs();

        assertThrows(MailException.class,
                () -> emailService.sendOtpEmail("user@test.com", "123456", "Candidate"));

        verify(systemConfigRepo).findByConfigKey("smtp_password");
    }

    @Test
    void sendOtpEmail_UsesCustomPort465WhenConfigured() {
        when(systemConfigRepo.findByConfigKey("smtp_host")).thenReturn(Optional.of(hostConfig));
        when(systemConfigRepo.findByConfigKey("smtp_port")).thenReturn(Optional.of(createConfig("smtp_port", "465")));
        when(systemConfigRepo.findByConfigKey("smtp_username")).thenReturn(Optional.of(usernameConfig));
        when(systemConfigRepo.findByConfigKey("smtp_password")).thenReturn(Optional.of(passwordConfig));
        mockEmailContentConfigs();

        // Should attempt connection on port 465
        assertThrows(MailException.class,
                () -> emailService.sendOtpEmail("user@test.com", "123456", "Candidate"));

        verify(systemConfigRepo).findByConfigKey("smtp_port");
    }

    @Test
    void sendOtpEmail_SomeConfigsPresentSomeMissing_MixedAvailability() {
        // Only smtp_host and smtp_sender_email are configured — everything else is missing
        when(systemConfigRepo.findByConfigKey("smtp_host")).thenReturn(Optional.of(hostConfig));
        when(systemConfigRepo.findByConfigKey("smtp_port")).thenReturn(Optional.empty());
        when(systemConfigRepo.findByConfigKey("smtp_username")).thenReturn(Optional.empty());
        when(systemConfigRepo.findByConfigKey("smtp_password")).thenReturn(Optional.empty());
        when(systemConfigRepo.findByConfigKey("smtp_sender_email")).thenReturn(Optional.of(senderEmailConfig));
        when(systemConfigRepo.findByConfigKey("smtp_sender_name")).thenReturn(Optional.empty());
        when(systemConfigRepo.findByConfigKey("general_website_name")).thenReturn(Optional.empty());

        // Should use fallback defaults for missing configs
        assertThrows(MailException.class,
                () -> emailService.sendOtpEmail("user@test.com", "123456", "Candidate"));

        verify(systemConfigRepo).findByConfigKey("smtp_host");
        verify(systemConfigRepo).findByConfigKey("smtp_port");
        verify(systemConfigRepo).findByConfigKey("smtp_username");
        verify(systemConfigRepo).findByConfigKey("smtp_password");
        verify(systemConfigRepo).findByConfigKey("smtp_sender_email");
        verify(systemConfigRepo).findByConfigKey("smtp_sender_name");
        verify(systemConfigRepo).findByConfigKey("general_website_name");
    }

    // ========== sendTestEmail Tests ==========

    @Test
    void sendTestEmail_QueriesAllRequiredConfigs() {
        mockSmtpAuthConfigs();
        when(systemConfigRepo.findByConfigKey("smtp_sender_email")).thenReturn(Optional.of(senderEmailConfig));
        when(systemConfigRepo.findByConfigKey("general_website_name")).thenReturn(Optional.of(websiteNameConfig));

        assertThrows(MailException.class,
                () -> emailService.sendTestEmail("admin@example.com"));

        verify(systemConfigRepo).findByConfigKey("smtp_host");
        verify(systemConfigRepo).findByConfigKey("smtp_port");
        verify(systemConfigRepo).findByConfigKey("smtp_username");
        verify(systemConfigRepo).findByConfigKey("smtp_password");
        verify(systemConfigRepo).findByConfigKey("smtp_sender_email");
        verify(systemConfigRepo).findByConfigKey("general_website_name");
    }

    @Test
    void sendTestEmail_FallsBackToDefaultsWhenConfigsMissing() {
        when(systemConfigRepo.findByConfigKey(anyString())).thenReturn(Optional.empty());

        assertThrows(MailException.class,
                () -> emailService.sendTestEmail("admin@example.com"));

        verify(systemConfigRepo, atLeast(4)).findByConfigKey(anyString());
    }
}
