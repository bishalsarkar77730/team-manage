import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { MeridianGraticule, MeridianMark } from "@/components/logo";

const NotFound = () => {
  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-background px-6 py-16 text-center">
      <MeridianGraticule className="pointer-events-none absolute -bottom-48 left-1/2 size-[46rem] -translate-x-1/2 text-foreground opacity-[0.06]" />

      <div className="relative w-full max-w-md">
        <Link
          to="/"
          className="mb-10 inline-flex items-center gap-2.5 font-medium tracking-tight"
        >
          <MeridianMark className="size-[22px]" />
          <span className="text-[15px]">Meridian</span>
        </Link>

        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Error 404
        </p>
        <h1 className="mt-2.5 text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
          We couldn&apos;t find that page
        </h1>
        <p className="mx-auto mt-2.5 max-w-sm text-[15px] leading-relaxed text-muted-foreground">
          The link may be out of date, or the workspace it pointed at may have
          been renamed or deleted.
        </p>

        <Button asChild className="mt-8 h-11 w-full sm:w-auto sm:px-6">
          <Link to="/">Back to Meridian</Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
