package com.vibeshare.DTO.Request;

import lombok.Data;

@Data
public class CreateNotificationRequest {
    private Long recipientId;
    private Long actorId;
    private String type;
    private String message;
    private String sourceId;
}
