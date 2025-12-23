// DeepSeek-specific selectors and handlers

import type { SiteHandler } from './types';

export const deepseekHandler: SiteHandler = {
  name: 'DeepSeek',
  hostPatterns: ['chat.deepseek.com'],

  getInputElement(): HTMLElement | null {
    // DeepSeek typically uses a standard textarea
    return (
      document.querySelector('textarea[placeholder*="message"]') ||
      document.querySelector('textarea') ||
      document.querySelector('div[contenteditable="true"]')
    );
  },

  getPromptText(): string {
    const input = this.getInputElement();
    if (!input) return '';

    if (input instanceof HTMLTextAreaElement) {
      return input.value;
    }

    return input.textContent || '';
  },

  setPromptText(text: string): void {
    const input = this.getInputElement();
    if (!input) return;

    if (input instanceof HTMLTextAreaElement) {
      input.value = text;
      input.dispatchEvent(new Event('input', { bubbles: true }));
    } else {
      input.textContent = text;
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }

    input.focus();
  },

  getButtonContainer(): HTMLElement | null {
    const input = this.getInputElement();
    if (!input) return null;

    return input.closest('form') || input.parentElement;
  },
};
