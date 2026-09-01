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
import { Calendar } from "@/components/ui/calendar";
import useWorkspaceId from "@/hooks/use-workspace-id";
import { TaskPriorityEnum, TaskSizeEnum, TaskStatusEnum } from "@/constant";
import useGetWorkspaceMembers from "@/hooks/api/use-get-workspace-members";
import { editTaskMutationFn } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { TaskType } from "@/types/api.type";
import DialogShell from "@/components/resuable/dialog-shell";

export default function EditTaskForm({
  task,
  onClose,
}: {
  task: TaskType;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const workspaceId = useWorkspaceId();

  const { mutate, isPending } = useMutation({
    mutationFn: editTaskMutationFn,
  });

  const { data: memberData } = useGetWorkspaceMembers(workspaceId);
  const members = memberData?.members || [];

  const assigneeOptions = members.map((member) => ({
    _id: member.userId._id,
    name: member.userId?.name || "Unknown",
    profilePicture: member.userId?.profilePicture ?? null,
  }));

  // Status & Priority Options
  const statusOptions = Object.values(TaskStatusEnum).map((status) => ({
    label: status.charAt(0) + status.slice(1).toLowerCase(),
    value: status,
  }));

  const priorityOptions = Object.values(TaskPriorityEnum).map((priority) => ({
    label: priority.charAt(0) + priority.slice(1).toLowerCase(),
    value: priority,
  }));

  const sizeOptions = Object.values(TaskSizeEnum).map((size) => ({
    label: size.charAt(0) + size.slice(1).toLowerCase(),
    value: size,
  }));

  const formSchema = z.object({
    title: z.string().trim().min(1, { message: "Title is required" }),
    description: z.string().trim(),
    status: z.enum(
      Object.values(TaskStatusEnum) as [keyof typeof TaskStatusEnum],
    ),
    priority: z.enum(
      Object.values(TaskPriorityEnum) as [keyof typeof TaskPriorityEnum],
    ),
    size: z.enum(Object.values(TaskSizeEnum) as [keyof typeof TaskSizeEnum]),
    assignedTo: z
      .array(z.string().trim().min(1))
      .min(1, { message: "Pick at least one assignee" }),
    dueDate: z.date({ required_error: "A due date is required." }),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: task?.title ?? "",
      description: task?.description ?? "",
      status: task?.status ?? "TODO",
      priority: task?.priority ?? "MEDIUM",
      // tasks created before `size` existed come back without one
      size: task?.size ?? "MEDIUM",
      assignedTo: (task.assignedTo ?? []).map((person) => person._id),
      dueDate: task?.dueDate ? new Date(task.dueDate) : new Date(),
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (isPending) return;

    const payload = {
      workspaceId,
      projectId: task.project?._id ?? "",
      taskId: task._id,
      data: {
        ...values,
        dueDate: values.dueDate.toISOString(),
      },
    };

    mutate(payload, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["all-tasks", workspaceId] });
        toast({
          title: "Success",
          description: "Task updated successfully",
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
      eyebrow="Edit task"
      title="Update this task"
      description="Change the details, owner or schedule for this task."
    >
      <Form {...form}>
        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            {/* Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Task title</FormLabel>
                  <FormControl>
                    <Input {...field} className="!h-11" placeholder="Task title" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Task Description</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={2} placeholder="Description" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Assigned To */}
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

            {/* Due Date */}
            <FormField
              control={form.control}
              name="dueDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Due Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button variant="outline">
                          {field.value
                            ? format(field.value, "PPP")
                            : "Pick a date"}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent>
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Status */}
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {statusOptions.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Priority */}
            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Priority</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {priorityOptions.map((priority) => (
                        <SelectItem key={priority.value} value={priority.value}>
                          {priority.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Size */}
            <FormField
              control={form.control}
              name="size"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Size</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select size" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {sizeOptions.map((size) => (
                        <SelectItem key={size.value} value={size.value}>
                          {size.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                type="submit"
                className="h-11 font-medium sm:h-10"
                disabled={isPending}
              >
                {isPending && <Loader className="animate-spin" />}
                Save changes
              </Button>
            </div>
        </form>
      </Form>
    </DialogShell>
  );
}
