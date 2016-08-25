// Good old require
const chokidar = require('chokidar');

// Require with a attribute
const argv = require('yargs').argv;

// Require in-built module (these are ignored)
const fs = require('fs');

// Require files
const helpers = require('../src/helpers');

// Require scoped modules
const autoInstall = require('@siddharthkp/auto-install');

