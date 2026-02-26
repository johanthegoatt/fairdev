"use client";

import type { CreateAnalysisInput } from "@fairdev/shared";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { createAnalysis, fetchAnalyses, uploadResume } from "../../lib/api";
import { getAuthToken, getStoredUser } from "../../lib/auth-storage";

type DashboardFormValues = {
  githubUrl: string;
  portfolioUrl: string;
  yearsExperience: number;
  locationTier: CreateAnalysisInput["locationTier"];
  offeredSalaryUsd: number;
  companyType: "startup" | "faang" | "mid_size" | "remote";
};

const locationOptions: Array<{ value: CreateAnalysisInput["locationTier"]; label: string }> = [
  { value: "sf_bay_area", label: "San Francisco Bay Area" },
  { value: "new_york_city", label: "New York City" },
  { value: "seattle", label: "Seattle" },
  { value: "los_angeles", label: "Los Angeles" },
  { value: "boston", label: "Boston" },
  { value: "austin", label: "Austin" },
  { value: "chicago", label: "Chicago" },
  { value: "atlanta", label: "Atlanta" },
  { value: "denver", label: "Denver" },
  { value: "rest_us_remote", label: "Rest of US / Remote" },
];

type HistoryItem = {
  id: string;
  status: string;
  progress: number;
  createdAt: string;
  githubUrl: string | null;
  portfolioUrl: string | null;
};

export default function DashboardPage() {
  const router = useRouter();
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [analyses, setAnalyses] = useState<HistoryItem[]>([]);

  const token = useMemo(() => getAuthToken(), []);
  const user = useMemo(() => getStoredUser(), []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DashboardFormValues>({
    defaultValues: {
      portfolioUrl: "",
      githubUrl: "",
      yearsExperience: 3,
      locationTier: "chicago",
      offeredSalaryUsd: 140000,
      companyType: "mid_size",
    },
  });

  useEffect(() => {
    if (!token) {
      router.replace("/login");
      return;
    }

    void fetchAnalyses(token)
      .then((response) => setAnalyses(response.items as HistoryItem[]))
      .catch(() => setAnalyses([]));
  }, [router, token]);

  const onSubmit = handleSubmit(async (values) => {
    if (!token) {
      router.replace("/login");
      return;
    }

    setIsSubmitting(true);
    setApiError(null);

    try {
      let resumeId: string | null = null;

      if (resumeFile) {
        const uploadResponse = await uploadResume(token, resumeFile);
        resumeId = uploadResponse.resumeId;
      }

      const analysis = await createAnalysis(token, {
        ...values,
        portfolioUrl: values.portfolioUrl.trim(),
        githubUrl: values.githubUrl.trim().length > 0 ? values.githubUrl.trim() : null,
        resumeId,
      });

      router.push(`/results/${analysis.analysisId}`);
    } catch (submitError: any) {
      setApiError(submitError?.response?.data?.error ?? "Could not create analysis.");
      setIsSubmitting(false);
    }
  });

  return (
    <main className="min-h-screen px-5 py-8 md:px-10 md:py-12">
      <section className="mx-auto max-w-7xl space-y-6">
        <header className="surface flex flex-wrap items-center justify-between gap-3 p-5 reveal">
          <div>
            <p className="kicker">Dashboard</p>
            <h1 className="mt-1 text-3xl font-bold [font-family:var(--font-display)]">Portfolio-first analysis</h1>
            <p className="mt-1 text-sm text-slate">Signed in as {user?.email ?? "unknown"}</p>
          </div>
          <Link className="btn-ghost" href="/login">
            Switch Account
          </Link>
        </header>

        <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
          <form className="surface space-y-5 p-6 reveal reveal-1" onSubmit={onSubmit}>
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-xl font-semibold [font-family:var(--font-display)]">New Fairness Analysis</h2>
              <span className="badge">Portfolio Required</span>
            </div>

            <div>
              <label className="label">Portfolio Website</label>
              <input
                className="input"
                placeholder="https://yourname.dev"
                {...register("portfolioUrl", {
                  required: "Portfolio URL is required.",
                  pattern: {
                    value: /^https?:\/\/.+/i,
                    message: "Enter a valid http(s) portfolio URL.",
                  },
                })}
              />
              <p className="mt-1 text-xs text-slate">We parse projects, embedded demos, and technologies from your site.</p>
              {errors.portfolioUrl ? <p className="mt-1 text-xs text-red-600">{errors.portfolioUrl.message}</p> : null}
            </div>

            <div>
              <label className="label">GitHub URL (optional)</label>
              <input
                className="input"
                placeholder="https://github.com/username"
                {...register("githubUrl", {
                  validate: (value) =>
                    value.trim().length === 0 || /^https:\/\/github\.com\/[A-Za-z0-9-]+\/?$/i.test(value)
                      ? true
                      : "Use a public GitHub profile URL.",
                })}
              />
              <p className="mt-1 text-xs text-slate">Add this for deeper repository-level scoring.</p>
              {errors.githubUrl ? <p className="mt-1 text-xs text-red-600">{errors.githubUrl.message}</p> : null}
            </div>

            <div>
              <label className="label">Resume PDF (optional)</label>
              <input
                accept="application/pdf"
                className="input"
                type="file"
                onChange={(event) => setResumeFile(event.target.files?.[0] ?? null)}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label">Years Experience</label>
                <input className="input" type="number" min={0} max={60} {...register("yearsExperience", { valueAsNumber: true })} />
              </div>
              <div>
                <label className="label">Offered Salary (USD)</label>
                <input className="input" type="number" min={20000} {...register("offeredSalaryUsd", { valueAsNumber: true })} />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label">Location</label>
                <select className="input" {...register("locationTier")}>
                  {locationOptions.map((location) => (
                    <option key={location.value} value={location.value}>
                      {location.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Company Type</label>
                <select className="input" {...register("companyType")}>
                  <option value="startup">Startup</option>
                  <option value="faang">FAANG</option>
                  <option value="mid_size">Mid-size</option>
                  <option value="remote">Remote-first</option>
                </select>
              </div>
            </div>

            {apiError ? <p className="rounded-xl border border-red-200 bg-red-50 p-2 text-sm text-red-700">{apiError}</p> : null}

            <button className="btn-primary w-full" disabled={isSubmitting} type="submit">
              {isSubmitting ? "Starting analysis..." : "Run Analysis"}
            </button>
          </form>

          <aside className="space-y-4 reveal reveal-2">
            <div className="surface p-5">
              <h3 className="text-lg font-semibold [font-family:var(--font-display)]">Recent Analyses</h3>
              <p className="mt-1 text-xs text-slate">Click any run to open full results.</p>

              <div className="mt-4 space-y-3">
                {analyses.length === 0 ? <p className="text-sm text-slate">No analyses yet.</p> : null}
                {analyses.map((analysis) => (
                  <Link
                    key={analysis.id}
                    className="block rounded-2xl border border-slate-200/80 bg-white/85 p-3 transition hover:-translate-y-0.5 hover:shadow-soft"
                    href={`/results/${analysis.id}`}
                  >
                    <p className="text-xs uppercase tracking-wide text-slate">{new Date(analysis.createdAt).toLocaleString()}</p>
                    <p className="mt-1 text-sm font-semibold text-ink">{analysis.portfolioUrl ?? "Portfolio URL"}</p>
                    <p className="mt-1 text-xs text-slate">GitHub: {analysis.githubUrl ?? "Not provided"}</p>
                    <p className="mt-1 text-xs text-slate">{analysis.status} - {analysis.progress}%</p>
                  </Link>
                ))}
              </div>
            </div>

            <div className="surface p-5">
              <p className="kicker">UX Upgrade</p>
              <p className="mt-2 text-sm text-slate">
                Portfolio is now the primary source. GitHub and resume are optional enrichments, so the form matches how
                modern developers actually present work.
              </p>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
