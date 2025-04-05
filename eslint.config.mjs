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
    // settings: {
    //   next: {
    //     rootDir: 'packages/my-app/',
    //   },
    // },
  }),
];
export default eslintConfig;
