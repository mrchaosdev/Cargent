# CAgent - Trainable AI Agent Framework

## Overview
CAgent is a TypeScript AI agent framework that runs locally. It features:
- **Local LLM** via Ollama or llama-cpp (CUDA GPU support for RTX 3060)
- **Tool execution** (file I/O, bash, JS code, web search)
- **RAG-based learning** from interactions and documents
- **Cross-project skill sharing** and transfer
- **Agent planning** with multi-step reasoning
- **Short/long-term memory** management

## Quick Start

### ✅ Đã cài đặt
- Ollama v0.34.1: ✅
- Model llama3.1 (4.9 GB): ✅
- Ollama serve: ✅ (đang chạy)

### Setup (nếu cần reinstall)
```bash
# Ollama location
C:\Users\mrcha\AppData\Local\Programs\Ollama\ollama.exe

# Add to PATH (permanent)
[Environment]::SetEnvironmentVariable("Path", $env:Path + ";$env:LOCALAPPDATA\Programs\Ollama", "User")

# Or use run.bat
run.bat
```

### Run
```bash
# Option 1: Batch script (auto-checks Ollama + model)
run.bat

# Option 2: Manual (start Ollama first in another terminal)
ollama serve
npm run dev
```

### CLI Shortcuts (while running)
| Command | Description |
|---------|-------------|
| Any text | Talk to the agent |
| `skills` | Show learned skills |
| `projects` | List projects |
| `memories` | Memory usage |
| `quit` | Exit |

### Programmatic Usage
```typescript
import { Agent } from './agent/agent.js';

const agent = new Agent();
await agent.initialize();
const response = await agent.process('Your task here');
console.log(response.text);
```

## Architecture

```
src/
├── core/
│   ├── config.ts          # Configuration (model, agent, vector store)
│   ├── types.ts           # LLM types (messages, responses, tools)
│   ├── context.ts         # Conversation context window manager
│   ├── logger.ts          # Logger (console-based)
│   ├── conversation-logger.ts # Conversation history logger
│   ├── engine-base.ts     # Abstract LLM engine (EventEmitter)
│   ├── engine-manager.ts  # Manages engine instances
│   ├── engine-factory.ts  # Creates engines from config
│   └── engines/
│       ├── ollama-engine.ts  # Ollama HTTP backend (PRIMARY)
│       ├── llama-cpp-engine.ts # llama-cpp CUDA backend
│       └── index.ts
├── agent/
│   ├── agent.ts           # Main Agent class (orchestrator)
│   ├── planner.ts         # Task decomposition & planning
│   ├── memory.ts          # Short-term + long-term memory
│   ├── registry.ts        # Tool registry
│   └── index.ts
├── tools/
│   ├── file.ts            # read_file, write_file, list_files
│   ├── bash.ts            # execute_bash
│   ├── code.ts            # execute_code (JS eval)
│   ├── search.ts          # web_search (DuckDuckGo)
│   └── index.ts           # getAllTools(), getToolByName()
├── learning/
│   ├── learning-system.ts # Core learning engine (RAG)
│   ├── knowledge-base.ts  # Document & conversation ingestion
│   ├── vec-store.ts       # Vector store (cosine similarity)
│   ├── embedder.ts        # Text embedding (hash-based placeholder)
│   └── index.ts
├── cross-project/
│   └── cross-project.ts   # Project profiles, skill transfer
├── cli/
│   └── index.ts           # Interactive terminal
└── index.ts               # Main exports
```

## Learning System
CAgent learns through:
1. **RAG**: Every interaction is embedded and stored in a vector store. Future queries retrieve relevant past interactions as context.
2. **Experience Memory**: Tracks skills detected from responses (code, search, analysis, etc.).
3. **Knowledge Base**: Ingest documents for reference in future queries.

> **Note**: The embedder uses a hash-based approach as a placeholder. For production, replace `src/learning/embedder.ts` with a real embedding model (e.g., ONNX-based sentence transformer).

## Cross-Project Skills
Train once, apply everywhere:
```typescript
const cp = agent.getCrossProject();
await cp.registerProject('web-app', ['react', 'javascript']);
await cp.shareSkill({ name: 'css', description: 'CSS', usageCount: 5, transferable: true });
const skills = await cp.getTransferableSkills();
const json = await cp.exportProfile('web-app');
```

## Documentation

Comprehensive documentation is available in [`docs/`](./docs/):

| Document | Description |
|----------|-------------|
| [docs/architecture.md](docs/architecture.md) | System architecture & design principles |
| [docs/agent.md](docs/agent.md) | Core agent system |
| [docs/engine.md](docs/engine.md) | LLM engines (Ollama, llama-cpp) |
| [docs/memory.md](docs/memory.md) | Short/long-term memory |
| [docs/tools.md](docs/tools.md) | All tools (file, bash, code, search) |
| [docs/learning.md](docs/learning.md) | RAG, vector store, knowledge base |
| [docs/cross-project.md](docs/cross-project.md) | Multi-project skill sharing |
| [docs/cli.md](docs/cli.md) | Interactive terminal usage |
| [docs/config.md](docs/config.md) | All configuration options |
| [docs/gpu.md](docs/gpu.md) | RTX 3060 GPU optimization guide |

## GPU Optimization (RTX 3060 12GB)
- Use 7B-8B models (Llama 3.1 8B recommended)
- `gpuLayers: 30` for full GPU offload (~4-5GB VRAM)
- 13B Q4 models also fit (~7-8GB) but tighter
- For speed: Phi-3 Mini (3.8B)

## Adding Custom Tools
```typescript
import { ToolRegistry } from './agent/registry.js';
import { RegisteredTool } from './tools/types.js';

const registry = agent.getToolRegistry();
const myTool: RegisteredTool = {
  definition: {
    name: 'my_tool',
    description: 'Does something useful',
    parameters: { arg1: { type: 'string', description: 'An argument' } },
  },
  execute: async (args) => ({ success: true, output: String(args.arg1) }),
};
registry.register(myTool);
```

## Configuration
Edit `src/core/config.ts` or use `ConfigManager.getInstance().updateConfig()`:
- `llmBackend`: `'ollama'` | `'llama-cpp'`
- `model.path`: Model name (Ollama) or file path (llama-cpp)
- `model.contextSize`: Token context (2048-8192 recommended)
- `model.temperature`: 0.0-1.0
- `agent.maxIterations`: Planning steps per message (default: 10)
- `vectorStore.dimension`: Embedding size (default: 384)
