import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  SystemMessagePromptTemplate,
} from '@langchain/core/prompts';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { ChatOpenAI, ChatOpenAICallOptions } from '@langchain/openai';
import { z } from 'zod';

export const suggestionSchema = z.object({
  file: z.string(),
  line: z.number(),
  rule: z.string(),
  violation: z.string(),
  original_code: z.string(),
  suggested_fix: z.string(),
});

export type Suggestion = z.infer<typeof suggestionSchema>;

const suggestionsSchema = z.object({
  suggestions: z.array(suggestionSchema),
});

export class Agent {
  model: ChatOpenAI<ChatOpenAICallOptions> | ChatGoogleGenerativeAI;
  prompt!: ChatPromptTemplate<never, never>;

  constructor(
    private provider: string,
    private modelName: string,
    private apiKey: string,
  ) {
    this.model = this.getModel();
  }

  initPrompts(systemPrompt: string, userPrompt: string) {
    this.prompt = ChatPromptTemplate.fromMessages([
      SystemMessagePromptTemplate.fromTemplate(systemPrompt),
      HumanMessagePromptTemplate.fromTemplate(userPrompt),
    ]);
  }

  getModel() {
    switch (this.provider.toLowerCase()) {
      case 'openai':
        return new ChatOpenAI({
          openAIApiKey: this.apiKey,
          modelName: this.modelName,
        });
      case 'gemini':
        return new ChatGoogleGenerativeAI({
          apiKey: this.apiKey,
          model: this.modelName,
        });
      default:
        throw new Error('Unsupported provider');
    }
  }

  async generateResponse({
    styleGuide,
    prTitle,
    prDescription,
    code,
    comments,
  }: {
    styleGuide: string;
    prTitle: string;
    prDescription: string;
    code: string;
    comments: string;
  }) {
    const modelStructuredOutput = this.model.withStructuredOutput(suggestionsSchema);

    try {
      const formattedMessages = await this.prompt.formatMessages({
        style_guide: styleGuide,
        pr_title: prTitle,
        pr_description: prDescription,
        code,
        comments,
      });

      const response = await modelStructuredOutput.invoke(formattedMessages);

      return {
        success: true,
        response,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unknown error occurred',
      };
    }
  }
}
