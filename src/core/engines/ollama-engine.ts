import { LLMEngine, LLMMessage, LLMResponse, LLMOptions, ModelInfo } from '../types.js';
import { BaseEngine } from '../engine-base.js';
import { Logger } from '../logger.js';
import { config } from '../config.js';

export class OllamaEngine extends BaseEngine {
  private baseUrl: string;
  private modelName: string = '';

  constructor(baseUrl?: string) {
    super();
    this.baseUrl = baseUrl || config.ollamaUrl;
  }

  async load(modelPath: string): Promise<void> {
    this.logger.info(`Connecting to Ollama at ${this.baseUrl}`);
    try {
      const res = await fetch(`${this.baseUrl}/api/tags`);
      const data = (await res.json()) as { models: Array<{ name: string; size: number; details?: { parameter_size?: string; quantization_level?: string } }> };
      const target = data.models.find((m) => m.name === modelPath || m.name.includes(modelPath));
      if (target) {
        this.modelName = target.name;
    this._loaded = true;
    this.emitEvent('modelLoaded');
      } else {
        throw new Error(`Model "${modelPath}" not found in Ollama. Run: ollama pull ${modelPath}`);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      this.emitEvent('error', error);
      throw error;
    }
  }

  async complete(
    messages: LLMMessage[],
    options?: LLMOptions,
  ): Promise<LLMResponse> {
    if (!this._loaded) throw new Error('Engine not loaded. Call load() first.');

    const temperature = options?.temperature ?? config.model.temperature;
    const maxTokens = options?.maxTokens ?? config.model.maxTokens;

    this.emitEvent('inferenceStart', this.countTokens(messages));
    this.logger.debug('Sending request to Ollama');

    const res = await fetch(`${this.baseUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: this.modelName,
        prompt: this.messagesToPrompt(messages),
        stream: false,
        options: { temperature, num_predict: maxTokens },
      }),
    });

    if (!res.ok) {
      throw new Error(`Ollama API error: ${res.status} ${res.statusText}`);
    }

    const data = (await res.json()) as { response: string; eval_count: number; model: string };
    const response: LLMResponse = {
      text: data.response,
      tokensUsed: data.eval_count ?? 0,
      model: data.model ?? this.modelName,
    };

    this.emitEvent('inferenceComplete', response);
    this.logger.debug('Received response', { tokens: response.tokensUsed });
    return response;
  }

  isLoaded(): boolean {
    return this._loaded;
  }

  unload(): void {
    this._loaded = false;
    this.modelName = '';
    this.emitEvent('modelUnloaded');
  }

  getModelInfo(): ModelInfo | null {
    return {
      name: this.modelName,
      parameterSize: 'unknown',
      quantization: 'unknown',
      contextSize: config.model.contextSize,
      gpuLayers: config.model.gpuLayers,
    };
  }

  private messagesToPrompt(messages: LLMMessage[]): string {
    return messages
      .map((m) => {
        if (m.role === 'system') return `<|system|>\n${m.content}<|end|>`;
        if (m.role === 'user') return `<|user|>\n${m.content}<|end|>`;
        return `<|assistant|>\n${m.content}<|end|>`;
      })
      .join('\n') + '\n<|assistant|>\n';
  }
}
