'use strict';

const fs = require('fs'),
  path = require('path');
const supertest = require('supertest');
const shared = require('../helpers/shared');
const request = supertest.agent(shared.exploreTestURL);

describe('Session (ping) API Test - V1', () => {
  const adminLogin = shared.tenant.email,
    adminPasswd = shared.tenant.password,
    api = '/rest/v1/session/ping',
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

describe('Session (user) API Test - V1', () => {
  const adminLogin = shared.tenant.email,
    adminPasswd = shared.tenant.password,
    api = '/rest/v1/session/user';

  it('login admin', done => {
    shared.login(request, api, adminLogin, adminPasswd, done);
  });

  it('get user', done => {
    request
      .get(api)
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        expect(res.body.user.userName).not.equal(undefined);
        return done();
      });
  });

  it('logout', done => {
    shared.logout(request, done);
  });
});
