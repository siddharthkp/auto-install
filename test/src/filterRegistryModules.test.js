require('chai').should();
const helpers = require('../../lib/helpers');
const testData = require('./testData.js');

describe('filterRegistryModules', () => {
    let usedModules = helpers.getUsedModules(testData.includePath);
    it('should filter registry modules', () => {
        const filteredUsedModules = helpers.filterRegistryModules(usedModules);
        filteredUsedModules.length.should.be.equal(9);
        filteredUsedModules.should.have.deep.members(testData.filteredUsedModules);
    });
});

