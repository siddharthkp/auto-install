#!/usr/bin/env node
"use strict";

function _createForOfIteratorHelper(o) { if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (o = _unsupportedIterableToArray(o))) { var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var it, normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

var helpers = require('./helpers');

var chokidar = require('chokidar');

var colors = require('colors');

var argv = require('yargs').argv;

var watchersInitialized = false;
var main;
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
  usedModules = helpers.filterRegistryModules(usedModules); // removeUnusedModules

  if (uninstallMode) {
    var unusedModules = helpers.diff(installedModules, usedModules);

    var _iterator = _createForOfIteratorHelper(unusedModules),
        _step;

    try {
      for (_iterator.s(); !(_step = _iterator.n()).done;) {
        var module = _step.value;
        helpers.uninstallModule(module);
      }
    } catch (err) {
      _iterator.e(err);
    } finally {
      _iterator.f();
    }
  } // installModules


  var modulesNotInstalled = helpers.diff(usedModules, installedModules);

  var _iterator2 = _createForOfIteratorHelper(modulesNotInstalled),
      _step2;

  try {
    for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
      var _module = _step2.value;
      if (secureMode) helpers.installModuleIfTrusted(_module);else helpers.installModule(_module);
    }
  } catch (err) {
    _iterator2.e(err);
  } finally {
    _iterator2.f();
  }

  helpers.cleanup();
  if (!watchersInitialized) initializeWatchers();
};
/* Turn the key */


main();