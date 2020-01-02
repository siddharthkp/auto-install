'use strict';

require('chai').should();
var helpers = require('../../lib/helpers');
var testData = require('./testData.js');

describe('getUsedModules', function () {
    it('should return used modules', function () {
        var usedModules = helpers.getUsedModules(testData.includePath);
        usedModules.length.should.be.equal(11);
        usedModules.should.have.deep.members(testData.usedModules);
    });
});