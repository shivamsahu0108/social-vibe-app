package com.vibeshare.DTO.Response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {
    private Long id;
    private String username;
    private String email;
    private String name;
    private String profilePic;
    private String bio;
    private Boolean isFollowing;
    private long followersCount;
    private long followingCount;
    private long postsCount;
    private Boolean isOnline;
    private java.time.LocalDateTime lastSeen;

}
