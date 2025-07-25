import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

// globals for jsdom environment
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// remove act() warnings from tests
const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('was not wrapped in act')
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});


// mock import.meta
global.importMeta = {
  env: {
    VITE_API_URL: 'http://localhost:3001',
    VITE_API_AUDIENCE: 'test-audience',
    VITE_AUTH0_DOMAIN: 'test-domain',
    VITE_AUTH0_CLIENT_ID: 'test-client-id'
  }
};

// mock fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
    arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
    blob: () => Promise.resolve(new Blob()),
  })
);

// mock socket globally
jest.mock('../utils/socket', () => ({
  socket: {
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn(),
    connect: jest.fn(), // Add connect method
    disconnect: jest.fn(), // Add disconnect method
    connected: true,
    once: jest.fn(),
  }
}));

// Mmck window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};