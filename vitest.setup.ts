// vitest.setup.ts
// Global test setup and polyfills

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

// Mock IntersectionObserver if needed
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
}

// Mock visualViewport
Object.defineProperty(window, 'visualViewport', {
  value: {
    width: 1024,
    height: 768,
    scale: 1,
    offsetLeft: 0,
    offsetTop: 0,
    pageLeft: 0,
    pageTop: 0,
    addEventListener: () => {},
    removeEventListener: () => {},
  },
  writable: true,
  configurable: true,
})
