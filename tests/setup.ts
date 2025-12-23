// Test setup file - Chrome API mocks
import { vi } from 'vitest';

// Mock Chrome Storage API
const mockStorage = {
  local: {
    get: vi.fn((keys) => {
      return Promise.resolve({});
    }),
    set: vi.fn(() => Promise.resolve()),
    remove: vi.fn(() => Promise.resolve()),
    clear: vi.fn(() => Promise.resolve()),
  },
  onChanged: {
    addListener: vi.fn(),
    removeListener: vi.fn(),
  },
};

// Mock Chrome Runtime API
const mockRuntime = {
  sendMessage: vi.fn(() => Promise.resolve({})),
  onMessage: {
    addListener: vi.fn(),
    removeListener: vi.fn(),
  },
  openOptionsPage: vi.fn(),
  id: 'test-extension-id',
};

// Mock Chrome Tabs API
const mockTabs = {
  query: vi.fn(() => Promise.resolve([{ id: 1, active: true }])),
  sendMessage: vi.fn(() => Promise.resolve({})),
};

// Mock Chrome Side Panel API
const mockSidePanel = {
  open: vi.fn(() => Promise.resolve()),
  setPanelBehavior: vi.fn(() => Promise.resolve()),
};

// Mock Chrome Action API
const mockAction = {
  onClicked: {
    addListener: vi.fn(),
    removeListener: vi.fn(),
  },
};

// Global chrome object
global.chrome = {
  storage: mockStorage,
  runtime: mockRuntime,
  tabs: mockTabs,
  sidePanel: mockSidePanel,
  action: mockAction,
} as any;

// Export mocks for use in tests
export { mockStorage, mockRuntime, mockTabs, mockSidePanel, mockAction };
