# Privacy Policy

**Prompt Auditor** - Chrome Extension
**Last Updated**: December 23, 2024

## Overview

Prompt Auditor is a browser extension that helps users rephrase AI prompts to get more objective responses. This privacy policy explains how the extension handles your data.

## Data Collection

**We do not collect any personal data.** The extension operates entirely within your browser.

### What We Store Locally

The following data is stored **locally in your browser** using Chrome's storage API:

- **API Keys**: Your API keys for AI providers (Anthropic, OpenAI, Google, DeepSeek) are stored locally in Chrome storage to enable prompt rephrasing functionality
- **Provider Preference**: Your selected AI provider preference

This data never leaves your device except when making API calls to your chosen AI provider.

### What We Do NOT Collect

- No analytics or usage tracking
- No personal information
- No browsing history
- No prompt content or conversation data
- No cookies or tracking pixels

## Data Transmission

The extension makes API calls **only** to the AI provider you have configured:

- `api.anthropic.com` (Anthropic/Claude)
- `api.openai.com` (OpenAI)
- `generativelanguage.googleapis.com` (Google Gemini)
- `api.deepseek.com` (DeepSeek)

These calls are made directly from your browser to the respective API endpoint using your own API key. We do not operate any intermediary servers.

### What Is Sent to AI Providers

When you use the "Audit Prompt" feature, your prompt text is sent to your chosen AI provider for rephrasing. This is subject to that provider's privacy policy:

- [Anthropic Privacy Policy](https://www.anthropic.com/privacy)
- [OpenAI Privacy Policy](https://openai.com/privacy)
- [Google Privacy Policy](https://policies.google.com/privacy)
- [DeepSeek Privacy Policy](https://www.deepseek.com/privacy)

## Data Security

- API keys are stored in Chrome's local storage
- No data is transmitted to our servers
- All API communications use HTTPS encryption

## Your Rights

You can:

- **View your stored data**: Check Chrome's extension storage via DevTools
- **Delete your data**: Remove the extension to delete all stored data, or clear data via the extension's settings
- **Control API access**: You can revoke API keys at any time through each provider's dashboard

## Third-Party Services

The extension integrates with third-party AI providers. Their use of your data is governed by their respective privacy policies (linked above).

## Changes to This Policy

We may update this privacy policy from time to time. Changes will be reflected in the "Last Updated" date above.

## Contact

For privacy-related questions or concerns:

- **GitHub Issues**: [github.com/kmelkon/prompt-auditor/issues](https://github.com/kmelkon/prompt-auditor/issues)
- **Email**: [Your email - optional]

## Consent

By using Prompt Auditor, you consent to this privacy policy.
