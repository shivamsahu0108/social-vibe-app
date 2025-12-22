package com.vibeshare.Controller;

import com.vibeshare.DTO.MessageDTO;
import com.vibeshare.Model.User;
import com.vibeshare.Service.ChatService;
import com.vibeshare.Service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.security.Principal;
import java.util.Map;

@Controller
@RequiredArgsConstructor
public class ChatWsController {

    private final ChatService chatService;
    private final UserService userService;
    private final SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/chat.send")
    public void sendMessage(@Payload MessageDTO messageDTO, Principal principal) {
        User sender = userService.getUserByEmail(principal.getName());
        MessageDTO savedMessage = chatService.sendMessage(messageDTO, sender.getId());
        
        // Broadcast to the conversation topic
        messagingTemplate.convertAndSend("/topic/conversation/" + messageDTO.getConversationId(), savedMessage);
    }

    @MessageMapping("/chat.typing")
    public void handleTyping(@Payload Map<String, Object> payload, Principal principal) {
        Long conversationId = Long.valueOf(payload.get("conversationId").toString());
        boolean isTyping = (boolean) payload.get("isTyping");
        User user = userService.getUserByEmail(principal.getName());
        
        Map<String, Object> response = Map.of(
                "username", user.getUsername(),
                "isTyping", isTyping,
                "conversationId", conversationId
        );
        
        messagingTemplate.convertAndSend("/topic/conversation/" + conversationId + "/typing", (Object) response);
    }

    @MessageMapping("/chat.read")
    public void handleReadReceipt(@Payload Map<String, Object> payload, Principal principal) {
        Long messageId = Long.valueOf(payload.get("messageId").toString());
        Long conversationId = Long.valueOf(payload.get("conversationId").toString());
        User user = userService.getUserByEmail(principal.getName());
        
        chatService.markAsRead(messageId);
        
        Map<String, Object> response = Map.of(
                "messageId", messageId,
                "conversationId", conversationId,
                "readerUsername", user.getUsername()
        );
        
        messagingTemplate.convertAndSend("/topic/conversation/" + conversationId + "/read", (Object) response);
    }
}
