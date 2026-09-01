import { Separator } from "@/components/ui/separator";
import InviteMember from "@/components/workspace/member/invite-member";
import AllMembers from "@/components/workspace/member/all-members";
import WorkspaceHeader from "@/components/workspace/common/workspace-header";

export default function Members() {
  return (
    <div className="w-full py-4 md:pt-3">
      <WorkspaceHeader />
      <Separator className="my-5" />
      <main>
        <div className="mx-auto w-full max-w-3xl">
          <div>
            <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              People
            </p>
            <h2 className="text-lg font-semibold tracking-tight">
              Workspace members
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              Members can see every project and task in this workspace, and
              create tasks of their own.
            </p>
          </div>
          <Separator className="my-4" />

          <InviteMember />
          <Separator className="my-4 !h-[0.5px]" />

          <AllMembers />
        </div>
      </main>
    </div>
  );
}
