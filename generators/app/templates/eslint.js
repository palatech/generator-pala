module.exports = {
  globals: {
    __PATH_PREFIX__: true,
  },
  parser: '@typescript-eslint/parser',
  extends: ['react-app', 'prettier/@typescript-eslint', 'prettier/react'],
  parserOptions: {
    ecmaVersion: 2019,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  rules: {
    'jsx-a11y/anchor-is-valid': 'off',
    'react/jsx-props-no-spreading': 'off',
    'import/order': 'warn',
    '@typescript-eslint/no-empty-interface': 'off',
    '@typescript-eslint/ban-ts-ignore': 'warn',
    'max-len': ['error', { code: 140, ignoreUrls: true }],
    'import/prefer-default-export': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    'react/no-unescaped-entities': [
      'error',
      {
        forbid: [
          { char: '>', alternatives: ['&gt;'] },
          { char: '}', alternatives: ['&#125;'] },
        ],
      },
    ],
  },
};
