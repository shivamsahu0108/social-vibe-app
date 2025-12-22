import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { encodeId } from "@/lib/idEncoder";
import { X, Send, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useUIStore, usePostInteractionsStore } from "@/store";
import { useAuthStore } from "@/store";
import { commentService } from "@/api/comment.service";
import type { CommentResponse } from "@/api/comment.service";
import { formatDistanceToNow } from "date-fns";

export function CommentsDrawer() {
  const { isCommentDrawerOpen, closeCommentDrawer, activePostId } =
    useUIStore();
  const { addComment } = usePostInteractionsStore();
  const { user } = useAuthStore();

  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState<CommentResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // ✅ This WILL always log now
  useEffect(() => {}, [commentText]);

  // ✅ Fetch comments when drawer opens
  useEffect(() => {
    if (!isCommentDrawerOpen || !activePostId) return;

    setIsLoading(true);
    commentService
      .getComments(Number(activePostId))
      .then(setComments)
      .catch((err) => console.error("Failed to load comments", err))
      .finally(() => setIsLoading(false));
  }, [isCommentDrawerOpen, activePostId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !user || !activePostId) return;

    try {
      const newComment = await commentService.addComment({
        postId: Number(activePostId),
        userId: user.id,
        text: commentText,
      });

      setComments((prev) => [newComment, ...prev]);
      addComment(activePostId);
      setCommentText("");
    } catch (error) {
      console.error("Failed to post comment", error);
    }
  };

  const handleDelete = async (commentId: number) => {
    if (!user) return;

    // Optimistic: Remove immediately from UI
    const previous = comments;
    setComments((prev) => prev.filter((c) => c.id !== commentId));

    try {
      await commentService.deleteComment(commentId, user.id);

      // Silent refresh to ensure sync
      if (activePostId) {
        commentService
          .getComments(Number(activePostId))
          .then(setComments)
          .catch((e) => console.error("Failed to refresh comments", e));
      }
    } catch (err) {
      console.error("Failed to delete comment", err);
      setComments(previous); // Revert
    }
  };

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/60 z-40 transition-opacity duration-200 ${
          isCommentDrawerOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={closeCommentDrawer}
      />

      {/* Drawer */}
      <div
        className={`fixed bottom-0 left-0 right-0 bg-background rounded-t-3xl z-50
          transition-transform duration-300 max-h-[80vh] flex flex-col
          ${isCommentDrawerOpen ? "translate-y-0" : "translate-y-full"}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-bold">Comments</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={closeCommentDrawer}
            className="h-8 w-8"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Comments */}
        <ScrollArea className="flex-1 p-4">
          {isLoading ? (
            <div className="text-center py-10 text-muted-foreground">
              Loading comments...
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              No comments yet. Be the first!
            </div>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="flex space-x-3 group">
                  <Link to={`/profile/${encodeId(comment.user.id)}`}>
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarImage src={comment.user.profilePic || ""} />
                      <AvatarFallback>
                        {comment.user.username?.[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Link>

                  <div className="flex-1 space-y-1">
                    <div className="flex items-center space-x-2">
                      <Link to={`/profile/${encodeId(comment.user.id)}`}>
                        <span className="font-semibold text-sm hover:underline">
                          {comment.user.username}
                        </span>
                      </Link>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(comment.createdAt), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>

                    <p className="text-sm text-foreground/90">{comment.text}</p>

                    {user?.id === comment.user.id && (
                      <button
                        onClick={() => handleDelete(comment.id)}
                        className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                        title="Delete comment"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Input */}
        <form
          onSubmit={handleSubmit}
          className="p-4 border-t border-border bg-background"
        >
          <div className="flex space-x-2">
            <Avatar className="h-8 w-8 shrink-0">
              <AvatarImage src={user?.profilePic || ""} />
              <AvatarFallback>
                {user?.username?.[0]?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>

            <Input
              placeholder="Add a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="flex-1"
            />

            <Button
              type="submit"
              size="icon"
              disabled={!commentText.trim()}
              className="bg-linear-to-r from-pink-500 to-purple-500 hover:opacity-90 shrink-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
