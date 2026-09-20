# Agent System

## Overview

The `Agent` class is the main orchestrator that coordinates all systems: LLM inference, memory, tools, planning, and learning.

## Class Structure

```typescript
class Agent {
  // Core systems
  engine: LLMEngine;           // LLM backend
  context: ContextManager;     // Conversation context
  memory: AgentMemory;         // Memory system
  toolRegistry: ToolRegistry;  // Tool management
  planner: AgentPlanner;       // Task planning
  learningSystem: LearningSystem; // RAG learning
  knowledgeBase: KnowledgeBase; // Knowledge management
  crossProject: CrossProjectManager; // Multi-project
}
```

## Usage

### Basic Chat

```typescript
import { Agent } from './agent/agent.js';

const agent = new Agent();
await agent.initialize();

const response = await agent.process('Explain TypeScript generics');
console.log(response.text);
```

### Programmatic Tool Use

```typescript
import { Agent } from './agent/agent.js';

const agent = new Agent();
await agent.initialize();

// Agent decides when to use tools automatically
// But you can also call tools directly:
const fileTool = agent.getToolRegistry().get('read_file');
const result = await fileTool.execute({ path: './package.json' });
console.log(result.output);
```

### Access All Systems

```typescript
const agent = new Agent();
await agent.initialize();

// Memory management
const memSize = agent.getMemory().getSize();
agent.getMemory().clearShortTerm();

// Learning & knowledge
const skills = agent.getKnowledgeBase().getSkillSuggestions();
await agent.getKnowledgeBase().ingestDocument(content, { project: 'my-app' });
const knowledge = await agent.getKnowledgeBase().ask('React hooks');

// Cross-project
const cp = agent.getCrossProject();
await cp.registerProject('web-app', ['react', 'javascript']);

// Configuration
import { ConfigManager } from './core/config.js';
ConfigManager.getInstance().updateConfig({
  model: { temperature: 0.5, maxTokens: 4096 },
});
```

## Agent Response

```typescript
interface AgentResponse {
  text: string;              // Agent's response text
  plan?: AgentPlan;          // The plan that was executed
  tokensUsed: number;        // Estimated tokens consumed
  iterations: number;        // Planning iterations used
  skills?: string[];         // Skills detected in response
}
```

## Tool Integration

Tools are automatically invoked when the LLM decides to use them. The agent looks for patterns like `[TOOL:tool_name(args)]` in the LLM response and executes them.

### Available Tools

| Tool | Description |
|------|-------------|
| `read_file` | Read file contents |
| `write_file` | Write content to file |
| `list_files` | List directory contents |
| `execute_bash` | Execute shell command |
| `execute_code` | Execute JavaScript code |
| `web_search` | Search the web |

## Planning System

The planner creates a step-by-step plan for complex tasks:

```typescript
// Example plan for "Build a web scraper"
[
  { id: 1, description: 'Analyze goal', status: 'completed' },
  { id: 2, description: 'Use web_search: Search for scraper libraries', status: 'completed', tool: 'web_search' },
  { id: 3, description: 'Use execute_code: Write scraper code', status: 'in_progress', tool: 'execute_code' },
  { id: 4, description: 'Synthesize results', status: 'pending' },
]
```

## Memory System

- **Short-term**: Last N conversation messages (configurable, default 50)
- **Long-term**: Persistent entries stored via RAG system
- **Auto-learning**: Every interaction updates long-term memory
