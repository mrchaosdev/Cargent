import { Logger } from '../core/logger.js';
import { EngineFactory } from '../core/engine-factory.js';
import { LLMEngine, LLMMessage, LLMResponse } from '../core/types.js';
import { ContextManager } from '../core/context.js';
import { ToolRegistry } from './registry.js';
import { AgentPlanner, AgentPlan, PlanStep } from './planner.js';
import { AgentMemory } from './memory.js';
import { LearningSystem } from '../learning/learning-system.js';
import { KnowledgeBase } from '../learning/knowledge-base.js';
import { CrossProjectManager } from '../cross-project/cross-project.js';
import { RegisteredTool, ToolResult } from '../tools/types.js';
import { config } from '../core/config.js';

export interface AgentResponse {
  text: string;
  plan?: AgentPlan;
  tokensUsed: number;
  iterations: number;
  skills?: string[];
}

export class Agent {
  private logger: Logger;
  private engine: LLMEngine | null = null;
  private context: ContextManager;
  private toolRegistry: ToolRegistry;
  private planner: AgentPlanner;
  private memory: AgentMemory;
  private learningSystem: LearningSystem;
  private knowledgeBase: KnowledgeBase;
  private crossProject: CrossProjectManager;
  private maxIterations: number;
  private enableLearning: boolean;

  constructor(name?: string) {
    this.logger = Logger.getInstance();
    this.context = new ContextManager(config.model.contextSize);
    this.toolRegistry = new ToolRegistry();
    this.planner = new AgentPlanner();
    this.memory = new AgentMemory(config.agent.memoryLimit);
    this.learningSystem = new LearningSystem(this.memory);
    this.knowledgeBase = new KnowledgeBase(this.memory);
    this.crossProject = new CrossProjectManager(this.knowledgeBase, this.memory);
    this.maxIterations = config.agent.maxIterations;
    this.enableLearning = config.agent.enableLearning;
  }

  async initialize(): Promise<void> {
    this.logger.info('Initializing Agent...');
    this.engine = await new EngineFactory().createEngine();
    await this.engine.load(config.model.path);
    this.context.setSystem(
      'You are a helpful AI assistant. Use available tools when needed. Think step by step.',
    );
    this.logger.info('Agent initialized');
  }

  async process(userMessage: string): Promise<AgentResponse> {
    if (!this.engine) throw new Error('Agent not initialized');

    this.memory.addUserMessage(userMessage);
    const relevantKnowledge = await this.knowledgeBase.ask(userMessage);
    const tools = this.toolRegistry.getDefinitions();
    const plan = this.planner.createPlan(userMessage, tools);

    let fullResponse = '';
    let iteration = 0;

    for (iteration = 0; iteration < this.maxIterations; iteration++) {
      const step = this.planner.advanceStep(plan);
      if (!step) break;

      const messages = this.buildMessages(userMessage, relevantKnowledge);
      const response: LLMResponse = await this.engine.complete(messages);
      fullResponse += response.text;

      this.memory.addAssistantMessage(response.text);

      if (this.enableLearning) {
        await this.learningSystem.learnFromInteraction(userMessage, response.text);
      }

      this.planner.completeStep(plan, response.text);

      const toolMatch = response.text.match(/\[TOOL:(\w+)\s*\((.*?)\)\]/);
      if (toolMatch) {
        const toolName = toolMatch[1];
        const argsStr = toolMatch[2];
        const toolResult = await this.executeTool(toolName, argsStr);
        if (toolResult.success) {
          fullResponse += `\n[Tool result]: ${toolResult.output}`;
        }
      }
    }

    if (this.enableLearning) {
      await this.knowledgeBase.ingestConversation(userMessage, fullResponse);
    }

    this.logger.info(`Agent completed in ${iteration} iterations`);
    return {
      text: fullResponse,
      plan,
      tokensUsed: iteration * 100,
      iterations: iteration,
      skills: this.learningSystem.getSkillSuggestions(),
    };
  }

  private buildMessages(userMessage: string, knowledge: string): LLMMessage[] {
    const messages: LLMMessage[] = [];
    if (knowledge) {
      messages.push({
        role: 'system',
        content: `Relevant knowledge:\n${knowledge}\n\nUse this context to answer the user's question.`,
      });
    }
    messages.push(...this.context.getMessages());
    messages.push({ role: 'user', content: userMessage });
    return messages;
  }

  private async executeTool(name: string, argsStr: string): Promise<ToolResult> {
    const tool = this.toolRegistry.get(name);
    if (!tool) return { success: false, output: '', error: `Tool not found: ${name}` };
    try {
      const args = this.parseArgs(argsStr);
      return await tool.execute(args);
    } catch (err) {
      return { success: false, output: '', error: String(err) };
    }
  }

  private parseArgs(str: string): Record<string, unknown> {
    const args: Record<string, unknown> = {};
    const regex = /(\w+)=(?:"([^"]*)"|(\S+))/g;
    let match;
    while ((match = regex.exec(str)) !== null) {
      args[match[1]] = match[2] ?? match[3];
    }
    return args;
  }

  getMemory() { return this.memory; }
  getKnowledgeBase() { return this.knowledgeBase; }
  getCrossProject() { return this.crossProject; }
  getToolRegistry() { return this.toolRegistry; }
  getPlanner() { return this.planner; }
}
