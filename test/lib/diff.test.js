'use strict';

require('chai').should();
var helpers = require('../../lib/helpers');
var testData = require('./testData.js');

describe('diff', function () {
    var installedModules = helpers.getInstalledModules();
    var usedModules = helpers.getUsedModules();
    usedModules = helpers.filterRegistryModules(usedModules);
    var unusedModules = helpers.diff(installedModules, usedModules);
    var modulesNotInstalled = helpers.diff(usedModules, installedModules);
    it('should return unusedModules', function () {
        unusedModules.should.deep.equal(testData.unusedModules);
    });
    it('should return modulesNotInstalled', function () {
        modulesNotInstalled.should.deep.equal(testData.modulesNotInstalled);
    });
});