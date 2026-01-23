
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Target is ../src/generated/zod
const targetDir = path.join(__dirname, '..', 'src', 'generated', 'zod');

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  const originalContent = content;

  // Fix ESM imports - add .js extensions to relative imports
  const esmRegex = /(from|import)\s+['"](\.\.?\/[^'"]+)['"]/g;
  content = content.replace(esmRegex, (match, keyword, importPath) => {
    // Skip if already has .js extension
    if (importPath.endsWith('.js')) return match;

    const absoluteImportPath = path.resolve(path.dirname(filePath), importPath);

    let isDirectory = false;
    try {
      if (fs.existsSync(absoluteImportPath) && fs.statSync(absoluteImportPath).isDirectory()) {
        isDirectory = true;
      }
    } catch (e) {
      // If path doesn't exist, assume file and append .js
    }

    if (isDirectory) {
      return `${keyword} '${importPath}/index.js'`;
    } else {
      return `${keyword} '${importPath}.js'`;
    }
  });

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf-8');
    return true;
  }
  return false;
}

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  let processedCount = 0;

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      processedCount += processDirectory(filePath);
    } else if (file.endsWith('.ts') && !file.endsWith('.d.ts')) {
      if (processFile(filePath)) {
        processedCount++;
      }
    }
  }

  return processedCount;
}

console.log(`Fixing ESM imports in ${targetDir}...`);
if (fs.existsSync(targetDir)) {
  const count = processDirectory(targetDir);
  console.log(`Fixed ${count} files successfully!`);
} else {
  console.error(`Directory not found: ${targetDir}`);
}
