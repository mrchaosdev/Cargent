import { EngineManager } from './engine-manager.js';
import { LLMEngine } from './types.js';
import { Logger } from './logger.js';

export class EngineFactory {
  private logger: Logger;

  constructor() {
    this.logger = Logger.getInstance();
  }

  async createEngine(): Promise<LLMEngine> {
    return EngineManager.getInstance().getEngine();
  }
}
