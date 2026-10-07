import Link from "next/link";

const valueProps = [
  "Portfolio-first analysis for devs without resumes.",
  "Optional GitHub enrichment when you want deeper code signals.",
  "Salary fairness outcome with actionable negotiation guidance.",
  "Radar skill profile + downloadable report for recruiter conversations.",
];

export default function HomePage() {
  return (
    <main className="min-h-screen px-5 py-8 md:px-10 md:py-12">
      <section className="mx-auto max-w-7xl space-y-6">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="surface relative overflow-hidden p-7 md:p-10 reveal">
            <div className="pointer-events-none absolute -left-8 top-8 h-28 w-28 rounded-full bg-sky/20 blur-2xl floaty" />
            <div className="pointer-events-none absolute -right-10 bottom-2 h-32 w-32 rounded-full bg-coral/20 blur-2xl floaty" />

            <p className="kicker">FairDev</p>
            <h1 className="mt-3 text-4xl font-bold leading-tight md:text-6xl [font-family:var(--font-display)]">
              Portfolio-first fairness intelligence for developer salary offers.
            </h1>
            <p className="mt-5 max-w-2xl text-base text-slate">
              Drop your portfolio URL, add optional GitHub and resume context, and get a structured compensation verdict that
              feels like a senior technical hiring panel review.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link className="btn-primary" href="/dashboard">
                Start Analysis
              </Link>
              <Link className="btn-ghost" href="/login">
                Sign in
              </Link>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <div className="surface-strong p-3 reveal reveal-1">
                <p className="kicker">Input</p>
                <p className="mt-1 text-sm font-medium">Portfolio required</p>
              </div>
              <div className="surface-strong p-3 reveal reveal-2">
                <p className="kicker">Signal</p>
                <p className="mt-1 text-sm font-medium">GitHub optional</p>
              </div>
              <div className="surface-strong p-3 reveal reveal-3">
                <p className="kicker">Output</p>
                <p className="mt-1 text-sm font-medium">Fairness + strategy</p>
              </div>
            </div>
          </div>

          <aside className="surface p-7 md:p-8 reveal reveal-1">
            <p className="kicker">What You Get</p>
            <ul className="mt-4 space-y-3 text-sm text-slate">
              {valueProps.map((item) => (
                <li className="rounded-2xl border border-slate-200/80 bg-white/80 px-3 py-2" key={item}>
                  {item}
                </li>
              ))}
            </ul>

            <div className="mt-6 rounded-2xl bg-ink p-4 text-white">
              <p className="text-xs uppercase tracking-[0.18em] text-white/70">Now Better</p>
              <p className="mt-2 text-sm">
                Use your personal site as the default source of truth. If your projects are embedded there, FairDev now
                extracts those links and technologies directly.
              </p>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}