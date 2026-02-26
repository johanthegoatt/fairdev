"use client";

import type { AnalysisResult } from "@fairdev/shared";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from "recharts";

const labels: Array<{ key: keyof AnalysisResult["scores"]; label: string }> = [
  { key: "codeQuality", label: "Code" },
  { key: "architecture", label: "Arch" },
  { key: "testing", label: "Testing" },
  { key: "documentation", label: "Docs" },
  { key: "projectComplexity", label: "Complexity" },
];

export function SkillRadar({ result }: { result: AnalysisResult }) {
  const data = labels.map((item) => ({
    subject: item.label,
    score: result.scores[item.key],
  }));

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
          <PolarGrid />
          <PolarAngleAxis dataKey="subject" />
          <Radar dataKey="score" stroke="#0b6e4f" fill="#0b6e4f" fillOpacity={0.45} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}