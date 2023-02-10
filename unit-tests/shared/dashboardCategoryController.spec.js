/* eslint-disable node/global-require */

const async = require('async');
const { randomUUID } = require('crypto');

const constants = require('../../../shared/constants');

describe('dashboardCategoryController tests', () => {
  const mock = {
    tenant1Data: {
      name: randomUUID(),
      description: 'tenant description',
      apiKey: randomUUID().replace(/-/g, ''),
      default: false
    },

    dashboardCategoryCreateObject: {
      name: 'permission-category'
    }
  };

  let app,
    tenantId;

  const prepareMocks = function() {
    mock.dashboardCategoryCreateObject.tenant = tenantId;
    mock.dashboardCategoryCreateObject.scope = constants.PERMISSION_SCOPE;

    mock.categoryString = [
      randomUUID().replace('-', '').substring(0, 29), randomUUID().replace('-', '').substring(0, 29), randomUUID().replace('-', '').substring(0, 29)
    ].join(';');
    mock.menuCategoryString = [
      randomUUID().replace('-', '').substring(0, 29), randomUUID().replace('-', '').substring(0, 29), randomUUID().replace('-', '').substring(0, 29)
    ].join(';');
  };

  before(function(done) {
  /* set the timeout for mocha tests to 10sec */
    this.timeout(100000);
    const db = require('../helpers/db');

    db.cleanAll(err => {
      if (err) {
        return done(err);
      }
      app = require('../../../shared/app');

      app.controllers.bvdTenant.create(mock.tenant1Data, (err, tenant1Doc) => {
        if (err) {
          return done(err);
        }
        tenantId = tenant1Doc._id;
        prepareMocks();
        done();
      });
    });
  });

  after(function(done) {
  /* set the timeout for mocha tests to 10sec */
    this.timeout(100000);
    app.controllers.bvdTenant.remove({
      name: mock.tenant1Data.name
    }, err => {
      if (err) {
        return done(err);
      }
      const db = require('../helpers/db');

      db.cleanAll(err => {
        if (err) {
          return done(err);
        }
        done(); // tell mocha that the tear down code is finished
      });
    });
  });

  it('dashboardCategoryController: create dashboard category', done => {
    app.controllers.dashboardCategory.create(mock.dashboardCategoryCreateObject, (err, dashboardCategoryDoc) => {
      if (err) {
        return done(err);
      }

      expect(dashboardCategoryDoc).to.exist;
      expect(dashboardCategoryDoc.name).to.equal(mock.dashboardCategoryCreateObject.name);

      mock.dashboardCategoryCreateObject.name = 'testing-permission-category';
      app.controllers.dashboardCategory.create(
        mock.dashboardCategoryCreateObject, (err, dcDoc) => {
          if (err) {
            return done(err);
          }

          expect(dcDoc).to.exist;
          expect(dcDoc.name).to.equal(mock.dashboardCategoryCreateObject.name);
          done();
        }
      );
    });
  });

  it('dashboardCategoryController: get all dashboard categories', done => {
    app.controllers.dashboardCategory.getAll(
      constants.PERMISSION_SCOPE, tenantId, (err, dashboardCategories) => {
        if (err) {
          return done(err);
        }
        expect(dashboardCategories).to.exist;
        expect(dashboardCategories.length === 2).to.equal(true);
        done();
      }
    );
  });

  it('dashboardCategoryController: get category IDs from category names', done => {
    app.controllers.dashboardCategory.getAll(constants.PERMISSION_SCOPE, tenantId, (err, dashboardCategories) => {
      if (err) {
        return done(err);
      }
      app.controllers.dashboardCategory.getIdFromName(dashboardCategories, constants.PERMISSION_SCOPE, tenantId, (err, idArray) => {
        if (err) {
          return done(err);
        }
        expect(idArray).to.exist;
        expect(idArray.length > 0).to.equal(true);
        expect(idArray[0]).to.not.be.null;
        expect(idArray[0]).to.not.be.undefined;
        done();
      });
    });
  });

  it('dashboardCategoryController: is dashboard category deletable', done => {
    app.controllers.dashboardCategory.getAll(constants.PERMISSION_SCOPE, tenantId, (err, dashboardCategories) => {
      if (err) {
        return done(err);
      }
      const isDeletableArray = [];

      async.each(dashboardCategories, (categoryName, callback) => {
        app.controllers.dashboardCategory.isDeletable(categoryName, constants.PERMISSION_SCOPE, tenantId, (err, isDeletable) => {
          if (err) {
            return callback(err);
          }
          isDeletableArray.push({
            name: categoryName,
            isDeletable
          });
          callback();
        });
      }, err => {
        if (err) {
          return done(err);
        }
        done();
      });
    });
  });

  it('dashboardCategoryController: process dashboard categories', done => {
    app.controllers.dashboard.processDashboardCategories(mock.categoryString, mock.menuCategoryString, tenantId, (err, idArray) => {
      if (err) {
        return done(err);
      }
      expect(idArray).to.exist;
      expect(idArray.length > 0).to.equal(true);
      done();
    });
  });
});
