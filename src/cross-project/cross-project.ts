import { Logger } from '../core/logger.js';
import { KnowledgeBase } from '../learning/knowledge-base.js';
import { AgentMemory } from '../agent/memory.js';

export interface Skill {
  name: string;
  description: string;
  usageCount: number;
  lastUsed?: string;
  transferable: boolean;
}

export interface ProjectProfile {
  name: string;
  skills: Skill[];
  knowledgeAreas: string[];
  lastActive?: string;
}

export class CrossProjectManager {
  private logger: Logger;
  private knowledgeBase: KnowledgeBase;
  private memory: AgentMemory;
  private projectProfiles: Map<string, ProjectProfile> = new Map();
  private sharedSkills: Skill[] = [];

  constructor(knowledgeBase: KnowledgeBase, memory: AgentMemory) {
    this.logger = Logger.getInstance();
    this.knowledgeBase = knowledgeBase;
    this.memory = memory;
  }

  async registerProject(name: string, skills: string[] = []): Promise<void> {
    const profile: ProjectProfile = {
      name,
      skills: skills.map((s) => ({ name: s, description: s, usageCount: 0, transferable: true })),
      knowledgeAreas: [],
      lastActive: new Date().toISOString(),
    };
    this.projectProfiles.set(name, profile);
    this.logger.info(`Registered project: ${name}`);
  }

  async shareSkill(skill: Skill): Promise<void> {
    if (!skill.transferable) {
      this.logger.warn(`Skill ${skill.name} is not transferable`);
      return;
    }
    this.sharedSkills.push(skill);
    this.logger.info(`Shared skill: ${skill.name}`);
  }

  async getTransferableSkills(): Promise<Skill[]> {
    return [...this.sharedSkills];
  }

  async recommendSkills(projectName: string): Promise<string[]> {
    const profile = this.projectProfiles.get(projectName);
    if (!profile) return [];
    const allSkills = this.knowledgeBase.getSkillSuggestions();
    return allSkills.filter((s: string) => !profile.skills.some((ps: { name: string }) => ps.name === s));
  }

  async transferToProject(targetProject: string, skills: string[]): Promise<void> {
    const profile = this.projectProfiles.get(targetProject);
    if (!profile) {
      this.logger.error(`Project not found: ${targetProject}`);
      return;
    }
    for (const skill of skills) {
      profile.skills.push({
        name: skill,
        description: skill,
        usageCount: 0,
        transferable: true,
      });
    }
    this.logger.info(`Transferred ${skills.length} skills to ${targetProject}`);
  }

  async exportProfile(projectName: string): Promise<string | null> {
    const profile = this.projectProfiles.get(projectName);
    if (!profile) return null;
    return JSON.stringify(profile, null, 2);
  }

  async importProfile(json: string): Promise<void> {
    try {
      const profile: ProjectProfile = JSON.parse(json);
      this.projectProfiles.set(profile.name, profile);
      this.logger.info(`Imported profile: ${profile.name}`);
    } catch (err) {
      this.logger.error('Failed to import profile', String(err));
    }
  }

  listProjects(): string[] {
    return Array.from(this.projectProfiles.keys());
  }

  getProjectSkills(projectName: string): Skill[] {
    return this.projectProfiles.get(projectName)?.skills ?? [];
  }
}
