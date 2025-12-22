package com.vibeshare.Config;

import com.vibeshare.Model.User;
import com.vibeshare.Repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.time.LocalDateTime;
import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class UserPresenceListener {

    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @EventListener
    public void handleWebSocketConnectListener(SessionConnectEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        String email = headerAccessor.getUser() != null ? headerAccessor.getUser().getName() : null;

        if (email != null) {
            userRepository.findByEmail(email).ifPresent(user -> {
                user.setOnline(true);
                userRepository.save(user);
                broadcastStatus(user.getUsername(), true);
                log.info("User connected: {}", user.getUsername());
            });
        }
    }

    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        String email = headerAccessor.getUser() != null ? headerAccessor.getUser().getName() : null;

        if (email != null) {
            userRepository.findByEmail(email).ifPresent(user -> {
                user.setOnline(false);
                user.setLastSeen(LocalDateTime.now());
                userRepository.save(user);
                broadcastStatus(user.getUsername(), false);
                log.info("User disconnected: {}", user.getUsername());
            });
        }
    }

    private void broadcastStatus(String username, boolean isOnline) {
        messagingTemplate.convertAndSend("/topic/user.status", (Object) Map.of(
                "username", username,
                "isOnline", isOnline,
                "lastSeen", LocalDateTime.now().toString()
        ));
    }
}
