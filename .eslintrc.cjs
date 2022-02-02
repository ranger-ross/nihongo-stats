module.exports = {
    'env': {
        'browser': true,
        'es2021': true,
    },
    "extends": [
        "eslint:recommended",
        "plugin:react/recommended"
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
