import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Grid,
  Bookmark,
  UserSquare2,
  Settings,
  Heart,
  MessageCircle,
  MoreHorizontal,
  Film,
} from "lucide-react";
import { useAuthStore } from "@/store";
import { userService } from "@/api/user.service";
import { postService } from "@/api/post.service";
import { notificationService } from "@/api/notification.service";
import { bookmarkService } from "@/api/bookmark.service";
import { chatService } from "@/api/chat.service";
import type { UserResponseType } from "@/types/UserResponseType";
import type { PostResponseType } from "@/types/PostResponseType";
import { UserListModal } from "@/components/modals/UserListModal";

import { encodeId, decodeId } from "@/lib/idEncoder";

type TabType = "posts" | "reels" | "saved" | "tagged";

export default function Profile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const me = useAuthStore((s) => s.user);

  /* ✅ stable resolved user id */
  const resolvedUserId = decodeId(id) ?? me?.id ?? null;

  const [profileUser, setProfileUser] = useState<UserResponseType | null>(null);

  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);
  const [followsMe, setFollowsMe] = useState(false);

  const [posts, setPosts] = useState<PostResponseType[]>([]);
  const [savedPosts, setSavedPosts] = useState<PostResponseType[]>([]);
  const [savedLoading, setSavedLoading] = useState(false);
  const [postsLoading, setPostsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>("posts");
  const [followersOpen, setFollowersOpen] = useState(false);
  const [followingOpen, setFollowingOpen] = useState(false);

  /* ================= REDIRECT ================= */
  useEffect(() => {
    if (!id && me?.id) {
      navigate(`/profile/${encodeId(me.id)}`, { replace: true });
    }
  }, [id, me, navigate]);

  /* ================= FETCH PROFILE ================= */
  useEffect(() => {
    if (!resolvedUserId) return;

    setLoading(true);

    const fetchProfileData = async () => {
      try {
        const user = await userService.getById(resolvedUserId);

        // If viewing another user, verify relationships manually
        if (me?.id && me.id !== user.id) {
          try {
            const [theirFollowers, theirFollowings] = await Promise.all([
              userService.getFollowers(user.id),
              userService.getFollowings(user.id),
            ]);

            // 1. Am I following them? (Am I in their followers list?)
            const amIFollowing = theirFollowers.some((u) => u.id === me.id);
            user.isFollowing = amIFollowing;

            // 2. Do they follow me? (Am I in their following list?)
            const doesFollowMe = theirFollowings.some((u) => u.id === me.id);
            setFollowsMe(doesFollowMe);
          } catch (err) {
            console.error("Failed to verify relationship status", err);
          }
        }

        setProfileUser(user);
      } catch (error) {
        console.error("Failed to fetch profile", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [resolvedUserId, me?.id]);

  /* ================= FETCH POSTS ================= */
  useEffect(() => {
    if (!profileUser) return;

    setPostsLoading(true);
    postService
      .getPostByUser(profileUser.id)
      .then(setPosts)
      .finally(() => setPostsLoading(false));
  }, [profileUser?.id]);

  /* ================= FOLLOW ACTIONS ================= */
  const handleFollow = async () => {
    if (!profileUser || followLoading) return;
    try {
      setFollowLoading(true);
      await userService.follow(profileUser.id);
      setProfileUser({
        ...profileUser,
        isFollowing: true,
        followersCount: profileUser.followersCount + 1,
      });

      // Trigger Notification
      if (me && profileUser.id !== me.id) {
        notificationService
          .createAndSend({
            recipientId: profileUser.id,
            actorId: me.id,
            type: "FOLLOW",
            message: "started following you",
          })
          .catch(console.error);
      }
    } finally {
      setFollowLoading(false);
    }
  };

  const handleUnfollow = async () => {
    if (!profileUser || followLoading) return;
    try {
      setFollowLoading(true);
      await userService.unfollow(profileUser.id);
      setProfileUser({
        ...profileUser,
        isFollowing: false,
        followersCount: Math.max(0, profileUser.followersCount - 1),
      });
    } finally {
      setFollowLoading(false);
    }
  };

  const handleMessage = async () => {
    if (!profileUser || !me) return;
    try {
      // Create or get conversation
      const conv = await chatService.createOrGetConversation({
        recipientId: profileUser.id,
        isGroup: false,
      });
      navigate(`/chat?id=${conv.id}`);
    } catch (error) {
      console.error("Failed to start conversation", error);
    }
  };

  /* ✅ safe derived flag AFTER data */
  const isMe = profileUser?.id === me?.id;

  /* ================= FETCH SAVED POSTS ================= */
  useEffect(() => {
    if (activeTab === "saved" && isMe) {
      setSavedLoading(true);
      bookmarkService
        .getMyBookmarks()
        .then(async (bookmarks) => {
          // Fetch full post details for each bookmark
          const promises = bookmarks.map((b) =>
            postService.getPostById(b.postId)
          );
          const posts = await Promise.all(promises);
          setSavedPosts(posts);
        })
        .catch(console.error)
        .finally(() => setSavedLoading(false));
    }
  }, [activeTab, isMe]);

  /* ================= FILTER POSTS BY TYPE ================= */
  const imagePosts = posts.filter((post) => post.imageUrl && !post.videoUrl);
  const videoPosts = posts.filter((post) => post.videoUrl);

  /* ================= EARLY RENDER ================= */
  if (loading || !profileUser) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-20 h-20 rounded-full border-4 border-border border-t-primary animate-spin" />
          <p className="text-sm text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  /* ================= JSX ================= */
  return (
    <div className="w-full max-w-[935px] mx-auto px-4 md:px-5 pb-20 pt-8">
      {/* MOBILE HEADER (Visible only on mobile) */}
      <div className="md:hidden flex flex-col gap-4 mb-6">
        {/* Top Bar (Username + Settings) */}
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-1">
            <h2 className="text-xl font-bold">{profileUser.username}</h2>
            {/* Optional Lock icon if private */}
          </div>
          {isMe && (
            <Link to="/settings">
              <Settings className="h-6 w-6" />
            </Link>
          )}
        </div>
        {/* Top Row: Avatar + Stats */}
        <div className="flex items-center justify-between">
          <Avatar className="h-20 w-20 border border-border">
            <AvatarImage
              src={profileUser.profilePic || "/avatar.png"}
              className="object-cover"
            />
            <AvatarFallback className="text-xl">
              {profileUser.username[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex flex-1 justify-around ml-4">
            <div className="flex flex-col items-center">
              <span className="font-semibold text-lg">
                {profileUser.postsCount}
              </span>
              <span className="text-xs text-muted-foreground">posts</span>
            </div>
            <button
              onClick={() => setFollowersOpen(true)}
              className="flex flex-col items-center hover:opacity-70 transition-opacity cursor-pointer"
            >
              <span className="font-semibold text-lg">
                {profileUser.followersCount}
              </span>
              <span className="text-xs text-muted-foreground">followers</span>
            </button>
            <button
              onClick={() => setFollowingOpen(true)}
              className="flex flex-col items-center hover:opacity-70 transition-opacity cursor-pointer"
            >
              <span className="font-semibold text-lg">
                {profileUser.followingCount}
              </span>
              <span className="text-xs text-muted-foreground">following</span>
            </button>
          </div>
        </div>

        {/* Bio Section */}
        <div className="text-sm px-1">
          <p className="font-semibold">{profileUser.username}</p>
          {profileUser.bio && (
            <p className="text-foreground whitespace-pre-wrap">
              {profileUser.bio}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          {isMe ? (
            <>
              <Button
                variant="secondary"
                className="flex-1 h-8 text-sm font-semibold rounded-lg bg-secondary/80 hover:bg-secondary"
                onClick={() => navigate("/profile/edit")}
              >
                Edit profile
              </Button>
              <Button
                variant="secondary"
                className="flex-1 h-8 text-sm font-semibold rounded-lg bg-secondary/80 hover:bg-secondary"
              >
                Share profile
              </Button>
            </>
          ) : (
            <>
              {profileUser.isFollowing ? (
                <Button
                  variant="secondary"
                  onClick={handleUnfollow}
                  disabled={followLoading}
                  className="flex-1 h-8 text-sm font-semibold rounded-lg"
                >
                  Following
                </Button>
              ) : (
                <Button
                  onClick={handleFollow}
                  disabled={followLoading}
                  className="flex-1 h-8 text-sm font-semibold rounded-lg bg-blue-500 hover:bg-blue-600 text-white"
                >
                  {followsMe ? "Follow Back" : "Follow"}
                </Button>
              )}
              <Button
                variant="secondary"
                className="flex-1 h-8 text-sm font-semibold rounded-lg"
                onClick={handleMessage}
              >
                Message
              </Button>
            </>
          )}
        </div>
      </div>

      {/* DESKTOP HEADER (Hidden on mobile) */}
      <div className="hidden md:flex flex-row gap-12 mb-12">
        {/* Profile Picture */}
        <div className="flex justify-start pl-8">
          <Avatar className="h-[150px] w-[150px] border-[3px] border-border">
            <AvatarImage
              src={profileUser.profilePic || "/avatar.png"}
              className="object-cover"
            />
            <AvatarFallback className="text-4xl">
              {profileUser.username[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>

        {/* Profile Info */}
        <div className="flex-1 flex flex-col gap-5 pt-2">
          {/* Username and Actions */}
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-light">{profileUser.username}</h1>
            <div className="flex items-center gap-2">
              {isMe ? (
                <>
                  <Button
                    variant="secondary"
                    className="h-8 px-4 text-sm font-semibold rounded-lg"
                    onClick={() => navigate("/profile/edit")}
                  >
                    Edit profile
                  </Button>
                  <Button
                    variant="secondary"
                    className="h-8 px-4 text-sm font-semibold rounded-lg"
                  >
                    View archive
                  </Button>
                  <Link to="/settings">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Settings className="h-5 w-5" />
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  {profileUser.isFollowing ? (
                    <>
                      <Button
                        variant="secondary"
                        onClick={handleUnfollow}
                        disabled={followLoading}
                        className="h-8 px-4 text-sm font-semibold rounded-lg"
                      >
                        Following
                      </Button>
                      <Button
                        variant="secondary"
                        className="h-8 px-4 text-sm font-semibold rounded-lg"
                      >
                        Message
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        onClick={handleFollow}
                        disabled={followLoading}
                        className="h-8 px-4 text-sm font-semibold rounded-lg"
                      >
                        {followsMe ? "Follow Back" : "Follow"}
                      </Button>
                      <Button
                        variant="secondary"
                        className="h-8 px-4 text-sm font-semibold rounded-lg"
                        onClick={handleMessage}
                      >
                        Message
                      </Button>
                    </>
                  )}
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-5 w-5" />
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="flex gap-10 text-base">
            <div className="flex flex-col items-center">
              <span className="font-semibold">{profileUser.postsCount}</span>
              <span className="text-foreground ml-1">posts</span>
            </div>
            <button
              onClick={() => setFollowersOpen(true)}
              className="flex flex-col items-center hover:opacity-70 transition-opacity cursor-pointer"
            >
              <span className="font-semibold">
                {profileUser.followersCount}
              </span>
              <span className="text-foreground ml-1">followers</span>
            </button>
            <button
              onClick={() => setFollowingOpen(true)}
              className="flex flex-col items-center hover:opacity-70 transition-opacity cursor-pointer"
            >
              <span className="font-semibold">
                {profileUser.followingCount}
              </span>
              <span className="text-foreground ml-1">following</span>
            </button>
          </div>

          {/* Bio */}
          <div className="text-sm">
            <p className="font-semibold">{profileUser.username}</p>
            {profileUser.bio && (
              <p className="text-foreground whitespace-pre-wrap mt-1">
                {profileUser.bio}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-border mb-0" />

      {/* Tabs */}
      <div className="flex justify-center gap-8 md:gap-16 mb-4">
        <button
          onClick={() => setActiveTab("posts")}
          className={`flex items-center gap-1.5 py-3 text-xs font-semibold tracking-wider border-t -mt-px transition-colors ${
            activeTab === "posts"
              ? "border-foreground text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Grid className="h-4 w-4 md:h-3 md:w-3" />
          <span className="hidden md:block">POSTS</span>
        </button>
        <button
          onClick={() => setActiveTab("reels")}
          className={`flex items-center gap-1.5 py-3 text-xs font-semibold tracking-wider border-t -mt-px transition-colors ${
            activeTab === "reels"
              ? "border-foreground text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Film className="h-4 w-4 md:h-3 md:w-3" />
          <span className="hidden md:block">REELS</span>
        </button>
        {isMe && (
          <button
            onClick={() => setActiveTab("saved")}
            className={`flex items-center gap-1.5 py-3 text-xs font-semibold tracking-wider border-t -mt-px transition-colors ${
              activeTab === "saved"
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Bookmark className="h-4 w-4 md:h-3 md:w-3" />
            <span className="hidden md:block">SAVED</span>
          </button>
        )}
        <button
          onClick={() => setActiveTab("tagged")}
          className={`flex items-center gap-1.5 py-3 text-xs font-semibold tracking-wider border-t -mt-px transition-colors ${
            activeTab === "tagged"
              ? "border-foreground text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <UserSquare2 className="h-4 w-4 md:h-3 md:w-3" />
          <span className="hidden md:block">TAGGED</span>
        </button>
      </div>

      {/* POSTS GRID */}
      {activeTab === "posts" && (
        <div className="grid grid-cols-3 gap-0.5 md:gap-1">
          {postsLoading ? (
            Array.from({ length: 9 }).map((_, i) => (
              <div
                key={i}
                className="aspect-square bg-muted animate-pulse rounded-sm"
              />
            ))
          ) : imagePosts.length > 0 ? (
            imagePosts.map((post) => (
              <Link
                key={post.id}
                to={`/post/${encodeId(post.id)}`}
                className="aspect-square bg-muted relative group overflow-hidden rounded-sm cursor-pointer"
              >
                {post.imageUrl && (
                  <>
                    <img
                      src={post.imageUrl}
                      alt={post.content || "Post"}
                      className="w-full h-full object-cover"
                    />
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-6">
                      <div className="flex items-center gap-2 text-white font-semibold">
                        <Heart className="h-6 w-6 fill-white" />
                        <span>{post.likeCount || 0}</span>
                      </div>
                      <div className="flex items-center gap-2 text-white font-semibold">
                        <MessageCircle className="h-6 w-6 fill-white" />
                        <span>0</span>
                      </div>
                    </div>
                  </>
                )}
              </Link>
            ))
          ) : (
            <div className="col-span-3 flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 rounded-full border-4 border-foreground flex items-center justify-center mb-6">
                <Grid className="h-8 w-8" />
              </div>
              <h3 className="text-3xl font-light mb-2">No Posts Yet</h3>
              {isMe && (
                <p className="text-sm text-muted-foreground">
                  Share your first photo
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* REELS GRID */}
      {activeTab === "reels" && (
        <div className="grid grid-cols-3 gap-0.5 md:gap-1">
          {postsLoading ? (
            Array.from({ length: 9 }).map((_, i) => (
              <div
                key={i}
                className="aspect-9/16 bg-muted animate-pulse rounded-sm"
              />
            ))
          ) : videoPosts.length > 0 ? (
            videoPosts.map((post) => (
              <Link
                key={post.id}
                to={`/post/${encodeId(post.id)}`}
                className="aspect-9/16 bg-muted relative group overflow-hidden rounded-sm cursor-pointer"
              >
                {post.videoUrl && (
                  <>
                    <video
                      src={post.videoUrl}
                      className="w-full h-full object-cover"
                    />
                    {/* Play Icon Overlay */}
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center">
                        <Film className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                      <div className="flex items-center gap-2 text-white font-semibold">
                        <Heart className="h-6 w-6 fill-white" />
                        <span>{post.likeCount || 0}</span>
                      </div>
                    </div>
                  </>
                )}
              </Link>
            ))
          ) : (
            <div className="col-span-3 flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 rounded-full border-4 border-foreground flex items-center justify-center mb-6">
                <Film className="h-8 w-8" />
              </div>
              <h3 className="text-3xl font-light mb-2">No Reels Yet</h3>
              {isMe && (
                <p className="text-sm text-muted-foreground">
                  Share your first video
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* SAVED TAB */}
      {activeTab === "saved" && isMe && (
        <div className="grid grid-cols-3 gap-0.5 md:gap-1">
          {savedLoading ? (
            Array.from({ length: 9 }).map((_, i) => (
              <div
                key={i}
                className="aspect-square bg-muted animate-pulse rounded-sm"
              />
            ))
          ) : savedPosts.length > 0 ? (
            savedPosts.map((post) => (
              <Link
                key={post.id}
                to={`/post/${encodeId(post.id)}`}
                className="aspect-square bg-muted relative group overflow-hidden rounded-sm cursor-pointer"
              >
                {/* Image Post */}
                {post.imageUrl && (
                  <>
                    <img
                      src={post.imageUrl}
                      alt={post.content || "Saved Post"}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-6">
                      <div className="flex items-center gap-2 text-white font-semibold">
                        <Heart className="h-6 w-6 fill-white" />
                        <span>{post.likeCount || 0}</span>
                      </div>
                      <div className="flex items-center gap-2 text-white font-semibold">
                        <MessageCircle className="h-6 w-6 fill-white" />
                        <span>0</span>
                      </div>
                    </div>
                  </>
                )}
                {/* Video Post */}
                {post.videoUrl && !post.imageUrl && (
                  <>
                    <video
                      src={post.videoUrl}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center">
                        <Film className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  </>
                )}
              </Link>
            ))
          ) : (
            <div className="col-span-3 flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 rounded-full border-4 border-foreground flex items-center justify-center mb-6">
                <Bookmark className="h-8 w-8" />
              </div>
              <h3 className="text-3xl font-light mb-2">Save</h3>
              <p className="text-sm text-muted-foreground">
                Save photos and videos that you want to see again.
              </p>
            </div>
          )}
        </div>
      )}

      {/* TAGGED TAB */}
      {activeTab === "tagged" && (
        <div className="col-span-3 flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-full border-4 border-foreground flex items-center justify-center mb-6">
            <UserSquare2 className="h-8 w-8" />
          </div>
          <h3 className="text-3xl font-light mb-2">Photos of you</h3>
          <p className="text-sm text-muted-foreground">
            When people tag you in photos, they'll appear here.
          </p>
        </div>
      )}
      <UserListModal
        isOpen={followersOpen}
        onClose={() => setFollowersOpen(false)}
        type="followers"
        userId={profileUser.id}
      />
      <UserListModal
        isOpen={followingOpen}
        onClose={() => setFollowingOpen(false)}
        type="following"
        userId={profileUser.id}
      />
    </div>
  );
}
