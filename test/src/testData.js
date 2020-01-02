let includePath = '**/*.{j,t}s';

let installedModules = [
    {name: 'request', dev: false},
    {name: 'yargs', dev: false},
    {name: 'mocha', dev: true}
];

let usedModules = [
    {name: 'chai', dev: true},
    {name: 'chokidar', dev: false},
    {name: 'yargs', dev: false},
    {name: 'fs', dev: false},
    {name: '../src/helpers', dev: false},
    {name: '@siddharthkp/auto-install', dev: false},
    {name: 'lodash/memoize', dev: false},
    {name: 'request', dev: false},
    {name: 'async', dev: false},
    {name: 'ava', dev: false},
    {name: 'mongodb', dev: false}
];

let unusedModules = [
    {name: 'mocha', dev: true}
];

let modulesNotInstalled = [
    {name: 'chai', dev: true},
    {name: 'chokidar', dev: false},
    {name: '@siddharthkp/auto-install', dev: false},
    {name: 'lodash', dev: false},
    {name: 'ava', dev: false},
    {name: 'async', dev: false},
    {name: 'mongodb', dev: false}
];

let filteredUsedModules = [
    {name: 'chai', dev: true},
    {name: 'chokidar', dev: false},
    {name: 'yargs', dev: false},
    {name: '@siddharthkp/auto-install', dev: false},
    {name: 'lodash', dev: false},
    {name: 'request', dev: false},
    {name: 'ava', dev: false},
    {name: 'async', dev: false},
    {name: 'mongodb', dev: false}
];

module.exports = {
    includePath,
    installedModules,
    usedModules,
    unusedModules,
    modulesNotInstalled,
    filteredUsedModules
};
