# Style Guide

- [Style Guide](#style-guide)
  - [Core Principles](#core-principles)
  - [General Code Practices](#general-code-practices)
  - [Enums](#enums)
  - [Constants](#constants)
  - [Git And Version Control](#git-and-version-control)

## Core Principles

- **Clean Code**: Prioritize clean and readable code.
- **Reusability**: Prefer reusable components and functions as much as possible.
- **Type Safety**: Use TypeScript for type safety.

## General Code Practices

- **No `any` Type**: Use `unknown` or specific types instead.

  Add `@ts-expect-error` comments if temporary exceptions are needed

- **Descriptive Naming**: Use descriptive names for variables, functions, and classes.
- **Avoid Magic Values**: Use enums or constants instead of hardcoded strings or numbers.
- **Function Parameters**: Use object destructuring for function parameters.

  ```typescript
  // Bad
  function createUser(name: string, age: number) {
      // ...
  }

  // Good
  type CreateUserParams {
      name: string;
      age: number;
  }
  function createUser({ name, age }: CreateUserParams) {
      // ...
  }
  ```

- **Arrow Functions**: Prefer arrow functions instead of function declarations.

  ```typescript
  // Bad
  function add(a: number, b: number) {
      return a + b;
  }

  // Good
  const add = (a: number, b: number) => a + b;
  ```

## Enums

- **Singular Names**: Use singular names for enum values.
- **Uppercase**: Use uppercase for enum keys.

## Constants

- **Centralize Constants**: Store constants in a dedicated folder (e.g., src/constants).
- **Naming**: Use uppercase with underscores for constant names.
- **Environment Variables**: Process.env calls should only be in the src/lib/config.ts file

## Git And Version Control

- **Branch Naming**: Use the [conventional commits](https://www.conventionalcommits.org/en/v1.0.0/) format for branch names.
  - Example: `feat/feature-name`, `fix/bug-name`, `chore/update-dependencies`
- **PR Merge**: Always use squash instead of merge when merging pull requests.
