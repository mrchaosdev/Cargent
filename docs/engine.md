# LLM Engines

CAgent supports two LLM backends, both running locally on your hardware.

## Backend Comparison

| Feature | Ollama | llama-cpp |
|---------|--------|-----------|
| Installation | Separate install | npm package |
| GPU Support | Automatic (CUDA) | Manual CUDA config |
| Model Management | Built-in (`ollama pull`) | Manual file paths |
| Ease of setup | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| Performance | Great | Great |
| Primary | ✅ Yes | Fallback |

## Ollama Engine (Primary)

### Setup

1. Install [Ollama](https://ollama.com)
2. Pull a model: `ollama pull llama3.1`
3. Start Ollama: `ollama serve` (or it runs as Windows Service)

### Configuration

```typescript
// In src/core/config.ts or via ConfigManager
ConfigManager.getInstance().updateConfig({
  llmBackend: 'ollama',
  model: {
    path: 'llama3.1',       // Model name (not file path)
    contextSize: 4096,
    gpuLayers: 30,           // GPU offload layers (Ollama ignores this, handles all)
    temperature: 0.7,
    maxTokens: 2048,
  },
});
```

### API

The Ollama engine calls `http://localhost:11434/api/generate` with:

```json
{
  "model": "llama3.1",
  "prompt": "<|system|>\nYou are helpful<|end|>\n<|user|>\nHello<|end|>\n<|assistant|>\n",
  "stream": false,
  "options": {
    "temperature": 0.7,
    "num_predict": 2048
  }
}
```

## llama-cpp Engine (Fallback)

### Setup

1. Install native dependencies (requires build tools)
2. Download GGUF model file (e.g., from HuggingFace)
3. Set model path to file location

### Configuration

```typescript
ConfigManager.getInstance().updateConfig({
  llmBackend: 'llama-cpp',
  model: {
    path: './models/llama3.1-q4_k_m.gguf',  // File path
    contextSize: 4096,
    gpuLayers: 30,          // Layers offloaded to GPU (VRAM)
    temperature: 0.7,
    maxTokens: 2048,
  },
});
```

### GPU Memory Usage (RTX 3060 12GB)

| Model | Quant | VRAM Usage | Fits? |
|-------|-------|-----------|-------|
| Phi-3 Mini (3.8B) | Q4 | ~2.5 GB | ✅ |
| Llama 3.1 8B | Q4 | ~4.9 GB | ✅ |
| Mistral 7B | Q4 | ~4.5 GB | ✅ |
| Llama 3.1 8B | Q8 | ~8.7 GB | ✅ |
| Llama 3.1 13B | Q4 | ~7.5 GB | ✅ |
| Llama 3.1 13B | Q8 | ~14 GB | ❌ |

## Switching Backends

```typescript
// Runtime switch
import { ConfigManager } from './core/config.js';
ConfigManager.getInstance().updateConfig({ llmBackend: 'ollama' });

// Restart engine
import { EngineManager } from './core/engine-manager.js';
EngineManager.getInstance().reset(); // Creates new engine next call
```

## Prompt Format

Both engines use a chat template with special tokens:

```
<|system|>
System message
<|end|>
<|user|>
User message
<|end|>
<|assistant|>
Assistant response
<|end|>
```

## Performance Tips

1. **Context size**: Keep under 4096 for speed, increase for complex tasks
2. **Temperature**: 0.3-0.5 for factual, 0.7-1.0 for creative
3. **Max tokens**: Set based on expected response length
4. **GPU layers**: Use 30+ for full GPU offload with llama-cpp
