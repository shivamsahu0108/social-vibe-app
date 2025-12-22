package com.vibeshare.Service;

import com.vibeshare.DTO.Request.UpdateUserRequest;
import com.vibeshare.DTO.Response.UserResponse;
import com.vibeshare.Model.User;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface UserService {

    User getUserByUsername(String username);
    User getUserByEmail(String email);

    UserResponse getUserResponse(Long id);

    UserResponse updateUser(Long id, UpdateUserRequest request);

    UserResponse updateProfilePicture(Long id, MultipartFile file);

    List<UserResponse> searchUsers(String keyword, Long currentUserId);

    List<UserResponse> getFollowers(Long id, Long currentUserId);

    List<UserResponse> getFollowing(Long id, Long currentUserId);

    void followUser(Long userId, Long targetId);

    void unfollowUser(Long userId, Long targetId);
}
