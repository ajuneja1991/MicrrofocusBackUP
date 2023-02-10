const shared = require('../helpers/shared');
const supertest = require('supertest');
const testData = require('../mockData');
const mockData = JSON.parse(JSON.stringify(testData));
const request = supertest.agent(shared.exploreTestURL);

const loginURL = '/rest/v1/pages/';
const apiAppConfig = '/rest/v1/appConfig';

const adminLogin = shared.tenant.email;
const adminPasswd = shared.tenant.password;

describe('App crud operations - V1', () => {
  it('Login admin', done => {
    shared.login(request, loginURL, adminLogin, adminPasswd, done);
  });

  it('Get app', done => {
    request
      .get(apiAppConfig)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.status).to.equal(200);
        expect(res.body.data.appConfig.app).to.not.equal(null);
        expect(res.body.data.appConfig.app.id).to.equal('MyApp');
        expect(res.body.appConfig).to.equal(undefined);

        done();
      });
  });

  it('Perform updation of app with invalid csrf token', done => {
    mockData.appConfig.app.id = 'MyApp_new';
    request
      .put(apiAppConfig)
      .send(mockData.appConfig)
      .set('X-Secure-Modify-Token', 'm6WBppef-xdWYLmZmOAtxDECtv62gaRaxNi')
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.status).to.equal(403);
        expect(res.body.message).to.equal('Forbidden');
        return done();
      });
  });

  it('Update app', done => {
    mockData.appConfig.app.id = 'MyApp_new';
    request
      .put(apiAppConfig)
      .send(mockData.appConfig)
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.status).to.equal(200);
        expect(res.body.data.appConfig.app.id).to.equal('MyApp_new');
        expect(res.body.appConfig).to.equal(undefined);

        request
          .get(apiAppConfig)
          .end((err, responseApiAppConfig) => {
            if (err) {
              return done(err);
            }
            expect(responseApiAppConfig.status).to.equal(200);
            expect(responseApiAppConfig.body.data.appConfig.app.id).to.equal('MyApp_new');
            expect(responseApiAppConfig.body.appConfig).to.equal(undefined);

            done();
          });
      });
  });

  it('Update app back', done => {
    mockData.appConfig.app.id = 'MyApp';
    request
      .put(apiAppConfig)
      .send(mockData.appConfig)
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.status).to.equal(200);
        expect(res.body.data.appConfig.app.id).to.equal('MyApp');
        expect(res.body.appConfig).to.equal(undefined);
        request
          .get(apiAppConfig)
          .end((err, resonseApiAppConfig) => {
            if (err) {
              return done(err);
            }
            expect(resonseApiAppConfig.status).to.equal(200);
            expect(resonseApiAppConfig.body.data.appConfig.app.id).to.equal('MyApp');
            expect(resonseApiAppConfig.body.appConfig).to.equal(undefined);
            done();
          });
      });
  });

  it('logout', done => {
    shared.logout(request, done);
  });
});
