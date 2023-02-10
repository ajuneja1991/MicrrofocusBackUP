'use strict';

const fs = require('fs'),
  path = require('path');

const supertest = require('supertest');

const shared = require('./../helpers/shared');

const request = supertest.agent(shared.testURL + shared.rootContext);

describe('System API Test', () => {
  const adminLogin = shared.tenant.email,
    adminPasswd = shared.tenant.password,
    api = '/rest/v2/system';
  const buildNumberFilePath = path.resolve(__dirname, '../../../shared/buildNumber.json');

  // eslint-disable-next-line node/no-sync
  const buildNumber = JSON.parse(fs.readFileSync(buildNumberFilePath, 'utf-8'));

  const errorSchema = {
    title: 'Error message schema',
    type: 'object',
    required: ['error', 'message'],
    properties: {
      error: { const: true },
      message: { type: 'string' }
    },
    additionalProperties: false
  };

  it('get server info (not logged in)', done => {
    request
      .get(api)
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        expect(shared.validateDataWithSchema(res.body, errorSchema)).to.be.true;
        expect(res.body.message).equal('Unauthorized');
        return done();
      });
  });

  const serverInfoSchema = {
    title: 'Server info schema',
    type: 'object',
    required: ['error', 'message', 'data'],
    properties: {
      error: { const: false },
      message: { const: 'OK' },
      data: {
        type: 'object',
        required: ['capabilities', 'defaultTenant', 'featureToggles', 'licenseStatus', 'maintenance',
          'startOfTheWeek', 'suite', 'timeFormat', 'uploadedDashboards', 'version'],
        properties: {
          capabilities: { type: 'object' },
          defaultTenant: { const: 'Provider' },
          featureToggles: { type: 'object' },
          licenseStatus: { type: 'object' },
          maintenance: { type: 'string' },
          startOfTheWeek: { type: 'string' },
          suite: { type: 'object' },
          timeFormat: { },
          uploadedDashboards: { type: 'number' },
          version: {
            type: 'object',
            required: ['buildNumber', 'releaseVersion'],
            properties: {
              buildNumber: { type: 'string' },
              releaseVersion: { type: 'string' }
            }
          },
          additionalProperties: false
        },
        additionalProperties: false
      }
    },
    additionalProperties: false
  };

  it('get basic server info (not logged in)', done => {
    request
      .get(`${api}-basic`)
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        expect(shared.validateDataWithSchema(res.body, serverInfoSchema)).to.be.true;

        expect(res.body.data.version.buildNumber).equal(buildNumber.buildNumber);
        expect(res.body.data.version.releaseVersion).equal(buildNumber.releaseVersion);
        expect(Object.keys(res.body.data.licenseStatus).length).equal(0);
        expect(res.body.data.uploadedDashboards).not.to.be.NaN;
        expect(res.body.data.maintenance).equal('');

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
