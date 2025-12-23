// Unified API types for all providers

export interface AIProviderConfig {
  name: string;
  displayName: string;
  models: ModelOption[];
  defaultModel: string;
}

export interface ModelOption {
  id: string;
  name: string;
  description?: string;
}

export interface RephraseRequest {
  prompt: string;
  apiKey: string;
  model: string;
}

export interface RephraseResponse {
  success: boolean;
  rephrased?: string;
  error?: string;
}

export interface TestConnectionResult {
  success: boolean;
  error?: string;
}

export interface AIProviderClient {
  config: AIProviderConfig;
  rephrase(request: RephraseRequest): Promise<RephraseResponse>;
  testConnection(apiKey: string): Promise<TestConnectionResult>;
}

// Provider configurations
export const PROVIDER_CONFIGS: Record<string, AIProviderConfig> = {
  anthropic: {
    name: "anthropic",
    displayName: "Claude (Anthropic)",
    defaultModel: "claude-sonnet-4-20250514",
    models: [
      {
        id: "claude-sonnet-4-20250514",
        name: "Claude Sonnet 4",
        description: "Best balance of speed and intelligence",
      },
      {
        id: "claude-3-5-haiku-20241022",
        name: "Claude 3.5 Haiku",
        description: "Fast and efficient",
      },
    ],
  },
  openai: {
    name: "openai",
    displayName: "OpenAI",
    defaultModel: "gpt-4o",
    models: [
      { id: "gpt-4o", name: "GPT-4o", description: "Most capable model" },
      {
        id: "gpt-4o-mini",
        name: "GPT-4o Mini",
        description: "Fast and affordable",
      },
    ],
  },
  gemini: {
    name: "gemini",
    displayName: "Google Gemini",
    defaultModel: "gemini-2.0-flash",
    models: [
      {
        id: "gemini-2.0-flash",
        name: "Gemini 2.0 Flash",
        description: "Fast multimodal model",
      },
      {
        id: "gemini-1.5-pro",
        name: "Gemini 1.5 Pro",
        description: "Advanced reasoning",
      },
    ],
  },
  deepseek: {
    name: "deepseek",
    displayName: "DeepSeek",
    defaultModel: "deepseek-chat",
    models: [
      {
        id: "deepseek-chat",
        name: "DeepSeek Chat",
        description: "General purpose chat",
      },
      {
        id: "deepseek-coder",
        name: "DeepSeek Coder",
        description: "Optimized for code",
      },
    ],
  },
};

// System prompt for rephrasing
export const REPHRASE_SYSTEM_PROMPT = `ROLE

You are Prompt Auditor. Rewrite the user's prompt to maximize neutrality and critical rigor while preserving the original subject and specific claims.

INSTRUCTIONS

- Identify and neutralize: leading premises; emotional loading; validation-seeking; false dichotomies; unspecified appeals to authority/consensus.
- Preserve specificity; do not over-abstract or change the topic.
- Reframe assertions as questions or hypotheses to examine.
- Explicitly request both counter-arguments or alternative interpretations and evidence or reasoning for and against the premise.
- When "experts," "consensus," or "studies" are invoked, ask to define scope/measurement and highlight disagreements or uncertainty.
- Avoid sanitizing away strong claims; examine them directly in neutral form.
- If the prompt is already neutral and objective, return it unchanged.

OUTPUT
Return only the rephrased prompt. Do not include explanations, metadata, or commentary.

FEW-SHOT EXAMPLES

Input: "Why is nuclear power so dangerous and terrible?"
Output: "Analyze the safety record of nuclear power compared to other energy sources. Include statistical data on accidents and waste management, and address common safety concerns objectively."

Input: "Write a post about why remote work destroys company culture."
Output: "Evaluate the impact of remote work on organizational culture. Discuss both potential drawbacks (such as isolation) and benefits (such as autonomy), citing relevant studies."

Input: "I think TypeScript is annoying. Tell me why I should stick to JavaScript."
Output: "Compare TypeScript and JavaScript for modern web development. Outline the technical trade-offs, focusing on type safety, developer velocity, and maintainability."

Original prompt:
`;
