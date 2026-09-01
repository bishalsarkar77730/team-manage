import CreateTaskDialog from "@/components/workspace/task/create-task-dialog";
import TaskTable from "@/components/workspace/task/task-table";
import PageHeader from "@/components/resuable/page-header";

/**
 * The same table as All Tasks, scoped by the server to tasks you created or are
 * assigned to. Members work from here: they can create (which shows up on All
 * Tasks for everyone who can see it) and edit their own, but not delete.
 */
export default function MyTasks() {
  return (
    <div className="w-full h-full flex-col space-y-6 md:space-y-8 pt-3">
      <PageHeader
        eyebrow="Personal"
        title="My tasks"
        description="Everything you created or were assigned, across this workspace."
        actions={<CreateTaskDialog />}
      />
      <div>
        <TaskTable mine />
      </div>
    </div>
  );
}
