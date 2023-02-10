/* eslint-disable node/no-sync, camelcase, node/no-process-env, node/global-require, no-unused-expressions */

describe('tenantController tests', () => {
  let app,
    tenantId;

  before(function(done) {
  /* set the timeout for mocha tests to 10sec */
    this.timeout(100000);
    const db = require('../helpers/db');
    db.cleanAll(err => {
      if (err) {
        return done(err);
      }
      app = require('../../../shared/app');

      done(); // tell mocha that the setup code is finished
    });
  });

  after(function(done) {
  /* set the timeout for mocha tests to 10sec */
    this.timeout(100000);
    const db = require('../helpers/db');

    db.cleanAll(err => {
      if (err) {
        return done(err);
      }
      done(); // tell mocha that the tear down code is finished
    });
  });

  it('tenantController: create default tenant', done => {
    app.controllers.bvdTenant.createDefaultTenant(err => {
      if (err) {
        return done(err);
      }
      // as the tenant map is filled via redis pub/sub, it takes a few milliseconds until
      // the created filter was added
      setTimeout(() => {
        const tenant = app.controllers.bvdTenant.getDefaultTenant();
        expect(tenant).not.equal(undefined);
        expect(tenant.default).not.equal(undefined);
        expect(tenant.default).equal(true);

        const all = app.controllers.bvdTenant.getAll();
        expect(all.length).equal(1);

        done();
      }, 25);
    });
  });

  it('tenantController: get default tenant', done => {
    const defaultTenant = app.controllers.bvdTenant.getDefaultTenant();
    expect(defaultTenant).not.equal(null);
    expect(defaultTenant.default).equal(true);
    expect(defaultTenant.name).equal('Provider');
    return done();
  });

  it('tenantController: create new tenant', done => {
    app.controllers.bvdTenant.createNewTenant({
      tenantCompany: 'HP',
      adminUserEmail: 'test@hp.com',
      adminUserPassword: 'Test1!!!!',
      noDashboardImport: true
    }, err => {
      if (err) {
        return done(err);
      }

      // as the tenant map is filled via redis pub/sub, it takes a few milliseconds until
      // the created filter was added
      setTimeout(() => {
        const tenant = app.controllers.bvdTenant.getByName('HP');
        expect(tenant).not.equal(undefined);
        expect(tenant.default).not.equal(undefined);
        expect(tenant.default).equal(false);
        expect(tenant.name).equal('HP');

        tenantId = tenant._id;

        const all = app.controllers.bvdTenant.getAll();
        expect(all.length).equal(2);

        app.controllers.bvdUser.get({ email_address: 'test@hp.com' }, (err, userDoc) => {
          if (err) {
            return done(err);
          }
          expect(userDoc).to.exist;
          expect(userDoc.user_object).to.exist;
          expect(userDoc.user_object.email_address).equal('test@hp.com');
          done();
        });
      }, 25);
    });
  });

  it('tenantController: get tenant', done => {
    app.controllers.bvdTenant.getTenantFromDB(tenantId, (err, tenant) => {
      if (err) {
        return done(err);
      }
      expect(tenant).not.equal(null);
      done();
    });
  });

  it('tenantController: remove new tenant', done => {
    app.controllers.bvdTenant.remove({ name: 'HP' }, err => {
      if (err) {
        return done(err);
      }
      // as the tenant map is filled via redis pub/sub, it takes a few milliseconds until
      // the created filter was added
      setTimeout(() => {
        const tenant = app.controllers.bvdTenant.getByName('HP');
        expect(tenant).equal(undefined);

        const all = app.controllers.bvdTenant.getAll();
        expect(all.length).equal(1);

        app.controllers.bvdUser.get({ email_address: 'test@hp.com' }, (err, userDoc) => {
          if (err) {
            return done(err);
          }
          expect(userDoc).to.not.exist;
          done();
        });
      }, 25);
    });
  });

  it('tenantController: remove default tenant', done => {
    app.controllers.bvdTenant.remove({ name: 'Provider' }, err => {
      expect(err).not.equal(undefined);
      expect(err.message).not.equal(undefined);
      expect(err.message).equal('The default tenant cannot be removed.');
      done();
    });
  });
});
