import { Check, Globe, Lock } from "lucide-react";

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
import { VisibilityType } from "@/types/api.type";

export type MemberOption = { _id: string; name: string; profilePicture: string | null };

/**
 * Who can see this note or meeting. Private is the default and the safe state;
 * sharing is an explicit, per-item choice of named workspace members rather
 * than a workspace-wide toggle.
 */
const VisibilityPicker = ({
  visibility,
  onVisibilityChange,
  sharedWith,
  onSharedWithChange,
  members,
  disabled,
}: {
  visibility: VisibilityType;
  onVisibilityChange: (next: VisibilityType) => void;
  sharedWith: string[];
  onSharedWithChange: (next: string[]) => void;
  members: MemberOption[];
  disabled?: boolean;
}) => {
  const selected = members.filter((m) => sharedWith.includes(m._id));

  const toggle = (id: string) => {
    onSharedWithChange(
      sharedWith.includes(id)
        ? sharedWith.filter((x) => x !== id)
        : [...sharedWith, id]
    );
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        {(
          [
            {
              value: "PRIVATE" as const,
              icon: Lock,
              label: "Only me",
              hint: "Nobody else can see it",
            },
            {
              value: "SHARED" as const,
              icon: Globe,
              label: "Share",
              hint: "Pick who can see it",
            },
          ]
        ).map(({ value, icon: Icon, label, hint }) => (
          <button
            key={value}
            type="button"
            disabled={disabled}
            onClick={() => onVisibilityChange(value)}
            aria-pressed={visibility === value}
            className={cn(
              "flex flex-col items-start gap-0.5 rounded-md border px-3 py-2.5 text-left transition-colors",
              "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
              visibility === value
                ? "border-foreground/25 bg-accent"
                : "hover:bg-muted/60"
            )}
          >
            <span className="flex items-center gap-1.5 text-sm font-medium">
              <Icon className="size-3.5 text-muted-foreground" />
              {label}
            </span>
            <span className="text-xs text-muted-foreground">{hint}</span>
          </button>
        ))}
      </div>

      {visibility === "SHARED" ? (
        <div className="space-y-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                disabled={disabled}
                className="h-10 w-full justify-start font-normal"
              >
                {selected.length
                  ? `${selected.length} member${selected.length > 1 ? "s" : ""} selected`
                  : "Select members…"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
              <Command>
                <CommandInput placeholder="Search members…" />
                <CommandList>
                  <CommandEmpty>No members found.</CommandEmpty>
                  <CommandGroup>
                    {members.map((member) => {
                      const isOn = sharedWith.includes(member._id);
                      return (
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
                          {isOn ? (
                            <Check className="ml-auto size-4 shrink-0" />
                          ) : null}
                        </CommandItem>
                      );
                    })}
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
                  className="flex items-center gap-1.5 rounded-full bg-muted py-0.5 pl-0.5 pr-2 text-xs hover:bg-accent"
                >
                  <Avatar className="size-5">
                    <AvatarImage src={member.profilePicture || ""} />
                    <AvatarFallback
                      className={cn("text-[9px]", getAvatarColor(member.name))}
                    >
                      {getAvatarFallbackText(member.name)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="max-w-[10rem] truncate">{member.name}</span>
                </button>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">
              Nobody selected yet — it stays private until you pick someone.
            </p>
          )}
        </div>
      ) : null}
    </div>
  );
};

export default VisibilityPicker;
