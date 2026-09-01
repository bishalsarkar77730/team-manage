import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuthContext } from "@/context/auth-provider";
import { Loader } from "lucide-react";

const WorkspaceHeader = () => {
  const { workspaceLoading, workspace } = useAuthContext();
  return (
    <div className="w-full max-w-3xl mx-auto pb-2">
      {workspaceLoading ? (
        <Loader className="w-8 h-8 animate-spin" />
      ) : (
        <div className="flex items-center gap-4">
          <Avatar className="size-14 shrink-0 rounded-lg font-bold sm:size-[60px]">
            <AvatarFallback className="rounded-lg bg-primary text-[32px] font-semibold text-primary-foreground">
              {workspace?.name?.split(" ")?.[0]?.charAt(0) || "W"}
            </AvatarFallback>
          </Avatar>
          <div className="grid min-w-0 flex-1 text-left leading-tight">
            <span className="truncate font-semibold text-xl">
              {workspace?.name}
            </span>
            <span className="truncate text-sm">Free</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkspaceHeader;
