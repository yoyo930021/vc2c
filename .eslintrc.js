module.exports = {
  root: true,
  plugins: [
    '@typescript-eslint/eslint-plugin'
  ],
  env: {
    es6: true,
    node: true,
  },
  extends: [
    'standard',
    'eslint:recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
  ],
  rules: {
    'no-console': 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-undef': 'off',
    'no-unused-vars': 'off',
    strict: 'off',
    camelcase: 'off',
    '@typescript-eslint/quotes': ['error', 'single'],
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/member-delimiter-style': ['error', { multiline: { delimiter: 'comma', requireLast: false }, singleline: { delimiter: 'comma', requireLast: false }, overrides: { interface: { multiline: { delimiter: 'none' } } } }]
  },
  parserOptions: {
    sourceType: 'module',
    ecmaFeatures: {
      jsx: false,
    },
    project: ['./tsconfig.json'],
    tsconfigRootDir: __dirname,
  }
}
