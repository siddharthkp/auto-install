'use strict';

var fs = require('fs');
var glob = require('glob');
var isBuiltInModule = require('is-builtin-module');
var syncExec = require('sync-exec');
var ora = require('ora');
var logSymbols = require('log-symbols');
var request = require('request');
var detective = require('detective');
var es6detective = require('detective-es6');
var colors = require('colors');
var argv = require('yargs').argv;
var packageJson = require('package-json');
require('./includes-polyfill');

/* File reader
 * Return contents of given file
 */
var readFile = function readFile(path) {
    var content = fs.readFileSync(path, 'utf8');
    return content;
};

/* Get installed modules
 * Read dependencies array from package.json
 */

var getInstalledModules = function getInstalledModules() {
    var content = JSON.parse(readFile('package.json'));
    var installedModules = [];

    var dependencies = content.dependencies || {};
    var devDependencies = content.devDependencies || {};

    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
        for (var _iterator = Object.keys(dependencies)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var key = _step.value;

            installedModules.push({
                name: key,
                dev: false
            });
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

    var _iteratorNormalCompletion2 = true;
    var _didIteratorError2 = false;
    var _iteratorError2 = undefined;

    try {
        for (var _iterator2 = Object.keys(devDependencies)[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var _key = _step2.value;

            installedModules.push({
                name: _key,
                dev: true
            });
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

    return installedModules;
};

/* Get all js files
 * Return path of all js files
 */
var getFiles = function getFiles() {
    return glob.sync('**/*.js', { ignore: ['node_modules/**/*'] });
};

/* Check for valid string - to stop malicious intentions */

var isValidModule = function isValidModule(_ref) {
    var name = _ref.name;

    var regex = new RegExp('^([a-z0-9-_]{1,})$');
    return regex.test(name);
};

/* Find modules from file
 * Returns array of modules from a file
 */

var getModulesFromFile = function getModulesFromFile(path) {
    var content = fs.readFileSync(path, 'utf8');
    var modules = [];
    try {
        modules = detective(content, { parse: { sourceType: 'module' } });

        var es6modules = es6detective(content, { parse: { sourceType: 'module' } });
        modules = modules.concat(es6modules);

        modules = modules.filter(function (module) {
            return isValidModule(module);
        });
    } catch (err) {
        console.log(colors.red('Could not parse ' + path + '. There is a syntax error in file'));
    }
    return modules;
};

/* Is test file?
 * [.spec.js, .test.js] are supported test file formats
 */

var isTestFile = function isTestFile(name) {
    return name.endsWith('.spec.js') || name.endsWith('.test.js');
};

/* Dedup similar modules
 * Deduplicates list
 * Ignores/assumes type of the modules in list
*/

var deduplicateSimilarModules = function deduplicateSimilarModules(modules) {
    var dedupedModules = [];
    var dedupedModuleNames = [];

    var _iteratorNormalCompletion3 = true;
    var _didIteratorError3 = false;
    var _iteratorError3 = undefined;

    try {
        for (var _iterator3 = modules[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
            var _module = _step3.value;

            if (!dedupedModuleNames.includes(_module.name)) {
                dedupedModules.push(_module);
                dedupedModuleNames.push(_module.name);
            }
        }
    } catch (err) {
        _didIteratorError3 = true;
        _iteratorError3 = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion3 && _iterator3.return) {
                _iterator3.return();
            }
        } finally {
            if (_didIteratorError3) {
                throw _iteratorError3;
            }
        }
    }

    return dedupedModules;
};

/* Dedup modules
 * Divide modules into prod and dev
 * Deduplicates each list
 */

var deduplicate = function deduplicate(modules) {
    var dedupedModules = [];

    var testModules = modules.filter(function (module) {
        return module.dev;
    });
    dedupedModules = dedupedModules.concat(deduplicateSimilarModules(testModules));

    var prodModules = modules.filter(function (module) {
        return !module.dev;
    });
    dedupedModules = dedupedModules.concat(deduplicateSimilarModules(prodModules));

    return dedupedModules;
};

/* Get used modules
 * Read all .js files and grep for modules
 */

var getUsedModules = function getUsedModules() {
    var files = getFiles();
    var usedModules = [];
    var _iteratorNormalCompletion4 = true;
    var _didIteratorError4 = false;
    var _iteratorError4 = undefined;

    try {
        for (var _iterator4 = files[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
            var fileName = _step4.value;

            var modulesFromFile = getModulesFromFile(fileName);
            var dev = isTestFile(fileName);
            var _iteratorNormalCompletion5 = true;
            var _didIteratorError5 = false;
            var _iteratorError5 = undefined;

            try {
                for (var _iterator5 = modulesFromFile[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
                    var name = _step5.value;
                    usedModules.push({ name: name, dev: dev });
                }
            } catch (err) {
                _didIteratorError5 = true;
                _iteratorError5 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion5 && _iterator5.return) {
                        _iterator5.return();
                    }
                } finally {
                    if (_didIteratorError5) {
                        throw _iteratorError5;
                    }
                }
            }
        }
    } catch (err) {
        _didIteratorError4 = true;
        _iteratorError4 = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion4 && _iterator4.return) {
                _iterator4.return();
            }
        } finally {
            if (_didIteratorError4) {
                throw _iteratorError4;
            }
        }
    }

    usedModules = deduplicate(usedModules);
    return usedModules;
};

/* Handle error
 * Pretty error message for common errors
 */

var handleError = function handleError(err) {
    if (err.includes('E404')) {
        console.log(colors.red('Module is not in the npm registry.'));
    } else if (err.includes('ENOTFOUND')) {
        console.log(colors.red('Could not connect to npm, check your internet connection!'));
    } else console.log(colors.red(err));
};

/* Command runner
 * Run a given command
 */

var runCommand = function runCommand(command) {
    var response = syncExec(command);
    if (response.stderr) {
        console.log();
        handleError(response.stderr);
    }
    return !response.status; // status = 0 for success
};

/* Show pretty outputs
 * Use ora spinners to show what's going on
 */

var startSpinner = function startSpinner(message, type) {
    var spinner = ora();
    spinner.text = message;
    spinner.color = type;
    spinner.start();
    return spinner;
};

var stopSpinner = function stopSpinner(spinner, message, type) {
    spinner.stop();
    if (!message) return;
    var symbol = void 0;
    if (type === 'red') symbol = logSymbols.error;else if (type === 'yellow') symbol = logSymbols.warning;else symbol = logSymbols.success;
    console.log(symbol, message);
};

/* Is module popular? - for secure mode */

var POPULARITY_THRESHOLD = 10000;
var isModulePopular = function isModulePopular(name, callback) {
    var spinner = startSpinner('Checking ' + name, 'yellow');
    var url = 'https://api.npmjs.org/downloads/point/last-month/' + name;
    request(url, function (error, response, body) {
        stopSpinner(spinner);
        if (error && error.code === 'ENOTFOUND') {
            console.log(colors.red('Could not connect to npm, check your internet connection!'));
        } else {
            var downloads = JSON.parse(body).downloads;
            callback(downloads > POPULARITY_THRESHOLD);
        }
    });
};

/* Get install command
 *
 * Depends on package manager, dev and exact
 */

var getInstallCommand = function getInstallCommand(name, dev) {
    var packageManager = 'npm';
    if (argv.yarn) packageManager = 'yarn';

    var command = void 0;

    if (packageManager === 'npm') {
        command = 'npm install ' + name + ' --save';
        if (dev) command += '-dev';
        if (argv.exact) command += ' --save-exact';
    } else if (packageManager === 'yarn') {
        command = 'yarn add ' + name;
        if (dev) command += ' --dev';
        // yarn always adds exact
    }
    return command;
};

/* Install module
 * Install given module
 */

var installModule = function installModule(_ref2) {
    var name = _ref2.name;
    var dev = _ref2.dev;

    var spinner = startSpinner('Installing ' + name, 'green');

    var command = getInstallCommand(name, dev);

    var message = name + ' installed';
    if (dev) message += ' in devDependencies';

    var success = runCommand(command);
    if (success) stopSpinner(spinner, message, 'green');else stopSpinner(spinner, name + ' installation failed', 'yellow');
};

/* is scoped module? */

var isScopedModule = function isScopedModule(name) {
    return name[0] === '@';
};

/* Install module if author is trusted */

var installModuleIfTrustedAuthor = function installModuleIfTrustedAuthor(_ref3) {
    var name = _ref3.name;
    var dev = _ref3.dev;

    var trustedAuthor = argv['trust-author'];
    packageJson(name).then(function (json) {
        if (json.author && json.author.name === trustedAuthor) installModule({ name: name, dev: dev });else console.log(colors.red(name + ' not trusted'));
    });
};

/* Install module if trusted
 * Call isModulePopular before installing
 */

var installModuleIfTrusted = function installModuleIfTrusted(_ref4) {
    var name = _ref4.name;
    var dev = _ref4.dev;

    // Trust scoped modules
    if (isScopedModule(name)) installModule({ name: name, dev: dev });else {
        isModulePopular(name, function (popular) {
            // Popular as proxy for trusted
            if (popular) installModule({ name: name, dev: dev });
            // Trusted Author
            else if (argv['trust-author']) installModuleIfTrustedAuthor({ name: name, dev: dev });
                // Not trusted
                else console.log(colors.red(name + ' not trusted'));
        });
    }
};

/* Get uninstall command
 *
 * Depends on package manager
 */

var getUninstallCommand = function getUninstallCommand(name) {
    var packageManager = 'npm';
    if (argv.yarn) packageManager = 'yarn';

    var command = void 0;

    if (packageManager === 'npm') command = 'npm uninstall ' + name + ' --save';else if (packageManager === 'yarn') command = 'yarn remove ' + name;

    return command;
};

/* Uninstall module */

var uninstallModule = function uninstallModule(_ref5) {
    var name = _ref5.name;
    var dev = _ref5.dev;

    if (dev) return;

    var command = getUninstallCommand(name);
    var message = name + ' removed';

    var spinner = startSpinner('Uninstalling ' + name, 'red');
    runCommand(command);
    stopSpinner(spinner, message, 'red');
};

/* Remove built in/native modules */

var removeBuiltInModules = function removeBuiltInModules(modules) {
    return modules.filter(function (module) {
        return !isBuiltInModule(module.name);
    });
};

/* Remove local files that are required */

var removeLocalFiles = function removeLocalFiles(modules) {
    return modules.filter(function (module) {
        return !module.name.includes('./');
    });
};

/* Remove file paths from module names
 * Example: convert `colors/safe` to `colors`
 */

var removeFilePaths = function removeFilePaths(modules) {
    var _iteratorNormalCompletion6 = true;
    var _didIteratorError6 = false;
    var _iteratorError6 = undefined;

    try {
        for (var _iterator6 = modules[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
            var _module2 = _step6.value;

            var slicedName = _module2.name.split('/')[0];
            if (slicedName.substr(0, 1) !== '@') _module2.name = slicedName;
        }
    } catch (err) {
        _didIteratorError6 = true;
        _iteratorError6 = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion6 && _iterator6.return) {
                _iterator6.return();
            }
        } finally {
            if (_didIteratorError6) {
                throw _iteratorError6;
            }
        }
    }

    return modules;
};

/* Filter registry modules */

var filterRegistryModules = function filterRegistryModules(modules) {
    return removeBuiltInModules(removeFilePaths(removeLocalFiles(modules)));
};

/* Get module names from array of module objects */

var getNamesFromModules = function getNamesFromModules(modules) {
    return modules.map(function (module) {
        return module.name;
    });
};

/* Modules diff */

var diff = function diff(first, second) {
    var namesFromSecond = getNamesFromModules(second);
    return first.filter(function (module) {
        return !namesFromSecond.includes(module.name);
    });
};

/* Reinstall modules */

var cleanup = function cleanup() {
    var spinner = startSpinner('Cleaning up', 'green');
    if (argv.yarn) runCommand('yarn');else runCommand('npm install');
    stopSpinner(spinner);
};

/* Does package.json exist?
 * Without package.json, most of the functionality fails
 *     installing + adding to package.json
 *     removing unused modules
 */

var packageJSONExists = function packageJSONExists() {
    return fs.existsSync('package.json');
};

/* Public helper functions */

module.exports = {
    getInstalledModules: getInstalledModules,
    getUsedModules: getUsedModules,
    filterRegistryModules: filterRegistryModules,
    installModule: installModule,
    installModuleIfTrusted: installModuleIfTrusted,
    uninstallModule: uninstallModule,
    diff: diff,
    cleanup: cleanup,
    packageJSONExists: packageJSONExists
};