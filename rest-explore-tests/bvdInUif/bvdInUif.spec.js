const shared = require('../helpers/shared');
const supertest = require('supertest');
const apiHelper = require('../../rest-api-tests/helpers/shared');
const R = require('ramda');

const request = supertest.agent(shared.exploreTestURL);
const requestBVD = supertest.agent(shared.testURL + shared.rootContext);

const adminLogin = shared.tenant.email;
const adminPasswd = shared.tenant.password;
// user tester has no role in bvd and will not see the dashboards
const testerUser = 'tester';
// user nonAdminTester has role in bvd and will see the dashboards
const nonAdminTester = 'nonAdminTester';
const nonAdminTesterRole = 'non_admin_tester_role';

const loginURL = '/rest/v2/categories';
const loginURLBVD = '/rest/v2/tenant/systemsettings';
const apiToc = '/rest/v2/pages/toc';
const apiBase = '/rest/v2/dashboard/';
const apiCategory = '/rest/v2/categories/';
const apiMenuEntry = '/rest/v2/menuEntries/';
const apiPage = '/rest/v2/pages/';
const apiRole = '/rest/v2/role/';

const testDashboardTitle = 'BVD_Dashboard_Title';
const testDashboardIdName = 'BVD_Dashboard_ID_Name';
const testSecondDashboardName = 'BVD_Dashboard_Second';
const contextType = '__bvdDashboard';
let roleId;
let roleIdBVD;
let roleIdUIF;
let id;

const category = {
  id: 'bvdDashboards',
  icon: 'hpe-globe',
  abbreviation: 'O',
  title: 'BVD_Dashboards'
};

const categoryTopLevel = {
  id: 'topLevelCategory',
  icon: 'hpe-globe',
  abbreviation: 't',
  title: 'Top_Level_Category'
};

const menuEntryPlaceholder = {
  title: 'BVD Dashboards',
  pageId: 'testPage',
  id: 'bvdDashboards123',
  options: {
    type: 'bvd-dashboard-placeholder'
  },
  categoryId: 'bvdDashboards'
};

const page = {
  id: 'testPage',
  title: 'testPage',
  tags: [{
    name: '__system', values: ['read']
  }],
  default: true,
  activation: {
    contextType: ['host']
  },
  view: {
    id: 'page_1_main',
    views: [
      {
        id: 'average_cpu_chart_component_ec',
        layout: {
          colSpan: 6,
          rowSpan: 2,
          resizable: true
        },
        options: {
          title: 'Average1',
          config: {
            graph: [
              {
                type: 'bar',
                name: 'cpuload_chart'
              }
            ]
          }
        }
      }
    ]
  }
};

const deleteRole = _roleId => new Promise((resolve, reject) => {
  request.delete(apiRole.concat(_roleId))
    .set('X-Secure-Modify-Token', shared.secureModifyToken())
    .end((err, response) => {
      if (err) {
        return reject(err);
      }
      resolve(response);
    });
});

describe('BVD in UIF', () => {
  /**
   * 5 use cases are covered in this test
   *
   * First use case:
   * UIF has only one top level category were the bvd dashboard will be stored.
   * Therefore, a category and placeholder menu entry are needed.
   * BVD has one dashboard that is assigned to two menu categories.
   *
   * Permission use case:
   * Check first if a non admin user see the dashboard from bvd (view permissions for all dashboards in bvd)
   * Second test login with non admin user and no permission in bvd. So he shouldn't see any bvd dashboards.
   *
   * Second use case:
   * UIF has only one top level category were the bvd dashboard will be stored.
   * Therefore, a category and placeholder menu entry are needed.
   * BVD has one dashboard that is assigned to two menu categories and one dashboard without an menu category.
   *
   * Third use case:
   * UIF has one top level category and the bvd dashboard will be stored in a child category.
   * Therefore, two categories and one placeholder menu entry are needed.
   * BVD has one dashboard that is assigned to two menu categories .
   *
   * Fourth use case:
   * Validate different contexts
   * First has no context, second has one, third has context, but no items
   */

  /**
   * USE CASE 1
   */

  it('Login BVD', done => {
    shared.login(requestBVD, loginURLBVD, adminLogin, adminPasswd, done);
  });

  it('Create dashboard in bvd', done => {
    const api = apiBase + testDashboardIdName;

    requestBVD
      .get(api)
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .expect(200)
      .end((err, responseGetDashboard) => {
        if (err) {
          return done(err);
        }

        if (!responseGetDashboard.body.data) {
          // dashboard does not exist => create dashboard
          const postParams = {
            dashboardObject: {
              title: testDashboardTitle,
              widgets: [],
              category: [
                {
                  name: 'folder1',
                  scope: 'menu'
                },
                {
                  name: 'folder2',
                  scope: 'menu'
                }
              ],
              variables: null
            }
          };

          requestBVD
            .post(api)
            .set('X-Secure-Modify-Token', shared.secureModifyToken())
            .send(postParams)
            .expect(200)
            .end((err, responsePostDashboard) => {
              if (err) {
                return done(err);
              }
              expect(responsePostDashboard.body.data).to.not.equal(undefined);
              expect(responsePostDashboard.body.data).to.not.equal(null);
              expect(responsePostDashboard.body.data.name).to.equal(testDashboardIdName);
              expect(responsePostDashboard.body.data.title).to.equal(testDashboardTitle);
              requestBVD
                .get('/rest/v2/dashboard/?type=dashboards,instances')
                .set('X-Secure-Modify-Token', shared.secureModifyToken())
                .expect(200)
                .end((err, responseGetDashboards) => {
                  if (err) {
                    return done(err);
                  }
                  expect(responseGetDashboards.body.data).to.not.equal(undefined);
                  expect(responseGetDashboards.body.data[0].name).to.equal(testDashboardIdName);
                  expect(responseGetDashboards.body.data[0].category[0].name.startsWith('folder')).to.be.true;
                  expect(responseGetDashboards.body.data[0].category[1].name.startsWith('folder')).to.be.true;
                  return done();
                });
            });
        } else {
          return done();
        }
      });
  });

  it('Create role in bvd for non-admin user', done => {
    const data = {
      name: nonAdminTesterRole,
      description: 'View role for bvd',
      version: 0,
      type: 'reporting',
      permission: [
        // eslint-disable-next-line camelcase
        { operation_key: 'view', resource_key: 'omi-event' }
      ]
    };
    requestBVD
      .post(apiRole)
      .send(data)
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.status).to.equal(200);
        expect(res.body.role).to.not.equal(null);
        expect(res.body.role.name).to.equal(nonAdminTesterRole);
        roleIdBVD = res.body.role.id;
        return done();
      });
  });

  it('Logout BVD', done => {
    shared.logout(requestBVD, done);
  });

  it('Login BVD non admin', done => {
    shared.login(requestBVD, loginURLBVD, nonAdminTester, adminPasswd, done);
  });

  it('test non admin', done => {
    requestBVD
      .get('/rest/v2/dashboard/?type=dashboards,instances')
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .expect(200)
      .end((err, responseGetDashboards) => {
        if (err) {
          return done(err);
        }
        expect(responseGetDashboards.body.data).to.not.equal(undefined);
        expect(responseGetDashboards.body.data[0].name).to.equal(testDashboardIdName);
        expect(responseGetDashboards.body.data[0].category[0].name.startsWith('folder')).to.be.true;
        expect(responseGetDashboards.body.data[0].category[1].name.startsWith('folder')).to.be.true;
        return done();
      });
  });

  // eslint-disable-next-line mocha/no-identical-title
  it('Logout BVD', done => {
    shared.logout(requestBVD, done);
  });

  it('Login UIF', done => {
    shared.login(request, loginURL, adminLogin, adminPasswd, done);
  });

  it('Create category in UIF', done => {
    request
      .post(apiCategory)
      .send(category)
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .end((err, responsePostCategory) => {
        if (err) {
          return done(err);
        }
        expect(responsePostCategory.status).to.equal(200);
        expect(responsePostCategory.body.data[0].id).to.be.equal(category.id);
        expect(responsePostCategory.body[0]).to.equal(undefined);

        request
          .get(`${apiCategory}${category.id}`)
          .end((err, responseGetCategory) => {
            if (err) {
              return done(err);
            }
            expect(responseGetCategory.status).to.equal(200);
            expect(responseGetCategory.body.data.id).to.equal(category.id);
            expect(responseGetCategory.body.id).to.equal(undefined);
            return done();
          });
      });
  });

  it('Create menu entry in UIF', done => {
    request
      .post(apiPage)
      .send(page)
      .set('X-Secure-Modify-Token', apiHelper.secureModifyToken())
      .end((err, responsePostPage) => {
        if (err) {
          return done(err);
        }
        expect(responsePostPage.status).to.equal(200);
        expect(responsePostPage.body.data[0].id).to.equal(page.id);
        expect(responsePostPage.body[0]).to.equal(undefined);

        request
          .post(apiMenuEntry)
          .send([menuEntryPlaceholder])
          .set('X-Secure-Modify-Token', apiHelper.secureModifyToken())
          .end((err, responsePostMenuEntry) => {
            if (err) {
              return done(err);
            }
            expect(responsePostMenuEntry.status).to.equal(200);
            id = responsePostMenuEntry.body.data[0].id;
            expect(id.length).to.be.equal(16);
            request
              .get(apiMenuEntry.concat(id))
              .end((getErr, responseGetMenuEntry) => {
                expect(responseGetMenuEntry.status).to.equal(200);
                expect(responseGetMenuEntry.body.data.title).to.be.equal(menuEntryPlaceholder.title);
                return done();
              });
          });
      });
  });

  it('Validate toc with only one dashboard in two folders', done => {
    request
      .get(apiToc)
      .end((err, responseGetToc) => {
        if (err) {
          return done(err);
        }
        expect(responseGetToc.status).to.equal(200);
        expect(responseGetToc.body.data[0].title).to.equal(category.title);
        expect(responseGetToc.body.data[0].children.length).to.equal(2);
        expect(responseGetToc.body.data[0].children[0].title.startsWith('folder')).to.be.true;
        expect(responseGetToc.body.data[0].children[0].fullControl).to.be.false;
        expect(responseGetToc.body.data[0].children[0].children[0].title).to.equal(testDashboardTitle);
        expect(responseGetToc.body.data[0].children[1].title.startsWith('folder')).to.be.true;
        expect(responseGetToc.body.data[0].children[1].fullControl).to.be.false;
        expect(responseGetToc.body.data[0].children[1].children[0].title).to.equal(testDashboardTitle);
        return done();
      });
  });

  /**
   * USE CASE PERMISSIONS
   */
  it('Check with non-admin (nonAdminTester) user and have view permission in bvd', done => {
    const data = {
      name: nonAdminTesterRole,
      description: 'View role for foundation',
      permission: [
        // eslint-disable-next-line camelcase
        { operation_key: 'View', resource_key: 'default_action<>All' },
        // eslint-disable-next-line camelcase
        { operation_key: 'View', resource_key: 'menu<>All' }
      ]
    };
    request
      .post(apiRole)
      .send(data)
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.status).to.equal(200);
        expect(res.body.role).to.not.equal(null);
        expect(res.body.role.name).to.equal(nonAdminTesterRole);
        roleIdUIF = res.body.role.id;
        shared.logout(request, () => {
          shared.login(request, loginURL, nonAdminTester, adminPasswd, () => {
            request
              .get(apiToc)
              .end((err, responseGetToc) => {
                if (err) {
                  return done(err);
                }
                expect(responseGetToc.status).to.equal(200);
                expect(responseGetToc.body.data[0].title).to.equal(category.title);
                expect(responseGetToc.body.data[0].children.length).to.equal(2);
                expect(responseGetToc.body.data[0].children[0].title.startsWith('folder')).to.be.true;
                expect(responseGetToc.body.data[0].children[0].fullControl).to.be.false;
                expect(responseGetToc.body.data[0].children[0].children[0].title).to.equal(testDashboardTitle);
                expect(responseGetToc.body.data[0].children[1].title.startsWith('folder')).to.be.true;
                expect(responseGetToc.body.data[0].children[1].fullControl).to.be.false;
                expect(responseGetToc.body.data[0].children[1].children[0].title).to.equal(testDashboardTitle);
                return done();
              });
          });
        });
      });
  });

  it('Logout UIF', done => {
    shared.logout(request, done);
  });

  // eslint-disable-next-line mocha/no-identical-title
  it('Login UIF', done => {
    shared.login(request, loginURL, adminLogin, adminPasswd, done);
  });

  it('Check with non-admin user (tester) and permission not to see anything from bvd', done => {
    const data = {
      name: 'bvd_tester',
      description: 'View role for foundation',
      permission: [
        // eslint-disable-next-line camelcase
        { operation_key: 'View', resource_key: 'default_action<>All' },
        // eslint-disable-next-line camelcase
        { operation_key: 'View', resource_key: 'menu<>All' }
      ]
    };
    request
      .post(apiRole)
      .send(data)
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.status).to.equal(200);
        expect(res.body.role).to.not.equal(null);
        expect(res.body.role.name).to.equal('bvd_tester');
        roleId = res.body.role.id;
        shared.logout(request, () => {
          shared.login(request, loginURL, testerUser, adminPasswd, () => {
            request
              .get(apiToc)
              .end((err, responseGetToc) => {
                if (err) {
                  return done(err);
                }
                expect(responseGetToc.status).to.equal(200);
                // the user shall not see the bvd dashboards
                expect(responseGetToc.body.data.length).to.equal(0);
                return done();
              });
          });
        });
      });
  });
  // eslint-disable-next-line mocha/no-identical-title
  it('Logout UIF', done => {
    shared.logout(request, done);
  });

  /**
   * USE CASE 2
   */
  // eslint-disable-next-line mocha/no-identical-title
  it('Login BVD', done => {
    shared.login(requestBVD, loginURLBVD, adminLogin, adminPasswd, done);
  });

  // eslint-disable-next-line mocha/no-identical-title
  it('Create dashboard in bvd', done => {
    const api = apiBase + testSecondDashboardName;

    requestBVD
      .get(api)
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .expect(200)
      .end((err, responseGetDashboard) => {
        if (err) {
          return done(err);
        }

        if (!responseGetDashboard.body.data) {
          // dashboard does not exist => create dashboard
          const postParams = {
            dashboardObject: {
              title: testSecondDashboardName,
              widgets: [],
              variables: null
            }
          };

          requestBVD
            .post(api)
            .set('X-Secure-Modify-Token', shared.secureModifyToken())
            .send(postParams)
            .expect(200)
            .end((err, responsePostDashboard) => {
              if (err) {
                return done(err);
              }
              expect(responsePostDashboard.body.data).to.not.equal(undefined);
              expect(responsePostDashboard.body.data).to.not.equal(null);
              expect(responsePostDashboard.body.data.name).to.equal(testSecondDashboardName);
              requestBVD
                .get('/rest/v2/dashboard/?type=dashboards,instances')
                .set('X-Secure-Modify-Token', shared.secureModifyToken())
                .expect(200)
                .end((err, responseGetDashboards) => {
                  if (err) {
                    return done(err);
                  }
                  expect(responseGetDashboards.body.data).to.not.equal(undefined);
                  expect(responseGetDashboards.body.data[0].name).to.equal(testSecondDashboardName);
                  expect(responseGetDashboards.body.data[1].name).to.equal(testDashboardIdName);
                  return done();
                });
            });
        } else {
          return done();
        }
      });
  });

  // eslint-disable-next-line mocha/no-identical-title
  it('Logout BVD', done => {
    shared.logout(requestBVD, done);
  });

  // eslint-disable-next-line mocha/no-identical-title
  it('Login UIF', done => {
    shared.login(request, loginURL, adminLogin, adminPasswd, done);
  });

  it('Validate toc with one dashboard in two folders and one dashboard without category', done => {
    request
      .get(apiToc)
      .end((err, responseGetToc) => {
        if (err) {
          return done(err);
        }
        expect(responseGetToc.status).to.equal(200);
        expect(responseGetToc.body.data[0].children[0].title).to.equal(testSecondDashboardName);
        expect(responseGetToc.body.data[0].children.length).to.equal(3);
        expect(responseGetToc.body.data[0].children[1].title.startsWith('folder')).to.be.true;
        expect(responseGetToc.body.data[0].children[1].children[0].title).to.equal(testDashboardTitle);
        expect(responseGetToc.body.data[0].children[2].title.startsWith('folder')).to.be.true;
        expect(responseGetToc.body.data[0].children[2].children[0].title).to.equal(testDashboardTitle);
        return done();
      });
  });

  // eslint-disable-next-line mocha/no-identical-title
  it('Logout UIF', done => {
    shared.logout(request, done);
  });

  // eslint-disable-next-line mocha/no-identical-title
  it('Login BVD', done => {
    shared.login(requestBVD, loginURLBVD, adminLogin, adminPasswd, done);
  });

  it('Delete bvd dashboardTwo', done => {
    const dashboardTwo = apiBase + testSecondDashboardName;
    requestBVD
      .delete(dashboardTwo)
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .expect(200)
      .end(err => {
        if (err) {
          return done(err);
        }
        return done();
      });
  });

  /**
   * USE CASE 3
   */
  // eslint-disable-next-line mocha/no-identical-title
  it('Logout BVD', done => {
    shared.logout(requestBVD, done);
  });

  // eslint-disable-next-line mocha/no-identical-title
  it('Login UIF', done => {
    shared.login(request, loginURL, adminLogin, adminPasswd, done);
  });

  it('Create top level category in UIF', done => {
    request
      .post(apiCategory)
      .send(categoryTopLevel)
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .end((err, responsePostCategory) => {
        if (err) {
          return done(err);
        }
        expect(responsePostCategory.status).to.equal(200);
        expect(responsePostCategory.body.data[0].id).to.be.equal(categoryTopLevel.id);
        expect(responsePostCategory.body[0]).to.equal(undefined);

        request
          .get(`${apiCategory}${categoryTopLevel.id}`)
          .end((err, responseGetCategory) => {
            if (err) {
              return done(err);
            }
            expect(responseGetCategory.status).to.equal(200);
            expect(responseGetCategory.body.data.id).to.equal(categoryTopLevel.id);
            expect(responseGetCategory.body.id).to.equal(undefined);
            return done();
          });
      });
  });

  it('Update category', done => {
    const newCategory = category;
    newCategory.parent = categoryTopLevel.id;
    request
      .put(`${apiCategory}${category.id}`)
      .send(newCategory)
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .end((err, responsePutCategory) => {
        if (err) {
          return done(err);
        }
        expect(responsePutCategory.status).to.equal(200);
        expect(responsePutCategory.body.data.parent).to.equal(categoryTopLevel.id);
        return done();
      });
  });

  it('Validate toc with one dashboard in two folders in second level category', done => {
    request
      .get(apiToc)
      .end((err, responseGetToc) => {
        if (err) {
          return done(err);
        }
        expect(responseGetToc.status).to.equal(200);
        expect(responseGetToc.body.data[0].children.length).to.equal(1);
        expect(responseGetToc.body.data[0].children[0].title).to.equal('BVD_Dashboards');
        expect(responseGetToc.body.data[0].children[0].children[0].title.startsWith('folder')).to.be.true;
        expect(responseGetToc.body.data[0].children[0].children[0].children.length).to.equal(1);
        expect(responseGetToc.body.data[0].children[0].children[0].children[0].title).to.equal(testDashboardTitle);
        expect(responseGetToc.body.data[0].children[0].children[1].title.startsWith('folder')).to.be.true;
        expect(responseGetToc.body.data[0].children[0].children[1].children.length).to.equal(1);
        expect(responseGetToc.body.data[0].children[0].children[1].children[0].title).to.equal(testDashboardTitle);
        return done();
      });
  });

  /**
   * USE CASE 4
   */
  it('Validate Toc - In MockMenuEntry no context is defined', done => {
    request
      .get(apiToc)
      .end((err, responseGetToc) => {
        if (err) {
          return done(err);
        }
        expect(responseGetToc.status).to.equal(200);
        expect(responseGetToc.body.data[0].children.length).to.equal(1);

        expect(responseGetToc.body.data[0].children[0].children[0].children[0].title).to.equal(testDashboardTitle);
        const storeContext0NewContext = responseGetToc.body.data[0].children[0].children[0].children[0].context.items[0];
        expect(storeContext0NewContext.id).to.equal(testDashboardIdName);
        expect(storeContext0NewContext.name).to.equal(testDashboardTitle);
        expect(storeContext0NewContext.type).to.equal(contextType);

        expect(responseGetToc.body.data[0].children[0].children[1].children[0].title).to.equal(testDashboardTitle);
        const storeContext1NewContext = responseGetToc.body.data[0].children[0].children[1].children[0].context.items[0];
        expect(storeContext1NewContext.id).to.equal(testDashboardIdName);
        expect(storeContext1NewContext.name).to.equal(testDashboardTitle);
        expect(storeContext1NewContext.type).to.equal(contextType);
        return done();
      });
  });

  it('Add context to MockMenuEntry', done => {
    const newMenuEntryPlaceholder = R.clone(menuEntryPlaceholder);
    newMenuEntryPlaceholder.context = {
      items: [
        {
          type: 'host',
          id: 'loadgen.mambo.net',
          name: 'loadgen.mambo.net'
        }
      ]
    };
    request
      .put(apiMenuEntry.concat(menuEntryPlaceholder.id))
      .send(newMenuEntryPlaceholder)
      .set('X-Secure-Modify-Token', apiHelper.secureModifyToken())
      .end((err, responseUpdateMenuEntry) => {
        if (err) {
          return done(err);
        }
        expect(responseUpdateMenuEntry.status).to.equal(200);
        return done();
      });
  });

  it('Validate Toc - In MockMenuEntry context is defined', done => {
    request
      .get(apiToc)
      .end((err, responseGetToc) => {
        if (err) {
          return done(err);
        }
        expect(responseGetToc.status).to.equal(200);
        expect(responseGetToc.body.data[0].children.length).to.equal(1);

        expect(responseGetToc.body.data[0].children[0].children[0].children[0].title).to.equal(testDashboardTitle);
        const storeContext0FixedContext = responseGetToc.body.data[0].children[0].children[0].children[0].context.items[0];
        expect(storeContext0FixedContext.id).to.equal('loadgen.mambo.net');
        expect(storeContext0FixedContext.name).to.equal('loadgen.mambo.net');
        expect(storeContext0FixedContext.type).to.equal('host');

        const storeContext0NewContext = responseGetToc.body.data[0].children[0].children[0].children[0].context.items[1];
        expect(storeContext0NewContext.id).to.equal(testDashboardIdName);
        expect(storeContext0NewContext.name).to.equal(testDashboardTitle);
        expect(storeContext0NewContext.type).to.equal(contextType);

        const storeContext1FixedContext = responseGetToc.body.data[0].children[0].children[0].children[0].context.items[0];
        expect(responseGetToc.body.data[0].children[0].children[1].children[0].title).to.equal(testDashboardTitle);
        expect(storeContext1FixedContext.id).to.equal('loadgen.mambo.net');
        expect(storeContext1FixedContext.name).to.equal('loadgen.mambo.net');
        expect(storeContext1FixedContext.type).to.equal('host');

        const storeContext1NewContext = responseGetToc.body.data[0].children[0].children[0].children[0].context.items[1];
        expect(storeContext1NewContext.id).to.equal(testDashboardIdName);
        expect(storeContext1NewContext.name).to.equal(testDashboardTitle);
        expect(storeContext1NewContext.type).to.equal(contextType);
        return done();
      });
  });

  it('Add context to MockMenuEntry without items', done => {
    const newMenuEntryPlaceholder = R.clone(menuEntryPlaceholder);
    newMenuEntryPlaceholder.context = {
      start: 1619807400000,
      end: 1622485740000
    };
    request
      .put(apiMenuEntry.concat(menuEntryPlaceholder.id))
      .send(newMenuEntryPlaceholder)
      .set('X-Secure-Modify-Token', apiHelper.secureModifyToken())
      .end((err, responseUpdateMenuEntry) => {
        if (err) {
          return done(err);
        }
        expect(responseUpdateMenuEntry.status).to.equal(200);
        return done();
      });
  });

  it('Validate Toc - In MockMenuEntry context is defined without items', done => {
    request
      .get(apiToc)
      .end((err, responseGetToc) => {
        if (err) {
          return done(err);
        }
        expect(responseGetToc.status).to.equal(200);
        expect(responseGetToc.body.data[0].children.length).to.equal(1);

        expect(responseGetToc.body.data[0].children[0].children[0].children[0].title).to.equal(testDashboardTitle);

        const storeContext0NewContext = responseGetToc.body.data[0].children[0].children[0].children[0].context.items[0];
        expect(storeContext0NewContext.id).to.equal(testDashboardIdName);
        expect(storeContext0NewContext.name).to.equal(testDashboardTitle);
        expect(storeContext0NewContext.type).to.equal(contextType);

        const storeContext1NewContext = responseGetToc.body.data[0].children[0].children[0].children[0].context.items[0];
        expect(storeContext1NewContext.id).to.equal(testDashboardIdName);
        expect(storeContext1NewContext.name).to.equal(testDashboardTitle);
        expect(storeContext1NewContext.type).to.equal(contextType);
        return done();
      });
  });

  /**
   * DELETE ALL
   */

  it('Delete uif', done => {
    request
      .delete(apiMenuEntry.concat(menuEntryPlaceholder.id))
      .set('X-Secure-Modify-Token', apiHelper.secureModifyToken())
      .end((err, responseDeletedMenu) => {
        if (err) {
          return done(err);
        }
        expect(responseDeletedMenu.status).to.equal(200);
        expect(responseDeletedMenu.body.data.result).to.be.equal('Menu Entry deleted');
        request
          .delete(apiPage.concat(page.id))
          .set('X-Secure-Modify-Token', apiHelper.secureModifyToken())
          .end((err, responseDeletePage) => {
            if (err) {
              return done(err);
            }
            expect(responseDeletePage.body.result).to.equal(undefined);
            expect(responseDeletePage.body.data.result).to.be.equal('Page deleted');

            request
              .delete(apiCategory.concat(category.id))
              .set('X-Secure-Modify-Token', shared.secureModifyToken())
              .end((err, responseDeleteCategory) => {
                if (err) {
                  return done(err);
                }
                expect(responseDeleteCategory.status).to.equal(200);
                expect(responseDeleteCategory.body.data).to.be.equal('Menu item deleted successfully');
                request
                  .delete(apiCategory.concat(categoryTopLevel.id))
                  .set('X-Secure-Modify-Token', shared.secureModifyToken())
                  .end((err, responseDeleteCategoryTopLevel) => {
                    if (err) {
                      return done(err);
                    }
                    expect(responseDeleteCategoryTopLevel.status).to.equal(200);
                    expect(responseDeleteCategoryTopLevel.body.data).to.be.equal('Menu item deleted successfully');
                    deleteRole(roleId).then(() => {
                      deleteRole(roleIdBVD).then(() => {
                        deleteRole(roleIdUIF).then(() => done()).catch(done);
                      }).catch(done);
                    }).catch(done);
                  });
              });
          });
      });
  });

  // eslint-disable-next-line mocha/no-identical-title
  it('Logout UIF', done => {
    shared.logout(request, done);
  });

  // eslint-disable-next-line mocha/no-identical-title
  it('Login BVD', done => {
    shared.login(requestBVD, loginURLBVD, adminLogin, adminPasswd, done);
  });

  it('Delete bvd dashboardOne', done => {
    const dashboardOne = apiBase + testDashboardIdName;
    requestBVD
      .delete(dashboardOne)
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .expect(200)
      .end(err => {
        if (err) {
          return done(err);
        }
        return done();
      });
  });

  // eslint-disable-next-line mocha/no-identical-title
  it('Logout BVD', done => {
    shared.logout(requestBVD, done);
  });
});
