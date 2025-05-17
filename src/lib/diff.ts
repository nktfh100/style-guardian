import parseDiff from 'parse-diff';

import { config } from './config';
import { extractExtensionFromFilename } from './utils/index';

export const processFilesDiff = async (
  files: {
    filename: string;
    status: string;
    patch?: string;
  }[],
): Promise<string> => {
  const filesDiffLines = [];

  for (const file of files) {
    if (file.status == 'removed' || !file.patch) {
      continue;
    }

    const fileExtension = extractExtensionFromFilename(file.filename);
    if (!fileExtension || !config.fileTypes.includes(fileExtension)) {
      continue;
    }

    const fileDiff = parseDiff(file.patch)[0];

    const fileResultLines = [];

    // Add the line number in front of each line (so the LLM knows where to place the comment)
    for (const chunk of fileDiff.chunks) {
      for (const change of chunk.changes) {
        if (change.type === 'del') {
          continue;
        }

        if (change.type == 'add') {
          fileResultLines.push(`${change.ln}: ${change.content}`);
        } else {
          fileResultLines.push(`${change.content}`);
        }
      }
    }

    filesDiffLines.push(`--- ${file.filename} ---\n${fileResultLines.join('\n')}`);
  }

  return filesDiffLines.join('\n\n');
};
