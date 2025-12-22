package com.vibeshare.Controller;
import com.vibeshare.DTO.Response.BookmarkResponse;
import com.vibeshare.Service.BookmarkService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookmarks")
@RequiredArgsConstructor
public class BookmarkController {

    private final BookmarkService bookmarkService;

    @PostMapping("/{postId}")
    public ResponseEntity<BookmarkResponse> addBookmark(@PathVariable Long postId) {
        return ResponseEntity.ok(
                bookmarkService.addBookmark(postId)
        );
    }

    @DeleteMapping("/{postId}")
    public ResponseEntity<Void> removeBookmark(@PathVariable Long postId) {
        bookmarkService.removeBookmark(postId);
        return ResponseEntity.noContent().build();
    }

        @GetMapping
        public ResponseEntity<List<BookmarkResponse>> myBookmarks() {
            return ResponseEntity.ok(
                    bookmarkService.getMyBookmarks()
            );
        }

    @GetMapping("/{postId}/check")
    public ResponseEntity<Boolean> isBookmarked(@PathVariable Long postId) {
        return ResponseEntity.ok(
                bookmarkService.isBookmarked(postId)
        );
    }
}
