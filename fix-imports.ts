import fs from 'fs';
import path from 'path';

function walkDir(dir: string, callback: (file: string) => void) {
  fs.readdirSync(dir).forEach(f => {
    const dirPath = path.join(dir, f);
    const isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(dirPath);
  });
}

walkDir('server-logic', (filePath) => {
  if (!filePath.endsWith('.ts')) return;
  const depth = filePath.split(path.sep).length - 2; // server-logic is 1, so depth 1 -> ../, depth 2 -> ../../
  if (depth < 1) return; // _lib itself

  let libRelative = '';
  for (let i = 0; i < depth; i++) {
    libRelative += '../';
  }
  libRelative += '_lib';

  let content = fs.readFileSync(filePath, 'utf8');
  // Replace anything that looks like ../_lib or ../../_lib or ../../../_lib
  content = content.replace(/(\.\.\/)+_lib/g, libRelative);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Updated ${filePath} with ${libRelative}`);
});
