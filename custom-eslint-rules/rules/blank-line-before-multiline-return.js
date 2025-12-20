import { getIsMultiLine, getIsBlankLineBefore } from "../helpers/ast-helpers.js";
import { MessageTypeToText } from "../helpers/message-types.js";

export const blankLineBeforeMultilineReturn = {
  meta: {
    type: "layout",
    fixable: "whitespace",
    docs: {
      description: "Enforce blank line before multi-line return statements"
    },
    schema: []
  },
  create: (context) => {
    const sourceCode = context.getSourceCode();

    return {
      ReturnStatement: (node) => {
        if (!getIsMultiLine(node)) return;
        if (getIsBlankLineBefore({ sourceCode, node })) return;

        const { parent } = node;
        if (!parent || parent.type !== "BlockStatement") return;

        const statements = parent.body;
        const currentIndex = statements.indexOf(node);

        if (currentIndex === 0) return;

        const previousStatement = statements[currentIndex - 1];
        const noBlankLineAfter = ["ReturnStatement", "ThrowStatement", "BreakStatement", "ContinueStatement"];

        if (noBlankLineAfter.includes(previousStatement.type)) return;

        context.report({
          node,
          message: MessageTypeToText.BLANK_LINE_BEFORE_MULTILINE_RETURN,
          fix: (fixer) => fixer.insertTextBefore(node, "\n")
        });
      }
    };
  }
};
