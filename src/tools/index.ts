import { RegisteredTool, ToolDefinition, ToolResult } from './types.js';
import { createFileTools } from './file.js';
import { createBashTool } from './bash.js';
import { createCodeTool } from './code.js';
import { createSearchTool } from './search.js';

export function getAllTools(): RegisteredTool[] {
  const tools: RegisteredTool[] = [];
  tools.push(...createFileTools());
  tools.push(createBashTool());
  tools.push(createCodeTool());
  tools.push(createSearchTool());
  return tools;
}

export function getToolByName(name: string): RegisteredTool | undefined {
  return getAllTools().find((t) => t.definition.name === name);
}

export function getAllToolDefinitions(): ToolDefinition[] {
  return getAllTools().map((t) => t.definition);
}
