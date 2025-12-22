package com.vibeshare.Service;

import com.vibeshare.DTO.NotificationResponse;
import com.vibeshare.DTO.Request.CreateNotificationRequest;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import java.util.List;

public interface NotificationService {
    NotificationResponse createAndSend(CreateNotificationRequest request);
    List<NotificationResponse> getNotificationsForUser(Long userId);
    List<NotificationResponse> getUnreadNotificationsForUser(Long userId);
    void markAsRead(Long notificationId);
    void markAllAsRead(Long userId);

    // ✅ ADD THIS METHOD
    SseEmitter createSubscription(Long userId);
}