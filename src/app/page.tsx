"use client";

import { useState } from "react";
import type { ComplianceResponse } from "./data";
import { RULES, SCENARIOS } from "./data";

type SelectedState = "utah" | "nevada";

export default function HomePage() {
  const [script, setScript] = useState(SCENARIOS[0]?.script ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ComplianceResponse | null>(null);
  const [selectedState, setSelectedState] = useState<SelectedState>("utah");

  const handleScenarioClick = (value: string) => {
    setScript(value);
    setError(null);
    setResult(null);
  };

  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ script }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        const message =
          (data && typeof data.error === "string" && data.error) ||
          `Request failed with status ${response.status}`;
        throw new Error(message);
      }

      const data = (await response.json()) as ComplianceResponse;
      setResult(data);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Unknown error during analysis.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const utahStatus = result?.utah.status ?? "PENDING";
  const nevadaStatus = result?.nevada.status ?? "PENDING";

  const selectedRule = selectedState === "utah" ? RULES.utah : RULES.nevada;

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="space-y-2 border-b border-slate-800 pb-6">
          <h1 className="text-3xl font-bold tracking-tight text-slate-50 sm:text-4xl">
            Cross-State Ad Compliance Agent
          </h1>
          <p className="max-w-2xl text-sm text-slate-400 sm:text-base">
            Analyze alcohol ad scripts against strict Utah and Nevada regulations.
            Paste a script or use a demo scenario, then run the AI compliance
            check.
          </p>
        </header>

        {/* Top Section: Input + Results */}
        <section className="grid flex-1 gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,2fr)]">
          {/* Left: Scenarios + Textarea */}
          <div className="flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 shadow-lg shadow-black/40 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
                Input Script
              </h2>
              <div className="flex flex-wrap gap-2">
                {SCENARIOS.map((scenario) => (
                  <button
                    key={scenario.id}
                    type="button"
                    onClick={() => handleScenarioClick(scenario.script)}
                    className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs font-medium text-slate-200 shadow-sm transition hover:border-slate-500 hover:bg-slate-800"
                  >
                    {scenario.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1">
              <textarea
                value={script}
                onChange={(e) => setScript(e.target.value)}
                className="h-52 w-full resize-none rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 shadow-inner shadow-black/50 outline-none ring-1 ring-transparent transition focus:border-sky-500 focus:ring-sky-500 sm:h-64"
                placeholder="Paste or type an alcohol advertising script to analyze..."
              />
            </div>

            <div className="flex items-center justify-between gap-3">
              {error && (
                <p className="text-xs text-red-400">
                  <span className="font-semibold">Error:</span> {error}
                </p>
              )}
              <div className="flex flex-1 justify-end">
                <button
                  type="button"
                  onClick={handleAnalyze}
                  disabled={loading || !script.trim()}
                  className="inline-flex items-center gap-2 rounded-xl bg-sky-500 px-4 py-2 text-sm font-semibold text-slate-950 shadow-lg shadow-sky-500/30 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-300 disabled:shadow-none"
                >
                  {loading && (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-900 border-t-slate-50" />
                  )}
                  <span>{loading ? "Analyzing…" : "Analyze Script"}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right: Result Cards */}
          <div className="flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 shadow-lg shadow-black/40 sm:p-6">
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
              Live Verdicts
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              {/* Utah Card */}
              <div className="flex flex-col gap-2 rounded-xl border border-slate-800 bg-slate-950/80 p-4">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                      Utah
                    </p>
                    <p className="text-sm text-slate-300">
                      No Party Words Rule
                    </p>
                  </div>
                  {result ? (
                    <StatusBadge status={utahStatus as "APPROVED" | "REJECTED"} />
                  ) : (
                    <span className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs text-slate-400">
                      Pending
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs text-slate-400">
                  {result
                    ? result.utah.explanation
                    : "Run an analysis to see Utah’s compliance decision and explanation."}
                </p>
              </div>

              {/* Nevada Card */}
              <div className="flex flex-col gap-2 rounded-xl border border-slate-800 bg-slate-950/80 p-4">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                      Nevada
                    </p>
                    <p className="text-sm text-slate-300">21+ Explicit Rule</p>
                  </div>
                  {result ? (
                    <StatusBadge
                      status={nevadaStatus as "APPROVED" | "REJECTED"}
                    />
                  ) : (
                    <span className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs text-slate-400">
                      Pending
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs text-slate-400">
                  {result
                    ? result.nevada.explanation
                    : 'Run an analysis to verify whether the script explicitly includes the text "21+".'}
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-500">
              Verdicts are computed by OpenAI using a strict system prompt that
              only applies the Utah and Nevada rules shown below.
            </p>
          </div>
        </section>

        {/* Bottom Section: Map + Rule Details */}
        <section className="grid gap-6 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 shadow-lg shadow-black/40 md:grid-cols-[minmax(0,2fr)_minmax(0,1.3fr)] sm:p-6">
          <div className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
              Interactive Map
            </h2>
            <p className="text-xs text-slate-400">
              Conceptual U.S. map grid (all grey). Click Utah or Nevada to focus
              its compliance rule.
            </p>

            <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
              <svg
                viewBox="0 0 400 220"
                className="h-56 w-full text-slate-600"
                role="img"
                aria-label="Simplified map highlighting Utah and Nevada"
              >
                {/* Background states (conceptual grid) */}
                <g className="fill-slate-800">
                  {Array.from({ length: 5 }).map((_, row) =>
                    Array.from({ length: 10 }).map((__, col) => {
                      const x = 20 + col * 38;
                      const y = 20 + row * 36;
                      const key = `${row}-${col}`;
                      return (
                        <rect
                          key={key}
                          x={x}
                          y={y}
                          width={30}
                          height={26}
                          rx={4}
                          className="stroke-slate-700"
                          strokeWidth={0.8}
                        />
                      );
                    }),
                  )}
                </g>

                {/* Nevada */}
                <g
                  onClick={() => setSelectedState("nevada")}
                  className="cursor-pointer transition hover:opacity-90"
                >
                  <rect
                    x={58}
                    y={92}
                    width={30}
                    height={26}
                    rx={6}
                    className={
                      selectedState === "nevada"
                        ? "fill-slate-700 stroke-slate-200"
                        : "fill-slate-800 stroke-slate-500"
                    }
                    strokeWidth={selectedState === "nevada" ? 2 : 1.2}
                  />
                  <text
                    x={73}
                    y={108}
                    textAnchor="middle"
                    className="select-none text-[9px] font-semibold fill-slate-100"
                  >
                    Nevada
                  </text>
                </g>

                {/* Utah */}
                <g
                  onClick={() => setSelectedState("utah")}
                  className="cursor-pointer transition hover:opacity-90"
                >
                  <rect
                    x={96}
                    y={92}
                    width={30}
                    height={26}
                    rx={6}
                    className={
                      selectedState === "utah"
                        ? "fill-slate-700 stroke-slate-200"
                        : "fill-slate-800 stroke-slate-500"
                    }
                    strokeWidth={selectedState === "utah" ? 2 : 1.2}
                  />
                  <text
                    x={111}
                    y={108}
                    textAnchor="middle"
                    className="select-none text-[9px] font-semibold fill-slate-100"
                  >
                    Utah
                  </text>
                </g>
              </svg>
            </div>
          </div>

          {/* Rule Detail Panel */}
          <aside className="flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-950/80 p-4 sm:p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Rule Detail
                </h2>
                <p className="mt-1 text-base font-semibold text-slate-100">
                  {selectedRule.name}
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedState("utah")}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                    selectedState === "utah"
                      ? "bg-rose-500 text-slate-950 shadow shadow-rose-500/40"
                      : "border border-slate-700 bg-slate-900 text-slate-300 hover:border-rose-400"
                  }`}
                >
                  Utah
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedState("nevada")}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                    selectedState === "nevada"
                      ? "bg-emerald-500 text-slate-950 shadow shadow-emerald-500/40"
                      : "border border-slate-700 bg-slate-900 text-slate-300 hover:border-emerald-400"
                  }`}
                >
                  Nevada
                </button>
              </div>
            </div>

            <p className="text-sm text-slate-300">{selectedRule.description}</p>

            <ul className="mt-1 list-disc space-y-1 pl-5 text-xs text-slate-400">
              {selectedState === "utah" ? (
                <>
                  <li>
                    Utah REJECTS scripts containing any of:{" "}
                    <span className="font-semibold text-slate-200">
                      party, beach, club, friends, nightlife, fun
                    </span>
                    .
                  </li>
                  <li>
                    Utah APPROVES scripts that avoid those lifestyle / party
                    terms and remain purely descriptive.
                  </li>
                </>
              ) : (
                <>
                  <li>
                    Nevada APPROVES scripts that explicitly include the text{" "}
                    <span className="font-semibold text-slate-200">21+</span>.
                  </li>
                  <li>
                    Nevada REJECTS any script that does not contain{" "}
                    <span className="font-semibold text-slate-200">21+</span> at
                    least once.
                  </li>
                </>
              )}
            </ul>

            <p className="mt-2 text-[11px] text-slate-500">
              The AI backend is constrained by a strict system prompt to apply
              only these rules and to respond in a fixed JSON schema, which this
              dashboard renders in real time.
            </p>
          </aside>
        </section>
      </div>
    </main>
  );
}

function StatusBadge(props: { status: "APPROVED" | "REJECTED" }) {
  const { status } = props;
  const isApproved = status === "APPROVED";

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${
        isApproved
          ? "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/50"
          : "bg-rose-500/15 text-rose-300 ring-1 ring-rose-500/50"
      }`}
    >
      <span className="text-base leading-none">
        {isApproved ? "✅" : "❌"}
      </span>
      <span>{status}</span>
    </span>
  );
}

