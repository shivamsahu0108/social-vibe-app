package com.vibeshare.Controller;

import com.vibeshare.DTO.Request.UpdateUserRequest;
import com.vibeshare.DTO.Response.UserResponse;
import com.vibeshare.Model.User;
import com.vibeshare.Service.UserService;
import com.vibeshare.Util.AuthUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<UserResponse> me() {
        Long userId = AuthUtil.getCurrentUserId();
        return ResponseEntity.ok(userService.getUserResponse(userId));
    }

    @PutMapping("/me")
    public ResponseEntity<UserResponse> updateMe(@RequestBody UpdateUserRequest request) {

        Long userId = AuthUtil.getCurrentUserId();
        return ResponseEntity.ok(userService.updateUser(userId, request));
    }

    @PostMapping("/me/upload-profile")
    public ResponseEntity<UserResponse> uploadProfile(@RequestParam MultipartFile file) {
        Long userId = AuthUtil.getCurrentUserId();
        return ResponseEntity.ok(userService.updateProfilePicture(userId, file));
    }

    @GetMapping("/search")
    public ResponseEntity<List<UserResponse>> searchUsers(@RequestParam String keyword) {
        Long userId = AuthUtil.getCurrentUserId();
        return ResponseEntity.ok(userService.searchUsers(keyword, userId));
    }
    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> getUser(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getUserResponse(id));
    }


    @GetMapping("/{id}/followers")
    public ResponseEntity<List<UserResponse>> getFollowers(@PathVariable Long id) {
        Long userId = AuthUtil.getCurrentUserId();
        return ResponseEntity.ok(userService.getFollowers(id, userId));
    }

    @GetMapping("/{id}/following")
    public ResponseEntity<List<UserResponse>> getFollowing(@PathVariable Long id) {
        Long userId = AuthUtil.getCurrentUserId();
        return ResponseEntity.ok(userService.getFollowing(id, userId));
    }

    @PostMapping("/follow/{targetId}")
    public ResponseEntity<Void> followUser(@PathVariable Long targetId) {
        System.out.println(targetId);
        Long userId = AuthUtil.getCurrentUserId();
        userService.followUser(userId, targetId);
        return ResponseEntity.ok().build();
    }


    @DeleteMapping("/unfollow/{targetId}")
    public ResponseEntity<Void> unfollowUser(@PathVariable Long targetId) {
        Long userId = AuthUtil.getCurrentUserId();
        userService.unfollowUser(userId, targetId);
        return ResponseEntity.ok().build();
    }

}
