package com.itjob.dto;

import com.itjob.entities.Enums.Role;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Data
@Getter
@Setter
@AllArgsConstructor
public class AuthResponse {

    private String accessToken;
    
    private String refreshToken;

    private Role role;

    private boolean profileCompleted;

    public AuthResponse() {
    }

    public AuthResponse(
            String accessToken,
            String refreshToken) {

        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
    }
}
