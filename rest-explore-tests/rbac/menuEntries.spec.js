const shared = require('../helpers/shared');
const supertest = require('supertest');

const request = supertest.agent(shared.exploreTestURL);
const apiRole = '/rest/v2/role/';
const loginURL = '/rest/v2/menuEntries';
const apiMenuEntry = '/rest/v2/menuEntries/';
const apiPage = '/rest/v2/pages/';
const apiToc = '/rest/v2/pages/toc';
const apiCategory = '/rest/v2/categories/';
const apiSession = '/rest/v2/session/user';
const testerUser = 'tester';
const adminUser = shared.tenant.email;
const adminPasswd = shared.tenant.password;
let roleId;
const menus = [];
let role = {
  name: 'bvd_tester',
  description: 'Test role for foundation',
  permission: [{
    // eslint-disable-next-line camelcase
    operation_key: 'View',
    // eslint-disable-next-line camelcase
    resource_key: 'menu<>All'
  }]
};

const pages = [{
  id: 'testPage',
  title: 'testPage',
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
},
{
  id: 'operation',
  title: 'operation',
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
}];

const menuEntries = [
  {
    title: 'menuEntry_test_one',
    pageId: 'operation',
    context: {
      items: [
        {
          id: '1',
          type: 'host',
          name: 'loadgen.mambo.net',
          extra: {}
        }
      ],
      start: '2020-06-05 17:20:43.18+05:30',
      end: '2020-06-05 17:20:43.18+05:30'
    },
    categoryId: 'Operations'
  },
  {
    title: 'menuEntry_test_two',
    pageId: 'testPage',
    context: {
      items: [
        {
          id: '2',
          type: 'host',
          name: 'omidock.mambo.net',
          extra: {}
        }
      ],
      start: '2020-06-05 17:20:43.18+05:30',
      end: '2020-06-05 17:20:43.18+05:30'
    },
    categoryId: 'Network'
  }
];

const categories = [
  {
    id: 'Operations',
    icon: 'hpe-globe',
    abbreviation: 'O',
    title: 'Operations',
    parent: 'Network'
  },
  {
    id: 'Administration',
    icon: 'hpe-admin',
    abbreviation: 'A',
    title: 'Administration',
    parent: 'Network'
  },
  {
    id: 'Network',
    abbreviation: '',
    title: 'Network'
  }
];

const createRole = roles => new Promise((resolve, reject) =>
  request.post(apiRole)
    .send(roles)
    .set('X-Secure-Modify-Token', shared.secureModifyToken())
    .end((err, res) => {
      if (err) {
        return reject(err);
      }
      return resolve(res);
    })
);

const createCategories = category => new Promise((resolve, reject) => {
  request
    .post(apiCategory)
    .send(category)
    .set('X-Secure-Modify-Token', shared.secureModifyToken())
    .end((err, res) => {
      if (err) {
        return reject(err);
      }
      return resolve(res);
    });
});

const getCategories = () => new Promise((resolve, reject) => {
  request
    .get(apiCategory)
    .end((err, res) => {
      if (err) {
        return reject(err);
      }
      return resolve(res);
    });
});

const getToc = () => new Promise((resolve, reject) => {
  request
    .get(apiToc)
    .end((err, res) => {
      if (err) {
        return reject(err);
      }
      return resolve(res);
    });
});

const createPage = page => new Promise((resolve, reject) => {
  request
    .post(apiPage)
    .send(page)
    .set('X-Secure-Modify-Token', shared.secureModifyToken())
    .end((err, res) => {
      if (err) {
        return reject(err);
      }
      resolve(res);
    });
});

const createMenuEntry = menuEntry => new Promise((resolve, reject) => {
  request
    .post(apiMenuEntry)
    .send(menuEntry)
    .set('X-Secure-Modify-Token', shared.secureModifyToken())
    .end((err, res) => {
      if (err) {
        return reject(err);
      }
      resolve(res);
    });
});

const deleteRole = roleid => new Promise((resolve, reject) => {
  request.delete(apiRole.concat(roleid))
    .set('X-Secure-Modify-Token', shared.secureModifyToken())
    .end((err, response) => {
      if (err) {
        return reject(err);
      }
      resolve(response);
    });
});

const deletePage = mockpage => new Promise((resolve, reject) => {
  request
    .delete(apiPage.concat(mockpage.id))
    .set('X-Secure-Modify-Token', shared.secureModifyToken())
    .end((err, res) => {
      if (err) {
        return reject(err);
      }
      resolve(res);
    });
});
const deleteCategory = category => new Promise((resolve, reject) => {
  request
    .delete(apiCategory.concat(category.id))
    .set('X-Secure-Modify-Token', shared.secureModifyToken())
    .end((err, res) => {
      if (err) {
        return reject(err);
      }
      return resolve(res);
    });
});
const deleteMenuEntry = menuEntry => new Promise((resolve, reject) => {
  request
    .delete(apiMenuEntry.concat(menuEntry))
    .set('X-Secure-Modify-Token', shared.secureModifyToken())
    .end((err, res) => {
      if (err) {
        return reject(err);
      }
      resolve(res);
    });
});

const updateRole = (roleid, data) => new Promise((resolve, reject) => {
  request
    .put(apiRole.concat(roleid))
    .send(data)
    .set('X-Secure-Modify-Token', shared.secureModifyToken())
    .end((err, res) => {
      if (err) {
        return reject(err);
      }
      resolve(res);
    });
});

const getUserSession = () => new Promise((resolve, reject) => {
  request.get(apiSession)
    .end((err, res) => {
      if (err) {
        return reject(err);
      }
      resolve(res);
    });
});

const updateMenuEntry = (id, menuEntry) => new Promise((resolve, reject) => {
  request
    .put(apiMenuEntry.concat(id))
    .send(menuEntry)
    .set('X-Secure-Modify-Token', shared.secureModifyToken())
    .end((err, res) => {
      if (err) {
        return reject(err);
      }
      resolve(res);
    });
});

const getMenuEntry = menuEntry => new Promise((resolve, reject) => {
  request
    .get(menuEntry)
    .end((err, res) => {
      if (err) {
        return reject(err);
      }
      resolve(res);
    });
});

describe('RBAC using MenuEntry permissions', () => {
  it('Setup', done => {
    shared.logout(request, () => {
      shared.login(request, loginURL, adminUser, adminPasswd, () => {
        createRole(role).then(res => {
          expect(res.status).to.equal(200);
          expect(res.body.role).to.not.equal(null);
          expect(res.body.role.name).to.equal('bvd_tester');
          roleId = res.body.role.id;
          createCategories(categories).then(resultCategories => {
            expect(resultCategories.status).to.equal(200);
            expect(resultCategories.body.data.length).to.be.equal(3);
            createPage(pages).then(resultPage => {
              expect(resultPage.status).to.equal(200);
              createMenuEntry(menuEntries).then(resultMenuEntry => {
                expect(resultMenuEntry.status).to.equal(200);
                expect(resultMenuEntry.body.error).to.equal(false);
                resultMenuEntry.body.data.forEach(menu => {
                  menus[menu.title] = menu.id;
                });
                done();
              }).catch(done);
            }).catch(done);
          }).catch(done);
        }).catch(done);
      });
    });
  });

  it('View all menu', done => {
    shared.logout(request, () => {
      shared.login(request, loginURL, testerUser, adminPasswd, () => {
        getMenuEntry(apiMenuEntry).then(res => {
          expect(res.status).to.equal(200);
          expect(res.body.error).to.equal(false);
          expect(res.body.data.length).to.be.equal(2);
          const entries = res.body.data;
          let found = entries.find(entry => entry.id === menus.menuEntry_test_one);
          expect(found).to.not.equal(null);
          found = entries.find(entry => entry.id === menus.menuEntry_test_two);
          expect(found).to.not.equal(null);
          done();
        }).catch(done);
      });
    });
  });

  it('Cannot view any menu', done => {
    shared.logout(request, () => {
      shared.login(request, loginURL, adminUser, adminPasswd, () => {
        role = {
          name: 'bvd_tester',
          description: 'Test role for foundation',
          permission: [{
            // eslint-disable-next-line camelcase
            operation_key: 'View',
            // eslint-disable-next-line camelcase
            resource_key: 'menu<>Item-DoesntExist'
          }]
        };
        updateRole(roleId, role).then(res => {
          expect(res.status).to.equal(200);
          shared.logout(request, () => {
            shared.login(request, loginURL, testerUser, adminPasswd, () => {
              getMenuEntry(apiMenuEntry).then(resultMenuEntries => {
                expect(resultMenuEntries.status).to.equal(200);
                expect(resultMenuEntries.body.data.length).to.be.equal(0);
                done();
              }).catch(done);
            });
          });
        }).catch(done);
      });
    });
  });

  it('View specific menu entry', done => {
    shared.logout(request, () => {
      shared.login(request, loginURL, adminUser, adminPasswd, () => {
        role = {
          name: 'bvd_tester',
          description: 'Test role for foundation',
          permission: [{
            // eslint-disable-next-line camelcase
            operation_key: 'View',
            // eslint-disable-next-line camelcase
            resource_key: `menu<>Item-${menus.menuEntry_test_one}`
          }]
        };
        updateRole(roleId, role).then(res => {
          expect(res.status).to.equal(200);
          shared.logout(request, () => {
            shared.login(request, loginURL, testerUser, adminPasswd, () => {
              getMenuEntry(apiMenuEntry.concat(menus.menuEntry_test_one)).then(resultMenuEntry => {
                expect(resultMenuEntry.status).to.equal(200);
                expect(resultMenuEntry.body.data.title).to.be.equal('menuEntry_test_one');
                done();
              }).catch(done);
            });
          });
        }).catch(done);
      });
    });
  });

  it('No permission for menu entry view', done => {
    shared.logout(request, () => {
      shared.login(request, loginURL, adminUser, adminPasswd, () => {
        role = {
          name: 'bvd_tester',
          description: 'Test role for foundation',
          permission: [{
            // eslint-disable-next-line camelcase
            operation_key: 'View',
            // eslint-disable-next-line camelcase
            resource_key: 'default_action<>All'
          }]
        };
        updateRole(roleId, role).then(res => {
          expect(res.status).to.equal(200);
          shared.logout(request, () => {
            shared.login(request, loginURL, testerUser, adminPasswd, () => {
              getMenuEntry(apiMenuEntry.concat(menus.menuEntry_test_one)).then(resultMenuEntry => {
                expect(resultMenuEntry.status).to.equal(401);
                expect(resultMenuEntry.body.error).to.equal(true);
                done();
              }).catch(done);
            });
          });
        }).catch(done);
      });
    });
  });

  it('View specific Category', done => {
    shared.logout(request, () => {
      shared.login(request, loginURL, adminUser, adminPasswd, () => {
        role = {
          name: 'bvd_tester',
          description: 'Test role for foundation',
          permission: [{
            // eslint-disable-next-line camelcase
            operation_key: 'View',
            // eslint-disable-next-line camelcase
            resource_key: `menu<>Category-Operations`
          }]
        };
        updateRole(roleId, role).then(res => {
          expect(res.status).to.equal(200);
          shared.logout(request, () => {
            shared.login(request, loginURL, testerUser, adminPasswd, () => {
              getMenuEntry(apiMenuEntry.concat(menus.menuEntry_test_one)).then(resultMenuEntry => {
                expect(resultMenuEntry.status).to.equal(200);
                expect(resultMenuEntry.body.data.title).to.be.equal('menuEntry_test_one');
                done();
              }).catch(done);
            });
          });
        }).catch(done);
      });
    });
  });

  it('FullControl specific Category', done => {
    shared.logout(request, () => {
      shared.login(request, loginURL, adminUser, adminPasswd, () => {
        role = {
          name: 'bvd_tester',
          description: 'Test role for foundation',
          permission: [{
            // eslint-disable-next-line camelcase
            operation_key: 'FullControl',
            // eslint-disable-next-line camelcase
            resource_key: `menu<>Category-Operations`
          }]
        };
        updateRole(roleId, role).then(res => {
          expect(res.status).to.equal(200);
          shared.logout(request, () => {
            shared.login(request, loginURL, testerUser, adminPasswd, () => {
              getMenuEntry(apiMenuEntry.concat(menus.menuEntry_test_one)).then(resultMenuEntry => {
                expect(resultMenuEntry.status).to.equal(200);
                expect(resultMenuEntry.body.data.title).to.be.equal('menuEntry_test_one');
                const myMenu = {
                  ...menuEntries[0],
                  title: 'modified'
                };
                updateMenuEntry(menus.menuEntry_test_one, myMenu).then(updatedMenuEntry => {
                  expect(updatedMenuEntry.status).to.equal(200);
                  expect(updatedMenuEntry.body.data.title).to.be.equal('modified');
                  deleteMenuEntry(menus.menuEntry_test_one).then(deletedMenuEntry => {
                    expect(deletedMenuEntry.status).to.equal(200);
                    expect(deletedMenuEntry.body.error).to.equal(false);
                    createMenuEntry(menuEntries[0]).then(createdMenuEntry => {
                      expect(createdMenuEntry.status).to.equal(200);
                      createdMenuEntry.body.data.forEach(menu => {
                        menus[menu.title] = menu.id;
                      });
                      done();
                    }).catch(done);
                  }).catch(done);
                }).catch(done);
              }).catch(done);
            });
          });
        }).catch(done);
      });
    });
  });

  it('FullControl parent Category', done => {
    shared.logout(request, () => {
      shared.login(request, loginURL, adminUser, adminPasswd, () => {
        role = {
          name: 'bvd_tester',
          description: 'Test role for foundation',
          permission: [{
            // eslint-disable-next-line camelcase
            operation_key: 'FullControl',
            // eslint-disable-next-line camelcase
            resource_key: `menu<>Category-Network`
          }]
        };
        updateRole(roleId, role).then(res => {
          expect(res.status).to.equal(200);
          shared.logout(request, () => {
            shared.login(request, loginURL, testerUser, adminPasswd, () => {
              getMenuEntry(apiMenuEntry).then(resultMenuEntry => {
                expect(resultMenuEntry.status).to.equal(200);
                expect(resultMenuEntry.body.data.length).to.be.equal(2);
                const titles = resultMenuEntry.body.data.map(item => item.title);
                expect(titles.includes('menuEntry_test_two')).to.be.equal(true);
                expect(titles.includes('menuEntry_test_one')).to.be.equal(true);
                const myMenu = {
                  ...menuEntries[0],
                  title: 'modified'
                };
                updateMenuEntry(menus.menuEntry_test_one, myMenu).then(updatedMenuEntry => {
                  expect(updatedMenuEntry.status).to.equal(200);
                  expect(updatedMenuEntry.body.data.title).to.be.equal('modified');
                  deleteMenuEntry(menus.menuEntry_test_one).then(deletedMenuEntry => {
                    expect(deletedMenuEntry.status).to.equal(200);
                    createMenuEntry(menuEntries[0]).then(createdMenuEntry => {
                      expect(createdMenuEntry.status).to.equal(200);
                      createdMenuEntry.body.data.forEach(menu => {
                        menus[menu.title] = menu.id;
                      });
                      done();
                    }).catch(done);
                  }).catch(done);
                }).catch(done);
              }).catch(done);
            });
          });
        }).catch(done);
      });
    });
  });

  it('Landing page', done => {
    shared.logout(request, () => {
      shared.login(request, loginURL, adminUser, adminPasswd, () => {
        role = {
          name: 'bvd_tester',
          description: 'Test role for foundation',
          permission: [{
            // eslint-disable-next-line camelcase
            operation_key: 'LandingPage',
            // eslint-disable-next-line camelcase
            resource_key: `menu<>Item-${menus.menuEntry_test_one}`
          }]
        };
        updateRole(roleId, role).then(res => {
          expect(res.status).to.equal(200);
          shared.logout(request, () => {
            shared.login(request, loginURL, testerUser, adminPasswd, () => {
              getMenuEntry(apiMenuEntry.concat(menus.menuEntry_test_one)).then(resultMenuEntry => {
                expect(resultMenuEntry.status).to.equal(200);
                expect(resultMenuEntry.body.data.title).to.be.equal('menuEntry_test_one');
                getUserSession().then(resultUserSession => {
                  expect(resultUserSession.status).to.equal(200);
                  expect(resultUserSession.body).to.not.equal(null);
                  expect(resultUserSession.body.user.landingPage).to.be.equal(menus.menuEntry_test_one);
                  done();
                }).catch(done);
              }).catch(done);
            });
          });
        }).catch(done);
      });
    });
  });

  it('Get All Categories using view', done => {
    shared.logout(request, () => {
      shared.login(request, loginURL, adminUser, adminPasswd, () => {
        role = {
          name: 'bvd_tester',
          description: 'Test role for foundation',
          permission: [{
            // eslint-disable-next-line camelcase
            operation_key: 'View',
            // eslint-disable-next-line camelcase
            resource_key: 'menu<>All'
          }]
        };
        updateRole(roleId, role).then(res => {
          expect(res.status).to.equal(200);
          shared.logout(request, () => {
            shared.login(request, loginURL, testerUser, adminPasswd, () => {
              getCategories().then(resultCategories => {
                expect(resultCategories.status).to.equal(200);
                expect(resultCategories.body.items).to.equal(undefined);
                expect(resultCategories.body.data.length).to.be.equal(3);
                done();
              }).catch(done);
            });
          });
        }).catch(done);
      });
    });
  });

  it('Get All Categories using FullControl', done => {
    shared.logout(request, () => {
      shared.login(request, loginURL, adminUser, adminPasswd, () => {
        role = {
          name: 'bvd_tester',
          description: 'Test role for foundation',
          permission: [{
            // eslint-disable-next-line camelcase
            operation_key: 'FullControl',
            // eslint-disable-next-line camelcase
            resource_key: 'menu<>All'
          }]
        };
        updateRole(roleId, role).then(res => {
          expect(res.status).to.equal(200);
          shared.logout(request, () => {
            shared.login(request, loginURL, testerUser, adminPasswd, () => {
              getCategories().then(resultCategories => {
                expect(resultCategories.status).to.equal(200);
                expect(resultCategories.body.items).to.equal(undefined);
                expect(resultCategories.body.data.length).to.be.equal(3);
                done();
              }).catch(done);
            });
          });
        }).catch(done);
      });
    });
  });

  it('Get allowed Categories using View', done => {
    shared.logout(request, () => {
      shared.login(request, loginURL, adminUser, adminPasswd, () => {
        role = {
          name: 'bvd_tester',
          description: 'Test role for foundation',
          permission: [{
            // eslint-disable-next-line camelcase
            operation_key: 'View',
            // eslint-disable-next-line camelcase
            resource_key: 'menu<>Category-Operations'
          }]
        };
        updateRole(roleId, role).then(res => {
          expect(res.status).to.equal(200);
          shared.logout(request, () => {
            shared.login(request, loginURL, testerUser, adminPasswd, () => {
              getCategories().then(resultCategories => {
                expect(resultCategories.status).to.equal(200);
                expect(resultCategories.body.items).to.equal(undefined);
                expect(resultCategories.body.data.length).to.be.equal(2);
                const items = resultCategories.body.data;
                let result = items.find(item => item.id === 'Operations');
                expect(result.id).to.be.equal('Operations');
                result = items.find(item => item.id === 'Network');
                expect(result.id).to.be.equal('Network');
                done();
              }).catch(done);
            });
          });
        }).catch(done);
      });
    });
  });

  it('Get allowed Categories using FullControl', done => {
    shared.logout(request, () => {
      shared.login(request, loginURL, adminUser, adminPasswd, () => {
        role = {
          name: 'bvd_tester',
          description: 'Test role for foundation',
          permission: [{
            // eslint-disable-next-line camelcase
            operation_key: 'FullControl',
            // eslint-disable-next-line camelcase
            resource_key: 'menu<>Category-Operations'
          },
          {
            // eslint-disable-next-line camelcase
            operation_key: 'View',
            // eslint-disable-next-line camelcase
            resource_key: 'default_action<>All'
          }]
        };
        updateRole(roleId, role).then(res => {
          expect(res.status).to.equal(200);
          shared.logout(request, () => {
            shared.login(request, loginURL, testerUser, adminPasswd, () => {
              getCategories().then(resultCategories => {
                expect(resultCategories.status).to.equal(200);
                expect(resultCategories.body.items).to.equal(undefined);
                expect(resultCategories.body.data.length).to.be.equal(2);
                const items = resultCategories.body.data;
                let result = items.find(item => item.id === 'Operations');
                expect(result.id).to.be.equal('Operations');
                result = items.find(item => item.id === 'Network');
                expect(result.id).to.be.equal('Network');
                getToc().then(resultToc => {
                  expect(resultToc.status).to.equal(200);
                  expect(resultToc.body.items).to.equal(undefined);
                  expect(resultToc.body.data[0].children).not.to.equal(undefined);
                  expect(resultToc.body.data[0].children.length).to.be.equal(1);
                  expect(resultToc.body.data[0].children[0].children[0].title).to.be.equal('menuEntry_test_one');
                  expect(resultToc.body.data[0].children[0].children[0].fullControl).to.be.equal(true);
                  done();
                }).catch(done);
              }).catch(done);
            });
          });
        }).catch(done);
      });
    });
  });

  it('Get allowed Categories using View item', done => {
    shared.logout(request, () => {
      shared.login(request, loginURL, adminUser, adminPasswd, () => {
        role = {
          name: 'bvd_tester',
          description: 'Test role for foundation',
          permission: [{
            // eslint-disable-next-line camelcase
            operation_key: 'View',
            // eslint-disable-next-line camelcase
            resource_key: `menu<>Item-${menus.menuEntry_test_one}`
          }]
        };
        updateRole(roleId, role).then(res => {
          expect(res.status).to.equal(200);
          shared.logout(request, () => {
            shared.login(request, loginURL, testerUser, adminPasswd, () => {
              getCategories().then(resultCategories => {
                expect(resultCategories.status).to.equal(200);
                expect(resultCategories.body.items).to.equal(undefined);
                expect(resultCategories.body.data.length).to.be.equal(2);
                const items = resultCategories.body.data;
                let result = items.find(item => item.id === 'Operations');
                expect(result.id).to.be.equal('Operations');
                result = items.find(item => item.id === 'Network');
                expect(result.id).to.be.equal('Network');
                done();
              }).catch(done);
            });
          });
        }).catch(done);
      });
    });
  });

  it('Get less Categories using View item', done => {
    shared.logout(request, () => {
      shared.login(request, loginURL, adminUser, adminPasswd, () => {
        role = {
          name: 'bvd_tester',
          description: 'Test role for foundation',
          permission: [{
            // eslint-disable-next-line camelcase
            operation_key: 'View',
            // eslint-disable-next-line camelcase
            resource_key: `menu<>Item-${menus.menuEntry_test_two}`
          }]
        };
        updateRole(roleId, role).then(res => {
          expect(res.status).to.equal(200);
          shared.logout(request, () => {
            shared.login(request, loginURL, testerUser, adminPasswd, () => {
              getCategories().then(resultCategories => {
                expect(resultCategories.status).to.equal(200);
                expect(resultCategories.body.items).to.equal(undefined);
                expect(resultCategories.body.data.length).to.be.equal(1);
                const items = resultCategories.body.data;
                let result = items.find(item => item.id === 'Operations');
                expect(result).to.equal(undefined);
                result = items.find(item => item.id === 'Network');
                expect(result.id).to.be.equal('Network');
                done();
              }).catch(done);
            });
          });
        }).catch(done);
      });
    });
  });

  it('No duplicate Categories using View item', done => {
    shared.logout(request, () => {
      shared.login(request, loginURL, adminUser, adminPasswd, () => {
        role = {
          name: 'bvd_tester',
          description: 'Test role for foundation',
          permission: [
            {
              // eslint-disable-next-line camelcase
              operation_key: 'View',
              // eslint-disable-next-line camelcase
              resource_key: `menu<>Item-${menus.menuEntry_test_two}`
            },
            {
              // eslint-disable-next-line camelcase
              operation_key: 'View',
              // eslint-disable-next-line camelcase
              resource_key: `menu<>Item-${menus.menuEntry_test_one}`
            },
            {
              // eslint-disable-next-line camelcase
              operation_key: 'LandingPage',
              // eslint-disable-next-line camelcase
              resource_key: `menu<>Item-${menus.menuEntry_test_one}`
            }
          ]
        };
        updateRole(roleId, role).then(res => {
          expect(res.status).to.equal(200);
          shared.logout(request, () => {
            shared.login(request, loginURL, testerUser, adminPasswd, () => {
              getCategories().then(resultCategories => {
                expect(resultCategories.status).to.equal(200);
                expect(resultCategories.body.items).to.equal(undefined);
                expect(resultCategories.body.data.length).to.be.equal(2);
                const items = resultCategories.body.data;
                let result = items.find(item => item.id === 'Operations');
                expect(result.id).to.be.equal('Operations');
                result = items.find(item => item.id === 'Network');
                expect(result.id).to.be.equal('Network');
                done();
              }).catch(done);
            });
          });
        }).catch(done);
      });
    });
  });

  it('No duplicate Categories and toc with many permissions', done => {
    shared.logout(request, () => {
      shared.login(request, loginURL, adminUser, adminPasswd, () => {
        role = {
          name: 'bvd_tester',
          description: 'Test role for foundation',
          permission: [
            {
              // eslint-disable-next-line camelcase
              operation_key: 'View',
              // eslint-disable-next-line camelcase
              resource_key: 'default_action<>All'
            },
            {
              // eslint-disable-next-line camelcase
              operation_key: 'View',
              // eslint-disable-next-line camelcase
              resource_key: `menu<>Category-Administration`
            },
            {
              // eslint-disable-next-line camelcase
              operation_key: 'View',
              // eslint-disable-next-line camelcase
              resource_key: `menu<>Item-${menus.menuEntry_test_two}`
            },
            {
              // eslint-disable-next-line camelcase
              operation_key: 'LandingPage',
              // eslint-disable-next-line camelcase
              resource_key: `menu<>Item-${menus.menuEntry_test_one}`
            }
          ]
        };
        updateRole(roleId, role).then(res => {
          expect(res.status).to.equal(200);
          shared.logout(request, () => {
            shared.login(request, loginURL, testerUser, adminPasswd, () => {
              getCategories().then(resultCategories => {
                expect(resultCategories.status).to.equal(200);
                expect(resultCategories.body.items).to.equal(undefined);
                expect(resultCategories.body.data.length).to.be.equal(3);
                const items = resultCategories.body.data;
                let result = items.find(item => item.id === 'Operations');
                expect(result.id).to.be.equal('Operations');
                result = items.find(item => item.id === 'Network');
                expect(result.id).to.be.equal('Network');
                result = items.find(item => item.id === 'Administration');
                expect(result.id).to.be.equal('Administration');
                getToc().then(resultToc => {
                  expect(resultToc.status).to.equal(200);
                  expect(resultToc.body.data[0].children).not.to.equal(undefined);
                  expect(resultToc.body.data[0].children.length).to.be.equal(2);
                  const menuItems = resultToc.body.data[0].children;
                  let resultMenuEntry = menuItems.find(menu => menu.title === 'menuEntry_test_two');
                  expect(resultMenuEntry).not.to.equal(undefined);
                  const menuChildren = menuItems.find(menu => menu.children !== undefined);
                  expect(menuChildren.children).not.to.equal(undefined);
                  resultMenuEntry = menuChildren.children.find(menu => menu.title === 'menuEntry_test_one');
                  expect(resultMenuEntry).not.to.equal(undefined);
                  done();
                }).catch(done);
              }).catch(done);
            });
          });
        }).catch(done);
      });
    });
  });

  it('Failed to get allowed Categories using FullControl item', done => {
    shared.logout(request, () => {
      shared.login(request, loginURL, adminUser, adminPasswd, () => {
        role = {
          name: 'bvd_tester',
          description: 'Test role for foundation',
          permission: [{
            // eslint-disable-next-line camelcase
            operation_key: 'FullControl',
            // eslint-disable-next-line camelcase
            resource_key: `menu<>Item-${menus.menuEntry_test_two}`
          }]
        };
        updateRole(roleId, role).then(res => {
          expect(res.status).to.equal(400);
          expect(res.body.error.message).to.be.equal('Permission must be of type menuEntryRBACFormat');
          done();
        }).catch(400);
      });
    });
  });

  it('Un-Authorized test', done => {
    shared.logout(request, () => {
      shared.login(request, loginURL, adminUser, adminPasswd, () => {
        role = {
          name: 'bvd_tester',
          description: 'Test role for foundation',
          permission: [
            {
              // eslint-disable-next-line camelcase
              operation_key: 'View',
              // eslint-disable-next-line camelcase
              resource_key: `menu<>Category-A2`
            }
          ]
        };
        updateRole(roleId, role).then(res => {
          expect(res.status).to.equal(200);
          shared.logout(request, () => {
            shared.login(request, loginURL, testerUser, adminPasswd, () => {
              getMenuEntry(apiMenuEntry.concat(menus.menuEntry_test_one)).then(resultMenuEntry => {
                expect(resultMenuEntry.status).to.equal(401);
                expect(resultMenuEntry.body.additionalInfo[0]).contains('The user \'tester\' is not authorized to access menu entry');
                deleteMenuEntry(menus.menuEntry_test_one).then(deletedMenuEntry => {
                  expect(deletedMenuEntry.status).to.equal(401);
                  expect(deletedMenuEntry.body.additionalInfo[0]).contains('The user \'tester\' is not authorized to delete menu entry');
                  const myMenu = {
                    ...menuEntries[0],
                    title: 'modified'
                  };
                  updateMenuEntry(menus.menuEntry_test_one, myMenu).then(updatedMenuEntry => {
                    expect(updatedMenuEntry.status).to.equal(401);
                    expect(updatedMenuEntry.body.additionalInfo[0]).contains('The user \'tester\' is not authorized to update menu entry');
                    const newMenus = [
                      myMenu
                    ];
                    createMenuEntry(newMenus).then(createdMenu => {
                      expect(createdMenu.status).to.equal(401);
                      expect(createdMenu.body.additionalInfo[0]).contains('The user \'tester\' is not authorized to create menu entries');
                      done();
                    }).catch(done);
                  }).catch(done);
                }).catch(done);
              }).catch(done);
            });
          });
        }).catch(done);
      });
    });
  });

  it('Filter categories Admin', done => {
    shared.logout(request, () => {
      shared.login(request, loginURL, adminUser, adminPasswd, () => {
        getCategories().then(res => {
          expect(res.status).to.equal(200);
          expect(res.body.items).to.equal(undefined);
          expect(res.body.data.length).to.be.equal(3);
          const items = res.body.data;
          let result = items.find(item => item.id === 'Operations');
          expect(result.id).to.be.equal('Operations');
          result = items.find(item => item.id === 'Network');
          expect(result.id).to.be.equal('Network');
          result = items.find(item => item.id === 'Administration');
          expect(result.id).to.be.equal('Administration');
          done();
        }).catch(done);
      });
    });
  });

  it('Filter categories view all', done => {
    shared.logout(request, () => {
      shared.login(request, loginURL, adminUser, adminPasswd, () => {
        role = {
          name: 'bvd_tester',
          description: 'Test role for foundation',
          permission: [
            {
              // eslint-disable-next-line camelcase
              operation_key: 'View',
              // eslint-disable-next-line camelcase
              resource_key: `menu<>All`
            }
          ]
        };
        updateRole(roleId, role).then(res => {
          expect(res.status).to.equal(200);
          shared.logout(request, () => {
            shared.login(request, loginURL, testerUser, adminPasswd, () => {
              getCategories().then(resultCategories => {
                expect(resultCategories.status).to.equal(200);
                expect(resultCategories.body.items).to.equal(undefined);
                expect(resultCategories.body.data.length).to.be.equal(3);
                const items = resultCategories.body.data;
                let result = items.find(item => item.id === 'Operations');
                expect(result.id).to.be.equal('Operations');
                result = items.find(item => item.id === 'Network');
                expect(result.id).to.be.equal('Network');
                result = items.find(item => item.id === 'Administration');
                expect(result.id).to.be.equal('Administration');
                items.forEach(item => {
                  expect(item.fullControl).to.be.equal(false);
                });
                done();
              }).catch(done);
            });
          });
        }).catch(done);
      });
    });
  });

  it('Filter categories full control all', done => {
    shared.logout(request, () => {
      shared.login(request, loginURL, adminUser, adminPasswd, () => {
        role = {
          name: 'bvd_tester',
          description: 'Test role for foundation',
          permission: [
            {
              // eslint-disable-next-line camelcase
              operation_key: 'FullControl',
              // eslint-disable-next-line camelcase
              resource_key: `menu<>All`
            }
          ]
        };
        updateRole(roleId, role).then(res => {
          expect(res.status).to.equal(200);
          shared.logout(request, () => {
            shared.login(request, loginURL, testerUser, adminPasswd, () => {
              getCategories().then(resultCategories => {
                expect(resultCategories.status).to.equal(200);
                expect(resultCategories.body.items).to.equal(undefined);
                expect(resultCategories.body.data.length).to.be.equal(3);
                const items = resultCategories.body.data;
                let result = items.find(item => item.id === 'Operations');
                expect(result.id).to.be.equal('Operations');
                result = items.find(item => item.id === 'Network');
                expect(result.id).to.be.equal('Network');
                result = items.find(item => item.id === 'Administration');
                expect(result.id).to.be.equal('Administration');
                items.forEach(item => {
                  expect(item.fullControl).to.be.equal(true);
                });
                done();
              }).catch(done);
            });
          });
        }).catch(done);
      });
    });
  });

  it('Filter categories item only', done => {
    shared.logout(request, () => {
      shared.login(request, loginURL, adminUser, adminPasswd, () => {
        role = {
          name: 'bvd_tester',
          description: 'Test role for foundation',
          permission: [
            {
              // eslint-disable-next-line camelcase
              operation_key: 'View',
              // eslint-disable-next-line camelcase
              resource_key: `menu<>Item-${menus.menuEntry_test_two}`
            }
          ]
        };
        updateRole(roleId, role).then(res => {
          expect(res.status).to.equal(200);
          shared.logout(request, () => {
            shared.login(request, loginURL, testerUser, adminPasswd, () => {
              getCategories().then(resultCategories => {
                expect(resultCategories.status).to.equal(200);
                expect(resultCategories.body.items).to.equal(undefined);
                expect(resultCategories.body.data.length).to.be.equal(1);
                const items = resultCategories.body.data;
                const result = items.find(item => item.id === 'Network');
                expect(result.id).to.be.equal('Network');
                expect(result.fullControl).to.be.equal(false);
                done();
              }).catch(done);
            });
          });
        }).catch(done);
      });
    });
  });

  it('Filter categories view specific', done => {
    shared.logout(request, () => {
      shared.login(request, loginURL, adminUser, adminPasswd, () => {
        role = {
          name: 'bvd_tester',
          description: 'Test role for foundation',
          permission: [
            {
              // eslint-disable-next-line camelcase
              operation_key: 'View',
              // eslint-disable-next-line camelcase
              resource_key: `menu<>Category-Operations`
            }
          ]
        };
        updateRole(roleId, role).then(res => {
          expect(res.status).to.equal(200);
          shared.logout(request, () => {
            shared.login(request, loginURL, testerUser, adminPasswd, () => {
              getCategories().then(resultCategories => {
                expect(resultCategories.status).to.equal(200);
                expect(resultCategories.body.items).to.equal(undefined);
                expect(resultCategories.body.data.length).to.be.equal(2);
                const items = resultCategories.body.data;
                let result = items.find(item => item.id === 'Operations');
                expect(result.id).to.be.equal('Operations');
                expect(result.fullControl).to.be.equal(false);
                result = items.find(item => item.id === 'Network');
                expect(result.id).to.be.equal('Network');
                expect(result.fullControl).to.be.equal(false);
                done();
              }).catch(done);
            });
          });
        }).catch(done);
      });
    });
  });

  it('Filter categories Full control specific', done => {
    shared.logout(request, () => {
      shared.login(request, loginURL, adminUser, adminPasswd, () => {
        role = {
          name: 'bvd_tester',
          description: 'Test role for foundation',
          permission: [
            {
              // eslint-disable-next-line camelcase
              operation_key: 'FullControl',
              // eslint-disable-next-line camelcase
              resource_key: `menu<>Category-Operations`
            }
          ]
        };
        updateRole(roleId, role).then(res => {
          expect(res.status).to.equal(200);
          shared.logout(request, () => {
            shared.login(request, loginURL, testerUser, adminPasswd, () => {
              getCategories().then(resultCategories => {
                expect(resultCategories.status).to.equal(200);
                expect(resultCategories.body.items).to.equal(undefined);
                expect(resultCategories.body.data.length).to.be.equal(2);
                const items = resultCategories.body.data;
                let result = items.find(item => item.id === 'Operations');
                expect(result.id).to.be.equal('Operations');
                expect(result.fullControl).to.be.equal(true);
                result = items.find(item => item.id === 'Network');
                expect(result.id).to.be.equal('Network');
                expect(result.fullControl).to.be.equal(false);
                done();
              }).catch(done);
            });
          });
        }).catch(done);
      });
    });
  });

  it('Filter categories view all and fullcontrol specific', done => {
    shared.logout(request, () => {
      shared.login(request, loginURL, adminUser, adminPasswd, () => {
        role = {
          name: 'bvd_tester',
          description: 'Test role for foundation',
          permission: [
            {
              // eslint-disable-next-line camelcase
              operation_key: 'View',
              // eslint-disable-next-line camelcase
              resource_key: `menu<>All`
            },
            {
              // eslint-disable-next-line camelcase
              operation_key: 'FullControl',
              // eslint-disable-next-line camelcase
              resource_key: `menu<>Category-Operations`
            }
          ]
        };
        updateRole(roleId, role).then(res => {
          expect(res.status).to.equal(200);
          shared.logout(request, () => {
            shared.login(request, loginURL, testerUser, adminPasswd, () => {
              getCategories().then(resultCategories => {
                expect(resultCategories.status).to.equal(200);
                expect(resultCategories.body.items).to.equal(undefined);
                expect(resultCategories.body.data.length).to.be.equal(3);
                const items = resultCategories.body.data;
                let result = items.find(item => item.id === 'Operations');
                expect(result.id).to.be.equal('Operations');
                expect(result.fullControl).to.be.equal(true);
                result = items.find(item => item.id === 'Network');
                expect(result.id).to.be.equal('Network');
                expect(result.fullControl).to.be.equal(false);
                result = items.find(item => item.id === 'Administration');
                expect(result.id).to.be.equal('Administration');
                expect(result.fullControl).to.be.equal(false);
                done();
              }).catch(done);
            });
          });
        }).catch(done);
      });
    });
  });

  it('Filter categories specific full control and view all', done => {
    shared.logout(request, () => {
      shared.login(request, loginURL, adminUser, adminPasswd, () => {
        role = {
          name: 'bvd_tester',
          description: 'Test role for foundation',
          permission: [
            {
              // eslint-disable-next-line camelcase
              operation_key: 'FullControl',
              // eslint-disable-next-line camelcase
              resource_key: `menu<>Category-Administration`
            },
            {
              // eslint-disable-next-line camelcase
              operation_key: 'View',
              // eslint-disable-next-line camelcase
              resource_key: `menu<>All`
            }
          ]
        };
        updateRole(roleId, role).then(res => {
          expect(res.status).to.equal(200);
          shared.logout(request, () => {
            shared.login(request, loginURL, testerUser, adminPasswd, () => {
              getCategories().then(resultCategories => {
                expect(resultCategories.status).to.equal(200);
                expect(resultCategories.body.items).to.equal(undefined);
                expect(resultCategories.body.data.length).to.be.equal(3);
                const items = resultCategories.body.data;
                let result = items.find(item => item.id === 'Operations');
                expect(result.id).to.be.equal('Operations');
                expect(result.fullControl).to.be.equal(false);
                result = items.find(item => item.id === 'Network');
                expect(result.id).to.be.equal('Network');
                expect(result.fullControl).to.be.equal(false);
                result = items.find(item => item.id === 'Administration');
                expect(result.id).to.be.equal('Administration');
                expect(result.fullControl).to.be.equal(true);
                done();
              }).catch(done);
            });
          });
        }).catch(done);
      });
    });
  });

  it('Filter categories specific full control and view all duplicates', done => {
    shared.logout(request, () => {
      shared.login(request, loginURL, adminUser, adminPasswd, () => {
        role = {
          name: 'bvd_tester',
          description: 'Test role for foundation',
          permission: [
            {
              // eslint-disable-next-line camelcase
              operation_key: 'View',
              // eslint-disable-next-line camelcase
              resource_key: `menu<>All`
            },
            {
              // eslint-disable-next-line camelcase
              operation_key: 'FullControl',
              // eslint-disable-next-line camelcase
              resource_key: `menu<>Category-Administration`
            },
            {
              // eslint-disable-next-line camelcase
              operation_key: 'View',
              // eslint-disable-next-line camelcase
              resource_key: `menu<>All`
            },
            {
              // eslint-disable-next-line camelcase
              operation_key: 'View',
              // eslint-disable-next-line camelcase
              resource_key: `menu<>All`
            }
          ]
        };
        updateRole(roleId, role).then(res => {
          expect(res.status).to.equal(200);
          shared.logout(request, () => {
            shared.login(request, loginURL, testerUser, adminPasswd, () => {
              getCategories().then(resultCategories => {
                expect(resultCategories.status).to.equal(200);
                expect(resultCategories.body.items).to.equal(undefined);
                expect(resultCategories.body.data.length).to.be.equal(3);
                const items = resultCategories.body.data;
                let result = items.find(item => item.id === 'Operations');
                expect(result.id).to.be.equal('Operations');
                expect(result.fullControl).to.be.equal(false);
                result = items.find(item => item.id === 'Network');
                expect(result.id).to.be.equal('Network');
                expect(result.fullControl).to.be.equal(false);
                result = items.find(item => item.id === 'Administration');
                expect(result.id).to.be.equal('Administration');
                expect(result.fullControl).to.be.equal(true);
                done();
              }).catch(done);
            });
          });
        }).catch(done);
      });
    });
  });

  it('Filter categories specific full control duplicates and view all duplicates', done => {
    shared.logout(request, () => {
      shared.login(request, loginURL, adminUser, adminPasswd, () => {
        role = {
          name: 'bvd_tester',
          description: 'Test role for foundation',
          permission: [
            {
              // eslint-disable-next-line camelcase
              operation_key: 'View',
              // eslint-disable-next-line camelcase
              resource_key: `menu<>All`
            },
            {
              // eslint-disable-next-line camelcase
              operation_key: 'FullControl',
              // eslint-disable-next-line camelcase
              resource_key: `menu<>Category-Administration`
            },
            {
              // eslint-disable-next-line camelcase
              operation_key: 'View',
              // eslint-disable-next-line camelcase
              resource_key: `menu<>All`
            },
            {
              // eslint-disable-next-line camelcase
              operation_key: 'View',
              // eslint-disable-next-line camelcase
              resource_key: `menu<>All`
            },
            {
              // eslint-disable-next-line camelcase
              operation_key: 'FullControl',
              // eslint-disable-next-line camelcase
              resource_key: `menu<>Category-Administration`
            }
          ]
        };
        updateRole(roleId, role).then(res => {
          expect(res.status).to.equal(200);
          shared.logout(request, () => {
            shared.login(request, loginURL, testerUser, adminPasswd, () => {
              getCategories().then(resultCategories => {
                expect(resultCategories.status).to.equal(200);
                expect(resultCategories.body.items).to.equal(undefined);
                expect(resultCategories.body.data.length).to.be.equal(3);
                const items = resultCategories.body.data;
                let result = items.find(item => item.id === 'Operations');
                expect(result.id).to.be.equal('Operations');
                expect(result.fullControl).to.be.equal(false);
                result = items.find(item => item.id === 'Network');
                expect(result.id).to.be.equal('Network');
                expect(result.fullControl).to.be.equal(false);
                result = items.find(item => item.id === 'Administration');
                expect(result.id).to.be.equal('Administration');
                expect(result.fullControl).to.be.equal(true);
                done();
              }).catch(done);
            });
          });
        }).catch(done);
      });
    });
  });

  it('Filter menu-entries displayed in dynamic homepage for a tester role with view all permission', done => {
    shared.logout(request, () => {
      shared.login(request, loginURL, adminUser, adminPasswd, () => {
        role = {
          name: 'bvd_tester',
          description: 'Test role for foundation',
          permission: [{
            // eslint-disable-next-line camelcase
            operation_key: 'View',
            // eslint-disable-next-line camelcase
            resource_key: 'menu<>All'
          }]
        };
        updateRole(roleId, role).then(res => {
          expect(res.status).to.equal(200);
          roleId = res.body.role.id;
          shared.logout(request, () => {
            shared.login(request, loginURL, testerUser, adminPasswd, () => {
              // dynamic homepage requests have 'filter=pages' in their URL
              getMenuEntry(`${loginURL}?filter=pages`).then(resultMenuEntries => {
                expect(resultMenuEntries.status).to.equal(200);
                expect(resultMenuEntries.body.data.length).to.be.equal(0);
                done();
              }).catch(done);
            });
          });
        }).catch(done);
      });
    });
  });

  it('teardown', done => {
    shared.logout(request, () => {
      shared.login(request, loginURL, adminUser, adminPasswd, () => {
        deleteRole(roleId).then(res => {
          expect(res.status).to.equal(200);
          pages.forEach(page => {
            deletePage(page).then(resultPage => {
              expect(resultPage.status).to.equal(200);
              expect(resultPage.body.error).to.equal(false);
            }).catch(done);
          });
          menus.forEach(menu => {
            deleteMenuEntry(menu).then(resultDeleteMenu => {
              expect(resultDeleteMenu.status).to.equal(200);
              expect(resultDeleteMenu.body.error).to.equal(false);
            }).catch(done);
          });
          categories.forEach(category => {
            deleteCategory(category).then(resultCategory => {
              expect(resultCategory.status).to.equal(200);
              expect(resultCategory.body.error).to.equal(false);
            }).catch(done);
          });
          done();
        }).catch(done);
      });
    });
  });
});
