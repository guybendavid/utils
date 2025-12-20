import { MessageTypeToText } from "../helpers/message-types.js";

export const noBlockEventHandlers = {
  meta: {
    type: "problem",
    docs: {
      description: "Disallow block statements in JSX event handler arrow functions",
      category: "Stylistic Issues"
    },
    fixable: "code",
    schema: []
  },

  create: (context) => {
    const sourceCode = context.getSourceCode();

    const checkArrowFunction = (node) => {
      // Only check arrow functions with block statements
      if (node.body.type !== "BlockStatement") return;

      const statements = node.body.body;

      // Always report block statements in JSX event handlers
      const reportConfig = {
        node,
        message: MessageTypeToText.NO_BLOCK_STATEMENTS_IN_EVENT_HANDLERS
      };

      // Only provide auto-fix for simple cases (single statement that's return/expression)
      if (statements.length === 1) {
        const [statement] = statements;

        if (statement.type === "ReturnStatement" || statement.type === "ExpressionStatement") {
          const expression = statement.type === "ReturnStatement" ? statement.argument : statement.expression;

          if (expression) {
            reportConfig.fix = (fixer) => {
              // Convert block statement to expression
              const expressionText = sourceCode.getText(expression);

              // Replace the entire body with just the expression
              return fixer.replaceText(node.body, expressionText);
            };
          }
        }
      }

      context.report(reportConfig);
    };

    return {
      // Only check JSX event handlers: <button onClick={(e) => { doSomething(); }} />
      JSXExpressionContainer: (node) => {
        const { parent } = node;
        if (parent.type !== "JSXAttribute") return;

        const { name } = parent;
        const attrName = name?.name;

        // Check if this is a JSX event handler (starts with "on" followed by uppercase)
        if (!attrName || !/^on[A-Z]/.test(attrName)) return;

        const { expression } = node;

        if (expression.type === "ArrowFunctionExpression") {
          checkArrowFunction(expression);
        }
      }
    };
  }
};
