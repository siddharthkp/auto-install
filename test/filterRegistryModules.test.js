require('chai').should();
const helpers = require('../src/helpers');
const testData = require('./testData.js');

describe('filterRegistryModules', () => {
    let usedModules = helpers.getUsedModules();
    it('should filter registry modules', () => {
        console.log(helpers.filterRegistryModules(usedModules));
        helpers.filterRegistryModules(usedModules).should.deep.equal(testData.filteredUsedModules);
    });
});

