const shared = require('../helpers/shared');
const supertest = require('supertest');
const testData = require('../mockData');
const mockData = JSON.parse(JSON.stringify(testData));
const request = supertest.agent(shared.exploreTestURL);

const loginURL = '/rest/v2/pages/';
const apiAppConfig = '/rest/v2/appConfig';
const oldApiAppConfig = '/rest/v1/appConfig';
const systemUrl = '/rest/v2/system';

const adminLogin = shared.tenant.email;
const adminPasswd = shared.tenant.password;

describe('App crud operations', () => {
  it('Login admin', done => {
    shared.login(request, loginURL, adminLogin, adminPasswd, done);
  });

  it('Get app by id', done => {
    request
      .get(`${apiAppConfig}/${mockData.appConfig.app.id}`)
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

  it('Get app by id with invalid value', done => {
    request
      .get(`${apiAppConfig}/notExistingAppConfig`)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.status).to.equal(404);
        expect(res.body.data).to.equal(undefined);

        done();
      });
  });

  it('Get app via old API version should work if only single app config available', done => {
    request
      .get(oldApiAppConfig)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.status).to.equal(200);

        done();
      });
  });

  it('Perform update of app with invalid csrf token', done => {
    const updateAppConfig = {
      app: {
        id: 'NewApp',
        title: 'Updated App Config'
      },
      context: []
    };
    request
      .put(`${apiAppConfig}/${mockData.appConfig.app.id}`)
      .send(updateAppConfig)
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
    const updateAppConfig = {
      app: {
        title: 'Updated App Config'
      },
      context: []
    };
    request
      .put(`${apiAppConfig}/${mockData.appConfig.app.id}`)
      .send(updateAppConfig)
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.status).to.equal(200);
        expect(res.body.data.appConfig.app.title).to.equal('Updated App Config');
        expect(res.body.appConfig).to.equal(undefined);

        request
          .get(`${apiAppConfig}/${mockData.appConfig.app.id}`)
          .end((err, responseApiAppConfig) => {
            if (err) {
              return done(err);
            }
            expect(responseApiAppConfig.status).to.equal(200);
            expect(responseApiAppConfig.body.data.appConfig.app.title).to.equal('Updated App Config');
            expect(responseApiAppConfig.body.appConfig).to.equal(undefined);

            done();
          });
      });
  });

  it('Update app id', done => {
    const updateAppConfig = {
      app: {
        id: 'NewApp'
      },
      context: []
    };
    request
      .put(`${apiAppConfig}/${mockData.appConfig.app.id}`)
      .send(updateAppConfig)
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.status).to.equal(200);
        expect(res.body.data.id).to.equal('NewApp');
        expect(res.body.data.appConfig.app.id).to.equal('NewApp');
        expect(res.body.appConfig).to.equal(undefined);

        request
          .get(`${apiAppConfig}/${updateAppConfig.app.id}`)
          .end((err, responseApiAppConfig) => {
            if (err) {
              return done(err);
            }
            expect(responseApiAppConfig.status).to.equal(200);
            expect(responseApiAppConfig.body.data.id).to.equal('NewApp');
            expect(responseApiAppConfig.body.data.appConfig.app.id).to.equal('NewApp');
            expect(responseApiAppConfig.body.appConfig).to.equal(undefined);

            done();
          });
      });
  });

  it('Update app back', done => {
    request
      .put(`${apiAppConfig}/NewApp`)
      .send(mockData.appConfig)
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.status).to.equal(200);
        expect(res.body.data.id).to.equal('MyApp');
        expect(res.body.data.appConfig.app.id).to.equal('MyApp');
        expect(res.body.data.appConfig.app.title).to.equal('BVD Explore Page');
        expect(res.body.appConfig).to.equal(undefined);
        request
          .get(`${apiAppConfig}/${mockData.appConfig.app.id}`)
          .end((err, responseApiAppConfig) => {
            if (err) {
              return done(err);
            }
            expect(responseApiAppConfig.status).to.equal(200);
            expect(responseApiAppConfig.body.data.appConfig.app.title).to.equal('BVD Explore Page');
            expect(responseApiAppConfig.body.appConfig).to.equal(undefined);
            done();
          });
      });
  });

  it('Create app config with invalid data', done => {
    const invalidAppConfig = {
      app: {
        title: 'Invalid Config'
      }
    };
    request
      .post(apiAppConfig)
      .send(invalidAppConfig)
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.status).to.equal(400);
        done();
      });
  });

  it('Create additional app config', done => {
    request
      .post(apiAppConfig)
      .send(mockData.additionalAppConfig)
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.status).to.equal(200);
        request
          .get(`${apiAppConfig}/${mockData.additionalAppConfig.app.id}`)
          .end((err, responseApiAppConfig) => {
            if (err) {
              return done(err);
            }
            expect(responseApiAppConfig.status).to.equal(200);
            expect(responseApiAppConfig.body.data.appConfig.app.id).to.equal('SecondAppConfig');
            expect(responseApiAppConfig.body.appConfig).to.equal(undefined);
            done();
          });
      });
  });

  it('Get all app configs', done => {
    request
      .get(apiAppConfig)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.status).to.equal(200);
        expect(res.body.data.length).to.equal(2);
        done();
      });
  });

  it('Get merged app config inside system data', done => {
    request
      .get(systemUrl)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.status).to.equal(200);
        expect(res.body.appConfig.app).not.to.be.undefined;
        expect(res.body.appConfig.context).not.to.be.undefined;
        expect(res.body.data).not.to.be.undefined;
        expect(res.body.appConfig.app.title).to.deep.equal({ default: 'OPTIC One', l10n: 'app.title.service.assurance.ui' });
        expect(res.body.appConfig.timeIntervals).not.to.be.undefined;
        expect(res.body.appConfig.timeIntervals.fiveMinutes).to.equal('4s');
        expect(res.body.appConfig.timeIntervals.fifteenMinutes).to.equal('10s');
        done();
      });
  });

  it('Delete app config', done => {
    request
      .delete(`${apiAppConfig}/${mockData.additionalAppConfig.app.id}`)
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.status).to.equal(200);
        expect(res.body.result).to.be.equal('AppConfig deleted');
        request
          .get(`${apiAppConfig}/${mockData.additionalAppConfig.app.id}`)
          .end((err, responseApiAppConfig) => {
            if (err) {
              return done(err);
            }
            expect(responseApiAppConfig.status).to.equal(404);
            done();
          });
      });
  });

  it('logout', done => {
    shared.logout(request, done);
  });
});
