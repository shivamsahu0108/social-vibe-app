package com.vibeshare.Model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Entity
@Table(name = "notifications")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // recipient user (who receives the notification)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recipient_id", nullable = false)
    private User recipient;

    // actor user (who performed the action) - optional
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "actor_id")
    private User actor;

    @Column(nullable = false)
    private String type; // e.g. "FOLLOW", "LIKE", "COMMENT"

    @Column(columnDefinition = "TEXT")
    private String message; // human readable message

    private String sourceId; // optional id of resource (postId, commentId, etc)

    private boolean readFlag = false;


    private Instant createdAt = Instant.now();
}
