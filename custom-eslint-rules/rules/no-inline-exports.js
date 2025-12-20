import { MessageTypeToText } from "../helpers/message-types.js";

export const noInlineExports = {
  meta: {
    type: "suggestion",
    docs: {
      description: "Disallow inline exports - require export keyword before declaration"
    },
    schema: []
  },
  create: (context) => ({
    ExportNamedDeclaration: (node) => {
      // Check for inline exports: export { foo, bar };
      if (node.specifiers && node.specifiers.length > 0 && !node.declaration) {
        context.report({
          node,
          message: MessageTypeToText.NO_INLINE_EXPORTS
        });
      }
    }
  })
};
