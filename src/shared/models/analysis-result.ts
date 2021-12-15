import type { FailedAnalysis } from './failed-analysis';
import type { AnalysisFileResult } from './analysis-file-result';

export interface AnalysisResult {
  results: Record<string, AnalysisFileResult[]>;
  failed: FailedAnalysis[];
}
