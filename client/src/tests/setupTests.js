import '@testing-library/jest-dom';

// Mock environment variables
Object.defineProperty(window, 'import', {
  value: {
    meta: {
      env: {
        VITE_API_URL: 'http://localhost:3001',
        VITE_API_AUDIENCE: 'test-audience',
        VITE_AUTH0_DOMAIN: 'test-domain'
      }
    }
  }
});