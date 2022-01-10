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
