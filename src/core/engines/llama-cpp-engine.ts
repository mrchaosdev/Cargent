import { LLMEngine, LLMMessage, LLMResponse, LLMOptions, ModelInfo } from '../types.js';
import { BaseEngine } from '../engine-base.js';
import { Logger } from '../logger.js';
import { config } from '../config.js';

export class LlamaCppEngine extends BaseEngine {
  private _modelInfo: ModelInfo | null = null;
  private modelRef: unknown = null;

  constructor() {
    super();
  }

  async load(modelPath: string): Promise<void> {
    this.logger.info(`Loading model via llama-cpp: ${modelPath}`);
    try {
      const mod = (await import('llama-cpp')) as any;
      const AutoModel = mod.AutoModel ?? mod.default?.AutoModel;
      const ctx = await AutoModel.loadFromFile(modelPath, {
        modelType: 'chat',
        backendType: {
          type: 'cuda',
          options: { gpuLayers: config.model.gpuLayers },
        },
        contextSize: config.model.contextSize,
      });
      this.modelRef = ctx;
      this._loaded = true;
      this._modelInfo = {
        name: modelPath.split('/').pop() || 'unknown',
        parameterSize: 'unknown',
        quantization: 'unknown',
        contextSize: config.model.contextSize,
        gpuLayers: config.model.gpuLayers,
      };
      this.emitEvent('modelLoaded');
      this.logger.info(`Model loaded (GPU layers: ${config.model.gpuLayers})`);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      this.emitEvent('error', error);
      this.logger.error('Failed to load model', error.message);
      throw error;
    }
  }

  async complete(
    messages: LLMMessage[],
    options?: LLMOptions,
  ): Promise<LLMResponse> {
    if (!this._loaded || !this.modelRef) throw new Error('Engine not loaded');

    const temperature = options?.temperature ?? config.model.temperature;
    const maxTokens = options?.maxTokens ?? config.model.maxTokens;

    this.emitEvent('inferenceStart', this.countTokens(messages));
    this.logger.debug('Running inference');

    const prompt = this.messagesToPrompt(messages);
    const typed = this.modelRef as {
      completion(opts: { prompt: string; n_predict: number; temperature: number; stop: string[] }): Promise<{
        choices: Array<{ text: string; finish_reason?: string }>;
        usage?: { prompt_tokens: number; completion_tokens: number };
      }>;
    };

    const result = await typed.completion({
      prompt,
      n_predict: maxTokens,
      temperature,
      stop: ['<|end|>'],
    });

    const choice = result.choices[0];
    const response: LLMResponse = {
      text: choice.text,
      tokensUsed: result.usage?.completion_tokens ?? 0,
      model: this._modelInfo?.name ?? 'llama-cpp',
      finishReason: choice.finish_reason === 'stop' ? 'stop' : 'length',
    };

    this.emitEvent('inferenceComplete', response);
    return response;
  }

  isLoaded(): boolean {
    return this._loaded;
  }

  unload(): void {
    this._loaded = false;
    this.modelRef = null;
    this._modelInfo = null;
    this.emitEvent('modelUnloaded');
  }

  getModelInfo(): ModelInfo | null {
    return this._modelInfo;
  }

  private messagesToPrompt(messages: LLMMessage[]): string {
    const parts: string[] = [];
    for (const msg of messages) {
      if (msg.role === 'system') parts.push(`<|system|>${msg.content}<|end|>`);
      else if (msg.role === 'user') parts.push(`<|user|>${msg.content}<|end|>`);
      else parts.push(`<|assistant|>${msg.content}<|end|>`);
    }
    return parts.join('\n') + '\n<|assistant|>';
  }
}
