// Claude.ai-specific selectors and handlers

import type { SiteHandler } from './types';

export const claudeHandler: SiteHandler = {
  name: 'Claude',
  hostPatterns: ['claude.ai'],

  getInputElement(): HTMLElement | null {
    // Claude uses contenteditable divs - try multiple selectors
    // The main input area with placeholder text
    const selectors = [
      'div[contenteditable="true"].ProseMirror',
      'div.ProseMirror[contenteditable="true"]',
      'div[contenteditable="true"][data-placeholder]',
      'fieldset div[contenteditable="true"]',
      'div[contenteditable="true"]',
    ];

    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element) {
        return element as HTMLElement;
      }
    }

    return null;
  },

  getPromptText(): string {
    const input = this.getInputElement();
    if (!input) return '';

    // Get text content, handling ProseMirror structure
    const paragraphs = input.querySelectorAll('p');
    if (paragraphs.length > 0) {
      return Array.from(paragraphs)
        .map((p) => p.textContent || '')
        .join('\n')
        .trim();
    }

    return input.textContent?.trim() || '';
  },

  setPromptText(text: string): void {
    const input = this.getInputElement();
    if (!input) return;

    // For ProseMirror, we need to handle it carefully
    input.innerHTML = '';

    // Create paragraphs for each line
    const lines = text.split('\n');
    lines.forEach((line) => {
      const p = document.createElement('p');
      p.textContent = line || '\u200B';
      input.appendChild(p);
    });

    // Trigger input event
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.focus();

    // Move cursor to end
    const selection = window.getSelection();
    if (selection) {
      selection.selectAllChildren(input);
      selection.collapseToEnd();
    }
  },

  getButtonContainer(): HTMLElement | null {
    const input = this.getInputElement();
    if (!input) return null;

    // Find the outer container that holds the input area
    // Try to find a suitable parent that we can position relative to
    const fieldset = input.closest('fieldset');
    if (fieldset) return fieldset as HTMLElement;

    // Look for a parent with specific styling (the rounded input box)
    let parent = input.parentElement;
    for (let i = 0; i < 5 && parent; i++) {
      // Look for a container with reasonable dimensions
      const rect = parent.getBoundingClientRect();
      if (rect.width > 300 && rect.height > 50) {
        return parent as HTMLElement;
      }
      parent = parent.parentElement;
    }

    return input.parentElement;
  },
};
