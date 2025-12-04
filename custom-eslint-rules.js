const getIsMultiLine = (node) => node.loc.end.line > node.loc.start.line;

const getIsBlankLineBefore = (context, node) => {
  const sourceCode = context.getSourceCode();
  const tokenBefore = sourceCode.getTokenBefore(node);
  if (!tokenBefore) return true;

  return node.loc.start.line - tokenBefore.loc.end.line > 1;
};

const getIsBoolean = (init) => {
  if (!init) return false;

  // Check for literal boolean values
  if (init.type === "Literal" && typeof init.value === "boolean") return true;

  // Check for unary negation (!) which produces a boolean
  if (init.type === "UnaryExpression" && init.operator === "!") return true;

  // Check for binary comparisons that return boolean
  const comparisonOperators = ["==", "!=", "===", "!==", ">", ">=", "<", "<="];
  if (init.type === "BinaryExpression" && comparisonOperators.includes(init.operator)) return true;

  return false;
};

const getCheckReturnStatements = (body) => {
  if (!body) return false;

  if (body.type === "BlockStatement") {
    if (!Array.isArray(body.body)) return false;

    return body.body.some((statement) => {
      if (statement.type === "ReturnStatement" && statement.argument) {
        return getIsBoolean(statement.argument);
      }
      if (statement.type === "IfStatement") {
        const consequentCheck = getCheckReturnStatements(statement.consequent);
        const alternateCheck = statement.alternate ? getCheckReturnStatements(statement.alternate) : false;
        return consequentCheck || alternateCheck;
      }
      if (statement.type === "TryStatement") {
        const blockCheck = getCheckReturnStatements(statement.block);
        const handlerCheck = statement.handler ? getCheckReturnStatements(statement.handler.body) : false;
        const finalizerCheck = statement.finalizer ? getCheckReturnStatements(statement.finalizer) : false;
        return blockCheck || handlerCheck || finalizerCheck;
      }
      return false;
    });
  }

  return getIsBoolean(body);
};

const getIsBooleanFunction = (functionNode) => {
  if (!functionNode || !functionNode.body) return false;

  // For arrow functions with implicit return
  if (functionNode.type === "ArrowFunctionExpression" && functionNode.body.type !== "BlockStatement") {
    return getIsBoolean(functionNode.body);
  }

  // For functions with explicit return statements
  return getCheckReturnStatements(functionNode.body);
};

const MessageTypeToText = {
  BLANK_LINE_BEFORE_MULTILINE_RETURN: "Expected blank line before multi-line return statement.",
  NO_HARDCODED_STRINGS: "Hardcoded strings are not allowed. Use constants or localization keys instead.",
  FUNCTION_MUST_START_WITH_GET_PREFIX: "Functions that return values should start with 'get' prefix.",
  BOOLEAN_VARIABLE_MUST_START_WITH_IS: "Boolean variables should start with 'is' prefix.",
  BOOLEAN_FUNCTION_MUST_START_WITH_GET_IS: "Functions that return boolean values should start with 'getIs' prefix.",
  REQUIRE_OBJECT_DESTRUCTURING: "Functions with 2 or more parameters must use object destructuring.",
  NO_GET_PREFIX_FOR_VOID_FUNCTIONS: "Void functions (functions that don't return values) should not start with 'get' prefix."
};

export const customRuleMap = {
  "blank-line-before-multiline-return": {
    meta: {
      type: "layout",
      fixable: "whitespace",
      docs: {
        description: "Enforce blank line before multi-line return statements"
      },
      schema: []
    },
    create: (context) => ({
      ReturnStatement: (node) => {
        if (!getIsMultiLine(node)) return;
        if (getIsBlankLineBefore(context, node)) return;

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
    })
  },
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

        // Skip async functions - they return Promises, can't determine resolved type
        if (functionNode.async) return;

        // Check if function has a return statement (including nested scopes)
        const getIsHasReturnStatement = (body) => {
          if (!body) return false;

          if (body.type === "BlockStatement") {
            if (!Array.isArray(body.body)) return false;

            return body.body.some((statement) => {
              if (statement.type === "ReturnStatement" && statement.argument) return true;
              if (statement.type === "IfStatement") {
                const consequentCheck = getIsHasReturnStatement(statement.consequent);
                const alternateCheck = statement.alternate ? getIsHasReturnStatement(statement.alternate) : false;
                return consequentCheck || alternateCheck;
              }
              if (statement.type === "TryStatement") {
                const blockCheck = getIsHasReturnStatement(statement.block);
                const handlerCheck = statement.handler ? getIsHasReturnStatement(statement.handler.body) : false;
                const finalizerCheck = statement.finalizer ? getIsHasReturnStatement(statement.finalizer) : false;
                return blockCheck || handlerCheck || finalizerCheck;
              }
              if (statement.type === "BlockStatement") {
                return getIsHasReturnStatement(statement);
              }
              return false;
            });
          }

          return false;
        };

        const getIsReturn = () => {
          if (functionNode.type === "ArrowFunctionExpression") {
            // Only check arrow functions with explicit block and return statements
            if (functionNode.body.type === "BlockStatement") {
              return getIsHasReturnStatement(functionNode.body);
            }
            // Skip implicit returns - can't reliably determine if void without types
            return false;
          }

          if (functionNode.type === "FunctionExpression" || functionNode.type === "FunctionDeclaration") {
            return getIsHasReturnStatement(functionNode.body);
          }

          return false;
        };

        if (getIsReturn()) {
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
  },
  "prefer-boolean-is-prefix": {
    meta: {
      type: "suggestion",
      docs: {
        description: "Enforce 'is' prefix for boolean variables and 'getIs' for boolean-returning functions"
      },
      schema: []
    },
    create: (context) => ({
      VariableDeclarator: (node) => {
        if (!node.id || node.id.type !== "Identifier") return;
        const variableName = node.id.name;

        // Skip if it's a component (starts with capital letter)
        if (/^[A-Z]/.test(variableName)) return;

        // Skip if it's a constant (all uppercase with underscores)
        if (/^[A-Z_]+$/.test(variableName)) return;

        // Check if it's a boolean variable
        if (node.init && getIsBoolean(node.init) && !variableName.startsWith("is")) {
          context.report({
            node: node.id,
            message: MessageTypeToText.BOOLEAN_VARIABLE_MUST_START_WITH_IS
          });
        }

        // Check if it's a function that returns boolean
        if (
          node.init &&
          (node.init.type === "ArrowFunctionExpression" || node.init.type === "FunctionExpression") &&
          getIsBooleanFunction(node.init) &&
          !variableName.startsWith("getIs")
        ) {
          context.report({
            node: node.id,
            message: MessageTypeToText.BOOLEAN_FUNCTION_MUST_START_WITH_GET_IS
          });
        }
      },

      FunctionDeclaration: (node) => {
        if (!node.id || node.id.type !== "Identifier") return;
        const functionName = node.id.name;

        // Skip if it's a component (starts with capital letter)
        if (/^[A-Z]/.test(functionName)) return;

        // Check if it returns a boolean
        if (getIsBooleanFunction(node) && !functionName.startsWith("getIs")) {
          context.report({
            node: node.id,
            message: MessageTypeToText.BOOLEAN_FUNCTION_MUST_START_WITH_GET_IS
          });
        }
      }
    })
  },
  "no-get-prefix-for-void": {
    meta: {
      type: "suggestion",
      docs: {
        description: "Prevent 'get' prefix on void functions (functions that don't return values)"
      },
      schema: []
    },
    create: (context) => {
      const checkFunctionForVoid = (functionNode, functionName, reportNode) => {
        if (!functionName.startsWith("get")) return;
        if (/^get[A-Z]/.test(functionName) && /^get[A-Z][a-z]*[A-Z]/.test(functionName)) return;

        const getIsNonVoidReturn = (body) => {
          if (!body) return false;

          if (body.type === "BlockStatement") {
            if (!Array.isArray(body.body)) return false;

            return body.body.some((statement) => {
              if (statement.type === "ReturnStatement") {
                if (!statement.argument) return false;
                if (statement.argument.type === "Identifier" && statement.argument.name === "undefined") return false;
                return true;
              }

              if (statement.type === "IfStatement") {
                const consequentCheck = getIsNonVoidReturn(statement.consequent);
                const alternateCheck = statement.alternate ? getIsNonVoidReturn(statement.alternate) : false;
                return consequentCheck || alternateCheck;
              }

              if (statement.type === "TryStatement") {
                const blockCheck = getIsNonVoidReturn(statement.block);
                const handlerCheck = statement.handler ? getIsNonVoidReturn(statement.handler.body) : false;
                const finalizerCheck = statement.finalizer ? getIsNonVoidReturn(statement.finalizer) : false;
                return blockCheck || handlerCheck || finalizerCheck;
              }

              if (statement.type === "BlockStatement") {
                return getIsNonVoidReturn(statement);
              }

              return false;
            });
          }
        };

        const getIsVoidFunction = () => {
          if (functionNode.type === "ArrowFunctionExpression") {
            if (functionNode.body.type !== "BlockStatement") return false;
            return !getIsNonVoidReturn(functionNode.body);
          }

          if (functionNode.type === "FunctionExpression" || functionNode.type === "FunctionDeclaration") {
            return !getIsNonVoidReturn(functionNode.body);
          }

          return false;
        };

        if (getIsVoidFunction()) {
          context.report({
            node: reportNode,
            message: MessageTypeToText.NO_GET_PREFIX_FOR_VOID_FUNCTIONS
          });
        }
      };

      return {
        VariableDeclarator: (node) => {
          if (!node.id || node.id.type !== "Identifier") return;
          const functionName = node.id.name;

          if (node.init?.type === "ArrowFunctionExpression" || node.init?.type === "FunctionExpression") {
            checkFunctionForVoid(node.init, functionName, node.id);
          }
        },

        FunctionDeclaration: (node) => {
          if (!node.id || node.id.type !== "Identifier") return;
          const functionName = node.id.name;
          checkFunctionForVoid(node, functionName, node.id);
        }
      };
    }
  }
};
