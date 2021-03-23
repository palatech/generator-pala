const path = require("path");
const fs = require("fs-extra");
const helpers = require("yeoman-test");
const assert = require("yeoman-assert");
const _ = require("lodash");
import { ESLINT_STANDARD_DEVDEPS } from "../generators/app/dependencies";

const TMP_DIR = path.join(__dirname, "tmp");

const DEFAULT_PROMPTS = {
  moduleName: "Project",
  typescript: false,
  framework: "none",
  tooling: [],
  installer: "No thanks",
  nodeVersion: 14,
};

beforeEach(() => {
  fs.ensureDirSync(TMP_DIR);
  fs.copySync(
    path.join(__dirname, "fixtures", "fixture_package.json"),
    path.join(TMP_DIR, "package.json")
  );
});
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
      .run(path.join(__dirname, "..", "generators", "app"))
      // @TODO: NOTES/ `inDir` cleans the directory. Use cd.
      .cd(TMP_DIR)
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
      _.sortBy(["package.json", ".eslintrc"])
    );
  });

  it("should overwrite existing .eslintrc file with --force", async () => {
    fs.writeFileSync(path.join(TMP_DIR, ".eslintrc"), "{}");
    await helpers
      .run(path.join(__dirname, "..", "generators", "app"))
      .cd(TMP_DIR)
      .withPrompts({ ...DEFAULT_PROMPTS, tooling: ["eslint"] })
      .withOptions({ force: true });
    const esLintContents = fs.readJsonSync(path.join(TMP_DIR, ".eslintrc"));
    expect(Object.keys(esLintContents).length).toBeTruthy();
  });

  it("should only extend the kentcdodds setup as the default", async () => {
    await helpers
      .run(path.join(__dirname, "..", "generators", "app"))
      .cd(TMP_DIR)
      .withPrompts({ ...DEFAULT_PROMPTS, tooling: ["eslint"] })
      .withOptions({ force: true });
    const esLintContents = fs.readJsonSync(path.join(TMP_DIR, ".eslintrc"));
    expect(Object.keys(esLintContents)).toEqual(["extends"]);
    expect(esLintContents.extends).toEqual(["kentcdodds"]);
  });

  it("should extend kentcdodds/react for the gatsby framework", async () => {
    await helpers
      .run(path.join(__dirname, "..", "generators", "app"))
      .cd(TMP_DIR)
      .withPrompts({
        ...DEFAULT_PROMPTS,
        tooling: ["eslint"],
        framework: "gatsby",
      })
      .withOptions({ force: true });
    const esLintContents = fs.readJsonSync(path.join(TMP_DIR, ".eslintrc"));
    expect(esLintContents.extends).toEqual(["kentcdodds", "kentcdodds/react"]);
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
