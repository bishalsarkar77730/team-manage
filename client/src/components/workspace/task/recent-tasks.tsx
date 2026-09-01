import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { TaskPriorityEnum, TaskStatusEnum } from "@/constant";
import useWorkspaceId from "@/hooks/use-workspace-id";
import { getAllTasksQueryFn } from "@/lib/api";
import {
  getAvatarColor,
  getAvatarFallbackText,
  transformStatusEnum,
} from "@/lib/helper";
import { TaskType } from "@/types/api.type";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Loader } from "lucide-react";

/** `mine` scopes the list to the caller's own tasks (My Dashboard). */
const RecentTasks = ({ mine = false }: { mine?: boolean }) => {
  const workspaceId = useWorkspaceId();

  const { data, isLoading } = useQuery({
    queryKey: ["all-tasks", workspaceId, mine],
    queryFn: () =>
      getAllTasksQueryFn({
        workspaceId,
        mine,
      }),
    staleTime: 0,
    enabled: !!workspaceId,
  });

  const tasks: TaskType[] = data?.tasks || [];

  return (
    <div className="flex flex-col space-y-6">
      {isLoading ? (
        <Loader
          className="w-8 h-8 
        animate-spin
        place-self-center flex
        "
        />
      ) : null}

      {tasks?.length === 0 && (
        <div
          className="font-semibold
         text-sm text-muted-foreground
          text-center py-5"
        >
          No Task created yet
        </div>
      )}

      <ul role="list" className="divide-y divide-border">
        {tasks.map((task) => {
          const assignees = task.assignedTo ?? [];
          return (
            <li
              key={task._id}
              className="flex min-w-0 flex-wrap items-center justify-between gap-2 p-3 sm:flex-nowrap sm:p-4 hover:bg-muted/50 transition-colors"
            >
              {/* Task Info */}
              <div className="flex min-w-0 flex-grow basis-full flex-col space-y-1 sm:basis-auto">
                <span className="text-sm capitalize text-muted-foreground font-medium">
                  {task.taskCode}
                </span>
                <p className="text-md font-semibold text-foreground truncate">
                  {task.title}
                </p>
                <span className="text-sm text-muted-foreground">
                  Due: {task.dueDate ? format(task.dueDate, "PPP") : null}
                </span>
              </div>

              {/* Task Status */}
              <div className="shrink-0 text-sm font-medium">
                <Badge
                  variant={TaskStatusEnum[task.status]}
                  className="flex w-auto p-1 px-2 gap-1 font-medium shadow-sm uppercase border-0"
                >
                  <span>{transformStatusEnum(task.status)}</span>
                </Badge>
              </div>

              {/* Task Priority */}
              <div className="shrink-0 text-sm sm:ml-2">
                <Badge
                  variant={TaskPriorityEnum[task.priority]}
                  className="flex w-auto p-1 px-2 gap-1 font-medium shadow-sm uppercase border-0"
                >
                  <span>{transformStatusEnum(task.priority)}</span>
                </Badge>
              </div>

              {/* Assignee */}
              <div className="ml-auto flex shrink-0 items-center space-x-2 sm:ml-2">
                {assignees.length ? (
                  <div className="flex -space-x-2">
                    {assignees.slice(0, 3).map((person) => (
                      <Avatar
                        key={person._id}
                        title={person.name}
                        className="h-8 w-8 ring-2 ring-background"
                      >
                        <AvatarImage
                          src={person.profilePicture || ""}
                          alt={person.name}
                        />
                        <AvatarFallback
                          className={getAvatarColor(person.name)}
                        >
                          {getAvatarFallbackText(person.name)}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                  </div>
                ) : (
                  <span className="text-xs text-muted-foreground">
                    Unassigned
                  </span>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default RecentTasks;

// const RecentTasks = () => {
//   const tasks = [
//     {
//       id: "Task-12",
//       title: "You can't compress the program without quanti",
//       date: "December 29, 2024",
//       assigneeTo: "EM",
//     },
//     {
//       id: "Task-13",
//       title: "You can't compress the program without quanti",
//       date: "December 29, 2024",
//       assigneeTo: "EM",
//     },
//     {
//       id: "Task-14",
//       title: "You can't compress the program without quanti",
//       date: "December 29, 2024",
//       assigneeTo: "EM",
//     },
//     {
//       id: "Task-15",
//       title: "You can't compress the program without quanti",
//       date: "December 29, 2024",
//       assigneeTo: "EM",
//     },
//     {
//       id: "Task-16",
//       title: "You can't compress the program without quanti",
//       date: "December 29, 2024",
//       assigneeTo: "EM",
//     },
//   ];
//   return (
//     <div className="flex flex-col pt-2">
//       <ul role="list" className="space-y-2">
//         {tasks.map((item, index) => (
//           <li
//             key={index}
//             role="listitem"
//             className="shadow-none border-0 py-2 hover:bg-muted/50 transition-colors ease-in-out "
//           >
//             <div className="grid grid-cols-7 gap-1 p-0">
//               <div className="shrink">
//                 <p>{item.id}</p>
//               </div>
//               <div className="col-span-2">
//                 <p className="text-sm font-medium leading-none">{item.title}</p>
//               </div>
//               <div>dueDate</div>
//               <div>Todo</div>
//               <div>High</div>
//               <div className="flex items-center gap-4 place-self-end">
//                 <span className="text-sm text-muted-foreground">Assigned To</span>
//                 <Avatar className="hidden h-9 w-9 sm:flex">
//                   <AvatarImage src="/avatars/01.png" alt="Avatar" />
//                   <AvatarFallback>{item.assigneeTo}</AvatarFallback>
//                 </Avatar>
//               </div>
//             </div>
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// };

// export default RecentTasks;
