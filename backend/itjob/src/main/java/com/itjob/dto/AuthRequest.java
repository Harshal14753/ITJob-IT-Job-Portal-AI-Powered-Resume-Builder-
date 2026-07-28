package com.itjob.dto;

import com.itjob.entities.Enums.Role;

import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Data
public class AuthRequest {

    private String email;

    private Role role;

}
