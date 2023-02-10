const shared = require('../helpers/shared');
const supertest = require('supertest');
const request = supertest.agent(shared.exploreTestURL);
const apiRole = '/rest/v1/role/';
const loginURL = '/rest/v1/menuEntries';
const apiToc = '/rest/v1/pages/toc';
const apiCategory = '/rest/v1/categories/';
const adminUser = shared.tenant.email;
const adminPasswd = shared.tenant.password;
const testerUser = 'tester';

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

let categories = [
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

describe('Non Admin only categories test - V1', () => {
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

describe('Tree view category list - V1', () => {
  categories = [
    {
      id: '1',
      icon: 'qtm-icon-app-application-performance-management',
      title: 'Dashboards',
      titleL10n: '',
      abbreviation: 'D',
      abbreviationL10n: ''
    },
    {
      id: '2',
      icon: 'qtm-icon-action',
      title: 'Operations',
      titleL10n: '',
      abbreviation: 'O',
      abbreviationL10n: ''
    },
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
    },
    {
      id: '3.2',
      title: 'Actions',
      abbreviation: '',
      abbreviationL10n: '',
      parent: '3'
    },
    {
      id: '3.3',
      title: 'Built-in Widgets',
      abbreviation: '',
      abbreviationL10n: '',
      parent: '3'
    },
    {
      id: '3.4',
      title: 'External Widgets',
      abbreviation: '',
      abbreviationL10n: '',
      parent: '3'
    },
    {
      id: '3.5',
      title: 'NOM',
      abbreviation: '',
      abbreviationL10n: '',
      parent: '3'
    },
    {
      id: '3.6',
      title: 'Layout',
      abbreviation: '',
      abbreviationL10n: '',
      parent: '3'
    },
    {
      id: '4',
      icon: 'qtm-icon-test',
      title: 'Vision Lab',
      titleL10n: '',
      abbreviation: 'V',
      abbreviationL10n: ''
    },
    {
      id: 'T100',
      abbreviation: 'M',
      abbreviationL10n: '',
      title: 'Multi Level Category'
    },
    {
      id: 'T200',
      abbreviation: '',
      abbreviationL10n: '',
      title: 'Level 2 Category',
      parent: 'T100'
    },
    {
      id: 'T205',
      abbreviation: '',
      abbreviationL10n: '',
      title: 'Level 2A Category',
      parent: 'T100'
    },
    {
      id: 'T300',
      abbreviation: '',
      abbreviationL10n: '',
      title: 'Level 3 Category',
      parent: 'T200'
    },
    {
      id: 'T400',
      abbreviation: '',
      abbreviationL10n: '',
      title: 'Level 4 Category',
      parent: 'T300'
    },
    {
      id: 'T310',
      abbreviation: '',
      abbreviationL10n: '',
      title: 'Level 3A Category',
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
          createCategories(categories).then(resultCategories => {
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
