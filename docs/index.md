# CAgent Documentation Index

## Table of Contents

| Document | Description |
|----------|-------------|
| [Architecture](architecture.md) | System architecture & design principles |
| [Agent](agent.md) | Core agent system - orchestration, planning |
| [Engine](engine.md) | LLM engines - Ollama, llama-cpp |
| [Memory](memory.md) | Short-term & long-term memory management |
| [Tools](tools.md) | All available tools (file, bash, code, search) |
| [Learning](learning.md) | RAG system, vector store, knowledge base |
| [Cross-Project](cross-project.md) | Multi-project skill sharing & transfer |
| [CLI](cli.md) | Interactive terminal usage |
| [Configuration](config.md) | All configuration options |
| [GPU](gpu.md) | Hardware optimization for RTX 3060 |

## Quick Reference

```typescript
import { Agent } from './agent/agent.js';

const agent = new Agent();
await agent.initialize();
const response = await agent.process('Your task here');
```
