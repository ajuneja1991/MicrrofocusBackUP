const fs = require('fs');
const _ = require('lodash');
const supertest = require('supertest');
const path = require('path');
const shared = require('./../helpers/shared');

const request = supertest.agent(shared.testURL + shared.rootContext);

describe('Dashboard API Test - V1', () => {
  const
    apiBase = '/rest/v1/dashboard/',
    instanceApi = '/instance',
    adminLogin = shared.tenant.email,
    adminPasswd = shared.tenant.password;

  const mockData = {
    testDashboardName: 'test-dashboard',
    testDashboardSvgFile: path.resolve(__dirname, '../test-files/test-dashboard.svg'),
    notSvgFile: path.resolve(__dirname, '../test-files/notSvgFile.txt'),
    largeSvgFile: path.resolve(__dirname, '../test-files/largeSvgFile.svg'),
    testDashboardTemplateName: 'test-dashboard-template',
    testDashboardTemplateSvgFile: path.resolve(__dirname, '../test-files/test-dashboard-template.svg')
  };

  it('Login Admin', done => {
    shared.login(request, '/rest/v1/tenant/systemsettings', adminLogin, adminPasswd, done);
  });

  // dashboard and template tests

  it('create dashboard', done => {
    const api = apiBase + mockData.testDashboardName;

    request
      .get(api)
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .expect(200)
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        if (!res.body.data) {
          // dashboard does not exist => create dashboard
          const postParams = {
            dashboardObject: {
              title: mockData.testDashboardName,
              // eslint-disable-next-line node/no-sync
              svgFile: fs.readFileSync(mockData.testDashboardSvgFile, {
                encoding: 'utf8'
              }),
              widgets: [],
              variables: null
            }
          };

          request
            .post(api)
            .set('X-Secure-Modify-Token', shared.secureModifyToken())
            .send(postParams)
            .expect(200)
            // eslint-disable-next-line no-shadow
            .end((err, res) => {
              if (err) {
                return done(err);
              }
              expect(res.body.data).to.not.equal(undefined);
              expect(res.body.data).to.not.equal(null);
              expect(res.body.data.name).to.equal(mockData.testDashboardName);

              return done();
            });
        } else {
          return done();
        }
      });
  });

  it('create dashboard (dashboard already exists)', done => {
    const api = apiBase + mockData.testDashboardName;

    request
      .get(api)
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .expect(200)
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        expect(res.body.data).to.not.be.undefined;
        expect(res.body.data).to.not.be.null;

        if (!res.body.data) {
          // dashboard does not exist => create dashboard
          const postParams = {
            dashboardObject: {}
          };

          request
            .post(api)
            .set('X-Secure-Modify-Token', shared.secureModifyToken())
            .send(postParams)
            .expect(200)
            // eslint-disable-next-line no-shadow
            .end((err, res) => {
              if (err) {
                return done(err);
              }
              expect(res.status).to.equal(400);

              return done();
            });
        } else {
          return done();
        }
      });
  });

  it('create dashboard (empty dashboard)', done => {
    const api = `${apiBase}empty-dashboard`;

    request
      .post(api)
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .send({})
      .expect(400)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.status).to.equal(400);

        return done();
      });
  });

  it('get dashboard', done => {
    const api = apiBase + mockData.testDashboardName;

    request
      .get(api)
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .expect(200)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.body.data).not.equal(undefined);
        expect(res.body.data).not.equal(null);
        expect(res.body.data.name).equal(mockData.testDashboardName);
        expect(res.body.data.id).equal(res.body.data._id.toString());

        return done();
      });
  });

  it('update dashboard (empty update object)', done => {
    const api = apiBase + mockData.testDashboardName;

    request
      .put(api)
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .send({})
      .expect(400)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.status).to.equal(400);

        return done();
      });
  });

  it('update dashboard (invalid characters in title)', done => {
    const api = apiBase + mockData.testDashboardName;

    const updateObj = {
      dashboardUpdateObject: {
        title: 'test-dashboard-+=&;'
      }
    };

    request
      .put(api)
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .send(updateObj)
      .expect(400)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.status).to.equal(400);

        return done();
      });
  });

  it('update dashboard', done => {
    const api = apiBase + mockData.testDashboardName;

    const updateObj = {
      dashboardUpdateObject: {
        title: 'test-dashboard-updated'
      },
      options: {
        widgets: true
      }
    };

    request
      .put(api)
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .send(updateObj)
      .expect(200)
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        expect(res.body.data).not.equal(undefined);
        expect(res.body.data).not.equal(null);
        expect(res.body.data[0].title).equal(updateObj.dashboardUpdateObject.title);

        return done();
      });
  });

  it('update dashboard (show in menu)', done => {
    const api = apiBase + mockData.testDashboardName;

    const updateObj = {
      dashboardUpdateObject: {
        showInMenu: false
      }
    };

    request
      .put(api)
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .send(updateObj)
      .expect(200)
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        expect(res.body.data).not.equal(undefined);
        expect(res.body.data).not.equal(null);
        expect(res.body.data[0].showInMenu).equal(updateObj.dashboardUpdateObject.showInMenu);

        return done();
      });
  });

  it('process svg file', done => {
    const api = `${apiBase}svg`;

    request
      .post(api)
      .attach('dashboardFile', mockData.testDashboardSvgFile)
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .expect(200)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.text).not.equal(undefined);
        expect(res.text).not.equal(null);

        const result = JSON.parse(res.text);
        const resultData = JSON.parse(result.data);

        expect(resultData.msg).equal('dashboard.server.api.processSvg.success');

        return done();
      });
  });

  it('process svg file (not SVG)', done => {
    const api = `${apiBase}svg`;

    request
      .post(api)
      .attach('dashboardFile', mockData.notSvgFile)
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .expect(400)
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        expect(err).to.be.null;
        expect(res.status).to.equal(400);

        const resText = JSON.parse(res.text);

        expect(resText.additionalInfo.length > 0).to.be.true;
        expect(resText.message).to.equal('dashboard.server.api.processSvg.nosvg');
        expect(resText.additionalInfo[0].length).to.equal(0);

        return done();
      });
  });

  it('process svg file (large SVG)', done => {
    const api = `${apiBase}svg`;

    request
      .post(api)
      .attach('dashboardFile', mockData.largeSvgFile)
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .expect(400)
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        expect(err).to.be.null;
        expect(res.status).to.equal(400);

        const resText = JSON.parse(res.text);

        expect(resText.message).to.equal('dashboard.server.api.processSvg.size');

        return done();
      });
  });

  it('get dashboards by type (all types)', done => {
    request
      .get(apiBase)
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .expect(200)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.body.data).not.equal(undefined);
        expect(res.body.data).not.equal(null);
        expect(_.isArray(res.body.data)).equal(true);

        return done();
      });
  });

  it('get dashboards by type (templates + regular dashboards)', done => {
    request
      .get(apiBase)
      .query('type=dashboards,templates')
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .expect(200)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.body.data).not.equal(undefined);
        expect(res.body.data).not.equal(null);
        expect(_.isArray(res.body.data)).equal(true);

        if (res.body.data.length > 0) {
          expect(_.isUndefined(res.body.data[0].templateId) || _.isNull(res.body.data[0].templateId)).equal(true);

          for (let i = 0; i < res.body.data.length; i++) {
            const resData = res.body.data[i];

            expect(resData.id).equal(resData.name.toString());
          }
        }

        return done();
      });
  });

  it('get dashboards by type (instances + regular dashboards)', done => {
    request
      .get(apiBase)
      .query('type=dashboards,instances')
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .expect(200)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.body.data).not.equal(undefined);
        expect(res.body.data).not.equal(null);
        expect(_.isArray(res.body.data)).equal(true);

        if (res.body.data.length > 0) {
          for (let i = 0; i < res.body.data.length; i++) {
            const resData = res.body.data[i];

            expect(resData.id).equal(resData.name.toString());
          }
        }

        return done();
      });
  });

  it('get dashboards by type (excluded not-in-menu + regular dashboards)', done => {
    request
      .get(apiBase)
      .query('type=dashboards&excludeNotInMenu=true')
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .expect(200)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.body.data).not.equal(undefined);
        expect(res.body.data).not.equal(null);
        expect(_.isArray(res.body.data)).equal(true);

        if (res.body.data.length > 0) {
          for (let i = 0; i < res.body.data.length; i++) {
            const resData = res.body.data[i];

            expect(resData.id).equal(resData.name.toString());
            expect(resData.showInMenu).equal(true);
          }
        }

        return done();
      });
  });

  it('Perform deletion of dashboard with invalid csrf token', done => {
    const api = apiBase + mockData.testDashboardName;

    request
      .delete(api)
      .set('X-Secure-Modify-Token', 'm6WBppef-xdWYLmZmOAtxDECtv62gaRaxNi')
      .expect(403)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.body.message).to.equal('Forbidden');
        return done();
      });
  });

  it('delete dashboard', done => {
    const api = apiBase + mockData.testDashboardName;

    request
      .delete(api)
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .expect(200)
      .end(err => {
        if (err) {
          return done(err);
        }

        return done();
      });
  });

  // dashboard template instances tests

  it('create template (invalid characters in title)', done => {
    const api = `${apiBase}invalid-chars-in-title`;

    const postParams = {
      dashboardObject: {
        title: 'dashboard-+&;'
      }
    };

    request
      .post(api)
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .send(postParams)
      .expect(400)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.status).to.equal(400);

        return done();
      });
  });

  it('create template', done => {
    const api = apiBase + mockData.testDashboardTemplateName;

    request
      .get(api)
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .expect(200)
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        if (!res.body.data) {
          // template does not exist => create template
          const postParams = {
            dashboardObject: {
              title: mockData.testDashboardTemplateName,
              // eslint-disable-next-line node/no-sync
              svgFile: fs.readFileSync(mockData.testDashboardTemplateSvgFile, {
                encoding: 'utf8'
              }),
              widgets: [],
              variables: ['test']
            }
          };

          request
            .post(api)
            .set('X-Secure-Modify-Token', shared.secureModifyToken())
            .send(postParams)
            .expect(200)
            // eslint-disable-next-line no-shadow
            .end((err, res) => {
              if (err) {
                return done(err);
              }
              expect(res.body.data).to.not.equal(undefined);
              expect(res.body.data).to.not.equal(null);
              expect(res.body.data.name).to.equal(mockData.testDashboardTemplateName);

              return done();
            });
        } else {
          return done();
        }
      });
  });

  it('get instances', done => {
    request
      .get(apiBase + mockData.testDashboardTemplateName + instanceApi)
      .expect('Content-Type', 'application/json; charset=utf-8')
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(err).to.be.null;
        expect(res.body.data).to.be.not.undefined;
        done();
      });
  });

  it('update instances (invalid characters in title)', done => {
    const createdInstanceObjs = [{
      title: 'New Instance (+);)',
      name: 'test1',
      showInMenu: true,
      variables: {}
    }];

    request
      .post(apiBase + mockData.testDashboardTemplateName + instanceApi)
      .send({
        updatedInstanceObjs: [],
        createdInstanceObjs,
        deleteExtraInstances: true
      })
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .expect(400)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.status).to.equal(400);

        return done();
      });
  });

  it('update instances', done => {
    const createdInstanceObjs = [{
      title: 'New Instance',
      name: 'test1',
      showInMenu: true,
      variables: {}
    }];

    request
      .post(apiBase + mockData.testDashboardTemplateName + instanceApi)
      .send({
        updatedInstanceObjs: [],
        createdInstanceObjs,
        deleteExtraInstances: true
      })
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .expect(200)
      .end(err => {
        if (err) {
          return done(err);
        }
        done();
      });
  });

  it('delete template', done => {
    const api = apiBase + mockData.testDashboardTemplateName;

    request
      .delete(api)
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .expect(200)
      .end(err => {
        if (err) {
          return done(err);
        }

        return done();
      });
  });

  it('log out', done => {
    shared.logout(request, done);
  });
});
