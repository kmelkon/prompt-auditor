// Google Gemini-specific selectors and handlers

import type { SiteHandler } from './types';

export const geminiHandler: SiteHandler = {
  name: 'Gemini',
  hostPatterns: ['gemini.google.com'],

  getInputElement(): HTMLElement | null {
    // Gemini uses a rich text input
    return (
      document.querySelector('rich-textarea .ql-editor') ||
      document.querySelector('div[contenteditable="true"][aria-label*="prompt"]') ||
      document.querySelector('div[contenteditable="true"]')
    );
  },

  getPromptText(): string {
    const input = this.getInputElement();
    if (!input) return '';

    return input.textContent || '';
  },

  setPromptText(text: string): void {
    const input = this.getInputElement();
    if (!input) return;

    input.textContent = text;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.focus();
  },

  getButtonContainer(): HTMLElement | null {
    const input = this.getInputElement();
    if (!input) return null;

    // Find the input container
    return input.closest('.input-area') || input.closest('form') || input.parentElement;
  },
};
