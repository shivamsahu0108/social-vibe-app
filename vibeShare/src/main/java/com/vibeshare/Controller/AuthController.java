package com.vibeshare.Controller;

import com.vibeshare.DTO.Request.LoginRequest;
import com.vibeshare.DTO.Request.RegisterRequest;
import com.vibeshare.DTO.Request.ForgotPasswordRequest;
import com.vibeshare.DTO.Request.ResetPasswordRequest;
import com.vibeshare.DTO.Request.VerifyAccountRequest;
import com.vibeshare.DTO.Response.AuthResponse;
import com.vibeshare.DTO.Response.UserResponse;
import com.vibeshare.Model.User;
import com.vibeshare.Repository.FollowerRepository;
import com.vibeshare.Repository.PostRepository;
import com.vibeshare.Repository.UserRepository;
import com.vibeshare.Service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final UserRepository userRepository;
    private final FollowerRepository followerRepository;
    private final PostRepository postRepository;
    @PostMapping("/register")
    public ResponseEntity<String> register(
            @RequestBody RegisterRequest request
    ) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/verify-account")
    public ResponseEntity<AuthResponse> verifyAccount(
            @RequestBody VerifyAccountRequest request
    ) {
        return ResponseEntity.ok(authService.verifyAccount(request.getEmail(), request.getOtp()));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @RequestBody LoginRequest request
    ) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/refresh")
    public ResponseEntity<String> refresh(
            @RequestBody String refreshToken
    ) {
        return ResponseEntity.ok(authService.refreshToken(refreshToken));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(@RequestBody ForgotPasswordRequest request) {
        authService.forgotPassword(request.getEmail());
        return ResponseEntity.ok("Password reset email sent (check console)");
    }

    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(@RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request.getToken(), request.getNewPassword());
        return ResponseEntity.ok("Password has been reset successfully");
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponse> me(Authentication authentication) {

        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).build();
        }

        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Long currentUserId = user.getId();

        return ResponseEntity.ok(
                UserResponse.builder()
                        .id(user.getId())
                        .username(user.getUsername())
                        .name(user.getName())
                        .email(user.getEmail())
                        .bio(user.getBio())
                        .profilePic(user.getProfilePic())
                        .isFollowing(false) // you can’t follow yourself
                        .followersCount(
                                followerRepository.countByFollowingId(user.getId())
                        )
                        .followingCount(
                                followerRepository.countByFollowerId(user.getId())
                        )
                        .postsCount(
                                postRepository.countByUserId(user.getId())
                        )
                        .isOnline(user.isOnline())
                        .lastSeen(user.getLastSeen())
                        .build()
        );
    }

}

