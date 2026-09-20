# Configuration

All configuration is managed through `src/core/config.ts` or runtime via `ConfigManager`.

## Configuration Structure

```typescript
interface AgentConfig {
  model: {
    path: string;           // Model name (Ollama) or file path (llama-cpp)
    contextSize: number;    // Token context window
    gpuLayers: number;      // GPU offload layers (llama-cpp)
    temperature: number;    // Generation creativity (0.0-1.0)
    maxTokens: number;      // Max tokens in response
  };
  agent: {
    maxIterations: number;  // Planning steps per message
    memoryLimit: number;    // Max short-term messages
    enableLearning: boolean; // Auto-learn from interactions
  };
  vectorStore: {
    path: string;           // Vector store directory
    dimension: number;      // Embedding dimension
    similarityThreshold: number; // Min similarity for retrieval
  };
  llmBackend: 'llama-cpp' | 'ollama';
  ollamaUrl: string;        // Ollama API URL
  logLevel: 'debug' | 'info' | 'warn' | 'error';
}
```

## Configuration Methods

### Default Config

```typescript
import { DEFAULT_CONFIG } from './core/config.js';
console.log(DEFAULT_CONFIG);
```

### Runtime Update

```typescript
import { ConfigManager } from './core/config.js';

ConfigManager.getInstance().updateConfig({
  model: {
    path: 'mistral',
    temperature: 0.5,
    maxTokens: 4096,
  },
  agent: {
    maxIterations: 5,
  },
});
```

### Get Current Config

```typescript
const config = ConfigManager.getInstance().getConfig();
console.log(config.model.path);     // 'mistral'
console.log(config.llmBackend);     // 'ollama'
```

### Reset to Defaults

```typescript
ConfigManager.getInstance().reset();
```

## Configuration Reference

### Model Settings

| Setting | Default | Description |
|---------|---------|-------------|
| `path` | `'llama3.1'` | Model name for Ollama, file path for llama-cpp |
| `contextSize` | `4096` | Max tokens in context window |
| `gpuLayers` | `30` | Layers offloaded to GPU (llama-cpp only) |
| `temperature` | `0.7` | Creativity: 0=deterministic, 1=creative |
| `maxTokens` | `2048` | Max tokens in response |

### Agent Settings

| Setting | Default | Description |
|---------|---------|-------------|
| `maxIterations` | `10` | Max planning steps per message |
| `memoryLimit` | `50` | Max short-term messages before trimming |
| `enableLearning` | `true` | Auto-learn from interactions |

### Vector Store Settings

| Setting | Default | Description |
|---------|---------|-------------|
| `path` | `'./data/vector-store'` | Storage directory |
| `dimension` | `384` | Embedding vector dimension |
| `similarityThreshold` | `0.7` | Minimum similarity for retrieval |

### Backend Settings

| Setting | Default | Description |
|---------|---------|-------------|
| `llmBackend` | `'ollama'` | LLM backend: `ollama` or `llama-cpp` |
| `ollamaUrl` | `'http://localhost:11434'` | Ollama API endpoint |

### Logging

| Setting | Description |
|---------|-------------|
| `logLevel` | `debug` / `info` / `warn` / `error` |

## Recommended Configurations

### Speed (Phi-3 Mini)

```typescript
{
  model: { path: 'phi3', temperature: 0.5, maxTokens: 1024, contextSize: 2048, gpuLayers: 30 },
  agent: { maxIterations: 5, memoryLimit: 20 },
}
```

### Balanced (Llama 3.1 8B)

```typescript
{
  model: { path: 'llama3.1', temperature: 0.7, maxTokens: 2048, contextSize: 4096, gpuLayers: 30 },
  agent: { maxIterations: 10, memoryLimit: 50 },
}
```

### Quality (Llama 3.1 13B Q4)

```typescript
{
  model: { path: 'llama3.1:13b', temperature: 0.7, maxTokens: 4096, contextSize: 8192, gpuLayers: 30 },
  agent: { maxIterations: 10, memoryLimit: 50 },
}
```

### Creative (High Temperature)

```typescript
{
  model: { path: 'llama3.1', temperature: 1.0, maxTokens: 2048, contextSize: 4096, gpuLayers: 30 },
  agent: { maxIterations: 10, memoryLimit: 50 },
}
