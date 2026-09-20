export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LLMOptions {
  temperature?: number;
  maxTokens?: number;
  contextWindow?: number;
  stopSequences?: string[];
}

export interface LLMResponse {
  text: string;
  tokensUsed: number;
  model: string;
  finishReason?: 'stop' | 'length' | 'tool_call';
}

export interface LLMToolCall {
  name: string;
  arguments: Record<string, unknown>;
}

export interface LLMStreamCallbacks {
  onToken?: (token: string) => void;
  onComplete?: (response: LLMResponse) => void;
  onError?: (error: Error) => void;
}

export interface LLMEngine {
  load(modelPath: string): Promise<void>;
  complete(
    messages: LLMMessage[],
    options?: LLMOptions,
    callbacks?: LLMStreamCallbacks,
  ): Promise<LLMResponse>;
  isLoaded(): boolean;
  unload(): void;
  getModelInfo(): ModelInfo | null;
}

export interface ModelInfo {
  name: string;
  parameterSize: string;
  quantization: string;
  contextSize: number;
  gpuLayers: number;
}
