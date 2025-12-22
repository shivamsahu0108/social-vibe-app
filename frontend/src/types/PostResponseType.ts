export type PostResponseType = {
  id: number;
  userId: number;
  name: string;
  username: string;
  content: string;
  imageUrl?: string | null;
  videoUrl?: string | null;
  type: "POST" | "REEL" | "STORY";
  viewCount: number;
  createdAt: string;
  likeCount: number;
  liked?: boolean;
  saved?: boolean;
  followed?: boolean;
};
