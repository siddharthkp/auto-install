'use strict';

require('chai').should();
var helpers = require('../../lib/helpers');
var syncExec = require('sync-exec');

describe('packageJSONExists', function () {
    it('should return true', function () {
        helpers.packageJSONExists().should.equal(true);
    });

    it('should return false', function () {
        syncExec('mv package.json package.json.disappeared');
        helpers.packageJSONExists().should.equal(false);
        syncExec('mv package.json.disappeared package.json');
    });
});