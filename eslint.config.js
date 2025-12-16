import { customRuleMap } from "./custom-eslint-rules.js";
import js from "@eslint/js";
import preferArrow from "eslint-plugin-prefer-arrow";
import unicorn from "eslint-plugin-unicorn";
import unusedImports from "eslint-plugin-unused-imports";
import globals from "globals";

const eslintConfig = [
  js.configs.recommended,
  {
    plugins: {
      "unused-imports": unusedImports,
      unicorn,
      "prefer-arrow": preferArrow
    },
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: globals.node
    },
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "styled-jsx/css",
              message: "Please use @emotion/css instead of styled-jsx/css"
            }
          ]
        }
      ],
      // To do: enable and refactor
      "no-magic-numbers": [
        "off",
        {
          ignore: [0, 1, -1],
          ignoreDefaultValues: true,
          enforceConst: true,
          detectObjects: false
        }
      ],
      "prefer-const": "error",
      "no-var": "error",
      "prefer-arrow/prefer-arrow-functions": "error",
      "unicorn/no-negation-in-equality-check": "error",
      "unicorn/no-single-promise-in-promise-methods": "error",
      "unicorn/no-await-in-promise-methods": "error",
      "unicorn/consistent-empty-array-spread": "error",
      "unicorn/no-invalid-fetch-options": "error",
      "unicorn/no-magic-array-flat-depth": "error",
      "unicorn/catch-error-name": [
        "error",
        {
          name: "error"
        }
      ],
      "unicorn/consistent-destructuring": "error",
      "unicorn/no-unnecessary-await": "error",
      "unicorn/no-lonely-if": "error",
      "unicorn/prefer-ternary": "error",
      "unicorn/new-for-builtins": "error",
      "unicorn/consistent-function-scoping": "error",
      "unicorn/no-array-push-push": "error",
      "unicorn/explicit-length-check": "error",
      "unicorn/prefer-array-flat-map": "error",
      "unicorn/no-useless-length-check": "error",
      "unicorn/prefer-includes": "error",
      "unicorn/prefer-string-slice": "error",
      "unicorn/prefer-native-coercion-functions": "error",
      "unicorn/prefer-array-some": "error",
      "unicorn/no-useless-spread": "error",
      "unicorn/prefer-array-find": "error",
      "unicorn/prefer-at": "error",
      "unicorn/prefer-array-index-of": "error",
      "no-duplicate-imports": "error",
      "unused-imports/no-unused-imports": "error",
      "no-unused-vars": [
        "error",
        {
          vars: "all",
          args: "after-used",
          destructuredArrayIgnorePattern: "^_",
          ignoreRestSiblings: true
        }
      ],
      "no-restricted-syntax": [
        "error",
        {
          selector:
            "BinaryExpression[operator=/^(==|===|!=|!==)$/][left.raw=/^(true|false)$/], BinaryExpression[operator=/^(==|===|!=|!==)$/][right.raw=/^(true|false)$/]",
          message: "Don't compare for equality against boolean literals"
        },
        {
          selector: "ExportNamedDeclaration[declaration=null][source=null]",
          message: "Use inline exports (export const/function) instead of grouped exports"
        },
        {
          selector: "IfStatement[alternate]",
          message: "Avoid else - use early return instead"
        },
        {
          selector: "ForStatement",
          message: "Avoid for loops - use forEach, map, filter, etc."
        },
        {
          selector: "WhileStatement",
          message: "Avoid while loops - use functional alternatives"
        },
        {
          selector: "DoWhileStatement",
          message: "Avoid do-while loops - use functional alternatives"
        },
        {
          selector: "ForInStatement",
          message: "Avoid for...in - use Object.keys().forEach() or Object.entries().forEach()"
        },
        {
          selector: "ForOfStatement",
          message: "Avoid for...of - use forEach, map, filter, etc."
        },
        {
          selector: "CallExpression[callee.object.name='Object'][callee.property.name='assign']",
          message: "Use spread syntax {...obj} instead of Object.assign()"
        },
        {
          selector: "CallExpression[callee.property.name='apply']",
          message: "Use spread syntax instead of .apply()"
        },
        {
          selector: "SequenceExpression",
          message: "Avoid comma operator - use separate statements"
        },
        {
          selector: "WithStatement",
          message: "with statement is not allowed"
        },
        {
          selector: "LabeledStatement",
          message: "Labeled statements are not allowed"
        },
        {
          selector: "ArrayExpression > SpreadElement > NewExpression",
          message: "Use Array.from() instead of spread [...new Set()]"
        },
        {
          selector: "VariableDeclaration[kind='let']",
          message: "Do not use 'let'. Use 'const' instead. If you need to reassign, consider refactoring to avoid mutation."
        }
      ],
      "unicorn/prefer-spread": "off",
      "no-empty": "error",
      "no-debugger": "error",
      "no-throw-literal": "error",
      "no-implied-eval": "error",
      "no-empty-function": "error",
      "no-extra-boolean-cast": "error",
      "prefer-template": "error",
      "prefer-destructuring": "error",
      "no-useless-return": "error",
      "no-sparse-arrays": "error",
      "no-self-compare": "error",
      "no-self-assign": "error",
      "no-dupe-keys": "error",
      "no-constant-condition": "error",
      "no-constant-binary-expression": "error",
      "no-dupe-else-if": "error",
      "no-new-wrappers": "error",
      "no-new-object": "error",
      "no-new": "error",
      "no-param-reassign": "error",
      "no-unsafe-negation": "error",
      "no-empty-pattern": "error",
      "no-implicit-coercion": "error",
      "no-else-return": [
        "error",
        {
          allowElseIf: false
        }
      ],
      "no-lone-blocks": "error",
      "no-global-assign": "error",
      "no-unneeded-ternary": "error",
      "no-useless-computed-key": "error",
      "no-useless-concat": "error",
      "no-useless-rename": "error",
      "no-bitwise": "error",
      "valid-typeof": "error",
      "use-isnan": "error",
      "no-import-assign": "error",
      "no-loop-func": "error",
      "no-undef": "error",
      "no-unsafe-finally": "error",
      "prefer-arrow-callback": "error",
      eqeqeq: "error",
      yoda: ["error", "never"],
      "object-shorthand": ["error", "always"],
      "arrow-body-style": ["error", "as-needed"],
      "padding-line-between-statements": [
        "error",
        {
          blankLine: "never",
          prev: "singleline-const",
          next: "singleline-const"
        },
        {
          blankLine: "always",
          prev: "export",
          next: "*"
        },
        {
          blankLine: "always",
          prev: "*",
          next: "export"
        }
      ]
    }
  },
  {
    files: ["**/*.js"],
    plugins: {
      custom: { rules: customRuleMap }
    },
    rules: {
      "custom/blank-line-before-multiline-return": "error",
      "custom/no-hardcoded-strings": "off",
      "custom/prefer-get-prefix": "error",
      "custom/require-object-destructuring": "error",
      "custom/no-get-prefix-for-void": "error",
      "custom/prefer-boolean-is-prefix": "error",
      "custom/no-inline-exports": "error",
      "custom/default-imports-first": "error",
      "custom/no-block-event-handlers": "error",
      "custom/prefer-direct-function-reference": "error",
      "custom/padding-around-multiline-statements": "error",
      "custom/blank-line-after-setters": "error"
    }
  }
];

export default eslintConfig;
