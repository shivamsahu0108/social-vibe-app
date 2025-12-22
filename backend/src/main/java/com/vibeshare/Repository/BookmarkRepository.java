package com.vibeshare.Repository;

import com.vibeshare.Model.Bookmark;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BookmarkRepository extends JpaRepository<Bookmark, Long> {

    boolean existsByUserIdAndPostId(Long userId, Long postId);

    void deleteByUserIdAndPostId(Long userId, Long postId);

    List<Bookmark> findByUserIdOrderByCreatedAtDesc(Long userId);
}
