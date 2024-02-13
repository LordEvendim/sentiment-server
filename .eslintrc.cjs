module.exports = {
  root: true,
  extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
  parserOptions: {
    project: ["./tsconfig.json"],
    sourceType: "module",
    ecmaVersion: "latest",
  },
  ignorePatterns: ["dist", ".eslintrc.cjs", "drizzle.config.ts"],
  parser: "@typescript-eslint/parser",
  plugins: ["simple-import-sort", "import"],
  rules: {
    "@typescript-eslint/no-misused-promises": "off",
    "simple-import-sort/imports": "error",
    "simple-import-sort/exports": "error",
    "import/first": "error",
    "import/newline-after-import": "error",
    "import/no-duplicates": "error",
  },
};
