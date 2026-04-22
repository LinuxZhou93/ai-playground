import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

const eslintConfig = [
  {
    ignores: [
      '.next/**',
      'out/**',
      'build/**',
      'next-env.d.ts',
      'node_modules/**',
      'packages/**',
      'tests/**',
      'scripts/**',
      'server/**',
      'database/**',
      'temp-proxy/**',
      'e2e/**',
      'autoresearch-mlx/**',
      'openmaic-core/**',
      'configs/**',
      'supabase/**',
      '.claude/**',
      '.superpowers/**',
      '.worktrees/**',
      'assessment/**',
      'Psyche_X_Evolution_Archive/**',
      '**/vendor/**',
      '**/*.min.js',
      '**/*.js',
      '**/*.mjs',
      '**/*.ts',
      '!app/**',
      '!components/**',
      '!lib/**',
      '!hooks/**',
      '!next.config.ts',
      '!eslint.config.mjs',
    ],
  },
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    rules: {
      '@next/next/no-img-element': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      'react/no-unescaped-entities': 'off',
      'react-hooks/exhaustive-deps': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      'react/jsx-no-target-blank': 'off',
    },
  },
];

export default eslintConfig;
