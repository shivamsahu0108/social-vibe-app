package com.vibeshare.DTO.Request;

import lombok.Data;

@Data
public class CreatePostRequest {
    private Long userId;
    private String content;
    private String type; // POST, REEL, STORY
}
