import axios from "axios";
import type { CreateAnalysisInput } from "@fairdev/shared";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000",
  timeout: 30_000,
});

function authHeader(token: string) {
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
}

export async function requestMagicLink(email: string): Promise<{ ok: true; devToken?: string }> {
  const response = await api.post("/auth/magic-link/request", { email });
  return response.data;
}

export async function verifyMagicLink(token: string): Promise<{ accessToken: string; user: { id: string; email: string } }> {
  const response = await api.post("/auth/magic-link/verify", { token });
  return response.data;
}

export async function uploadResume(token: string, file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await api.post("/upload-resume", formData, {
    ...authHeader(token),
    headers: {
      ...authHeader(token).headers,
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
}

export async function createAnalysis(token: string, payload: CreateAnalysisInput) {
  const response = await api.post("/analyze", payload, authHeader(token));
  return response.data as { analysisId: string; status: "queued" };
}

export async function fetchResult(token: string, analysisId: string) {
  const response = await api.get(`/results/${analysisId}`, authHeader(token));
  return response.data;
}

export async function fetchAnalyses(token: string) {
  const response = await api.get("/analyses?limit=20", authHeader(token));
  return response.data as {
    items: Array<{ id: string; status: string; progress: number; createdAt: string; githubUrl: string | null; portfolioUrl: string | null }>;
    nextCursor: string | null;
  };
}

export async function downloadPdfReport(token: string, analysisId: string): Promise<Blob> {
  const response = await api.get(`/results/${analysisId}/report.pdf`, {
    ...authHeader(token),
    responseType: "blob",
  });
  return response.data as Blob;
}
