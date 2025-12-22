package com.vibeshare.DTO.Response;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.Instant;

@Data
@AllArgsConstructor
public class BookmarkResponse {
    private Long id;
    private Long userId;
    private Long postId;
    private Instant createdAt;
}
