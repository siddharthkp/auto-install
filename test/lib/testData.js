'use strict';

var installedModules = [{ name: 'request', dev: false }, { name: 'sync-exec', dev: false }, { name: 'yargs', dev: false }, { name: 'mocha', dev: true }];

var usedModules = [{ name: 'chai', dev: true }, { name: 'chokidar', dev: false }, { name: 'yargs', dev: false }, { name: 'fs', dev: false }, { name: '../src/helpers', dev: false }, { name: '@siddharthkp/auto-install', dev: false }, { name: 'lodash/memoize', dev: false }, { name: 'request', dev: false }, { name: 'ava', dev: false }, { name: 'async', dev: false }];

var unusedModules = [{ name: 'sync-exec', dev: false }, { name: 'mocha', dev: true }];

var modulesNotInstalled = [{ name: 'chai', dev: true }, { name: 'chokidar', dev: false }, { name: '@siddharthkp/auto-install', dev: false }, { name: 'lodash', dev: false }, { name: 'ava', dev: false }, { name: 'async', dev: false }];

var filteredUsedModules = [{ name: 'chai', dev: true }, { name: 'chokidar', dev: false }, { name: 'yargs', dev: false }, { name: '@siddharthkp/auto-install', dev: false }, { name: 'lodash', dev: false }, { name: 'request', dev: false }, { name: 'ava', dev: false }, { name: 'async', dev: false }];

module.exports = {
    installedModules: installedModules,
    usedModules: usedModules,
    unusedModules: unusedModules,
    modulesNotInstalled: modulesNotInstalled,
    filteredUsedModules: filteredUsedModules
};