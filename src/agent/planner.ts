import { Logger } from '../core/logger.js';
import { ToolDefinition, RegisteredTool, ToolResult } from '../tools/types.js';
import { getAllTools, getToolByName } from '../tools/index.js';

export interface AgentPlan {
  goal: string;
  steps: PlanStep[];
  currentStep: number;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
}

export interface PlanStep {
  id: number;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  tool?: string;
  result?: string;
}

export class AgentPlanner {
  private logger: Logger;

  constructor() {
    this.logger = Logger.getInstance();
  }

  createPlan(goal: string, availableTools: ToolDefinition[]): AgentPlan {
    const suggestedTools = this.suggestTools(goal, availableTools);
    const steps: PlanStep[] = [
      { id: 1, description: `Analyze goal: "${goal}"`, status: 'pending' },
      ...suggestedTools.map((tool, i) => ({
        id: i + 2,
        description: `Use ${tool.name}: ${tool.description}`,
        status: 'pending' as const,
        tool: tool.name,
      })),
      {
        id: suggestedTools.length + 2,
        description: 'Synthesize results and formulate response',
        status: 'pending' as const,
      },
    ];

    this.logger.info(`Created plan with ${steps.length} steps for goal: ${goal.substring(0, 50)}`);
    return {
      goal,
      steps,
      currentStep: 0,
      status: 'pending',
    };
  }

  advanceStep(plan: AgentPlan): PlanStep | null {
    if (plan.currentStep >= plan.steps.length) return null;
    const step = plan.steps[plan.currentStep];
    step.status = 'in_progress';
    return step;
  }

  completeStep(plan: AgentPlan, result?: string): boolean {
    if (plan.currentStep >= plan.steps.length) return false;
    const step = plan.steps[plan.currentStep];
    step.status = 'completed';
    step.result = result;
    plan.currentStep++;
    if (plan.currentStep >= plan.steps.length) {
      plan.status = 'completed';
    }
    return true;
  }

  failStep(plan: AgentPlan, error: string): void {
    if (plan.currentStep < plan.steps.length) {
      plan.steps[plan.currentStep].status = 'failed';
      plan.steps[plan.currentStep].result = error;
      plan.status = 'failed';
    }
  }

  private suggestTools(goal: string, tools: ToolDefinition[]): ToolDefinition[] {
    const lower = goal.toLowerCase();
    return tools.filter((tool) => {
      const desc = tool.description.toLowerCase();
      const name = tool.name.toLowerCase();
      return lower.includes(name) || desc.split(' ').some((word) => lower.includes(word));
    });
  }
}
