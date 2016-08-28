require('chai').should();
const helpers = require('../../lib/helpers');
const syncExec = require('sync-exec');

describe('packageJSONExists', () => {
    it('should return true', () => {
        helpers.packageJSONExists().should.equal(true);
    });

    it('should return false', () => {
        syncExec('mv package.json package.json.disappeared');
        helpers.packageJSONExists().should.equal(false);
        syncExec('mv package.json.disappeared package.json');
    });
});

