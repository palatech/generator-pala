const path = require("path");
const fs = require("fs-extra");
const helpers = require("yeoman-test");
const assert = require("yeoman-assert");
const _ = require("lodash");

const TMP_DIR = path.join(__dirname, "tmp");

const DEFAULT_PROMPTS = {
  moduleName: "Project",
  typescript: false,
  framework: "none",
  tooling: [],
  installer: "No thanks",
  nodeVersion: 14
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
      .withPrompts({...DEFAULT_PROMPTS});
    // @TODO: NOTES/ Jest array equality requires order to be same.
    const dirContents = await fs.readdir(TMP_DIR);
    expect(dirContents).toEqual(["package.json"]);
  });
});

describe("Generator: ESLint", () => {
  it("should copy across an ESLint file when `eslint` checked as tooling", async () => {
    await helpers
      .run(path.join(__dirname, "..", "generators", "app"))
      .cd(TMP_DIR)
      .withPrompts({...DEFAULT_PROMPTS, tooling: ['eslint']});
    const dirContents = await fs.readdir(TMP_DIR);
    expect(_.sortBy(dirContents)).toEqual(
      _.sortBy(["package.json", ".eslintrc"])
    );
  });
});
