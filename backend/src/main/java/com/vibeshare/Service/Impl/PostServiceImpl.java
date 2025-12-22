package com.vibeshare.Service.Impl;

import com.vibeshare.DTO.Request.CreatePostRequest;
import com.vibeshare.DTO.Response.PostResponse;
import com.vibeshare.Model.Post;
import com.vibeshare.Model.User;
import com.vibeshare.Repository.BookmarkRepository;
import com.vibeshare.Repository.FollowerRepository;
import com.vibeshare.Repository.PostRepository;
import com.vibeshare.Repository.UserRepository;
import com.vibeshare.Service.CloudinaryService;
import com.vibeshare.Service.PostService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PostServiceImpl implements PostService {

    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final CloudinaryService cloudinaryService;
    private final BookmarkRepository bookmarkRepository;
    private final FollowerRepository followerRepository;

    /* ================= CREATE ================= */

    @Override
    @Transactional
    public PostResponse createPost(CreatePostRequest request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Post post = new Post();
        post.setUser(user);
        post.setContent(request.getContent());
        if (request.getType() != null) {
            post.setType(Post.PostType.valueOf(request.getType().toUpperCase()));
        }

        postRepository.save(post);
        return toDto(post, user.getId());
    }

    @Override
    @Transactional
    public PostResponse createPostWithImage(Long userId, String content, String type, MultipartFile file) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String imageUrl = cloudinaryService.uploadFile(file);

        Post post = new Post();
        post.setUser(user);
        post.setContent(content);
        post.setImageUrl(imageUrl);
        post.setType(Post.PostType.valueOf(type.toUpperCase()));

        postRepository.save(post);
        return toDto(post, userId);
    }

    @Override
    @Transactional
    public PostResponse createPostWithVideo(Long userId, String content, String type, MultipartFile file) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String videoUrl = cloudinaryService.uploadFile(file);

        Post post = new Post();
        post.setUser(user);
        post.setContent(content);
        post.setVideoUrl(videoUrl);
        post.setType(Post.PostType.valueOf(type.toUpperCase()));

        postRepository.save(post);
        return toDto(post, userId);
    }

    /* ================= READ ================= */

    @Override
    public List<PostResponse> getFeed(Long currentUserId) {
        List<Long> followingIds = userRepository.findFollowingIds(currentUserId);
        
        List<Post> posts;
        if (followingIds.isEmpty()) {
            posts = postRepository.findByTypeNotOrderByCreatedAtDesc(Post.PostType.STORY);
        } else {
            posts = postRepository.findPostsByUsers(followingIds);
            if (posts.isEmpty()) {
                 posts = postRepository.findByTypeNotOrderByCreatedAtDesc(Post.PostType.STORY);
            }
        }

        return posts.stream()
                .map(post -> toDto(post, currentUserId))
                .toList();
    }

    @Override
    public List<PostResponse> getPostsByUserId(Long profileUserId, Long currentUserId) {
        return postRepository.findByUserIdOrderByCreatedAtDesc(profileUserId)
                .stream()
                .map(post -> toDto(post, currentUserId))
                .toList();
    }

    @Override
    public PostResponse getPostById(Long postId, Long currentUserId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        return toDto(post, currentUserId);
    }

    /* ================= DELETE ================= */

    @Override
    @Transactional
    public void deletePost(Long postId, Long userId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        if (!post.getUser().getId().equals(userId)) {
            throw new RuntimeException("Not authorized");
        }

        postRepository.delete(post);
    }

    /* ================= LIKE / UNLIKE ================= */

    @Override
    @Transactional
    public PostResponse likePost(Long postId, Long userId) {

        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!user.getLikedPosts().contains(post)) {
            user.getLikedPosts().add(post);
            post.getLikedByUsers().add(user); // keep in sync
        }

        return toDto(post, userId);
    }


    @Override
    @Transactional
    public PostResponse unlikePost(Long postId, Long userId) {

        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.getLikedPosts().remove(post);
        post.getLikedByUsers().remove(user);

        return toDto(post, userId);
    }

    @Override
    @Transactional
    public PostResponse incrementViews(Long postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));
        post.setViewCount(post.getViewCount() + 1);
        return toDto(post, null);
    }

    @Override
    public List<PostResponse> getReels(Long currentUserId) {
        return postRepository.findByTypeOrderByCreatedAtDesc(Post.PostType.REEL)
                .stream()
                .map(post -> toDto(post, currentUserId))
                .toList();
    }

    @Override
    public List<PostResponse> getStories() {
        return postRepository.findByTypeOrderByCreatedAtDesc(Post.PostType.STORY)
                .stream()
                .map(post -> toDto(post, null))
                .toList();
    }

    /* ================= DTO MAPPER ================= */

    private PostResponse toDto(Post post, Long currentUserId) {

        boolean isLiked = post.getLikedByUsers()
                .stream()
                .anyMatch(u -> u.getId().equals(currentUserId));

        boolean isSaved = bookmarkRepository
                .existsByUserIdAndPostId(currentUserId, post.getId());

        int likeCount = post.getLikedByUsers() == null
                ? 0
                : post.getLikedByUsers().size();

        boolean isFollowed = false;
        if (currentUserId != null && !post.getUser().getId().equals(currentUserId)) {
            isFollowed = followerRepository.existsByFollowerIdAndFollowingId(currentUserId, post.getUser().getId());
        }

        return new PostResponse(
                post.getId(),
                post.getUser().getId(),
                post.getUser().getUsername(),
                post.getUser().getName(),
                post.getContent(),
                post.getImageUrl(),
                post.getVideoUrl(),
                post.getCreatedAt(),
                likeCount,
                post.getViewCount(),
                post.getType() != null ? post.getType().name() : "POST",
                isLiked,
                isSaved,
                isFollowed
        );
    }



}
