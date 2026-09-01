import CreateTaskDialog from "@/components/workspace/task/create-task-dialog";
import TaskTable from "@/components/workspace/task/task-table";
import PageHeader from "@/components/resuable/page-header";
import withPermission from "@/hoc/with-permission";
import { Permissions } from "@/constant";

function Tasks() {
  return (
    <div className="w-full h-full flex-col space-y-6 md:space-y-8 pt-3">
      <PageHeader
        eyebrow="Tasks"
        title="All tasks"
        description="Everything open across this workspace, filterable and sortable."
        actions={<CreateTaskDialog />}
      />
      {/* {Task Table} */}
      <div>
        <TaskTable />
      </div>
    </div>
  );
}

// Members do not have VIEW_ALL_TASKS - they work out of My Tasks instead, so
// the whole-workspace board is gated rather than quietly showing them a
// filtered list under a title that says "All tasks".
const TasksWithPermission = withPermission(Tasks, Permissions.VIEW_ALL_TASKS);

export default TasksWithPermission;
