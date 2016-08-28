'use strict';

require('chai').should();
var helpers = require('../../lib/helpers');
var testData = require('./testData.js');

describe('filterRegistryModules', function () {
    var usedModules = helpers.getUsedModules();
    it('should filter registry modules', function () {
        helpers.filterRegistryModules(usedModules).should.deep.equal(testData.filteredUsedModules);
    });
});