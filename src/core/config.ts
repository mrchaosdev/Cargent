export interface AgentConfig {
  model: {
    path: string;
    contextSize: number;
    gpuLayers: number;
    temperature: number;
    maxTokens: number;
  };
  agent: {
    maxIterations: number;
    memoryLimit: number;
    enableLearning: boolean;
  };
  vectorStore: {
    path: string;
    dimension: number;
    similarityThreshold: number;
  };
  llmBackend: 'llama-cpp' | 'ollama';
  ollamaUrl: string;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
}

export const DEFAULT_CONFIG: AgentConfig = {
  model: {
    path: 'llama3.1',
    contextSize: 4096,
    gpuLayers: 30,
    temperature: 0.7,
    maxTokens: 2048,
  },
  agent: {
    maxIterations: 10,
    memoryLimit: 50,
    enableLearning: true,
  },
  vectorStore: {
    path: './data/vector-store',
    dimension: 384,
    similarityThreshold: 0.7,
  },
  llmBackend: 'ollama',
  ollamaUrl: 'http://localhost:11434',
  logLevel: 'info',
};

export const config: AgentConfig = { ...DEFAULT_CONFIG };
