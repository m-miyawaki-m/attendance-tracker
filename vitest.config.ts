import { fileURLToPath } from 'node:url'
import { mergeConfig, defineConfig, configDefaults } from 'vitest/config'
import viteConfig from './vite.config'

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      exclude: [...configDefaults.exclude, 'e2e/**'],
      root: fileURLToPath(new URL('./', import.meta.url)),
      setupFiles: ['./vitest.setup.ts'],
      server: {
        deps: {
          inline: ['vuetify'],
        },
      },
      // カバレッジ設定
      coverage: {
        provider: 'v8',
        reporter: ['text', 'html', 'json'],
        reportsDirectory: './coverage',
        exclude: [
          'node_modules/**',
          'dist/**',
          '**/*.d.ts',
          '**/*.spec.ts',
          '**/*.test.ts',
          '**/types/**',
          'e2e/**',
        ],
      },
      // HTMLレポーター設定
      reporters: ['default', 'html'],
      outputFile: {
        html: './test-results/index.html',
      },
    },
  }),
)
