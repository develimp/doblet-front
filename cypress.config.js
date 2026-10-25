import {defineConfig} from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:9000',
    specPattern: 'e2e/specs/**/*.cy.js',
    supportFile: 'e2e/support/e2e.js',
    video: false,
    screenshotsFolder: 'e2e/screenshots',
    downloadsFolder: 'e2e/downloads',
    env: {
      userEmail: 'tonystark@santspatrons.com',
      userPassword: 'StarkDemo2026!',
    },
    expose: {
      apiUrl: 'http://localhost:3001',
    },
  },
});