import { useState, useRef, type ChangeEvent } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { postService } from "@/api/post.service";
import { ArrowLeft, Image as ImageIcon, X, Loader2 } from "lucide-react";
import { useAuthStore } from "@/store";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export default function CreatePost() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialType =
    (searchParams.get("type") as "POST" | "REEL" | "STORY") || "POST";

  const user = useAuthStore((s) => s.user);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const setUser = useAuthStore((s) => s.setUser);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string>("");
  const [fileType, setFileType] = useState<"image" | "video" | null>(null);
  const [caption, setCaption] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedType, setSelectedType] = useState<"POST" | "REEL" | "STORY">(
    initialType
  );

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type (image or video)
    const isImage = file.type.startsWith("image/");
    const isVideo = file.type.startsWith("video/");

    if (!isImage && !isVideo) {
      setError("Please select an image or video file");
      return;
    }

    // Validate file size (max 50MB for videos, 10MB for images)
    const maxSize = isVideo ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxSize) {
      setError(`File size should be less than ${isVideo ? "50MB" : "10MB"}`);
      return;
    }

    setError("");
    setSelectedFile(file);
    setFileType(isVideo ? "video" : "image");

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setFilePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setFilePreview("");
    setFileType(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile || !user || !fileType) {
      setError("Please select a file");
      return;
    }

    try {
      setLoading(true);
      setError("");

      // Call appropriate API based on file type
      if (fileType === "image") {
        await postService.createImagePost(
          caption.trim(),
          selectedFile,
          selectedType
        );
      } else {
        // If user is uploading a video as a POST, we might want to treat it as REEL?
        // But let's respect the selectedType.
        const typeToUse = selectedType === "POST" ? "REEL" : selectedType;
        await postService.createVideoPost(
          caption.trim(),
          selectedFile,
          typeToUse
        );
      }

      // 🔥 increment posts count instantly
      setUser({
        ...user,
        postsCount: user.postsCount + 1,
      });

      if (selectedType === "POST") {
        navigate("/profile");
      } else if (selectedType === "REEL") {
        navigate("/reels");
      } else {
        navigate("/");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create post");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="hover:opacity-70 transition-opacity"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-semibold">
              {selectedType === "STORY"
                ? "Create new story"
                : selectedType === "REEL"
                ? "Create new reel"
                : "Create new post"}
            </h1>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={!selectedFile || loading}
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg px-6"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sharing...
              </>
            ) : (
              "Share"
            )}
          </Button>
        </div>
      </div>

      {/* Type Selector */}
      <div className="max-w-4xl mx-auto px-4 mt-6">
        <div className="flex bg-muted rounded-xl p-1 w-fit">
          {(["POST", "REEL", "STORY"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setSelectedType(t)}
              className={cn(
                "px-6 py-2 rounded-lg text-sm font-semibold transition-all",
                selectedType === t
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto p-4">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Media Upload Section */}
          <div className="space-y-4">
            <div className="aspect-square bg-muted rounded-xl overflow-hidden border-2 border-dashed border-border relative group">
              {filePreview ? (
                <>
                  {fileType === "image" ? (
                    <img
                      src={filePreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <video
                      src={filePreview}
                      controls
                      className="w-full h-full object-cover"
                    />
                  )}
                  <button
                    onClick={handleRemoveFile}
                    className="absolute top-3 right-3 bg-black/70 hover:bg-black/90 text-white rounded-full p-2 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-full flex flex-col items-center justify-center cursor-pointer hover:bg-muted/80 transition-colors"
                >
                  <div className="w-20 h-20 rounded-full bg-linear-to-br from-purple-400 to-pink-400 flex items-center justify-center mb-4">
                    <ImageIcon className="w-10 h-10 text-white" />
                  </div>
                  <p className="text-lg font-medium mb-1">
                    Select photos or videos to share
                  </p>
                  <p className="text-sm text-muted-foreground">
                    or drag and drop
                  </p>
                  <Button
                    variant="secondary"
                    className="mt-4 rounded-lg font-semibold"
                  >
                    Select from computer
                  </Button>
                </div>
              )}
            </div>

            {error && (
              <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {/* Caption Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 pb-4 border-b border-border">
              <Avatar className="h-10 w-10">
                <AvatarImage src={user?.profilePic || "/avatar.png"} />
                <AvatarFallback>
                  {user?.username?.[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="font-semibold">{user?.username}</span>
            </div>

            <div>
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Write a caption..."
                className="w-full h-40 bg-transparent resize-none outline-none text-base"
                maxLength={2200}
              />
              <div className="text-xs text-muted-foreground text-right">
                {caption.length}/2,200
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-border">
              <button className="w-full flex items-center justify-between py-3 hover:bg-muted px-3 rounded-lg transition-colors">
                <span className="text-sm font-medium">Add location</span>
                <svg
                  className="w-5 h-5 text-muted-foreground"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>

              <button className="w-full flex items-center justify-between py-3 hover:bg-muted px-3 rounded-lg transition-colors">
                <span className="text-sm font-medium">Tag people</span>
                <svg
                  className="w-5 h-5 text-muted-foreground"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>

              <button className="w-full flex items-center justify-between py-3 hover:bg-muted px-3 rounded-lg transition-colors">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium">Advanced settings</span>
                </div>
                <svg
                  className="w-5 h-5 text-muted-foreground"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Tips Section */}
        <div className="mt-8 p-6 bg-muted/50 rounded-xl">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <svg
              className="w-5 h-5 text-blue-500"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            Tips for great posts
          </h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-0.5">•</span>
              <span>Use high-quality images with good lighting</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-0.5">•</span>
              <span>Write engaging captions that tell a story</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-0.5">•</span>
              <span>Tag relevant people and add location for more reach</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-0.5">•</span>
              <span>Post consistently to keep your audience engaged</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
