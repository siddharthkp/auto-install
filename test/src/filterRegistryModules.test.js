require('chai').should();
const helpers = require('../../lib/helpers');
const testData = require('./testData.js');

describe('filterRegistryModules', () => {
    let usedModules = helpers.getUsedModules();
    it('should filter registry modules', () => {
        helpers.filterRegistryModules(usedModules).should.deep.equal(testData.filteredUsedModules);
    });
});

