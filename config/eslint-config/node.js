/** @type {import('eslint').Linter.Config} */
module.exports = {
  extends: ['@rocketseat/eslint-config/node'],
  plugins: ['simple-import-sort', 'unused-imports'],
  rules: {
    'simple-import-sort/imports': 'error',
    'unused-imports/no-unused-imports': 'error',
    'no-useless-constructor': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
  },
}
