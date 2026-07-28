package com.itjob.dto;

import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Data
@Getter
@Setter
public class VerifyOTPRequest {

    private String email;

    private String otp;

}
