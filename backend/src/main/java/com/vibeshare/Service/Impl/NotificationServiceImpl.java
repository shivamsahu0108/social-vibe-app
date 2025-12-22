package com.vibeshare.Service.Impl;

import com.vibeshare.DTO.NotificationResponse;
import com.vibeshare.DTO.Request.CreateNotificationRequest;
import com.vibeshare.Model.Notification;
import com.vibeshare.Model.User;
import com.vibeshare.Repository.NotificationRepository;
import com.vibeshare.Repository.UserRepository;
import com.vibeshare.Service.NotificationService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    // Store active SSE connections
    private final Map<Long, SseEmitter> emitters = new ConcurrentHashMap<>();

    @Override
    @Transactional
    public NotificationResponse createAndSend(CreateNotificationRequest request) {
        User recipient = userRepository.findById(request.getRecipientId())
                .orElseThrow(() -> new RuntimeException("Recipient not found"));

        User actor = null;
        if (request.getActorId() != null) {
            actor = userRepository.findById(request.getActorId())
                    .orElseThrow(() -> new RuntimeException("Actor not found"));
        }

        Notification notification = new Notification();
        notification.setRecipient(recipient);
        notification.setActor(actor);
        notification.setType(request.getType());
        notification.setMessage(request.getMessage());
        notification.setSourceId(request.getSourceId());
        notification.setReadFlag(false);

        NotificationResponse response;
        if ("MESSAGE".equals(request.getType())) {
            // Don't save chat messages to Notification History (User requested just a toaster)
            response = new NotificationResponse(
                    0L,
                    recipient.getId(),
                    actor == null ? null : actor.getId(),
                    actor == null ? null : actor.getUsername(),
                    request.getType(),
                    request.getMessage(),
                    request.getSourceId(),
                    false,
                    java.time.Instant.now()
            );
        } else {
            notification = notificationRepository.save(notification);
            response = toDto(notification);
        }

        // ✅ Send Real-time Update via SSE
        sendRealTimeNotification(recipient.getId(), response);

        return response;
    }

    @Override
    public List<NotificationResponse> getNotificationsForUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return notificationRepository.findByRecipientOrderByCreatedAtDesc(user).stream()
                .map(this::toDto).collect(Collectors.toList());
    }

    @Override
    public List<NotificationResponse> getUnreadNotificationsForUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return notificationRepository.findByRecipientAndReadFlagOrderByCreatedAtDesc(user, false)
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void markAsRead(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        notification.setReadFlag(true);
        notificationRepository.save(notification);
    }

    @Override
    @Transactional
    public void markAllAsRead(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        notificationRepository.findByRecipientAndReadFlagOrderByCreatedAtDesc(user, false)
                .forEach(notification -> {
                    notification.setReadFlag(true);
                    notificationRepository.save(notification);
                });
    }

    // ✅ SSE Subscription Logic
    @Override
    public SseEmitter createSubscription(Long userId) {
        // Set timeout to effectively infinite (or very long).
        // Note: Spring Boot default is ~30s if not set, leading to timeout errors.
        SseEmitter emitter = new SseEmitter(Long.MAX_VALUE);

        emitters.put(userId, emitter);

        // Cleanup on completion/timeout/error
        emitter.onCompletion(() -> emitters.remove(userId));
        emitter.onTimeout(() -> emitters.remove(userId));
        emitter.onError((e) -> emitters.remove(userId));

        return emitter;
    }

    // ✅ Helper to push data to the emitter
    private void sendRealTimeNotification(Long userId, NotificationResponse notification) {
        SseEmitter emitter = emitters.get(userId);
        if (emitter != null) {
            try {
                emitter.send(SseEmitter.event().data(notification));
            } catch (IOException e) {
                // If sending fails, remove the dead emitter
                emitters.remove(userId);
            }
        }
    }

    private NotificationResponse toDto(Notification notification) {
        return new NotificationResponse(
                notification.getId(),
                notification.getRecipient().getId(),
                notification.getActor() == null ? null : notification.getActor().getId(),
                notification.getActor() == null ? null : notification.getActor().getUsername(),
                notification.getType(),
                notification.getMessage(),
                notification.getSourceId(),
                notification.isReadFlag(),
                notification.getCreatedAt()
        );
    }
}