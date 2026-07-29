import { defineConfig } from 'vitest/config';

// Unit tests for the risky pure logic in lib/logic/. Node environment — these
// are pure functions, no DOM. DB-backed verification lives in tooling/verify.
export default defineConfig({
  test: {
    include: ['tests/**/*.test.ts'],
    environment: 'node',
  },
});
