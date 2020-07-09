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

module.exports = class extends Generator {
  init() {
    return this.prompt([
      {
        name: "moduleName",
        message: "What do you want to name your module?",
        default: this.appname.replace(/\s/g, "-"),
        filter: (x) => kebabCase(x).toLowerCase(),
      },
      {
        name: "description",
        message: `What's the project description?`,
        type: "input",
      },
      {
        name: "projectTemplate",
        message: "Which project template would you like to use?",
        type: "list",
        choices: ["minimal", "create-react-app", "gatsby", "expo"],
      },
      {
        name: "typescript",
        message: "Does this project use TypeScript?",
        type: "confirm",
      },
      {
        name: "packageManager",
        message: "Which package manager do you want for installation?",
        type: "list",
        choices: ["npm", "yarn", "No installation please"],
      },
    ]).then((props) => {
      // Bank the answers.
      this.answers = props;

      let cliInstalled = false;

      const cliInstaller = (projectType) => {
        if (projectType === "create-react-app") {
          this.spawnCommandSync("npx", [
            "create-react-app",
            ...(props.typescript ? ["--template", "typescript"] : []),
            ...(props.packageManager === "npm" ? ["--usenpm"] : []),
            ".",
          ]);
          this.spawnCommandSync("rm", [".gitignore", "README.md"])
          if (props.packageManager === "npm") {
            this.spawnCommandSync("npm", [
              "i",
              "--save-dev",
              ...ESLINT_REACT_DEPS,
              ...STAGING_DEPS,
              ...FORMATTING_DEPS,
              ...(props.typescript ? ESLINT_TS_DEPS : []),
            ]);
          } else if (props.packageManager === "yarn") {
            this.spawnCommandSync("yarn", [
              "add",
              "--dev",
              ...ESLINT_REACT_DEPS,
              ...STAGING_DEPS,
              ...FORMATTING_DEPS,
              ...(props.typescript ? ESLINT_TS_DEPS : []),
            ]);
          }
          cliInstalled = true;
        }
      };

      // Do any CLI installing if required.
      cliInstaller(props.projectTemplate);

      const mv = (from, to) => {
        this.fs.move(this.destinationPath(from), this.destinationPath(to));
      };
      console.log(this.templatePath());

      this.fs.copyTpl(
        [
          `${this.templatePath()}/**`,
          `!${this.templatePath()}/**/_tsconfig.json`,
        ],
        this.destinationPath(),
        props
      );


      if (!cliInstalled) {
        mv("_package.json", "package.json");
      }
      else {
        this.fs.delete(this.destinationPath("_package.json"))
      }

      mv("gitattributes", ".gitattributes");
      mv("gitignore", ".gitignore");
      mv("npmrc", ".npmrc");
      mv("prettierrc", ".prettierrc");
      mv("prettierignore", ".prettierignore");
      mv("lintstagedrc", ".lintstagedrc");
      mv("eslint.js", ".eslintrc.js");
      mv("eslintignore", ".eslintignore");
      mv("huskyrc", ".huskyrc");

      if (props.typescript && props.projectTemplate !== "create-react-app") {
        mkdirp(path.join(this.destinationPath("local_types")));
        this.fs.copyTpl(
          [`${this.templatePath()}/**/_tsconfig.json`],
          this.destinationPath(),
          props
        );
        mv("_tsconfig.json", "tsconfig.json");
      }
    });
  }
  install() {
    this.spawnCommand("git", ["init"]);
    if (this.answers.packageManager === "npm") {
      this.npmInstall();
    } else if (this.answers.packageManager === "yarn") {
      this.yarnInstall();
    }
  }
};
