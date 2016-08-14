#!/usr/bin/env node

const helpers = require('./helpers');
const chokidar = require("chokidar");

let watchersInitialized = false;
let main;

/* Watch files and repeat drill
 * Add a watcher, call main wrapper to repeat cycle
 */

let initializeWatchers = () => {
    let watcher = chokidar.watch('**/*.js', {
        ignored: 'node_modules'
    });
    watcher.on('change', main)
    .on('unlink', main);

    watchersInitialized = true;
    console.log('Watchers initialized');
};

/* Main wrapper
 * Get installed modules from package.json
 * Get used modules from all files
 * Install used modules that are not installed
 * Remove installed modules that are not used
 * After setup, initialize watchers
 */

main = () => {
    let installedModules = [];
    installedModules = helpers.getInstalledModules();

    let usedModules = helpers.getUsedModules();
    usedModules = helpers.filterRegistryModules(usedModules);

    // installModules
    let modulesNotInstalled = helpers.diff(usedModules, installedModules);
    for (let module of modulesNotInstalled) helpers.installModule(module);

    // removeUnusedModules

    let unusedModules = helpers.diff(installedModules, usedModules);
    for (let module of unusedModules) helpers.uninstallModule(module);

    helpers.reinstall();
    if (!watchersInitialized) initializeWatchers();
};

/* Turn the key */
main();

