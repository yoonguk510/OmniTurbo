
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Target is ../src/generated/zod
const targetDir = path.join(__dirname, '..', 'src', 'generated', 'zod');

// Client-safe decimal helpers that don't use Prisma runtime
const CLIENT_SAFE_DECIMAL_HELPERS = `import * as z from 'zod';

// DECIMAL HELPERS (client-safe version - no Prisma runtime dependency)
//------------------------------------------------------

// DecimalJSLike interface for typing (exported for TypeScript compatibility)
export interface DecimalJSLike {
  d: number[];
  e: number;
  s: number;
  toFixed: (decimalPlaces?: number) => string;
}

// DecimalJSLike schema for validating decimal-like objects
export const DecimalJSLikeSchema: z.ZodType<DecimalJSLike> = z.object({
  d: z.array(z.number()),
  e: z.number(),
  s: z.number(),
  toFixed: z.custom<DecimalJSLike['toFixed']>((v) => typeof v === 'function'),
});

// Accept canonical decimal strings (+/-, optional fraction, optional exponent), or Infinity/NaN.
export const DECIMAL_STRING_REGEX = /^(?:[+-]?(?:[0-9]+(?:.[0-9]+)?(?:[eE][+-]?[0-9]+)?|Infinity)|NaN)$/;

// Type guard for valid decimal input - accepts string, number, or DecimalJsLike object
export const isValidDecimalInput = (
  v?: null | string | number | DecimalJSLike,
): v is string | number | DecimalJSLike => {
  if (v === undefined || v === null) return false;
  return (
    // Check for DecimalJsLike object structure
    (typeof v === 'object' &&
      v !== null &&
      'd' in v &&
      'e' in v &&
      's' in v &&
      'toFixed' in v) ||
    // Check for decimal string format
    (typeof v === 'string' && DECIMAL_STRING_REGEX.test(v)) ||
    // Accept numbers directly
    typeof v === 'number'
  );
};
`;

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  const originalContent = content;

  // Special handling for decimal-helpers.ts - replace entirely
  if (filePath.endsWith('decimal-helpers.ts')) {
    if (content !== CLIENT_SAFE_DECIMAL_HELPERS) {
      fs.writeFileSync(filePath, CLIENT_SAFE_DECIMAL_HELPERS, 'utf-8');
      return true;
    }
    return false;
  }

  // 1. Fix ESM imports - add .js extensions
  const esmRegex = /(from|import)\s+['"](\.\.?\/[^'"]+)['"]/g;
  content = content.replace(esmRegex, (match, keyword, importPath) => {
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

  // 2. Convert VALUE Prisma imports to TYPE imports
  // Transform: import { Prisma } from '...prisma/client.js';
  // To: import type { Prisma } from '...prisma/client.js';
  const prismaValueImportRegex = /^import\s+\{\s*Prisma\s*\}\s*from\s+(['"][^'"]*prisma\/client[^'"]*['"])/gm;
  content = content.replace(prismaValueImportRegex, 'import type { Prisma } from $1');

  // 3. Replace z.instanceof(Prisma.Decimal, {...}) with a client-safe alternative
  const decimalInstanceofRegex = /z\.instanceof\(Prisma\.Decimal,\s*\{[^}]*\}\)/g;
  content = content.replace(decimalInstanceofRegex, 'z.union([z.string(), z.number()])');

  // 4. Replace simple z.instanceof(Prisma.Decimal)
  const simpleDecimalInstanceofRegex = /z\.instanceof\(Prisma\.Decimal\)/g;
  content = content.replace(simpleDecimalInstanceofRegex, 'z.union([z.string(), z.number()])');

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

console.log(`Fixing ESM imports and Prisma Decimal dependencies in ${targetDir}...`);
if (fs.existsSync(targetDir)) {
  const count = processDirectory(targetDir);
  console.log(`Fixed ${count} files successfully!`);
} else {
  console.error(`Directory not found: ${targetDir}`);
}
