/* eslint-disable node/no-sync, camelcase, node/no-process-env, node/global-require, no-unused-expressions */

describe('userController tests', () => {
  let app,
    tenantId;

  const mock = {
    newTenantParams: {
      tenantCompany: 'test-company',
      adminUserEmail: 'testUser@testCompany.com',
      adminUserPassword: 'testPassword123!',
      noDashboardImport: true
    },

    userModel: {
      login: 'testuser',
      name: 'test user',
      email_address: 'testuser@test.com',
      password: '$Test1$!!',
      time_zone: '',
      super_administrator: false
    }
  };

  before(function(done) {
  /* set the timeout for mocha tests to 10sec */
    this.timeout(100000);
    const db = require('../helpers/db');

    db.cleanAll(
      err => {
        if (err) {
          return done(err);
        }
        app = require('../../../shared/app');

        if (!app.controllers.bvdTenant.exist({
          name: mock.newTenantParams.tenantCompany
        })) {
          /* create one tenant that will be used for testing */
          return app.controllers.bvdTenant.createNewTenant(mock.newTenantParams, err => {
            if (err) {
              return done(err);
            }
            const newTenant = app.controllers.bvdTenant.getByName(mock.newTenantParams.tenantCompany);

            if (newTenant) {
              tenantId = newTenant._id;
              mock.userModel.tenant = tenantId;

              return done();
            }
            done(new Error('Test tenant not created.'));
          });
        }
        /* use existing tenant */
        const tenant = app.controllers.bvdTenant.getByName(mock.newTenantParams.tenantCompany);

        if (tenant) {
          tenantId = tenant._id;
          mock.userModel.tenant = tenantId;

          return done();
        }

        return done(new Error('Test tenant not found.'));
      });
  });

  after(function(done) {
  /* set the timeout for mocha tests to 10sec */
    this.timeout(100000);
    app.controllers.bvdTenant.remove({
      name: mock.newTenantParams.tenantCompany
    }, err => {
      if (err) {
        return done(err);
      }
      const db = require('../helpers/db');

      db.cleanAll(
        err => {
          if (err) {
            return done(err);
          }
          done(); // tell mocha that the tear down code is finished
        });
    });
  });

  it('userController: create user', done => {
    app.controllers.bvdUser.create(mock.userModel, {}, (err, user) => {
      if (err) {
        return done(err);
      }
      expect(user).not.equal(undefined);
      expect(user.email).to.equal(mock.userModel.email);
      done();
    });
  });

  it('userController: get user', done => {
    app.controllers.bvdUser.get({
      email_address: mock.userModel.email_address
    }, (err, userDoc) => {
      if (err) {
        return done(err);
      }
      expect(userDoc).to.exist;
      expect(userDoc.user_object).to.exist;
      expect(userDoc.user_object.email_address).to.equal(mock.userModel.email_address);
      expect(userDoc.user_object.super_administrator).to.equal(mock.userModel.super_administrator);
      done();
    });
  });

  it('userController: update user', done => {
    app.controllers.bvdUser.update({
      email_address: mock.userModel.email_address
    }, {
      super_administrator: !mock.userModel.super_administrator
    }, (err, userDoc) => {
      if (err) {
        return done(err);
      }
      expect(userDoc).to.exist;
      expect(userDoc.user_object).to.exist;
      expect(userDoc.user_object.email_address).to.equal(mock.userModel.email_address);
      expect(userDoc.user_object.super_administrator).to.equal(!mock.userModel.super_administrator);
      done();
    });
  });

  it('userController: set user last activity', done => {
    app.controllers.bvdUser.setUserLastActivity(new Date(2015, 6, 21, 2), mock.userModel.login, (err, userDoc) => {
      if (err) {
        return done(err);
      }
      expect(userDoc).to.exist;
      expect(userDoc.length).to.equal(1);
      expect(userDoc[0].login).to.eql(mock.userModel.login);
      expect(userDoc[0].lastActivityAt).to.eql(new Date(2015, 6, 21, 2));

      done();
    });
  });

  it('userController: delete user', done => {
    app.controllers.bvdUser.delete({
      email_address: mock.userModel.email_address,
      tenant: tenantId
    }, (err, numAffected) => {
      if (err) {
        return done(err);
      }
      expect(numAffected).to.equal(1);

      app.controllers.bvdUser.get({
        email_address: mock.userModel.email_address
      }, (err, userDoc) => {
        if (err) {
          return done(err);
        }
        expect(userDoc).to.not.exist;
        done();
      });
    });
  });
});
