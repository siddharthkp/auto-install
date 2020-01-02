'use strict';

require('chai').should();
var helpers = require('../../lib/helpers');
var testData = require('./testData.js');

describe('filterRegistryModules', function () {
    var usedModules = helpers.getUsedModules(testData.includePath);
    it('should filter registry modules', function () {
        var filteredUsedModules = helpers.filterRegistryModules(usedModules);
        filteredUsedModules.length.should.be.equal(9);
        filteredUsedModules.should.have.deep.members(testData.filteredUsedModules);
    });
});