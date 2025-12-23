# Prompt Auditor

> Rephrase AI prompts to avoid sycophancy and get more honest, objective responses from AI systems.

![License](https://img.shields.io/badge/license-MIT-blue)
![Version](https://img.shields.io/badge/version-1.0.0-green)
![Chrome](https://img.shields.io/badge/Chrome-116%2B-red)

## Overview

Prompt Auditor is a Chrome extension that helps users identify and rephrase biased or leading prompts before submitting them to AI chat interfaces. It analyzes prompts for sycophancy patterns, emotional loading, and leading questions, then suggests more neutral, objective alternatives.

### Key Features

- 🔍 **Automated Prompt Analysis** - Detects leading questions, excessive praise, and biased assumptions
- ✏️ **Smart Rephrasing** - Generates neutral, objective alternatives to your prompts
- 🎯 **Multi-Provider Support** - Works with Claude, ChatGPT, Gemini, and DeepSeek
- 🔐 **Privacy-First** - All API calls made directly from your browser using your own API keys
- ⚡ **Chrome Side Panel** - Seamless integration with supported AI chat sites
- 🎨 **Editorial Design** - Clean, focused interface with IBM Plex typography

### Supported AI Chat Sites

- [Claude.ai](https://claude.ai) (Anthropic)
- [ChatGPT](https://chatgpt.com) / [chat.openai.com](https://chat.openai.com) (OpenAI)
- [Gemini](https://gemini.google.com) (Google)
- [DeepSeek Chat](https://chat.deepseek.com)

## Installation

### For Users

1. **Download the Extension**
   - Download the latest release from the [Releases](https://github.com/kmelkon/prompt-auditor/releases) page
   - Or clone this repository and build it yourself (see Development Setup below)

2. **Load in Chrome**
   ```
   1. Navigate to chrome://extensions
   2. Enable "Developer mode" (toggle in top-right)
   3. Click "Load unpacked"
   4. Select the `dist` folder from the downloaded/built extension
   ```

3. **Configure API Keys**
   ```
   1. Click the extension icon in your toolbar
   2. Click the settings (gear) icon
   3. Select your preferred AI provider
   4. Enter your API key
   5. Click "Test Connection" to verify
   6. Click "Save Key"
   ```

### Getting API Keys

- **Claude (Anthropic)**: [console.anthropic.com](https://console.anthropic.com)
- **OpenAI**: [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
- **Google Gemini**: [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
- **DeepSeek**: [platform.deepseek.com](https://platform.deepseek.com)

## Usage

1. **Visit a supported AI chat site** (e.g., claude.ai, chatgpt.com)
2. **Type your prompt** in the chat input field
3. **Click the "Audit Prompt" button** that appears in the bottom-right
4. **Review the rephrased suggestion** in the side panel
5. **Click "Use This"** to replace your original prompt (or edit it manually)

### Example

**Original Prompt:**
> "Why is TypeScript so much better than JavaScript? Please explain all the reasons why I should use it."

**Rephrased Prompt:**
> "Compare TypeScript and JavaScript for modern web development. Outline the technical trade-offs, focusing on type safety, developer velocity, and maintainability. Include both advantages and disadvantages of each approach."

## Development

### Prerequisites

- Node.js 18+ and npm
- Chrome 116+ (for Side Panel API support)
- A code editor (VS Code recommended)

### Setup

```bash
# Clone the repository
git clone https://github.com/kmelkon/prompt-auditor.git
cd prompt-auditor

# Install dependencies
npm install

# Build the extension
npm run build

# Or run in watch mode for development
npm run dev
```

### Project Structure

```
prompt-auditor/
├── src/
│   ├── sidepanel/          # React UI for side panel
│   │   ├── App.tsx         # Main app component
│   │   └── components/     # UI components
│   ├── options/            # Settings page
│   ├── content/            # Content script (button injection)
│   │   └── sites/          # Site-specific handlers
│   ├── background/         # Service worker
│   └── lib/
│       ├── api/            # AI provider clients
│       ├── storage.ts      # Chrome storage wrapper
│       └── messaging.ts    # Message passing helpers
├── public/
│   ├── manifest.json       # Chrome extension manifest
│   └── icons/              # Extension icons
├── tests/                  # Test suite
├── dist/                   # Built extension (load in Chrome)
└── docs/                   # Additional documentation
```

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Build in watch mode (main build only) |
| `npm run build` | Full production build (both main & content script) |
| `npm run build:main` | Build sidepanel, options, and background |
| `npm run build:content` | Build content script only |
| `npm run test` | Run tests in watch mode |
| `npm run test:run` | Run tests once |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run type-check` | Type check without building |

### Running Tests

```bash
# Run tests in watch mode
npm run test

# Run tests once
npm run test:run

# Generate coverage report
npm run test:coverage

# Open test UI
npm run test:ui
```

### Architecture

For detailed architecture documentation, see:
- [AGENTS.md](./AGENTS.md) - AI agent guide and technical architecture
- [SUMMARY.md](./SUMMARY.md) - Project overview and features

#### Key Design Decisions

**Dual Build System:**
- Main build (Vite): Sidepanel, options page, background worker
- Content script build: Separate IIFE bundle for Chrome compatibility

**Message Passing:**
```
Content Script ──> Background Worker ──> Side Panel
      │                                      │
      └──────────────────────────────────────┘
         (Direct update via chrome.tabs.sendMessage)
```

**Privacy Model:**
- No backend server - all processing client-side
- API keys stored in Chrome local storage
- Direct API calls from browser to AI providers
- No data collection or telemetry

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for:
- Code style guidelines
- Development workflow
- How to add new providers
- How to add new site handlers
- Testing requirements
- Pull request process

### Quick Start for Contributors

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests (`npm run test:run`)
5. Build the extension (`npm run build`)
6. Test manually in Chrome
7. Commit your changes (`git commit -m 'Add amazing feature'`)
8. Push to your branch (`git push origin feature/amazing-feature`)
9. Open a Pull Request

## Roadmap

### Phase 1: Foundation (✅ In Progress)
- [x] Testing infrastructure with Vitest
- [x] Comprehensive documentation
- [ ] Complete Gemini implementation
- [ ] Complete DeepSeek implementation
- [ ] ESLint & Prettier setup
- [ ] CI/CD pipeline

### Phase 2: Enhanced Features
- [ ] Keyboard shortcuts
- [ ] Prompt history & favorites
- [ ] Settings import/export
- [ ] Better error handling with retry logic
- [ ] Side-by-side comparison view

### Phase 3: Expansion
- [ ] Additional AI chat site support (Perplexity, Poe, etc.)
- [ ] Custom system prompt templates
- [ ] Usage statistics dashboard
- [ ] Browser extension for Firefox/Edge

See our [improvement plan](/Users/karmal/.claude/plans/joyful-snacking-pumpkin.md) for detailed roadmap.

## Tech Stack

- **Build Tool**: Vite 6
- **Framework**: React 18
- **Language**: TypeScript (strict mode)
- **Testing**: Vitest + @testing-library/react
- **Styling**: CSS with design tokens
- **Fonts**: IBM Plex (Serif, Sans, Mono)
- **Chrome APIs**: Side Panel, Storage, Tabs

## Troubleshooting

### Button Not Appearing

- Refresh the AI chat page
- Check browser console for "Prompt Auditor:" messages
- Verify the extension is loaded in chrome://extensions
- Ensure you're on a supported site

### Side Panel Not Opening

- Ensure Chrome 116+ is installed
- Check that `sidePanel` permission is granted
- Look for errors in the service worker console (chrome://extensions > service worker link)

### API Errors

- Verify your API key in settings
- Click "Test Connection" to validate
- Check for rate limiting or quota issues
- Review network tab in DevTools for API call details

### Changes Not Reflected After Build

- Run full build: `npm run build` (not just `npm run build:main`)
- Click the refresh icon in chrome://extensions
- Hard refresh the AI chat page (Cmd/Ctrl + Shift + R)

## Security

- API keys are stored in Chrome's local storage (plaintext currently - encryption planned)
- No API keys are logged or transmitted except to the respective AI provider
- Content scripts run in isolated world - no access to page JavaScript
- Manifest V3 for enhanced security

**Security Policy:** See [SECURITY.md](./docs/SECURITY.md)

**Reporting Vulnerabilities:** Please email security@[domain] or open a private security advisory on GitHub.

## License

MIT License - see [LICENSE](./LICENSE) for details.

## Acknowledgments

- Inspired by discussions on AI safety and alignment
- IBM Plex fonts by IBM
- Chrome Extension architecture patterns from Google
- Testing setup inspired by Vitest best practices

## Links

- **GitHub**: [github.com/kmelkon/prompt-auditor](https://github.com/kmelkon/prompt-auditor)
- **Issues**: [github.com/kmelkon/prompt-auditor/issues](https://github.com/kmelkon/prompt-auditor/issues)
- **Documentation**: [/docs](/docs)
- **Changelog**: [CHANGELOG.md](./CHANGELOG.md)

---

Built with ❤️ for more honest AI interactions
