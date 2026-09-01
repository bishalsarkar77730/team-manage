import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "../../ui/textarea";
import EmojiPickerComponent from "@/components/emoji-picker";
import { ProjectType } from "@/types/api.type";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import useWorkspaceId from "@/hooks/use-workspace-id";
import { editProjectMutationFn } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import { Loader } from "lucide-react";
import DialogShell, { OptionalChip } from "@/components/resuable/dialog-shell";

export default function EditProjectForm(props: {
  project?: ProjectType;
  onClose: () => void;
}) {
  const { project, onClose } = props;
  const workspaceId = useWorkspaceId();
  const queryClient = useQueryClient();

  // seeded from the project on mount; the dialog remounts this form per project
  // (see the `key` in edit-project-dialog), so no effect is needed to re-sync
  const [emoji, setEmoji] = useState(project?.emoji || "📊");

  const projectId = project?._id as string;

  const formSchema = z.object({
    name: z.string().trim().min(1, {
      message: "Project title is required",
    }),
    description: z.string().trim(),
  });

  const { mutate, isPending } = useMutation({
    mutationFn: editProjectMutationFn,
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: project?.name || "",
      description: project?.description || "",
    },
  });

  const handleEmojiSelection = (emoji: string) => {
    setEmoji(emoji);
  };

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (isPending) return;
    const payload = {
      projectId,
      workspaceId,
      data: { emoji, ...values },
    };
    mutate(payload, {
      onSuccess: (data) => {
        queryClient.invalidateQueries({
          queryKey: ["singleProject", projectId],
        });

        queryClient.invalidateQueries({
          queryKey: ["allprojects", workspaceId],
        });

        toast({
          title: "Success",
          description: data.message,
          variant: "success",
        });

        setTimeout(() => onClose(), 100);
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
      eyebrow="Edit project"
      title="Update this project"
      description="Change the name, icon or description your team sees."
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="block text-sm font-medium">Icon</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="mt-2 size-14 items-center rounded-xl !p-2 font-normal !shadow-none"
                >
                  <span className="text-3xl">{emoji}</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent align="start" className=" !p-0">
                <EmojiPickerComponent onSelectEmoji={handleEmojiSelection} />
              </PopoverContent>
            </Popover>
          </div>
          <div>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">
                    Project title
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="" className="!h-11" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
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
                      rows={3}
                      className="resize-none"
                      placeholder="What is this project for?"
                      {...field}
                    />
                  </FormControl>
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
              disabled={isPending}
              className="h-11 font-medium sm:h-10"
              type="submit"
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
