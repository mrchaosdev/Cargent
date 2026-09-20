import { Logger } from '../core/logger.js';
import { RegisteredTool, ToolResult } from './types.js';
import { execSync } from 'child_process';

export function createBashTool(): RegisteredTool {
  return {
    definition: {
      name: 'execute_bash',
      description: 'Execute a bash/PowerShell command and return output. Use carefully.',
      parameters: {
        command: { type: 'string', description: 'Command to execute', required: true },
      },
    },
    execute: async (args) => {
      const logger = Logger.getInstance();
      try {
        const command = String(args.command);
        logger.info(`Executing: ${command.substring(0, 100)}`);
        const output = execSync(command, {
          encoding: 'utf-8',
          maxBuffer: 10 * 1024 * 1024,
          timeout: 30000,
        });
        return { success: true, output: output.trim() };
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        if (errorMsg.includes('Command timed out')) {
          return { success: false, output: '', error: 'Command timed out (>30s)' };
        }
        return { success: false, output: '', error: errorMsg };
      }
    },
  };
}
