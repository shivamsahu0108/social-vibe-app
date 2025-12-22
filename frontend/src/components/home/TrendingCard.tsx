import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Hash } from "lucide-react";

const TRENDING_TOPICS = [
  { tag: "WebDevelopment", posts: "12.5K" },
  { tag: "AI", posts: "8.9K" },
  { tag: "Design", posts: "6.2K" },
  { tag: "Photography", posts: "4.8K" },
  { tag: "Travel", posts: "3.1K" },
];

export function TrendingCard() {
  return (
    <Card className="sticky top-24 border-2">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-lg">
          <TrendingUp className="h-5 w-5 text-pink-500" />
          <span>Trending Now</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {TRENDING_TOPICS.map((topic, index) => (
          <div
            key={topic.tag}
            className="flex items-center justify-between p-3 rounded-xl hover:bg-accent transition-colors cursor-pointer group"
          >
            <div className="flex items-center space-x-3">
              <span className="text-sm font-bold text-muted-foreground group-hover:text-pink-500 transition-colors">
                {index + 1}
              </span>
              <div>
                <div className="flex items-center space-x-1">
                  <Hash className="h-3.5 w-3.5 text-muted-foreground" />
                  <p className="font-semibold text-sm">{topic.tag}</p>
                </div>
                <p className="text-xs text-muted-foreground">
                  {topic.posts} posts
                </p>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
