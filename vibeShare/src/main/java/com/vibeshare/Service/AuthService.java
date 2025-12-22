package com.vibeshare.Service;

import com.vibeshare.DTO.Response.AuthResponse;
import com.vibeshare.DTO.Request.LoginRequest;
import com.vibeshare.DTO.Request.RegisterRequest;

public interface AuthService {
    String register(RegisterRequest request) throws IllegalArgumentException;
    AuthResponse verifyAccount(String email, String otp);
    AuthResponse login(LoginRequest request) throws IllegalArgumentException;
    String refreshToken(String refreshToken);
    void forgotPassword(String email);
    void resetPassword(String token, String newPassword);

}
