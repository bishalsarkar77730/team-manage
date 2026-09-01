import { useState } from "react";
import { Plus } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import CreateTaskForm from "./create-task-form";

const CreateTaskDialog = (props: { projectId?: string }) => {
  const [isOpen, setIsOpen] = useState(false);

  const onClose = () => {
    setIsOpen(false);
  };
  return (
    <div className="w-full sm:w-auto">
      <Dialog modal={true} open={isOpen} onOpenChange={setIsOpen}>
        {/* asChild so the trigger does not wrap the button in a second button,
            and so the full-width class actually reaches the control */}
        <DialogTrigger asChild>
          <Button className="w-full sm:w-auto shrink-0">
            <Plus />
            New Task
          </Button>
        </DialogTrigger>
        <DialogContent className="!flex max-h-[85dvh] flex-col gap-0 overflow-hidden border-0 !p-0 sm:max-w-[560px]">
          <CreateTaskForm projectId={props.projectId} onClose={onClose} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CreateTaskDialog;
