package com.vibeshare.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NotificationResponse {
    private Long id;
    private Long recipientId;
    private Long actorId;
    private String actorUsername;
    private String type;
    private String message;
    private String sourceId;
    private boolean readFlag;
    private Instant createdAt;
}
