export interface ToolDefinition {
  name: string;
  description: string;
  parameters: Record<string, { type: string; description: string; required?: boolean }>;
}

export interface ToolResult {
  success: boolean;
  output: string;
  error?: string;
}

export interface ToolExecuteInput {
  name: string;
  arguments: Record<string, unknown>;
}

export type ToolFunction = (args: Record<string, unknown>) => Promise<ToolResult>;

export interface RegisteredTool {
  definition: ToolDefinition;
  execute: ToolFunction;
}
