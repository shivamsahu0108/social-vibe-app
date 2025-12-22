export interface Reel {
  id: string;
  videoUrl: string;
  thumbnail: string;
  username: string;
  userAvatar: string;
  verified: boolean;
  caption: string;
  likes: number;
  comments: number;
  shares: number;
  views: string;
  userId?: number;
  followed?: boolean;
}
