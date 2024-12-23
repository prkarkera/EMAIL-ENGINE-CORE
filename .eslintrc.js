module.exports = {
  env: {
    es6: true,
    node: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: "tsconfig.json",
    sourceType: "module",
  },
  plugins: [
    "eslint-plugin-no-null",
    "eslint-plugin-jsdoc",
    "eslint-plugin-import",
    "eslint-plugin-prefer-arrow",
    "@typescript-eslint",
    "@typescript-eslint/tslint",
    "@stylistic",
  ],
  root: true,
  rules: {
    "@typescript-eslint/adjacent-overload-signatures": "error",
    "@typescript-eslint/array-type": [
      "error",
      {
        default: "array",
      },
    ],
    "@typescript-eslint/ban-types": "off",
    "@typescript-eslint/consistent-type-assertions": "error",
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "@stylistic/indent": "off",
    // "@stylistic/member-delimiter-style": [
    //   "error",
    //   {
    //     multiline: {
    //       delimiter: "semi",
    //       requireLast: true,
    //     },
    //     singleline: {
    //       delimiter: "semi",
    //       requireLast: false,
    //     },
    //   },
    // ],
    "@typescript-eslint/naming-convention": [
      "error",
      {
        selector: "variable",
        format: ["camelCase", "UPPER_CASE", "PascalCase"],
        leadingUnderscore: "allow",
        trailingUnderscore: "forbid",
      },
    ],
    "@typescript-eslint/naming-convention": [
      "error",
      {
        selector: ["class", "interface"],
        format: ["PascalCase"],
      },
    ],
    // @stylistic/indent: "error",
    "@typescript-eslint/no-empty-function": "error",
    "@typescript-eslint/no-empty-interface": "error",
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-misused-new": "error",
    "@typescript-eslint/no-namespace": "error",
    "@typescript-eslint/no-parameter-properties": "off",
    "@typescript-eslint/no-shadow": ["error", { "allow": ["error"] }],
    "@typescript-eslint/no-unused-expressions": "error",
    "@typescript-eslint/no-use-before-define": "off",
    "@typescript-eslint/no-var-requires": "error",
    "@typescript-eslint/prefer-for-of": "error",
    "@typescript-eslint/prefer-function-type": "error",
    "@typescript-eslint/prefer-namespace-keyword": "error",
    "@stylistic/quotes": [
      "error",
      "double",
      {
        avoidEscape: true,
        allowTemplateLiterals: true
      },
    ],
    "@stylistic/semi": "error",
    "@typescript-eslint/triple-slash-reference": [
      "error",
      {
        path: "always",
        types: "prefer-import",
        lib: "always",
      },
    ],
    "@typescript-eslint/typedef": "off",
    "@typescript-eslint/unified-signatures": "error",
    "@stylistic/brace-style": ["error", "1tbs", { allowSingleLine: true }],
    //below rules are whitespace equivalent
    "@stylistic/keyword-spacing": ["error", { after: true }], // check branch
    "@stylistic/space-before-blocks": ["error", "always"], // check declarations
    "@stylistic/space-infix-ops": "error", //check operators
    "@stylistic/comma-spacing": ["error", { before: false, after: true }], //check operators
    "@stylistic/semi-spacing": ["error", { before: false, after: true }], //check operators
    //below are typedef-whitespace equivalents
    "@stylistic/type-annotation-spacing": [
      "error",
      {
        before: false,
        after: true,
        overrides: {
          arrow: {
            before: true,
            after: true,
          },
          returnType: {
            before: false,
            after: true,
          },
          colon: {
            before: false,
            after: true,
          },
          parameter: {
            before: false,
            after: true,
          },
          property: {
            before: false,
            after: true,
          },
          variable: {
            before: false,
            after: true,
          },
        },
      },
    ],
    complexity: "off",
    "constructor-super": "error",
    "dot-notation": "off",
    eqeq: "off",
    "eqeqeq": ["error", "always", { "null": "ignore" }],
    "guard-for-in": "error",
    "id-denylist": [
      "error",
      "any",
      "Number",
      "number",
      "String",
      "string",
      "Boolean",
      "boolean",
      "Undefined",
      "undefined",
    ],
    "id-match": "error",
    "import/order": [
      "error",
      {
        alphabetize: {
          caseInsensitive: true,
          order: "asc",
        },
        groups: [
          ["builtin", "external"],
          "internal",
          "parent",
          "sibling",
          "index",
          "unknown",
        ],
      },
    ],
    //below are jsdoc format rules
    "jsdoc/check-alignment": "error",
    "jsdoc/check-indentation": "error",
    "max-classes-per-file": ["error", 1],
    "@stylistic/max-len": "off",
    "@stylistic/new-parens": "error",
    "no-bitwise": "error",
    "no-caller": "error",
    "no-cond-assign": "error",
    "no-console": "off",
    "no-debugger": "error",
    "no-empty": "error",
    "no-empty-function": "off",
    "no-eval": "error",
    "no-fallthrough": "off",
    "no-invalid-this": "off",
    "@stylistic/no-multiple-empty-lines": ["error", { max: 1 }],
    "no-new-wrappers": "error",
    "no-null/no-null": "error",
    "no-throw-literal": "error",
    "@stylistic/no-trailing-spaces": "error",
    "no-undef-init": "error",
    "no-underscore-dangle": "off",
    "no-unsafe-finally": "error",
    "no-unused-expressions": "off",
    "no-unused-labels": "error",
    "no-use-before-define": "off",
    "no-var": "error",
    "object-shorthand": "error",
    "one-var": ["error", "never"],
    "prefer-arrow/prefer-arrow-functions": [
      "error",
      {
        allowStandaloneDeclarations: true,
      },
    ],
    "prefer-const": "error",
    radix: "error",
    "@stylistic/spaced-comment": [
      "error",
      "always",
      { exceptions: ["-", "+"] },
    ],
    "use-isnan": "error",
    "valid-typeof": "off",
    "@typescript-eslint/no-unsafe-member-access": "off",
    "@typescript-eslint/no-unsafe-call": "off",
    "@typescript-eslint/no-unsafe-assignment": "off",
    "@typescript-eslint/no-unsafe-return": "off",
    "@typescript-eslint/no-unsafe-argument": "off",
    "@typescript-eslint/no-inferrable-types": "off",
    "@typescript-eslint/no-unnecessary-type-assertion": "off",
    "@typescript-eslint/consistent-type-assertions": "error",
    "@typescript-eslint/no-misused-promises": "off",
    "@typescript-eslint/require-await": "off",
    "@typescript-eslint/restrict-template-expressions": "off",
    "@typescript-eslint/no-floating-promises": "off",
    "@typescript-eslint/restrict-plus-operands": "off",
    "@typescript-eslint/no-implied-eval": "off",
    "@typescript-eslint/unbound-method": "off",
    "@typescript-eslint/no-unsafe-enum-comparison": "off",
    "@typescript-eslint/no-redundant-type-constituents": "off",
    "@typescript-eslint/no-array-constructor": "off",
    "@typescript-eslint/await-thenable": "off",
    "@typescript-eslint/no-base-to-string": "off",
    "max-classes-per-file": "off",
    "@typescript-eslint/no-unused-vars": "off",
    "no-async-promise-executor": "off",
    "no-case-declarations": "off",
    "no-unsafe-optional-chaining": "off",
    "no-useless-escape": "off"
  },
};
