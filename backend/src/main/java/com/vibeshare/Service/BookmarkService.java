package com.vibeshare.Service;

import com.vibeshare.DTO.Response.BookmarkResponse;

import java.util.List;

public interface BookmarkService {

    BookmarkResponse addBookmark(Long postId);

    void removeBookmark(Long postId);

    List<BookmarkResponse> getMyBookmarks();

    boolean isBookmarked(Long postId);
}
