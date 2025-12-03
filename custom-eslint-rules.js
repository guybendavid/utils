const MessageTypeToText = {
  NO_HARDCODED_STRINGS: "Hardcoded strings are not allowed. Use constants or localization keys instead."
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

      const shouldIgnore = (value) => {
        if (typeof value !== "string") return true;
        if (value.length < minLength) return true;

        if (value.trim().length === 0) return true;

        return ignorePatterns.some((pattern) => new RegExp(pattern).test(value));
      };

      return {
        Literal: (node) => {
          if (shouldIgnore(node.value)) return;

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

          if (shouldIgnore(value) && !hasExpressions) return;

          context.report({
            node,
            message: MessageTypeToText.NO_HARDCODED_STRINGS
          });
        }
      };
    }
  }
};
