'use strict';

const fs = require('fs'),
  path = require('path');
const supertest = require('supertest');
const shared = require('./../helpers/shared');

const request = supertest.agent(shared.testURL + shared.rootContext);

describe('Session (user) API Test', () => {
  const adminLogin = shared.tenant.email,
    adminPasswd = shared.tenant.password,
    api = '/rest/v2/session/user';

  const mockData = {
    defaultDashboard: 'test-nonexisting-default-dashboard'
  };

  it('login admin', done => {
    shared.login(request, api, adminLogin, adminPasswd, done);
  });

  it('get user details', done => {
    request
      .get(api)
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        expect(res.body.data.userDetails).not.equal(undefined);
        expect(res.body.data.userDetails.login).equal(adminLogin);

        if (res.body.data.userDetails.isSuperAdmin) {
          expect(res.body.data.userDetails.apiKey).not.equal(undefined);
        } else {
          expect(res.body.data.userDetails.apiKey).equal(undefined);
        }

        return done();
      });
  });

  it('change user details', done => {
    const changeObj = {
      name: 'changed-admin-name',
      // eslint-disable-next-line camelcase
      email_address: 'fake@fake.com',
      defaultDashboard: mockData.defaultDashboard
    };

    request
      .put(api)
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .send({
        userDetails: changeObj
      })
      .expect(200, done);
  });

  it('change user details (empty changed user details)', done => {
    const changeObj = {};

    request
      .put(api)
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .send({
        userDetails: changeObj
      })
      // eslint-disable-next-line node/handle-callback-err
      .end((err, response) => {
        expect(response.status).to.equal(400);

        return done();
      });
  });

  it('get user default dashboard (suggested dashboard)', done => {
    request
      .get(api)
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        expect(res.body.data.userDetails.defaultDashboard).not.equal(undefined);
        expect(res.body.data.userDetails.defaultDashboard).not.equal(mockData.defaultDashboard);

        return done();
      });
  });

  it('logout', done => {
    shared.logout(request, done);
  });
});

describe('Session (ping) API Test', () => {
  const adminLogin = shared.tenant.email,
    adminPasswd = shared.tenant.password,
    api = '/rest/v2/session/ping',
    buildNumberFilePath = path.resolve(__dirname, '../../../shared/buildNumber.json');

  it('login admin', done => {
    shared.login(request, api, adminLogin, adminPasswd, done);
  });

  it('get ping', done => {
    request
      .get(api)
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        // eslint-disable-next-line node/no-sync
        const buildNumber = JSON.parse(fs.readFileSync(buildNumberFilePath, 'utf-8'));

        expect(res.body.data.buildNumber).equal(buildNumber.buildNumber);
        expect(res.body.data.releaseVersion).equal(buildNumber.releaseVersion);
        expect(res.body.message).equal('OK');

        return done();
      });
  });

  it('logout', done => {
    shared.logout(request, done);
  });
});
