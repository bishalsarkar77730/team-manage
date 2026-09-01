import { Card, CardContent } from "@/components/ui/card";
import { Loader, TrendingDown, TrendingUp } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * A stat tile. The number leads, the label sits above it small and muted, and
 * the trend arrow is semantic (green = good, red = needs attention) — which for
 * "Overdue" means the arrow logic inverts.
 */
const AnalyticsCard = (props: {
  title: string;
  value: number;
  isLoading: boolean;
}) => {
  const { title, value, isLoading } = props;

  const isOverdue = title.toLowerCase().includes("overdue");
  // for overdue, more is worse; for everything else more is better
  const good = isOverdue ? value === 0 : value > 0;
  const Icon = good ? TrendingUp : TrendingDown;

  return (
    <Card className="w-full border shadow-none transition-colors hover:border-foreground/20">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            {title}
          </p>
          <span
            aria-hidden="true"
            className={cn(
              "flex size-6 shrink-0 items-center justify-center rounded-md",
              good
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                : "bg-destructive/10 text-destructive"
            )}
          >
            <Icon className="size-3.5" strokeWidth={2.5} />
          </span>
        </div>
        <p className="mt-3 text-3xl font-semibold tabular-nums tracking-tight">
          {isLoading ? (
            <Loader className="size-6 animate-spin text-muted-foreground" />
          ) : (
            value
          )}
        </p>
      </CardContent>
    </Card>
  );
};

export default AnalyticsCard;
