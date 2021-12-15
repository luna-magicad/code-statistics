export interface AnalyzeRequestDataFetchedEvent {
  /**
   * @example ts, js, css ...
   */
  fileTypes: string[];
  /**
   * @example C://...
   */
  includedPaths: string[];
  /**
   * @example node_modules
   */
  excludedPaths: string[];
}
