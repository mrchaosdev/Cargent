import { ConversationLogger } from '../core/conversation-logger.js';
import { Logger } from '../core/logger.js';

export interface MemoryEntry {
  id: string;
  timestamp: string;
  content: string;
  metadata?: Record<string, unknown>;
}

export class AgentMemory {
  private shortTerm: Array<{ role: 'user' | 'assistant'; content: string }> = [];
  private longTerm: MemoryEntry[] = [];
  private maxShortTerm: number;
  private logger: Logger;
  private conversationLogger: ConversationLogger;

  constructor(maxShortTerm: number = 50) {
    this.maxShortTerm = maxShortTerm;
    this.logger = Logger.getInstance();
    this.conversationLogger = ConversationLogger.getInstance();
  }

  addUserMessage(content: string): void {
    this.shortTerm.push({ role: 'user', content });
    this.conversationLogger.log('user', content);
    this.trimIfNeeded();
  }

  addAssistantMessage(content: string): void {
    this.shortTerm.push({ role: 'assistant', content });
    this.conversationLogger.log('assistant', content);
  }

  getRecentMessages(count: number = 10): Array<{ role: 'user' | 'assistant'; content: string }> {
    return this.shortTerm.slice(-count);
  }

  getAllMessages(): Array<{ role: 'user' | 'assistant'; content: string }> {
    return [...this.shortTerm];
  }

  addLongTerm(entry: Omit<MemoryEntry, 'id' | 'timestamp'>): void {
    const mem: MemoryEntry = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      ...entry,
    };
    this.longTerm.push(mem);
    this.logger.info(`Added long-term memory: ${entry.content.substring(0, 50)}`);
  }

  getLongTerm(): MemoryEntry[] {
    return [...this.longTerm];
  }

  searchLongTerm(query: string, limit: number = 5): MemoryEntry[] {
    const lower = query.toLowerCase();
    return this.longTerm
      .filter((m) => m.content.toLowerCase().includes(lower))
      .slice(-limit);
  }

  clearShortTerm(): void {
    this.shortTerm = [];
  }

  clearLongTerm(): void {
    this.longTerm = [];
  }

  getSize(): { short: number; long: number } {
    return { short: this.shortTerm.length, long: this.longTerm.length };
  }

  private trimIfNeeded(): void {
    if (this.shortTerm.length > this.maxShortTerm) {
      const removed = this.shortTerm.length - this.maxShortTerm;
      this.shortTerm = this.shortTerm.slice(removed);
      this.logger.debug(`Trimmed ${removed} old messages from short-term memory`);
    }
  }
}
