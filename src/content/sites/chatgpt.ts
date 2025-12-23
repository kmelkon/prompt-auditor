// ChatGPT-specific selectors and handlers

import type { SiteHandler } from './types';

export const chatgptHandler: SiteHandler = {
  name: 'ChatGPT',
  hostPatterns: ['chat.openai.com', 'chatgpt.com'],

  getInputElement(): HTMLElement | null {
    // ChatGPT uses a contenteditable div or textarea
    return (
      document.querySelector('#prompt-textarea') ||
      document.querySelector('textarea[data-id="root"]') ||
      document.querySelector('div[contenteditable="true"][data-placeholder]')
    );
  },

  getPromptText(): string {
    const input = this.getInputElement();
    if (!input) return '';

    if (input instanceof HTMLTextAreaElement) {
      return input.value;
    }

    // contenteditable div
    return input.textContent || '';
  },

  setPromptText(text: string): void {
    const input = this.getInputElement();
    if (!input) return;

    if (input instanceof HTMLTextAreaElement) {
      input.value = text;
      // Trigger input event for React to pick up the change
      input.dispatchEvent(new Event('input', { bubbles: true }));
    } else {
      // contenteditable div
      input.textContent = text;
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }

    // Focus the input
    input.focus();
  },

  getButtonContainer(): HTMLElement | null {
    const input = this.getInputElement();
    if (!input) return null;

    // Find the form or parent container
    return input.closest('form') || input.parentElement;
  },
};
