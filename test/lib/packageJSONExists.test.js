'use strict';

require('chai').should();
var helpers = require('../../lib/helpers');
var {execSync} = require('child_process');

describe('packageJSONExists', function () {
    it('should return true', function () {
        helpers.packageJSONExists().should.equal(true);
    });

    it('should return false', function () {
        execSync('mv package.json package.json.disappeared');
        helpers.packageJSONExists().should.equal(false);
        execSync('mv package.json.disappeared package.json');
    });
});
