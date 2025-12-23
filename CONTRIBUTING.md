# Contributing to Prompt Auditor

Thank you for your interest in contributing to Prompt Auditor! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Code Style](#code-style)
- [Testing](#testing)
- [Adding New Features](#adding-new-features)
- [Pull Request Process](#pull-request-process)
- [Project Architecture](#project-architecture)

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on what is best for the community
- Show empathy towards other community members

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Chrome 116+ for testing
- Git
- A code editor (VS Code recommended)

### Initial Setup

1. **Fork the repository** on GitHub

2. **Clone your fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/prompt-auditor.git
   cd prompt-auditor
   ```

3. **Add upstream remote**
   ```bash
   git remote add upstream https://github.com/kmelkon/prompt-auditor.git
   ```

4. **Install dependencies**
   ```bash
   npm install
   ```

5. **Build the extension**
   ```bash
   npm run build
   ```

6. **Load in Chrome**
   - Go to `chrome://extensions`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `dist` folder

## Development Workflow

### Making Changes

1. **Sync with upstream**
   ```bash
   git checkout main
   git pull upstream main
   ```

2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/your-bug-fix
   ```

3. **Make your changes**
   - Follow the code style guidelines below
   - Add tests for new functionality
   - Update documentation as needed

4. **Run tests**
   ```bash
   npm run test:run
   npm run type-check
   ```

5. **Build and test manually**
   ```bash
   npm run build
   # Load in Chrome and test functionality
   ```

6. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add amazing feature"
   ```
   See [Commit Message Guidelines](#commit-message-guidelines) below

7. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

8. **Open a Pull Request** on GitHub

### Development Scripts

```bash
# Watch mode - auto-rebuild on changes (main build only)
npm run dev

# Full build (both main and content script)
npm run build

# Run tests
npm run test                # Watch mode
npm run test:run            # Run once
npm run test:coverage       # With coverage
npm run test:ui             # Open test UI

# Type checking
npm run type-check

# Lint and format (after ESLint setup)
npm run lint
npm run format
```

## Code Style

### TypeScript

- **Strict mode**: Already enabled in `tsconfig.json`
- **Explicit types**: Prefer explicit return types on functions
- **No `any`**: Avoid using `any` - use `unknown` or proper types
- **Naming**:
  - `camelCase` for variables and functions
  - `PascalCase` for types, interfaces, and React components
  - `UPPER_SNAKE_CASE` for constants

### React

- **Functional components** with hooks
- **useCallback** for functions passed to children
- **useMemo** for expensive computations
- **useEffect** with proper dependency arrays

**Example:**
```typescript
export function MyComponent({ onAction }: Props) {
  const [state, setState] = useState<StateType>(initialState);

  const handleClick = useCallback(() => {
    onAction(state);
  }, [state, onAction]);

  return <button onClick={handleClick}>Click me</button>;
}
```

### CSS

- **BEM-style naming**: `block__element--modifier`
- **Design tokens**: Use CSS variables from `variables.css`
- **No inline styles**: Use CSS classes

**Example:**
```css
.prompt-editor {
  /* Block styles */
}

.prompt-editor__input {
  /* Element styles */
}

.prompt-editor__input--disabled {
  /* Modifier styles */
}
```

### File Organization

- **Component files**: Match component name (`PromptEditor.tsx` exports `PromptEditor`)
- **Index files**: Re-export from index files for cleaner imports
- **Test files**: Co-locate tests near source (`component.test.tsx` next to `component.tsx` in tests/ directory)

## Testing

### Writing Tests

- **Test files**: `tests/unit/[module].test.ts` or `tests/integration/[feature].test.ts`
- **Coverage**: Aim for >80% coverage for new code
- **What to test**:
  - Happy path (normal usage)
  - Edge cases (empty inputs, null values, etc.)
  - Error cases (API failures, network errors, etc.)

### Test Structure

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('Feature Name', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('functionName', () => {
    it('should do X when Y', () => {
      // Arrange
      const input = 'test';

      // Act
      const result = functionName(input);

      // Assert
      expect(result).toBe('expected');
    });

    it('should handle error case', () => {
      // Test error handling
    });
  });
});
```

### Running Tests

```bash
# Run all tests
npm run test:run

# Watch mode
npm run test

# Coverage report
npm run test:coverage

# Test UI
npm run test:ui
```

## Adding New Features

### Adding a New AI Provider

1. **Add provider type** to `src/lib/storage.ts`:
   ```typescript
   export type AIProvider = 'anthropic' | 'openai' | 'gemini' | 'deepseek' | 'newprovider';
   ```

2. **Add provider config** to `src/lib/api/types.ts`:
   ```typescript
   export const PROVIDER_CONFIGS: Record<string, AIProviderConfig> = {
     // ... existing providers
     newprovider: {
       name: 'newprovider',
       displayName: 'New Provider',
       defaultModel: 'model-name',
       models: [
         { id: 'model-name', name: 'Model Name', description: 'Description' },
       ],
     },
   };
   ```

3. **Create client file** `src/lib/api/newprovider.ts`:
   ```typescript
   import { AIProviderClient, RephraseRequest, ... } from './types';

   export const newproviderClient: AIProviderClient = {
     config: PROVIDER_CONFIGS.newprovider,

     async rephrase(request: RephraseRequest): Promise<RephraseResponse> {
       // Implementation
     },

     async testConnection(apiKey: string): Promise<TestConnectionResult> {
       // Implementation
     },
   };
   ```

4. **Register provider** in `src/lib/api/index.ts`:
   ```typescript
   import { newproviderClient } from './newprovider';

   const providers: Record<AIProvider, AIProviderClient> = {
     // ... existing
     newprovider: newproviderClient,
   };
   ```

5. **Add host permissions** in `public/manifest.json`:
   ```json
   "host_permissions": [
     "https://api.newprovider.com/*"
   ]
   ```

6. **Write tests** `tests/unit/api/newprovider.test.ts`

7. **Test manually** with real API key

### Adding a New Site Handler

1. **Create handler file** `src/content/sites/newsite.ts`:
   ```typescript
   import type { SiteHandler } from './types';

   export const newsiteHandler: SiteHandler = {
     name: 'New Site',
     hostPatterns: ['newsite.com', 'chat.newsite.com'],

     getInputElement(): HTMLElement | null {
       return document.querySelector('textarea#prompt');
     },

     getPromptText(): string {
       const input = this.getInputElement();
       return input instanceof HTMLTextAreaElement ? input.value : '';
     },

     setPromptText(text: string): void {
       const input = this.getInputElement();
       if (input instanceof HTMLTextAreaElement) {
         input.value = text;
         input.dispatchEvent(new Event('input', { bubbles: true }));
         input.focus();
       }
     },

     getButtonContainer(): HTMLElement | null {
       return this.getInputElement()?.closest('form') || null;
     },
   };
   ```

2. **Register handler** in `src/content/sites/index.ts`:
   ```typescript
   import { newsiteHandler } from './newsite';

   const handlers: SiteHandler[] = [
     // ... existing handlers
     newsiteHandler,
   ];
   ```

3. **Add content script match** in `public/manifest.json`:
   ```json
   "content_scripts": [{
     "matches": [
       "https://newsite.com/*",
       "https://chat.newsite.com/*"
     ]
   }]
   ```

4. **Test manually** by visiting the site and verifying button appearance

## Pull Request Process

### Before Submitting

- [ ] Code follows style guidelines
- [ ] Tests added for new functionality
- [ ] All tests pass (`npm run test:run`)
- [ ] Type checking passes (`npm run type-check`)
- [ ] Extension builds successfully (`npm run build`)
- [ ] Manual testing completed in Chrome
- [ ] Documentation updated (README, AGENTS.md, etc.)
- [ ] CHANGELOG.md updated (if applicable)

### PR Title

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add keyboard shortcuts
fix: resolve sidepanel not opening
docs: update README with new features
test: add tests for storage utilities
chore: update dependencies
```

### PR Description Template

```markdown
## Description
Brief description of changes

## Motivation
Why is this change needed?

## Changes
- Change 1
- Change 2

## Testing
How did you test these changes?

## Screenshots (if applicable)
Add screenshots for UI changes

## Checklist
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] Manual testing completed
- [ ] No breaking changes (or documented)
```

### Review Process

1. Maintainer reviews your PR
2. Address feedback if requested
3. Once approved, maintainer will merge
4. Delete your feature branch after merge

## Project Architecture

### Key Directories

```
src/
├── sidepanel/          # React UI (main interface)
├── options/            # Settings page (React)
├── content/            # Content scripts (button injection)
│   └── sites/          # Site-specific DOM handlers
├── background/         # Service worker (message relay)
└── lib/
    ├── api/            # AI provider clients
    ├── storage.ts      # Chrome storage wrapper
    └── messaging.ts    # Message passing helpers
```

### Message Flow

```
┌──────────────┐         ┌──────────────────┐         ┌────────────┐
│Content Script│────────▶│Background Worker │────────▶│ Side Panel │
│ (Button)     │ PROMPT  │  (Message Relay) │ PROMPT  │    (UI)    │
└──────────────┘         └──────────────────┘         └────────────┘
       ▲                                                      │
       └──────────────────────────────────────────────────────┘
                    UPDATE_PROMPT (via chrome.tabs.sendMessage)
```

### Build System

- **Main Build** (`vite.config.ts`): Sidepanel, options, background
- **Content Script Build** (`vite.config.content.ts`): IIFE bundle for Chrome compatibility
- **IMPORTANT**: Always run `npm run build` for complete build (both configs)

### Chrome APIs Used

- **storage.local**: Persistent settings and API keys
- **runtime.sendMessage**: Message passing between components
- **tabs**: Content script communication
- **sidePanel**: Side panel UI (Chrome 116+)
- **action**: Extension icon click handler

## Common Pitfalls

### Content Script Isolation

- Content script builds as **IIFE** (not ES modules)
- No dynamic imports at runtime
- All dependencies must be bundled
- Use `vite.config.content.ts` for content script build

### React Event Handling

When programmatically setting input values:
```typescript
input.value = text;
input.dispatchEvent(new Event('input', { bubbles: true })); // Required!
input.focus();
```

### Async Message Handlers

Always return `true` for async handlers:
```typescript
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'ASYNC_ACTION') {
    doAsyncWork().then(sendResponse);
    return true; // CRITICAL: keeps message channel open
  }
  return false;
});
```

## Getting Help

- **Questions**: Open a [GitHub Discussion](https://github.com/kmelkon/prompt-auditor/discussions)
- **Bugs**: Create an [Issue](https://github.com/kmelkon/prompt-auditor/issues)
- **Security**: See [SECURITY.md](./docs/SECURITY.md)

## Additional Resources

- [Chrome Extension Documentation](https://developer.chrome.com/docs/extensions/)
- [Manifest V3 Migration Guide](https://developer.chrome.com/docs/extensions/mv3/intro/)
- [React Documentation](https://react.dev/)
- [Vitest Documentation](https://vitest.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

Thank you for contributing to Prompt Auditor! 🎉
