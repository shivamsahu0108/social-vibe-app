package com.vibeshare.Controller;

import com.vibeshare.DTO.Request.CreateNotificationRequest;
import com.vibeshare.DTO.NotificationResponse;
import com.vibeshare.Service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
// ✅ Add these imports
import org.springframework.http.MediaType;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {
    private final NotificationService notificationService;

    // ✅ Add this Endpoint for Real-time Connection
    @GetMapping(path = "/stream/{userId}", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter streamNotifications(@PathVariable Long userId) {
        return notificationService.createSubscription(userId);
    }

    // Create (manual) — useful for testing
    @PostMapping
    public ResponseEntity<NotificationResponse> create(@RequestBody CreateNotificationRequest req) {
        return ResponseEntity.ok(notificationService.createAndSend(req));
    }

    // Get all notifications for a user
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<NotificationResponse>> getForUser(@PathVariable Long userId) {
        return ResponseEntity.ok(notificationService.getNotificationsForUser(userId));
    }

    // Get unread only
    @GetMapping("/user/{userId}/unread")
    public ResponseEntity<List<NotificationResponse>> getUnread(@PathVariable Long userId) {
        return ResponseEntity.ok(notificationService.getUnreadNotificationsForUser(userId));
    }

    // Mark one read
    @PostMapping("/{id}/read")
    public ResponseEntity<Void> markRead(@PathVariable Long id) {
        notificationService.markAsRead(id);
        return ResponseEntity.ok().build();
    }

    // Mark all read for user
    @PostMapping("/user/{userId}/read-all")
    public ResponseEntity<Void> markAllRead(@PathVariable Long userId) {
        notificationService.markAllAsRead(userId);
        return ResponseEntity.ok().build();
    }
}