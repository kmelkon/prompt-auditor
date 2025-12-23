// Site handler registry

import type { SiteHandler } from './types';
import { chatgptHandler } from './chatgpt';
import { claudeHandler } from './claude';
import { geminiHandler } from './gemini';
import { deepseekHandler } from './deepseek';

const handlers: SiteHandler[] = [
  chatgptHandler,
  claudeHandler,
  geminiHandler,
  deepseekHandler,
];

export function getSiteHandler(): SiteHandler | null {
  const hostname = window.location.hostname;

  for (const handler of handlers) {
    if (handler.hostPatterns.some((pattern) => hostname.includes(pattern))) {
      return handler;
    }
  }

  return null;
}

export function getSiteName(): string {
  const handler = getSiteHandler();
  return handler?.name || 'Unknown';
}

export type { SiteHandler };
