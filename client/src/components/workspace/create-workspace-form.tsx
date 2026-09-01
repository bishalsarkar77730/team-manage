import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "../ui/textarea";
import DialogShell, { OptionalChip } from "@/components/resuable/dialog-shell";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createWorkspaceMutationFn } from "@/lib/api";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { Loader } from "lucide-react";

export default function CreateWorkspaceForm({
  onClose,
}: {
  onClose: () => void;
}) {
  const navigate = useNavigate();

  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: createWorkspaceMutationFn,
  });

  const formSchema = z.object({
    name: z.string().trim().min(1, {
      message: "Workspace name is required",
    }),
    description: z.string().trim(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (isPending) return;
    mutate(values, {
      onSuccess: (data) => {
        queryClient.resetQueries({
          queryKey: ["userWorkspaces"],
        });

        const workspace = data.workspace;
        onClose();
        navigate(`/workspace/${workspace._id}`);
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
      eyebrow="New workspace"
      title="Let's build a workspace"
      description="One place for your team's projects, tasks and the people working on them."
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">
                  Workspace name
                </FormLabel>
                <FormControl>
                  <Input
                    autoFocus
                    placeholder="Jagruti Rehab"
                    className="!h-11"
                    {...field}
                  />
                </FormControl>
                <FormDescription className="text-xs">
                  The name of your company, team or organization.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

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
                    placeholder="Our team organizes marketing projects and tasks here."
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormDescription className="text-xs">
                  A few words to orient members when they join.
                </FormDescription>
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
              disabled={isPending}
              className="h-11 font-medium sm:h-10"
              type="submit"
            >
              {isPending && <Loader className="animate-spin" />}
              Create workspace
            </Button>
          </div>
        </form>
      </Form>
    </DialogShell>
  );
}
