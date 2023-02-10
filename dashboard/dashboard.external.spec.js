/* eslint-disable no-unused-expressions, node/no-sync, node/global-require */

const async = require('async');
const { randomUUID } = require('crypto');
const supertest = require('supertest');
const fs = require('fs'),
  path = require('path');
const shared = require('./../helpers/shared');

const request = supertest.agent(shared.testURL + shared.rootContext);

describe('Dashboard External API Test', () => {
  const adminLogin = shared.tenant.email,
    adminPasswd = shared.tenant.password,
    apiBase = '/rest/v2/dataCollector',
    apiBaseExternal = '/urest/v2/dashboard/';

  const nonAdminUser = {
    login: `${randomUUID()}@example.com`,
    passwd: 'Abc1234$'
  };

  const nonAdminTester = 'nonAdminTester';
  const nonAdminTesterRole = 'non_admin_tester_role';
  let roleId;

  it('Login non admin user', done => {
    shared.login(request, '/rest/v2/tenant/systemsettings', nonAdminUser.login, nonAdminUser.passwd, done);
  });

  it('import: not authorized', done => {
    request
      .post(apiBaseExternal)
      .expect(401)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.text).not.equal(undefined);
        expect(res.text).not.equal(null);

        const result = JSON.parse(res.text);

        expect(result.status.statusCode).equal(401);
        expect(result.status.message).equal('You are not authorized to use this API');

        return done();
      });
  });

  it('Log out', done => {
    shared.logout(request, done);
  });

  it('import: not authenticated', done => {
    request
      .post(apiBaseExternal)
      .expect(401)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.text).not.equal(undefined);
        expect(res.text).not.equal(null);

        const result = JSON.parse(res.text);

        expect(result.message).equal('Unauthorized');

        return done();
      });
  });

  it('Login Admin', done => {
    shared.login(request, '/rest/v2/tenant/systemsettings', adminLogin, adminPasswd, done);
  });

  it('import: missing file', done => {
    request
      .post(apiBaseExternal)
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .expect(400)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.text).not.equal(undefined);
        expect(res.text).not.equal(null);

        const result = JSON.parse(res.text);

        expect(result.status.statusCode).equal(400);
        expect(result.status.message).equal('No or empty file selected.');

        return done();
      });
  });

  it('import: empty file', done => {
    request
      .post(apiBaseExternal)
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .attach('dashboardFile', '')
      .expect(400)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.text).not.equal(undefined);
        expect(res.text).not.equal(null);

        const result = JSON.parse(res.text);

        expect(result.status.statusCode).equal(400);
        expect(result.status.message).equal('No or empty file selected.');

        return done();
      });
  });

  it('import: not a dashboard file', done => {
    request
      .post(apiBaseExternal)
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .attach('dashboardFile', path.resolve(__dirname, '../test-files/notSvgFile.txt'))
      .expect(400)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.text).not.equal(undefined);
        expect(res.text).not.equal(null);

        const result = JSON.parse(res.text);

        expect(result.status.statusCode).equal(400);
        expect(result.status.message).equal('The selected file is not a valid dashboard file.');

        return done();
      });
  });

  it('import: empty / wrong JSON', done => {
    request
      .post(apiBaseExternal)
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .attach('dashboardFile', path.resolve(__dirname, '../test-files/emptyJson.bvd'))
      .expect(400)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.text).not.equal(undefined);
        expect(res.text).not.equal(null);

        const result = JSON.parse(res.text);

        expect(result.status.statusCode).equal(400);
        expect(result.status.message).equal('The selected file is not a valid dashboard file.');

        return done();
      });
  });

  it('import: empty SVG in dashboard file', done => {
    request
      .post(apiBaseExternal)
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .attach('dashboardFile', path.resolve(__dirname, '../test-files/emptyXML.bvd'))
      .expect(400)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.text).not.equal(undefined);
        expect(res.text).not.equal(null);

        const result = JSON.parse(res.text);

        expect(result.status.statusCode).equal(400);
        expect(result.status.message).equal('The selected file is not a valid dashboard file.');

        return done();
      });
  });

  it('import: missing SVG in dashboard file', done => {
    request
      .post(apiBaseExternal)
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .attach('dashboardFile', path.resolve(__dirname, '../test-files/missingXML.bvd'))
      .expect(400)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.text).not.equal(undefined);
        expect(res.text).not.equal(null);

        const result = JSON.parse(res.text);

        expect(result.status.statusCode).equal(400);
        expect(result.status.message).equal('The selected file is not a valid dashboard file.');

        return done();
      });
  });

  it('import: invalid SVG', done => {
    request
      .post(apiBaseExternal)
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .attach('dashboardFile', path.resolve(__dirname, '../test-files/XMLnotSVG.bvd'))
      .expect(400)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.text).not.equal(undefined);
        expect(res.text).not.equal(null);

        const result = JSON.parse(res.text);

        expect(result.status.statusCode).equal(400);
        expect(result.status.message).equal('The selected file is not a valid dashboard file.');

        return done();
      });
  });

  it('import: invalid predefined query', done => {
    request
      .post(apiBaseExternal)
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .attach('dashboardFile', path.resolve(__dirname, '../test-files/invalidDataCollector.bvd'))
      .expect(400)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.text).not.equal(undefined);
        expect(res.text).not.equal(null);

        const result = JSON.parse(res.text);

        expect(result.status.statusCode).equal(400);
        expect(result.status.message).equal('The selected file is not a valid dashboard file.');

        return done();
      });
  });

  it('import: invalid predefined query JSON', done => {
    request
      .post(apiBaseExternal)
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .attach('dashboardFile', path.resolve(__dirname, '../test-files/invalidDataCollectorJson.bvd'))
      .expect(400)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.text).not.equal(undefined);
        expect(res.text).not.equal(null);

        const result = JSON.parse(res.text);

        expect(result.status.statusCode).equal(400);
        expect(result.status.message).equal('The selected file is not a valid dashboard file.');

        return done();
      });
  });

  it('import: too big file', done => {
    const buffer = Buffer.alloc((20 * 1024 * 1024) + 1);

    fs.writeFileSync(path.resolve(__dirname, 'test.file'), buffer);

    request
      .post(apiBaseExternal)
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .attach('dashboardFile', path.resolve(__dirname, 'test.file'))
      .expect(400)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.text).not.equal(undefined);
        expect(res.text).not.equal(null);

        const result = JSON.parse(res.text);

        expect(result.status.statusCode).equal(400);
        expect(result.status.message).equal('The selected dashboard file is too big.');

        return done();
      });
  });

  it('import: dashboard without predefined query', done => {
    request
      .post(apiBaseExternal)
      .attach('dashboardFile', path.resolve(__dirname, '../test-files/twoValues.bvd'))
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .field('title', 'two Values test 1')
      .expect(200)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.text).not.equal(undefined);
        expect(res.text).not.equal(null);

        const result = JSON.parse(res.text);

        expect(result.status.statusCode).equal(200);

        return done();
      });
  });

  it('import: overwrite dashboard without predefined query', done => {
    request
      .post(apiBaseExternal)
      .attach('dashboardFile', path.resolve(__dirname, '../test-files/twoValues.bvd'))
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .field('title', 'two Values test 1')
      .expect(200)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.text).not.equal(undefined);
        expect(res.text).not.equal(null);

        const result = JSON.parse(res.text);

        expect(result.status.statusCode).equal(200);

        return done();
      });
  });

  it('export: dashboard without predefined query', done => {
    request
      .get(`${apiBaseExternal}twoValues`)
      .expect(200)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        fs.writeFileSync(path.resolve(__dirname, '../test-files/twoValues.fs'), res.text);

        const result = JSON.parse(res.text);

        expect(result.version).equal(1);
        expect(result.xml.indexOf('<?xml version="1.0" encoding="UTF-8" standalone="no"?>')).equal(0);
        expect(result.xml.indexOf('<instances><![CDATA[[{')).equal(-1);
        expect(result.dataCollectors).to.be.undefined;

        return done();
      });
  });

  it('import: dashboard with a predefined query', done => {
    request
      .post(apiBaseExternal)
      .attach('dashboardFile', path.resolve(__dirname, '../test-files/twoValuesDataCollector.bvd'))
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .expect(200)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.text).not.equal(undefined);
        expect(res.text).not.equal(null);

        const result = JSON.parse(res.text);

        expect(result.status.statusCode).equal(200);

        return done();
      });
  });

  it('export: dashboard with a predefined query', done => {
    request
      .get(`${apiBaseExternal}twoValuesDataCollector`)
      .expect(200)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        fs.writeFileSync(path.resolve(__dirname, '../test-files/twoValuesDataCollector.fs'), res.text);

        const result = JSON.parse(res.text);

        expect(result.version).equal(1);
        expect(result.xml.indexOf('<?xml version="1.0" encoding="UTF-8" standalone="no"?>')).equal(0);
        expect(result.xml.indexOf('<instances><![CDATA[[{')).equal(-1);
        expect(result.dataCollectors).not.to.be.undefined;
        expect(JSON.parse(result.dataCollectors)[0].name).equal('test');

        return done();
      });
  });
  it('import: dashboard with a parameter predefined query', done => {
    request
      .post(apiBaseExternal)
      .attach('dashboardFile', path.resolve(__dirname, '../test-files/paramDataCollectors.bvd'))
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .expect(200)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.text).not.equal(undefined);
        expect(res.text).not.equal(null);

        const result = JSON.parse(res.text);

        expect(result.status.statusCode).equal(200);

        return done();
      });
  });
  it('export: dashboard with a parameter predefined query', done => {
    request
      .get(`${apiBaseExternal}paramDataCollectors`)
      .expect(200)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        fs.writeFileSync(path.resolve(__dirname, '../test-files/paramDataCollectors.fs'), res.text);

        const result = JSON.parse(res.text);

        expect(result.version).equal(1);
        expect(result.xml.indexOf('<?xml version="1.0" encoding="UTF-8" standalone="no"?>')).equal(0);
        expect(result.xml.indexOf('<instances><![CDATA[[{')).equal(-1);
        expect(result.dataCollectors).not.to.be.undefined;
        expect(JSON.parse(result.dataCollectors)[0].name).equal('dq_cpu');
        if (JSON.parse(result.dataCollectors)[0].type !== null) {
          expect(JSON.parse(result.dataCollectors)[0].type).equal('param');
        }
        return done();
      });
  });

  it('import: dashboard with a nested parameter predefined query', done => {
    request
      .post(apiBaseExternal)
      .attach('dashboardFile', path.resolve(__dirname, '../test-files/NOM_Probe_Peak_Period.bvd'))
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .expect(200)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.text).not.equal(undefined);
        expect(res.text).not.equal(null);

        const result = JSON.parse(res.text);

        expect(result.status.statusCode).equal(200);

        return done();
      });
  });

  it('export: dashboard with a nested parameter predefined query', done => {
    request
      .get(`${apiBaseExternal}NOM_Probe_Peak_Period`)
      .expect(200)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        fs.writeFileSync(path.resolve(__dirname, '../test-files/NOM_Probe_Peak_Period.fs'), res.text);

        const result = JSON.parse(res.text);

        expect(result.version).equal(1);
        expect(result.xml.indexOf('<?xml version="1.0" encoding="UTF-8" standalone="no"?>')).equal(0);
        expect(result.dataCollectors).not.to.be.undefined;
        expect(JSON.parse(result.dataCollectors)[0].name).equal('data_query');
        expect(JSON.parse(result.dataCollectors)[3].name).equal('sold_item (si)');
        expect(JSON.parse(result.dataCollectors).length).equal(4);
        return done();
      });
  });

  it('import: dashboard with cyclic dependency predefined queries', done => {
    request
      .post(apiBaseExternal)
      .attach('dashboardFile', path.resolve(__dirname, '../test-files/cyclicDependency.bvd'))
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.statusCode).to.equal(400);
        expect(res.body.status.details).to.equal('Cyclic dependency detected');

        return done();
      });
  });

  it('import: dashboard with a parameter query having multiple dependencies', done => {
    request
      .post(apiBaseExternal)
      .attach('dashboardFile', path.resolve(__dirname, '../test-files/multipleDependency.bvd'))
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.statusCode).to.equal(200);
        expect(res.body.status.message).to.equal('Successfully uploaded dashboard to server.');

        return done();
      });
  });

  it('import: dashboard with a predefined query using tags', done => {
    request
      .post(apiBaseExternal)
      .attach('dashboardFile', path.resolve(__dirname, '../test-files/dataCollectorWithTags.bvd'))
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .expect(200)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.text).not.equal(undefined);
        expect(res.text).not.equal(null);

        const result = JSON.parse(res.text);

        expect(result.status.statusCode).equal(200);

        return done();
      });
  });

  it('export: dashboard with a predefined query using tags', done => {
    // this test depends on the dashboard uploaded in the previous test
    request
      .get(`${apiBaseExternal}dataCollectorWithTags`)
      .expect(200)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        fs.writeFileSync(path.resolve(__dirname, '../test-files/dataCollectorWithTags.fs'), res.text);

        const result = JSON.parse(res.text);

        expect(result.version).equal(1);
        expect(result.xml.indexOf('<?xml version="1.0" encoding="UTF-8" standalone="no"?>')).equal(0);
        expect(result.dataCollectors).not.to.be.undefined;
        expect(JSON.parse(result.dataCollectors)[0].name).equal('data_query');
        expect(JSON.parse(result.dataCollectors)[0].data.tags).to.have.ordered.members(['retail', 'location_based']);
        return done();
      });
  });

  it('import: template with a predefined query', done => {
    request
      .post(apiBaseExternal)
      .attach('dashboardFile', path.resolve(__dirname, '../test-files/twoValuesTemplate.bvd'))
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .expect(200)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.text).not.equal(undefined);
        expect(res.text).not.equal(null);

        const result = JSON.parse(res.text);

        expect(result.status.statusCode).equal(200);

        return done();
      });
  });

  it('import: overwrite template with a predefined query', done => {
    request
      .post(apiBaseExternal)
      .attach('dashboardFile', path.resolve(__dirname, '../test-files/twoValuesTemplate.bvd'))
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .expect(200)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.text).not.equal(undefined);
        expect(res.text).not.equal(null);

        const result = JSON.parse(res.text);

        expect(result.status.statusCode).equal(200);

        return done();
      });
  });

  it('export: template with a predefined query', done => {
    request
      .get(`${apiBaseExternal}twoValuesTemplate`)
      .expect(200)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        fs.writeFileSync(path.resolve(__dirname, '../test-files/twoValuesTemplate.fs'), res.text);

        const result = JSON.parse(res.text);

        expect(result.version).equal(1);
        expect(result.xml.indexOf('<?xml version="1.0" encoding="UTF-8" standalone="no"?>')).equal(0);
        expect(result.xml.indexOf('<instances><![CDATA[[{')).not.equal(-1);
        expect(result.dataCollectors).not.to.be.undefined;
        expect(JSON.parse(result.dataCollectors)[0].name).equal('test');

        return done();
      });
  });

  it('export: not existing id', done => {
    request
      .get(`${apiBaseExternal}not there`)
      .expect(404)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.text).not.equal(undefined);
        expect(res.text).not.equal(null);

        const result = JSON.parse(res.text);

        expect(result.status.statusCode).equal(404);
        expect(result.status.message).equal('Dashboard not found');

        return done();
      });
  });

  it('import: dashboard with a multi locale format', done => {
    request
      .post(apiBaseExternal)
      .attach('dashboardFile', path.resolve(__dirname, '../test-files/SAR_ml.bvd'))
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .expect(200)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.text).not.equal(undefined);
        expect(res.text).not.equal(null);

        const result = JSON.parse(res.text);
        expect(result.status.statusCode).equal(200);
        request
          .get(`/rest/v2/dashboard?type=dashboards,instances&excludeNotInMenu=true`)
          .set('X-Secure-Modify-Token', shared.secureModifyToken())
          .expect(200)
          .end((getError, getRes) => {
            if (getError) {
              return done(getError);
            }
            const dashboards = getRes.body.data;
            const dashboard = dashboards.filter(item => item.id === 'SAR_ml');
            expect(dashboard[0].localization).not.equal(undefined);
            expect(dashboard[0].localization.length).equal(3); // totally it has three locales
            const l10nOptions = dashboard[0].localization;
            const defaultLocale = l10nOptions.filter(l10n => l10n.locale === 'default' && l10n.message);
            const zhLocale = l10nOptions.filter(l10n => l10n.locale === 'zh' && l10n.message);
            const deLocale = l10nOptions.filter(l10n => l10n.locale === 'de' && l10n.message);
            expect(defaultLocale.length).equal(1);
            expect(defaultLocale[0].message.dashboardTitle).equal('SAR Multi Locale Dashboard');
            expect(zhLocale.length).equal(1);
            expect(zhLocale[0].message.dashboardTitle).equal('SAR 多区域设置仪表板');
            expect(deLocale.length).equal(1);
            expect(deLocale[0].message.dashboardTitle).equal('SAR Multi-Locale-Dashboard');
            return done();
          });
      });
  });

  it('import: dashboard with a multi locale format but no title', done => {
    request
      .post(apiBaseExternal)
      .attach('dashboardFile', path.resolve(__dirname, '../test-files/SAR_ml_no_title.bvd'))
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .expect(200)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.text).not.equal(undefined);
        expect(res.text).not.equal(null);

        const result = JSON.parse(res.text);
        expect(result.status.statusCode).equal(200);
        request
          .get(`/rest/v2/dashboard?type=dashboards,instances&excludeNotInMenu=true`)
          .set('X-Secure-Modify-Token', shared.secureModifyToken())
          .expect(200)
          .end((getError, getRes) => {
            if (getError) {
              return done(getError);
            }
            const dashboards = getRes.body.data;
            const dashboard = dashboards.filter(item => item.id === 'SAR_ml_no_title');
            expect(dashboard[0].localization).equal(undefined);
            return done();
          });
      });
  });

  it('Clean up: delete all predefined queries', done => {
    request
      .get(apiBase)
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .expect('Content-Type', 'application/json; charset=utf-8')
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res.body.data).to.be.not.undefined;
        expect(Array.isArray(res.body.data)).to.equal(true);
        async.each(res.body.data, (dataCollector, next) => {
          request
            .delete(`${apiBase}/${dataCollector._id}`)
            .set('X-Secure-Modify-Token', shared.secureModifyToken())
            .expect('Content-Type', 'application/json; charset=utf-8')
            .end(next);
        }, done);
      });
  });

  // Case 1: Non admin user having full-control and predefined query edit permissions
  it('Create role in bvd for non-admin user', done => {
    const data = {
      name: nonAdminTesterRole,
      description: 'full control role for bvd',
      type: 'reporting',
      permission: [
        // eslint-disable-next-line camelcase
        { operation_key: 'full-control', resource_key: 'omi-event' },
        // eslint-disable-next-line camelcase
        { operation_key: 'View', resource_key: 'default_action<>Group-__bvd_data_collector' }
      ]
    };
    request
      .post('/rest/v2/role/')
      .send(data)
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.status).to.equal(200);
        expect(res.body.role).to.not.equal(null);
        expect(res.body.role.name).to.equal(nonAdminTesterRole);
        roleId = res.body.role.id;
        return done();
      });
  });

  it('log out', done => {
    shared.logout(request, done);
  });

  it('Login BVD non admin with full-control and predefined query edit permissions', done => {
    shared.login(request, '/rest/v2/tenant/systemsettings', nonAdminTester, adminPasswd, done);
  });

  it('export/import: dashboard without predefined query (non admin)', done => {
    request
      .get(`${apiBaseExternal}twoValues`)
      .expect(200)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        fs.writeFileSync(path.resolve(__dirname, '../test-files/twoValues.fs'), res.text);

        let result = JSON.parse(res.text);

        expect(result.version).equal(1);
        expect(result.xml.indexOf('<?xml version="1.0" encoding="UTF-8" standalone="no"?>')).equal(0);
        expect(result.xml.indexOf('<instances><![CDATA[[{')).equal(-1);
        expect(result.dataCollectors).to.be.undefined;

        request
          .post(apiBaseExternal)
          .attach('dashboardFile', path.resolve(__dirname, '../test-files/twoValues.bvd'))
          .set('X-Secure-Modify-Token', shared.secureModifyToken())
          .expect(200)
          .end((error, response) => {
            if (error) {
              return done(error);
            }
            expect(response.text).not.equal(undefined);
            expect(response.text).not.equal(null);

            result = JSON.parse(response.text);

            expect(result.status.statusCode).equal(200);

            return done();
          });
      });
  });

  it('log out(non admin)', done => {
    shared.logout(request, done);
  });

  // Case 2: Non admin user having full-control permission
  it('Admin login', done => {
    shared.login(request, '/rest/v2/tenant/systemsettings', adminLogin, adminPasswd, done);
  });

  it('Modify role in bvd for non-admin user', done => {
    const data = {
      name: nonAdminTesterRole,
      description: 'full control role for bvd',
      type: 'reporting',
      permission: [
        // eslint-disable-next-line camelcase
        { operation_key: 'full-control', resource_key: 'omi-event' }
      ]
    };
    request
      .put(`/rest/v2/role/${roleId}`)
      .send(data)
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.status).to.equal(200);
        expect(res.body.role).to.not.equal(null);
        expect(res.body.role.name).to.equal(nonAdminTesterRole);
        roleId = res.body.role.id;
        return done();
      });
  });

  it('log out admin', done => {
    shared.logout(request, done);
  });

  it('Login BVD non admin with full-control', done => {
    shared.login(request, '/rest/v2/tenant/systemsettings', nonAdminTester, adminPasswd, done);
  });

  it('export/import: dashboard without predefined query (non admin with only full-control)', done => {
    request
      .get(`${apiBaseExternal}twoValues`)
      .expect(401)
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        expect(res.body.status.reasonPhrase).equal('Unauthorized');

        request
          .post(apiBaseExternal)
          .attach('dashboardFile', path.resolve(__dirname, '../test-files/twoValues.bvd'))
          .set('X-Secure-Modify-Token', shared.secureModifyToken())
          .expect(401)
          .end((error, response) => {
            if (error) {
              return done(error);
            }
            expect(response.body.status.reasonPhrase).equal('Unauthorized');
            return done();
          });
      });
  });
  it('log out (non admin)', done => {
    shared.logout(request, done);
  });
});
