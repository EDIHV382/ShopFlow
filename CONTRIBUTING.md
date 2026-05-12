# Contributing to ShopFlow

Thank you for your interest in contributing to ShopFlow! This document provides guidelines and instructions for contributing to the project.

## Getting Started

### Prerequisites

- Node.js 20 or higher
- npm or yarn
- Git

### Setup

1. Fork the repository
2. Clone your fork: `git clone https://github.com/your-username/ShopFlow.git`
3. Navigate to the project: `cd ShopFlow`
4. Install dependencies: `npm run install:all`
5. Copy the example environment file: `cp .env.example .env`
6. Set up your environment variables in `.env`

## Development

### Running the Project

- Start development server: `npm run dev`
- Run tests: `npm run test:unit` or `npm run test:e2e`
- Run linting: `npm run lint`
- Format code: `npm run format`

### Project Structure

```
ShopFlow/
+-- api/              # Backend API (Express + TypeScript)
+-- client/           # Frontend (Nuxt 3 + Vue 3)
+-- src/api/          # API route handlers
+-- docs/             # Documentation
+-- e2e/              # End-to-end tests
```

## Code Style

### JavaScript/TypeScript

- Use ES6+ features
- Follow the existing code style
- Use meaningful variable and function names
- Add comments for complex logic

### Vue Components

- Use Composition API with `<script setup>`
- Follow Vue 3 best practices
- Use TypeScript for type safety

### Git Commit Messages

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

- `feat:` for new features
- `fix:` for bug fixes
- `docs:` for documentation changes
- `style:` for code style changes
- `refactor:` for code refactoring
- `test:` for adding or updating tests
- `chore:` for maintenance tasks

Example: `feat: add user authentication`

## Pull Request Process

1. Create a new branch from `main`: `git checkout -b feature/your-feature-name`
2. Make your changes and commit them
3. Push to your fork: `git push origin feature/your-feature-name`
4. Create a pull request to the main repository
5. Fill out the pull request template
6. Wait for code review and address any feedback

## Pull Request Template

```markdown
## What does this PR do?

## Type of change

- [ ] Bug fix
- [ ] New feature
- [ ] Refactor
- [ ] Documentation

## Checklist

- [ ] Tests written/updated
- [ ] Lint passes (`npm run lint`)
- [ ] Typecheck passes
- [ ] Environment variables documented in `.env.example`
```

## Testing

### Unit Tests

- Write unit tests for new functions and components
- Aim for high code coverage
- Use Vitest for testing

### End-to-End Tests

- Write E2E tests for critical user flows
- Use Playwright for E2E testing
- Test in multiple browsers when possible

## Questions or Issues?

If you have questions or encounter issues while contributing, please:

- Open an issue on GitHub
- Check existing issues for similar problems
- Reach out to the maintainers

## License

By contributing to ShopFlow, you agree that your contributions will be licensed under the MIT License.
