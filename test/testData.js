let installedModules = [
    {name: 'yargs', dev: false},
    {name: 'sync-exec', dev: true},
    {name: 'mocha', dev: true}
];

let usedModules = [
    {name: 'chai', dev: true},
    {name: '../src/helpers', dev: true},
    {name: './testData.js', dev: true},
    {name: 'sync-exec', dev: true}
];

let unusedModules = [
    /* Not actually unused
     * lint + test modules are assumed to be unused
     */
    {name: 'yargs', dev: false},
    {name: 'mocha', dev: true}
];

let modulesNotInstalled = [
    {name: 'chai', dev: true}
];

let filteredUsedModules = [
    {name: 'chai', dev: true},
    {name: 'sync-exec', dev: true}
];

module.exports = {
    installedModules,
    usedModules,
    unusedModules,
    modulesNotInstalled,
    filteredUsedModules
};
