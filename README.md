#### auto-install

[![Build
Status](https://travis-ci.org/siddharthkp/auto-install.svg)](https://travis-ci.org/siddharthkp/auto-install)
[![npm](https://img.shields.io/npm/v/auto-install.svg?maxAge=3600)](https://www.npmjs.com/package/auto-install)
[![npm](https://img.shields.io/npm/dm/auto-install.svg?maxAge=3600)](https://www.npmjs.com/package/auto-install)
[![Known Vulnerabilities](https://snyk.io/test/npm/auto-install/badge.svg)](https://snyk.io/test/npm/auto-install)

Auto installs dependencies as you code. Just hit save.

![Auto installs dependencies as you code](https://dl.dropboxusercontent.com/u/23355164/auto-install.gif)

#### Install

`npm install -g auto-install`

#### Usage

Run `auto-install` in the directory you are working in.

Modules in `.spec.js` and `.test.js` are added to `devDependencies`

#### Options

`--secure`  Install popular modules only (> 10k downloads in the last month)

`--exact`   Install exact version similar to `npm install express --save-exact`

`--dont-uninstall`   Do not uninstall unused modules

#### Show your support

:star: this repo

#### FAQ

[Does it protect against typosquatting?](https://github.com/siddharthkp/auto-install/issues/6)

#### License

MIT © [siddharthkp](https://github.com/siddharthkp)
