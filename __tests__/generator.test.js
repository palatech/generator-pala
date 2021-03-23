const path = require('path');
const fs = require('fs-extra');
const helpers = require('yeoman-test');
const assert = require('yeoman-assert');

const TMP_DIR = path.join(__dirname, 'tmp')

beforeAll(() => {
  if (fs.pathExistsSync(TMP_DIR)) {
    fs.removeSync(TMP_DIR)
  }
  fs.ensureDirSync(TMP_DIR)
})

describe("Main generator: general", () => {
  it('test suite is running', () => {
    expect(true).toBeTruthy();
  });

  it('should run as a no-op', async () => {

  });
})

describe("ESLint generator: general", () => {
  it('test suite is running', () => {
    expect(true).toBeTruthy();
  })
})
