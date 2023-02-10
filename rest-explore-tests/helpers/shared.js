/* eslint-disable node/no-process-env, node/global-require, no-unused-expressions, node/no-sync, no-console, camelcase */

const apiHelper = require('../../rest-api-tests/helpers/shared');
const async = require('async');

const getExploreTestUrl = () => process.env.BVD_EXPLORE_TEST_URL || 'http://localhost:4004/ui';
const getExploreTestContext = () => process.env.EXPLORE_CONTEXT_ROOT || '/ui';
const getExploreRootUrl = () => process.env.EXPLORE_URL || 'http://localhost:4004';

const createItems = function(request, api, items, done) {
  request
    .post(api)
    .send(items)
    .set('X-Secure-Modify-Token', apiHelper.secureModifyToken())
    .end(err => {
      if (err) {
        return done(new Error(`Error while creating items (${items}): ${err}`));
      }
      return done();
    });
};

const deleteItems = function(request, api, items, done) {
  async.each(items, (item, callback) => {
    request
      .delete(api.concat(item.id))
      .set('X-Secure-Modify-Token', apiHelper.secureModifyToken())
      .end(err => {
        if (err) {
          return callback(err);
        }
        return callback();
      });
  }, err => {
    if (err) {
      return done(new Error(`Error while deleting items (${items}): ${err}`));
    }
    return done();
  });
};

module.exports = {
  login: apiHelper.login,
  logout: apiHelper.logout,
  updateCookie: apiHelper.updateCookie,
  secureModifyToken: apiHelper.secureModifyToken,
  tenant: apiHelper.tenant,
  exploreTestURL: getExploreTestUrl(),
  testURL: apiHelper.testURL,
  rootContext: apiHelper.rootContext,
  exploreContextRoot: getExploreTestContext(),
  exploreRootUrl: getExploreRootUrl(),

  createItems,
  deleteItems
};
