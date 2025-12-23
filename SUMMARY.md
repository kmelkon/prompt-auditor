# Prompt Auditor - Chrome Extension

## Overview
A Chrome extension that helps users rephrase their AI prompts to avoid sycophancy and get more honest responses from AI systems.

## Features
- **Floating "Audit Prompt" button** appears on supported AI chat sites
- **Chrome Side Panel UI** for reviewing and rephrasing prompts
- **4 AI Provider Support**: Claude (Anthropic), OpenAI, Gemini, DeepSeek
- **Auto-detects prompts** from the chat input field
- **Settings page** with API key management and connection testing
- **Privacy-focused**: All API calls made directly from extension using user's own keys

## Supported Sites
- claude.ai
- chatgpt.com / chat.openai.com
- gemini.google.com
- chat.deepseek.com

## Tech Stack
- **Build**: Vite + TypeScript
- **UI**: React 18
- **Styling**: CSS with design tokens (Editorial/Refined style)
- **Chrome APIs**: Side Panel API, Storage API, Tabs API
- **Manifest**: V3

## Project Structure
```
prompt-auditor/
├── dist/                    # Built extension (load in Chrome)
├── src/
│   ├── sidepanel/          # React sidebar UI
│   │   ├── App.tsx
│   │   ├── components/     # PromptEditor, RephrasedResult, etc.
│   │   └── styles/
│   ├── options/            # Settings page (React)
│   │   └── Options.tsx
│   ├── content/            # Content script
│   │   ├── content.ts      # Button injection & messaging
│   │   ├── content.css     # Floating button styles
│   │   └── sites/          # Site-specific handlers
│   ├── background/         # Service worker
│   │   └── service-worker.ts
│   └── lib/
│       ├── storage.ts      # Chrome storage wrapper
│       ├── messaging.ts    # Message passing helpers
│       └── api/            # AI provider clients
│           ├── anthropic.ts
│           ├── openai.ts
│           ├── gemini.ts
│           └── deepseek.ts
├── public/
│   ├── manifest.json
│   └── icons/
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## Design Decisions

### Editorial/Refined Style
- **Typography**: IBM Plex font family (Serif, Sans, Mono)
- **Colors**: Warm off-white (#FDFBF7), near-black text (#1A1A1A), muted gold accent (#C4A35A)
- **UI**: Clean, focused, professional editor vibe

### Architecture
- Content script is self-contained (no external imports) for Chrome compatibility
- Background service worker handles side panel opening and message relay
- Modular API client architecture for easy provider addition

### Rephrasing System Prompt
The extension uses this prompt to analyze and rephrase user prompts:
> "Analyze the following prompt and rewrite it to be more neutral, direct, and less leading. Remove or rephrase: leading questions, excessive praise/flattery, loaded assumptions, emotional manipulation."

## Installation & Usage

### Build
```bash
cd prompt-auditor
npm install
npm run build
```

### Load in Chrome
1. Go to `chrome://extensions`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `dist` folder

### Configure
1. Click extension icon → Settings (gear icon)
2. Select your AI provider
3. Enter your API key
4. Test connection
5. Save

### Use
1. Visit any supported AI chat site
2. Type your prompt
3. Click "Audit Prompt" button (bottom-right)
4. Side panel opens with rephrased suggestion
5. Click "Use This" to replace your prompt

## Development
```bash
npm run dev    # Watch mode
npm run build  # Production build
```

## Key Files
| File | Purpose |
|------|---------|
| `src/content/content.ts` | Injects button, captures prompts |
| `src/content/sites/*.ts` | Site-specific DOM selectors |
| `src/sidepanel/App.tsx` | Main sidebar React app |
| `src/lib/api/anthropic.ts` | Claude API client |
| `src/background/service-worker.ts` | Side panel & message handling |

## Troubleshooting
- **Button not appearing**: Refresh the page, check console for "Prompt Auditor:" messages
- **Side panel not opening**: Ensure Chrome 116+ is installed
- **API errors**: Verify API key in settings, test connection
