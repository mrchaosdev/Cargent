import { Logger } from '../core/logger.js';
import { RegisteredTool, ToolResult, ToolDefinition } from './types.js';
import { readFileSync, writeFileSync, existsSync, readdirSync, statSync, mkdirSync } from 'fs';
import { join, resolve } from 'path';

export function createFileTools(): RegisteredTool[] {
  return [
    {
      definition: {
        name: 'read_file',
        description: 'Read contents of a file. Returns the full text content.',
        parameters: {
          path: { type: 'string', description: 'Path to the file', required: true },
        },
      },
      execute: async (args) => {
        const logger = Logger.getInstance();
        try {
          const path = String(args.path);
          const fullPath = resolve(path);
          if (!existsSync(fullPath)) {
            return { success: false, output: '', error: `File not found: ${path}` };
          }
          const content = readFileSync(fullPath, 'utf-8');
          logger.debug(`Read file: ${path}`);
          return { success: true, output: content };
        } catch (err) {
          return { success: false, output: '', error: String(err) };
        }
      },
    },
    {
      definition: {
        name: 'write_file',
        description: 'Write content to a file. Overwrites if exists.',
        parameters: {
          path: { type: 'string', description: 'Path to the file', required: true },
          content: { type: 'string', description: 'Content to write', required: true },
        },
      },
      execute: async (args) => {
        const logger = Logger.getInstance();
        try {
          const path = String(args.path);
          const content = String(args.content);
          const fullPath = resolve(path);
          const dir = join(fullPath, '..');
          if (!existsSync(dir)) {
            mkdirSync(dir, { recursive: true });
          }
          writeFileSync(fullPath, content, 'utf-8');
          logger.info(`Wrote file: ${path}`);
          return { success: true, output: `Wrote ${content.length} chars to ${path}` };
        } catch (err) {
          return { success: false, output: '', error: String(err) };
        }
      },
    },
    {
      definition: {
        name: 'list_files',
        description: 'List files in a directory.',
        parameters: {
          path: { type: 'string', description: 'Directory path', required: false },
        },
      },
      execute: async (args) => {
        try {
          const path = String(args.path ?? '.');
          const fullPath = resolve(path);
          if (!existsSync(fullPath)) {
            return { success: false, output: '', error: `Directory not found: ${path}` };
          }
          const entries = readdirSync(fullPath);
          const files = entries.map((name) => {
            const full = join(fullPath, name);
            const isDir = statSync(full).isDirectory();
            return isDir ? `${name}/` : name;
          });
          return { success: true, output: files.join('\n') };
        } catch (err) {
          return { success: false, output: '', error: String(err) };
        }
      },
    },
  ];
}
