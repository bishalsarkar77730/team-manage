import { FC, useState } from "react";
import { getColumns } from "./table/columns";
import { DataTable } from "./table/table";
import { useParams } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { DataTableFacetedFilter } from "./table/table-faceted-filter";
import { priorities, sizes, statuses } from "./table/data";
import useTaskTableFilter from "@/hooks/use-task-table-filter";
import { useQuery } from "@tanstack/react-query";
import useWorkspaceId from "@/hooks/use-workspace-id";
import { getAllTasksQueryFn } from "@/lib/api";
import { TaskType } from "@/types/api.type";
import useGetProjectsInWorkspaceQuery from "@/hooks/api/use-get-projects";
import useGetWorkspaceMembers from "@/hooks/api/use-get-workspace-members";
import { getAvatarColor, getAvatarFallbackText } from "@/lib/helper";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type Filters = ReturnType<typeof useTaskTableFilter>[0];
type SetFilters = ReturnType<typeof useTaskTableFilter>[1];

interface DataTableFilterToolbarProps {
  isLoading?: boolean;
  projectId?: string;
  filters: Filters;
  setFilters: SetFilters;
  /** on My Tasks every row is already yours, so the filter is noise */
  hideAssigneeFilter?: boolean;
}

/** `mine` asks the server for only the caller's own tasks (My Tasks page). */
const TaskTable = ({ mine = false }: { mine?: boolean }) => {
  const param = useParams();
  const projectId = param.projectId as string;

  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [filters, setFilters] = useTaskTableFilter();
  const workspaceId = useWorkspaceId();
  const columns = getColumns(projectId);

  const { data, isLoading } = useQuery({
    queryKey: [
      "all-tasks",
      workspaceId,
      pageSize,
      pageNumber,
      filters,
      projectId,
      mine,
    ],
    queryFn: () =>
      getAllTasksQueryFn({
        workspaceId,
        keyword: filters.keyword,
        priority: filters.priority,
        status: filters.status,
        size: filters.size,
        projectId: projectId || filters.projectId,
        assignedTo: filters.assigneeId,
        pageNumber,
        pageSize,
        mine,
      }),
    staleTime: 0,
  });

  const tasks: TaskType[] = data?.tasks || [];
  const totalCount = data?.pagination.totalCount || 0;

  const handlePageChange = (page: number) => {
    setPageNumber(page);
  };

  // Handle page size changes
  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
  };

  return (
    <div className="w-full relative">
      <DataTable
        isLoading={isLoading}
        data={tasks}
        columns={columns}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        pagination={{
          totalCount,
          pageNumber,
          pageSize,
        }}
        filtersToolbar={
          <DataTableFilterToolbar
            isLoading={isLoading}
            projectId={projectId}
            filters={filters}
            setFilters={setFilters}
            hideAssigneeFilter={mine}
          />
        }
      />
    </div>
  );
};

const DataTableFilterToolbar: FC<DataTableFilterToolbarProps> = ({
  isLoading,
  projectId,
  filters,
  setFilters,
  hideAssigneeFilter,
}) => {
  const workspaceId = useWorkspaceId();

  const { data } = useGetProjectsInWorkspaceQuery({
    workspaceId,
  });

  const { data: memberData } = useGetWorkspaceMembers(workspaceId);

  const projects = data?.projects || [];
  const members = memberData?.members || [];

  //Workspace Projects
  const projectOptions = projects?.map((project) => {
    return {
      label: (
        <div className="flex items-center gap-1">
          <span>{project.emoji}</span>
          <span>{project.name}</span>
        </div>
      ),
      value: project._id,
    };
  });

  // Workspace Memebers
  const assigneesOptions = members?.map((member) => {
    const name = member.userId?.name || "Unknown";
    const initials = getAvatarFallbackText(name);
    const avatarColor = getAvatarColor(name);

    return {
      label: (
        <div className="flex items-center space-x-2">
          <Avatar className="h-7 w-7">
            <AvatarImage src={member.userId?.profilePicture || ""} alt={name} />
            <AvatarFallback className={avatarColor}>{initials}</AvatarFallback>
          </Avatar>
          <span>{name}</span>
        </div>
      ),
      value: member.userId._id,
    };
  });

  const handleFilterChange = (key: keyof Filters, values: string[]) => {
    setFilters({
      ...filters,
      [key]: values.length > 0 ? values.join(",") : null,
    });
  };

  return (
    <div className="mb-2 flex w-full flex-col gap-2 lg:mb-0 lg:flex-row lg:items-center">
      <Input
        placeholder="Filter tasks..."
        value={filters.keyword || ""}
        onChange={(e) =>
          setFilters({
            keyword: e.target.value,
          })
        }
        className="h-8 w-full lg:w-[250px] lg:shrink-0"
      />
      {/* Below lg the facets scroll sideways in one row. Stacked full-width
          they took five rows and pushed the table off the first screen. */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar lg:overflow-visible lg:pb-0">
        {/* Status filter */}
        <DataTableFacetedFilter
          title="Status"
          multiSelect={true}
          options={statuses}
          disabled={isLoading}
          selectedValues={filters.status?.split(",") || []}
          onFilterChange={(values) => handleFilterChange("status", values)}
        />

        {/* Priority filter */}
        <DataTableFacetedFilter
          title="Priority"
          multiSelect={true}
          options={priorities}
          disabled={isLoading}
          selectedValues={filters.priority?.split(",") || []}
          onFilterChange={(values) => handleFilterChange("priority", values)}
        />

        {/* Size filter */}
        <DataTableFacetedFilter
          title="Size"
          multiSelect={true}
          options={sizes}
          disabled={isLoading}
          selectedValues={filters.size?.split(",") || []}
          onFilterChange={(values) => handleFilterChange("size", values)}
        />

        {/* Assigned To filter */}
        {!hideAssigneeFilter && (
          <DataTableFacetedFilter
            title="Assigned To"
            multiSelect={true}
            options={assigneesOptions}
            disabled={isLoading}
            selectedValues={filters.assigneeId?.split(",") || []}
            onFilterChange={(values) =>
              handleFilterChange("assigneeId", values)
            }
          />
        )}

        {!projectId && (
          <DataTableFacetedFilter
            title="Projects"
            multiSelect={false}
            options={projectOptions}
            disabled={isLoading}
            selectedValues={filters.projectId?.split(",") || []}
            onFilterChange={(values) => handleFilterChange("projectId", values)}
          />
        )}

        {Object.values(filters).some(
          (value) => value !== null && value !== "",
        ) && (
          <Button
            disabled={isLoading}
            variant="ghost"
            className="h-8 shrink-0 px-2 lg:px-3"
            onClick={() =>
              setFilters({
                keyword: null,
                status: null,
                priority: null,
                size: null,
                projectId: null,
                assigneeId: null,
              })
            }
          >
            Reset
            <X />
          </Button>
        )}
      </div>
    </div>
  );
};

export default TaskTable;
