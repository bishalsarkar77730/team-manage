import { MeridianGraticule, MeridianMark } from "@/components/logo";
import { cn } from "@/lib/utils";

/**
 * The shared chrome for every creation / edit dialog: a header band carrying
 * the mark, an eyebrow, a title and a one-line description, with the meridian
 * graticule as brand texture behind it.
 *
 * It exists so the dialogs cannot drift apart again — previously each form
 * hand-rolled its own heading with its own hardcoded colours and its own idea
 * of alignment. Wrap the fields in `children`; put the buttons in `actions`.
 */
const DialogShell = ({
  eyebrow,
  title,
  description,
  children,
  actions,
  className,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}) => {
  return (
    // Column layout with a fixed header and a scrolling body. min-h-0 is what
    // lets the body actually shrink and scroll — without it a flex child keeps
    // its content height and the form runs off the bottom of the dialog.
    <div className={cn("flex min-h-0 w-full flex-1 flex-col", className)}>
      <div className="relative shrink-0 overflow-hidden border-b bg-muted/40 px-6 pb-6 pt-7 sm:px-8">
        <MeridianGraticule className="pointer-events-none absolute -right-16 -top-24 size-72 text-foreground opacity-[0.07]" />

        <div className="relative">
          <span className="mb-4 flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <MeridianMark className="size-[19px]" />
          </span>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            {eyebrow}
          </p>
          {/* pr-8 keeps the title clear of the dialog's close button */}
          <h2 className="mt-2 pr-8 text-xl font-semibold tracking-tight sm:text-[22px]">
            {title}
          </h2>
          {description ? (
            <p className="mt-1.5 max-w-md text-pretty text-sm leading-relaxed text-muted-foreground">
              {description}
            </p>
          ) : null}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6 sm:px-8">
        {children}

        {actions ? (
          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            {actions}
          </div>
        ) : null}
      </div>
    </div>
  );
};

/** The muted chip used beside labels for non-required fields. */
export const OptionalChip = () => (
  <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
    Optional
  </span>
);

export default DialogShell;
