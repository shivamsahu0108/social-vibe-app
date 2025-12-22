import { MessageSquare, Inbox, Bell, ImageOff } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center space-y-4">
      {icon && (
        <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
          {icon}
        </div>
      )}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground max-w-sm">{description}</p>
      </div>
      {action && (
        <Button onClick={action.onClick} className="mt-4">
          {action.label}
        </Button>
      )}
    </div>
  );
}

// Preset empty states
export function EmptyPosts() {
  return (
    <EmptyState
      icon={<ImageOff className="h-8 w-8" />}
      title="No posts yet"
      description="Start following people to see their posts in your feed."
    />
  );
}

export function EmptyChats() {
  return (
    <EmptyState
      icon={<MessageSquare className="h-8 w-8" />}
      title="No messages"
      description="Send a message to start a conversation."
    />
  );
}

export function EmptyNotifications() {
  return (
    <EmptyState
      icon={<Bell className="h-8 w-8" />}
      title="No notifications"
      description="You're all caught up! Check back later for new updates."
    />
  );
}

export function EmptyInbox() {
  return (
    <EmptyState
      icon={<Inbox className="h-8 w-8" />}
      title="Your inbox is empty"
      description="Messages you receive will appear here."
    />
  );
}
