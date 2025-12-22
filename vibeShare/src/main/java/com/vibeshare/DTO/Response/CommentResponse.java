package com.vibeshare.DTO.Response;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class CommentResponse {
    private Long id;
    private Long userId;
    private String username;
    private String text;
    private LocalDateTime createdAt;
    private UserResponse user;
}

