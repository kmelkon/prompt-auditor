// Message passing helpers for communication between content script, background, and sidepanel

export type MessageType =
  | 'OPEN_SIDEPANEL'
  | 'PROMPT_CAPTURED'
  | 'REPHRASE_COMPLETE'
  | 'UPDATE_PROMPT'
  | 'GET_CURRENT_PROMPT'
  | 'SIDEPANEL_READY';

export interface Message<T = unknown> {
  type: MessageType;
  payload?: T;
}

export interface PromptPayload {
  text: string;
  site: string;
}

export interface RephrasePayload {
  original: string;
  rephrased: string;
}

// Send message to background script
export async function sendToBackground<T>(message: Message<T>): Promise<unknown> {
  return chrome.runtime.sendMessage(message);
}

// Send message to content script in active tab
export async function sendToContentScript<T>(message: Message<T>): Promise<unknown> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab?.id) {
    return chrome.tabs.sendMessage(tab.id, message);
  }
  throw new Error('No active tab found');
}

// Send message to all extension pages (sidepanel, options, etc.)
export function broadcastToExtension<T>(message: Message<T>): void {
  chrome.runtime.sendMessage(message).catch(() => {
    // Ignore errors if no listeners
  });
}

// Listen for messages
export function onMessage(
  callback: (
    message: Message,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response?: unknown) => void
  ) => boolean | void
): void {
  chrome.runtime.onMessage.addListener(callback);
}

// Create typed message helpers
export function createOpenSidepanelMessage(): Message {
  return { type: 'OPEN_SIDEPANEL' };
}

export function createPromptCapturedMessage(payload: PromptPayload): Message<PromptPayload> {
  return { type: 'PROMPT_CAPTURED', payload };
}

export function createUpdatePromptMessage(text: string): Message<{ text: string }> {
  return { type: 'UPDATE_PROMPT', payload: { text } };
}

export function createSidepanelReadyMessage(): Message {
  return { type: 'SIDEPANEL_READY' };
}
