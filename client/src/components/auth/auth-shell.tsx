import { Link } from "react-router-dom";

import { MeridianGraticule, MeridianMark } from "@/components/logo";

const Wordmark = ({ className }: { className?: string }) => (
  <Link
    to="/"
    className={`inline-flex items-center gap-2.5 font-medium tracking-tight ${
      className ?? ""
    }`}
  >
    {/* bare mark rather than a bordered badge: it is drawn in currentColor, so
        it inverts correctly on the dark panel and the light form side alike */}
    <MeridianMark className="size-[22px]" />
    <span className="text-[15px]">Meridian</span>
  </Link>
);

/** Real capabilities of this app — nothing here is a claim it cannot keep. */
const CAPABILITIES = [
  "Workspaces, projects and tasks in one place",
  "Per-workspace roles and permissions",
  "Invite your team with a single link",
];

type AuthShellProps = {
  eyebrow: string;
  title: string;
  subtitle: string;
  /** the form */
  children: React.ReactNode;
  /** the "already have an account" / "sign up" line */
  footer: React.ReactNode;
};

/**
 * Split auth layout: brand panel beside the form on large screens, form only
 * below lg. Shared by sign-in and sign-up so the two pages cannot drift apart.
 *
 * Both halves follow the theme. The panel is always `--card` and the form side
 * always `--background`, so the panel reads as the raised plane in light and
 * dark alike, with a hairline rule doing the separating rather than a colour
 * that ignores the theme.
 */
const AuthShell = ({
  eyebrow,
  title,
  subtitle,
  children,
  footer,
}: AuthShellProps) => {
  return (
    <div className="grid min-h-svh w-full lg:grid-cols-[1.05fr_1fr]">
      {/* ---------- brand panel ---------- */}
      <aside className="relative hidden overflow-hidden bg-card text-card-foreground lg:flex lg:flex-col lg:justify-between lg:border-r lg:p-12 xl:p-16">
        <MeridianGraticule className="pointer-events-none absolute -bottom-40 -left-32 size-[42rem] text-foreground opacity-[0.08]" />

        <Wordmark className="relative" />

        <div className="relative max-w-md">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            The reference line
          </p>
          <p className="mt-5 text-pretty text-3xl font-medium leading-[1.2] tracking-tight xl:text-[2.5rem]">
            Every project, task and person your team is tracking — aligned on
            one line.
          </p>
        </div>

        <ul className="relative space-y-3">
          {CAPABILITIES.map((item) => (
            <li
              key={item}
              className="flex items-start gap-3 text-sm text-muted-foreground"
            >
              <span
                aria-hidden="true"
                className="mt-[7px] size-1 shrink-0 rounded-full bg-muted-foreground/60"
              />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </aside>

      {/* ---------- form ---------- */}
      <main className="flex flex-col justify-center bg-background px-5 py-12 sm:px-10 lg:px-14 xl:px-20">
        <div className="mx-auto w-full max-w-[384px]">
          {/* the panel carries the lockup on large screens */}
          <Wordmark className="mb-10 lg:hidden" />

          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            {eyebrow}
          </p>
          <h1 className="mt-2.5 text-balance text-2xl font-semibold tracking-tight sm:text-[28px]">
            {title}
          </h1>
          <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
            {subtitle}
          </p>

          <div className="mt-8">{children}</div>

          {/* --- Google OAuth (disabled) ---
              The provider button used to sit above the form behind an
              "Or continue with" divider. See components/auth/google-oauth-button. */}

          <p className="mt-8 text-sm text-muted-foreground">{footer}</p>

          <p className="mt-10 text-xs leading-relaxed text-muted-foreground/80">
            By continuing you agree to our{" "}
            <a
              href="#"
              className="underline decoration-muted-foreground/40 underline-offset-4 hover:text-foreground"
            >
              Terms of Service
            </a>{" "}
            and{" "}
            <a
              href="#"
              className="underline decoration-muted-foreground/40 underline-offset-4 hover:text-foreground"
            >
              Privacy Policy
            </a>
            .
          </p>
        </div>
      </main>
    </div>
  );
};

export default AuthShell;
