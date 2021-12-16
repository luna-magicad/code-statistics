import type { AnalysisResult } from '../../../shared/models/analysis-result';
import type { AnalyzeRequestDataFetchedEvent } from '../../../shared/models/analyze-request-data-fetched-event';

export interface AnalyzeResponseDone {
  data: AnalysisResult,
  request: AnalyzeRequestDataFetchedEvent
}
