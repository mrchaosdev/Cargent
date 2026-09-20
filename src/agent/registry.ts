import { Logger } from '../core/logger.js';
import { ToolDefinition, RegisteredTool, ToolResult } from '../tools/types.js';
import { getAllTools } from '../tools/index.js';

export class ToolRegistry {
  private logger: Logger;
  private tools: Map<string, RegisteredTool> = new Map();

  constructor() {
    this.logger = Logger.getInstance();
    const allTools = getAllTools();
    for (const tool of allTools) {
      this.tools.set(tool.definition.name, tool);
    }
    this.logger.info(`Registered ${allTools.length} tools: ${allTools.map((t) => t.definition.name).join(', ')}`);
  }

  register(tool: RegisteredTool): void {
    this.tools.set(tool.definition.name, tool);
    this.logger.info(`Registered tool: ${tool.definition.name}`);
  }

  get(name: string): RegisteredTool | undefined {
    return this.tools.get(name);
  }

  getAll(): RegisteredTool[] {
    return Array.from(this.tools.values());
  }

  getDefinitions(): ToolDefinition[] {
    return Array.from(this.tools.values()).map((t) => t.definition);
  }

  has(name: string): boolean {
    return this.tools.has(name);
  }

  getToolNames(): string[] {
    return Array.from(this.tools.keys());
  }
}
