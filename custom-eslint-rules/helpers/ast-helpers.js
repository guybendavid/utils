export const getIsMultiLine = (node) => node.loc.end.line > node.loc.start.line;

// Configuration for this project - To do: Move to shared config package
const SCHEMA_CONFIG = {
  preferGetPrefixExcludedProperties: ["create", "fix"]
};

// No schema configuration needed for utils project
export const getIsSchemaOrConfigProperty = () => false;

export const getIsPreferGetPrefixExcludedProperty = (propertyName) =>
  Boolean(propertyName && SCHEMA_CONFIG.preferGetPrefixExcludedProperties?.includes(propertyName));

// Helper to check if there's a blank line before a node
export const getIsBlankLineBefore = ({ sourceCode, node }) => {
  const tokenBefore = sourceCode.getTokenBefore(node);
  if (!tokenBefore) return true;

  const linesBetween = node.loc.start.line - tokenBefore.loc.end.line;

  return linesBetween > 1;
};

export const getIsBlankLineAfter = ({ sourceCode, node }) => {
  const tokenAfter = sourceCode.getTokenAfter(node);
  if (!tokenAfter) return true;

  return tokenAfter.loc.start.line - node.loc.end.line > 1;
};

export const getIsBoolean = (init) => {
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

export const getIsBooleanFunction = (functionNode) => {
  if (!functionNode || !functionNode.body) return false;

  // For arrow functions with implicit return
  if (functionNode.type === "ArrowFunctionExpression" && functionNode.body.type !== "BlockStatement") {
    return getIsBoolean(functionNode.body);
  }

  // For functions with explicit return statements
  return getCheckReturnStatements(functionNode.body);
};

// Helper to check if a return statement spans multiple lines
export const getIsMultiLineReturn = (node) => {
  const startLine = node.loc.start.line;
  const endLine = node.loc.end.line;
  return endLine > startLine;
};

// Helper to check if a statement is a setter call (like setIsLoading, setIsAdmin, etc.)
export const getIsSetterCall = (node) => {
  if (node.type !== "ExpressionStatement") return false;
  const { expression } = node;
  if (expression.type !== "CallExpression") return false;
  const { callee } = expression;
  return callee.type === "Identifier" && callee.name.startsWith("set") && callee.name.length > 3;
};

// Helper to check if a statement is a function call that should have spacing (like setTimeout, setInterval, etc.)
export const getIsSpacingRequiredFunctionCall = (node) => {
  if (node.type !== "ExpressionStatement") return false;
  const { expression } = node;
  if (expression.type !== "CallExpression") return false;
  const { callee } = expression;

  // Only require spacing for specific function calls, not setters
  if (callee.type === "Identifier") {
    const funcName = callee.name;
    // Apply to timing functions and other utility functions first
    const spacingRequiredFunctions = ["setTimeout", "setInterval", "console", "alert"];

    if (spacingRequiredFunctions.includes(funcName)) {
      return true;
    }

    // Don't apply to setter functions (but only after checking specific allowed functions)
    if (funcName.startsWith("set") && funcName.length > 3) {
      return false;
    }
  }

  return false;
};

const getIsReturnPresent = (body) => {
  if (!body) return false;

  if (body.type === "BlockStatement") {
    if (!Array.isArray(body.body)) return false;

    return body.body.some((statement) => {
      if (statement.type === "ReturnStatement" && statement.argument) return true;

      if (statement.type === "IfStatement") {
        const consequentCheck = getIsReturnPresent(statement.consequent);
        const alternateCheck = statement.alternate ? getIsReturnPresent(statement.alternate) : false;
        return consequentCheck || alternateCheck;
      }

      if (statement.type === "TryStatement") {
        const blockCheck = getIsReturnPresent(statement.block);
        const handlerCheck = statement.handler ? getIsReturnPresent(statement.handler.body) : false;
        const finalizerCheck = statement.finalizer ? getIsReturnPresent(statement.finalizer) : false;
        return blockCheck || handlerCheck || finalizerCheck;
      }

      if (statement.type === "BlockStatement") {
        return getIsReturnPresent(statement);
      }

      return false;
    });
  }

  return false;
};

export const getIsReturn = (functionNode) => {
  if (functionNode.type === "ArrowFunctionExpression") {
    // Only check arrow functions with explicit block and return statements
    if (functionNode.body.type === "BlockStatement") {
      return getIsReturnPresent(functionNode.body);
    }

    // Skip implicit returns - can't reliably determine if void without types
    return false;
  }

  if (functionNode.type === "FunctionExpression" || functionNode.type === "FunctionDeclaration") {
    return getIsReturnPresent(functionNode.body);
  }

  return false;
};
