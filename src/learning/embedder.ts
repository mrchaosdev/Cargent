import { Logger } from '../core/logger.js';

export class Embedder {
  private logger: Logger;
  private dimension: number = 384;

  constructor() {
    this.logger = Logger.getInstance();
  }

  async embed(text: string): Promise<number[]> {
    this.logger.debug(`Embedding text (${text.length} chars)`);
    const hash = this.simpleHash(text);
    return this.hashToVector(hash, this.dimension);
  }

  async embedBatch(texts: string[]): Promise<number[][]> {
    return Promise.all(texts.map((t) => this.embed(t)));
  }

  getDimension(): number {
    return this.dimension;
  }

  private simpleHash(text: string): number {
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0;
    }
    return Math.abs(hash);
  }

  private hashToVector(hash: number, dimension: number): number[] {
    const vector: number[] = [];
    let seed = hash;
    for (let i = 0; i < dimension; i++) {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff;
      vector.push((seed / 0x7fffffff) * 2 - 1);
    }
    const norm = Math.sqrt(vector.reduce((sum, v) => sum + v * v, 0));
    return norm > 0 ? vector.map((v) => v / norm) : vector;
  }
}
