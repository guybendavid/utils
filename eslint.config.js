import js from "@eslint/js";
import boundaries from "eslint-plugin-boundaries";
import unicorn from "eslint-plugin-unicorn";
import unusedImports from "eslint-plugin-unused-imports";
import preferArrow from "eslint-plugin-prefer-arrow";
import { customRuleMap } from "./custom-eslint-rules.js";

const eslintConfig = [
  js.configs.recommended,
  {
    plugins: {
      boundaries,
      "unused-imports": unusedImports,
      unicorn,
      "prefer-arrow": preferArrow,
      custom: {
        rules: customRuleMap
      }
    },
    settings: {
      "boundaries/elements": [
        {
          type: "utils",
          pattern: "*.js",
          mode: "file"
        }
      ],
      "boundaries/ignore": ["node_modules/**/*", "**/*.test.js", "**/*.spec.js"]
    },
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        console: "readonly",
        process: "readonly"
      }
    },
    rules: {
      "boundaries/element-types": [
        "error",
        {
          default: "disallow",
          message: "${file.type} is not allowed to import ${dependency.type}",
          rules: [
            {
              from: ["utils"],
              allow: ["utils"]
            }
          ]
        }
      ],
      "unicorn/filename-case": [
        "error",
        {
          cases: {
            kebabCase: true
          }
        }
      ],
      "no-magic-numbers": [
        "error",
        {
          ignore: [0, 1, -1],
          ignoreDefaultValues: true,
          enforceConst: true,
          detectObjects: false
        }
      ],
      "custom/blank-line-before-multiline-return": "error",
      "custom/no-hardcoded-strings": "off",
      "custom/prefer-get-prefix": "error",
      "custom/prefer-boolean-is-prefix": "error",
      "custom/no-get-prefix-for-void": "error",
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
      "unicorn/no-useless-spread": "error",
      "unicorn/prefer-array-index-of": "error",
      "unicorn/no-useless-fallback-in-spread": "error",
      "unicorn/prefer-string-replace-all": "error",
      "unicorn/prefer-negative-index": "error",
      "unicorn/no-typeof-undefined": "error",
      "unicorn/no-array-method-this-argument": "error"
    }
  }
];

export default eslintConfig;
