package com.itjob.services.impl;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.stereotype.Service;

import com.itjob.entities.SystemConfig;
import com.itjob.repository.SystemConfigRepo;
import com.itjob.services.EmailService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailServiceImpl implements EmailService {

    private final SystemConfigRepo systemConfigRepo;

    @Value("${app.smtp.password:}")
    private String smtpPasswordFromProperties;

    private String getConfigValue(String key, String defaultValue) {
        Optional<SystemConfig> config = systemConfigRepo.findByConfigKey(key);
        return config.map(SystemConfig::getConfigValue).orElse(defaultValue);
    }

    /**
     * Returns the SMTP password. Checks application.properties first (via @Value),
     * then falls back to the system_config database table.
     */
    private String getSmtpPassword() {
        if (smtpPasswordFromProperties != null && !smtpPasswordFromProperties.isEmpty()) {
            return smtpPasswordFromProperties;
        }
        String dbPassword = getConfigValue("smtp_password", "");
        if (!dbPassword.isEmpty()) {
            log.info("Using SMTP password from system_config (fallback)");
            return dbPassword;
        }
        return "";
    }

    private JavaMailSenderImpl createMailSender() {
        String host = getConfigValue("smtp_host", "smtp.gmail.com");
        String portStr = getConfigValue("smtp_port", "587");
        String username = getConfigValue("smtp_username", "");
        String password = getSmtpPassword();

        int port;
        try {
            port = Integer.parseInt(portStr);
        } catch (NumberFormatException e) {
            port = 587;
        }

        JavaMailSenderImpl mailSender = new JavaMailSenderImpl();
        mailSender.setHost(host);
        mailSender.setPort(port);
        mailSender.setUsername(username);
        mailSender.setPassword(password);

        java.util.Properties props = mailSender.getJavaMailProperties();
        props.put("mail.transport.protocol", "smtp");
        props.put("mail.smtp.auth", "true");
        props.put("mail.smtp.starttls.enable", "true");
        props.put("mail.debug", "false");

        return mailSender;
    }

    @Override
    public void sendOtpEmail(String toEmail, String otp, String userType) {
        String senderEmail = getConfigValue("smtp_sender_email", "noreply@ithunt.com");
        String senderName = getConfigValue("smtp_sender_name", "IT Job Hunt");
        String websiteName = getConfigValue("general_website_name", "IT Job Hunt");

        JavaMailSenderImpl mailSender = createMailSender();

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(senderEmail);
        message.setTo(toEmail);
        message.setSubject("Verification Code for your " + userType + " Account - " + senderName);

        String emailBody =
                "To ensure the security of your " + userType + " account on " + websiteName + ", we require you to verify your identity.\n\n" +
                "Please use the following One-Time Password (OTP) to complete your login/registration process:\n\n" +
                "Your Verification Code: " + otp + "\n\n" +
                "This code is valid for the next few minutes. For your security, please do not share this code with anyone.\n\n" +
                "If you did not request this verification, please disregard this email.\n\n" +
                "Best regards,\n\n" +
                "The " + websiteName + " Team";

        message.setText(emailBody);
        mailSender.send(message);
    }

    @Override
    public void sendTestEmail(String toEmail) {
        String websiteName = getConfigValue("general_website_name", "IT Job Hunt");

        JavaMailSenderImpl mailSender = createMailSender();

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(getConfigValue("smtp_sender_email", "noreply@ithunt.com"));
        message.setTo(toEmail);
        message.setSubject("Test Email - SMTP Configuration - " + websiteName);

        String emailBody =
                "This is a test email from " + websiteName + ".\n\n" +
                "If you received this email, your SMTP configuration is working correctly.\n\n" +
                "Best regards,\n" +
                "The " + websiteName + " Team";

        message.setText(emailBody);
        mailSender.send(message);
    }
}
