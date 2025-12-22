package com.vibeshare.DTO.Response;

import com.vibeshare.DTO.MessageDTO;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConversationResponse {
    private Long id;
    private Boolean isGroup = false;
    private String chatName;
    private String chatImage;
    private List<UserResponse> users;
    private MessageDTO lastMessage;
    private LocalDateTime createdAt;
}
