import { promises } from "fs";
import { join } from "path";
import { sync as globSync } from "glob";
import { parse } from "@babel/parser";
import { traverse } from "@babel/core";

const cwd = process.cwd();
const exports = {};

const getAST = async ({ file }) =>
  parse(await promises.readFile(join(cwd, file), "utf8"), {
    sourceType: "module",
    plugins: []
  });

const analyzeExports = async ({ file }) => {
  const ast = await getAST({ file });

  traverse(ast, {
    ExportNamedDeclaration: (path) => {
      const { declaration, loc } = path.node;
      const { declarations } = declaration || {};
      const { line } = loc.start;

      declarations?.forEach(({ id }) => {
        exports[id.name] = { file, isUsed: false, line };
      });
    }
  });
};

const analyzeUsage = async ({ file }) => {
  const ast = await getAST({ file });

  traverse(ast, {
    ImportSpecifier: ({ node }) => {
      const { name } = node.imported;

      if (exports[name]) {
        exports[name].isUsed = true;
      }
    }
  });
};

const main = async () => {
  try {
    const files = globSync("**/*.js", {
      cwd,
      ignore: ["**/node_modules/**", "utils/downloader-util.js"]
    });

    await Promise.all(files.map((file) => analyzeExports({ file })));
    await Promise.all(files.map((file) => analyzeUsage({ file })));

    const unusedExports = Object.entries(exports)
      .filter(([, { isUsed }]) => !isUsed)
      .map(([name, { file, line }]) => ({ name, file, line }));

    if (unusedExports.length > 0) {
      console.error("Unimported Exports:");
      unusedExports.forEach(({ name, file, line }) => console.error(`${name} (${file}:${line})`));
      process.exit(1);
    }

    console.log("No unimported exports found");
  } catch (error) {
    console.error("error:", error);
    process.exit(1);
  }
};

main();
