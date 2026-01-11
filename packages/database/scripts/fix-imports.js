
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Target is ../src/generated/zod
const targetDir = path.join(__dirname, '..', 'src', 'generated', 'zod');

function addJsExtensions(dir) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      addJsExtensions(filePath);
    } else if (file.endsWith('.ts') && !file.endsWith('.d.ts')) {
      let content = fs.readFileSync(filePath, 'utf-8');
      
      // Matches: import ... from './...' or export ... from './...'
      // Group 2 is the path.
      const regex = /(from|import)\s+['"](\.\.?\/[^'"]+)['"]/g;
      
      let changed = false;
      const newContent = content.replace(regex, (match, keyword, importPath) => {
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

        changed = true;
        if (isDirectory) {
            return `${keyword} '${importPath}/index.js'`;
        } else {
            return `${keyword} '${importPath}.js'`;
        }
      });

      if (changed) {
        fs.writeFileSync(filePath, newContent, 'utf-8');
      }
    }
  }
}

console.log(`Fixing ESM imports in ${targetDir}...`);
if (fs.existsSync(targetDir)) {
    addJsExtensions(targetDir);
    console.log('Fixed ESM imports successfully!');
} else {
    console.error(`Directory not found: ${targetDir}`);
}
