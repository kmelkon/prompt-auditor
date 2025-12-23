// Background service worker for Prompt Auditor
// Handles side panel opening and message relay

import { onMessage, type Message, type PromptPayload } from '../lib/messaging';

// Store the last captured prompt to pass to sidepanel when it opens
let pendingPrompt: PromptPayload | null = null;

// Open side panel when extension icon is clicked
chrome.action.onClicked.addListener(async (tab) => {
  if (tab.id) {
    await chrome.sidePanel.open({ tabId: tab.id });
  }
});

// Set side panel behavior - open on action click
chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch(() => {
  // Ignore errors - this may fail if not supported
});

// Handle messages from content script and sidepanel
onMessage((message: Message, sender, sendResponse) => {
  switch (message.type) {
    case 'OPEN_SIDEPANEL': {
      // Open sidepanel and store pending prompt
      if (message.payload) {
        pendingPrompt = message.payload as PromptPayload;
      }

      const tabId = sender.tab?.id;
      if (tabId) {
        chrome.sidePanel.open({ tabId }).then(() => {
          sendResponse({ success: true });
        }).catch((error) => {
          sendResponse({ success: false, error: error.message });
        });
        return true; // Keep channel open for async response
      }
      break;
    }

    case 'PROMPT_CAPTURED': {
      // Store the captured prompt
      pendingPrompt = message.payload as PromptPayload;
      sendResponse({ success: true });
      break;
    }

    case 'SIDEPANEL_READY': {
      // Sidepanel is ready, send any pending prompt
      if (pendingPrompt) {
        sendResponse({ prompt: pendingPrompt });
        pendingPrompt = null;
      } else {
        sendResponse({ prompt: null });
      }
      break;
    }

    case 'UPDATE_PROMPT': {
      // Relay to content script in the active tab
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]?.id) {
          chrome.tabs.sendMessage(tabs[0].id, message).then(() => {
            sendResponse({ success: true });
          }).catch((error) => {
            sendResponse({ success: false, error: error.message });
          });
        }
      });
      return true; // Keep channel open for async response
    }

    default:
      break;
  }

  return false;
});

// Log when service worker starts
console.log('Prompt Auditor service worker initialized');
