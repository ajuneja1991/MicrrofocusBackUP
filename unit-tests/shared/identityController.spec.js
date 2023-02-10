const db = require('../helpers/db');
const app = require('../../../shared/app');
describe('identityController tests', () => {
  let tenantId;
  const mock = {
    newTenantParams: {
      tenantCompany: 'test-company',
      adminUserEmail: 'testUser@testCompany.com',
      adminUserPassword: 'testPassword123!',
      noDashboardImport: true
    },

    newUserData: {
      login: 'testuser1',
      name: 'test user 1',
      // eslint-disable-next-line camelcase
      email_address: 'testuser1@test.com',
      password: '$Test1$!!',
      // eslint-disable-next-line camelcase
      time_zone: '',
      // eslint-disable-next-line camelcase
      super_administrator: false
    },

    passwordData: {
      password: '$Testpass1$',
      // eslint-disable-next-line camelcase
      old_password: '$Test1$!!'
    }
  };

  before(function(done) {
  /* set the timeout for mocha tests to 10sec */
    this.timeout(100000);
    db.cleanAll(
      err => {
        if (err) {
          return done(err);
        }

        // create one tenant that will be used for testing
        app.controllers.bvdTenant.createNewTenant(mock.newTenantParams,
          // eslint-disable-next-line no-unused-vars
          (err, generatedPassword) => {
            if (err) {
              return done(err);
            }
            const newTenant = app.controllers.bvdTenant.getByName(mock.newTenantParams.tenantCompany);
            if (newTenant) {
              tenantId = newTenant._id;
              mock.newUserData.tenant = tenantId;
              app.controllers.bvdUser.create(
                mock.newUserData, {},
                // eslint-disable-next-line no-unused-vars
                (err, user) => {
                  if (err) {
                    return done(err);
                  }
                  return done();
                }
              );
            } else {
              return done(new Error('Test tenant not created.'));
            }
          });
      });
  });

  after(function(done) {
  /* set the timeout for mocha tests to 10sec */
    this.timeout(100000);
    app.controllers.bvdTenant.remove({ name: mock.newTenantParams.tenantCompany },
      // eslint-disable-next-line no-unused-vars
      (err, generatedPassword) => {
        if (err) {
          return done(err);
        }

        db.cleanAll(
          err => {
            if (err) {
              return done(err);
            }
            done(); // tell mocha that the tear down code is finished
          });
      });
  });

  // eslint-disable-next-line no-warning-comments
  // TODO LDAP: make these tests work again with the new authenticate methods
  // it('identityController: authenticate user', function(done) {
  //  app.controllers.identity.authenticate(
  //    mock.newUserData.login,
  //    mock.newUserData.password,
  //    function(err, user) {
  //      if (err) {
  //        done(err);
  //      } else {
  //        expect(user).not.equal(null);
  //        done();
  //      }
  //    }
  //  );
  // });
  //

  it('identityController: set user last activity', done => {
    app.controllers.identity.setUserLastActivity(
      new Date(2015, 0, 9, 2),
      mock.newUserData.login,
      (err, updatedDocs) => {
        if (err) {
          return done(err);
        }
        expect(updatedDocs).to.exist;
        expect(updatedDocs[0].lastActivityAt).eql(new Date(2015, 0, 9, 2));

        app.controllers.bvdUser.get({
          login: mock.newUserData.login
        },
        (err, user) => {
          if (err) {
            return done(err);
          }
          expect(user).to.exist;
          expect(user.user_object).to.exist;
          expect(user.user_object.lastActivityAt).to.eql(new Date(2015, 0, 9, 2));
          done();
        }
        );
      }
    );
  });
}
);
