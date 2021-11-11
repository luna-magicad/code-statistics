const { setupOpenFileExplorer } = require('./open-file-explorer');
const { setupAnalyzeCode } = require('./analyze-code');

exports.setupApi = function(): void {
  setupOpenFileExplorer();
  setupAnalyzeCode();
}
