package com.vibeshare.Controller;

import com.vibeshare.DTO.MessageDTO;
import com.vibeshare.DTO.Request.ChatRequest;
import com.vibeshare.DTO.Response.ConversationResponse;
import com.vibeshare.Model.User;
import com.vibeshare.Service.ChatService;
import com.vibeshare.Service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;
    private final UserService userService;

    @PostMapping("/conversation")
    public ResponseEntity<ConversationResponse> createOrGetConversation(@RequestBody ChatRequest request, Principal principal) {
        User user = userService.getUserByEmail(principal.getName());
        return ResponseEntity.ok(chatService.createOrGetConversation(request, user.getId()));
    }

    @GetMapping("/conversations")
    public ResponseEntity<List<ConversationResponse>> getUserConversations(Principal principal) {
        User user = userService.getUserByEmail(principal.getName());
        return ResponseEntity.ok(chatService.getUserConversations(user.getId()));
    }

    @GetMapping("/messages/{conversationId}")
    public ResponseEntity<List<MessageDTO>> getConversationMessages(@PathVariable Long conversationId) {
        return ResponseEntity.ok(chatService.getConversationMessages(conversationId));
    }

    @PostMapping("/attachment")
    public ResponseEntity<java.util.Map<String, String>> uploadAttachment(@RequestParam("file") org.springframework.web.multipart.MultipartFile file) {
        String url = chatService.uploadAttachment(file);
        return ResponseEntity.ok(java.util.Map.of("url", url));
    }
}
