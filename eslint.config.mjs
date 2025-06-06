import { FlatCompat } from '@eslint/eslintrc';
const compat = new FlatCompat({
  // import.meta.dirname is available after Node.js v20.11.0
  // baseDirectory: import.meta.dirname,
  recommendedConfig: true,
});
const eslintConfig = [
  ...compat.config({
    extends: [
      'next',
      'prettier',
      'next/typescript',
      'next/core-web-vitals',
      'plugin:@next/next/recommended',

      // 'plugin:jest/recommended', // for testing files
    ],
    plugins: ['prettier'],
    ignorePatterns: ['node_modules', 'dist', 'build', 'public', '.next'],
    settings: {
      // next: {
      //   rootDir: 'packages/my-app/',
      // },
      cssFilesRefreshRate: 5_000,
      tailwindcss: {
        callees: ['classnames'],
        removeDuplicates: true,
      },
    },
    rules: {
      'prettier/prettier': [
        'error',
        {
          singleQuote: true,
          semi: true,
          trailingComma: 'all',
          printWidth: 100,
          tabWidth: 2,
        },
      ],
      'prettier/prettier': [
        'warn',
        {
          singleQuote: true,
          semi: true,
          trailingComma: 'all',
          printWidth: 100,
          tabWidth: 2,
        },
      ],
    },
  }),
];
export default eslintConfig;
