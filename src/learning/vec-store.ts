import { Logger } from '../core/logger.js';
import { v4 as uuidv4 } from 'uuid';

export interface VectorEntry {
  id: string;
  content: string;
  embedding: number[];
  metadata?: Record<string, unknown>;
}

export interface SearchResult {
  id: string;
  content: string;
  score: number;
  metadata?: Record<string, unknown>;
}

export class VectorStore {
  private vectors: Map<string, VectorEntry> = new Map();
  private path: string;
  private dimension: number;
  private logger: Logger;

  constructor(path: string, dimension: number) {
    this.path = path;
    this.dimension = dimension;
    this.logger = Logger.getInstance();
  }

  async add(entry: Omit<VectorEntry, 'id'> & { id?: string }): Promise<void> {
    const id = entry.id ?? uuidv4();
    const vector: VectorEntry = { id, content: entry.content, embedding: entry.embedding, metadata: entry.metadata };
    this.vectors.set(id, vector);
    this.logger.debug(`Added vector ${id} (dim: ${this.dimension})`);
  }

  async search(queryEmbedding: number[], limit: number = 5): Promise<SearchResult[]> {
    const results: SearchResult[] = [];
    for (const entry of this.vectors.values()) {
      const score = cosineSimilarity(queryEmbedding, entry.embedding);
      if (score > 0) {
        results.push({ id: entry.id, content: entry.content, score, metadata: entry.metadata });
      }
    }
    results.sort((a, b) => b.score - a.score);
    return results.slice(0, limit);
  }

  async getById(id: string): Promise<VectorEntry | undefined> {
    return this.vectors.get(id);
  }

  async delete(id: string): Promise<boolean> {
    return this.vectors.delete(id);
  }

  get size(): number {
    return this.vectors.size;
  }

  getAll(): VectorEntry[] {
    return Array.from(this.vectors.values());
  }

  async clear(): Promise<void> {
    this.vectors.clear();
  }
}

function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dot / denom;
}
