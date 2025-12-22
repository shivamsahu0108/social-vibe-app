package com.vibeshare.Controller;

import com.vibeshare.DTO.Request.CreatePostRequest;
import com.vibeshare.DTO.Response.PostResponse;
import com.vibeshare.Service.PostService;
import com.vibeshare.Util.AuthUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
public class PostController {

    private final PostService postService;

    @PostMapping
    public ResponseEntity<PostResponse> createPost(
            @RequestBody CreatePostRequest request
    ) {
        return ResponseEntity.ok(postService.createPost(request));
    }

    @PostMapping("/with-image")
    public ResponseEntity<PostResponse> createPostWithImage(
            @RequestParam(required = false) String content,
            @RequestParam(defaultValue = "POST") String type,
            @RequestParam MultipartFile file
    ) {
        return ResponseEntity.ok(
                postService.createPostWithImage(
                        AuthUtil.getCurrentUserId(),
                        content,
                        type,
                        file
                )
        );
    }

    @PostMapping("/with-video")
    public ResponseEntity<PostResponse> createPostWithVideo(
            @RequestParam(required = false) String content,
            @RequestParam(defaultValue = "REEL") String type,
            @RequestParam MultipartFile file
    ) {
        return ResponseEntity.ok(
                postService.createPostWithVideo(
                        AuthUtil.getCurrentUserId(),
                        content,
                        type,
                        file
                )
        );
    }

    @GetMapping("/feed")
    public ResponseEntity<List<PostResponse>> getFeed() {
        return ResponseEntity.ok(
                postService.getFeed(AuthUtil.getCurrentUserId())
        );
    }

    @GetMapping("/reels")
    public ResponseEntity<List<PostResponse>> getReels() {
        return ResponseEntity.ok(postService.getReels(AuthUtil.getCurrentUserId()));
    }

    @GetMapping("/stories")
    public ResponseEntity<List<PostResponse>> getStories() {
        return ResponseEntity.ok(postService.getStories());
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<PostResponse>> getPostsByUser(
            @PathVariable Long userId
    ) {
        return ResponseEntity.ok(
                postService.getPostsByUserId(
                        userId,
                        AuthUtil.getCurrentUserId()
                )
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<PostResponse> getPostById(@PathVariable Long id) {
        return ResponseEntity.ok(
                postService.getPostById(
                        id,
                        AuthUtil.getCurrentUserId()
                )
        );
    }

    @PostMapping("/{postId}/like")
    public ResponseEntity<PostResponse> likePost(@PathVariable Long postId) {
        return ResponseEntity.ok(
                postService.likePost(postId, AuthUtil.getCurrentUserId())
        );
    }

    @DeleteMapping("/{postId}/like")
    public ResponseEntity<PostResponse> unlikePost(@PathVariable Long postId) {
        System.out.println(postId);
        return ResponseEntity.ok(
                postService.unlikePost(postId, AuthUtil.getCurrentUserId())
        );
    }

    @PutMapping("/{postId}/view")
    public ResponseEntity<PostResponse> incrementViews(@PathVariable Long postId) {
        return ResponseEntity.ok(postService.incrementViews(postId));
    }

    @DeleteMapping("/{postId}")
    public ResponseEntity<Void> deletePost(@PathVariable Long postId) {
        postService.deletePost(postId, AuthUtil.getCurrentUserId());
        return ResponseEntity.ok().build();
    }
}
