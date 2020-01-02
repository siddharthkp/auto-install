require('chai').should();
const helpers = require('../../lib/helpers');
const testData = require('./testData.js');

describe('getUsedModules', () => {
    it('should return used modules', () => {
        const usedModules = helpers.getUsedModules(testData.includePath);
        usedModules.length.should.be.equal(11);
        usedModules.should.have.deep.members(testData.usedModules);
    });
});
