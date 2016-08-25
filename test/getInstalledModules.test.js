require('chai').should();
const helpers = require('../src/helpers');
const testData = require('./testData.js');

describe('getInstalledModules', () => {
    it('should return installed modules', () => {
        helpers.getInstalledModules().should.deep.equal(testData.installedModules);
    });
});

