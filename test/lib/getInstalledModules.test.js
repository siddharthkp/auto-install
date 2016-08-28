'use strict';

require('chai').should();
var helpers = require('../../lib/helpers');
var testData = require('./testData.js');

describe('getInstalledModules', function () {
    it('should return installed modules', function () {
        helpers.getInstalledModules().should.deep.equal(testData.installedModules);
    });
});