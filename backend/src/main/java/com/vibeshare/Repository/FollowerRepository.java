package com.vibeshare.Repository;

import com.vibeshare.Model.Follower;
import com.vibeshare.Model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FollowerRepository extends JpaRepository<Follower, Long> {

    boolean existsByFollowerIdAndFollowingId(Long followerId, Long followingId);

    void deleteByFollowerIdAndFollowingId(Long followerId, Long followingId);

    long countByFollowingId(Long userId);

    long countByFollowerId(Long userId);

    @Query("SELECT f.follower FROM Follower f WHERE f.following.id = :userId")
    List<User> findFollowers(@Param("userId") Long userId);

    @Query("SELECT f.following FROM Follower f WHERE f.follower.id = :userId")
    List<User> findFollowing(@Param("userId") Long userId);
}

