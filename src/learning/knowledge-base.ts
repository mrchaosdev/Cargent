import { Logger } from '../core/logger.js';
import { LearningSystem } from './learning-system.js';
import { AgentMemory } from '../agent/memory.js';
import { config } from '../core/config.js';

export class KnowledgeBase {
  private logger: Logger;
  private learningSystem: LearningSystem;
  private memory: AgentMemory;

  constructor(memory: AgentMemory) {
    this.logger = Logger.getInstance();
    this.memory = memory;
    this.learningSystem = new LearningSystem(memory);
  }

  async ingestDocument(content: string, metadata?: Record<string, unknown>): Promise<void> {
    await this.learningSystem.learnFromDocument(content, metadata);
  }

  async ingestConversation(query: string, response: string): Promise<void> {
    await this.learningSystem.learnFromInteraction(query, response);
  }

  async ask(query: string): Promise<string> {
    return this.learningSystem.recallRelevant(query);
  }

  async saveSkill(task: string, result: string, skills: string[], project?: string): Promise<void> {
    await this.learningSystem.saveExperience(task, result, skills, project);
  }

  getSkills(): Map<string, number> {
    return this.learningSystem.getSkills();
  }

  getSkillSuggestions(): string[] {
    return this.learningSystem.getSkillSuggestions();
  }

  getExperiences() {
    return this.learningSystem.getAllExperiences();
  }

  toSerializable() {
    return this.learningSystem.toSerializable();
  }
}
