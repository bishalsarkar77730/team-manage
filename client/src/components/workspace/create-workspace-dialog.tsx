import WorkspaceForm from "./create-workspace-form";
import useCreateWorkspaceDialog from "@/hooks/use-create-workspace-dialog";
import { Dialog, DialogContent } from "@/components/ui/dialog";
const CreateWorkspaceDialog = () => {
  const { open, onClose } = useCreateWorkspaceDialog();

  return (
    <Dialog modal={true} open={open} onOpenChange={onClose}>
      {/* was sm:max-w-5xl to make room for a photo — a two-field form does not
          need 1024px. !p-0 stays because the form supplies its own padding, so
          the header band can run edge to edge. */}
      <DialogContent className="!flex max-h-[85dvh] flex-col gap-0 overflow-hidden border-0 !p-0 sm:max-w-[520px]">
        <WorkspaceForm {...{ onClose }} />
      </DialogContent>
    </Dialog>
  );
};

export default CreateWorkspaceDialog;
