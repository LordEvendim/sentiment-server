module.exports = {
  root: true,
  extends: ["custom"],
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: ["./tsconfig.json"],
  },
  rules: {
    "@typescript-eslint/no-misused-promises": "off",
  },
};
