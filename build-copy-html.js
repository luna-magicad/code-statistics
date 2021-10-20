const fs = require('fs');

const srcPath = `${__dirname}/src/index.html`;
const destinationPath = `${__dirname}/build/index.html`;

if (!fs.existsSync(srcPath)) {
  console.log('file did not exist', srcPath);
} else {
  if (!fs.existsSync(`${__dirname}/build`)) {
    fs.mkdirSync(`${__dirname}/build`);
  }

  fs.copyFileSync(srcPath, destinationPath);
  console.log('copied index.html');
}

