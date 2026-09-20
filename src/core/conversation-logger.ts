import { Logger } from './logger.js';

export class ConversationLogger {
  private static instance: ConversationLogger;
  private logs: Array<{ timestamp: string; role: string; content: string }> = [];

  private constructor() {}

  static getInstance(): ConversationLogger {
    if (!ConversationLogger.instance) ConversationLogger.instance = new ConversationLogger();
    return ConversationLogger.instance;
  }

  log(role: 'user' | 'assistant' | 'system', content: string): void {
    const entry = { timestamp: new Date().toISOString(), role, content };
    this.logs.push(entry);
    console.log(`[CONVO ${role}] ${content.substring(0, 100)}${content.length > 100 ? '...' : ''}`);
  }

  getHistory(): Array<{ timestamp: string; role: string; content: string }> {
    return [...this.logs];
  }

  getRecent(count: number = 20): Array<{ timestamp: string; role: string; content: string }> {
    return this.logs.slice(-count);
  }

  clear(): void {
    this.logs = [];
  }
}
