import { Dialog, DialogContent } from "@/components/ui/dialog";
import EditTaskForm from "./edit-task-form";
import { TaskType } from "@/types/api.type";

const EditTaskDialog = ({
  task,
  isOpen,
  onClose,
}: {
  task: TaskType;
  isOpen: boolean;
  onClose: () => void;
}) => {
  return (
    <Dialog modal={true} open={isOpen} onOpenChange={onClose}>
      <DialogContent className="!flex max-h-[85dvh] flex-col gap-0 overflow-hidden border-0 !p-0 sm:max-w-[560px]">
        <EditTaskForm task={task} onClose={onClose} />
      </DialogContent>
    </Dialog>
  );
};

export default EditTaskDialog;
