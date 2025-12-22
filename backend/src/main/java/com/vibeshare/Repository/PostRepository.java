package com.vibeshare.Repository;

import com.vibeshare.Model.Post;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PostRepository extends JpaRepository<Post, Long> {
    List<Post> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<Post> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);
    long countByUserId(Long userId);
    @Query("SELECT p FROM Post p WHERE p.user.id IN :userIds AND p.type != 'STORY' ORDER BY p.createdAt DESC")
    List<Post> findPostsByUsers(@Param("userIds") List<Long> userIds);

    List<Post> findByTypeOrderByCreatedAtDesc(Post.PostType type);
    List<Post> findByTypeNotOrderByCreatedAtDesc(Post.PostType type);
}
