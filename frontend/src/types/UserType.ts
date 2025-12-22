export type User = {
  id: number;
  username: string;
  name: string;
  email: string;
  profilePic: string;
  bio: string;
  isOnline: boolean;
  lastSeen?: string;
  followers: number;
  following: number;
  posts: number;
};
