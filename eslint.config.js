// Shared ESLint configuration.
export default [
  {
    ignores: ["node_modules/**"],
  },
  {
    files: ["**/*.js"],

    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",

      // Globals used across Node.js and browser modules.
      globals: {
        console: "readonly",
        process: "readonly",
        URL: "readonly",
        document: "readonly",
        window: "readonly",
        fetch: "readonly",
        localStorage: "readonly",
      },
    },

    rules: {
      "no-undef": "error",
      "no-unused-vars": "warn",
      eqeqeq: "error",
    },
  },
];
