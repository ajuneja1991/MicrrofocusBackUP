/* this test is always executed first and makes sure that a special tenant is created */

const shared = require('./helpers/shared');
const mockData = require('./mockData');

const supertest = require('supertest');

const request = supertest.agent(shared.exploreRootUrl);
const exploreContext = shared.exploreContextRoot;

describe('Setup API Explore Tests', () => {
  it('createTenant', done => {
    const body = {
      name: shared.tenant.name,
      email: shared.tenant.email,
      password: shared.tenant.password
    };

    request
      .post('/rest/v2/tnnt')
      .send(body)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.status).to.equal(200);
        done();
      });
  });

  describe('App config', () => {
    const loginURL = `${exploreContext}/rest/v2/pages/`;
    const adminLogin = shared.tenant.email;
    const adminPasswd = shared.tenant.password;

    it('Login admin', done => {
      shared.login(request, loginURL, adminLogin, adminPasswd, done);
    });

    it('Load initial app config', done => {
      request
        .get(`${exploreContext}/rest/v2/system`)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res.status).to.equal(200);
          expect(res.body.appConfig.app).not.to.be.undefined;
          expect(res.body.appConfig.context).not.to.be.undefined;
          expect(res.body.data).not.to.be.undefined;

          if (res.body.appConfig.app.id === 'UIFoundationAppConfig') {
            request
              .post(`${exploreContext}/rest/v2/appConfig`)
              .send(mockData.appConfig)
              .set('X-Secure-Modify-Token', shared.secureModifyToken())
              .end((err, resCreate) => {
                if (err) {
                  return done(err);
                }
                expect(resCreate.status).to.equal(200);
                expect(resCreate.body.data[0].appConfig.app.l10n).not.to.be.undefined;
                done();
              });
          } else {
            request
              .put(`${exploreContext}/rest/v2/appConfig/${mockData.appConfig.app.id}`)
              .send(mockData.appConfig)
              .set('X-Secure-Modify-Token', shared.secureModifyToken())
              .end((err, resCreate) => {
                if (err) {
                  return done(err);
                }
                expect(resCreate.status).to.equal(200);
                expect(resCreate.body.data[0].appConfig.app.l10n).not.to.be.undefined;
                done();
              });
          }
        });
    });

    it('logout', done => {
      shared.logout(request, done, `${exploreContext}/logout`);
    });
  });
});
