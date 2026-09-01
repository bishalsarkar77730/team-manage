import { Link } from "react-router-dom";

import { cn } from "@/lib/utils";

/**
 * The Meridian mark: a sphere with a single meridian arc springing from pole to
 * pole. Deliberately not a ring crossed by a straight horizontal bar — that
 * silhouette belongs to the London Underground roundel — and not a ring with a
 * diagonal, which reads as the "prohibited"/null symbol.
 *
 * Strokes are drawn with `currentColor`, so the mark takes the colour of
 * whatever it sits on (the primary-filled badge below, a page heading, etc.).
 */
export const MeridianMark = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.9}
    strokeLinecap="round"
    aria-hidden="true"
    className={cn("size-4", className)}
  >
    <circle cx="12" cy="12" r="7.5" />
    <path d="M12 4.5a10 10 0 0 0 0 15" />
  </svg>
);

const Logo = (props: { url?: string; className?: string }) => {
  const { url = "/", className } = props;
  return (
    <div className="flex items-center justify-center sm:justify-start">
      <Link to={url} aria-label="Meridian home">
        <div
          className={cn(
            "flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground",
            className
          )}
        >
          <MeridianMark className="size-4" />
        </div>
      </Link>
    </div>
  );
};

export default Logo;
