package com.vibeshare.Service.Impl;

import com.vibeshare.DTO.MessageDTO;
import com.vibeshare.DTO.Request.ChatRequest;
import com.vibeshare.DTO.Response.ConversationResponse;
import com.vibeshare.DTO.Response.UserResponse;
import com.vibeshare.Model.Conversation;
import com.vibeshare.Model.Message;
import com.vibeshare.Model.User;
import com.vibeshare.Repository.ConversationRepository;
import com.vibeshare.Repository.MessageRepository;
import com.vibeshare.Repository.UserRepository;
import com.vibeshare.Service.ChatService;
import com.vibeshare.Service.CloudinaryService;
import com.vibeshare.Service.NotificationService;
import com.vibeshare.DTO.Request.CreateNotificationRequest;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChatServiceImpl implements ChatService {

    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;
    private final UserRepository userRepository;
    private final CloudinaryService cloudinaryService;
    private final NotificationService notificationService;
    private final SimpMessagingTemplate messagingTemplate;

    @Override
    @Transactional
    public ConversationResponse createOrGetConversation(ChatRequest request, Long currentUserId) {
        User currentUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (request.getIsGroup() == null || !request.getIsGroup()) {
            if (request.getRecipientId() == null) {
                throw new RuntimeException("Recipient ID must not be null for one-to-one chat");
            }
            User otherUser = userRepository.findById(request.getRecipientId())
                    .orElseThrow(() -> new RuntimeException("Recipient not found"));

            // Use the direct query first
            Optional<Conversation> existing = conversationRepository.findDirectConversation(currentUser, otherUser);
            if (existing.isPresent()) {
                return mapToConversationResponse(existing.get());
            }

            // Fallback manual check
            List<Conversation> conversations = conversationRepository.findConversationsByUserId(currentUser.getId());
            for (Conversation conv : conversations) {
                if (!conv.isGroup() && conv.getUsers().size() == 2 && conv.getUsers().contains(otherUser)) {
                    return mapToConversationResponse(conv);
                }
            }

            // Create new
            Set<User> users = new HashSet<>();
            users.add(currentUser);
            users.add(otherUser);
            Conversation conversation = Conversation.builder()
                    .users(users)
                    .isGroup(false)
                    .createdAt(LocalDateTime.now())
                    .build();
            return mapToConversationResponse(conversationRepository.save(conversation));
        } else {
            // Group chat logic
            if (request.getUserIds() == null || request.getUserIds().isEmpty()) {
                throw new RuntimeException("User IDs must not be empty for group chat");
            }
            Set<User> users = request.getUserIds().stream()
                    .map(id -> userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found")))
                    .collect(Collectors.toSet());
            users.add(currentUser);

            Conversation conversation = Conversation.builder()
                    .users(users)
                    .isGroup(true)
                    .chatName(request.getChatName())
                    .createdAt(LocalDateTime.now())
                    .build();
            return mapToConversationResponse(conversationRepository.save(conversation));
        }
    }

    @Override
    public List<ConversationResponse> getUserConversations(Long userId) {
        return conversationRepository.findConversationsByUserId(userId).stream()
                .map(this::mapToConversationResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public MessageDTO sendMessage(MessageDTO messageDTO, Long senderId) {
        Conversation conversation = conversationRepository.findById(messageDTO.getConversationId())
                .orElseThrow(() -> new RuntimeException("Conversation not found"));

        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Message message = Message.builder()
                .conversation(conversation)
                .sender(sender)
                .content(messageDTO.getContent())
                .attachmentUrl(messageDTO.getAttachmentUrl())
                .timestamp(LocalDateTime.now())
                .type(messageDTO.getType() != null ? messageDTO.getType() : Message.MessageType.TEXT)
                .isRead(false)
                .build();

        message = messageRepository.save(message);

        conversation.setLastMessage(message);
        conversation.setLastMessageTimestamp(message.getTimestamp());
        conversationRepository.save(conversation);

        // Send Notification to other users in conversation
        final Message savedMsg = message;
        conversation.getUsers().stream()
                .filter(user -> !user.getId().equals(senderId))
                .forEach(recipient -> {
                    CreateNotificationRequest notificationRequest = new CreateNotificationRequest();
                    notificationRequest.setRecipientId(recipient.getId());
                    notificationRequest.setActorId(senderId);
                    notificationRequest.setType("MESSAGE");
                    notificationRequest.setMessage("sent you a message");
                    notificationRequest.setSourceId(savedMsg.getConversation().getId().toString());
                    notificationService.createAndSend(notificationRequest);
                    
                    // Send real-time message to user-specific queue (for Global Toasts)
                    // The client subscribes to /user/queue/messages
                    messagingTemplate.convertAndSendToUser(
                        recipient.getEmail(), 
                        "/queue/messages", 
                        mapToMessageDTO(savedMsg)
                    );
                });

        return mapToMessageDTO(message);
    }

    @Override
    public List<MessageDTO> getConversationMessages(Long conversationId) {
        return messageRepository.findByConversationIdOrderByTimestampAsc(conversationId).stream()
                .map(this::mapToMessageDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void markAsRead(Long messageId) {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Message not found"));
        message.setRead(true);
        messageRepository.save(message);
    }

    @Override
    public String uploadAttachment(org.springframework.web.multipart.MultipartFile file) {
        return cloudinaryService.uploadFile(file);
    }

    private ConversationResponse mapToConversationResponse(Conversation conversation) {
        return ConversationResponse.builder()
                .id(conversation.getId())
                .isGroup(conversation.isGroup())
                .chatName(conversation.getChatName())
                .chatImage(conversation.getChatImage())
                .users(conversation.getUsers().stream().map(this::mapToUserResponse).collect(Collectors.toList()))
                .lastMessage(conversation.getLastMessage() != null ? mapToMessageDTO(conversation.getLastMessage()) : null)
                .createdAt(conversation.getCreatedAt())
                .build();
    }

    private MessageDTO mapToMessageDTO(Message message) {
        return MessageDTO.builder()
                .id(message.getId())
                .conversationId(message.getConversation().getId())
                .senderId(message.getSender().getId())
                .senderName(message.getSender().getUsername())
                .content(message.getContent())
                .attachmentUrl(message.getAttachmentUrl())
                .timestamp(message.getTimestamp())
                .type(message.getType())
                .isRead(message.isRead())
                .build();
    }

    private UserResponse mapToUserResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .name(user.getName())
                .email(user.getEmail())
                .bio(user.getBio())
                .profilePic(user.getProfilePic())
                .isOnline(user.isOnline())
                .lastSeen(user.getLastSeen())
                .build();
    }
}
