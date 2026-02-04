import { getStrictifyConfig } from "strictify";

const eslintConfig = [
  ...(await getStrictifyConfig({
    projectConfigPath: "./jsconfig.json"
  })),
  {
    rules: {
      // To do: enable and refactor
      "strictify/no-hardcoded-strings": "off"
    }
  }
];

export default eslintConfig;
