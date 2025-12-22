package com.vibeshare.Repository;

import com.vibeshare.Model.Conversation;
import com.vibeshare.Model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ConversationRepository extends JpaRepository<Conversation, Long> {

    @Query("SELECT c FROM Conversation c JOIN c.users u WHERE u.id = :userId ORDER BY c.lastMessageTimestamp DESC")
    List<Conversation> findConversationsByUserId(@Param("userId") Long userId);

    @Query("SELECT c FROM Conversation c WHERE c.isGroup = false AND :user1 MEMBER OF c.users AND :user2 MEMBER OF c.users")
    Optional<Conversation> findDirectConversation(@Param("user1") User user1, @Param("user2") User user2);
}
