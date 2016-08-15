#!/usr/bin/env node

const helpers = require('./helpers');
const chokidar = require('chokidar');
const colors = require('colors');

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
    if (!helpers.packageJSONExists()) {
        console.log(colors.red('package.json does not exist'));
        console.log(colors.red('You can create on by using `npm init`'));
        return;
    }

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

