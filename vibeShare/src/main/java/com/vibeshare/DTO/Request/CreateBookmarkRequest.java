package com.vibeshare.DTO.Request;

import lombok.Data;

@Data
public class CreateBookmarkRequest {
    private Long userId;
    private Long postId;
}
