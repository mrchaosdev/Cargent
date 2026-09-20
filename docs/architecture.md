# Architecture

## Design Principles

1. **Modularity**: Each system component is an independent module with clear interfaces
2. **Pluggability**: LLM engines, tools, and embeddings are swappable via interfaces
3. **Learning by Default**: Every interaction trains the RAG system automatically
4. **Cross-Project Reusability**: Skills learned in one project transfer to others

## System Architecture

```
┌────────────────────────────────────────────────────────┐
│                    CLI / API Layer                     │
│              (src/cli/index.ts)                        │
└──────────────────────┬─────────────────────────────────┘
                       │
┌──────────────────────▼─────────────────────────────────┐
│                     Agent Orchestrator                 │
│                (src/agent/agent.ts)                    │
│  ┌─────────┐ ┌────────┐ ┌────────────┐                 │
│  │ Planner │ │ Memory │ │  Tool      │                 │
│  │         │ │        │ │  Registry  │                 │
│  └────┬────┘ └───┬────┘ └─────┬──────┘                 │
│       │          │            │                        │
├───────▼──────────▼────────────▼────────────────────────┤
│                   Core Services                        │
│  ┌──────────┐ ┌──────────┐ ┌──────────────┐            │
│  │ Engine   │ │ Context  │ │  Config      │            │
│  │ Manager  │ │ Manager  │ │  Manager     │            │
│  └────┬─────┘ └──────────┘ └──────────────┘            │
│       │                                                │
├───────▼─────────────────────────────────────────────── ┤
│                LLM Backend Layer                       │
│  ┌────────────────┐ ┌──────────────────┐               │
│  │  Ollama Engine │ │ llama-cpp Engine │               │
│  │  (HTTP API)    │ │  (CUDA native)   │               │
│  └────────────────┘ └──────────────────┘               │
├─────────────────────────────────────────────────────── ┤
│                  Learning Layer                        │
│  ┌───────────┐ ┌──────────┐ ┌──────────────┐           │
│  │  RAG      │ │ Vector   │ │  Embedder    │           │
│  │  System   │ │ Store    │ │  (hash-based)│           │
│  └───────────┘ └──────────┘ └──────────────┘           │
├─────────────────────────────────────────────────────── ┤
│               Cross-Project Layer                      │
│  ┌──────────────────────────────────────────┐          │
│  │  Project Profiles & Skill Transfer       │          │
│  └──────────────────────────────────────────┘          │
└─────────────────────────────────────────────────────── ┘
```

## Module Interfaces

### Core Interfaces

```typescript
// LLM Engine (swappable)
interface LLMEngine {
  load(modelPath: string): Promise<void>;
  complete(messages: LLMMessage[], options?: LLMOptions): Promise<LLMResponse>;
  isLoaded(): boolean;
  unload(): void;
}

// Tool (swappable)
interface RegisteredTool {
  definition: ToolDefinition;
  execute: (args: Record<string, unknown>) => Promise<ToolResult>;
}
```

## Data Flow

1. User sends message → `Agent.process()`
2. Context is built (conversation + RAG retrieval)
3. Planner creates step-by-step plan
4. Agent calls LLM → response
5. If tool call detected → execute tool → feed result back
6. Response stored in memory + vector store (learning)
7. Skills extracted from response

## File Conventions

- All source: `src/**/*.ts`
- Compiled: `dist/**/*.js` + `*.d.ts`
- Tests: `tests/**/*.ts`
- Config: `src/core/config.ts`
- Models (Ollama): managed by Ollama (~`C:\Users\mrcha\.ollama\models`)
- Data (vectors): `data/vector-store`
