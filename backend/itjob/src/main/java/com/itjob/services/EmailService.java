package com.itjob.services;

public interface EmailService {

    void sendOtpEmail(String toEmail, String otp, String userType);

    void sendTestEmail(String toEmail);

}
