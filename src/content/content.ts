// Content script for Prompt Auditor
// Injects UI into AI chat pages and handles prompt capture/update
// Note: This file is self-contained - no external imports for Chrome content script compatibility

import { getSiteHandler, getSiteName } from './sites';

// Inline messaging helpers (can't import from lib in content scripts)
function sendToBackground(message: { type: string; payload?: unknown }): Promise<unknown> {
  return chrome.runtime.sendMessage(message);
}

function onMessage(
  callback: (
    message: { type: string; payload?: unknown },
    sender: chrome.runtime.MessageSender,
    sendResponse: (response?: unknown) => void
  ) => boolean | void
): void {
  chrome.runtime.onMessage.addListener(callback);
}

const BUTTON_ID = 'prompt-auditor-button';
const BUTTON_CONTAINER_ID = 'prompt-auditor-container';

// Create and inject the Prompt Auditor button
function createButton(): HTMLDivElement {
  const container = document.createElement('div');
  container.id = BUTTON_CONTAINER_ID;

  const button = document.createElement('button');
  button.id = BUTTON_ID;
  button.type = 'button';
  button.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>
    <span>Audit Prompt</span>
  `;
  button.title = 'Open Prompt Auditor - Rephrase your prompt to avoid sycophancy';
  button.addEventListener('click', handleButtonClick);

  container.appendChild(button);
  return container;
}

// Handle button click - capture prompt and open sidepanel
async function handleButtonClick(e: Event): Promise<void> {
  e.preventDefault();
  e.stopPropagation();

  const handler = getSiteHandler();
  if (!handler) {
    console.warn('Prompt Auditor: No handler found for this site');
    return;
  }

  const promptText = handler.getPromptText();
  const siteName = getSiteName();

  console.log('Prompt Auditor: Capturing prompt', { text: promptText, site: siteName });

  // Send prompt to background and open sidepanel
  try {
    await sendToBackground({
      type: 'PROMPT_CAPTURED',
      payload: { text: promptText, site: siteName },
    });

    await sendToBackground({ type: 'OPEN_SIDEPANEL' });
  } catch (error) {
    console.error('Prompt Auditor: Failed to open sidepanel', error);
  }
}

// Inject button into the page
function injectButton(): void {
  // Check if button already exists
  if (document.getElementById(BUTTON_CONTAINER_ID)) {
    console.log('Prompt Auditor: Button already exists');
    return;
  }

  const handler = getSiteHandler();
  if (!handler) {
    console.log('Prompt Auditor: No handler for this site');
    return;
  }

  // Wait a bit for the page to fully load
  const input = handler.getInputElement();
  if (!input) {
    console.log('Prompt Auditor: Input element not found yet, will retry');
    return;
  }

  console.log('Prompt Auditor: Found input element, injecting button');

  const buttonContainer = createButton();
  document.body.appendChild(buttonContainer);

  console.log('Prompt Auditor: Button injected successfully');
}

// Watch for DOM changes to re-inject button if needed (SPAs)
function setupMutationObserver(): void {
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;

  const observer = new MutationObserver(() => {
    // Debounce to avoid too many checks
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      const handler = getSiteHandler();
      if (!handler) return;

      const input = handler.getInputElement();
      const button = document.getElementById(BUTTON_CONTAINER_ID);

      // If input exists but button doesn't, inject it
      if (input && !button) {
        injectButton();
      }
    }, 500);
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
}

// Listen for messages from sidepanel/background
onMessage((message, _sender, sendResponse) => {
  switch (message.type) {
    case 'UPDATE_PROMPT': {
      const handler = getSiteHandler();
      if (handler && message.payload) {
        const { text } = message.payload as { text: string };
        handler.setPromptText(text);
        sendResponse({ success: true });
      } else {
        sendResponse({ success: false, error: 'No site handler or payload' });
      }
      break;
    }

    case 'GET_CURRENT_PROMPT': {
      const handler = getSiteHandler();
      if (handler) {
        sendResponse({
          text: handler.getPromptText(),
          site: getSiteName(),
        });
      } else {
        sendResponse({ text: '', site: '' });
      }
      break;
    }

    default:
      break;
  }

  return false;
});

// Initialize with retry
function init(): void {
  console.log('Prompt Auditor: Initializing content script');

  const tryInject = () => {
    injectButton();
    setupMutationObserver();
  };

  // Wait for page to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', tryInject);
  } else {
    // Also add a small delay for SPAs
    setTimeout(tryInject, 500);
    // And retry after a longer delay in case the page takes time to load
    setTimeout(tryInject, 2000);
  }
}

init();

console.log('Prompt Auditor: Content script loaded for', window.location.hostname);
