package com.vibeshare.Service.Impl;

import com.vibeshare.DTO.Response.BookmarkResponse;
import com.vibeshare.Model.Bookmark;
import com.vibeshare.Model.Post;
import com.vibeshare.Model.User;
import com.vibeshare.Repository.BookmarkRepository;
import com.vibeshare.Repository.PostRepository;
import com.vibeshare.Repository.UserRepository;
import com.vibeshare.Service.BookmarkService;
import com.vibeshare.Util.AuthUtil;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class BookmarkServiceImpl implements BookmarkService {

    private final BookmarkRepository bookmarkRepository;
    private final UserRepository userRepository;
    private final PostRepository postRepository;

    // ================== ADD BOOKMARK ==================
    @Override
    @Transactional
    public BookmarkResponse addBookmark(Long postId) {

        Long userId = AuthUtil.getCurrentUserId();

        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        if (post.getUser().getId().equals(userId)) {
            throw new RuntimeException("You cannot bookmark your own post");
        }

        if (bookmarkRepository.existsByUserIdAndPostId(userId, postId)) {
            throw new RuntimeException("Post already bookmarked");
        }

        Bookmark bookmark = new Bookmark();
        bookmark.setUser(userRepository.getReferenceById(userId));
        bookmark.setPost(post);

        bookmarkRepository.save(bookmark);

        return toDto(bookmark);
    }


    // ================== REMOVE BOOKMARK ==================
    @Override
    public void removeBookmark(Long postId) {

        Long userId = AuthUtil.getCurrentUserId();

        bookmarkRepository.deleteByUserIdAndPostId(userId, postId);
    }

    // ================== GET MY BOOKMARKS ==================
    @Override
    public List<BookmarkResponse> getMyBookmarks() {

        Long userId = AuthUtil.getCurrentUserId();

        return bookmarkRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    // ================== CHECK BOOKMARK ==================
    @Override
    public boolean isBookmarked(Long postId) {

        Long userId = AuthUtil.getCurrentUserId();

        return bookmarkRepository.existsByUserIdAndPostId(userId, postId);
    }

    // ================== DTO MAPPER ==================
    private BookmarkResponse toDto(Bookmark bookmark) {
        return new BookmarkResponse(
                bookmark.getId(),
                bookmark.getUser().getId(),
                bookmark.getPost().getId(),
                bookmark.getCreatedAt()
        );
    }
}
