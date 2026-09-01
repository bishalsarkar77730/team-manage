import { Separator } from "@/components/ui/separator";
import WorkspaceHeader from "@/components/workspace/common/workspace-header";
import EditWorkspaceForm from "@/components/workspace/edit-workspace-form";
import DeleteWorkspaceCard from "@/components/workspace/settings/delete-workspace-card";
import { Permissions } from "@/constant";
import withPermission from "@/hoc/with-permission";

const Settings = () => {
  return (
    <div className="w-full py-4 md:pt-3">
      <WorkspaceHeader />
      <Separator className="my-5" />
      <main>
        <div className="mx-auto w-full max-w-3xl">
          <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Configuration
          </p>
          <h2 className="mb-5 text-xl font-semibold tracking-tight">
            Workspace settings
          </h2>

          <div className="flex flex-col gap-6">
            <section className="rounded-lg border p-5">
              <EditWorkspaceForm />
            </section>
            <section className="rounded-lg border border-destructive/30 p-5">
              <DeleteWorkspaceCard />
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

const SettingsWithPermission = withPermission(
  Settings,
  Permissions.MANAGE_WORKSPACE_SETTINGS
);

export default SettingsWithPermission;
