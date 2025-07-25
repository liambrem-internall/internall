module.exports = {
  presets: [
    ['@babel/preset-env', {
      targets: {
        node: 'current'
      }
    }],
    ['@babel/preset-react', {
      runtime: 'automatic'
    }]
  ],
  plugins: [
    ['transform-vite-meta-env', {
      env: {
        VITE_API_URL: 'http://localhost:3001',
        VITE_API_AUDIENCE: 'test-audience',
        VITE_AUTH0_DOMAIN: 'test-domain',
        VITE_AUTH0_CLIENT_ID: 'test-client-id'
      }
    }]
  ]
};