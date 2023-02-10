const shared = require('../helpers/shared');
const supertest = require('supertest');
const request = supertest.agent(shared.exploreTestURL);
const apiVersion = 'v2';
const apiRole = `/rest/${apiVersion}/role/`;
const loginURL = `/rest/${apiVersion}/menuEntries`;
const apiToc = `/rest/${apiVersion}/pages/toc`;
const apiCategory = `/rest/${apiVersion}/categories/`;
const apiMenuEntry = `/rest/${apiVersion}/menuEntries/`;
const apiPage = `/rest/${apiVersion}/pages/`;
const adminUser = shared.tenant.email;
const adminPasswd = shared.tenant.password;
const testerUser = 'tester';
const { randomUUID } = require('crypto');

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

const getCategoryById = id => new Promise((resolve, reject) => {
  request
    .get(apiCategory.concat(id))
    .end((err, res) => {
      if (err) {
        return reject(err);
      }
      return resolve(res);
    });
});

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

const getToc = url => new Promise((resolve, reject) => {
  if (!url) {
    url = apiToc;
  }
  request
    .get(url)
    .end((err, res) => {
      if (err) {
        return reject(err);
      }
      return resolve(res);
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
const deleteCategory = (category, subItems = false) => new Promise((resolve, reject) => {
  request
    .delete(`${apiCategory}${category.id}?subItems=${subItems}`)
    .set('X-Secure-Modify-Token', shared.secureModifyToken())
    .end((err, res) => {
      if (err) {
        return reject(err);
      }
      return resolve(res);
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

const updateCategory = (categoryId, data) => new Promise((resolve, reject) => {
  request
    .put(apiCategory.concat(categoryId))
    .send(data)
    .set('X-Secure-Modify-Token', shared.secureModifyToken())
    .end((err, res) => {
      if (err) {
        return reject(err);
      }
      resolve(res);
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

const categories = [
  {
    id: randomUUID(),
    icon: 'hpe-globe',
    abbreviation: 'O',
    title: 'Operations',
    parent: 'Network'
  },
  {
    id: randomUUID(),
    icon: 'hpe-admin',
    abbreviation: 'A',
    title: 'Administration',
    parent: 'Network'
  },
  {
    id: randomUUID(),
    abbreviation: '',
    title: 'Network'
  }
];

/**
   * All
   *   L1_1
   *     L2_1
   *     L2_2
   *       L3_1
   *   L1_2
*/
const categoriesLevel = [
  {
    id: 'L1_1',
    icon: 'qtm-icon-action',
    title: 'L1_1',
    abbreviation: 'L'
  },
  {
    id: 'L1_2',
    icon: 'qtm-icon-action',
    title: 'L1_2',
    abbreviation: 'L'
  },
  {
    id: 'L2_1',
    icon: 'qtm-icon-action',
    title: 'L2_1',
    abbreviation: 'L',
    parent: 'L1_1'
  },
  {
    id: 'L2_2',
    icon: 'qtm-icon-action',
    title: 'L2_2',
    abbreviation: 'L',
    parent: 'L1_1'
  },
  {
    id: 'L3_1',
    icon: 'qtm-icon-action',
    title: 'L3_1',
    abbreviation: 'L',
    parent: 'L2_2'
  }];

describe('Non Admin - only permission on deep category', () => {
  /**
   * All
   *   L1_1
   *     L2_1
   *     L2_2
   *       L3_1    <-- FullControl
   *   L1_2
  */

  const roleLevel = {
    name: 'bvd_tester',
    description: 'Test role for foundation',
    permission: [{
      // eslint-disable-next-line camelcase
      operation_key: 'FullControl',
      // eslint-disable-next-line camelcase
      resource_key: 'menu<>Category-L3_1'
    }]
  };
  let roleLevelId;

  const createdCategories = [];

  const page = {
    id: 'operation',
    title: 'operation',
    default: true,
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

  const menuItem = {
    id: 'nestedMenu',
    title: 'Localization menuEntry',
    categoryId: 'L3_1',
    pageId: 'operation'
  };

  it('Setup', done => {
    shared.logout(request, () => {
      shared.login(request, loginURL, adminUser, adminPasswd, () => {
        createRole(roleLevel).then(res => {
          expect(res.status).to.equal(200);
          expect(res.body.role).to.not.equal(null);
          expect(res.body.role.name).to.equal('bvd_tester');
          roleLevelId = res.body.role.id;
          createCategories(categoriesLevel).then(resultCategories => {
            expect(resultCategories.status).to.equal(200);
            expect(resultCategories.body.data.length).to.be.equal(5);
            done();
          }).catch(done);
        }).catch(done);
      });
    });
  });

  it('View specific categories', done => {
    shared.logout(request, () => {
      shared.login(request, loginURL, testerUser, adminPasswd, () => {
        getCategories().then(resultCategory => {
          expect(resultCategory.status).to.equal(200);
          expect(resultCategory.body.data.length).to.be.equal(3);
          expect(resultCategory.body.data[0].id).to.be.equal('L2_2');
          expect(resultCategory.body.data[1].id).to.be.equal('L1_1');
          expect(resultCategory.body.data[2].id).to.be.equal('L3_1');
          done();
        }).catch(done);
      });
    });
  });

  // fails because user is non-admin
  it('Update category fails where permission is fullcontrol (L3_1)', done => {
    shared.logout(request, () => {
      shared.login(request, loginURL, testerUser, adminPasswd, () => {
        const myCategory = {
          ...categoriesLevel[4],
          title: 'L3_1 updated'
        };
        updateCategory(categoriesLevel[4].id, myCategory).then(res => {
          expect(res.status).to.equal(403);
          expect(res.body.error).to.equal(true);
          done();
        }).catch(done);
      });
    });
  });

  it('Update category fails where permission is implicit view permission (L2_2)', done => {
    shared.logout(request, () => {
      shared.login(request, loginURL, testerUser, adminPasswd, () => {
        const myCategory = {
          ...categoriesLevel[3],
          title: 'L2_2 updated'
        };
        updateCategory(categoriesLevel[3].id, myCategory).then(res => {
          expect(res.status).to.equal(403);
          expect(res.body.error).to.equal(true);
          done();
        }).catch(done);
      });
    });
  });

  it('Non admin with view permission on a menu entry present in third level category', done => {
    shared.logout(request, () => {
      shared.login(request, loginURL, adminUser, adminPasswd, () => {
        const modifiedRole = {
          name: 'bvd_tester',
          description: 'Test role for foundation',
          permission: [{
            // eslint-disable-next-line camelcase
            operation_key: 'View',
            // eslint-disable-next-line camelcase
            resource_key: 'menu<>Item-nestedMenu'
          }]
        };
        createPage(page).then(pageRes => {
          expect(pageRes.status).to.equal(200);
          createMenuEntry(menuItem).then(menuResult => {
            expect(menuResult.status).to.equal(200);
            updateRole(roleLevelId, modifiedRole).then(res => {
              expect(res.status).to.equal(200);
              shared.logout(request, () => {
                shared.login(request, loginURL, testerUser, adminPasswd, () => {
                  getCategories().then(resultCategory => {
                    expect(resultCategory.status).to.equal(200);
                    expect(resultCategory.body.data.length).to.be.equal(3);
                    expect(resultCategory.body.data[0].id).to.be.equal('L2_2');
                    expect(resultCategory.body.data[1].id).to.be.equal('L1_1');
                    expect(resultCategory.body.data[2].id).to.be.equal('L3_1');
                    getToc(apiToc.concat('?onlyFullControl="true"')).then(categoriesList => {
                      expect(categoriesList.body.data).to.not.be.undefined;
                      const data = categoriesList.body.data;
                      expect(data.length).to.equal(1);
                      expect(data[0].id).to.equal('L1_1');
                      expect(data[0].children.length).to.equal(1);
                      expect(data[0].children[0].id).to.equal('L2_2');
                      expect(data[0].children[0].children.length).to.equal(1);
                      expect(data[0].children[0].children[0].id).to.equal('L3_1');
                      done();
                    }).catch(done);
                  }).catch(done);
                });
              });
            }).catch(done);
          }).catch(done);
        }).catch(done);
      });
    });
  });

  it('teardown', done => {
    shared.logout(request, () => {
      shared.login(request, loginURL, adminUser, adminPasswd, () => {
        deleteRole(roleLevelId).then(res => {
          expect(res.status).to.equal(200);
          categoriesLevel.forEach(category => {
            deleteCategory(category).then(resultCategory => {
              expect(resultCategory.status).to.equal(200);
              expect(resultCategory.body.error).to.equal(false);
            }).catch(done);
          });
          createdCategories.forEach(category => {
            deleteCategory(category).then(resultCategory => {
              expect(resultCategory.status).to.equal(200);
              expect(resultCategory.body.error).to.equal(false);
            }).catch(done);
          });
          deletePage(page).then(resultPage => {
            expect(resultPage.status).to.equal(200);
            expect(resultPage.body.error).to.equal(false);
            done();
          }).catch(done);
        }).catch(done);
      });
    });
  });
});

describe('Tree view category list', () => {
  const treeViewCategories = [
    {
      id: '1',
      icon: 'qtm-icon-app-application-performance-management',
      title: 'Dashboards',
      titleL10n: '',
      order: '1',
      abbreviation: 'D',
      abbreviationL10n: ''
    },
    {
      id: '2',
      icon: 'qtm-icon-action',
      title: 'Operations',
      titleL10n: '',
      order: '2',
      abbreviation: 'O',
      abbreviationL10n: ''
    },
    {
      id: '3',
      icon: 'qtm-icon-monitor',
      title: 'Showcase',
      order: '3',
      abbreviation: 'S',
      abbreviationL10n: ''
    },
    {
      id: '3.1',
      title: 'Workflow',
      order: '1',
      abbreviation: '',
      abbreviationL10n: '',
      parent: '3'
    },
    {
      id: '3.2',
      title: 'Actions',
      order: '2',
      abbreviation: '',
      abbreviationL10n: '',
      parent: '3'
    },
    {
      id: '3.3',
      title: 'Built-in Widgets',
      order: '3',
      abbreviation: '',
      abbreviationL10n: '',
      parent: '3'
    },
    {
      id: '3.4',
      title: 'External Widgets',
      order: '4',
      abbreviation: '',
      abbreviationL10n: '',
      parent: '3'
    },
    {
      id: '3.5',
      title: 'NOM',
      order: '5',
      abbreviation: '',
      abbreviationL10n: '',
      parent: '3'
    },
    {
      id: '3.6',
      title: 'Layout',
      order: '6',
      abbreviation: '',
      abbreviationL10n: '',
      parent: '3'
    },
    {
      id: '4',
      icon: 'qtm-icon-test',
      title: 'Vision Lab',
      titleL10n: '',
      order: '4',
      abbreviation: 'V',
      abbreviationL10n: ''
    },
    {
      id: 'T100',
      abbreviation: 'M',
      abbreviationL10n: '',
      order: '5',
      title: 'Multi Level Category'
    },
    {
      id: 'T200',
      abbreviation: '',
      abbreviationL10n: '',
      title: 'Level 2 Category',
      order: '1',
      parent: 'T100'
    },
    {
      id: 'T205',
      abbreviation: '',
      abbreviationL10n: '',
      title: 'Level 2A Category',
      order: '2',
      parent: 'T100'
    },
    {
      id: 'T300',
      abbreviation: '',
      abbreviationL10n: '',
      title: 'Level 3 Category',
      order: '1',
      parent: 'T200'
    },
    {
      id: 'T400',
      abbreviation: '',
      abbreviationL10n: '',
      title: 'Level 4 Category',
      order: '1',
      parent: 'T300'
    },
    {
      id: 'T310',
      abbreviation: '',
      abbreviationL10n: '',
      title: 'Level 3A Category',
      order: '2',
      parent: 'T200'
    }
  ];

  let role = {
    name: 'bvd_tester',
    description: 'Test role for foundation',
    permission: [{
      // eslint-disable-next-line camelcase
      operation_key: 'FullControl',
      // eslint-disable-next-line camelcase
      resource_key: 'menu<>All'
    },
    {
      // eslint-disable-next-line camelcase
      operation_key: 'View',
      // eslint-disable-next-line camelcase
      resource_key: 'menu<>All'
    }]
  };
  let roleId;

  it('Setup', done => {
    shared.logout(request, () => {
      shared.login(request, loginURL, adminUser, adminPasswd, () => {
        createRole(role).then(res => {
          expect(res.status).to.equal(200);
          expect(res.body.role).to.not.equal(null);
          expect(res.body.role.name).to.equal('bvd_tester');
          roleId = res.body.role.id;
          createCategories(treeViewCategories).then(resultCategories => {
            expect(resultCategories.status).to.equal(200);
            expect(resultCategories.body.data.length).to.be.equal(16);
            done();
          }).catch(done);
        }).catch(done);
      });
    });
  });

  it('Verify all node in tree view', done => {
    shared.logout(request, () => {
      shared.login(request, loginURL, testerUser, adminPasswd, () => {
        getToc(apiToc.concat('?onlyFullControl="true"')).then(categoriesList => {
          expect(categoriesList.body.items).to.equal(undefined);
          const categs = categoriesList.body.data;
          expect(categs.length).to.equal(5);
          expect(categs[0].title).to.equal('Dashboards');
          expect(categs[1].title).to.equal('Operations');
          expect(categs[2].title).to.equal('Showcase');
          expect(categs[3].title).to.equal('Vision Lab');
          expect(categs[4].title).to.equal('Multi Level Category');

          const showCaseChildren = categs[2].children;
          expect(showCaseChildren.length).to.equal(6);
          expect(showCaseChildren[0].title).to.equal('Workflow');
          expect(showCaseChildren[1].title).to.equal('Actions');
          expect(showCaseChildren[2].title).to.equal('Built-in Widgets');
          expect(showCaseChildren[3].title).to.equal('External Widgets');
          expect(showCaseChildren[4].title).to.equal('NOM');
          expect(showCaseChildren[5].title).to.equal('Layout');

          // check for all the levels under multi level category
          const multiLevelCategoryChildren = categs[4].children;
          expect(multiLevelCategoryChildren.length).to.equal(2); // direct children
          expect(multiLevelCategoryChildren[0].title).to.equal('Level 2 Category');
          expect(multiLevelCategoryChildren[1].title).to.equal('Level 2A Category');

          expect(multiLevelCategoryChildren[0].children.length).to.equal(2);
          expect(multiLevelCategoryChildren[0].children[0].title).to.equal('Level 3 Category');
          expect(multiLevelCategoryChildren[0].children[1].title).to.equal('Level 3A Category');

          expect(multiLevelCategoryChildren[0].children[0].children.length).to.equal(1);
          expect(multiLevelCategoryChildren[0].children[0].children[0].title).to.equal('Level 4 Category');
          done();
        }).catch(done);
      });
    });
  });

  it('Verify all node in tree view with root category', done => {
    shared.logout(request, () => {
      shared.login(request, loginURL, testerUser, adminPasswd, () => {
        getToc(apiToc.concat('?onlyFullControl="true"&rootCategory="true"')).then(categoriesList => {
          expect(categoriesList.body.items).to.equal(undefined);
          const categs = categoriesList.body.data;
          expect(categs[0].title).to.equal('Dashboards');
          expect(categs[1].title).to.equal('Operations');
          expect(categs[2].title).to.equal('Showcase');
          expect(categs[3].title).to.equal('Vision Lab');
          expect(categs[4].title).to.equal('Multi Level Category');

          const showCaseChildren = categs[2].children;
          expect(showCaseChildren.length).to.equal(6);
          expect(showCaseChildren[0].title).to.equal('Workflow');
          expect(showCaseChildren[1].title).to.equal('Actions');
          expect(showCaseChildren[2].title).to.equal('Built-in Widgets');
          expect(showCaseChildren[3].title).to.equal('External Widgets');
          expect(showCaseChildren[4].title).to.equal('NOM');
          expect(showCaseChildren[5].title).to.equal('Layout');

          // check for all the levels under multi level category
          const multiLevelCategoryChildren = categs[4].children;
          expect(multiLevelCategoryChildren.length).to.equal(2); // direct childrens
          expect(multiLevelCategoryChildren[0].title).to.equal('Level 2 Category');
          expect(multiLevelCategoryChildren[1].title).to.equal('Level 2A Category');

          expect(multiLevelCategoryChildren[0].children.length).to.equal(2);
          expect(multiLevelCategoryChildren[0].children[0].title).to.equal('Level 3 Category');
          expect(multiLevelCategoryChildren[0].children[1].title).to.equal('Level 3A Category');

          expect(multiLevelCategoryChildren[0].children[0].children.length).to.equal(1);
          expect(multiLevelCategoryChildren[0].children[0].children[0].title).to.equal('Level 4 Category');
          done();
        }).catch(done);
      });
    });
  });

  it('Verify tree view child with a parent that has no fullControl permission', done => {
    shared.logout(request, () => {
      shared.login(request, loginURL, adminUser, adminPasswd, () => {
        role = {
          name: 'bvd_tester',
          description: 'Test role for foundation',
          permission: [{
            // eslint-disable-next-line camelcase
            operation_key: 'FullControl',
            // eslint-disable-next-line camelcase
            resource_key: 'menu<>Category-3.2'
          }]
        };
        updateRole(roleId, role).then(res => {
          expect(res.status).to.equal(200);
          shared.logout(request, () => {
            shared.login(request, loginURL, testerUser, adminPasswd, () => {
              getToc(apiToc.concat('?onlyFullControl="true"')).then(categoriesList => {
                expect(categoriesList.body.items).to.equal(undefined);
                const categs = categoriesList.body.data;
                expect(categs.length).to.equal(1);
                expect(categs[0].title).to.equal('Showcase');
                expect(categs[0].fullControl).to.equal(false);
                expect(categs[0].children.length).to.equal(1);
                expect(categs[0].children[0].title).to.equal('Actions');
                expect(categs[0].children[0].fullControl).to.equal(true);
                done();
              }).catch(done);
            });
          });
        });
      });
    });
  });

  it('Verify tree view parent and child', done => {
    shared.logout(request, () => {
      shared.login(request, loginURL, adminUser, adminPasswd, () => {
        role = {
          name: 'bvd_tester',
          description: 'Test role for foundation',
          permission: [{
            // eslint-disable-next-line camelcase
            operation_key: 'FullControl',
            // eslint-disable-next-line camelcase
            resource_key: 'menu<>Category-3'
          }]
        };
        updateRole(roleId, role).then(res => {
          expect(res.status).to.equal(200);
          shared.logout(request, () => {
            shared.login(request, loginURL, testerUser, adminPasswd, () => {
              getToc(apiToc.concat('?onlyFullControl="true"')).then(categoriesList => {
                expect(categoriesList.body.items).to.equal(undefined);
                const categs = categoriesList.body.data;
                expect(categs[0].title).to.equal('Showcase');

                const showCaseChildren = categs[0].children;
                expect(showCaseChildren.length).to.equal(6);
                expect(showCaseChildren[0].title).to.equal('Workflow');
                expect(showCaseChildren[1].title).to.equal('Actions');
                expect(showCaseChildren[2].title).to.equal('Built-in Widgets');
                expect(showCaseChildren[3].title).to.equal('External Widgets');
                expect(showCaseChildren[4].title).to.equal('NOM');
                expect(showCaseChildren[5].title).to.equal('Layout');
                done();
              }).catch(done);
            });
          });
        });
      });
    });
  });

  it('Verify tree view few parents', done => {
    shared.logout(request, () => {
      shared.login(request, loginURL, adminUser, adminPasswd, () => {
        role = {
          name: 'bvd_tester',
          description: 'Test role for foundation',
          permission: [{
            // eslint-disable-next-line camelcase
            operation_key: 'FullControl',
            // eslint-disable-next-line camelcase
            resource_key: 'menu<>Category-3'
          },
          {
            // eslint-disable-next-line camelcase
            operation_key: 'FullControl',
            // eslint-disable-next-line camelcase
            resource_key: 'menu<>Category-1'
          }]
        };
        updateRole(roleId, role).then(res => {
          expect(res.status).to.equal(200);
          shared.logout(request, () => {
            shared.login(request, loginURL, testerUser, adminPasswd, () => {
              getToc(apiToc.concat('?onlyFullControl="true"')).then(categoriesList => {
                expect(categoriesList.body.items).to.equal(undefined);
                const categs = categoriesList.body.data;
                expect(categs[0].title).to.equal('Dashboards');
                expect(categs[1].title).to.equal('Showcase');

                const showCaseChildren = categs[1].children;
                expect(showCaseChildren.length).to.equal(6);
                expect(showCaseChildren[0].title).to.equal('Workflow');
                expect(showCaseChildren[1].title).to.equal('Actions');
                expect(showCaseChildren[2].title).to.equal('Built-in Widgets');
                expect(showCaseChildren[3].title).to.equal('External Widgets');
                expect(showCaseChildren[4].title).to.equal('NOM');
                expect(showCaseChildren[5].title).to.equal('Layout');
                done();
              }).catch(done);
            });
          });
        });
      });
    });
  });
  it('teardown', done => {
    shared.logout(request, () => {
      shared.login(request, loginURL, adminUser, adminPasswd, () => {
        deleteRole(roleId).then(res => {
          expect(res.status).to.equal(200);
          treeViewCategories.forEach(category => {
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

describe('Delete categories for admin users', () => {
  const testCategories = [
    {
      id: '3',
      icon: 'qtm-icon-monitor',
      title: 'Showcase',
      abbreviation: 'S',
      abbreviationL10n: ''
    },
    {
      id: '3.1',
      title: 'Workflow',
      abbreviation: '',
      abbreviationL10n: '',
      parent: '3'
    }
  ];

  const pages = [{
    id: 'operation',
    title: 'operation',
    default: true,
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

  it('Setup', done => {
    shared.logout(request, () => {
      shared.login(request, loginURL, adminUser, adminPasswd, () => {
        createPage(pages).then(pageRes => {
          expect(pageRes.status).to.equal(200);
          createCategories(testCategories).then(resultCategories => {
            expect(resultCategories.status).to.equal(200);
            expect(resultCategories.body.data.length).to.be.equal(2);
            done();
          }).catch(done);
        }).catch(done);
      });
    });
  });

  /**
   * All
   *   3
   *   3_7   <-- FullControl
  */
  it('Verify delete category for Admin user on the category with no sub-items', done => {
    const category = {
      id: '3.7',
      title: 'Localization',
      abbreviation: 'L',
      abbreviationL10n: '',
      parent: '3'
    };

    const menuItem = [{
      id: 'testMenu',
      title: 'Localization menuEntry',
      categoryId: '3.7',
      pageId: 'operation'
    }];

    shared.logout(request, () => {
      shared.login(request, loginURL, adminUser, adminPasswd, () => {
        createCategories(category).then(result => {
          expect(result.status).to.equal(200);
          createMenuEntry(menuItem).then(menuResult => {
            expect(menuResult.status).to.equal(200);
            deleteCategory(category, true).then(deletedCategory => {
              expect(deletedCategory.status).to.equal(200);
              expect(deletedCategory.body.error).to.equal(false);
              getCategoryById(category.id).then(getCatRes => {
                expect(getCatRes.status).to.equal(404);
                deleteMenuEntry(menuItem).then(resultDeleteMenu => {
                  expect(resultDeleteMenu.status).to.equal(404);
                  done();
                }).catch(done);
              });
            });
          });
        });
      });
    });
  });

  it('teardown', done => {
    shared.logout(request, () => {
      shared.login(request, loginURL, adminUser, adminPasswd, () => {
        pages.forEach(page => {
          deletePage(page).then(resultPage => {
            expect(resultPage.status).to.equal(200);
            expect(resultPage.body.error).to.equal(false);
          }).catch(done);
        });
        testCategories.forEach(category => {
          deleteCategory(category).then(resultCategory => {
            expect(resultCategory.status).to.equal(200);
            expect(resultCategory.body.error).to.equal(false);
          }).catch(done);
        });
        done();
      });
    });
  });
});

describe('Non Admin only categories test', () => {
  it('setup', done => {
    shared.logout(request, () => {
      shared.login(request, loginURL, adminUser, adminPasswd, () => {
        createCategories(categories).then(res => {
          expect(res.status).to.equal(200);
          expect(res.body.error).to.equal(false);
          expect(res.body.data).not.to.equal(undefined);
          done();
        }).catch(done);
      });
    });
  });

  it('Verify root category as admin', done => {
    shared.logout(request, () => {
      shared.login(request, loginURL, adminUser, adminPasswd, () => {
        getToc(apiToc.concat('?onlyFullControl="true"&rootCategory="true"')).then(categoriesList => {
          expect(categoriesList.body.items).to.equal(undefined);
          const categs = categoriesList.body.data;
          expect(categs.length).to.equal(4);
          // root category is available
          expect(categs[0].title).to.equal('editMode.category.root');
          done();
        }).catch(done);
      });
    });
  });

  it('Create category from non-admin user', done => {
    shared.logout(request, () => {
      shared.login(request, loginURL, testerUser, adminPasswd, () => {
        createCategories(categories).then(res => {
          expect(res.status).to.equal(403);
          expect(res.body.message).to.equal('Forbidden');
          done();
        }).catch(done);
      });
    });
  });

  it('Update category from non-admin user', done => {
    shared.logout(request, () => {
      shared.login(request, loginURL, testerUser, adminPasswd, () => {
        const myCategory = {
          ...categories[0],
          title: 'CannotUpdate'
        };
        updateCategory(categories[0].id, myCategory).then(res => {
          expect(res.status).to.equal(403);
          expect(res.body.message).to.equal('Forbidden');
          done();
        }).catch(done);
      });
    });
  });

  it('Delete category from non-admin user', done => {
    shared.logout(request, () => {
      shared.login(request, loginURL, testerUser, adminPasswd, () => {
        deleteCategory(categories[0].id).then(res => {
          expect(res.status).to.equal(403);
          expect(res.body.message).to.equal('Forbidden');
          expect(res.body.error).to.equal(true);
          done();
        }).catch(done);
      });
    });
  });

  it('teardown', done => {
    shared.logout(request, () => {
      shared.login(request, loginURL, adminUser, adminPasswd, () => {
        categories.forEach(category => {
          deleteCategory(category).then(res => {
            expect(res.status).to.equal(200);
            expect(res.body.data).not.to.equal(undefined);
          }).catch(done);
        });
        done();
      });
    });
  });
});
