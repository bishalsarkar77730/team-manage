import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import PageHeader from "@/components/resuable/page-header";
import AnalyticsCard from "@/components/workspace/common/analytics-card";
import OrdinalBarChart from "@/components/workspace/common/ordinal-bar-chart";
import RecentTasks from "@/components/workspace/task/recent-tasks";
import useWorkspaceId from "@/hooks/use-workspace-id";
import { getMyTaskAnalyticsQueryFn } from "@/lib/api";
import { transformStatusEnum } from "@/lib/helper";

/**
 * The personal counterpart to the workspace Dashboard: the same headline
 * numbers, but counting only tasks you created or were assigned, plus the two
 * breakdowns that a single number cannot show.
 */
const MyDashboard = () => {
  const workspaceId = useWorkspaceId();

  const { data, isPending } = useQuery({
    queryKey: ["my-task-analytics", workspaceId],
    queryFn: () => getMyTaskAnalyticsQueryFn(workspaceId),
    enabled: !!workspaceId,
    staleTime: 0,
  });

  const analytics = data?.analytics;

  const titleCase = (value: string) =>
    transformStatusEnum(value)
      .toLowerCase()
      .replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <main className="flex flex-1 flex-col py-4 md:pt-3">
      <PageHeader
        eyebrow="Personal"
        title="My dashboard"
        description="Where your own work stands in this workspace."
        className="mb-6"
        actions={
          <Button asChild className="w-full sm:w-auto">
            <Link to={`/workspace/${workspaceId}/my-tasks`}>
              <Plus />
              Go to my tasks
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 md:gap-5 lg:grid-cols-4">
        <AnalyticsCard
          isLoading={isPending}
          title="Total Task"
          value={analytics?.totalTasks || 0}
        />
        <AnalyticsCard
          isLoading={isPending}
          title="In Review Task"
          value={analytics?.inReviewTasks || 0}
        />
        <AnalyticsCard
          isLoading={isPending}
          title="Overdue Task"
          value={analytics?.overdueTasks || 0}
        />
        <AnalyticsCard
          isLoading={isPending}
          title="Completed Task"
          value={analytics?.completedTasks || 0}
        />
      </div>

      <div className="mt-6 grid gap-4 md:gap-5 lg:grid-cols-2">
        <OrdinalBarChart
          title="My tasks by status"
          emptyLabel="No tasks assigned to you yet"
          data={(analytics?.byStatus || []).map((row) => ({
            label: titleCase(row.key),
            value: row.count,
          }))}
        />
        <OrdinalBarChart
          title="My tasks by priority"
          emptyLabel="No tasks assigned to you yet"
          data={(analytics?.byPriority || []).map((row) => ({
            label: titleCase(row.key),
            value: row.count,
          }))}
        />
      </div>

      <section className="mt-6">
        <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Recent activity
        </h2>
        <div className="rounded-lg border p-2">
          <RecentTasks mine />
        </div>
      </section>
    </main>
  );
};

export default MyDashboard;
