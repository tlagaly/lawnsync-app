export interface ClaudeRequest {
  model: string;
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
  max_tokens?: number;
  temperature?: number;
}

export interface ClaudeResponse {
  id: string;
  model: string;
  role: 'assistant';
  content: Array<{
    type: 'text';
    text: string;
  }>;
  stop_reason: string;
}

export interface ClaudeErrorResponse {
  error: {
    type: string;
    message: string;
  };
}

export class ClaudeError extends Error {
  type: string;

  constructor(type: string, message: string) {
    super(message);
    this.type = type;
    this.name = 'ClaudeError';
  }
}