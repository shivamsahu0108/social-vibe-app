package com.vibeshare.Service.Impl;

import com.vibeshare.DTO.Request.CommentRequest;
import com.vibeshare.DTO.Response.CommentResponse;
import com.vibeshare.DTO.Response.UserResponse;
import com.vibeshare.Model.Comment;
import com.vibeshare.Model.Post;
import com.vibeshare.Model.User;
import com.vibeshare.Repository.CommentRepository;
import com.vibeshare.Repository.PostRepository;
import com.vibeshare.Repository.UserRepository;
import com.vibeshare.Service.CommentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
@Service
@RequiredArgsConstructor
public class CommentServiceImpl implements CommentService {

    private final CommentRepository commentRepository;
    private final UserRepository userRepository;
    private final PostRepository postRepository;

    @Override
    public CommentResponse addComment(CommentRequest request) {

        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Post post = postRepository.findById(request.getPostId())
                .orElseThrow(() -> new RuntimeException("Post not found"));

        Comment comment = new Comment();
        comment.setUser(user);
        comment.setPost(post);
        comment.setText(request.getText());

        commentRepository.save(comment);

        return mapCommentToResponse(comment, request.getUserId());
    }

    @Override
    public List<CommentResponse> getComments(Long postId) {

        Long currentUserId = null; // get from JWT if available

        return commentRepository
                .findByPostIdOrderByCreatedAtDesc(postId)
                .stream()
                .map(comment -> mapCommentToResponse(comment, currentUserId))
                .toList();
    }

    @Override
    public void deleteComment(Long commentId, Long userId) {

        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));

        if (!comment.getUser().getId().equals(userId)) {
            throw new RuntimeException("You are not authorized to delete this comment");
        }

        commentRepository.delete(comment);
    }

    // ================= MAPPERS =================

    private CommentResponse mapCommentToResponse(Comment comment, Long currentUserId) {

        User user = comment.getUser();

        return new CommentResponse(
                comment.getId(),
                user.getId(),
                user.getUsername(),
                comment.getText(),
                comment.getCreatedAt(),
                mapUserToResponse(user, currentUserId)
        );
    }

    private UserResponse mapUserToResponse(User targetUser, Long currentUserId) {

        boolean isFollowing = false;

        if (currentUserId != null) {
            isFollowing = targetUser.getFollowers()
                    .stream()
                    .anyMatch(f ->
                            f.getFollower().getId().equals(currentUserId)
                    );
        }

        return UserResponse.builder()
                .id(targetUser.getId())
                .username(targetUser.getUsername())
                .email(targetUser.getEmail())
                .name(targetUser.getName())
                .profilePic(targetUser.getProfilePic())
                .bio(targetUser.getBio())
                .isFollowing(isFollowing)
                .followersCount(targetUser.getFollowers().size())
                .followingCount(targetUser.getFollowing().size())
                .postsCount(0) // use repo if needed
                .isOnline(targetUser.isOnline())
                .lastSeen(targetUser.getLastSeen())
                .build();
    }
}
