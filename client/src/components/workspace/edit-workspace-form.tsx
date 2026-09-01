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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "../ui/textarea";
import { useAuthContext } from "@/context/auth-provider";
import { useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { editWorkspaceMutationFn } from "@/lib/api";
import useWorkspaceId from "@/hooks/use-workspace-id";
import { toast } from "@/hooks/use-toast";
import { Loader } from "lucide-react";
import { OptionalChip } from "@/components/resuable/dialog-shell";
import { Permissions } from "@/constant";

export default function EditWorkspaceForm() {
  const { workspace, hasPermission } = useAuthContext();
  const canEditWorkspace = hasPermission(Permissions.EDIT_WORKSPACE);

  const queryClient = useQueryClient();
  const workspaceId = useWorkspaceId();

  const { mutate, isPending } = useMutation({
    mutationFn: editWorkspaceMutationFn,
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

  useEffect(() => {
    if (workspace) {
      form.setValue("name", workspace.name);
      form.setValue("description", workspace?.description || "");
    }
  }, [form, workspace]);

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (isPending) return;
    const payload = {
      workspaceId: workspaceId,
      data: { ...values },
    };
    mutate(payload, {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ["workspace"],
        });
        queryClient.invalidateQueries({
          queryKey: ["userWorkspaces"],
        });
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
    <div className="w-full h-auto max-w-full">
      <div className="h-full">
        {/* a settings section, not a dialog — same type scale as the delete
            card below it so the two read as siblings */}
        <div className="mb-4 border-b pb-3">
          <h2 className="text-[17px] font-semibold tracking-tight">
            Workspace details
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            The name and description your members see.
          </p>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="mb-4">
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
                        placeholder="Taco's Co."
                        className="!h-[48px] disabled:opacity-90 disabled:pointer-events-none"
                        disabled={!canEditWorkspace}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="mb-4">
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">
                      Workspace description
                      <OptionalChip />
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        rows={6}
                        disabled={!canEditWorkspace}
                        className="disabled:opacity-90 disabled:pointer-events-none"
                        placeholder="Our team organizes marketing projects and tasks here."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            {canEditWorkspace && (
              <Button
                className="flex place-self-end  h-[40px]  font-semibold"
                disabled={isPending}
                type="submit"
              >
                {isPending && <Loader className="animate-spin" />}
                Update Workspace
              </Button>
            )}
          </form>
        </Form>
      </div>
    </div>
  );
}
