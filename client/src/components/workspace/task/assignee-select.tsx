import { Check, ChevronsUpDown, X } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { getAvatarColor, getAvatarFallbackText } from "@/lib/helper";
import { cn } from "@/lib/utils";

export type AssigneeOption = {
  _id: string;
  name: string;
  profilePicture: string | null;
};

/**
 * Multi-select for task assignees. A task can belong to several members, and
 * every assignee can see and edit it — so this is also the control that decides
 * who has access, not just whose name is on it.
 */
const AssigneeSelect = ({
  value,
  onChange,
  members,
  disabled,
}: {
  value: string[];
  onChange: (next: string[]) => void;
  members: AssigneeOption[];
  disabled?: boolean;
}) => {
  const selected = members.filter((m) => value.includes(m._id));

  const toggle = (id: string) =>
    onChange(
      value.includes(id) ? value.filter((x) => x !== id) : [...value, id]
    );

  return (
    <div className="space-y-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            disabled={disabled}
            className="h-11 w-full justify-between font-normal"
          >
            <span className={cn(!selected.length && "text-muted-foreground")}>
              {selected.length
                ? `${selected.length} assignee${selected.length > 1 ? "s" : ""}`
                : "Select assignees…"}
            </span>
            <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-[--radix-popover-trigger-width] p-0"
          align="start"
        >
          <Command>
            <CommandInput placeholder="Search members…" />
            <CommandList>
              <CommandEmpty>No members found.</CommandEmpty>
              <CommandGroup>
                {members.map((member) => (
                  <CommandItem
                    key={member._id}
                    value={member.name}
                    onSelect={() => toggle(member._id)}
                    className="cursor-pointer gap-2"
                  >
                    <Avatar className="size-6">
                      <AvatarImage src={member.profilePicture || ""} />
                      <AvatarFallback
                        className={cn(
                          "text-[10px]",
                          getAvatarColor(member.name)
                        )}
                      >
                        {getAvatarFallbackText(member.name)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="truncate">{member.name}</span>
                    {value.includes(member._id) ? (
                      <Check className="ml-auto size-4 shrink-0" />
                    ) : null}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {selected.length ? (
        <div className="flex flex-wrap gap-1.5">
          {selected.map((member) => (
            <button
              key={member._id}
              type="button"
              onClick={() => toggle(member._id)}
              title={`Remove ${member.name}`}
              className="flex items-center gap-1.5 rounded-full bg-muted py-0.5 pl-0.5 pr-1.5 text-xs hover:bg-accent"
            >
              <Avatar className="size-5">
                <AvatarImage src={member.profilePicture || ""} />
                <AvatarFallback
                  className={cn("text-[9px]", getAvatarColor(member.name))}
                >
                  {getAvatarFallbackText(member.name)}
                </AvatarFallback>
              </Avatar>
              <span className="max-w-[9rem] truncate">{member.name}</span>
              <X className="size-3 opacity-60" aria-hidden="true" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
};

export default AssigneeSelect;
