"use strict";

require('chai').should();

const helpers = require('../../lib/helpers');

const {
  execSync
} = require('child_process');

describe('packageJSONExists', () => {
  it('should return true', () => {
    helpers.packageJSONExists().should.equal(true);
  });
  it('should return false', () => {
    execSync('mv package.json package.json.disappeared');
    helpers.packageJSONExists().should.equal(false);
    execSync('mv package.json.disappeared package.json');
  });
});