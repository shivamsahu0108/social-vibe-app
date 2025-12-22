import { Skeleton } from "@/components/ui/skeleton";

export function ChatMessageSkeleton() {
  return (
    <div className="space-y-4 p-4">
      {/* Received message */}
      <div className="flex justify-start">
        <div className="flex items-end space-x-2 max-w-[75%]">
          <Skeleton className="h-6 w-6 rounded-full" />
          <div className="space-y-1">
            <Skeleton className="h-16 w-48 rounded-2xl rounded-bl-md" />
            <Skeleton className="h-3 w-12" />
          </div>
        </div>
      </div>

      {/* Sent message */}
      <div className="flex justify-end">
        <div className="flex flex-col space-y-1">
          <Skeleton className="h-12 w-40 rounded-2xl rounded-br-md ml-auto" />
          <Skeleton className="h-3 w-12 ml-auto" />
        </div>
      </div>

      {/* Received message */}
      <div className="flex justify-start">
        <div className="flex items-end space-x-2 max-w-[75%]">
          <Skeleton className="h-6 w-6 rounded-full" />
          <div className="space-y-1">
            <Skeleton className="h-20 w-56 rounded-2xl rounded-bl-md" />
            <Skeleton className="h-3 w-12" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function ChatListSkeleton() {
  return (
    <div className="p-2 space-y-2">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-center space-x-3 p-3 rounded-xl">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-12" />
            </div>
            <Skeleton className="h-3 w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}
