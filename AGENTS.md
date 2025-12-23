# AGENTS.md - AI Agent Guide for Prompt Auditor

## Project Overview

**Prompt Auditor** is a Chrome extension that helps users rephrase their AI prompts to avoid sycophancy and get more honest, objective responses from AI systems.

### Core Functionality

- **Floating "Audit Prompt" button** appears on supported AI chat sites
- **Chrome Side Panel UI** for reviewing and rephrasing prompts
- **Multi-provider support**: Claude (Anthropic), OpenAI, Gemini, DeepSeek
- **Auto-detects prompts** from the chat input field on supported sites

### Privacy Model

- All API calls made directly from extension using user's own API keys
- No backend server - completely client-side
- API keys stored in Chrome local storage

### Supported Sites

- claude.ai
- chatgpt.com / chat.openai.com
- gemini.google.com
- chat.deepseek.com

---

## Tech Stack

| Technology               | Purpose                                                |
| ------------------------ | ------------------------------------------------------ |
| **Vite**                 | Build tool with HMR                                    |
| **TypeScript**           | Strict mode enabled                                    |
| **React 18**             | UI components                                          |
| **Chrome Extension MV3** | Manifest V3 with service worker                        |
| **CSS**                  | Design tokens, IBM Plex fonts, editorial/refined style |

---

## Architecture Overview

```
src/
├── sidepanel/              # React UI (main interface)
│   ├── App.tsx             # Root component, state management
│   ├── index.tsx           # Entry point
│   └── components/
│       ├── PromptEditor.tsx      # Original prompt input
│       ├── RephrasedResult.tsx   # Rephrased output display
│       ├── LoadingState.tsx      # Loading indicator
│       └── ProviderIndicator.tsx # Current provider badge
│
├── options/                # Settings page (React)
│   └── index.tsx           # API key configuration UI
│
├── content/                # Content scripts (injected into AI sites)
│   ├── content.ts          # Button injection, prompt capture
│   ├── content.css         # Floating button styles
│   └── sites/              # Site-specific DOM handlers
│       ├── types.ts        # SiteHandler interface
│       ├── index.ts        # Handler registry
│       ├── chatgpt.ts      # ChatGPT handler
│       ├── claude.ts       # Claude handler
│       ├── gemini.ts       # Gemini handler
│       └── deepseek.ts     # DeepSeek handler
│
├── background/             # Service worker
│   └── service-worker.ts   # Side panel opening, message relay
│
└── lib/                    # Shared utilities
    ├── storage.ts          # Type-safe Chrome storage wrapper
    ├── messaging.ts        # Message passing helpers
    └── api/                # AI provider clients
        ├── types.ts        # AIProviderClient interface, system prompt
        ├── index.ts        # Provider registry, unified API
        ├── anthropic.ts    # Claude client
        ├── openai.ts       # OpenAI client
        ├── gemini.ts       # Gemini client
        └── deepseek.ts     # DeepSeek client

public/
├── manifest.json           # Extension manifest (permissions, content scripts)
└── icons/                  # Extension icons
```

---

## Key Abstractions

### AIProviderClient Interface

Location: `src/lib/api/types.ts`

```typescript
interface AIProviderClient {
  config: AIProviderConfig;
  rephrase(request: RephraseRequest): Promise<RephraseResponse>;
  testConnection(apiKey: string): Promise<TestConnectionResult>;
}

interface AIProviderConfig {
  name: string;
  displayName: string;
  models: ModelOption[];
  defaultModel: string;
}

interface RephraseRequest {
  prompt: string;
  apiKey: string;
  model: string;
}

interface RephraseResponse {
  success: boolean;
  rephrased?: string;
  error?: string;
}
```

All AI providers implement this interface for consistent behavior.

### SiteHandler Interface

Location: `src/content/sites/types.ts`

```typescript
interface SiteHandler {
  name: string;
  hostPatterns: string[];
  getInputElement(): HTMLElement | null;
  getPromptText(): string;
  setPromptText(text: string): void;
  getButtonContainer(): HTMLElement | null;
}
```

Each supported AI chat site has a handler implementing this interface for DOM interactions.

### Message Types

Location: `src/lib/messaging.ts`

```typescript
type MessageType =
  | "OPEN_SIDEPANEL" // Request to open side panel
  | "PROMPT_CAPTURED" // Prompt text captured from page
  | "UPDATE_PROMPT" // Update prompt in page input
  | "SIDEPANEL_READY" // Side panel mounted and ready
  | "GET_CURRENT_PROMPT" // Request current prompt
  | "REPHRASE_COMPLETE"; // Rephrasing finished
```

---

## Build System & Commands

### Commands

| Command                 | Purpose                                   |
| ----------------------- | ----------------------------------------- |
| `npm run dev`           | Watch mode (main build only)              |
| `npm run build`         | Full production build (both builds)       |
| `npm run build:main`    | Build sidepanel, options, background only |
| `npm run build:content` | Build content script only                 |

### Dual Vite Configuration

This project uses **two separate Vite configs**:

1. **`vite.config.ts`** - Main build

   - Builds: sidepanel, options page, service worker
   - Output: ES modules with code splitting

2. **`vite.config.content.ts`** - Content script build
   - Builds: content script only
   - Output: **IIFE** (Immediately Invoked Function Expression)
   - Self-contained, no external imports

**Important**: `npm run build` runs BOTH builds. Always use this for full builds.

---

## Extension Guides

### Adding a New AI Provider

1. **Add provider type** in `src/lib/storage.ts`:

   ```typescript
   export type AIProvider =
     | "anthropic"
     | "openai"
     | "gemini"
     | "deepseek"
     | "newprovider";
   ```

2. **Add provider config** in `src/lib/api/types.ts`:

   ```typescript
   export const PROVIDER_CONFIGS: Record<string, AIProviderConfig> = {
     // ... existing providers
     newprovider: {
       name: "newprovider",
       displayName: "New Provider",
       defaultModel: "model-name",
       models: [
         { id: "model-name", name: "Model Name", description: "Description" },
       ],
     },
   };
   ```

3. **Create client file** `src/lib/api/newprovider.ts`:

   ```typescript
   import { AIProviderClient, PROVIDER_CONFIGS, ... } from './types';

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

4. **Register in provider registry** `src/lib/api/index.ts`:

   ```typescript
   import { newproviderClient } from "./newprovider";

   const providers: Record<AIProvider, AIProviderClient> = {
     // ... existing providers
     newprovider: newproviderClient,
   };
   ```

5. **Add host permission** in `public/manifest.json`:

   ```json
   "host_permissions": [
     "https://api.newprovider.com/*"
   ]
   ```

6. **Update storage defaults** if needed in `src/lib/storage.ts`.

### Adding a New Site Handler

1. **Create handler file** `src/content/sites/newsite.ts`:

   ```typescript
   import type { SiteHandler } from "./types";

   export const newsiteHandler: SiteHandler = {
     name: "New Site",
     hostPatterns: ["newsite.com", "chat.newsite.com"],

     getInputElement(): HTMLElement | null {
       return document.querySelector("textarea#prompt-input");
     },

     getPromptText(): string {
       const input = this.getInputElement();
       return input instanceof HTMLTextAreaElement ? input.value : "";
     },

     setPromptText(text: string): void {
       const input = this.getInputElement();
       if (input instanceof HTMLTextAreaElement) {
         input.value = text;
         input.dispatchEvent(new Event("input", { bubbles: true }));
         input.focus();
       }
     },

     getButtonContainer(): HTMLElement | null {
       return this.getInputElement()?.closest("form") || null;
     },
   };
   ```

2. **Register in handler registry** `src/content/sites/index.ts`:

   ```typescript
   import { newsiteHandler } from "./newsite";

   const handlers: SiteHandler[] = [
     // ... existing handlers
     newsiteHandler,
   ];
   ```

3. **Add content script match pattern** in `public/manifest.json`:
   ```json
   "content_scripts": [{
     "matches": [
       "https://newsite.com/*",
       "https://chat.newsite.com/*"
     ]
   }]
   ```

---

## Critical Pitfalls & Gotchas

### Content Script Isolation (CRITICAL)

The content script builds as a **self-contained IIFE** with no ES module imports at runtime.

- **Why**: Chrome content scripts cannot use ES modules for top-level imports
- **How**: Vite bundles everything into a single IIFE file
- **Gotcha**: If content script fails to load, check for import statements that aren't being bundled
- **Build config**: Uses `vite.config.content.ts` with `lib.formats: ['iife']`

### Dual Build System

- **Must run BOTH builds** for full extension update
- `npm run build` does this automatically
- `npm run build:main` alone **won't update content script**
- `npm run build:content` alone **won't update sidepanel/options/background**
- Watch mode (`npm run dev`) **only covers main build** - content script changes require manual rebuild

### Chrome API Patterns

**Message Passing Flow**:

```
Content Script  ──sendToBackground()──►  Service Worker
                                              │
Side Panel     ──sendToBackground()──►        │
                                              ▼
Service Worker ──chrome.tabs.sendMessage()──► Content Script
```

**Async Response Handling**:

```typescript
// In message handler, return `true` for async responses
onMessage((message, sender, sendResponse) => {
  if (message.type === "SOME_ASYNC_ACTION") {
    doAsyncWork().then((result) => sendResponse(result));
    return true; // CRITICAL: keeps message channel open
  }
  return false;
});
```

**Side Panel Initialization**:

- Side panel must send `SIDEPANEL_READY` on mount
- Service worker stores pending prompt and returns it on `SIDEPANEL_READY`
- This handles race condition between button click and panel mount

### React Event Dispatching

When setting input values programmatically on React-based sites:

```typescript
input.value = text;
input.dispatchEvent(new Event("input", { bubbles: true })); // Required!
input.focus();
```

Without the event dispatch, React won't detect the change.

---

## Important Files Quick Reference

| File                               | Purpose                                            |
| ---------------------------------- | -------------------------------------------------- |
| `src/lib/api/types.ts`             | Provider interface, system prompt, configs         |
| `src/content/sites/types.ts`       | Site handler interface                             |
| `src/lib/storage.ts`               | Storage schema, `AIProvider` type union            |
| `src/lib/messaging.ts`             | Message types, send/receive helpers                |
| `public/manifest.json`             | Permissions, host patterns, content script matches |
| `vite.config.ts`                   | Main build (sidepanel, options, background)        |
| `vite.config.content.ts`           | Content script build (IIFE)                        |
| `src/sidepanel/App.tsx`            | Main UI component, state management                |
| `src/background/service-worker.ts` | Message relay, side panel control                  |

---

## Code Conventions

### TypeScript

- Strict mode enabled (`strict: true` in tsconfig)
- No unused locals or parameters
- Explicit return types on public functions

### Naming

- `camelCase` for functions, variables, file names
- `PascalCase` for React components, types, interfaces
- Component files match component name: `PromptEditor.tsx` exports `PromptEditor`

### CSS

- BEM-style naming: `block__element`, `block__element--modifier`
- Examples: `header__title`, `error-banner__icon`, `button--primary`
- Design tokens for colors, fonts, spacing

### React

- Functional components with hooks
- `useCallback` for handlers passed to children
- `useEffect` for side effects and subscriptions

### Async

- Prefer `async/await` over raw promises
- Use type-safe storage wrapper (never use `chrome.storage` directly)

---

## Testing & Debugging

### Manual Testing Workflow

1. Run `npm run build`
2. Go to `chrome://extensions`
3. Enable "Developer mode"
4. Click "Load unpacked" (first time) or click refresh icon (subsequent)
5. Visit a supported AI chat site
6. Test button appearance and functionality

### Debugging Tips

**Content Script**:

- Logs prefixed with `"Prompt Auditor:"`
- Open DevTools on the AI chat page, check Console
- Filter by "Prompt Auditor" to find relevant logs

**Service Worker**:

- Go to `chrome://extensions`
- Find Prompt Auditor, click "service worker" link
- Opens DevTools for background script

**Side Panel**:

- Right-click in side panel → "Inspect"
- Opens separate DevTools for side panel page

**Common Issues**:
| Issue | Likely Cause |
|-------|-------------|
| Button not appearing | Content script not loaded, check manifest matches |
| Side panel not opening | Chrome version < 116, missing `sidePanel` permission |
| API errors | Invalid API key, check options page |
| Prompt not captured | Site handler selectors out of date |
| Changes not reflected | Need to rebuild and reload extension |

---

## System Prompt

The rephrasing system prompt is defined in `src/lib/api/types.ts`:

```
ROLE
You are Prompt Auditor. Rewrite the user's prompt to maximize neutrality
and critical rigor while preserving the original subject and specific claims.

INSTRUCTIONS
- Identify and neutralize: leading premises; emotional loading;
  validation-seeking; false dichotomies; unspecified appeals to authority/consensus.
- Preserve specificity; do not over-abstract or change the topic.
- Reframe assertions as questions or hypotheses to examine.
- Explicitly request both counter-arguments or alternative interpretations
  and evidence or reasoning for and against the premise.
...
```

The full prompt includes few-shot examples for consistent output format.
