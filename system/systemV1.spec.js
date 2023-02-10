'use strict';

const fs = require('fs'),
  path = require('path');

const supertest = require('supertest');

const shared = require('./../helpers/shared');

const request = supertest.agent(shared.testURL + shared.rootContext);

describe('System API Test - V1', () => {
  const adminLogin = shared.tenant.email,
    adminPasswd = shared.tenant.password,
    api = '/rest/v1/system';
  const buildNumberFilePath = path.resolve(__dirname, '../../../shared/buildNumber.json');

  // eslint-disable-next-line node/no-sync
  const buildNumber = JSON.parse(fs.readFileSync(buildNumberFilePath, 'utf-8'));

  it('get server info (not logged in)', done => {
    request
      .get(api)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.body.error).equal(true);
        expect(res.body.message).equal('Unauthorized');
        expect(res.body.data).to.be.undefined;

        return done();
      });
  });

  it('get basic server info (not logged in)', done => {
    request
      .get(`${api}-basic`)
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        expect(res.body.error).equal(false);
        expect(res.body.message).equal('OK');
        expect(res.body.data.version.buildNumber).equal(buildNumber.buildNumber);
        expect(res.body.data.version.releaseVersion).equal(buildNumber.releaseVersion);
        expect(res.body.data.licenseStatus).to.be.a('object');
        expect(res.body.data.suite).to.be.a('object');
        expect(Object.keys(res.body.data.licenseStatus).length).equal(0);
        expect(res.body.data.uploadedDashboards).not.to.be.NaN;
        expect(res.body.data.maintenance).equal('');
        expect(res.body.data.defaultTenant).equal('Provider');

        return done();
      });
  });

  it('login admin', done => {
    shared.login(request, api, adminLogin, adminPasswd, done);
  });

  it('get server info', done => {
    request
      .get(api)
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        expect(res.body.error).equal(false);
        expect(res.body.message).equal('OK');
        expect(res.body.data.version.buildNumber).equal(buildNumber.buildNumber);
        expect(res.body.data.version.releaseVersion).equal(buildNumber.releaseVersion);
        expect(res.body.data.licenseStatus).to.be.a('object');
        expect(res.body.data.suite).to.be.a('object');
        expect(res.body.data.uploadedDashboards).not.to.be.NaN;
        expect(res.body.data.capabilities).to.be.a('object');
        expect(res.body.data.maintenance).equal('');

        return done();
      });
  });

  it('logout', done => {
    shared.logout(request, done);
  });
});
