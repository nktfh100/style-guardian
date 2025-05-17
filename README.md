# Style Guardian

A GitHub Action that reviews pull requests and enforces code style guidelines, helping you maintain a consistent and high-quality codebase.

## How it Works

1.  **Define Your Style Guide:** Create a `STYLE_GUIDE.md` file in your repository with your coding style rules.
    The action will always use the version of this file found in your repository's main branch.
2.  **Configure the Action:** Add the StyleGuardian action to your workflow in `.github/workflows`.
3.  **Pull Request Analysis:** When a pull request is created or updated, the action analyzes the code changes using AI.
4.  **Review Comments:** StyleGuardian posts review comments on the pull request with suggestions for improvement.

## Getting Started

### 1. Create a `STYLE_GUIDE.md` file

**Important**: Style Guardian will fetch this file from the main branch of your repository.
Changes to STYLE_GUIDE.md in a feature branch will only be used once that branch is merged into main.

Example `STYLE_GUIDE.md`:

```markdown
## General Code Practices

- **Arrow Functions:** Prefer arrow functions instead of function declarations.

## Enums

- **Singular Names**: Use singular names for enum values.
```

### 2. Add the Action to Your Workflow

Create a workflow file (`.github/workflows/style-guardian.yml`) with the following content:

```yaml
name: StyleGuardian

on: [pull_request]

jobs:
  style-guardian:
    runs-on: ubuntu-latest
    permissions:
      pull-requests: write
      contents: read
      actions: read
    steps:
      - name: Run Style Guardian
        uses: nktfh100/style-guardian@main
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          AI_PROVIDER_KEY: ${{ secrets.OPENAI_API_KEY }}
          FILE_TYPES: 'ts,tsx'
          # View full list of available options in src/lib/config.ts
```

### 3. Configure Secrets

- **GITHUB_TOKEN:** This secret is automatically provided by GitHub Actions.
- **OPENAI_API_KEY:** Add your OpenAI API key to your repository secrets.

## Configuration

StyleGuardian is designed to be customizable to fit any project's needs.

See [config.ts](/src/lib/config.ts) for the complete list of available options

And the default Prompts used at [constants.ts](/src/lib/constants.ts)

## AI Providers

Supported Providers:

- OpenAI
- Gemini

To support another provider, please create an issue or PR.
