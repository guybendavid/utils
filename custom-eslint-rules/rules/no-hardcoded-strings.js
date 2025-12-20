import { MessageTypeToText } from "../helpers/message-types.js";

export const noHardcodedStrings = {
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
    const minLength = options.minLength || 3;
    const ignorePatterns = options.ignorePatterns || [];

    const getIsShouldIgnore = (value) => {
      if (typeof value !== "string") return true;
      if (value.length < minLength) return true;

      if (value.trim().length === 0) return true;

      return ignorePatterns.some((pattern) => new RegExp(pattern).test(value));
    };

    return {
      Literal: (node) => {
        if (getIsShouldIgnore(node.value)) return;

        const { parent } = node;
        if (parent.type === "Property" && parent.key === node) return;
        if (parent.type === "JSXAttribute") return;

        context.report({
          node,
          message: MessageTypeToText.NO_HARDCODED_STRINGS
        });
      },
      TemplateLiteral: (node) => {
        const isExpressions = node.expressions.length > 0;
        const value = node.quasis.map((q) => q.value.raw).join("");

        if (getIsShouldIgnore(value) && !isExpressions) return;

        context.report({
          node,
          message: MessageTypeToText.NO_HARDCODED_STRINGS
        });
      }
    };
  }
};
