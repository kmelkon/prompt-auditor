# Changelog

All notable changes to Prompt Auditor will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Comprehensive test suite with Vitest
  - Unit tests for storage utilities (100% coverage)
  - Unit tests for API clients (Anthropic, OpenAI)
  - Chrome API mocks for testing
  - Coverage reporting (>94% coverage)
- Documentation improvements
  - Comprehensive README.md with installation and usage guides
  - CONTRIBUTING.md with development guidelines
  - CHANGELOG.md for tracking changes
  - Improved inline code documentation

### Changed
- Package.json updated with test scripts
- Development workflow improvements

### In Progress
- Gemini API client implementation
- DeepSeek API client implementation
- ESLint and Prettier setup
- CI/CD pipeline with GitHub Actions
- Enhanced error handling with retry logic

## [1.0.0] - 2024-12-23

### Added
- Initial release of Prompt Auditor Chrome extension
- Core rephrasing functionality
- Support for 4 AI providers:
  - ✅ Anthropic (Claude) - Full implementation
  - ✅ OpenAI (ChatGPT) - Full implementation
  - ⚠️ Google Gemini - Scaffolded
  - ⚠️ DeepSeek - Scaffolded
- Chrome Side Panel integration
- Support for major AI chat sites:
  - claude.ai
  - chatgpt.com / chat.openai.com
  - gemini.google.com
  - chat.deepseek.com
- Settings page with API key management
- Connection testing for API keys
- Editorial/refined design aesthetic with IBM Plex fonts
- Content script button injection
- Prompt capture and replacement functionality
- Privacy-first architecture (no backend server)

### Technical Details
- React 18 for UI components
- TypeScript with strict mode
- Vite build system (dual config for main + content script)
- Chrome Manifest V3
- Chrome Side Panel API (requires Chrome 116+)
- Type-safe Chrome storage wrapper
- Modular API client architecture

### Known Limitations
- Gemini and DeepSeek providers not yet implemented
- No testing infrastructure in initial release
- No keyboard shortcuts
- No prompt history
- No settings import/export
- Manual extension loading required (not in Chrome Web Store)

---

## Version History

### Version Numbering

We use [Semantic Versioning](https://semver.org/):
- **MAJOR**: Incompatible API changes
- **MINOR**: New functionality (backwards compatible)
- **PATCH**: Bug fixes (backwards compatible)

### Release Types

- **[Unreleased]**: Changes in development
- **[X.Y.Z]**: Released versions with date

### Change Categories

- **Added**: New features
- **Changed**: Changes to existing functionality
- **Deprecated**: Soon-to-be removed features
- **Removed**: Removed features
- **Fixed**: Bug fixes
- **Security**: Security improvements

---

## Future Releases

### Planned for v1.1.0
- Complete Gemini API client implementation
- Complete DeepSeek API client implementation
- ESLint and Prettier code quality tools
- CI/CD pipeline with GitHub Actions
- Enhanced error handling with retry logic
- Test coverage >80%

### Planned for v1.2.0
- Keyboard shortcuts support
- Prompt history and favorites
- Settings import/export with encryption
- Better error messages and recovery options
- Side-by-side comparison view

### Planned for v1.3.0
- Additional site support (Perplexity, Poe, etc.)
- Custom system prompt templates
- Usage statistics dashboard
- Performance optimizations
- Accessibility improvements

### Long-term Roadmap
- Firefox and Edge support
- Local LLM integration (Ollama, LM Studio)
- Advanced prompt analysis features
- Collaborative features (shared prompts)
- Chrome Web Store publication

---

## Migration Guides

### Migrating to 1.x from 0.x

No migrations needed - this is the initial stable release.

---

## Links

- [GitHub Repository](https://github.com/kmelkon/prompt-auditor)
- [Issue Tracker](https://github.com/kmelkon/prompt-auditor/issues)
- [Pull Requests](https://github.com/kmelkon/prompt-auditor/pulls)
- [Releases](https://github.com/kmelkon/prompt-auditor/releases)
