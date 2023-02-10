const shared = require('../helpers/shared');
const supertest = require('supertest');
const request = supertest.agent(shared.exploreTestURL);
const fs = require('fs'),
  path = require('path');

describe('System Rest Service Test', () => {
  const adminLogin = shared.tenant.email,
    adminPasswd = shared.tenant.password,
    appConfigUrl = '/rest/v2/system';
  const buildNumberFilePath = path.join(__dirname, '../../../shared/buildNumber.json');

  // eslint-disable-next-line node/no-sync
  const buildNumber = JSON.parse(fs.readFileSync(buildNumberFilePath, 'utf-8'));
  // eslint-disable-next-line node/no-process-env
  const originalConfigPath = process.env.EXPLORE_CONFIG_PATH;

  beforeEach(() => {
    // eslint-disable-next-line node/no-process-env
    process.env.EXPLORE_CONFIG_PATH = path.join(__dirname, '/../mockdata');
  });

  it('Login admin', done => {
    shared.login(request, appConfigUrl, adminLogin, adminPasswd, done);
  });

  it('Get system data', done => {
    request
      .get(appConfigUrl)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.status).to.equal(200);
        expect(res.body.appConfig.app).not.to.be.undefined;
        expect(res.body.appConfig.context).not.to.be.undefined;
        expect(res.body.data).not.to.be.undefined;
        expect(res.body.appConfig.timeIntervals).not.to.be.undefined;
        expect(res.body.appConfig.timeIntervals.fiveMinutes).to.equal('4s');
        expect(res.body.appConfig.timeIntervals.fifteenMinutes).to.equal('10s');
        done();
      });
  });

  it('get basic server info (not logged in)', done => {
    request
      .get(`${appConfigUrl}-basic`)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.body.data.version.buildNumber).equal(buildNumber.buildNumber);
        expect(res.body.data.version.releaseVersion).equal(buildNumber.releaseVersion);
        expect(res.body.data.licenseStatus).to.be.a('object');
        expect(res.body.data.suite).to.be.a('object');
        expect(Object.keys(res.body.data.licenseStatus).length).equal(0);
        expect(res.body.data.uploadedDashboards).not.to.be.NaN;
        expect(res.body.data.defaultTenant).equal('Provider');

        return done();
      });
  });

  it('logout', done => {
    shared.logout(request, done);
  });

  afterEach(() => {
    // eslint-disable-next-line node/no-process-env
    process.env.EXPLORE_CONFIG_PATH = originalConfigPath;
  });
});
