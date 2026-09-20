import { Logger } from './logger.js';

export class ContextManager {
  private messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [];
  private maxTokens: number;
  private logger: Logger;

  constructor(maxTokens: number = 4096) {
    this.maxTokens = maxTokens;
    this.logger = Logger.getInstance();
  }

  addMessage(role: 'system' | 'user' | 'assistant', content: string): void {
    this.messages.push({ role, content });
    this.trimIfNeeded();
  }

  addUser(content: string): void {
    this.addMessage('user', content);
  }

  addAssistant(content: string): void {
    this.addMessage('assistant', content);
  }

  setSystem(content: string): void {
    this.messages = this.messages.filter((m) => m.role !== 'system');
    this.messages.unshift({ role: 'system', content });
  }

  getMessages(): Array<{ role: 'system' | 'user' | 'assistant'; content: string }> {
    return [...this.messages];
  }

  getRecentExcludingSystem(count: number = 10): Array<{ role: 'system' | 'user' | 'assistant'; content: string }> {
    const userAssistant = this.messages.filter((m) => m.role !== 'system');
    return userAssistant.slice(-count);
  }

  clear(): void {
    this.messages = [];
  }

  getTokenCount(): number {
    return this.messages.reduce((acc, m) => acc + Math.ceil(m.content.length / 4), 0);
  }

  private trimIfNeeded(): void {
    if (this.getTokenCount() > this.maxTokens) {
      const systemMsg = this.messages.filter((m) => m.role === 'system');
      const others = this.messages.filter((m) => m.role !== 'system');
      while (this.getTokenCount() > this.maxTokens && others.length > 2) {
        others.splice(1, 2);
      }
      this.messages = [...systemMsg, ...others];
      this.logger.debug('Context trimmed to fit max tokens');
    }
  }
}
