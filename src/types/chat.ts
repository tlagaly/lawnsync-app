/**
 * Type definitions for the AI Chat Assistant
 */

export type MessageRole = 'user' | 'assistant' | 'system';

export interface ChatMessage {
  id: string;
  content: string;
  role: MessageRole;
  timestamp: string;
  isLoading?: boolean;
  error?: string;
  formattedContent?: string; // For rendering markdown or other formatted content
}

export interface Conversation {
  id: string;
  userId: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
  title?: string;
}

export interface QuickPrompt {
  id: string;
  text: string;
  category: 'general' | 'problems' | 'maintenance' | 'seasonal';
}

export interface ChatServiceOptions {
  useOpenAI: boolean;
  defaultModel: 'gpt-3.5-turbo' | 'gpt-4';
  temperature: number;
  maxTokens: number;
  useStreaming?: boolean;
  saveHistory?: boolean;
  initialSystemPrompt?: string;
}