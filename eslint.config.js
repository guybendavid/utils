import { getStrictifyConfig } from "strictify";

const eslintConfig = [
  ...(await getStrictifyConfig()),
  {
    rules: {
      // To do: enable and refactor
      "strictify/no-hardcoded-strings": "off"
    }
  }
];

export default eslintConfig;
