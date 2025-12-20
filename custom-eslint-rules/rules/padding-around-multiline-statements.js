import { getIsMultiLine, getIsBlankLineBefore, getIsBlankLineAfter } from "../helpers/ast-helpers.js";

export const paddingAroundMultilineStatements = {
  meta: {
    type: "layout",
    fixable: "whitespace",
    docs: {
      description: "Enforce blank lines around multi-line statements"
    },
    schema: []
  },
  create: (context) => {
    const sourceCode = context.getSourceCode();

    const checkStatement = (node) => {
      if (!getIsMultiLine(node)) return;

      const { parent } = node;
      if (!parent || parent.type !== "BlockStatement") return;

      const statements = parent.body;
      const currentIndex = statements.indexOf(node);

      // Check blank line before (if not first statement)
      if (currentIndex > 0) {
        const prevStatement = statements[currentIndex - 1];
        const prevEndsFlow = ["ReturnStatement", "ThrowStatement", "BreakStatement", "ContinueStatement"].includes(prevStatement.type);

        if (!prevEndsFlow && !getIsBlankLineBefore({ sourceCode, node })) {
          context.report({
            node,
            message: "Expected blank line before multi-line statement",
            fix: (fixer) => fixer.insertTextBefore(node, "\n")
          });
        }
      }

      // Check blank line after (if not last statement)
      const isLastStatement = currentIndex >= statements.length - 1;

      if (!isLastStatement && !getIsBlankLineAfter({ sourceCode, node })) {
        const { loc } = node;

        context.report({
          node,
          loc: loc.end,
          message: "Expected blank line after multi-line statement",
          fix: (fixer) => fixer.insertTextAfter(node, "\n")
        });
      }
    };

    return {
      ExpressionStatement: checkStatement,
      VariableDeclaration: checkStatement,
      ReturnStatement: checkStatement,
      IfStatement: checkStatement,
      TryStatement: checkStatement,
      ThrowStatement: checkStatement
    };
  }
};
