package com.itjob.services;

import com.itjob.dto.AuthRequest;
import com.itjob.dto.AuthResponse;
import com.itjob.dto.VerifyOTPRequest;

public interface AuthService {

    public void getOtp(AuthRequest authRequest);

    public AuthResponse verifyOtp(VerifyOTPRequest verifyOTPRequest);

    public AuthResponse refreshToken(String refreshToken);

    public void logout(String email);

}
