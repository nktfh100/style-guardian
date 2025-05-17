import * as core from '@actions/core';
import * as github from '@actions/github';
import { Octokit } from '@octokit/rest';

let octokit: Octokit;

export const initGitHubClient = (token: string): Octokit => {
  octokit = new Octokit({ auth: token });

  octokit.hook.error('request', async (error, _options) => {
    if ('status' in error && error.status === 403) {
      core.error(`API rate limit exceeded or insufficient permissions`);
    }
    throw error;
  });

  return octokit;
};

export const validateEvent = () => {
  if (github.context.eventName !== 'pull_request') {
    throw new Error('This action only works on pull_request events');
  }

  const pr = github.context.payload.pull_request;
  if (!pr) {
    throw new Error('No pull request found in context');
  }
};

export const fetchStyleGuideContent = async (path: string): Promise<string> => {
  const styleGuideFileResponse = await octokit.rest.repos.getContent({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    path: path,
  });

  if (styleGuideFileResponse.status !== 200) {
    throw new Error(`Error fetching style guide file: ${styleGuideFileResponse.status}`);
  }

  const styleGuideFile = styleGuideFileResponse.data as {
    content: string;
    type: string;
  };

  if (styleGuideFile?.type !== 'file') {
    throw new Error(`Style guide file is not a file: ${styleGuideFile.type}`);
  }

  const styleGuideBuffer = Buffer.from(styleGuideFile.content, 'base64');
  return styleGuideBuffer.toString('utf8');
};

export const getPRInfo = () => {
  const pr = github.context.payload.pull_request!;

  return {
    number: pr.number,
    title: pr.title,
    body: pr.body,
    sha: pr.head.sha,
  };
};

export const fetchAllPRFiles = async (prNumber: number) => {
  const files = await octokit.rest.pulls.listFiles({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    pull_number: prNumber,
  });

  if (files.status !== 200) {
    throw new Error(`Error fetching PR files: ${files.status}`);
  }

  return files.data;
};

export const fetchAllPRComments = async (prNumber: number) => {
  const comments = await octokit.rest.pulls.listReviewComments({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    pull_number: prNumber,
  });

  if (comments.status !== 200) {
    throw new Error(`Error fetching PR comments: ${comments.status}`);
  }

  return comments.data;
};

export const createReviewComment = async ({
  prNumber,
  commitId,
  filePath,
  line,
  body,
}: {
  prNumber: number;
  commitId: string;
  filePath: string;
  line: number;
  body: string;
}) => {
  await octokit.rest.pulls.createReviewComment({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    pull_number: prNumber,
    commit_id: commitId,
    path: filePath,
    body: body,
    line: line,
    side: 'RIGHT',
  });
};
