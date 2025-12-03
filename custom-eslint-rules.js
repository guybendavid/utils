const MessageTypeToText = {
  NO_HARDCODED_STRINGS: "Hardcoded strings are not allowed. Use constants or localization keys instead.",
  FUNCTION_MUST_START_WITH_GET_PREFIX: "Functions that return values should start with 'get' prefix."
};

export const customRuleMap = {
  "no-hardcoded-strings": {
    meta: {
      type: "problem",
      docs: {
        description: "Disallow hardcoded strings (any language) to enforce use of constants or i18n"
      },
      schema: [
        {
          type: "object",
          properties: {
            minLength: {
              type: "number",
              default: 3
            },
            ignorePatterns: {
              type: "array",
              items: {
                type: "string"
              }
            }
          },
          additionalProperties: false
        }
      ]
    },
    create: (context) => {
      const options = context.options[0] || {};
      const DEFAULT_MIN_LENGTH = 3;
      const minLength = options.minLength || DEFAULT_MIN_LENGTH;
      const ignorePatterns = options.ignorePatterns || [];

      const getShouldIgnore = (value) => {
        if (typeof value !== "string") return true;
        if (value.length < minLength) return true;

        if (value.trim().length === 0) return true;

        return ignorePatterns.some((pattern) => new RegExp(pattern).test(value));
      };

      return {
        Literal: (node) => {
          if (getShouldIgnore(node.value)) return;

          const { parent } = node;
          if (parent.type === "Property" && parent.key === node) return;
          if (parent.type === "JSXAttribute") return;

          context.report({
            node,
            message: MessageTypeToText.NO_HARDCODED_STRINGS
          });
        },
        TemplateLiteral: (node) => {
          const hasExpressions = node.expressions.length > 0;
          const value = node.quasis.map((q) => q.value.raw).join("");

          if (getShouldIgnore(value) && !hasExpressions) return;

          context.report({
            node,
            message: MessageTypeToText.NO_HARDCODED_STRINGS
          });
        }
      };
    }
  },
  "prefer-get-prefix": {
    meta: {
      type: "suggestion",
      docs: {
        description: "Enforce 'get' prefix for functions that return values"
      },
      schema: []
    },
    create: (context) => {
      const checkFunctionForReturn = (functionNode, functionName, reportNode) => {
        // Skip if already starts with "get"
        if (functionName.startsWith("get")) return;

        // Skip if it's a component (starts with capital letter)
        if (/^[A-Z]/.test(functionName)) return;

        // Skip if it's a hook (starts with "use")
        if (functionName.startsWith("use")) return;

        // Skip validation, connection, and handler functions
        if (functionName.startsWith("validate") || functionName.startsWith("connect") || functionName.startsWith("handle")) return;

        // Check if function has a return statement
        const getHasReturn = () => {
          if (functionNode.type === "ArrowFunctionExpression") {
            // Arrow functions without block return implicitly
            return (
              functionNode.body.type !== "BlockStatement" ||
              functionNode.body.body.some((statement) => statement.type === "ReturnStatement")
            );
          }

          if (functionNode.type === "FunctionExpression" || functionNode.type === "FunctionDeclaration") {
            return functionNode.body.body.some((statement) => statement.type === "ReturnStatement");
          }

          return false;
        };

        if (getHasReturn()) {
          context.report({
            node: reportNode,
            message: MessageTypeToText.FUNCTION_MUST_START_WITH_GET_PREFIX
          });
        }
      };

      return {
        // Handle all variable declarations (arrow functions and function expressions)
        VariableDeclarator: (node) => {
          if (!node.id || node.id.type !== "Identifier") return;
          const functionName = node.id.name;

          if (node.init?.type === "ArrowFunctionExpression" || node.init?.type === "FunctionExpression") {
            checkFunctionForReturn(node.init, functionName, node.id);
          }
        },

        // Handle all function declarations
        FunctionDeclaration: (node) => {
          if (!node.id || node.id.type !== "Identifier") return;
          const functionName = node.id.name;
          checkFunctionForReturn(node, functionName, node.id);
        }
      };
    }
  }
};
