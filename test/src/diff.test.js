require('chai').should();
const helpers = require('../../lib/helpers');
const testData = require('./testData.js');

describe('diff', () => {
    let installedModules = helpers.getInstalledModules();
    let usedModules = helpers.getUsedModules();
    usedModules = helpers.filterRegistryModules(usedModules);
    let unusedModules = helpers.diff(installedModules, usedModules);
    let modulesNotInstalled = helpers.diff(usedModules, installedModules);
    it('should return unusedModules', () => {
        unusedModules.should.deep.equal(testData.unusedModules);
    });
    it('should return modulesNotInstalled', () => {
        modulesNotInstalled.should.deep.equal(testData.modulesNotInstalled);
    });
});

