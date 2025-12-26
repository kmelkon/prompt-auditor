# Privacy Policy

**Prompt Auditor** - Chrome Extension
**Last Updated**: December 26, 2024

## Overview

Prompt Auditor is a browser extension that helps users rephrase AI prompts to get more objective responses. This privacy policy explains how the extension collects, handles, stores, and shares your data.

---

## 1. Data Collection

### Data We Collect

Prompt Auditor collects and stores the following data **locally on your device**:

| Data Type | Purpose | Stored Where |
|-----------|---------|--------------|
| API Keys | To authenticate with your chosen AI provider | Chrome local storage (on your device) |
| Provider Preference | To remember your selected AI provider | Chrome local storage (on your device) |
| Model Selection | To remember your preferred AI model | Chrome local storage (on your device) |

### Data We Do NOT Collect

- **No personal information** (name, email, address, etc.)
- **No browsing history** or browsing activity
- **No analytics or usage tracking**
- **No prompt content** is stored (prompts are sent directly to AI providers and not retained)
- **No cookies or tracking pixels**
- **No data is sent to our servers** (we do not operate any servers)

---

## 2. Data Handling

### How We Use Your Data

- **API Keys**: Used solely to authenticate API requests to your chosen AI provider when you click "Audit Prompt"
- **Provider/Model Preferences**: Used to remember your settings between browser sessions
- **Prompt Text**: When you click "Audit Prompt", your prompt text is sent directly to your chosen AI provider for rephrasing. This text is NOT stored by the extension.

### Data Processing

All data processing occurs locally in your browser. The extension does not process your data on any external servers owned or operated by us.

---

## 3. Data Storage

### Where Your Data Is Stored

All data is stored **locally on your device** using Chrome's built-in `storage.local` API. This means:

- Data remains on your computer/device
- Data is not synced to the cloud (we use `storage.local`, not `storage.sync`)
- Data is automatically deleted when you uninstall the extension

### Storage Security

- API keys are stored in plaintext in Chrome's local storage area
- Only the Prompt Auditor extension can access this storage area
- No data is transmitted to external servers for storage

### Data Retention

- Data is retained until you manually delete it or uninstall the extension
- You can delete your data at any time via the extension's settings page

---

## 4. Data Sharing

### Third-Party Data Sharing

**We do not sell, trade, or share your data with third parties.**

The only data transmission occurs when you explicitly use the "Audit Prompt" feature:

| Recipient | Data Shared | Purpose |
|-----------|-------------|---------|
| Your chosen AI provider | Prompt text, API key | To rephrase your prompt |

### AI Provider API Calls

When you use the rephrasing feature, your prompt text is sent directly from your browser to one of these AI provider APIs (based on your selection):

- `api.anthropic.com` (Anthropic/Claude)
- `api.openai.com` (OpenAI)
- `generativelanguage.googleapis.com` (Google Gemini)
- `api.deepseek.com` (DeepSeek)

These calls are made directly from your browser. We do not operate any intermediary servers. The AI provider's handling of your data is governed by their privacy policies:

- [Anthropic Privacy Policy](https://www.anthropic.com/privacy)
- [OpenAI Privacy Policy](https://openai.com/privacy)
- [Google Privacy Policy](https://policies.google.com/privacy)
- [DeepSeek Privacy Policy](https://www.deepseek.com/privacy)

---

## 5. Data Security

We implement the following security measures:

- **HTTPS encryption**: All API communications use secure HTTPS connections
- **No server transmission**: Your data is never sent to servers owned by us
- **Isolated storage**: Chrome's extension storage is isolated from other extensions and websites
- **Manifest V3**: Built on Chrome's latest, most secure extension platform

---

## 6. Your Rights and Choices

You have full control over your data:

- **View your data**: Access Chrome DevTools > Application > Extension Storage to view stored data
- **Delete your data**: Use the extension's settings page to clear API keys, or uninstall the extension to remove all data
- **Revoke API access**: Revoke your API keys through each provider's dashboard at any time
- **Opt out**: Simply don't use the "Audit Prompt" feature if you don't want data sent to AI providers

---

## 7. Children's Privacy

Prompt Auditor is not directed at children under 13. We do not knowingly collect personal information from children.

---

## 8. Changes to This Policy

We may update this privacy policy from time to time. Changes will be reflected in the "Last Updated" date at the top of this document. Continued use of the extension after changes constitutes acceptance of the updated policy.

---

## 9. Contact Information

For privacy-related questions, concerns, or requests:

- **Email**: kmelkon@gmail.com
- **GitHub Issues**: [github.com/kmelkon/prompt-auditor/issues](https://github.com/kmelkon/prompt-auditor/issues)
- **Developer**: Karam Malkon

---

## 10. Consent

By installing and using Prompt Auditor, you consent to this privacy policy.
