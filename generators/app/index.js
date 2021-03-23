const path = require("path");
const mkdirp = require("mkdirp");
const Generator = require("yeoman-generator");
const kebabCase = require("lodash.kebabcase");

const STAGING_DEPS = ["husky", "lint-staged"];
const LINTING_DEPS = ["eslint"];
const FORMATTING_DEPS = ["prettier"];
const ESLINT_TS_DEPS = [
  "@typescript-eslint/eslint-plugin",
  "@typescript-eslint/parser",
];
const ESLINT_REACT_DEPS = [
  "eslint-config-airbnb",
  "eslint-config-blvd",
  "eslint-config-prettier",
  "eslint-config-react-app",
  "eslint-plugin-flowtype",
  "eslint-plugin-import",
  "eslint-plugin-jsx-a11y",
  "eslint-plugin-prettier",
  "eslint-plugin-react",
  "eslint-plugin-react-hooks",
];

const PRETTIER_STANDARD_DEVDEPS = {
  prettier: "^2.2.1",
};

const ESLINT_STANDARD_DEVDEPS = {
  eslint: "^7.22.0",
  "eslint-config-kentcdodds": "^17.5.0",
  "babel-plugin-module-resolver": "^4.1.0",
  "eslint-plugin-import": "^2.2.1",
  "eslint-import-resolver-babel-module": "^5.2.0",
  "eslint-plugin-react": "^7.23.0",
};

const HUSKY_LINTSTAGED_STANDARD_DEVDEPS = {
  husky: "^5.2.0",
  "lint-staged": "^10.5.4",
};

function getPrettierDevDeps(framework) {
  return PRETTIER_STANDARD_DEVDEPS;
}

function getEslintDevDeps(framework) {
  return ESLINT_STANDARD_DEVDEPS;
}

module.exports = class extends Generator {
  async prompting() {
    const answers = await this.prompt([
      {
        name: "moduleName",
        message: "What do you want to name your module?",
        default: this.appname.replace(/\s/g, "-"),
      },
      {
        name: "typescript",
        message: "Does this project use TypeScript?",
        type: "confirm",
      },
      {
        name: "framework",
        message: "Which project template would you like to use?",
        type: "list",
        choices: ["gatsby"],
      },
      {
        name: "tooling",
        message: "Which tooling would you like to use?",
        type: "checkbox",
        choices: ["eslint"],
      },
      {
        name: "nodeVersion",
        message: "Which node version are you using?",
        type: "list",
        choices: [14, 12, 10],
      },
      {
        name: "installer",
        message: "Which package manager do you want for installation?",
        type: "list",
        choices: ["npm", "yarn", "No thanks"],
      },
    ]);
    this.answers = answers;
  }

  writing() {
    const { typescript, framework, tooling } = this.answers;

    let newDevDependencies = {};

    if (this.answers.tooling.includes("eslint")) {
      newDevDependencies = {
        ...newDevDependencies,
        ...getEslintDevDeps(framework),
      };
      this.fs.copyTpl(
        `${this.templatePath()}/eslintrc.ejs`,
        `${this.destinationPath()}/.eslintrc`,
        this.answers
      );
    }
  }

  install() {
    if (this.answers.packageManager === "npm") {
      this.npmInstall();
    } else if (this.answers.packageManager === "yarn") {
      this.yarnInstall();
    }
  }
};
