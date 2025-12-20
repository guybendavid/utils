import { blankLineAfterSetters } from "./rules/blank-line-after-setters.js";
import { blankLineBeforeMultilineReturn } from "./rules/blank-line-before-multiline-return.js";
import { defaultImportsFirst } from "./rules/default-imports-first.js";
import { noBlockEventHandlers } from "./rules/no-block-event-handlers.js";
import { noGetPrefixForVoid } from "./rules/no-get-prefix-for-void.js";
import { noHardcodedStrings } from "./rules/no-hardcoded-strings.js";
import { noInlineExports } from "./rules/no-inline-exports.js";
import { paddingAroundMultilineStatements } from "./rules/padding-around-multiline-statements.js";
import { preferBooleanIsPrefix } from "./rules/prefer-boolean-is-prefix.js";
import { preferDirectFunctionReference } from "./rules/prefer-direct-function-reference.js";
import { preferGetPrefix } from "./rules/prefer-get-prefix.js";
import { requireObjectDestructuring } from "./rules/require-object-destructuring.js";

export const customRuleMap = {
  "blank-line-after-setters": blankLineAfterSetters,
  "blank-line-before-multiline-return": blankLineBeforeMultilineReturn,
  "default-imports-first": defaultImportsFirst,
  "no-block-event-handlers": noBlockEventHandlers,
  "no-get-prefix-for-void": noGetPrefixForVoid,
  "no-hardcoded-strings": noHardcodedStrings,
  "no-inline-exports": noInlineExports,
  "padding-around-multiline-statements": paddingAroundMultilineStatements,
  "prefer-boolean-is-prefix": preferBooleanIsPrefix,
  "prefer-direct-function-reference": preferDirectFunctionReference,
  "prefer-get-prefix": preferGetPrefix,
  "require-object-destructuring": requireObjectDestructuring
};
