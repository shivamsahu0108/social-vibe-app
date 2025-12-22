package com.vibeshare.DTO.Request;

import lombok.Data;

@Data
public class LoginRequest {
    private String email;
    private String password;
}

