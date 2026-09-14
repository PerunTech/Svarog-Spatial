import globals from 'globals'
import js from '@eslint/js'
import babelParser from '@babel/eslint-parser'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'

export default [
    {
        // Generated: the committed bundle consumers resolve out of the checkout.
        ignores: ['backend/www/**'],
    },
    js.configs.recommended,
    {
        // Both extensions on purpose. Under eslint 8 this was `eslint frontend/`
        // against an .eslintrc, which lints .js only -- so all 37 .jsx files
        // here went unchecked for the life of the repo.
        files: ['frontend/**/*.{js,jsx}'],
        plugins: {
            react,
            'react-hooks': reactHooks,
        },
        languageOptions: {
            parser: babelParser,
            ecmaVersion: 2021,
            sourceType: 'module',
            parserOptions: {
                babelOptions: {
                    presets: ['@babel/preset-react'],
                },
                requireConfigFile: false,
            },
            globals: {
                ...globals.browser,
            },
        },
        settings: {
            react: { version: 'detect' },
        },
        rules: {
            ...react.configs.recommended.rules,
            ...reactHooks.configs.recommended.rules,
            'react/prop-types': 0,
            'react-hooks/rules-of-hooks': 'warn',
            'react-hooks/exhaustive-deps': 'warn',
            // The map mounts its React tree as `<Provider children={<UI/>} />`
            // in Control.js and Init.js. That is the shape those two call sites
            // want -- the child is built from props and handed over, not nested
            // in source -- and rewriting the mount path of a library five
            // projects consume is not worth a stylistic rule. perun-core
            // switches this off for the same reason.
            'react/no-children-prop': 0,
            'no-unused-vars': ['error', {
                argsIgnorePattern: '^_',
                varsIgnorePattern: '^_',
                // eslint 9 flips caughtErrors from 'none' to 'all'; keep the
                // repo's ^_ convention answering for catch bindings too.
                caughtErrorsIgnorePattern: '^_',
            }],
        },
    },
]
