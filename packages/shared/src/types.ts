import type { z } from "zod";
import {
  analysisResultSchema,
  analysisResultsResponseSchema,
  createAnalysisResponseSchema,
  createAnalysisSchema,
  listAnalysesResponseSchema,
  llmEvaluationSchema,
  uploadResumeResponseSchema,
} from "./schemas.js";

export type CreateAnalysisInput = z.infer<typeof createAnalysisSchema>;
export type CreateAnalysisResponse = z.infer<typeof createAnalysisResponseSchema>;
export type AnalysisResult = z.infer<typeof analysisResultSchema>;
export type AnalysisResultsResponse = z.infer<typeof analysisResultsResponseSchema>;
export type UploadResumeResponse = z.infer<typeof uploadResumeResponseSchema>;
export type ListAnalysesResponse = z.infer<typeof listAnalysesResponseSchema>;
export type LlmEvaluation = z.infer<typeof llmEvaluationSchema>;
