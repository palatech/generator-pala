const path = require("path");
const mkdirp = require("mkdirp");
const Generator = require("yeoman-generator");
const {
  PRETTIER_STANDARD_DEVDEPS,
  ESLINT_STANDARD_DEVDEPS,
  HUSKY_LINTSTAGED_STANDARD_DEVDEPS,
} = require("./dependencies");

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
        message: "Which framework are you using?",
        type: "list",
        choices: ["none", "gatsby"],
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

    // Decant the dependencies into the package.json
    this.fs.extendJSON(`${this.destinationPath()}/package.json`, {
      devDependencies: newDevDependencies,
    });
  }

  install() {
    if (this.answers.packageManager === "npm") {
      this.npmInstall();
    } else if (this.answers.packageManager === "yarn") {
      this.yarnInstall();
    }
  }
};
