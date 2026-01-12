
import { OpenAPIGenerator } from '@orpc/openapi';
import { ZodToJsonSchemaConverter } from '@orpc/zod/zod4';
import * as fs from 'fs';
import * as path from 'path';
import { contract } from '../src/index.js';

const generator = new OpenAPIGenerator({
  schemaConverters: [
    new ZodToJsonSchemaConverter(),
  ],
});

let spec;
try {
  spec = await generator.generate(contract, {
    info: {
      title: 'Monorepo API',
      version: '1.0.0',
      description: 'API documentation for the Monorepo Boilerplate',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Local Development Server',
      },
    ],
  });
} catch (error) {
  console.error('Error generating OpenAPI spec:', error);
  process.exit(1);
}

const outputPath = path.resolve(process.cwd(), 'openapi.json');
fs.writeFileSync(outputPath, JSON.stringify(spec, null, 2));

console.log(`OpenAPI specification generated at ${outputPath}`);
