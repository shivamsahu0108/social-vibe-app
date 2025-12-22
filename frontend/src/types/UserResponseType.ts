export type UserResponseType = {
  id: number;
  name: string;
  bio: string;
  username: string;
  email: string;
  profilePic: string | null;
  isFollowing: boolean;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  isOnline: boolean;
  lastSeen?: string;
};
