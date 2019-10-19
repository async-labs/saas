module.exports = {
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'react', 'prettier'],
  extends: [
    'airbnb',
    'prettier',
    'prettier/react',
    'prettier/@typescript-eslint',
    'plugin:react/recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  env: {
    es6: true,
    browser: true,
    jest: true,
  },
  rules: {
    'prettier/prettier': 'error',
    'max-len': ['error', 100],
    'no-underscore-dangle': ['error', { allow: ['_id'] }],
    'no-mixed-operators': 'off',
    'prefer-destructuring': [
      'error',
      {
        VariableDeclarator: {
          array: false,
          object: true,
        },
        AssignmentExpression: {
          array: true,
          object: false,
        },
      },
      {
        enforceForRenamedProperties: false,
      },
    ],
    'import/prefer-default-export': 'off',
    'jsx-a11y/anchor-is-valid': 'off',
    'react/react-in-jsx-scope': 'off',
    'react/jsx-filename-extension': [1, { extensions: ['tsx'] }],
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-member-accessibility': 'off',
  },
  overrides: [],
};
