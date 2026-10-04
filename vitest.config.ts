import { configDefaults, defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    // Playwright specs live in e2e/ and must not run under vitest.
    exclude: [...configDefaults.exclude, 'e2e/**'],
  },
})
