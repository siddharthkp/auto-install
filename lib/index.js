#!/usr/bin/env node
'use strict';

var helpers = require('./helpers');
var chokidar = require('chokidar');
var colors = require('colors');
var argv = require('yargs').argv;

var watchersInitialized = false;
var main = void 0;

/* Secure mode */

var secureMode = false;
if (argv.secure) secureMode = true;

var uninstallMode = true;
if (argv['dont-uninstall']) uninstallMode = false;

/* Watch files and repeat drill
 * Add a watcher, call main wrapper to repeat cycle
 */

var initializeWatchers = function initializeWatchers() {
    var watcher = chokidar.watch('**/*.js', {
        ignored: 'node_modules'
    });
    watcher.on('change', main).on('unlink', main);

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

main = function main() {
    if (!helpers.packageJSONExists()) {
        console.log(colors.red('package.json does not exist'));
        console.log(colors.red('You can create one by using `npm init`'));
        return;
    }

    var installedModules = [];
    installedModules = helpers.getInstalledModules();

    var usedModules = helpers.getUsedModules();
    usedModules = helpers.filterRegistryModules(usedModules);

    // removeUnusedModules

    if (uninstallMode) {
        var unusedModules = helpers.diff(installedModules, usedModules);
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
            for (var _iterator = unusedModules[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                var module = _step.value;
                helpers.uninstallModule(module);
            }
        } catch (err) {
            _didIteratorError = true;
            _iteratorError = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion && _iterator.return) {
                    _iterator.return();
                }
            } finally {
                if (_didIteratorError) {
                    throw _iteratorError;
                }
            }
        }
    }

    // installModules

    var modulesNotInstalled = helpers.diff(usedModules, installedModules);
    var _iteratorNormalCompletion2 = true;
    var _didIteratorError2 = false;
    var _iteratorError2 = undefined;

    try {
        for (var _iterator2 = modulesNotInstalled[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var _module = _step2.value;

            if (secureMode) helpers.installModuleIfTrusted(_module);else helpers.installModule(_module);
        }
    } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion2 && _iterator2.return) {
                _iterator2.return();
            }
        } finally {
            if (_didIteratorError2) {
                throw _iteratorError2;
            }
        }
    }

    helpers.cleanup();
    if (!watchersInitialized) initializeWatchers();
};

/* Turn the key */
main();