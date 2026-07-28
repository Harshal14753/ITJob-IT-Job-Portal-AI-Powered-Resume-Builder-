package com.itjob.dto;

import lombok.Data;

@Data
public class ContactRequest {
    private String name;
    private String email;
    private String phone;
    private String subject;
    private String message;
}
