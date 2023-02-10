/* eslint-disable camelcase, node/global-require, no-unused-expressions, no-underscore-dangle */

const { randomUUID } = require('crypto');
const constants = require('../../../shared/constants');

describe('user management tests', () => {
  let app,
    tenantId;
  const roleName = `R${randomUUID()}`;
  const mock = {
    defaultDashboardName: 'test-default-dashboard',

    tenantData: {
      name: 'default-tenant',
      default: true
    },

    userData: {
      login: randomUUID(),
      name: randomUUID(),
      disabled: false,
      password: '$Test123$'
    },

    roleData: {
      name: roleName,
      description: 'Role desc'
    },

    roleUpdateObject: {
      name: roleName,
      description: 'Role desc updated',
      permission: [{
        resource_key: `Res-${randomUUID()}`,
        operation_key: constants.VIEW_PERMISSION
      }, {
        resource_key: `Res-${randomUUID()}`,
        operation_key: constants.FULL_CONTROL_PERMISSION
      }]
    }
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
      app.controllers.bvdTenant.createDefaultTenant(
        (err, tenantDoc) => {
          if (err) {
            return done(err);
          }
          tenantId = tenantDoc._id;
          mock.userData.tenant = tenantId;
          mock.roleData.tenant = tenantId;
          done();
        });
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
      done();
    });
  });

  it('user-management: create user', done => {
    app.controllers.bvdUser.create(mock.userData, {}, (err, userDoc) => {
      if (err) {
        return done(err);
      }
      expect(userDoc.user_object).to.exist;
      expect(userDoc.user_object.name.toLowerCase()).to.equal(mock.userData.name.toLowerCase());
      expect(userDoc.user_object.login.toLowerCase()).to.equal(mock.userData.login.toLowerCase());
      done();
    });
  });

  it('user-management: set user default dashboard', done => {
    app.controllers.bvdUser.get({
      query: {
        login: mock.userData.login.toLowerCase()
      }
    }, (err, userDocs) => {
      if (err) {
        return done(err);
      }
      app.controllers.bvdUser.setDefaultDashboard(
        mock.defaultDashboardName, {
          id: userDocs.user_object.id
        }, (err, success) => {
          if (err) {
            return done(err);
          }
          expect(success).to.exist;
          expect(success).to.be.true;
          done();
        }
      );
    }
    );
  });

  it('user-management: get user default dashboard', done => {
    app.controllers.bvdUser.get({
      query: {
        login: mock.userData.login.toLowerCase()
      }
    }, (err, userDocs) => {
      if (err) {
        return done(err);
      }
      app.controllers.bvdUser.getDefaultDashboard({
        id: userDocs.user_object.id
      }, (err, defaultDashboard) => {
        if (err) {
          return done(err);
        }
        expect(defaultDashboard).to.exist;
        expect(defaultDashboard).to.equal(mock.defaultDashboardName);
        done();
      });
    }
    );
  });

  it('user-management: create role', done => {
    app.controllers.bvdRole.create(mock.roleData, (err, roleDoc) => {
      if (err) {
        return done(err);
      }
      expect(roleDoc.role).to.exist;
      expect(roleDoc.role.name.toLowerCase()).to.equal(mock.roleData.name.toLowerCase());
      done();
    });
  });

  it('user-management: create role permissions', done => {
    app.controllers.bvdRole.update({
      query: {
        name: mock.roleData.name
      }
    },
    mock.roleUpdateObject,
    (err, roleDocs) => {
      if (err) {
        return done(err);
      }
      expect(roleDocs.role).to.exist;
      expect(roleDocs.role.permission.length === 2).to.equal(true);
      done();
    }
    );
  });

  it('user-management: update user (assign roles)', done => {
    app.controllers.bvdRole.get({
      query: {
        name: mock.roleData.name
      }
    }, (err, roleDocs) => {
      if (err) {
        return done(err);
      }
      expect(roleDocs.role).to.exist;
      expect(roleDocs.role.name.toLowerCase()).to.equal(mock.roleData.name.toLowerCase());

      // get user
      app.controllers.bvdUser.get({
        query: {
          login: mock.userData.login.toLowerCase()
        }
      }, (err, userDocs) => {
        if (err) {
          return done(err);
        }
        expect(userDocs.user_object).to.exist;

        // assign user role
        let userRoles = [];

        if (userDocs.user_object.user_object_to_role && userDocs.user_object.user_object_to_role.length > 0) {
          userRoles = userDocs.user_object.user_object_to_role;
        }
        userRoles.push(roleDocs.role.id);

        // update user
        userDocs.user_object.user_object_to_role = userRoles;
        userDocs.user_object.tenant = userDocs.user_object.tenant._id;
        app.controllers.bvdUser.update({
          query: {
            login: mock.userData.login.toLowerCase()
          }
        }, userDocs.user_object, (err, updatedUserDocs) => {
          if (err) {
            return done(err);
          }
          expect(updatedUserDocs.user_object).to.exist;
          expect(updatedUserDocs.user_object.user_object_to_role.length > 0).to.equal(true);

          done();
        }
        );
      }
      );
    }
    );
  });
});
