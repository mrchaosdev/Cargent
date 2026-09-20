import { Logger } from '../core/logger.js';
import { RegisteredTool, ToolResult } from './types.js';

export function createCodeTool(): RegisteredTool {
  return {
    definition: {
      name: 'execute_code',
      description: 'Execute JavaScript/TypeScript code in a sandbox and return the result.',
      parameters: {
        code: { type: 'string', description: 'JavaScript code to execute', required: true },
      },
    },
    execute: async (args) => {
      const logger = Logger.getInstance();
      try {
        const code = String(args.code);
        logger.debug('Executing code snippet');
        const originalLog = console.log;
        let loggedOutput = '';
        console.log = (...args: unknown[]) => {
          loggedOutput += args.map((a) => String(a)).join(' ');
        };
        try {
          const result = eval(code);
          console.log = originalLog;
          const output = result !== undefined ? String(result) : loggedOutput;
          return { success: true, output: output };
        } catch (execErr) {
          console.log = originalLog;
          return { success: false, output: '', error: String(execErr) };
        }
      } catch (err) {
        return { success: false, output: '', error: String(err) };
      }
    },
  };
}
