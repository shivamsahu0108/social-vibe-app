package com.vibeshare.Service;

import com.vibeshare.DTO.MessageDTO;
import com.vibeshare.DTO.Request.ChatRequest;
import com.vibeshare.DTO.Response.ConversationResponse;
import java.util.List;

public interface ChatService {
    ConversationResponse createOrGetConversation(ChatRequest request, Long currentUserId);
    List<ConversationResponse> getUserConversations(Long userId);
    MessageDTO sendMessage(MessageDTO messageDTO, Long senderId);
    List<MessageDTO> getConversationMessages(Long conversationId);
    void markAsRead(Long messageId);
    String uploadAttachment(org.springframework.web.multipart.MultipartFile file);
}
