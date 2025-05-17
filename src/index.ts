import * as core from '@actions/core';

import { Agent } from './agent';
import {
  fetchStyleGuideContent,
  fetchAllPRFiles,
  getPRInfo,
  initGitHubClient,
  validateEvent,
  fetchAllPRComments,
  createReviewComment,
} from './github';
import { config, validateConfig } from './lib/config';
import { processFilesDiff } from './lib/diff';
import { generateCommentBody } from './lib/utils/index';
import { getLanguageFromFilename } from './lib/utils/languagesMap';

const main = async () => {
  validateConfig();
  validateEvent();

  initGitHubClient(config.github.token);

  const styleGuideContent = await fetchStyleGuideContent(config.styleGuideFile);
  const pr = getPRInfo();

  core.debug(`PR #${pr.number}: ${pr.title}`);
  core.debug(`Description:\n${pr.body}\n`);

  const allPRFiles = await fetchAllPRFiles(pr.number);
  const resultDiffString = await processFilesDiff(allPRFiles);

  core.debug(`\n\nFiles diff:\n${resultDiffString}`);

  const existingComments = await fetchAllPRComments(pr.number);
  const existingCommentsStrings = existingComments
    .map((comment) => `--- ${comment.user.login} ---\n${comment.body}`)
    .join('\n\n');

  core.debug(`Existing comments:\n${existingCommentsStrings}`);

  const agent = new Agent(config.ai.provider, config.ai.model, config.ai.aiProviderKey);
  agent.initPrompts(config.systemPrompt, config.userPrompt);

  const response = await agent.generateResponse({
    styleGuide: styleGuideContent,
    prTitle: pr.title,
    prDescription: pr.body || '',
    code: resultDiffString,
    comments: existingCommentsStrings,
  });

  if (!response.success || !response.response) {
    throw new Error(`Error generating response: ${response.error}`);
  }

  core.debug(`AI Response:\n${JSON.stringify(response.response?.suggestions)}`);

  for (const suggestion of response.response.suggestions) {
    const commentBody = generateCommentBody({
      suggestion,
      language: getLanguageFromFilename(suggestion.file),
    });

    await createReviewComment({
      prNumber: pr.number,
      commitId: pr.sha,
      filePath: suggestion.file,
      line: suggestion.line,
      body: commentBody,
    });
  }
};

main().catch((error) => {
  core.error('Error:', error);
  if (error instanceof Error) core.setFailed(error.message);
});
