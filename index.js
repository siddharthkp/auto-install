'use strict';

const helpers = require('./helpers');
const chokidar = require('chokidar');

/* Main wrapper
 * Get installed modules from package.json
 * Get used modules from all files
 * Install used modules that are not installed
 * Remove installed modules that are not used
 * After setup, initialize watchers
 */

let main = () => {
    let installedModules = [];
    installedModules = helpers.getInstalledModules();

    let usedModules = helpers.getUsedModules();
    usedModules = helpers.filterRegistryModules(usedModules);

    //installModules
    let modulesNotInstalled = usedModules.diff(installedModules);
    for (let i = 0; i < modulesNotInstalled.length; i++) helpers.installModule(modulesNotInstalled[i]);

    //removeUnusedModules
    let unusedModules = installedModules.diff(usedModules);
    for (let i = 0; i < unusedModules.length; i++) helpers.uninstallModule(unusedModules[i]);

    helpers.reinstall();
    if (!watchersInitialized) initializeWatchers();
};

/* Watch files and repeat drill
 * Add a watcher, call main wrapper to repeat cycle
 */

let watchersInitialized = false;

let initializeWatchers = () => {
    let watcher = chokidar.watch('**/*.js', {
        ignored: 'node_modules'
    });
    watcher.on('change', main)
    .on('unlink', main);

    watchersInitialized = true;
    console.log('Watchers initialized');
}

/* Turn the key */
main();

