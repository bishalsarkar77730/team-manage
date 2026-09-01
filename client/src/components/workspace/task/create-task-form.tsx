import { z } from "zod";
import { format } from "date-fns";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { CalendarIcon, Loader } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import AssigneeSelect from "./assignee-select";
import { Button } from "@/components/ui/button";
import { Textarea } from "../../ui/textarea";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { transformOptions } from "@/lib/helper";
import useWorkspaceId from "@/hooks/use-workspace-id";
import { TaskPriorityEnum, TaskSizeEnum, TaskStatusEnum } from "@/constant";
import useGetProjectsInWorkspaceQuery from "@/hooks/api/use-get-projects";
import useGetWorkspaceMembers from "@/hooks/api/use-get-workspace-members";
import { createTaskMutationFn } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import DialogShell, { OptionalChip } from "@/components/resuable/dialog-shell";

export default function CreateTaskForm(props: {
  projectId?: string;
  onClose: () => void;
}) {
  const { projectId, onClose } = props;

  const queryClient = useQueryClient();
  const workspaceId = useWorkspaceId();

  const { mutate, isPending } = useMutation({
    mutationFn: createTaskMutationFn,
  });

  const { data, isLoading } = useGetProjectsInWorkspaceQuery({
    workspaceId,
    skip: !!projectId,
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

  // shape the picker wants: plain member records with an avatar
  const assigneeOptions = members.map((member) => ({
    _id: member.userId._id,
    name: member.userId?.name || "Unknown",
    profilePicture: member.userId?.profilePicture ?? null,
  }));

  const formSchema = z.object({
    title: z.string().trim().min(1, {
      message: "Title is required",
    }),
    description: z.string().trim(),
    projectId: z.string().trim().min(1, {
      message: "Project is required",
    }),
    status: z.enum(
      Object.values(TaskStatusEnum) as [keyof typeof TaskStatusEnum],
      {
        required_error: "Status is required",
      },
    ),
    priority: z.enum(
      Object.values(TaskPriorityEnum) as [keyof typeof TaskPriorityEnum],
      {
        required_error: "Priority is required",
      },
    ),
    size: z.enum(Object.values(TaskSizeEnum) as [keyof typeof TaskSizeEnum], {
      required_error: "Size is required",
    }),
    assignedTo: z
      .array(z.string().trim().min(1))
      .min(1, { message: "Pick at least one assignee" }),
    dueDate: z.date({
      required_error: "A due date is required",
    }),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      projectId: projectId ? projectId : "",
      assignedTo: [],
    },
  });

  const taskStatusList = Object.values(TaskStatusEnum);
  const taskPriorityList = Object.values(TaskPriorityEnum); // ["LOW", "MEDIUM", "HIGH"]
  const taskSizeList = Object.values(TaskSizeEnum); // ["SMALL", "MEDIUM", "LARGE"]

  const statusOptions = transformOptions(taskStatusList);
  const priorityOptions = transformOptions(taskPriorityList);
  const sizeOptions = transformOptions(taskSizeList);

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (isPending) return;
    const payload = {
      workspaceId,
      projectId: values.projectId,
      data: {
        ...values,
        dueDate: values.dueDate.toISOString(),
      },
    };

    mutate(payload, {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ["project-analytics", projectId],
        });

        queryClient.invalidateQueries({
          queryKey: ["all-tasks", workspaceId],
        });

        toast({
          title: "Success",
          description: "Task created successfully",
          variant: "success",
        });
        onClose();
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      },
    });
  };

  return (
    <DialogShell
      eyebrow="New task"
      title="Create a task"
      description="Assign the work, set a due date, and give it a status."
    >
      <Form {...form}>
        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <div>
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">
                    Task title
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Website Redesign"
                      className="!h-11"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* {Description} */}
          <div>
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center gap-2">
                    <FormLabel className="text-sm font-medium">
                      Description
                    </FormLabel>
                    <OptionalChip />
                  </div>
                  <FormControl>
                    <Textarea
                      rows={2}
                      className="resize-none"
                      placeholder="What needs doing?"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* {ProjectId} */}

          {!projectId && (
            <div>
              <FormField
                control={form.control}
                name="projectId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a project" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {isLoading && (
                          <div className="my-2">
                            <Loader className="w-4 h-4 place-self-center flex animate-spin" />
                          </div>
                        )}
                        <div
                          className="w-full max-h-[200px]
                           overflow-y-auto scrollbar
                          "
                        >
                          {projectOptions?.map((option) => (
                            <SelectItem
                              key={option.value}
                              className="!capitalize cursor-pointer"
                              value={option.value}
                            >
                              {option.label}
                            </SelectItem>
                          ))}
                        </div>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          {/* {Members AssigneeTo} */}

          <div>
            <FormField
              control={form.control}
              name="assignedTo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">
                    Assigned to
                  </FormLabel>
                  <FormControl>
                    <AssigneeSelect
                      value={field.value ?? []}
                      onChange={field.onChange}
                      members={assigneeOptions}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* {Due Date} */}
          <div className="!mt-2">
            <FormField
              control={form.control}
              name="dueDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Due Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full flex-1 pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground",
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={
                          (date) =>
                            date < new Date(new Date().setHours(0, 0, 0, 0)) || // Disable past dates
                            date > new Date("2100-12-31") //Prevent selection beyond a far future date
                        }
                        initialFocus
                        defaultMonth={new Date()}
                        fromMonth={new Date()}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* {Status} */}

          <div>
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          className="!text-muted-foreground !capitalize"
                          placeholder="Select a status"
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {statusOptions?.map((status) => (
                        <SelectItem
                          className="!capitalize"
                          key={status.value}
                          value={status.value}
                        >
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* {Priority} */}
          <div>
            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Priority</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a priority" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {priorityOptions?.map((priority) => (
                        <SelectItem
                          className="!capitalize"
                          key={priority.value}
                          value={priority.value}
                        >
                          {priority.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* {Size} */}
          <div>
            <FormField
              control={form.control}
              name="size"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Size</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a size" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {sizeOptions?.map((size) => (
                        <SelectItem
                          className="!capitalize"
                          key={size.value}
                          value={size.value}
                        >
                          {size.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={isPending}
              className="h-11 sm:h-10"
            >
              Cancel
            </Button>
            <Button
              className="h-11 font-medium sm:h-10"
              type="submit"
              disabled={isPending}
            >
              {isPending && <Loader className="animate-spin" />}
              Create task
            </Button>
          </div>
        </form>
      </Form>
    </DialogShell>
  );
}
