package com.vibeshare.DTO.Response;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class PostResponse {

    private Long id;
    private Long userId;
    private String username;
    private String name;
    private String content;
    private String imageUrl;
    private String videoUrl;
    private LocalDateTime createdAt;
    private int likeCount;
    private int viewCount;
    private String type;
    private boolean isLiked;
    private boolean isSaved;
    private boolean isFollowed;
}

