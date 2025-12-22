package com.vibeshare.Service;

import com.vibeshare.DTO.Request.CreatePostRequest;
import com.vibeshare.DTO.Response.PostResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface PostService {

    /* ================= CREATE ================= */

    PostResponse createPost(CreatePostRequest request);

    PostResponse createPostWithImage(
            Long userId,
            String content,
            String type,
            MultipartFile file
    );

    PostResponse createPostWithVideo(
            Long userId,
            String content,
            String type,
            MultipartFile file
    );

    /* ================= READ ================= */

    // Feed (viewer context)
    List<PostResponse> getFeed(Long currentUserId);

    // Profile posts (viewer + profile owner)
    List<PostResponse> getPostsByUserId(
            Long profileUserId,
            Long currentUserId
    );

    // Single post
    PostResponse getPostById(
            Long postId,
            Long currentUserId
    );

    /* ================= DELETE ================= */

    void deletePost(Long postId, Long userId);

    /* ================= LIKE / UNLIKE ================= */

    // ✅ BOTH return updated post
    PostResponse likePost(Long postId, Long userId);

    PostResponse unlikePost(Long postId, Long userId);

    PostResponse incrementViews(Long postId);

    List<PostResponse> getReels(Long currentUserId);

    List<PostResponse> getStories();
}
