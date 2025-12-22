import { encodeId, decodeId } from "@/lib/idEncoder";
import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  ArrowLeft,
  Smile,
  Trash2,
  MoreHorizontal,
} from "lucide-react";
import { useAuthStore } from "@/store";
import { postService } from "@/api/post.service";
import { commentService } from "@/api/comment.service";
import type { CommentResponse } from "@/api/comment.service";
import { bookmarkService } from "@/api/bookmark.service";
import { notificationService } from "@/api/notification.service";
import type { PostResponseType } from "@/types/PostResponseType";
import { cn } from "@/lib/utils";

export default function Post() {
  const { id } = useParams();
  const navigate = useNavigate();
  const me = useAuthStore((s) => s.user);

  const [post, setPost] = useState<PostResponseType | null>(null);
  const [loading, setLoading] = useState(true);

  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [likesCount, setLikesCount] = useState(0);

  const [comment, setComment] = useState("");
  const [comments, setComments] = useState<CommentResponse[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);

  const [userPosts, setUserPosts] = useState<PostResponseType[]>([]);
  const [userPostsLoading, setUserPostsLoading] = useState(false);
  const isMyPost = me?.id === post?.userId;
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [postToDeleteId, setPostToDeleteId] = useState<number | null>(null);

  /* ================= FETCH POST ================= */
  useEffect(() => {
    const decodedId = decodeId(id);
    if (!decodedId || !me) return;

    setLoading(true);

    postService
      .getPostById(decodedId)
      .then((data) => {
        setPost(data);
        setLikesCount(data.likeCount);
        // Use 'liked' and 'saved' from API response
        setIsLiked(data.liked ?? false);
        setIsSaved(data.saved ?? false);
      })
      .catch((e) => {
        console.error(e);
        navigate("/");
      })
      .finally(() => setLoading(false));
  }, [id, me, navigate]);

  /* ================= FETCH USER POSTS ================= */
  useEffect(() => {
    if (!post || !me) return;

    setUserPostsLoading(true);

    postService
      .getPostByUser(post.userId)
      .then((posts) => {
        setUserPosts(posts.filter((p) => p.id !== post.id).slice(0, 6));
      })
      .finally(() => setUserPostsLoading(false));
  }, [post, me]);

  // Links updates in JSX below...
  // Example: <Link to={`/profile/${encodeId(post.userId)}`} ... >

  // Actually, I will replace the specific blocks.

  /* ================= FETCH COMMENTS ================= */
  const fetchComments = () => {
    if (!post) return;
    // Don't set loading to true here to avoid flickering if we want silent updates,
    // but user asked for "reload", so maybe they want to see it?
    // Let's keep it simple: just fetch and update.
    // If we want spinner, we can use setCommentsLoading(true) but that might be jarring on delete.
    // I'll skip full loading state for delete refresh, just update data.
    commentService
      .getComments(post.id)
      .then(setComments)
      .catch((e) => console.error("Failed to reload comments", e));
  };

  useEffect(() => {
    if (post?.id) {
      setCommentsLoading(true);
      commentService
        .getComments(post.id)
        .then(setComments)
        .finally(() => setCommentsLoading(false));
    }
  }, [post?.id]);

  /* ================= USER POSTS & ACTIONS ================= */
  // ... (keeping existing user posts fetch)

  // ...

  const handleDeleteComment = async (commentId: number) => {
    if (!me) return;

    // Optimistic Update: Remove immediately from UI
    const previousComments = comments;
    setComments((prev) => prev.filter((c) => c.id !== commentId));

    try {
      await commentService.deleteComment(commentId, me.id);

      // Still fetch to ensure sync, but UI is already updated
      fetchComments();
    } catch (err) {
      console.error("Failed to delete comment", err);
      // Revert on error
      setComments(previousComments);
    }
  };

  /* ================= FETCH USER POSTS ================= */
  useEffect(() => {
    if (!post || !me) return;

    setUserPostsLoading(true);

    postService
      .getPostByUser(post.userId)
      .then((posts) => {
        setUserPosts(posts.filter((p) => p.id !== post.id).slice(0, 6));
      })
      .finally(() => setUserPostsLoading(false));
  }, [post, me]);

  /* ================= LIKE / UNLIKE ================= */
  const handleLike = async () => {
    if (!post || !me) return;

    // Store previous state for rollback on error
    const previousLiked = isLiked;
    const previousCount = likesCount;

    // Optimistic UI update
    setIsLiked(!previousLiked);
    setLikesCount(previousLiked ? previousCount - 1 : previousCount + 1);

    try {
      // Use previous state to determine action
      const updatedPost = previousLiked
        ? await postService.unlikePost(post.id)
        : await postService.likePost(post.id);

      // Sync with server response
      setPost(updatedPost);
      setIsLiked(updatedPost.liked ?? false);
      setLikesCount(updatedPost.likeCount);

      // Trigger Notification if Liked
      if (!previousLiked && me && post.userId !== me.id) {
        notificationService
          .createAndSend({
            recipientId: post.userId,
            actorId: me.id,
            type: "LIKE",
            message: "liked your post",
            sourceId: post.id.toString(),
          })
          .catch(console.error);
      }
    } catch (err) {
      console.error("❌ Like/Unlike failed:", err);
      // Rollback on error
      setIsLiked(previousLiked);
      setLikesCount(previousCount);
    }
  };

  const handleSave = async () => {
    if (!post) return;

    const previousSaved = isSaved;

    // optimistic UI
    setIsSaved(!previousSaved);

    try {
      if (previousSaved) {
        await bookmarkService.removeBookmark(post.id);
      } else {
        await bookmarkService.addBookmark(post.id);
      }
    } catch (err) {
      console.error("❌ Bookmark failed:", err);
      // rollback
      setIsSaved(previousSaved);
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim() || !post || !me) return;

    try {
      const newComment = await commentService.addComment({
        postId: post.id,
        userId: me.id,
        text: comment,
      });

      // Hydrate with current user info if missing from response
      const commentWithUser = {
        ...newComment,
        user: newComment.user || {
          id: me.id,
          username: me.username,
          profilePic: me.profilePic,
        },
      };

      setComments((prev) => [...prev, commentWithUser]);
      setComment("");

      // Notify parent? No need, local state updated.
    } catch (err) {
      console.error("Failed to add comment", err);
    }
  };

  /* ================= DELETE POST ================= */
  const handleDeletePost = async (targetId?: number) => {
    const normalizeId = targetId || postToDeleteId || post?.id;
    if (!normalizeId || !me) return;

    try {
      await postService.deletePost(normalizeId);

      // If deleting the main viewed post, navigate away
      if (normalizeId === post?.id) {
        navigate(`/profile/${me.id}`);
      } else {
        // If deleting a feed item, just remove it from the list
        setUserPosts((prev) => prev.filter((p) => p.id !== normalizeId));
      }
    } catch (err) {
      console.error("❌ Delete post failed:", err);
      alert("Failed to delete post. Please try again.");
    } finally {
      setDeleteDialogOpen(false);
    }
  };

  /* ================= LOADING ================= */
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="w-16 h-16 rounded-full border-4 border-border border-t-primary animate-spin" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Button onClick={() => navigate("/")}>Go Home</Button>
      </div>
    );
  }

  /* ================= DETERMINE POST TYPE ================= */
  const isReel = !!post?.videoUrl;

  /* ================= JSX - REEL LAYOUT ================= */
  if (isReel && post) {
    return (
      <div className="min-h-screen bg-black">
        {/* Header */}
        <div className="fixed top-0 left-0 right-0 z-50 bg-linear-to-b from-black/80 to-transparent px-4 py-3">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="h-10 w-10 text-white hover:bg-white/20"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-semibold text-white">Reels</h1>
            {isMyPost && (
              <OptionsModal
                onDelete={() => setDeleteDialogOpen(true)}
                trigger={
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 text-white hover:bg-white/20"
                  >
                    <MoreHorizontal className="h-5 w-5" />
                  </Button>
                }
              />
            )}
          </div>
        </div>

        {/* Reel Content */}
        <div className="relative h-screen flex items-center justify-center">
          {/* Video */}
          <video
            src={post.videoUrl || undefined}
            autoPlay
            loop
            playsInline
            muted
            className="h-full w-full object-contain max-w-[500px] mx-auto"
          />

          {/* Overlay Info - Bottom */}
          <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/80 via-black/40 to-transparent p-6 pb-24">
            <div className="max-w-[500px] mx-auto">
              {/* User Info */}
              {/* User Info */}
              <Link
                to={`/profile/${encodeId(post.userId)}`}
                className="flex items-center gap-3 mb-4"
              >
                <Avatar className="h-10 w-10 border-2 border-white">
                  <AvatarImage
                    src={`https://i.pravatar.cc/150?u=${post.userId}`}
                  />
                  <AvatarFallback className="bg-linear-to-br from-purple-500 to-pink-500 text-white">
                    {post.username?.[0]?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <span className="font-semibold text-white">
                  {post.username}
                </span>
              </Link>

              {/* Caption */}
              {post.content && (
                <p className="text-white text-sm mb-3">{post.content}</p>
              )}

              {/* Stats */}
              <div className="flex items-center gap-4 text-white text-sm">
                <span>{likesCount.toLocaleString()} likes</span>
                <span>•</span>
                <span>{new Date(post.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons - Right Side */}
          <div className="absolute right-4 bottom-32 flex flex-col gap-6">
            <button
              onClick={handleLike}
              className="flex flex-col items-center gap-1"
            >
              <div
                className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center transition-all",
                  isLiked
                    ? "bg-red-500"
                    : "bg-white/20 backdrop-blur-sm hover:bg-white/30"
                )}
              >
                <Heart
                  className={cn(
                    "h-6 w-6 text-white",
                    isLiked && "fill-current"
                  )}
                />
              </div>
              <span className="text-white text-xs font-semibold">
                {likesCount}
              </span>
            </button>

            <button className="flex flex-col items-center gap-1">
              <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 flex items-center justify-center">
                <MessageCircle className="h-6 w-6 text-white" />
              </div>
              <span className="text-white text-xs font-semibold">0</span>
            </button>

            {!isMyPost && (
              <button
                onClick={handleSave}
                className="flex flex-col items-center gap-1"
              >
                <div
                  className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center transition-all",
                    isSaved
                      ? "bg-yellow-500"
                      : "bg-white/20 backdrop-blur-sm hover:bg-white/30"
                  )}
                >
                  <Bookmark
                    className={cn(
                      "h-6 w-6 text-white",
                      isSaved && "fill-current"
                    )}
                  />
                </div>
              </button>
            )}

            <button className="flex flex-col items-center gap-1">
              <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 flex items-center justify-center">
                <Share2 className="h-6 w-6 text-white" />
              </div>
            </button>
          </div>
        </div>

        {/* Delete Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Reel?</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this reel? This action cannot be
                undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDeleteDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button variant="destructive" onClick={() => handleDeletePost()}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  /* ================= JSX - IMAGE POST LAYOUT ================= */
  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Mobile Top Bar */}
      <div className="lg:hidden sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border flex items-center justify-between px-4 py-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="-ml-2"
        >
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <span className="font-semibold text-sm">Post</span>
        <div className="w-8" /> {/* Spacer */}
      </div>

      <div className="hidden lg:block max-w-[935px] mx-auto lg:py-8">
        <div className="bg-card lg:border border-border rounded-sm overflow-hidden grid grid-cols-1 lg:grid-cols-[1fr_400px]">
          {/* LEFT: IMAGE */}
          <div className="bg-black flex items-center justify-center lg:min-h-[450px] lg:max-h-[700px] border-r border-border">
            <img
              src={post.imageUrl || undefined}
              alt={post.content || "Post"}
              className="w-full h-full object-contain max-h-[700px]"
            />
          </div>

          {/* RIGHT: DETAILS */}
          <div className="flex flex-col h-[600px] max-h-[700px]">
            {/* Desktop Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <Link
                to={`/profile/${encodeId(post.userId)}`}
                className="flex items-center gap-3"
              >
                <Avatar className="h-8 w-8 ring-1 ring-border">
                  <AvatarImage
                    src={`https://i.pravatar.cc/150?u=${post.userId}`}
                  />
                  <AvatarFallback>
                    {post.username?.[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="font-semibold text-sm hover:opacity-70">
                  {post.username}
                </span>
              </Link>
              {isMyPost && (
                <OptionsModal
                  onDelete={() => setDeleteDialogOpen(true)}
                  trigger={
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-5 w-5" />
                    </Button>
                  }
                />
              )}
            </div>

            {/* Comments */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {post.content && (
                <div className="flex gap-3 items-start">
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={`https://i.pravatar.cc/150?u=${post.userId}`}
                    />
                    <AvatarFallback>
                      {post.username?.[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-sm">
                    <Link
                      to={`/profile/${encodeId(post.userId)}`}
                      className="font-semibold mr-2"
                    >
                      {post.username}
                    </Link>
                    <span>{post.content}</span>
                    <p className="text-xs text-muted-foreground mt-2">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}
              {commentsLoading ? (
                <div className="flex justify-center p-4">
                  <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : comments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-muted-foreground text-sm">
                  <span>No comments yet.</span>
                </div>
              ) : (
                comments.map((comment) => {
                  // Fallback if user is missing (e.g. bad data)
                  const commentUser = comment.user || {
                    id: 0,
                    username: "Unknown",
                    profilePic: null,
                  };

                  return (
                    <div key={comment.id} className="flex gap-3 items-start">
                      <Link to={`/profile/${encodeId(commentUser.id)}`}>
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={commentUser.profilePic || ""} />
                          <AvatarFallback>
                            {commentUser.username[0]?.toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </Link>
                      <div className="flex-1 text-sm">
                        <Link
                          to={`/profile/${encodeId(commentUser.id)}`}
                          className="font-semibold mr-2 hover:underline"
                        >
                          {commentUser.username}
                        </Link>
                        <span>{comment.text}</span>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      {me?.id === commentUser.id && (
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          className="text-muted-foreground hover:text-red-500 transition-colors p-1"
                          title="Delete comment"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer Controls */}
            <div className="border-t border-border p-4 bg-background">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleLike}
                    className="p-0 hover:bg-transparent"
                  >
                    <Heart
                      className={cn(
                        "h-6 w-6",
                        isLiked ? "fill-red-500 text-red-500" : ""
                      )}
                    />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="p-0 hover:bg-transparent"
                  >
                    <MessageCircle className="h-6 w-6" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="p-0 hover:bg-transparent"
                  >
                    <Share2 className="h-6 w-6" />
                  </Button>
                </div>
                {!isMyPost && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleSave}
                    className="p-0 hover:bg-transparent"
                  >
                    <Bookmark
                      className={cn(
                        "h-6 w-6",
                        isSaved ? "fill-white text-white" : ""
                      )}
                    />
                  </Button>
                )}
              </div>
              <div className="font-semibold text-sm mb-4">
                {likesCount} likes
              </div>
              <form
                onSubmit={handleComment}
                className="flex items-center gap-3 border-t border-border pt-3"
              >
                <Smile className="h-6 w-6 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Add a comment..."
                  className="flex-1 bg-transparent text-sm outline-none"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
                <button
                  type="submit"
                  disabled={!comment.trim()}
                  className="text-blue-500 font-semibold text-sm disabled:opacity-50"
                >
                  Post
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[935px] mx-auto lg:py-8">
        <div className="lg:hidden">
          {[post, ...userPosts].map((p) => (
            <FeedItem
              key={p.id}
              post={p}
              isMyPost={me?.id === p.userId}
              // Only allow delete on the main post if needed, or all.
              // Let's allow generic delete if it's the user's post
              onDelete={() => {
                setPostToDeleteId(p.id);
                setDeleteDialogOpen(true);
              }}
            />
          ))}
        </div>

        {/* More Posts Section (Desktop Grid Only) */}
        <div className="mt-12 px-4 lg:px-0 hidden lg:block">
          <div className="text-sm font-semibold text-muted-foreground mb-4">
            More posts from{" "}
            <Link
              to={`/profile/${encodeId(post.userId)}`}
              className="text-foreground"
            >
              {post.username}
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-1 md:gap-4">
            {!userPostsLoading &&
              userPosts.map((userPost) => (
                <Link
                  key={userPost.id}
                  to={`/post/${encodeId(userPost.id)}`}
                  onClick={() =>
                    window.scrollTo({ top: 0, behavior: "smooth" })
                  }
                  className="aspect-square bg-muted relative group overflow-hidden block"
                >
                  {userPost.imageUrl ? (
                    <img
                      src={userPost.imageUrl}
                      alt="Post"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <video
                      src={userPost.videoUrl || ""}
                      className="w-full h-full object-cover"
                    />
                  )}
                </Link>
              ))}
          </div>
        </div>

        {/* Desktop Single Post Layout */}
      </div>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Post?</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this post? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => handleDeletePost()}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function FeedItem({
  post,
  isMyPost,
  onDelete,
}: {
  post: PostResponseType;
  isMyPost: boolean;
  onDelete?: (id: number) => void;
}) {
  const me = useAuthStore((s) => s.user); // Get current user
  const [isLiked, setIsLiked] = useState(post.liked ?? false);
  const [likesCount, setLikesCount] = useState(post.likeCount);
  const [isSaved, setIsSaved] = useState(post.saved ?? false);

  const handleLike = async () => {
    const previousLiked = isLiked;
    const previousCount = likesCount;

    setIsLiked(!previousLiked);
    setLikesCount(previousLiked ? previousCount - 1 : previousCount + 1);

    try {
      if (previousLiked) {
        await postService.unlikePost(post.id);
      } else {
        await postService.likePost(post.id);
        // Trigger Notification
        if (me && post.userId !== me.id) {
          notificationService
            .createAndSend({
              recipientId: post.userId,
              actorId: me.id,
              type: "LIKE",
              message: "liked your post",
              sourceId: post.id.toString(),
            })
            .catch(console.error);
        }
      }
    } catch (err) {
      setIsLiked(previousLiked);
      setLikesCount(previousCount);
    }
  };

  const handleSave = async () => {
    const previousSaved = isSaved;
    setIsSaved(!previousSaved);
    try {
      if (previousSaved) {
        await bookmarkService.removeBookmark(post.id);
      } else {
        await bookmarkService.addBookmark(post.id);
      }
    } catch (err) {
      setIsSaved(previousSaved);
    }
  };

  return (
    <div className="bg-background border-b border-border pb-4 mb-4">
      {/* Header */}
      <div className="flex items-center justify-between p-3">
        <Link
          to={`/profile/${encodeId(post.userId)}`}
          className="flex items-center gap-3"
        >
          <Avatar className="h-8 w-8">
            <AvatarImage src={`https://i.pravatar.cc/150?u=${post.userId}`} />
            <AvatarFallback>
              {post.username?.[0]?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <span className="font-semibold text-sm">{post.username}</span>
        </Link>
        {isMyPost && onDelete && (
          <OptionsModal
            onDelete={() => onDelete(post.id)}
            trigger={
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            }
          />
        )}
      </div>

      {/* Image/Video */}
      <div className="bg-black flex items-center justify-center min-h-[300px] max-h-[500px]">
        {post.imageUrl ? (
          <img
            src={post.imageUrl}
            alt={post.content}
            className="w-full h-auto max-h-[500px] object-contain"
          />
        ) : (
          <video
            src={post.videoUrl || ""}
            autoPlay
            loop
            playsInline
            muted
            className="w-full h-auto max-h-[500px] object-contain"
          />
        )}
      </div>

      {/* Actions */}
      <div className="p-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-4">
            <button onClick={handleLike}>
              <Heart
                className={cn(
                  "h-6 w-6 transition-colors",
                  isLiked ? "fill-red-500 text-red-500" : ""
                )}
              />
            </button>
            <Link to={`/post/${encodeId(post.id)}`}>
              <MessageCircle className="h-6 w-6" />
            </Link>
            <Share2 className="h-6 w-6" />
          </div>
          {!isMyPost && (
            <button onClick={handleSave}>
              <Bookmark
                className={cn(
                  "h-6 w-6",
                  isSaved ? "fill-black text-black" : ""
                )}
              />
            </button>
          )}
        </div>

        <div className="font-semibold text-sm mb-2">{likesCount} likes</div>

        {post.content && (
          <div className="text-sm mb-2">
            <span className="font-semibold mr-2">{post.username}</span>
            <span>{post.content}</span>
          </div>
        )}

        <Link
          to={`/post/${encodeId(post.id)}`}
          className="text-muted-foreground text-sm mb-2 block"
        >
          View all comments
        </Link>

        <div className="text-[10px] uppercase text-muted-foreground tracking-wide">
          {new Date(post.createdAt).toLocaleDateString()}
        </div>
      </div>
    </div>
  );
}

function OptionsModal({
  onDelete,
  trigger,
}: {
  onDelete: () => void;
  trigger: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center border-b border-border pb-3">
            Options
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col">
          <Button
            variant="ghost"
            className="text-red-500 font-bold w-full justify-center h-12"
            onClick={() => {
              setOpen(false);
              onDelete();
            }}
          >
            Delete
          </Button>
          <div className="border-t border-border" />
          <Button
            variant="ghost"
            className="w-full justify-center h-12"
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
