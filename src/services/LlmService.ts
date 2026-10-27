import { LLM_MAX_PROMPT_CHARS, LLM_MAX_TOKENS, PROJECT_URL } from '../config/constants';
import type { Config } from '../config/env';
import type { Logger } from '../core/Logger';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatOptions {
  temperature?: number;
  maxTokens?: number;
}

interface LlmResponse {
  choices?: Array<{ message?: { content?: string } }>;
}

/** Thin client for the OpenRouter chat completions API. */
export class LlmService {
  constructor(
    private readonly config: Config,
    private readonly logger: Logger,
  ) {}

  async chat(messages: ChatMessage[], options: ChatOptions = {}): Promise<string> {
    const { openRouterApiKey, openRouterUrl, openRouterModel } = this.config;
    if (!openRouterApiKey) {
      throw new Error('OPENROUTER_API_KEY не задан');
    }

    const response = await fetch(openRouterUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${openRouterApiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': PROJECT_URL,
        'X-Title': 'Opeks Bot',
      },
      body: JSON.stringify({
        model: openRouterModel,
        messages: this.truncateMessages(messages),
        max_tokens: options.maxTokens ?? LLM_MAX_TOKENS,
        temperature: options.temperature ?? 0.7,
      }),
    });

    if (!response.ok) {
      this.logger.warn(`LLM request failed with status ${response.status}`);
      throw new Error(`LLM error: ${response.status}`);
    }

    const data = (await response.json()) as LlmResponse;
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error('LLM вернул пустой ответ');
    }

    return content.trim();
  }

  private truncateMessages(messages: ChatMessage[]): ChatMessage[] {
    return messages.map((message) =>
      message.content.length > LLM_MAX_PROMPT_CHARS
        ? {
            ...message,
            content:
              message.content.substring(0, LLM_MAX_PROMPT_CHARS) + '\n... (контекст обрезан)',
          }
        : message,
    );
  }
}
