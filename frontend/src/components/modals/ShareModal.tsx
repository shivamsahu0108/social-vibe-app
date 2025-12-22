import { Link as LinkIcon, Facebook, Twitter, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useUIStore } from "@/store";
import { useState, useMemo } from "react";

export function ShareModal() {
  const { isShareModalOpen, closeShareModal, activePostId } = useUIStore();
  const [copied, setCopied] = useState(false);

  const shareUrl = useMemo(
    () => `https://vibeshare.com/post/${activePostId || "unknown"}`,
    [activePostId]
  );

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={isShareModalOpen} onOpenChange={closeShareModal}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Post</DialogTitle>
          <DialogDescription>
            Share this post with your friends
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {/* Social Share Buttons */}
          <div className="grid grid-cols-4 gap-3">
            <button className="flex flex-col items-center space-y-2 p-3 rounded-xl hover:bg-accent transition-colors">
              <div className="h-12 w-12 rounded-full bg-blue-500 flex items-center justify-center">
                <Facebook className="h-6 w-6 text-white" fill="white" />
              </div>
              <span className="text-xs">Facebook</span>
            </button>
            <button className="flex flex-col items-center space-y-2 p-3 rounded-xl hover:bg-accent transition-colors">
              <div className="h-12 w-12 rounded-full bg-sky-500 flex items-center justify-center">
                <Twitter className="h-6 w-6 text-white" fill="white" />
              </div>
              <span className="text-xs">Twitter</span>
            </button>
            <button className="flex flex-col items-center space-y-2 p-3 rounded-xl hover:bg-accent transition-colors">
              <div className="h-12 w-12 rounded-full bg-linear-to-br from-pink-500 to-purple-500 flex items-center justify-center">
                <Send className="h-6 w-6 text-white" />
              </div>
              <span className="text-xs">Message</span>
            </button>
            <button className="flex flex-col items-center space-y-2 p-3 rounded-xl hover:bg-accent transition-colors">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                <LinkIcon className="h-6 w-6" />
              </div>
              <span className="text-xs">Copy</span>
            </button>
          </div>

          {/* Copy Link */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Page Link</label>
            <div className="flex space-x-2">
              <Input value={shareUrl} readOnly className="flex-1" />
              <Button onClick={handleCopyLink} className="shrink-0">
                {copied ? "Copied!" : "Copy"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
