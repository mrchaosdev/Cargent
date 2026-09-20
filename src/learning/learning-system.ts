import { Logger } from '../core/logger.js';
import { AgentMemory, MemoryEntry } from '../agent/memory.js';
import { Embedder } from './embedder.js';
import { VectorStore } from './vec-store.js';
import { config } from '../core/config.js';
import { v4 as uuidv4 } from 'uuid';

export interface Experience {
  id: string;
  task: string;
  result: string;
  skills: string[];
  timestamp: string;
  project?: string;
  embedding?: number[];
}

export class LearningSystem {
  private logger: Logger;
  private memory: AgentMemory;
  private vectorStore: VectorStore;
  private embedder: Embedder;
  private experiences: Experience[] = [];
  private skills: Map<string, number> = new Map();

  constructor(memory: AgentMemory) {
    this.logger = Logger.getInstance();
    this.memory = memory;
    this.vectorStore = new VectorStore(config.vectorStore.path, config.vectorStore.dimension);
    this.embedder = new Embedder();
  }

  async learnFromInteraction(query: string, response: string): Promise<void> {
    const embedding = await this.embedder.embed(response);
    const experience: Experience = {
      id: uuidv4(),
      task: query,
      result: response,
      skills: this.extractSkills(response),
      timestamp: new Date().toISOString(),
      embedding,
    };
    this.experiences.push(experience);
    await this.vectorStore.add({
      id: experience.id,
      content: query + ' ' + response,
      embedding,
      metadata: { type: 'interaction', timestamp: experience.timestamp },
    });
    this.updateSkills(experience.skills);
    this.logger.info(`Learned from interaction, skills: ${experience.skills.join(', ')}`);
  }

  async learnFromDocument(content: string, metadata?: Record<string, unknown>): Promise<void> {
    const embedding = await this.embedder.embed(content);
    const id = uuidv4();
    await this.vectorStore.add({
      id,
      content,
      embedding,
      metadata: { type: 'document', ...metadata },
    });
    this.logger.info(`Learned from document (${content.length} chars)`);
  }

  async retrieveKnowledge(query: string, limit: number = 5): Promise<Array<{ content: string; score: number; metadata?: Record<string, unknown> }>> {
    const queryEmbedding = await this.embedder.embed(query);
    return this.vectorStore.search(queryEmbedding, limit);
  }

  async recallRelevant(query: string): Promise<string> {
    const results = await this.retrieveKnowledge(query, 3);
    if (results.length === 0) return '';
    return results.map((r) => r.content).join('\n---\n');
  }

  async saveExperience(task: string, result: string, skills: string[], project?: string): Promise<void> {
    const embedding = await this.embedder.embed(result);
    const exp: Experience = {
      id: uuidv4(),
      task,
      result,
      skills,
      timestamp: new Date().toISOString(),
      project,
      embedding,
    };
    this.experiences.push(exp);
    await this.vectorStore.add({
      id: exp.id,
      content: task + ' ' + result,
      embedding,
      metadata: { type: 'experience', project, timestamp: exp.timestamp },
    });
    this.updateSkills(skills);
    this.logger.info(`Experience saved for project: ${project ?? 'default'}`);
  }

  getSkills(): Map<string, number> {
    return new Map(this.skills);
  }

  getAllExperiences(): Experience[] {
    return [...this.experiences];
  }

  getSkillSuggestions(): string[] {
    return Array.from(this.skills.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([skill]) => skill);
  }

  toSerializable(): { skills: Array<[string, number]>; experiences: Experience[]; config: unknown } {
    return {
      skills: Array.from(this.skills.entries()),
      experiences: this.experiences,
      config: { ...config },
    };
  }

  private extractSkills(text: string): string[] {
    const skillPatterns = [
      /code|program|develop|implement|build/i,
      /search|find|lookup|research/i,
      /write|create|generate|draft/i,
      /analyze|examine|inspect|review/i,
      /fix|repair|debug|resolve/i,
      /plan|design|architecture|structure/i,
      /learn|study|understand|explain/i,
      /execute|run|operate|perform/i,
    ];
    const skills: string[] = [];
    for (const pattern of skillPatterns) {
      if (pattern.test(text)) {
        skills.push(pattern.source.replace(/[\\i]/g, '').replace(/\//g, ''));
      }
    }
    return skills.length > 0 ? skills : ['general'];
  }

  private updateSkills(skills: string[]): void {
    for (const skill of skills) {
      const current = this.skills.get(skill) ?? 0;
      this.skills.set(skill, current + 1);
    }
  }
}
