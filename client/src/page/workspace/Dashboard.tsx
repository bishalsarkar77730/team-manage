import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import useCreateProjectDialog from "@/hooks/use-create-project-dialog";
import WorkspaceAnalytics from "@/components/workspace/workspace-analytics";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import RecentProjects from "@/components/workspace/project/recent-projects";
import RecentTasks from "@/components/workspace/task/recent-tasks";
import RecentMembers from "@/components/workspace/member/recent-members";
import PageHeader from "@/components/resuable/page-header";
const WorkspaceDashboard = () => {
  const { onOpen } = useCreateProjectDialog();
  return (
    <main className="flex flex-1 flex-col py-4 md:pt-3">
      <PageHeader
        eyebrow="Overview"
        title="Workspace overview"
        description="Where your projects, tasks and people stand right now."
        className="mb-6"
        actions={
          <Button onClick={onOpen} className="w-full sm:w-auto">
            <Plus />
            New project
          </Button>
        }
      />
      <WorkspaceAnalytics />

      <section className="mt-6">
        <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Recent activity
        </h2>
        <Tabs defaultValue="projects" className="w-full rounded-lg border p-2">
          {/* three labels do not fit at 320px, so the strip scrolls rather than
              crushing the labels or wrapping the row */}
          <TabsList className="w-full justify-start border-0 bg-muted/50 px-1 h-12 overflow-x-auto no-scrollbar">
            <TabsTrigger className="py-2 shrink-0" value="projects">
              Recent Projects
            </TabsTrigger>
            <TabsTrigger className="py-2 shrink-0" value="tasks">
              Recent Tasks
            </TabsTrigger>
            <TabsTrigger className="py-2 shrink-0" value="members">
              Recent Members
            </TabsTrigger>
          </TabsList>
          <TabsContent value="projects">
            <RecentProjects />
          </TabsContent>
          <TabsContent value="tasks">
            <RecentTasks />
          </TabsContent>
          <TabsContent value="members">
            <RecentMembers />
          </TabsContent>
        </Tabs>
      </section>
    </main>
  );
};

export default WorkspaceDashboard;
