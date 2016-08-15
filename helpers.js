const fs = require('fs');
const glob = require('glob');
const isBuiltInModule = require('is-builtin-module');
const syncExec = require('sync-exec');
const ora = require('ora');
const logSymbols = require('log-symbols');
const argv = require('yargs').argv;
const request = require('sync-request');
const detective = require('detective');
const colors = require('colors');

/* Secure mode */

let secureMode = false;
if (argv.secure) secureMode = true;

/* File reader
 * Return contents of given file
 */
let readFile = (path) => {
    let content = fs.readFileSync(path, 'utf8');
    return content;
};

/* Get installed modules
 * Read dependencies array from package.json
 */

let getInstalledModules = () => {
    let content = JSON.parse(readFile('package.json'));
    let installedModules = [];

    for (let key of Object.keys(content.dependencies)) {
        installedModules.push({
            name: key,
            dev: false
        });
    }
    if (content.devDependencies) {
        for (let key of Object.keys(content.devDependencies)) {
            installedModules.push({
                name: key,
                dev: true
            });
        }
    }

    return installedModules;
};

/* Get all js files
 * Return path of all js files
 */
let getFiles = () => glob.sync('**/*.js', {ignore: ['node_modules/**/*']});

/* Check for valid string - to stop malicious intentions */

let isValidModule = ({name}) => {
    let regex = new RegExp('^([a-z0-9-_]{1,})$');
    return regex.test(name);
};

/* Find modules from file
 * Returns array of modules from a file
 */

let getModulesFromFile = (path) => {
    let content = fs.readFileSync(path, 'utf8');
    let modules = detective(content);
    modules = modules.filter((module) => isValidModule(module));
    return modules;
};

/* Is test file?
 * [.spec.js, .test.js] are supported test file formats
 */

let isTestFile = (name) => (name.endsWith('.spec.js') || name.endsWith('.test.js'));

/* Dedup similar modules
 * Deduplicates list
 * Ignores/assumes type of the modules in list
*/

let deduplicateSimilarModules = (modules) => {
    let dedupedModules = [];
    let dedupedModuleNames = [];

    for (let module of modules) {
        if (dedupedModuleNames.indexOf(module.name) === -1) {
            dedupedModules.push(module);
            dedupedModuleNames.push(module.name);
        }
    }

    return dedupedModules;
};

/* Dedup modules
 * Divide modules into prod and dev
 * Deduplicates each list
 */

let deduplicate = (modules) => {
    let dedupedModules = [];

    let testModules = modules.filter(module => module.dev);
    dedupedModules = dedupedModules.concat(deduplicateSimilarModules(testModules));

    let prodModules = modules.filter(module => !module.dev);
    dedupedModules = dedupedModules.concat(deduplicateSimilarModules(prodModules));

    return dedupedModules;
};

/* Get used modules
 * Read all .js files and grep for modules
 */

let getUsedModules = () => {
    let files = getFiles();
    let usedModules = [];
    for (let fileName of files) {
        let modulesFromFile = getModulesFromFile(fileName);
        let dev = isTestFile(fileName);
        for (let name of modulesFromFile) usedModules.push({name, dev});
    }
    usedModules = deduplicate(usedModules);
    return usedModules;
};

/* Command runner
 * Run a given command
 */

let runCommand = (command) => {
    let response = syncExec(command);
    if (response.stderr) {
        console.log();
        console.log(colors.red(response.stderr));
    }
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

/* Is module popular? - for secure mode */

const POPULARITY_THRESHOLD = 10000;
let isModulePopular = (name) => {
    let url = `https://api.npmjs.org/downloads/point/last-month/${name}`;
    request('GET', url, (error, response, body) => {
        let downloads = JSON.parse(body).downloads;
        return (downloads > POPULARITY_THRESHOLD);
    });
};

/* Install module
 * Install given module
 */

let installModule = ({name, dev}) => {
    let spinner = startSpinner(`Installing ${name}`, 'green');
    if (secureMode && !isModulePopular(name)) {
        stopSpinner(spinner, `${name} not trusted`, 'yellow');
        return;
    }

    let command = `npm install ${name} --save`;
    let message = `${name} installed`;

    if (dev) command += '-dev';
    if (dev) message += ' in devDependencies';

    let success = runCommand(command);
    if (success) stopSpinner(spinner, message, 'green');
    else stopSpinner(spinner, `${name} installation failed`, 'yellow');
};

/* Uninstall module */

let uninstallModule = ({name, dev}) => {
    if (dev) return;

    let command = `npm uninstall ${name} --save`;
    let message = `${name} removed`;

    let spinner = startSpinner(`Uninstalling ${name}`, 'red');
    runCommand(command);
    stopSpinner(spinner, message, 'red');
};

/* Remove built in/native modules */

let removeBuiltInModules = (modules) => modules.filter((module) => !isBuiltInModule(module.name));

/* Remove local files that are required */

let removeLocalFiles = (modules) => modules.filter((module) => (module.name.indexOf('./') !== 0));

/* Filter registry modules */

let filterRegistryModules = (modules) => removeBuiltInModules(removeLocalFiles(modules));

/* Get module names from array of module objects */

let getNamesFromModules = (modules) => modules.map(module => module.name);

/* Modules diff */

let diff = (first, second) => {
    let namesFromSecond = getNamesFromModules(second);
    return first.filter(module => namesFromSecond.indexOf(module.name) < 0);
};

/* Reinstall modules */

let reinstall = () => {
    let spinner = startSpinner('Cleaning up', 'green');
    runCommand('npm install');
    stopSpinner(spinner);
};

/* Does package.json exist?
 * Without package.json, most of the functionality fails
 *     installing + adding to package.json
 *     removing unused modules
 */

let packageJSONExists = () => fs.existsSync('package.json');

/* Public helper functions */

module.exports = {
    getInstalledModules,
    getUsedModules,
    filterRegistryModules,
    installModule,
    uninstallModule,
    diff,
    reinstall,
    packageJSONExists
};

