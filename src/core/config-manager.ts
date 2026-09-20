import { config, DEFAULT_CONFIG, AgentConfig } from './config.js';
import { Logger } from './logger.js';

export class ConfigManager {
  private static instance: ConfigManager;
  private cfg: AgentConfig;

  private constructor() {
    this.cfg = { ...DEFAULT_CONFIG };
  }

  private logger: Logger = Logger.getInstance();

  static getInstance(): ConfigManager {
    if (!ConfigManager.instance) ConfigManager.instance = new ConfigManager();
    return ConfigManager.instance;
  }

  getConfig(): AgentConfig {
    return this.cfg;
  }

  updateConfig(partial: Partial<AgentConfig>): void {
    this.cfg = { ...this.cfg, ...partial };
    this.logger.info('Config updated', { keys: Object.keys(partial) });
  }

  static reset(): void {
    ConfigManager.instance = new ConfigManager();
  }
}
