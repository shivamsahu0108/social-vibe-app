package com.vibeshare.DTO.Request;

import lombok.Data;

@Data
public class CommentRequest {
    private Long postId;
    private Long userId;
    private String text;
}
