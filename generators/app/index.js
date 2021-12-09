const path = require("path");
const mkdirp = require("mkdirp");
const Generator = require("yeoman-generator");
const {
  PRETTIER_STANDARD_DEVDEPS,
  ESLINT_STANDARD_DEVDEPS,
  LINTSTAGED_STANDARD_DEVDEPS, GRAPHQL_CODEGEN_STANDARD_DEVDEPS, GRAPHQL_CODEGEN_STANDARD_DEPS,
} = require("./dependencies");

function getPrettierDevDeps(framework) {
  return PRETTIER_STANDARD_DEVDEPS;
}

function getEslintDevDeps(framework) {
  return ESLINT_STANDARD_DEVDEPS;
}

module.exports = class extends Generator {
  async prompting() {
    this.answers = await this.prompt([
      {
        name: "moduleName",
        message: "What do you want to name your module?",
        default: this.appname.replace(/\s/g, "-"),
      },
      {
        name: "react",
        message: "Does this project use React?",
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
        choices: ["eslint", "prettier", "git-hooks", "nvmrc", "svgr", "graphql"],
      },
      {
        name: "installer",
        message: "Which package manager do you want for installation?",
        type: "list",
        choices: ["npm", "yarn", "No thanks"],
      },
    ]);
  }

  writing() {
    const {framework, tooling} = this.answers;

    let newDevDependencies = {};
    let newDependencies = {};
    let newScripts = {}

    if (tooling.includes("eslint")) {
      newDevDependencies = {
        ...newDevDependencies,
        ...getEslintDevDeps(framework),
      };
      this.fs.copyTpl(
        `${this.templatePath()}/eslintrc.ejs`,
        `${this.destinationPath()}/.eslintrc.js`,
        this.answers
      );
    }

    if (tooling.includes("prettier")) {
      newDevDependencies = {
        ...newDevDependencies,
        ...getPrettierDevDeps(framework),
      };
      this.fs.copyTpl(
        `${this.templatePath()}/prettierrc`,
        `${this.destinationPath()}/.prettierrc`,
        this.answers
      );
    }

    if (tooling.includes("git-hooks")) {
      newDevDependencies = {
        ...newDevDependencies,
        ...LINTSTAGED_STANDARD_DEVDEPS,
      };
      this.fs.copyTpl(
        `${this.templatePath()}/eslintrc.ejs`,
        `${this.destinationPath()}/.eslintrc.js`,
        this.answers
      );
      this.fs.extendJSON(`${this.destinationPath()}/package.json`, {
        "simple-git-hooks": {
          "pre-commit": "npx lint-staged",
        },
        "lint-staged": {
          ...tooling.includes("eslint") ? {
            "*.+(js|jsx|ts|tsx)":
              [
                "eslint"
              ]
          } : {},
          ...tooling.includes("eslint") ? {
            "*.+(js|jsx|json|yml|yaml|less|scss|ts|tsx|md|graphql|mdx)": [
              "prettier --write"
            ]
          } : {}
        },
      });
    }

    if (tooling.includes("graphql")) {
      this.fs.copyTpl(
        `${this.templatePath()}/codegen.yml`,
        `${this.destinationPath()}/codegen.yml`,
        this.answers
      )
      newDevDependencies = {...newDevDependencies, ...GRAPHQL_CODEGEN_STANDARD_DEVDEPS}
      newDependencies = {...newDependencies, ...GRAPHQL_CODEGEN_STANDARD_DEPS}
      newScripts = {...newScripts, "gql-codegen": "graphql-codegen --config codegen.yml"}
    }

    // Decant the dependencies into the package.json
    this.fs.extendJSON(`${this.destinationPath()}/package.json`, {
      devDependencies: newDevDependencies,
      dependencies: newDependencies,
      scripts: newScripts
    });

    if (tooling.includes("nvmrc")) {
      this.fs.write(`${this.destinationPath()}/.nvmrc`, `${process.version.split('.')[0].slice(1)}\n`)
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
