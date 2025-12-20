// To do: use a library instead
export const defaultImportsFirst = {
  meta: {
    type: "problem",
    docs: {
      description: "Enforce default imports before named imports"
    },
    fixable: "code",
    schema: []
  },
  create: (context) => ({
    Program: (node) => {
      const imports = [];
      const sourceCode = context.getSourceCode();

      // Collect all import declarations
      node.body.forEach((statement) => {
        if (statement.type === "ImportDeclaration") {
          const isDefaultImport = statement.specifiers.some((spec) => spec.type === "ImportDefaultSpecifier");
          const isNamedImport = statement.specifiers.some((spec) => spec.type === "ImportSpecifier");
          const isSideEffectImport = statement.specifiers.length === 0;

          imports.push({
            node: statement,
            isDefault: isDefaultImport,
            isNamed: isNamedImport,
            isSideEffect: isSideEffectImport,
            text: sourceCode.getText(statement)
          });
        }
      }); // Check if named imports come before default imports

      const isViolation = imports.some((importInfo, index) => {
        if (importInfo.isSideEffect) return false; // Skip side-effect imports

        if (importInfo.isNamed) {
          // Check if there's a default import before this named import
          const isDefaultBefore = imports.slice(0, index).some((prev) => prev.isDefault && !prev.isSideEffect);

          return isDefaultBefore;
        }

        return false;
      });

      if (isViolation) {
        const firstViolatingImport = imports.find((importInfo, index) => {
          if (importInfo.isNamed && !importInfo.isSideEffect) {
            const isDefaultBefore = imports.slice(0, index).some((prev) => prev.isDefault && !prev.isSideEffect);

            return isDefaultBefore;
          }

          return false;
        });

        context.report({
          node: firstViolatingImport.node,
          message: "Named imports should come before default imports",
          fix: (fixer) => {
            // Sort the imports: named first, then defaults, then side-effects
            const namedImports = imports.filter((imp) => imp.isNamed && !imp.isSideEffect);
            const defaultImports = imports.filter((imp) => imp.isDefault && !imp.isSideEffect);
            const sideEffectImports = imports.filter((imp) => imp.isSideEffect);

            const sortedImports = [
              ...namedImports.sort((a, b) => a.text.localeCompare(b.text)),
              ...defaultImports.sort((a, b) => a.text.localeCompare(b.text)),
              ...sideEffectImports.sort((a, b) => a.text.localeCompare(b.text))
            ];

            const fixes = [];

            imports.forEach((importInfo, index) => {
              if (sortedImports[index]) {
                fixes.push(fixer.replaceText(importInfo.node, sortedImports[index].text));
              }
            });

            return fixes;
          }
        });
      }
    }
  })
};
