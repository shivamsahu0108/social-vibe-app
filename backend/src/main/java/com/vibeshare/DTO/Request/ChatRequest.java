package com.vibeshare.DTO.Request;

import lombok.Data;
import java.util.List;

@Data
public class ChatRequest {
    private Long recipientId; // For one-to-one
    private List<Long> userIds; // For group
    private String chatName;
    private Boolean isGroup = false;
}
