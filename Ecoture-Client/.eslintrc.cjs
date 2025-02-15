module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  plugins: ['react-refresh'],
  rules: {
    'react-refresh/only-export-components': 'warn',
    quotes: ['warn', 'single', { avoidEscape: true }],
    camelcase: ['error', { ignoreImports: true }],
    complexity: ['warn', 30],
    'max-depth': ['error', 3],
    'max-nested-callbacks': ['error', 3],
    'max-lines': ['warn', { max: 600, skipBlankLines: true }],
    'react-hooks/exhaustive-deps': 'off',
  },
  settings: { react: { version: '18.2' } },
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
};
