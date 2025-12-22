export interface Story {
  id: string;
  userId: string;
  username: string;
  userAvatar: string;
  image?: string;
  video?: string;
  type: "image" | "video";
  timestamp: Date;
}

export interface StoryGroup {
  userId: string;
  username: string;
  userAvatar: string;
  stories: Story[];
  hasUnseenStories: boolean;
}

