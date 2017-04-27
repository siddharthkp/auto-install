#### auto-install

[![Build
Status](https://api.travis-ci.org/siddharthkp/auto-install.svg?branch=master)](https://travis-ci.org/siddharthkp/auto-install)
[![npm](https://img.shields.io/npm/v/auto-install.svg?maxAge=3600)](https://www.npmjs.com/package/auto-install)
[![npm](https://img.shields.io/npm/dt/auto-install.svg?maxAge=3600)](https://www.npmjs.com/package/auto-install)
[![Known Vulnerabilities](https://snyk.io/test/npm/auto-install/badge.svg)](https://snyk.io/test/npm/auto-install)

Auto installs dependencies as you code. Just hit save.

![Auto installs dependencies as you code](https://raw.githubusercontent.com/siddharthkp/auto-install/master/demo.gif)

Featured in [npm weekly #56](http://us9.campaign-archive2.com/?u=077dfd41302a71310cef619e5&id=9e020606f1)!

#### Install

`npm install -g auto-install`

#### Usage

Run `auto-install` in the directory you are working in.

Modules in `.spec.js` and `.test.js` are added to `devDependencies`

#### Options

`--secure`  Install popular modules only (> 10k downloads in the last month)

`--exact`   Install exact version similar to `npm install express --save-exact`

`--dont-uninstall`   Do not uninstall unused modules

`--yarn`    Use [yarn](https://yarnpkg.com) instead of npm

#### Show your support

:star: this repo

#### FAQ

[Does it protect against typosquatting?](https://github.com/siddharthkp/auto-install/issues/6)

[Hackernews post](https://news.ycombinator.com/item?id=12248997)

#### License

MIT © [siddharthkp](https://github.com/siddharthkp)
