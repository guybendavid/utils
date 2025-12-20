import { getIsPreferGetPrefixExcludedProperty, getIsReturn, getIsSchemaOrConfigProperty } from "../helpers/ast-helpers.js";
import { MessageTypeToText } from "../helpers/message-types.js";

export const preferGetPrefix = {
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

      // Skip async functions - they return Promises, can't determine resolved type
      if (functionNode.async) return;

      if (getIsReturn(functionNode)) {
        // Check if function has a return statement (including nested scopes)
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
      },
      // Handle object properties like: { getIsCssStyle: (init) => { } }
      Property: (node) => {
        if (!node.key || node.key.type !== "Identifier" || !node.value) return;
        const functionName = node.key.name;
        if (getIsPreferGetPrefixExcludedProperty(functionName)) return;

        // Skip schema/config object properties
        if (getIsSchemaOrConfigProperty(node)) return;

        if (node.value.type === "ArrowFunctionExpression" || node.value.type === "FunctionExpression") {
          checkFunctionForReturn(node.value, functionName, node.key);
        }
      }
    };
  }
};
