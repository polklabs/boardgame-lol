module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint/eslint-plugin', 'assorted-rules'],
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  ignorePatterns: ['.eslintrc.js'],
  rules: {
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    "assorted-rules/if-else": "warn",
    "assorted-rules/if-block": "warn",
    "assorted-rules/while-block": "warn",
    "assorted-rules/for-block": "warn",
    "assorted-rules/switch-default": "warn",
    "assorted-rules/i-interface": "warn",
    "assorted-rules/file-lint-disable": "warn"
  },
};
