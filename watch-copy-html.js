const fs = require('fs');
const path = require('path');

/**
 *
 * @param {string} srcPath
 * @param {string} destinationPath
 */
module.exports = (srcPath, destinationPath) => {
  const srcRoot = path.join(__dirname, srcPath);
  const destinationRoot = path.join(__dirname, destinationPath);

  fs.watch(srcRoot, {
    recursive: true,
  }, (event, filename) => {
    if (!filename.endsWith('.html')) {
      return;
    }

    const finalSrcPath = path.join(srcRoot, filename);
    const finalDestinationPath = path.join(destinationRoot, filename);
    const dirName = path.dirname(finalDestinationPath);

    if (!fs.existsSync(dirName)) {
      fs.mkdirSync(dirName, {
        recursive: true,
      });
    }

    fs.copyFile(finalSrcPath, finalDestinationPath, () => { });
  });
}
