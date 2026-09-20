import { LLMEngine } from './types.js';
import { OllamaEngine } from './engines/ollama-engine.js';
import { LlamaCppEngine } from './engines/llama-cpp-engine.js';
import { Logger } from './logger.js';
import { config } from './config.js';

export class EngineManager {
  private static instance: EngineManager;
  private engine: LLMEngine | null = null;
  private logger: Logger;

  private constructor() {
    this.logger = Logger.getInstance();
  }

  static getInstance(): EngineManager {
    if (!EngineManager.instance) EngineManager.instance = new EngineManager();
    return EngineManager.instance;
  }

  async getEngine(): Promise<LLMEngine> {
    if (this.engine && this.engine.isLoaded()) return this.engine;
    return this.createEngine();
  }

  private async createEngine(): Promise<LLMEngine> {
    const backend = config.llmBackend;
    this.logger.info(`Creating engine: ${backend}`);
    if (backend === 'ollama') {
      this.engine = new OllamaEngine();
    } else {
      this.engine = new LlamaCppEngine();
    }
    return this.engine;
  }

  static reset(): void {
    EngineManager.instance = new EngineManager();
  }
}
