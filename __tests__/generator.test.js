const path = require("path");
const fs = require("fs-extra");
const helpers = require("yeoman-test");
const assert = require("yeoman-assert");
const _ = require("lodash");
const YAML = require('yaml');
const readline = require("readline");
import { ESLINT_STANDARD_DEVDEPS } from "../generators/app/dependencies";

const TMP_DIR = path.join(__dirname, "tmp");

const DEFAULT_PROMPTS = {
  moduleName: "Project",
  framework: "none",
  react: false,
  tooling: [],
  installer: "No thanks",
  nodeVersion: 16,
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
  it("should copy across an .eslintrc when `eslint` checked as tooling", async () => {
    await helpers
      .run(path.join(__dirname, "..", "generators", "app"))
      .cd(TMP_DIR)
      .withPrompts({ ...DEFAULT_PROMPTS, tooling: ["eslint"] })
      .withOptions({ force: true });
    const dirContents = await fs.readdir(TMP_DIR);
    expect(_.sortBy(dirContents)).toEqual(
      _.sortBy(["package.json", ".eslintrc.js"])
    );
  });

  it("should overwrite existing .eslintrc file with --force", async () => {
    fs.writeFileSync(path.join(TMP_DIR, ".eslintrc"), "{}");
    await helpers
      .run(path.join(__dirname, "..", "generators", "app"))
      .cd(TMP_DIR)
      .withPrompts({ ...DEFAULT_PROMPTS, tooling: ["eslint"] })
      .withOptions({ force: true });
    const esLintContents = require(path.join(TMP_DIR, ".eslintrc.js"));
    expect(Object.keys(esLintContents).length).toBeTruthy();
  });

  it("should only extend the eslint-config-airbnb-typescript/base setup as the default", async () => {
    await helpers
      .run(path.join(__dirname, "..", "generators", "app"))
      .cd(TMP_DIR)
      .withPrompts({ ...DEFAULT_PROMPTS, tooling: ["eslint"] })
      .withOptions({ force: true });
    const esLintContents = require(path.join(TMP_DIR, ".eslintrc.js"));
    expect(Object.keys(esLintContents)).toContain("extends");
    expect(esLintContents.extends).toEqual([
      "eslint-config-airbnb-typescript/base",
    ]);
  });

  it("should add the standard ESLint devDependencies as default", async () => {
    await helpers
      .run(path.join(__dirname, "..", "generators", "app"))
      .cd(TMP_DIR)
      .withPrompts({
        ...DEFAULT_PROMPTS,
        tooling: ["eslint"],
      })
      .withOptions({ force: true });
    const packageJsonContents = fs.readJsonSync(
      path.join(TMP_DIR, "package.json")
    );
    expect(packageJsonContents.devDependencies).toEqual({
      ...ESLINT_STANDARD_DEVDEPS,
      "left-pad": "^1.3.0",
    });
  });
});

describe('Generator: GQL codegen', () => {
  it('should create a stub codegen.yml file', async () => {
    // Run generator.
    await helpers
      .run(path.join(__dirname, "..", "generators", "app"))
      .cd(TMP_DIR)
      .withPrompts({
        ...DEFAULT_PROMPTS,
        tooling: ["gql-codegen"]
      })
      .withOptions({ force: true });
    const yamlString = fs.readFileSync(path.join(TMP_DIR, "codegen.yml"), "utf8")
    const yamlContents = YAML.parse(yamlString)

    expect(yamlContents.schema).toEqual("schema.graphql")
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
        tooling: ["nvmrc"]
      })
      .withOptions({ force: true });
    // Read the file.
    const fileStream = fs.createReadStream(path.join(TMP_DIR, ".nvmrc"), {encoding: "utf-8"});
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity
    });
    let line1;
    for await (const line of rl) {
      line1 = line;
      break
    }
    expect(parseInt(line1)).toBeLessThan(20)
    expect(parseInt(line1)).toBeGreaterThanOrEqual(10)
  });
});
