import { LLMEngine, LLMMessage, LLMResponse, LLMOptions, ModelInfo } from './types.js';
import { Logger } from './logger.js';
import { EventEmitter } from 'events';

export interface EngineEvents {
  modelLoaded: () => void;
  modelUnloaded: () => void;
  inferenceStart: (inputTokens: number) => void;
  inferenceComplete: (output: LLMResponse) => void;
  error: (error: Error) => void;
}

export abstract class BaseEngine extends EventEmitter implements LLMEngine {
  protected logger: Logger;
  protected _loaded = false;

  constructor() {
    super();
    this.logger = Logger.getInstance();
  }

  abstract load(modelPath: string): Promise<void>;
  abstract complete(
    messages: LLMMessage[],
    options?: LLMOptions,
    callbacks?: { onToken?: (t: string) => void; onComplete?: (r: LLMResponse) => void; onError?: (e: Error) => void },
  ): Promise<LLMResponse>;
  abstract unload(): void;
  abstract isLoaded(): boolean;
  abstract getModelInfo(): ModelInfo | null;

  protected emitEvent(event: string, ...args: unknown[]): void {
    this.emit(event, ...args);
  }

  countTokens(messages: LLMMessage[]): number {
    return messages.reduce((acc, m) => acc + Math.ceil(m.content.length / 4), 0);
  }
}
