module.exports = {
    env: {
        node: true,
        jest: true,
        es6: true
    },
    extends: [
        "airbnb-base"
    ],
    plugins: [],
    globals: {
        "Atomics": "readonly",
        "SharedArrayBuffer": "readonly",
        "document": false,
        "$": true,
        "window": true
    },
    parserOptions: {
        "ecmaVersion": 2018
    },
    rules: {
        "comma-dangle": 0,
        "consistent-return": 0,
        "function-paren-newline": ["error", "never"],
        "implicit-arrow-linebreak": ["off"],
        "no-param-reassign": 0,
        "no-underscore-dangle": 0,
        "no-shadow": 0,
        "no-console": 0,
        "no-plusplus": 0,
        "no-unused-expressions": 0,
        "no-unused-vars": ["error", { "argsIgnorePattern": "next|res", "ignoreRestSiblings": true }],
        "max-len": ["error", { "code": 150 }],
        "import/no-extraneous-dependencies": ["error", {"devDependencies": true}]
    },
    "ignorePatterns": [
        "tmp/*.js"
    ]
};