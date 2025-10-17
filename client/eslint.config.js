// eslint.config.js
import js from '@eslint/js'
import globals from 'globals'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import prettierPlugin from 'eslint-plugin-prettier'
import prettierConfig from 'eslint-config-prettier'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  // 🔹 Ignore build and config files
  globalIgnores(['dist', 'node_modules']),

  {
    files: ['**/*.{js,jsx,ts,tsx}'],

    // 🔹 Merge recommended configs
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      react.configs.recommended,
      react.configs['jsx-runtime'],
      reactHooks.configs.recommended,
      reactRefresh.configs.vite,
      prettierConfig, // disables ESLint rules that conflict with Prettier
    ],

    plugins: {
      react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      prettier: prettierPlugin,
    },

    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parser: tseslint.parser,
      globals: globals.browser,
    },

    settings: {
      react: { version: '18.2' },
    },

    rules: {
      // 🔹 React Refresh (Vite HMR safety)
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
  },
])
