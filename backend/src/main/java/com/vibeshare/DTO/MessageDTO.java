package com.vibeshare.DTO;

import com.vibeshare.Model.Message;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MessageDTO {
    private Long id;
    private Long conversationId;
    private Long senderId;
    private String senderName;
    private String content;
    private LocalDateTime timestamp;
    private Message.MessageType type;
    private String attachmentUrl;
    private Boolean isRead = false;
}
