require('chai').should();
const helpers = require('../../lib/helpers');
const testData = require('./testData.js');

describe('getInstalledModules', () => {
    it('should return installed modules', () => {
        helpers.getInstalledModules().should.deep.equal(testData.installedModules);
    });
});

