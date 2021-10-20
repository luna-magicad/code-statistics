const fs = require('fs');
const path = require("path")

const buildDirectory = path.join(__dirname, 'build');

// Modified source from https://coderrocketfuel.com/article/recursively-list-all-the-files-in-a-directory-using-node-js.
const getAllFiles = function(dirPath) {
  const result = [];
  readFiles(dirPath);
  return result;

  // Recursive method declaration
  function readFiles(currentDirPath) {
    const files = fs.readdirSync(currentDirPath);
    for (const file of files) {
      const fullPath = path.join(currentDirPath, file);
      if (fs.statSync(fullPath).isDirectory()) {
        readFiles(fullPath);
      } else {
        if (!file.endsWith('.js')) {
          continue;
        }
        result.push(fullPath);
      }
    }
  }
}

const files = getAllFiles(buildDirectory);
const ifDebugRegex = /\/\/\s*#if debug/igm;
const endIfDebugRegex = /\/\/\s*#endif debug/igm;

for (const file of files) {
  const content = fs.readFileSync(file).toString();
  const parts = content.split(ifDebugRegex);

  let isDiffferent = false;
  let cleanedContent = '';
  // If no split was detected then lets just continue.
  if (parts.length === 1) {
    continue;
  }

  for (const part of parts) {
    const innerParts = part.split(endIfDebugRegex);
    // Remove the first part if multiple parts.
    if (innerParts.length > 1) {
      innerParts.splice(0, 1);
      isDiffferent = true;
    }
    cleanedContent += innerParts.join('');
  }

  if (!isDiffferent) {
    continue;
  }

  console.log('removed debug code from file:', file);
  fs.writeFileSync(file, cleanedContent);
}


