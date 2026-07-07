// F4 tooling exception: ESLint is dev-only guard for GSAP import boundary (see package.json).
import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['src/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'gsap',
              message: 'No importes GSAP directamente. Usa los helpers de src/scripts/motion.ts.',
            },
          ],
          patterns: [
            {
              group: ['gsap/*'],
              message: 'No importes GSAP directamente. Usa los helpers de src/scripts/motion.ts.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/scripts/gsap.ts'],
    rules: {
      'no-restricted-imports': 'off',
    },
  },
);
