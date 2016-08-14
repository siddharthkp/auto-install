'use strict'

const fs = require('fs');
const glob = require('glob');
const isBuiltInModule = require('is-builtin-module');
const syncExec = require("sync-exec");
const ora = require('ora');
const logSymbols = require('log-symbols');
const argv = require('yargs').argv;
const request = require('sync-request');
const detective = require('detective');


/* Get installed modules
 * Read dependencies array from package.json
 */

let getInstalledModules = () => {
    let content = JSON.parse(readFile('package.json'));
    let installedModules = [];
    for (let key in content.dependencies) installedModules.push(key);
    return installedModules;
};

/* Get used modules
 * Read all .js files and grep for modules
 */

let getUsedModules = () => {
    let files = getFiles();
    let usedModules = [];
    for (let i = 0; i < files.length; i++) {
        let modulesFromFile = getModulesFromFile(files[i]);
        usedModules = usedModules.concat(modulesFromFile);
    }
    console.log(usedModules);
    // De-duplicate
    usedModules = usedModules.filter((module, position) => {
        return usedModules.indexOf(module) === position;
    });
    return usedModules;
};

/* Install module
 * Install given module
 */

let installModule = (module) => {
    let spinner = startSpinner('Installing ' + module, 'green');
    if (secureMode && !isModulePopular(module)) {
        stopSpinner(spinner, module + ' not trusted', 'yellow');
        return;
    }
    let success = runCommand('npm install ' + module + ' --save');
    if (success) stopSpinner(spinner, module + ' installed', 'green');
    else stopSpinner(spinner, module + ' installation failed', 'yellow');
};

/* Uninstall module */

let uninstallModule = (module) => {
    let spinner = startSpinner('Uninstalling ' + module, 'red');
    runCommand('npm uninstall ' + module + ' --save');
    stopSpinner(spinner, module + ' removed', 'red');
};

/* Command runner
 * Run a given command
 */

let runCommand = (command) => {
    let response = syncExec(command);
    return !response.status; // status = 0 for success
};

/* Show pretty outputs
 * Use ora spinners to show what's going on
 */

let startSpinner = (message, type) => {
    let spinner = ora();
    spinner.text = message;
    spinner.color = type;
    spinner.start();
    return spinner;
};

let stopSpinner = (spinner, message, type) => {
    spinner.stop();
    if (!message) return;
    let symbol;
    if (type === 'red') symbol = logSymbols.error;
    else if (type === 'yellow') symbol = logSymbols.warning;
    else symbol = logSymbols.success;
    console.log(symbol, message);
};

/* Get all js files
 * Return path of all js files
 */
let getFiles = (path) => {
    return glob.sync("**/*.js", {'ignore': ['node_modules/**/*']});
};

/* File reader
 * Return contents of given file
 */
let readFile = (path) => {
    let content = fs.readFileSync(path, 'utf8');
    return content;
};

/* Find modules from file
 * Returns array of modules from a file
 */

let pattern = /require\((.*?)\)/g;

let getModulesFromFile = (path) => {
    let content = fs.readFileSync(path, 'utf8');
    let modules = detective(content);
    modules = modules.filter((module) => isValidModule(module));
    return modules;
};

/* Check for valid string - to stop malicious intentions */

let isValidModule = (module) => {
    let regex = new RegExp("^([a-z0-9-_]{1,})$");
    return regex.test(module);
};

/* Filter registry modules */

let filterRegistryModules = (modules) => {
    modules = removeBuiltInModules(modules);
    modules = removeLocalFiles(modules);
    return modules;
};

/* Remove built in/native modules */

let removeBuiltInModules = (modules) => {
    modules = modules.filter((module) => {
        return !isBuiltInModule(module);
    });
    return modules;
};

/* Remove local files that are required */

let removeLocalFiles = (modules) => {
    modules = modules.filter((module) => {
        return (module.indexOf('./') !== 0)
    });
    return modules;
};

/* Array diff prototype */

Array.prototype.diff = function(a) {
    return this.filter(function(i) {return a.indexOf(i) < 0;});
};

/* Reinstall modules */

let reinstall = () => {
    let spinner = startSpinner('Cleaning up', 'green');
    runCommand('npm install');
    stopSpinner(spinner);
};

/* Secure mode */

let secureMode = false;
if (argv.secure) secureMode = true;

/* Is module popular? - for secure mode */

const POPULARITY_THRESHOLD = 10000;
let isModulePopular = (module) => {
    let result = request('GET', 'https://api.npmjs.org/downloads/point/last-month/' + module);
    let downloads = JSON.parse(result.body).downloads;
    return (downloads > POPULARITY_THRESHOLD);
};

/* Public helper functions */

module.exports = {
    getInstalledModules,
    getUsedModules,
    filterRegistryModules,
    installModule,
    uninstallModule,
    reinstall
};

