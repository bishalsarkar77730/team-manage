import { Column, ColumnDef, Row } from "@tanstack/react-table";
import { format } from "date-fns";

import { DataTableColumnHeader } from "./table-column-header";
import { DataTableRowActions } from "./table-row-actions";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  TaskPriorityEnum,
  TaskPriorityEnumType,
  TaskStatusEnum,
  TaskStatusEnumType,
} from "@/constant";
import {
  formatStatusToEnum,
  getAvatarColor,
  getAvatarFallbackText,
} from "@/lib/helper";
import { priorities, sizes, statuses } from "./data";
import { cn } from "@/lib/utils";
import { TaskType } from "@/types/api.type";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export const getColumns = (projectId?: string): ColumnDef<TaskType>[] => {
  const columns: ColumnDef<TaskType>[] = [
    {
      id: "_id",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
          className="translate-y-[2px]"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
          className="translate-y-[2px]"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "title",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Title" />
      ),
      cell: ({ row }) => {
        return (
          // The code sits above the title rather than beside it: inline, its
          // ~76px is added to the widest title in the column, and this table
          // has nine columns to fit.
          <div className="flex min-w-[170px] max-w-[280px] flex-col items-start gap-1">
            <Badge
              variant="outline"
              className="h-[22px] shrink-0 px-1.5 text-[11px] capitalize"
            >
              {row.original.taskCode}
            </Badge>
            <span className="font-medium leading-snug">
              {row.original.title}
            </span>
          </div>
        );
      },
    },
    ...(projectId
      ? [] // If projectId exists, exclude the "Project" column
      : [
          {
            accessorKey: "project",
            header: ({ column }: { column: Column<TaskType, unknown> }) => (
              <DataTableColumnHeader column={column} title="Project" />
            ),
            cell: ({ row }: { row: Row<TaskType> }) => {
              const project = row.original.project;

              if (!project) {
                return null;
              }

              return (
                <div className="flex items-center gap-1">
                  <span className="rounded-full border">{project.emoji}</span>
                  <span className="block w-[88px] truncate capitalize">
                    {project.name}
                  </span>
                </div>
              );
            },
          },
        ]),
    {
      accessorKey: "assignedTo",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Assigned To" />
      ),
      cell: ({ row }) => {
        // assignedTo is a list now — show up to three faces, then a count
        const assignees = row.original.assignedTo ?? [];

        if (!assignees.length) {
          return (
            <span className="text-sm text-muted-foreground">Unassigned</span>
          );
        }

        // Two or three faces say "two or three people" on their own; the
        // count only earns its width once faces start being hidden.
        const hidden = assignees.length - 3;

        return (
          <div
            className="flex items-center gap-1.5"
            title={assignees.map((p) => p.name).join(", ")}
          >
            <div className="flex -space-x-1.5">
              {assignees.slice(0, 3).map((person) => (
                <Avatar
                  key={person._id}
                  title={person.name}
                  className="h-6 w-6 ring-2 ring-background"
                >
                  <AvatarImage
                    src={person.profilePicture || ""}
                    alt={person.name}
                  />
                  <AvatarFallback
                    className={cn("text-[10px]", getAvatarColor(person.name))}
                  >
                    {getAvatarFallbackText(person.name)}
                  </AvatarFallback>
                </Avatar>
              ))}
            </div>
            {assignees.length === 1 && (
              <span className="block max-w-[96px] truncate whitespace-nowrap">
                {assignees[0].name}
              </span>
            )}
            {hidden > 0 && (
              <span className="whitespace-nowrap text-xs text-muted-foreground">
                +{hidden}
              </span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "dueDate",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Due Date" />
      ),
      cell: ({ row }) => {
        return (
          <span className="whitespace-nowrap text-sm">
            {row.original.dueDate
              ? format(row.original.dueDate, "MMM d, yyyy")
              : null}
          </span>
        );
      },
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => {
        const status = statuses.find(
          (status) => status.value === row.getValue("status"),
        );

        if (!status) {
          return null;
        }

        const statusKey = formatStatusToEnum(
          status.value,
        ) as TaskStatusEnumType;
        const Icon = status.icon;

        if (!Icon) {
          return null;
        }

        return (
          <div className="flex items-center">
            <Badge
              variant={TaskStatusEnum[statusKey]}
              className="flex w-auto gap-1 whitespace-nowrap border-0 p-1 px-2 font-medium uppercase shadow-sm"
            >
              <Icon className="h-4 w-4 rounded-full text-inherit" />
              <span>{status.label}</span>
            </Badge>
          </div>
        );
      },
    },
    {
      accessorKey: "priority",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Priority" />
      ),
      cell: ({ row }) => {
        const priority = priorities.find(
          (priority) => priority.value === row.getValue("priority"),
        );

        if (!priority) {
          return null;
        }

        const statusKey = formatStatusToEnum(
          priority.value,
        ) as TaskPriorityEnumType;
        const Icon = priority.icon;

        if (!Icon) {
          return null;
        }

        return (
          <div className="flex items-center">
            <Badge
              variant={TaskPriorityEnum[statusKey]}
              className="flex gap-1 whitespace-nowrap border-0 !bg-transparent p-1 font-medium uppercase !shadow-none"
            >
              <Icon className="h-4 w-4 rounded-full text-inherit" />
              <span>{priority.label}</span>
            </Badge>
          </div>
        );
      },
    },
    {
      accessorKey: "size",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Size" />
      ),
      cell: ({ row }) => {
        const size = sizes.find((size) => size.value === row.getValue("size"));

        if (!size) {
          return null;
        }

        const Icon = size.icon;

        if (!Icon) {
          return null;
        }

        // Neutral outline rather than a colour-coded variant: SMALL/MEDIUM/LARGE
        // would collide with the priority variants in badge.tsx (both have a
        // "MEDIUM" key), and a third colour-coded column makes the row noisy.
        return (
          <div className="flex items-center">
            <Badge
              variant="outline"
              className="flex gap-1 whitespace-nowrap p-1 font-medium uppercase text-muted-foreground"
            >
              <Icon className="h-4 w-4 text-inherit" />
              <span>{size.label}</span>
            </Badge>
          </div>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        return (
          <div className="flex justify-end">
            <DataTableRowActions row={row} />
          </div>
        );
      },
    },
  ];

  return columns;
};
