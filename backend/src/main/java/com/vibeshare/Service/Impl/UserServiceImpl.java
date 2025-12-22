package com.vibeshare.Service.Impl;

import com.vibeshare.DTO.Request.UpdateUserRequest;
import com.vibeshare.DTO.Response.UserResponse;
import com.vibeshare.Model.Follower;
import com.vibeshare.Model.User;
import com.vibeshare.Repository.FollowerRepository;
import com.vibeshare.Repository.PostRepository;
import com.vibeshare.Repository.UserRepository;
import com.vibeshare.Service.CloudinaryService;
import com.vibeshare.Service.UserService;
import com.vibeshare.Util.AuthUtil;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final FollowerRepository followerRepository;
    private final CloudinaryService cloudinaryService;
    private final PostRepository postRepository;
    
    /* ================= GET USER ================= */

    @Override
    public User getUserByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));
    }

    @Override
    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));
    }

    @Override
    public UserResponse getUserResponse(Long id) {
        Long currentUserId = AuthUtil.getCurrentUserId();

        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return toResponse(user, currentUserId);
    }

    /* ================= UPDATE USER ================= */

    @Override
    public UserResponse updateUser(Long id, UpdateUserRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setUsername(request.getUsername());
        user.setName(request.getName());
        user.setBio(request.getBio());
        user.setEmail(request.getEmail());

        userRepository.save(user);

        Long currentUserId = AuthUtil.getCurrentUserId();
        return toResponse(user, currentUserId);
    }

    /* ================= PROFILE PICTURE ================= */

    @Override
    public UserResponse updateProfilePicture(Long id, MultipartFile file) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String imageUrl = cloudinaryService.uploadFile(file);
        user.setProfilePic(imageUrl);

        userRepository.save(user);

        Long currentUserId = AuthUtil.getCurrentUserId();
        return toResponse(user, currentUserId);
    }

    /* ================= SEARCH ================= */

    @Override
    public List<UserResponse> searchUsers(String keyword, Long currentUserId) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return List.of();
        }

        return userRepository.searchUsers(keyword, currentUserId)
                .stream()
                .map(u -> toResponse(u, currentUserId))
                .toList();
    }

    /* ================= FOLLOW ================= */

    @Override
    @Transactional
    public void followUser(Long userId, Long targetId) {

        if (userId.equals(targetId)) return;

        if (followerRepository.existsByFollowerIdAndFollowingId(userId, targetId)) {
            return;
        }

        User follower = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        User following = userRepository.findById(targetId)
                .orElseThrow(() -> new RuntimeException("Target user not found"));

        followerRepository.save(
                Follower.builder()
                        .follower(follower)
                        .following(following)
                        .build()
        );
    }

    @Override
    @Transactional
    public void unfollowUser(Long userId, Long targetId) {
        followerRepository.deleteByFollowerIdAndFollowingId(userId, targetId);
    }

    /* ================= FOLLOWERS / FOLLOWING ================= */

    @Override
    public List<UserResponse> getFollowers(Long id, Long currentUserId) {
        return followerRepository.findFollowers(id)
                .stream()
                .map(u -> toResponse(u, currentUserId))
                .toList();
    }

    @Override
    public List<UserResponse> getFollowing(Long id, Long currentUserId) {
        return followerRepository.findFollowing(id)
                .stream()
                .map(u -> toResponse(u, currentUserId))
                .toList();
    }

    /* ================= MAPPER ================= */

    private UserResponse toResponse(User user, Long currentUserId) {
        return UserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .name(user.getName())
                .bio(user.getBio())
                .profilePic(user.getProfilePic())
                .isFollowing(
                        currentUserId != null &&
                                followerRepository.existsByFollowerIdAndFollowingId(
                                        currentUserId, user.getId()
                                )
                )
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
                .build();
    }
}
