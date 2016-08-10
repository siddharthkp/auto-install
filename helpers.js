'use strict'

const fs = require('fs');
const glob = require('glob');
const isBuiltInModule = require('is-builtin-module');
const syncExec = require("sync-exec");
const globArray = require('glob-array');
const ora = require('ora');
const logSymbols = require('log-symbols');
const argv = require('yargs').argv;
const request = require('sync-request');

/* Get installed modules
 * Read dependencies array from package.json
 */

let getInstalledModules = () => {
    let content = JSON.parse(readFile('package.json'));
    let installedModules = [];
    let installedDependencies = Object.assign(content.dependencies,content.devDependencies);
    for (let key in installedDependencies) installedModules.push(key);
    return installedModules;
};

/* Get used modules
 * Read all .js files and grep for modules
 */

let getUsedModules = () => {
    let files = getFiles();
    let testFiles = getTestFiles();
    let usedModules = [];
    for (let i = 0; i < files.length; i++) {
        let modulesFromFile = getModulesFromFile(files[i]);
        usedModules = usedModules.concat(modulesFromFile);
    }

    for (let j= 0; j < testFiles.length; j++) {
        let testModulesFromFile = getModulesFromFile(testFiles[j]);
        usedTestModules = usedTestModules.concat(testModulesFromFile);
    }
    // De-duplicate
    usedModules = usedModules.filter((module, position) => {
        return usedModules.indexOf(module) === position;
    });

    usedTestModules = usedTestModules.filter((module, position) => {
        return usedTestModules.indexOf(module) === position;
    });
    return {usedModules,usedTestModules};
};

/* Install module
 * Install given module
 */

let installModule = (module, type) => {
    type = type|"";
    let spinner = startSpinner('Installing ' + module, 'green');
    if (secureMode && !isModulePopular(module)) {
        stopSpinner(spinner, module + ' not trusted', 'yellow');
        return;
    }
    let success = runCommand('npm install ' + module + ' --save'+type);
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

/* Get all js files for test
 * Return path of all js files
 */
let getTestFiles = (path) => {
    let patterns = [
      "**/*.spec.js",
      "**/*.test.js"
    ];
    return globArray.sync(patterns, {'ignore': ['node_modules/**/*']});
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
    let modules = [];
    let matches = content.match(pattern);
    if (!matches) return modules;
    for(let i = 0; i < matches.length; i++) {
        let match = matches[i];
        match = match.replace('require', '');
        match = match.substring(2)
        match = match.substring(0, match.length - 2);
        if (isValidModule(match)) modules.push(match);
    }
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

