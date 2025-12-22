package com.vibeshare.Service;

import com.vibeshare.DTO.Request.CommentRequest;
import com.vibeshare.DTO.Response.CommentResponse;
import org.w3c.dom.stylesheets.LinkStyle;

import java.util.List;

public interface CommentService {
    CommentResponse addComment(CommentRequest request);
    List<CommentResponse> getComments(Long postId);
    void deleteComment(Long commentId, Long userId);
}
