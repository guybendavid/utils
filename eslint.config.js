import { configs } from "strictify";

const eslintConfig = [
  ...(await configs.getRecommendedConfig()),
  {
    rules: {
      // To do: enable and refactor
      "strictify/no-hardcoded-strings": "off"
    }
  }
];

export default eslintConfig;
