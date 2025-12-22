// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expo = require('eslint-config-expo/flat');
const prettier = require('eslint-config-prettier');

module.exports = defineConfig([
  expo,
  prettier,
  {
    ignores: ['dist/*', 'node_modules/*', 'android/*', 'ios/*'],
    rules: {
      // Formatting is handled by Prettier
      'prettier/prettier': 'off',

      // Sensible Expo / RN defaults
      'no-unused-vars': 'warn',
      'no-console': 'warn',
    },
  },
]);
