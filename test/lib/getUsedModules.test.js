'use strict';

require('chai').should();
var helpers = require('../../lib/helpers');
var testData = require('./testData.js');

describe('getUsedModules', function () {
    it('should return used modules', function () {
        helpers.getUsedModules().should.deep.equal(testData.usedModules);
    });
});