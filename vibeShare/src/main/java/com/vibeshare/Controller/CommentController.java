package com.vibeshare.Controller;

import com.vibeshare.DTO.Request.CommentRequest;
import com.vibeshare.DTO.Response.CommentResponse;
import com.vibeshare.Service.CommentService;
import com.vibeshare.Util.AuthUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/comments")
@RequiredArgsConstructor
public class CommentController {
    private final CommentService commentService;

    @PostMapping
    public ResponseEntity<CommentResponse> addComment(@RequestBody CommentRequest request) {
        System.out.println(request);
        return ResponseEntity.ok(commentService.addComment(request));
    }

    @GetMapping("/{postId}")
    public ResponseEntity<List<CommentResponse>> getComments(@PathVariable Long postId) {
        return ResponseEntity.ok(commentService.getComments(postId));
    }

    @DeleteMapping("/{commentId}")
    public ResponseEntity<String> deleteComment(@PathVariable Long commentId
                                                ) {
        Long userId = AuthUtil.getCurrentUserId();
        commentService.deleteComment(commentId, userId);
        return ResponseEntity.ok("Successfully deleted comment");
    }
}
