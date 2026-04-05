import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';
import tanstackQuery from '@tanstack/eslint-plugin-query';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({ baseDirectory: __dirname });

const eslintConfig = [
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  // TanStack Query rules: catches missing queryKey deps, invalid query options, etc.
  // TODO (US-004): add a custom rule or lint plugin that enforces explicit `staleTime`
  // on every useQuery call. `@tanstack/eslint-plugin-query` does not have a built-in
  // staleTime rule — options are: (a) custom ESLint rule, (b) PR review convention.
  ...tanstackQuery.configs['flat/recommended'],
  {
    rules: {
      // Disallow process.env access outside src/shared/config/env.ts
      'no-restricted-syntax': [
        'error',
        {
          selector: "MemberExpression[object.name='process'][property.name='env']",
          message: "Access env variables via '@/shared/config/env' — never process.env directly.",
        },
      ],
    },
  },
];

export default eslintConfig;
