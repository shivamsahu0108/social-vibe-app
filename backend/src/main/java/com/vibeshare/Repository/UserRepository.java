package com.vibeshare.Repository;

import com.vibeshare.DTO.Response.UserResponse;
import com.vibeshare.Model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    boolean existsByEmail (String email);
    Optional<User> findByEmail (String email);
    boolean existsByUsername(String username);
    Optional<User> findByUsername(String username);
    List<User> findByUsernameContainingIgnoreCase(String username);
    Optional<User> findByResetPasswordToken(String token);
    
    @Query("SELECT f.follower FROM Follower f WHERE f.following.id = :userId")
    List<User> findFollowers(@Param("userId") Long userId);

    @Query("SELECT f.following FROM Follower f WHERE f.follower.id = :userId")
    List<User> findFollowing(@Param("userId") Long userId);

    @Query("SELECT f.following.id FROM Follower f WHERE f.follower.id = :userId")
    List<Long> findFollowingIds(@Param("userId") Long userId);

    @Query("""
        SELECT u FROM User u
        WHERE (
            LOWER(u.username) LIKE LOWER(CONCAT('%', :keyword, '%'))
            OR LOWER(u.name) LIKE LOWER(CONCAT('%', :keyword, '%'))
        )
        AND u.id <> :currentUserId
    """)
    List<User> searchUsers(
            @Param("keyword") String keyword,
            @Param("currentUserId") Long currentUserId
    );

}
