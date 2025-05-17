import {
  DEFAULT_AI_MODEL,
  DEFAULT_AI_PROVIDER,
  DEFAULT_COMMENT_STRUCTURE,
  DEFAULT_STYLE_GUIDE_FILE,
  DEFAULT_SYSTEM_PROMPT,
  DEFAULT_USER_PROMPT,
} from './constants';

type Config = {
  systemPrompt: string;
  userPrompt: string;
  commentStructure: string;
  styleGuideFile: string;
  fileTypes: string[];
  ai: {
    provider: 'openai' | 'gemini';
    model: string;
    aiProviderKey: string;
  };
  github: {
    token: string;
    workspace: string;
  };
};

export const config: Config = {
  systemPrompt: process.env.CUSTOM_PROMPT || DEFAULT_SYSTEM_PROMPT,
  userPrompt: process.env.CUSTOM_USER_PROMPT || DEFAULT_USER_PROMPT,
  commentStructure: process.env.CUSTOM_COMMENT_STRUCTURE || DEFAULT_COMMENT_STRUCTURE,
  styleGuideFile: process.env.STYLE_GUIDE_FILE || DEFAULT_STYLE_GUIDE_FILE,
  fileTypes: (process.env.FILE_TYPES || '')
    .split(',')
    .map((fileType) => fileType.trim())
    .filter((fileType) => fileType),
  ai: {
    provider: (process.env.AI_PROVIDER as Config['ai']['provider']) || DEFAULT_AI_PROVIDER,
    model: process.env.AI_MODEL || DEFAULT_AI_MODEL,
    aiProviderKey: process.env.AI_PROVIDER_KEY || '',
  },
  github: {
    token: process.env.GITHUB_TOKEN || '',
    workspace: process.env.GITHUB_WORKSPACE || '',
  },
};

export const validateConfig = (): void => {
  if (!config.ai.aiProviderKey) {
    throw new Error('AI provider key environment variable (AI_PROVIDER_KEY) was not provided!');
  }
  if (!config.fileTypes.length) {
    throw new Error('File types environment variable (FILE_TYPES) was not provided!');
  }
};
