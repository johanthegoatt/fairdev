"use client";

import type { AnalysisResult } from "@fairdev/shared";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { SkillRadar } from "../../../components/skill-radar";
import { StatusChip } from "../../../components/status-chip";
import { downloadPdfReport, fetchResult } from "../../../lib/api";
import { getAuthToken } from "../../../lib/auth-storage";

type ResultState = {
  status: "queued" | "processing" | "completed" | "failed";
  progress: number;
  result: AnalysisResult | null;
  error: string | null;
};

export default function ResultsPage() {
  const params = useParams<{ id: string }>();
  const analysisId = Array.isArray(params.id) ? params.id[0] : params.id;
  const token = useMemo(() => getAuthToken(), []);

  const [state, setState] = useState<ResultState | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const resolvedAnalysisId = analysisId ?? null;
    if (!resolvedAnalysisId || !token) {
      return;
    }
    const analysisIdValue: string = resolvedAnalysisId;
    const tokenValue: string = token;

    let stop = false;

    async function poll() {
      try {
        const response = await fetchResult(tokenValue, analysisIdValue);
        if (!stop) {
          setState(response);
          setError(null);
        }

        if (!stop && (response.status === "queued" || response.status === "processing")) {
          window.setTimeout(poll, 3000);
        }
      } catch (requestError: any) {
        if (!stop) {
          setError(requestError?.response?.data?.error ?? "Could not fetch analysis.");
        }
      }
    }

    void poll();

    return () => {
      stop = true;
    };
  }, [analysisId, token]);

  async function onDownloadPdf() {
    const resolvedAnalysisId = analysisId ?? null;
    if (!token || !resolvedAnalysisId) {
      return;
    }

    try {
      const blob = await downloadPdfReport(token, resolvedAnalysisId);
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `fairdev-report-${resolvedAnalysisId}.pdf`;
      anchor.click();
      URL.revokeObjectURL(url);
    } catch (downloadError: any) {
      setError(downloadError?.response?.data?.error ?? "Could not download PDF.");
    }
  }

  if (!token) {
    return (
      <main className="min-h-screen px-5 py-10 md:px-10">
        <div className="surface mx-auto max-w-2xl p-6">
          <p className="text-sm text-slate">You need to login first.</p>
          <Link className="btn-primary mt-4" href="/login">
            Go to Login
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-5 py-8 md:px-10 md:py-12">
      <section className="mx-auto max-w-7xl space-y-6">
        <header className="surface flex flex-wrap items-center justify-between gap-3 p-5 reveal">
          <div>
            <p className="kicker">Result</p>
            <h1 className="mt-1 text-3xl font-bold [font-family:var(--font-display)]">Analysis {analysisId}</h1>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link className="btn-ghost" href="/dashboard">
              Back
            </Link>
            {state?.status === "completed" ? (
              <button className="btn-primary" type="button" onClick={onDownloadPdf}>
                Download PDF
              </button>
            ) : null}
          </div>
        </header>

        {error ? <p className="surface border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
        {!state ? <p className="surface p-4 text-sm text-slate">Loading analysis...</p> : null}

        {state ? (
          <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
            <section className="surface p-6 reveal reveal-1">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold [font-family:var(--font-display)]">Pipeline Status</h2>
                <StatusChip status={state.status} />
              </div>

              <p className="mt-3 text-sm text-slate">Progress: {state.progress}%</p>
              <div className="progress-track mt-2">
                <div className="progress-bar" style={{ width: `${state.progress}%` }} />
              </div>

              {state.status === "failed" ? <p className="mt-3 text-sm text-red-700">{state.error ?? "Analysis failed."}</p> : null}

              {state.result ? (
                <>
                  <div className="mt-6 grid gap-3 sm:grid-cols-3">
                    <div className="surface-strong p-3">
                      <p className="kicker">Skill level</p>
                      <p className="mt-1 text-xl font-bold uppercase">{state.result.skillLevel}</p>
                    </div>
                    <div className="surface-strong p-3">
                      <p className="kicker">Fairness</p>
                      <div className="mt-1">
                        <StatusChip status={state.result.offerAssessment.status} />
                      </div>
                    </div>
                    <div className="surface-strong p-3">
                      <p className="kicker">Delta</p>
                      <p className="mt-1 text-xl font-bold">{state.result.offerAssessment.differencePct}%</p>
                    </div>
                  </div>

                  <div className="mt-6 rounded-3xl border border-slate-200/80 bg-white/85 p-4">
                    <SkillRadar result={state.result} />
                  </div>
                </>
              ) : null}
            </section>

            <aside className="space-y-4 reveal reveal-2">
              {state.result ? (
                <>
                  <div className="surface p-5">
                    <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-slate">Expected Salary Range</h3>
                    <p className="mt-2 text-2xl font-bold text-ink">
                      ${state.result.marketRangeUsd.min.toLocaleString()} - ${state.result.marketRangeUsd.max.toLocaleString()}
                    </p>
                    <p className="text-sm text-slate">Midpoint: ${state.result.marketRangeUsd.midpoint.toLocaleString()}</p>
                  </div>

                  <div className="surface p-5">
                    <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-slate">Strengths</h3>
                    <ul className="mt-2 space-y-1 text-sm text-slate">
                      {state.result.strengths.map((strength) => (
                        <li key={strength}>- {strength}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="surface p-5">
                    <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-slate">Improvement plan</h3>
                    <ul className="mt-2 space-y-1 text-sm text-slate">
                      {state.result.improvementSuggestions.map((suggestion) => (
                        <li key={suggestion}>- {suggestion}</li>
                      ))}
                    </ul>
                    <p className="mt-3 text-sm font-medium text-ink">{state.result.negotiationSuggestion}</p>
                  </div>

                  {state.result.portfolioInsights ? (
                    <div className="surface p-5">
                      <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-slate">Portfolio insights</h3>
                      <p className="mt-2 text-sm text-slate">{state.result.portfolioInsights.summary}</p>

                      {state.result.portfolioInsights.technologies.length > 0 ? (
                        <p className="mt-2 text-xs text-slate">Tech: {state.result.portfolioInsights.technologies.join(", ")}</p>
                      ) : null}

                      {state.result.portfolioInsights.projectLinks.length > 0 ? (
                        <ul className="mt-3 space-y-1 text-xs text-slate">
                          {state.result.portfolioInsights.projectLinks.slice(0, 6).map((link) => (
                            <li key={link}>
                              <a className="text-sky underline" href={link} rel="noreferrer" target="_blank">
                                {link}
                              </a>
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </div>
                  ) : null}
                </>
              ) : null}
            </aside>
          </div>
        ) : null}
      </section>
    </main>
  );
}
