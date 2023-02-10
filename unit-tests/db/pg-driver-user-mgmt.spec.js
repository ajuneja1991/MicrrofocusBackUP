/* eslint-disable node/no-sync, camelcase, node/global-require */

describe('pg-driver-user-mgmt tests', () => {
  const _ = require('lodash');
  const { randomUUID } = require('crypto');
  const userUtils = require('../../../shared/utils/user'),
    dbTypes = require('../../../shared/db/pg_driver/dbTypes'),
    validate = require('../../../shared/db/validate');
  let app;
  const pgDBDriverType = 'sql',
    mock = {
      tenantData: {
        name: randomUUID(),
        description: 'tenant description',
        apiKey: randomUUID().replace(/-/g, ''),
        default: false
      },
      tenant1UpdateObject: {
        apiKey: randomUUID().replace(/-/g, '')
      },
      tenant1: undefined,

      user1Data: {
        login: randomUUID(),
        name: randomUUID(),
        description: 'test',
        email_address: `${randomUUID()}@example.com`,
        time_zone: 'Europe/Berlin',
        a1: undefined,
        a2: null,
        a3: '',
        a4: 'aaa',
        a5: 10
      },
      user1UpdateObject: {
        super_administrator: true,
        description: 'user description'
      },
      user1Password: '$test$',
      user1: undefined,
      user2Data: {
        login: randomUUID(),
        name: randomUUID(),
        description: 'test description',
        email_address: `${randomUUID()}@example.com`,
        time_zone: 'Europe/Berlin'
      },
      user2UpdateObject: {
        description: 'user description'
      },
      user2Password: '$test$',
      user2: undefined,

      userGroup1Data: {
        name: 'TestGroup1',
        description: ''
      },
      userGroup1: undefined,
      userGroup2Data: {
        name: 'TestGroup2',
        description: ''
      },
      userGroup2UpdateObject: {
        description: '',
        user_object: undefined
      },
      userGroup2: undefined,

      role1Data: {
        name: 'TestRole1',
        description: 'test description'
      },
      role1: undefined,
      role2Data: {
        name: 'TestRole2',
        description: ''
      },
      role2UpdateObject: {
        description: 'test description',
        user_object: undefined
      },
      role2: undefined
    },
    queryParams = {
      tenant1Query: {
        name: mock.tenantData.name
      },
      user1Query: {
        email_address: mock.user1Data.email_address
      },
      user2Query: {
        email_address: mock.user2Data.email_address
      },
      userGroup1Query: {
        name: mock.userGroup1Data.name
      },
      userGroup2Query: {
        name: mock.userGroup2Data.name
      },
      role1Query: {
        name: mock.role1Data.name
      },
      role2Query: {
        name: mock.role2Data.name
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
        return done(); // tell mocha that the setup code is finished
      }
    );
  });

  after(function(done) {
  /* set the timeout for mocha tests to 10sec */
    this.timeout(100000);
    const db = require('../helpers/db');

    db.cleanAll(
      err => {
        if (err) {
          return done(err);
        }
        return done(); // tell mocha that the tear down code is finished
      }
    );
  });

  it('pg-driver-user-mgmt: validate',
    done => {
      if (app.dbConnection.driverType !== pgDBDriverType) {
        return done();
      }
      try {
        validate(mock.user1Data, dbTypes.bvdUser);
      } catch (ex) {
        return done(ex);
      }

      return done();
    });

  it('pg-driver-user-mgmt: create tenant 1',
    done => {
      if (app.dbConnection.driverType !== pgDBDriverType) {
        return done();
      }
      app.dbConnection.create(dbTypes.bvdTenant, {}, mock.tenantData,
        (err, result) => {
          if (err) {
            return done(err);
          }
          expect(result).to.exist;
          expect(result.name).to.equal(mock.tenantData.name);
          expect(result.description).to.equal(mock.tenantData.description);
          expect(result.apiKey).to.equal(mock.tenantData.apiKey);
          expect(result.default).to.be.false;

          return done();
        });
    });

  it('pg-driver-user-mgmt: get tenant 1',
    done => {
      if (app.dbConnection.driverType !== pgDBDriverType) {
        return done();
      }
      app.dbConnection.get(dbTypes.bvdTenant, {
        query: queryParams.tenant1Query
      },
      (err, result) => {
        if (err) {
          return done(err);
        }
        expect(result).to.exist;
        expect(result).to.be.instanceof(Array);
        expect(result).to.have.length(1);
        const tenant = result[0];

        expect(tenant.name).to.equal(mock.tenantData.name);
        expect(tenant.description).to.equal(mock.tenantData.description);
        expect(tenant.apiKey).to.equal(mock.tenantData.apiKey);
        expect(tenant.default).to.be.false;

        return done();
      });
    });

  it('pg-driver-user-mgmt: update tenant 1',
    done => {
      if (app.dbConnection.driverType !== pgDBDriverType) {
        return done();
      }
      app.dbConnection.update(dbTypes.bvdTenant, {
        query: queryParams.tenant1Query
      }, mock.tenant1UpdateObject,
      (err, result) => {
        if (err) {
          return done(err);
        }
        expect(result).to.exist;
        expect(result).to.be.instanceof(Array);
        expect(result).to.have.length(1);
        const tenant = result[0];

        expect(tenant.name).to.equal(mock.tenantData.name);
        expect(tenant.description).to.equal(mock.tenantData.description);
        expect(tenant.apiKey).to.equal(mock.tenant1UpdateObject.apiKey);
        expect(tenant.default).to.be.false;

        mock.tenant1 = tenant;

        return done();
      });
    });

  it('pg-driver-user-mgmt: create user 1',
    done => {
      if (app.dbConnection.driverType !== pgDBDriverType) {
        return done();
      }
      const hashObj = userUtils.hashPasswordSync(mock.user1Password);

      mock.user1Data.passwordHash = hashObj.hash;
      mock.user1Data.passwordSalt = hashObj.salt;
      mock.user1Data.tenant = mock.tenant1._id;

      app.dbConnection.create(dbTypes.bvdUser, {}, mock.user1Data,
        (err, result) => {
          if (err) {
            return done(err);
          }
          expect(result).to.exist;
          expect(result.login).to.equal(mock.user1Data.login.toLowerCase());
          expect(result.name).to.equal(mock.user1Data.name);
          expect(result.description).to.equal(mock.user1Data.description);
          expect(result.email_address).to.equal(mock.user1Data.email_address);
          expect(result.time_zone).to.equal(mock.user1Data.time_zone);
          expect(result.tenant).to.equal(mock.user1Data.tenant);
          expect(result.passwordHash).to.equal(mock.user1Data.passwordHash);
          expect(result.passwordSalt).to.equal(mock.user1Data.passwordSalt);
          expect(result._id).to.exist;
          expect(result._id).to.be.not.empty;
          expect(result.createdAt).to.exist;
          expect(result.updatedAt).to.exist;
          expect(result.super_administrator).to.be.false;
          expect(result.disabled).to.be.false;
          expect(result.login_user).to.be.true;

          mock.user1 = result;

          return done();
        });
    });

  it('pg-driver-user-mgmt: update user 1',
    done => {
      if (app.dbConnection.driverType !== pgDBDriverType) {
        return done();
      }
      app.dbConnection.update(dbTypes.bvdUser, {
        query: queryParams.user1Query
      }, mock.user1UpdateObject,
      (err, result) => {
        if (err) {
          return done(err);
        }
        expect(result).to.exist;
        expect(result).to.be.instanceof(Array);
        expect(result).to.have.length(1);
        const user = result[0];

        expect(user.super_administrator).to.be.true;

        mock.user1 = user;

        return done();
      });
    });

  it('pg-driver-user-mgmt: get user 1',
    done => {
      if (app.dbConnection.driverType !== pgDBDriverType) {
        return done();
      }
      const populate = {
        propertyName: 'tenant',
        dbType: dbTypes.bvdTenant
      };

      app.dbConnection.get(dbTypes.bvdUser, {
        query: queryParams.user1Query,
        populate
      },
      (err, result) => {
        if (err) {
          return done(err);
        }
        expect(result).to.exist;
        expect(result).to.be.instanceof(Array);
        expect(result).to.have.length(1);
        const user = result[0];

        expect(user.login).to.equal(mock.user1Data.login.toLowerCase());
        expect(user.name).to.equal(mock.user1Data.name);
        expect(user.description).to.equal(mock.user1UpdateObject.description);
        expect(user.email_address).to.equal(mock.user1Data.email_address);
        expect(user.time_zone).to.equal(mock.user1Data.time_zone);
        expect(user.tenant).to.exist;
        expect(user.tenant._id).to.equal(mock.user1Data.tenant);
        expect(user.passwordHash).to.equal(mock.user1Data.passwordHash);
        expect(user.passwordSalt).to.equal(mock.user1Data.passwordSalt);
        expect(user._id).to.exist;
        expect(user._id).to.be.not.empty;
        expect(user.createdAt).to.exist;
        expect(user.updatedAt).to.exist;
        expect(user.super_administrator).to.be.true;
        expect(user.disabled).to.be.false;
        expect(user.login_user).to.be.true;

        mock.user1 = user;

        return done();
      });
    });

  it('pg-driver-user-mgmt: create user 2',
    done => {
      if (app.dbConnection.driverType !== pgDBDriverType) {
        return done();
      }
      const hashObj = userUtils.hashPasswordSync(mock.user2Password);

      mock.user2Data.passwordHash = hashObj.hash;
      mock.user2Data.passwordSalt = hashObj.salt;
      mock.user2Data.tenant = mock.tenant1._id;

      app.dbConnection.create(dbTypes.bvdUser, {}, mock.user2Data,
        (err, result) => {
          if (err) {
            return done(err);
          }
          expect(result).to.exist;
          expect(result.login).to.equal(mock.user2Data.login.toLowerCase());
          expect(result.name).to.equal(mock.user2Data.name);
          expect(result.description).to.equal(mock.user2Data.description);
          expect(result.email_address).to.equal(mock.user2Data.email_address);
          expect(result.time_zone).to.equal(mock.user2Data.time_zone);
          expect(result.tenant).to.equal(mock.user2Data.tenant);
          expect(result.passwordHash).to.equal(mock.user2Data.passwordHash);
          expect(result.passwordSalt).to.equal(mock.user2Data.passwordSalt);
          expect(result._id).to.exist;
          expect(result._id).to.be.not.empty;
          expect(result.createdAt).to.exist;
          expect(result.updatedAt).to.exist;
          expect(result.super_administrator).to.be.false;
          expect(result.disabled).to.be.false;
          expect(result.login_user).to.be.true;

          mock.user2 = result;
          return done();
        });
    });

  it('pg-driver-user-mgmt: create user group 1',
    done => {
      if (app.dbConnection.driverType !== pgDBDriverType) {
        return done();
      }
      mock.userGroup1Data.tenant = mock.tenant1._id;
      app.dbConnection.create(dbTypes.bvdUserGroup, {}, mock.userGroup1Data,
        (err, result) => {
          if (err) {
            return done(err);
          }
          expect(result).to.exist;
          expect(result.name).to.equal(mock.userGroup1Data.name);
          expect(result.description).to.equal(mock.userGroup1Data.description);
          expect(result.tenant).to.equal(mock.userGroup1Data.tenant);
          expect(result._id).to.exist;
          expect(result._id).to.be.not.empty;
          expect(result.createdAt).to.exist;
          expect(result.updatedAt).to.exist;
          expect(result.ldap_auto_assignment).to.be.false;
          expect(result.event_assignment).to.be.false;

          mock.userGroup1 = result;

          return done();
        });
    });

  it('pg-driver-user-mgmt: create user group 2',
    done => {
      if (app.dbConnection.driverType !== pgDBDriverType) {
        return done();
      }
      mock.userGroup2Data.tenant = mock.tenant1._id;
      app.dbConnection.create(dbTypes.bvdUserGroup, {}, mock.userGroup2Data,
        (err, result) => {
          if (err) {
            return done(err);
          }
          expect(result).to.exist;
          expect(result.name).to.equal(mock.userGroup2Data.name);
          expect(result.description).to.equal(mock.userGroup2Data.description);
          expect(result.tenant).to.equal(mock.userGroup2Data.tenant);
          expect(result._id).to.exist;
          expect(result._id).to.be.not.empty;
          expect(result.createdAt).to.exist;
          expect(result.updatedAt).to.exist;
          expect(result.ldap_auto_assignment).to.be.false;
          expect(result.event_assignment).to.be.false;

          mock.userGroup2 = result;

          return done();
        });
    });

  it('pg-driver-user-mgmt: update user group 2',
    done => {
      if (app.dbConnection.driverType !== pgDBDriverType) {
        return done();
      }
      mock.userGroup2UpdateObject.description = 'updated description';
      mock.userGroup2UpdateObject.user_object = [mock.user1, mock.user2];

      app.dbConnection.update(dbTypes.bvdUserGroup, {
        query: queryParams.userGroup2Query
      },
      mock.userGroup2UpdateObject,
      (err, result) => {
        if (err) {
          return done(err);
        }
        expect(result).to.exist;
        expect(result).to.be.instanceof(Array);
        expect(result).to.have.length(1);
        const ug = result[0];

        expect(ug.name).to.equal(mock.userGroup2Data.name);
        expect(ug.description).to.equal(mock.userGroup2UpdateObject.description);

        expect(ug.user_object).to.exist;
        expect(ug.user_object).to.be.instanceof(Array);
        expect(ug.user_object).to.have.length(2);
        const u1 = _.find(ug.user_object, user => user._id === mock.user1._id);

        expect(u1).to.exist;
        const u2 = _.find(ug.user_object, user => user._id === mock.user2._id);

        expect(u2).to.exist;

        return done();
      });
    });

  it('pg-driver-user-mgmt: get user group 2',
    done => {
      if (app.dbConnection.driverType !== pgDBDriverType) {
        return done();
      }
      const populate = {
        propertyName: 'tenant',
        dbType: dbTypes.bvdTenant
      };

      app.dbConnection.get(dbTypes.bvdUserGroup, {
        query: queryParams.userGroup2Query,
        populate
      },
      (err, result) => {
        if (err) {
          return done(err);
        }
        expect(result).to.exist;
        expect(result).to.be.instanceof(Array);
        expect(result).to.have.length(1);
        const ug = result[0];

        expect(ug.name).to.equal(mock.userGroup2Data.name);
        expect(ug.description).to.equal(mock.userGroup2UpdateObject.description);
        expect(ug.tenant).to.exist;
        expect(ug.tenant._id).to.equal(mock.user2Data.tenant);
        expect(ug._id).to.exist;
        expect(ug._id).to.be.not.empty;
        expect(ug.createdAt).to.exist;
        expect(ug.updatedAt).to.exist;

        expect(ug.user_object).to.exist;
        expect(ug.user_object).to.be.instanceof(Array);
        expect(ug.user_object).to.have.length(2);
        const u1 = _.find(ug.user_object, user => user._id === mock.user1._id);

        expect(u1).to.exist;
        const u2 = _.find(ug.user_object, user => user._id === mock.user2._id);

        expect(u2).to.exist;

        mock.userGroup2 = ug;

        return done();
      });
    });

  it('pg-driver-user-mgmt: create role 1',
    done => {
      if (app.dbConnection.driverType !== pgDBDriverType) {
        return done();
      }
      mock.role1Data.tenant = mock.tenant1._id;
      app.dbConnection.create(dbTypes.bvdRole, {}, mock.role1Data,
        (err, result) => {
          if (err) {
            return done(err);
          }
          expect(result).to.exist;
          expect(result.name).to.equal(mock.role1Data.name);
          expect(result.description).to.equal(mock.role1Data.description);
          expect(result.tenant).to.equal(mock.role1Data.tenant);
          expect(result._id).to.exist;
          expect(result._id).to.be.not.empty;
          expect(result.createdAt).to.exist;
          expect(result.updatedAt).to.exist;

          mock.role1 = result;

          return done();
        });
    });

  it('pg-driver-user-mgmt: create role 2',
    done => {
      if (app.dbConnection.driverType !== pgDBDriverType) {
        return done();
      }
      mock.role2Data.tenant = mock.tenant1._id;
      mock.role2Data.user_object_to_role = [{
        user_object: mock.user1,
        tenant: []
      }];
      app.dbConnection.create(dbTypes.bvdRole, {}, mock.role2Data,
        (err, result) => {
          if (err) {
            return done(err);
          }
          expect(result).to.exist;
          expect(result.name).to.equal(mock.role2Data.name);
          expect(result.description).to.equal(mock.role2Data.description);
          expect(result.tenant).to.equal(mock.role2Data.tenant);
          expect(result._id).to.exist;
          expect(result._id).to.be.not.empty;
          expect(result.createdAt).to.exist;
          expect(result.updatedAt).to.exist;

          expect(result.user_object_to_role).to.exist;
          expect(result.user_object_to_role).to.be.instanceof(Array);
          expect(result.user_object_to_role).to.have.length(1);
          expect(result.user_object_to_role[0]).to.exist;

          expect(result.user_group_to_role).to.exist;
          expect(result.user_group_to_role).to.be.instanceof(Array);
          expect(result.user_group_to_role).to.have.length(2);
          const u1 = _.find(result.user_group_to_role, user => user.user_group._id === mock.userGroup1._id);

          expect(u1).to.exist;
          const u2 = _.find(result.user_group_to_role, user => user.user_group._id === mock.userGroup2._id);

          expect(u2).to.exist;

          mock.role2 = result;

          return done();
        });
    });

  it('pg-driver-user-mgmt: get all roles 1',
    done => {
      if (app.dbConnection.driverType !== pgDBDriverType) {
        return done();
      }
      const populate = {
        propertyName: 'tenant',
        dbType: dbTypes.bvdTenant
      };

      app.dbConnection.get(dbTypes.bvdRole, {
        query: {},
        populate
      },
      (err, result) => {
        if (err) {
          return done(err);
        }
        expect(result).to.exist;
        expect(result).to.be.instanceof(Array);
        expect(result).to.have.length(2);

        const r1 = _.find(result, role => role._id === mock.role1._id);

        expect(r1).to.exist;

        const r2 = _.find(result, role => role._id === mock.role2._id);

        expect(r2).to.exist;

        expect(r2.user_object_to_role).to.exist;
        expect(r2.user_object_to_role).to.be.instanceof(Array);
        expect(r2.user_object_to_role).to.have.length(1);
        expect(r2.user_object_to_role[0]).to.exist;

        expect(r2.user_group_to_role).to.exist;
        expect(r2.user_group_to_role).to.be.instanceof(Array);
        expect(r2.user_group_to_role).to.have.length(2);
        const u1 = _.find(r2.user_group_to_role, user => user._id === mock.userGroup1._id);

        expect(u1).to.exist;
        const u2 = _.find(r2.user_group_to_role, user => user._id === mock.userGroup2._id);

        expect(u2).to.exist;

        return done();
      });
    });

  it('pg-driver-user-mgmt: update user 2-1',
    done => {
      if (app.dbConnection.driverType !== pgDBDriverType) {
        return done();
      }
      mock.user2UpdateObject.description = 'updated description';
      mock.user2UpdateObject.user_group = [mock.userGroup1, mock.userGroup2];

      app.dbConnection.update(dbTypes.bvdUser, {
        query: queryParams.user2Query,
        populate: true
      },
      mock.user2UpdateObject,
      (err, result) => {
        if (err) {
          return done(err);
        }
        expect(result).to.exist;
        expect(result).to.be.instanceof(Array);
        expect(result).to.have.length(1);
        const user = result[0];

        expect(user.name).to.equal(mock.user2Data.name);
        expect(user.description).to.equal(mock.user2UpdateObject.description);

        expect(user.user_object_to_role).to.exist;
        expect(user.user_object_to_role).to.be.instanceof(Array);
        expect(user.user_object_to_role).to.have.length(0);

        expect(user.user_group).to.exist;
        expect(user.user_group).to.be.instanceof(Array);
        expect(user.user_group).to.have.length(2);
        const ug1 = _.find(user.user_group, ug => ug._id === mock.userGroup1._id);

        expect(ug1).to.exist;
        const ug2 = _.find(user.user_group, ug => ug._id === mock.userGroup2._id);

        expect(ug2).to.exist;

        return done();
      });
    });

  it('pg-driver-user-mgmt: update user 2-2',
    done => {
      if (app.dbConnection.driverType !== pgDBDriverType) {
        return done();
      }
      const updateObj = {
        user_object_to_role: [{
          role: mock.role1,
          tenant: []
        },
        {
          role: mock.role2,
          tenant: []
        }
        ]
      };

      app.dbConnection.update(dbTypes.bvdUser, {
        query: queryParams.user2Query,
        populate: true
      },
      updateObj,
      (err, result) => {
        if (err) {
          return done(err);
        }
        expect(result).to.exist;
        expect(result).to.be.instanceof(Array);
        expect(result).to.have.length(1);
        const user = result[0];

        expect(user.name).to.equal(mock.user2Data.name);
        expect(user.description).to.equal(mock.user2UpdateObject.description);

        expect(user.user_group).to.exist;
        expect(user.user_group).to.be.instanceof(Array);
        expect(user.user_group).to.have.length(2);
        const ug1 = _.find(user.user_group, ug => ug._id === mock.userGroup1._id);

        expect(ug1).to.exist;
        const ug2 = _.find(user.user_group, ug => ug._id === mock.userGroup2._id);

        expect(ug2).to.exist;

        expect(user.user_object_to_role).to.exist;
        expect(user.user_object_to_role).to.be.instanceof(Array);
        expect(user.user_object_to_role).to.have.length(2);
        const r1 = _.find(user.user_object_to_role, role => role._id === mock.role1._id);

        expect(r1).to.exist;
        const r2 = _.find(user.user_object_to_role, role => role._id === mock.role2._id);

        expect(r2).to.exist;

        return done();
      });
    });

  it('pg-driver-user-mgmt: get all users 1',
    done => {
      if (app.dbConnection.driverType !== pgDBDriverType) {
        return done();
      }
      const populate = {
        propertyName: 'tenant',
        dbType: dbTypes.bvdTenant
      };

      app.dbConnection.get(dbTypes.bvdUser, {
        query: {},
        populate
      },
      (err, result) => {
        if (err) {
          return done(err);
        }
        expect(result).to.exist;
        expect(result).to.be.instanceof(Array);
        expect(result).to.have.length(2);

        const u1 = _.find(result, user => user._id === mock.user1._id);

        expect(u1).to.exist;
        expect(u1.user_object_to_role).to.exist;
        expect(u1.user_object_to_role).to.be.instanceof(Array);
        expect(u1.user_object_to_role).to.have.length(1);

        const u2 = _.find(result, user => user._id === mock.user2._id);

        expect(u2).to.exist;

        expect(u2.user_object_to_role).to.exist;
        expect(u2.user_object_to_role).to.be.instanceof(Array);
        expect(u2.user_object_to_role).to.have.length(2);
        const r1 = _.find(u2.user_object_to_role, role => role._id === mock.role1._id);

        expect(r1).to.exist;
        const r2 = _.find(u2.user_object_to_role, role => role._id === mock.role2._id);

        expect(r2).to.exist;

        return done();
      });
    });

  it('pg-driver-user-mgmt: remove all users',
    done => {
      if (app.dbConnection.driverType !== pgDBDriverType) {
        return done();
      }
      app.dbConnection.remove(dbTypes.bvdUser, {
        query: {}
      },
      (err, removedCount) => {
        if (err) {
          return done(err);
        }
        expect(removedCount).to.exist;
        expect(removedCount).to.equal(2);
        return done();
      });
    });

  it('pg-driver-user-mgmt: get all users 2',
    done => {
      if (app.dbConnection.driverType !== pgDBDriverType) {
        return done();
      }
      app.dbConnection.get(dbTypes.bvdUser, {
        query: {}
      },
      (err, result) => {
        if (err) {
          return done(err);
        }
        expect(result).to.exist;
        expect(result).to.be.instanceof(Array);
        expect(result).to.have.length(0);

        return done();
      });
    });

  it('pg-driver-user-mgmt: get all roles 2',
    done => {
      if (app.dbConnection.driverType !== pgDBDriverType) {
        return done();
      }
      const populate = {
        propertyName: 'tenant',
        dbType: dbTypes.bvdTenant
      };

      app.dbConnection.get(dbTypes.bvdRole, {
        query: {},
        populate
      },
      (err, result) => {
        if (err) {
          return done(err);
        }
        expect(result).to.exist;
        expect(result).to.be.instanceof(Array);
        expect(result).to.have.length(2);

        const r1 = _.find(result, role => role._id === mock.role1._id);

        expect(r1).to.exist;

        const r2 = _.find(result, role => role._id === mock.role2._id);

        expect(r2).to.exist;

        expect(r2.user_object_to_role).to.exist;
        expect(r2.user_object_to_role).to.be.instanceof(Array);
        expect(r2.user_object_to_role).to.have.length(0);

        expect(r2.user_group_to_role).to.exist;
        expect(r2.user_group_to_role).to.be.instanceof(Array);
        expect(r2.user_group_to_role).to.have.length(2);
        const u1 = _.find(r2.user_group_to_role, user => user._id === mock.userGroup1._id);

        expect(u1).to.exist;
        const u2 = _.find(r2.user_group_to_role, user => user._id === mock.userGroup2._id);

        expect(u2).to.exist;

        return done();
      });
    });

  it('pg-driver-user-mgmt: remove tenant 1',
    done => {
      if (app.dbConnection.driverType !== pgDBDriverType) {
        return done();
      }
      app.controllers.bvdTenant.remove({
        name: mock.tenantData.name
      },
      (err, removedCount) => {
        if (err) {
          return done(err);
        }
        expect(removedCount).to.exist;
        expect(removedCount).to.eql([2, 2, 0, 0, 0, 0, 1, 2]);
        return done();
      });
    });

  it('pg-driver-user-mgmt: get all roles 3',
    done => {
      if (app.dbConnection.driverType !== pgDBDriverType) {
        return done();
      }
      app.dbConnection.get(dbTypes.bvdRole, {
        query: {}
      },
      (err, result) => {
        if (err) {
          return done(err);
        }
        expect(result).to.exist;
        expect(result).to.be.instanceof(Array);
        expect(result).to.have.length(0);

        return done();
      });
    });

  it('pg-driver-user-mgmt: get all user groups',
    done => {
      if (app.dbConnection.driverType !== pgDBDriverType) {
        return done();
      }
      app.dbConnection.get(dbTypes.bvdUserGroup, {
        query: {}
      },
      (err, result) => {
        if (err) {
          return done(err);
        }
        expect(result).to.exist;
        expect(result).to.be.instanceof(Array);
        expect(result).to.have.length(0);

        return done();
      });
    });
});
