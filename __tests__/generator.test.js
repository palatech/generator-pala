const path = require("path");
const fs = require("fs-extra");
const helpers = require("yeoman-test");
const assert = require("yeoman-assert");
const _ = require("lodash");
const YAML = require("yaml");
const readline = require("readline");
import {
  ESLINT_STANDARD_DEVDEPS,
  GRAPHQL_CODEGEN_STANDARD_DEPS,
} from "../generators/app/dependencies";

const TMP_DIR = path.join(__dirname, "tmp");

const DEFAULT_PROMPTS = {
  moduleName: "Project",
  framework: "none",
  react: false,
  tooling: [],
};

// Prep the temp directory each time with fixtures.
beforeEach(() => {
  fs.ensureDirSync(TMP_DIR);
  fs.copySync(
    path.join(__dirname, "fixtures", "fixture_package.json"),
    path.join(TMP_DIR, "package.json")
  );
});

// Delete the temp directory after each test.
afterEach(() => {
  if (fs.pathExistsSync(TMP_DIR)) {
    fs.removeSync(TMP_DIR);
  }
});

describe("Generator: general", () => {
  it("should run jest", () => {
    expect(true).toBeTruthy();
  });

  it("should run as a no-op with no tooling selected", async () => {
    await helpers
      // Run in the generator directory to create context.
      .run(path.join(__dirname, "..", "generators", "app"))
      // @TODO: NOTES/ `inDir` auto cleans the directory. Use cd.
      // Change into where we want to run the generator.
      .cd(TMP_DIR)
      // Specify responses to the prompts.
      .withPrompts({ ...DEFAULT_PROMPTS })
      .withOptions({ force: true });
    // @TODO: NOTES/ Jest array equality requires order to be same.
    const dirContents = await fs.readdir(TMP_DIR);
    expect(dirContents).toEqual(["package.json"]);
  });
});

describe("Generator: ESLint", () => {
  const runGenerator = async () => {
    await helpers
      .run(path.join(__dirname, "..", "generators", "app"))
      .cd(TMP_DIR)
      .withPrompts({ ...DEFAULT_PROMPTS, tooling: ["eslint"] })
      .withOptions({ force: true });
  };

  it("should copy across an .eslintrc when `eslint` checked as tooling", async () => {
    await runGenerator();

    const dirContents = await fs.readdir(TMP_DIR);
    expect(_.sortBy(dirContents)).toEqual(
      _.sortBy(["package.json", ".eslintrc.js"])
    );
  });

  it("should overwrite existing .eslintrc file with --force", async () => {
    fs.writeFileSync(path.join(TMP_DIR, ".eslintrc"), "{}");
    await runGenerator();

    const esLintContents = require(path.join(TMP_DIR, ".eslintrc.js"));
    expect(Object.keys(esLintContents).length).toBeTruthy();
  });

  it("should only extend the eslint-config-airbnb-typescript/base and rec setup as the default", async () => {
    await runGenerator();

    const esLintContents = require(path.join(TMP_DIR, ".eslintrc.js"));
    expect(Object.keys(esLintContents)).toContain("extends");
    expect(esLintContents.extends).toEqual([
      "eslint-config-airbnb-typescript/base",
      "plugin:@typescript-eslint/recommended",
    ]);
  });

  it("should add the standard ESLint devDependencies as default", async () => {
    await runGenerator();

    const packageJsonContents = fs.readJsonSync(
      path.join(TMP_DIR, "package.json")
    );
    expect(packageJsonContents.devDependencies).toEqual({
      ...ESLINT_STANDARD_DEVDEPS,
      "left-pad": "^1.3.0",
    });
  });
});

describe("Generator: git hooks", () => {
  it("should add simple-git-hooks and lint-staged config to package.json", async () => {
    await helpers
      .run(path.join(__dirname, "..", "generators", "app"))
      .cd(TMP_DIR)
      .withPrompts({
        ...DEFAULT_PROMPTS,
        tooling: ["git-hooks"],
      })
      .withOptions({ force: true });
    const packageJsonContents = fs.readJsonSync(
      path.join(TMP_DIR, "package.json")
    );
    expect(packageJsonContents["simple-git-hooks"]).toBeDefined();
    expect(packageJsonContents["lint-staged"]).toBeDefined();
  });
});

describe("Generator: graphql", () => {
  const runGenerator = async () => {
    await helpers
      .run(path.join(__dirname, "..", "generators", "app"))
      .cd(TMP_DIR)
      .withPrompts({
        ...DEFAULT_PROMPTS,
        tooling: ["graphql"],
      })
      .withOptions({ force: true });
  };

  it("should create a stub codegen.yml file", async () => {
    await runGenerator();
    const yamlString = fs.readFileSync(
      path.join(TMP_DIR, "codegen.yml"),
      "utf8"
    );
    const yamlContents = YAML.parse(yamlString);

    expect(yamlContents.schema).toBeDefined();
  });

  it("should add a gql codegen script", async () => {
    await runGenerator();

    const packageJsonContents = fs.readJsonSync(
      path.join(TMP_DIR, "package.json")
    );

    expect(packageJsonContents.scripts["gql-codegen"]).toBeDefined();
  });

  it("should add graphql to the existing dependencies", async () => {
    await runGenerator();

    const packageJsonContents = fs.readJsonSync(
      path.join(TMP_DIR, "package.json")
    );
    expect(packageJsonContents.dependencies).toEqual({
      ...GRAPHQL_CODEGEN_STANDARD_DEPS,
      cowsay: "^1.4.0",
    });
  });
});

describe("Generator: SVGR", () => {
  const runGenerator = async () => {
    await helpers
      .run(path.join(__dirname, "..", "generators", "app"))
      .cd(TMP_DIR)
      .withPrompts({
        ...DEFAULT_PROMPTS,
        tooling: ["svgr"],
      })
      .withOptions({ force: true });
  };

  it("should add an .svgo.yml config", async () => {
    await runGenerator();

    const yamlString = fs.readFileSync(path.join(TMP_DIR, ".svgo.yml"), "utf8");
    const yamlContents = YAML.parse(yamlString);

    expect(yamlContents.plugins).toBeDefined();
  });
});

describe("Generator: misc.", () => {
  it("should write an .nvmrc file with appropriate node version", async () => {
    // Run generator.
    await helpers
      .run(path.join(__dirname, "..", "generators", "app"))
      .cd(TMP_DIR)
      .withPrompts({
        ...DEFAULT_PROMPTS,
        tooling: ["nvmrc"],
      })
      .withOptions({ force: true });
    // Read the file.
    const fileStream = fs.createReadStream(path.join(TMP_DIR, ".nvmrc"), {
      encoding: "utf-8",
    });
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity,
    });
    let line1;
    for await (const line of rl) {
      line1 = line;
      break;
    }
    expect(parseInt(line1)).toBeLessThan(20);
    expect(parseInt(line1)).toBeGreaterThanOrEqual(10);
  });
});
