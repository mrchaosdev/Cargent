import 'dotenv/config';

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

function envNumber(name: string, fallback: number): number {
  const value = Number(process.env[name]);
  return Number.isFinite(value) ? value : fallback;
}

function envBoolean(name: string, fallback: boolean): boolean {
  const value = process.env[name]?.toLowerCase();
  if (value === 'true') return true;
  if (value === 'false') return false;
  return fallback;
}

const envBackend = process.env.LLM_BACKEND;
const envLogLevel = process.env.LOG_LEVEL;

export const config: AgentConfig = {
  model: {
    path: process.env.MODEL_PATH || DEFAULT_CONFIG.model.path,
    contextSize: envNumber('CONTEXT_SIZE', DEFAULT_CONFIG.model.contextSize),
    gpuLayers: envNumber('GPU_LAYERS', DEFAULT_CONFIG.model.gpuLayers),
    temperature: envNumber('TEMPERATURE', DEFAULT_CONFIG.model.temperature),
    maxTokens: envNumber('MAX_TOKENS', DEFAULT_CONFIG.model.maxTokens),
  },
  agent: {
    maxIterations: envNumber('MAX_ITERATIONS', DEFAULT_CONFIG.agent.maxIterations),
    memoryLimit: envNumber('MEMORY_LIMIT', DEFAULT_CONFIG.agent.memoryLimit),
    enableLearning: envBoolean('ENABLE_LEARNING', DEFAULT_CONFIG.agent.enableLearning),
  },
  vectorStore: { ...DEFAULT_CONFIG.vectorStore },
  llmBackend: envBackend === 'llama-cpp' ? 'llama-cpp' : DEFAULT_CONFIG.llmBackend,
  ollamaUrl: process.env.OLLAMA_URL || DEFAULT_CONFIG.ollamaUrl,
  logLevel:
    envLogLevel === 'debug' || envLogLevel === 'warn' || envLogLevel === 'error'
      ? envLogLevel
      : DEFAULT_CONFIG.logLevel,
};
