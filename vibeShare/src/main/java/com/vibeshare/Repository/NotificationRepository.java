package com.vibeshare.Repository;

import com.vibeshare.Model.Notification;
import com.vibeshare.Model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByRecipientOrderByCreatedAtDesc(User recipient);

    List<Notification> findByRecipientAndReadFlagOrderByCreatedAtDesc(User recipient, boolean readFlag);

    List<Notification> findByRecipientAndReadFlagFalseOrderByCreatedAtDesc(User recipient);

    List<Notification> findByRecipientAndReadFlagTrueOrderByCreatedAtDesc(User recipient);
}
