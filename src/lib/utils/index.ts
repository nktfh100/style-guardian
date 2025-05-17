import { Suggestion } from '../../agent';
import { config } from './../config';

export const generateCommentBody = ({
  suggestion,
  language,
}: {
  suggestion: Suggestion;
  language: string;
}): string => {
  return config.commentStructure
    .replace('{rule}', suggestion.rule)
    .replace('{violation}', suggestion.violation)
    .replace('{suggested_fix}', suggestion.suggested_fix)
    .replace('{original_code}', suggestion.original_code)
    .replace('{line}', suggestion.line.toString())
    .replace('{file}', suggestion.file)
    .replaceAll('{language}', language);
};

export const extractExtensionFromFilename = (filename: string) => {
  const parts = filename.split('.');
  return parts.length > 1 ? parts.pop() : '';
};
