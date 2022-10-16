module.exports = {
    'env': {
        'browser': true,
        'es2021': true,
    },
    "extends": [
        "eslint:recommended",
        "plugin:react/recommended",
        'plugin:@typescript-eslint/recommended',
    ],
    'parserOptions': {
        'ecmaFeatures': {
            'jsx': true,
        },
        'ecmaVersion': 12,
        'sourceType': 'module',
    },
    'plugins': [
        'react',
        '@typescript-eslint',
    ],
    'rules': {
        'react/function-component-definition': 'error',
        'react/no-invalid-html-attribute': 'error',
        'react/no-this-in-sfc': 'error',
        'react/no-typos': 'error',
        'react/no-unsafe': 'error',

        // Disabled
        'no-extra-boolean-cast': 'off',
        'react/react-in-jsx-scope': 'off',
        'react/prop-types': 'off',
        'react/no-unescaped-entities': 'off',
        '@typescript-eslint/ban-ts-comment': 'off',
        '@typescript-eslint/no-inferrable-types': 'off',
        '@typescript-eslint/no-non-null-assertion': 'off',
        '@typescript-eslint/no-explicit-any': 'off', // TODO: ReEnable when project is cleaned up and better migrated to TypeScript
    },
    'settings': {
        "react": {
            "version": "detect",
        }
    },
    "overrides": [
        {
            "files": ["*.jsx", "*.js"]
        }
    ],
};
