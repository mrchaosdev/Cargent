# GPU Optimization (RTX 3060 12GB + 32GB RAM)

## Hardware Profile

| Component | Specification |
|-----------|---------------|
| GPU | NVIDIA GeForce RTX 3060 |
| VRAM | 12 GB (GDDR6) |
| System RAM | 32 GB |
| CUDA Cores | 3584 |
| Tensor Cores | 112 (3rd Gen) |
| Memory Bandwidth | 360 GB/s |

## Model Compatibility

### Recommended Models

| Model | Size | Quant | VRAM Usage | Speed | Recommendation |
|-------|------|-------|------------|-------|----------------|
| Phi-3 Mini | 3.8B | Q4 | ~2.5 GB | ⚡ Very Fast | Great for simple tasks |
| Llama 3.1 8B | 8B | Q4 | ~4.9 GB | ⚡ Fast | ✅ **Best balance** |
| Mistral 7B | 7B | Q4 | ~4.5 GB | ⚡ Fast | ✅ Great for general use |
| Llama 3.1 8B | 8B | Q8 | ~8.7 GB | 🐢 Medium | Higher quality |
| Llama 3.1 13B | 13B | Q4 | ~7.5 GB | 🐢 Medium | ✅ More capable |
| Llama 3.1 13B | 13B | Q8 | ~14 GB | ❌ | Doesn't fit |

### VRAM Budget (RTX 3060 12GB)

```
┌─────────────────────────────────────┐
│  12 GB Total VRAM                  │
│                                      │
│  ┌──────────┐ System: ~1.5 GB       │
│  │          │ (Windows, drivers)     │
│  ├──────────┤                       │
│  │          │ Model: 4.9 GB         │
│  │ Model    │ (Llama 3.1 8B Q4)     │
│  ├──────────┤                       │
│  │          │ KV Cache: ~1-3 GB     │
│  │          │ (depends on context)   │
│  ├──────────┤                       │
│  │ Free     │ ~2-3 GB remaining     │
│  └──────────┘                       │
└─────────────────────────────────────┘
```

## Ollama GPU Configuration

Ollama automatically uses CUDA with RTX 3060. No manual config needed.

### Verify GPU Usage

```powershell
# Check GPU usage while running
nvidia-smi
```

### Ollama Environment Variables

```powershell
# Force GPU (usually automatic)
$env:OLLAMA_GPU_LAYERS = "30"

# Ollama service settings
# Edit: C:\ProgramData\Ollama\ollama.service
# Add: --gpu-layers 30
```

## llama-cpp GPU Configuration

For llama-cpp backend, manual GPU configuration is required:

```typescript
// src/core/config.ts
{
  model: {
    gpuLayers: 30,    // All layers on GPU for 7-8B models
    contextSize: 4096,
  },
}
```

### GPU Layer Guidelines

| Model | VRAM Available | Recommended gpuLayers |
|-------|---------------|----------------------|
| Phi-3 Mini (2.5GB) | ~9 GB | 16 (all layers) |
| Llama 3.1 8B (4.9GB) | ~9 GB | 30 (all layers) |
| Mistral 7B (4.5GB) | ~9 GB | 30 (all layers) |
| Llama 3.1 13B (7.5GB) | ~9 GB | 30 (all layers) |

## Performance Tips

### Context Size

- **Small tasks**: 2048 tokens (faster, less memory)
- **General**: 4096 tokens (balanced)
- **Complex tasks**: 8192 tokens (slower, fits for 7-8B models)

### Temperature

- **Factual/coding**: 0.3-0.5 (deterministic)
- **General conversation**: 0.7 (balanced)
- **Creative writing**: 0.9-1.0 (creative)

### Batch Size

Ollama handles this automatically. For llama-cpp, increase batch size for better throughput on larger models.

### Memory Management

- 32GB RAM is sufficient for model loading + OS overhead
- VRAM is the bottleneck - keep models ≤ 8B for comfortable headroom
- Monitor VRAM usage with `nvidia-smi`

## Benchmark Expectations

| Model | Tokens/sec (RTX 3060) | Use Case |
|-------|----------------------|----------|
| Phi-3 Mini | ~60-80 t/s | Quick Q&A, simple tasks |
| Llama 3.1 8B | ~30-40 t/s | General purpose (recommended) |
| Mistral 7B | ~35-45 t/s | General purpose |
| Llama 3.1 13B | ~20-25 t/s | Complex reasoning |

## Troubleshooting

### Model doesn't fit in VRAM
- Switch to a smaller model (7B → 3.8B)
- Reduce context size
- Reduce GPU layers (partial CPU offload)

### Slow generation
- Verify GPU is being used: `nvidia-smi` during generation
- Check if Ollama is using GPU (look for `CUDA` in nvidia-smi)
- Reduce model size or context length

### Out of memory (OOM)
- Close other GPU-consuming apps (browsers, etc.)
- Use a smaller model
- Reduce batch size / context
