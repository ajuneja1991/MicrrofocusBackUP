const shared = require('../helpers/shared');
const supertest = require('supertest');
const request = supertest.agent(shared.exploreTestURL);
const testData = require('../mockData');
const mockData = JSON.parse(JSON.stringify(testData));
const assert = require('chai').assert;
// tester is user is part of bvd_tester role and it is created by fakeidm.
const testerUser = 'rbacTester';
const superAdmin = 'admin';
const superAdminPassword = 'Da$hb0ard!';
const adminPasswd = shared.tenant.password;
const apiRole = '/rest/v2/role/';
const loginURL = '/rest/v2/pageGroups';
const apiPage = '/rest/v2/pages/';
const apiTag = '/rest/v2/tag/';
const apiTagVal = '/rest/v2/tagVal/';
const async = require('async');

const createRole = role => new Promise((resolve, reject) =>
  request.post(apiRole)
    .send(role)
    .set('X-Secure-Modify-Token', shared.secureModifyToken())
    .end((err, res) => {
      if (err) {
        return reject(err);
      }
      return resolve(res);
    })
);

const getRole = roleId => new Promise((resolve, reject) =>
  request.get(apiRole.concat(roleId))
    .set('X-Secure-Modify-Token', shared.secureModifyToken())
    .end((err, res) => {
      if (err) {
        return reject(err);
      }
      return resolve(res);
    })
);

const createPage = mockPage => new Promise((resolve, reject) => {
  request
    .post(apiPage)
    .send(mockPage)
    .set('X-Secure-Modify-Token', shared.secureModifyToken())
    .end((err, res) => {
      if (err) {
        return reject(err);
      }
      resolve(res);
    });
});

const updatePage = mockPage => new Promise((resolve, reject) => {
  request
    .put(`${apiPage}${mockPage.id}`)
    .send(mockPage)
    .set('X-Secure-Modify-Token', shared.secureModifyToken())
    .end((err, res) => {
      if (err) {
        return reject(err);
      }
      resolve(res);
    });
});
const deleteRole = roleId => new Promise((resolve, reject) => {
  request.delete(`${apiRole}${roleId}`)
    .set('X-Secure-Modify-Token', shared.secureModifyToken())
    .end((err, response) => {
      if (err) {
        return reject(err);
      }
      resolve(response);
    });
});
const deletePage = pageId => new Promise((resolve, reject) => {
  request
    .delete(`${apiPage}${pageId}`)
    .set('X-Secure-Modify-Token', shared.secureModifyToken())
    .end((err, res) => {
      if (err) {
        return reject(err);
      }
      // console.log('-------', res);
      resolve(res);
    });
});

const getPage = pageId => new Promise((resolve, reject) => {
  request
    .get(`${apiPage}${pageId}`)
    .end((err, res) => {
      if (err) {
        return reject(err);
      }
      resolve(res);
    });
});

const deleteTag = pageId => new Promise((resolve, reject) => {
  request
    .delete(apiTag)
    .query(`refType=page&ref=${pageId}`)
    .set('X-Secure-Modify-Token', shared.secureModifyToken())
    .end((err, res) => {
      if (err) {
        return reject(err);
      }
      resolve(res);
    });
});

const deleteTagByValue = (tagName, tagValue) => new Promise((resolve, reject) => {
  request
    .delete(`${apiTagVal}${tagName}/${tagValue}`)
    .set('X-Secure-Modify-Token', shared.secureModifyToken())
    .end((err, res) => {
      if (err) {
        return reject(err);
      }
      resolve(res);
    });
});

const myTags = [
  {
    name: '__rbac',
    value: 'nomMgmt',
    ref: 'testPage',
    refType: 'page'
  },
  {
    name: '__rbac',
    value: 'dca',
    ref: 'testPage',
    refType: 'page'
  },
  {
    name: '__rbac',
    value: 'Operators',
    ref: 'testPage',
    refType: 'page'
  },
  {
    name: '__rbac',
    value: 'myTest',
    ref: 'testPage',
    refType: 'page'
  }
];
const createNullRefTags = (tags = myTags) => new Promise((resolve, reject) => {
  async.eachOfSeries(tags, (tag, key, tagDone) => {
    request
      .post(`${apiTagVal}${tag.name}/${tag.value}`)
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .send({})
      .end((err, res) => {
        if (err) {
          return tagDone(err);
        }
        if (res.error.status === 500) {
          return tagDone();
        }
        if (res && res.body) {
          expect(res.body.data).to.exist;
        }
        return tagDone();
      });
  },
  err => {
    if (err) {
      return reject(err);
    }
    return resolve();
  });
});
// eslint-disable-next-line no-unused-vars
const deleteAllTags = (tagsToDelete = myTags) => new Promise((resolve, reject) => {
  async.each(tagsToDelete, (tag, callback) => {
    request
      .delete(apiTagVal.concat(tag.name).concat('/', tag.value))
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .end((err, res) => {
        if (err) {
          return callback(err);
        }
        expect(res.status).to.equal(200);
        expect(res.body.data.result).to.be.equal('Tags deleted');
        return callback();
      });
  }, err => {
    if (err) {
      return reject(new Error(`Error while deleting items (${JSON.parse(tagsToDelete)}): ${err}`));
    }
    return resolve();
  });
});

const createNullRefRBACTag = (tagValue, tagName = '__rbac') => new Promise((resolve, reject) => {
  request
    .post(apiTagVal.concat(tagName).concat('/', tagValue))
    .set('X-Secure-Modify-Token', shared.secureModifyToken())
    .end((err, res) => {
      if (err) {
        return reject(err);
      }
      resolve(res);
    });
});

describe('Page all permission', () => {
  const testUser = 'rbacTester';
  const testPassword = 'rbacTester';
  let roles = [];
  let pages = [];
  let nullRefTags = [];

  beforeEach(done => {
    roles = [];
    pages = [];
    nullRefTags = [];
    shared.login(request, loginURL, superAdmin, superAdminPassword, done);
  });

  afterEach(done => {
    const pagePromises = [];
    const rolePromises = [];
    const nullRefTagsPromises = [];
    shared.logout(request, () => {
      shared.login(request, loginURL, superAdmin, superAdminPassword, () => {
        nullRefTags.forEach(nullRefTag => {
          nullRefTagsPromises.push(deleteTagByValue(nullRefTag.name, nullRefTag.value));
        });
        Promise.all(nullRefTagsPromises).then(() => {
          pages.forEach(pageId => {
            pagePromises.push(deletePage(pageId));
            pagePromises.push(deleteTag(pageId));
          });
          Promise.all(pagePromises).then(() => {
            roles.forEach(roleId => {
              rolePromises.push(deleteRole(roleId));
            });
            Promise.all(rolePromises).then(() => {
              shared.logout(request, done);
            }).catch(error => {
              console.log(error);
            });
          });
        });
      });
    });
  });

  it('no permission no view', done => {
    const role = {
      name: 'rbac_tester',
      description: 'Rbac Test role for foundation',
      permission: []
    };

    const mockPage = {
      ...mockData.page,
      id: 'roletest',
      title: 'role test',
      tags: []
    };
    createRole(role).then(res => {
      expect(res.status).to.equal(200);
      expect(res.body.role).to.not.equal(null);
      expect(res.body.role.name).to.equal('rbac_tester');
      roles.push(res.body.role.id);
      getRole(res.body.role.id).then(response => {
        expect(response.status).to.equal(200);
        expect(response.body).to.not.equal(null);
        expect(response.body.role.type).to.equal('foundation');
        expect(response.body.role.name).to.equal('rbac_tester');
        createPage(mockPage).then(createdPage => {
          expect(createdPage.status).to.equal(200);
          expect(createdPage.body.data[0].id).to.be.equal(mockPage.id);
          pages.push(mockPage.id);
          shared.logout(request, () => {
            shared.login(request, loginURL, testUser, testPassword, () => {
              getPage(mockPage.id).then(result => {
                expect(result.status).to.equal(401);
                expect(result.body.error).to.equal(true);
                done();
              }).catch(done);
            });
          });
        }).catch(done);
      }).catch(done);
    }).catch(done);
  });

  it('View all page', done => {
    const mockPage = {
      ...mockData.page,
      id: 'roletest',
      title: 'role test',
      tags: []
    };
    const role = {
      name: 'rbac_tester',
      description: 'View role for foundation',
      permission: [{
        // eslint-disable-next-line camelcase
        operation_key: 'View',
        // eslint-disable-next-line camelcase
        resource_key: 'default_action<>All'
      }]
    };
    createRole(role).then(res => {
      expect(res.status).to.equal(200);
      expect(res.body.role).to.not.equal(null);
      expect(res.body.role.name).to.equal('rbac_tester');
      roles.push(res.body.role.id);
      createPage(mockPage).then(createdPage => {
        expect(createdPage.status).to.equal(200);
        expect(createdPage.body.data[0].id).to.be.equal(mockPage.id);
        pages.push(mockPage.id);
        shared.logout(request, () => {
          shared.login(request, loginURL, testUser, testPassword, () => {
            getPage(mockPage.id).then(result => {
              expect(result.status).to.equal(200);
              expect(result.body.error).to.equal(false);
              mockPage.title = 'Updated title';
              updatePage(mockPage).then(updatedResult => {
                expect(updatedResult.status).to.equal(401);
                expect(updatedResult.body.error).to.equal(true);
                expect(updatedResult.body.additionalInfo[0]).to.equal('User has no permission to modify the page.');
                done();
              }).catch(done);
            }).catch(done);
          });
        });
      }).catch(done);
    }).catch(done);
  });

  it('Cannot View a page with modify permission', done => {
    const mockPage = {
      ...mockData.page,
      id: 'roletest_modify',
      title: 'role test updated',
      tags: []
    };
    const role = {
      name: 'rbac_tester',
      description: 'View role for foundation',
      permission: [{
        // eslint-disable-next-line camelcase
        operation_key: 'Modify',
        // eslint-disable-next-line camelcase
        resource_key: 'default_action<>All'
      }]
    };

    createRole(role).then(res => {
      expect(res.status).to.equal(200);
      expect(res.body.role).to.not.equal(null);
      expect(res.body.role.name).to.equal('rbac_tester');
      roles.push(res.body.role.id);
      createPage(mockPage).then(createdPage => {
        expect(createdPage.status).to.equal(200);
        expect(createdPage.body.data[0].id).to.be.equal(mockPage.id);
        pages.push(mockPage.id);
        shared.logout(request, () => {
          shared.login(request, loginURL, testUser, testPassword, () => {
            getPage(mockPage.id).then(pageGetResult => {
              expect(pageGetResult.status).to.equal(401);
              expect(pageGetResult.body.error).to.equal(true);
              updatePage(mockPage).then(updatedPage => {
                expect(updatedPage.status).to.equal(200);
                expect(updatedPage.body.data.title).to.be.equal(mockPage.title);
                expect(updatedPage.body.title).to.equal(undefined);
                done();
              }).catch(done);
            }).catch(done);
          });
        });
      }).catch(done);
    }).catch(done);
  });

  it('Cannot view or modify a page with delete permission', done => {
    const mockPage = {
      ...mockData.page,
      id: 'roletest',
      title: 'role test updated for test',
      tags: []
    };
    const role = {
      name: 'rbac_tester',
      description: 'View role for foundation',
      permission: [{
        // eslint-disable-next-line camelcase
        operation_key: 'Delete',
        // eslint-disable-next-line camelcase
        resource_key: 'default_action<>All'
      }]
    };
    createRole(role).then(res => {
      expect(res.status).to.equal(200);
      expect(res.body.role).to.not.equal(null);
      expect(res.body.role.name).to.equal('rbac_tester');
      roles.push(res.body.role.id);
      createPage(mockPage).then(createdPage => {
        expect(createdPage.status).to.equal(200);
        expect(createdPage.body.data[0].id).to.be.equal(mockPage.id);
        pages.push(mockPage.id);
        shared.logout(request, () => {
          shared.login(request, loginURL, testUser, testPassword, () => {
            getPage(mockPage.id).then(pageGetResult => {
              expect(pageGetResult.status).to.equal(401);// cannot view the page
              expect(pageGetResult.body.error).to.equal(true);
              deletePage(mockPage.id).then(deleteResult => {
                expect(deleteResult.status).to.equal(200);
                expect(deleteResult.body.error).to.equal(false);
                pages.pop();
                createPage(mockPage).then(pageResult => {
                  expect(pageResult.status).to.equal(401);
                  expect(pageResult.body.error).to.equal(true);
                  done();
                }).catch(done);
              }).catch(done);
            }).catch(done);
          });
        });
      }).catch(done);
    }).catch(done);
  });

  it('Can perform any operation on page with Fullcontrol permission', done => {
    const mockPage = {
      ...mockData.page,
      id: 'roletest',
      title: 'role test'
    };
    delete mockPage.tags;
    const role = {
      name: 'rbac_tester',
      description: 'View role for foundation',
      permission: [{
        // eslint-disable-next-line camelcase
        operation_key: 'FullControl',
        // eslint-disable-next-line camelcase
        resource_key: 'default_action<>All'
      }]
    };
    createRole(role).then(res => {
      expect(res.status).to.equal(200);
      expect(res.body.role).to.not.equal(null);
      expect(res.body.role.name).to.equal('rbac_tester');
      roles.push(res.body.role.id);
      shared.logout(request, () => {
        shared.login(request, loginURL, testUser, testPassword, () => {
          createPage(mockPage).then(createdPage => {
            expect(createdPage.status).to.equal(200);
            expect(createdPage.body.error).to.equal(false);
            expect(createdPage.body.data[0].id).to.be.equal(mockPage.id);
            expect(createdPage.body[0]).to.equal(undefined);
            pages.push(mockPage.id);
            getPage(mockPage.id).then(pageResult => {
              expect(pageResult.status).to.equal(200);
              expect(pageResult.body.error).to.equal(false);
              expect(pageResult.body.data.id).to.equal(mockPage.id);
              expect(pageResult.body.id).to.equal(undefined);
              deletePage(mockPage.id).then(deleteResult => {
                expect(deleteResult.status).to.equal(200);
                expect(deleteResult.body.error).to.equal(false);
                pages.pop();
                done();
              }).catch(done);
            }).catch(done);
          }).catch(done);
        });
      });
    }).catch(done);
  });

  it('User with only modify page permission', done => {
    const mockPage = {
      ...mockData.page,
      id: 'roletest',
      title: 'role test',
      tags: [{ name: '__rbac', values: ['nomMgmt']}]
    };
    const role = {
      name: 'rbac_tester',
      description: 'View role for foundation',
      permission: [{
        // eslint-disable-next-line camelcase
        operation_key: 'Modify',
        // eslint-disable-next-line camelcase
        resource_key: 'default_action<>All'
      }]
    };
    createRole(role).then(res => {
      expect(res.status).to.equal(200);
      expect(res.body.role).to.not.equal(null);
      expect(res.body.role.name).to.equal('rbac_tester');
      roles.push(res.body.role.id);
      shared.logout(request, () => {
        shared.login(request, loginURL, testUser, testPassword, () => {
          createPage(mockPage).then(pageResult => {
            expect(pageResult.status).to.equal(401);
            expect(pageResult.body.error).to.equal(true);
            done();
          }).catch(done);
        });
      });
    }).catch(done);
  });

  it('User with create page permission', done => {
    const mockPage = {
      ...mockData.page,
      id: 'roletest',
      title: 'role test all'
    };
    delete mockPage.tags;
    const role = {
      name: 'rbac_tester',
      description: 'View role for foundation',
      permission: [{
        // eslint-disable-next-line camelcase
        operation_key: 'Create',
        // eslint-disable-next-line camelcase
        resource_key: 'default_action<>All'
      }]
    };

    createRole(role).then(res => {
      expect(res.status).to.equal(200);
      expect(res.body.role).to.not.equal(null);
      expect(res.body.role.name).to.equal('rbac_tester');
      roles.push(res.body.role.id);
      shared.logout(request, () => {
        shared.login(request, loginURL, testUser, testPassword, () => {
          createPage(mockPage).then(createdPage => {
            expect(createdPage.status).to.equal(200);
            expect(createdPage.body.error).to.equal(false);
            pages.push(mockPage.id);
            deletePage(mockPage.id).then(deletedRes => {
              expect(deletedRes.status).to.equal(200);// because the user owns the page
              expect(deletedRes.body.error).to.equal(false); // has __owner tag
              pages.pop();
              shared.logout(request, () => {
                shared.login(request, loginURL, superAdmin, superAdminPassword, () => {
                  createPage(mockPage).then(newPage => {
                    expect(newPage.status).to.equal(200);
                    expect(newPage.body.error).to.equal(false);
                    pages.push(mockPage.id);
                    shared.logout(request, () => {
                      shared.login(request, loginURL, testUser, testPassword, () => {
                        getPage(mockPage.id).then(result => { // should faile
                          expect(result.status).to.equal(401);
                          expect(result.body.error).to.equal(true);
                          done();
                        }).catch(done);
                      });
                    });
                  }).catch(done);
                });
              });
            }).catch(done);
          }).catch(done);
        });
      });
    }).catch(done);
  });
});

describe('Page none permission', () => {
  const testUser = 'rbacTester';
  const testPassword = 'rbacTester';
  let roles = [];
  let pages = [];
  let nullRefTags = [];

  beforeEach(done => {
    roles = [];
    pages = [];
    nullRefTags = [];
    shared.login(request, loginURL, superAdmin, superAdminPassword, done);
  });

  afterEach(done => {
    const pagePromises = [];
    const rolePromises = [];
    const nullRefTagsPromises = [];
    shared.logout(request, () => {
      shared.login(request, loginURL, superAdmin, superAdminPassword, () => {
        nullRefTags.forEach(nullRefTag => {
          nullRefTagsPromises.push(deleteTagByValue(nullRefTag.name, nullRefTag.value));
        });
        Promise.all(nullRefTagsPromises).then(() => {
          pages.forEach(pageId => {
            pagePromises.push(deletePage(pageId));
            pagePromises.push(deleteTag(pageId));
          });
          Promise.all(pagePromises).then(() => {
            roles.forEach(roleId => {
              rolePromises.push(deleteRole(roleId));
            });
            Promise.all(rolePromises).then(() => {
              shared.logout(request, done);
            }).catch(error => {
              console.log(error);
            });
          });
        });
      });
    });
  });

  it('should not view a page of a specific group with view permission for MemberOfNoGroup', done => {
    const role = {
      name: 'rbac_tester',
      description: 'RBAC Rest role',
      permission: [{
        // eslint-disable-next-line camelcase
        operation_key: 'View',
        // eslint-disable-next-line camelcase
        resource_key: 'default_action<>MemberOfNoGroup'
      }]
    };

    const mockPage = {
      ...mockData.page,
      id: 'roletest',
      title: 'role test',
      tags: [{ name: '__rbac', values: ['nomMgmt']}]
    };

    createRole(role).then(res => {
      expect(res.status).to.equal(200);
      expect(res.body.role).to.not.equal(null);
      expect(res.body.role.name).to.equal('rbac_tester');
      roles.push(res.body.role.id);
      createPage(mockPage).then(createdPage => {
        expect(createdPage.status).to.equal(200);
        expect(createdPage.body.data[0].id).to.be.equal(mockPage.id);
        expect(createdPage.body[0]).to.equal(undefined);
        pages.push(mockPage.id);
        nullRefTags.push({ name: '__rbac', value: 'nomMgmt' });
        shared.logout(request, () => {
          shared.login(request, loginURL, testUser, testPassword, () => {
            getPage(mockPage.id).then(result => {
              expect(result.status).to.equal(401);
              expect(result.body.error).to.equal(true);
              done();
            }).catch(done);
          });
        });
      }).catch(done);
    }).catch(done);
  });

  it('should not update a page with view permission for MemberOfNoGroup', done => {
    // eslint-disable-next-line no-unused-vars
    const role = {
      name: 'rbac_tester',
      description: 'Test role for foundation',
      permission: [{
        // eslint-disable-next-line camelcase
        operation_key: 'View',
        // eslint-disable-next-line camelcase
        resource_key: 'default_action<>MemberOfNoGroup'
      }]
    };

    const mockPage = {
      ...mockData.page,
      id: 'roletest',
      title: 'role test',
      tags: []
    };

    createRole(role).then(res => {
      expect(res.status).to.equal(200);
      expect(res.body.role).to.not.equal(null);
      expect(res.body.role.name).to.equal('rbac_tester');
      roles.push(res.body.role.id);
      createPage(mockPage).then(createdPage => {
        expect(createdPage.status).to.equal(200);
        expect(createdPage.body.data[0].id).to.be.equal(mockPage.id);
        expect(createdPage.body[0]).to.equal(undefined);
        pages.push(mockPage.id);
        shared.logout(request, () => {
          shared.login(request, loginURL, testUser, testPassword, () => {
            updatePage(mockPage).then(result => {
              expect(result.status).to.equal(401);
              expect(result.body.error).to.equal(true);
              done();
            }).catch(done);
          });
        });
      }).catch(done);
    }).catch(done);
  });

  it('should not modify a page of a specific group with modifiy permission for MemberOfNoGroup', done => {
    const role = {
      name: 'rbac_tester',
      description: 'Test role for foundation',
      permission: [{
        // eslint-disable-next-line camelcase
        operation_key: 'Modify',
        // eslint-disable-next-line camelcase
        resource_key: 'default_action<>MemberOfNoGroup'
      }]
    };

    const mockPage = {
      ...mockData.page,
      id: 'roletest',
      title: 'role test',
      tags: [{ name: '__rbac', values: ['nomMgmt']}]
    };

    createRole(role).then(res => {
      expect(res.status).to.equal(200);
      expect(res.body.role).to.not.equal(null);
      expect(res.body.role.name).to.equal('rbac_tester');
      roles.push(res.body.role.id);
      createPage(mockPage).then(createdPage => {
        expect(createdPage.status).to.equal(200);
        expect(createdPage.body.data[0].id).to.be.equal(mockPage.id);
        expect(createdPage.body[0]).to.equal(undefined);
        pages.push(mockPage.id);
        nullRefTags.push({ name: '__rbac', value: 'nomMgmt' });
        shared.logout(request, () => {
          shared.login(request, loginURL, testUser, testPassword, () => {
            updatePage(mockPage).then(result => {
              expect(result.status).to.equal(401);
              expect(result.body.error).to.equal(true);
              done();
            }).catch(done);
          });
        });
      }).catch(done);
    }).catch(done);
  });

  it('should not update and delete page of group nomMgmt with modify and delete permission of MemberOfNoGroup', done => {
    const role = {
      name: 'rbac_tester',
      description: 'Test role for foundation',
      permission: [{
        // eslint-disable-next-line camelcase
        operation_key: 'Delete',
        // eslint-disable-next-line camelcase
        resource_key: 'default_action<>MemberOfNoGroup'
      },
      {
        // eslint-disable-next-line camelcase
        operation_key: 'Modify',
        // eslint-disable-next-line camelcase
        resource_key: 'default_action<>MemberOfNoGroup'
      }]
    };

    const mockPage = {
      ...mockData.page,
      id: 'roletest',
      title: 'role test',
      tags: [{ name: '__rbac', values: ['nomMgmt']}]
    };

    createRole(role).then(res => {
      expect(res.status).to.equal(200);
      expect(res.body.role).to.not.equal(null);
      expect(res.body.role.name).to.equal('rbac_tester');
      roles.push(res.body.role.id);
      createPage(mockPage).then(createdPage => {
        expect(createdPage.status).to.equal(200);
        pages.push(mockPage.id);
        nullRefTags.push({ name: '__rbac', value: 'nomMgmt' });
        shared.logout(request, () => {
          shared.login(request, loginURL, testUser, testPassword, () => {
            const newPage = { ...mockData.page,
              id: 'roletest',
              title: 'role test',
              tags: []};
            updatePage(newPage).then(modifiedPage => {
              expect(modifiedPage.status).to.equal(401);
              expect(modifiedPage.body.error).to.equal(true);
              deletePage(newPage.id).then(deletedPage => {
                expect(deletedPage.status).to.equal(401);
                expect(deletedPage.body.error).to.equal(true);
                done();
              }).catch(done);
            }).catch(done);
          });
        });
      }).catch(done);
    }).catch(done);
  });

  it('should not create or delete a page of group nonMgmt with AssignPages permission of MemberOfNoGroup', done => {
    const role = {
      name: 'rbac_tester',
      description: 'Test role for foundation',
      permission: [{
        // eslint-disable-next-line camelcase
        operation_key: 'AssignPages',
        // eslint-disable-next-line camelcase
        resource_key: 'default_action<>MemberOfNoGroup'
      }]
    };

    const mockPage = {
      ...mockData.page,
      id: 'roletest',
      title: 'role test',
      tags: [{ name: '__rbac', values: ['nomMgmt']}]
    };

    createRole(role).then(res => {
      expect(res.status).to.equal(200);
      roles.push(res.body.role.id);
      createPage(mockPage).then(nomPage => {
        expect(nomPage.status).to.equal(200);
        pages.push(mockPage.id);
        nullRefTags.push({ name: '__rbac', value: 'nomMgmt' });
        shared.logout(request, () => {
          shared.login(request, loginURL, testUser, testPassword, () => {
            createPage(mockPage).then(createdPage => {
              expect(createdPage.status).to.equal(401);
              expect(createdPage.body.error).to.equal(true);
              deletePage(mockPage.id).then(deletedPage => {
                expect(deletedPage.status).to.equal(401);
                expect(deletedPage.body.error).to.equal(true);
                done();
              }).catch(done);
            }).catch(done);
          });
        });
      }).catch(done);
    }).catch(done);
  });

  it('should have all permission with FullControl for MemberOfNoGroup', done => {
    const role = {
      name: 'rbac_tester',
      description: 'Test role for foundation',
      permission: [{
        // eslint-disable-next-line camelcase
        operation_key: 'FullControl',
        // eslint-disable-next-line camelcase
        resource_key: 'default_action<>MemberOfNoGroup'
      }]
    };

    const mockPage = {
      ...mockData.page,
      id: 'roletest',
      title: 'role test',
      tags: [{ name: '__rbac', values: ['nomMgmt']}]
    };

    createRole(role).then(res => {
      expect(res.status).to.equal(200);
      roles.push(res.body.role.id);
      shared.logout(request, () => {
        shared.login(request, loginURL, testUser, testPassword, () => {
          createPage(mockPage).then(createdPage => {
            expect(createdPage.status).to.equal(401);
            expect(createdPage.body.error).to.equal(true);

            const newPage = {
              ...mockData.page,
              id: 'roletestnogroup',
              title: 'role test no group'
            };
            delete newPage.tags;
            createPage(newPage).then(newPages => {
              expect(newPages.status).to.equal(200);
              expect(newPages.body.error).to.equal(false);
              expect(newPages.body.data[0].id).to.equal(newPage.id);
              expect(newPages.body[0]).to.equal(undefined);
              pages.push(newPage.id);
              nullRefTags.push({ name: '__rbac', values: ['nomMgmt']});
              getPage(newPage.id).then(result => {
                expect(result.status).to.equal(200);
                expect(result.body.data.title).to.be.equal(newPage.title);
                expect(result.body.title).to.be.equal(undefined);
                done();
              }).catch(done);
            }).catch(done);
          }).catch(done);
        });
      });
    }).catch(done);
  });
});

describe('Page any group permission', () => {
  const testUser = 'rbacTester';
  const testPassword = 'rbacTester';
  let roles = [];
  let pages = [];
  let nullRefTags = [];

  beforeEach(done => {
    roles = [];
    pages = [];
    nullRefTags = [];
    shared.login(request, loginURL, superAdmin, superAdminPassword, done);
  });

  afterEach(done => {
    const pagePromises = [];
    const rolePromises = [];
    const nullRefTagsPromises = [];
    shared.logout(request, () => {
      shared.login(request, loginURL, superAdmin, superAdminPassword, () => {
        nullRefTags.forEach(nullRefTag => {
          nullRefTagsPromises.push(deleteTagByValue(nullRefTag.name, nullRefTag.value));
        });
        Promise.all(nullRefTagsPromises).then(() => {
          pages.forEach(pageId => {
            pagePromises.push(deletePage(pageId));
            pagePromises.push(deleteTag(pageId));
          });
          Promise.all(pagePromises).then(() => {
            roles.forEach(roleId => {
              rolePromises.push(deleteRole(roleId));
            });
            Promise.all(rolePromises).then(() => {
              shared.logout(request, done);
            }).catch(error => {
              console.log(error);
            });
          });
        });
      });
    });
  });

  it('should be able to view page of specific group with view permission of MemberOfAnyGroup', done => {
    const role = {
      name: 'rbac_tester',
      description: 'Test role for foundation',
      permission: [{
        // eslint-disable-next-line camelcase
        operation_key: 'View',
        // eslint-disable-next-line camelcase
        resource_key: 'default_action<>MemberOfAnyGroup'
      }]
    };

    const mockPage = {
      ...mockData.page,
      id: 'roletest',
      title: 'role test'
    };

    mockPage.tags = [{
      name: '__rbac', values: ['nom']
    }];
    createRole(role).then(res => {
      assert.equal(res.status, 200, 'Role creation');
      expect(res.body.role).to.not.equal(null);
      expect(res.body.role.name).to.equal('rbac_tester');
      roles.push(res.body.role.id);
      createPage(mockPage).then(createdPage => {
        assert.equal(createdPage.status, 200, 'Page creation');
        expect(createdPage.body[0]).to.equal(undefined);
        expect(createdPage.body.data[0].id).to.be.equal(mockPage.id);
        pages.push(mockPage.id);
        nullRefTags.push({ name: '__rbac', value: 'nom' });
        shared.logout(request, () => {
          shared.login(request, loginURL, testUser, testPassword, () => {
            getPage(mockPage.id).then(result => {
              assert.equal(result.status, 200, 'Retrieve page');
              expect(result.status).to.equal(200);
              expect(result.body.error).to.be.equal(false);
              done();
            }).catch(done);
          });
        });
      }).catch(done);
    }).catch(done);
  });

  it('should not update page of specific group with view permission of MemberOfAnyGroup', done => {
    // eslint-disable-next-line no-unused-vars
    const role = {
      name: 'rbac_tester',
      description: 'Test role for foundation',
      permission: [{
        // eslint-disable-next-line camelcase
        operation_key: 'View',
        // eslint-disable-next-line camelcase
        resource_key: 'default_action<>MemberOfAnyGroup'
      }]
    };

    const mockPage = {
      ...mockData.page,
      id: 'roletest',
      title: 'role test',
      tags: [{ name: '__rbac', values: ['nomMgmt', 'dca', 'operators']}]
    };
    createRole(role).then(res => {
      expect(res.status).to.equal(200);
      expect(res.body.role).to.not.equal(null);
      expect(res.body.role.name).to.equal('rbac_tester');
      roles.push(res.body.role.id);
      createPage(mockPage).then(createdPage => {
        expect(createdPage.status).to.equal(200);
        expect(createdPage.body.data[0].title).to.be.equal(mockPage.title);
        expect(createdPage.body.title).to.be.equal(undefined);
        pages.push(mockPage.id);
        nullRefTags.push({ name: '__rbac', value: 'nomMgmt' });
        nullRefTags.push({ name: '__rbac', value: 'dca' });
        nullRefTags.push({ name: '__rbac', value: 'operators' });
        shared.logout(request, () => {
          shared.login(request, loginURL, testUser, testPassword, () => {
            getPage(mockPage.id).then(result => {
              expect(result.status).to.equal(200);
              expect(result.body.data.title).to.be.equal(mockPage.title);
              expect(result.body.title).to.be.equal(undefined);
              updatePage(mockPage).then(updatedPage => {
                expect(updatedPage.status).to.equal(401);
                expect(updatedPage.body.error).to.equal(true);
                done();
              }).catch(done);
            }).catch(done);
          });
        });
      }).catch(done);
    });
  });

  it('Modify and MemberOfAnyGroup', done => {
    const role = {
      name: 'rbac_tester',
      description: 'Test role for foundation',
      permission: [{
        // eslint-disable-next-line camelcase
        operation_key: 'Modify',
        // eslint-disable-next-line camelcase
        resource_key: 'default_action<>MemberOfAnyGroup'
      }]
    };

    const mockPage = {
      ...mockData.page,
      id: 'roletest',
      title: 'role test',
      tags: [{ name: '__rbac', values: ['nomMgmt', 'dca', 'operators']}]
    };

    createRole(role).then(res => {
      expect(res.status).to.equal(200);
      expect(res.body.role).to.not.equal(null);
      expect(res.body.role.name).to.equal('rbac_tester');
      roles.push(res.body.role.id);
      createPage(mockPage).then(createdPage => {
        expect(createdPage.status).to.equal(200);
        expect(createdPage.body.data[0].title).to.be.equal(mockPage.title);
        expect(createdPage.body.title).to.be.equal(undefined);
        pages.push(mockPage.id);
        nullRefTags.push({ name: '__rbac', value: 'nomMgmt' });
        nullRefTags.push({ name: '__rbac', value: 'dca' });
        nullRefTags.push({ name: '__rbac', value: 'operators' });
        shared.logout(request, () => {
          shared.login(request, loginURL, testUser, testPassword, () => {
            const mockPageUpdated = {
              ...mockData.page,
              id: 'roletest',
              title: 'role test updated'
            };
            updatePage(mockPageUpdated).then(result => {
              expect(result.status).to.equal(200);
              expect(result.body.data.title).to.be.equal(mockPageUpdated.title);
              expect(result.body.title).to.be.equal(undefined);
              done();
            }).catch(done);
          });
        });
      }).catch(done);
    });
  });

  it('should be able to modify and delete a page of a specific group with modify and delete permission of MemberOfAnyGroup', done => {
    const role = {
      name: 'rbac_tester',
      description: 'Test role for foundation',
      permission: [{
        // eslint-disable-next-line camelcase
        operation_key: 'Delete',
        // eslint-disable-next-line camelcase
        resource_key: 'default_action<>MemberOfAnyGroup'
      },
      {
        // eslint-disable-next-line camelcase
        operation_key: 'Modify',
        // eslint-disable-next-line camelcase
        resource_key: 'default_action<>MemberOfAnyGroup'
      }]
    };

    const mockPage = {
      ...mockData.page,
      id: 'roletest',
      title: 'role test',
      tags: [{ name: '__rbac', values: ['nomMgmt']}]
    };

    createRole(role).then(res => {
      expect(res.status).to.equal(200);
      expect(res.body.role).to.not.equal(null);
      expect(res.body.role.name).to.equal('rbac_tester');
      roles.push(res.body.role.id);
      createPage(mockPage).then(createdPage => {
        expect(createdPage.status).to.equal(200);
        expect(createdPage.body.data[0].title).to.be.equal(mockPage.title);
        expect(createdPage.body.title).to.be.equal(undefined);
        pages.push(mockPage.id);
        nullRefTags.push({ name: '__rbac', value: 'nomMgmt' });
        shared.logout(request, () => {
          shared.login(request, loginURL, testUser, testPassword, () => {
            const mockPageUpdated = {
              ...mockData.page,
              id: 'roletest',
              title: 'role test updated'
            };
            updatePage(mockPageUpdated).then(result => {
              expect(result.status).to.equal(200);
              expect(result.body.data.title).to.be.equal(mockPageUpdated.title);
              expect(result.body.title).to.be.equal(undefined);
              deletePage(mockPageUpdated.id).then(deletedPage => {
                expect(deletedPage.status).to.equal(200);
                expect(deletedPage.body.error).to.equal(false);
                pages.pop();
                done();
              }).catch(done);
            }).catch(done);
          });
        });
      }).catch(done);
    });
  });

  it('should not create a page of a specific group with AssignPages permission of MemberOfAnyGroup', done => {
    const role = {
      name: 'rbac_tester',
      description: 'Test role for foundation',
      permission: [{
        // eslint-disable-next-line camelcase
        operation_key: 'AssignPages',
        // eslint-disable-next-line camelcase
        resource_key: 'default_action<>MemberOfAnyGroup'
      }]
    };

    const mockPage = {
      ...mockData.page,
      id: 'roletest',
      title: 'role test',
      tags: [{ name: '__rbac', values: ['nomMgmt']}]
    };

    createRole(role).then(res => {
      expect(res.status).to.equal(200);
      expect(res.body.role).to.not.equal(null);
      expect(res.body.role.name).to.equal('rbac_tester');
      roles.push(res.body.role.id);
      shared.logout(request, () => {
        shared.login(request, loginURL, testUser, testPassword, () => {
          // cannot create a page
          createPage(mockPage).then(createdPage => {
            expect(createdPage.status).to.equal(401);
            expect(createdPage.body.error).to.equal(true);
            done();
          }).catch(done);
        });
      });
    });
  });

  it('should not update a page of a specific group with AssignPages permission of MemberOfAnyGroup', done => {
    const role = {
      name: 'rbac_tester',
      description: 'Test role for foundation',
      permission: [{
        // eslint-disable-next-line camelcase
        operation_key: 'AssignPages',
        // eslint-disable-next-line camelcase
        resource_key: 'default_action<>MemberOfAnyGroup'
      }]
    };

    const mockPage = {
      ...mockData.page,
      id: 'roletest',
      title: 'role test',
      tags: [{ name: '__rbac', values: ['nomMgmt']}]
    };

    createRole(role).then(res => {
      expect(res.status).to.equal(200);
      expect(res.body.role).to.not.equal(null);
      expect(res.body.role.name).to.equal('rbac_tester');
      roles.push(res.body.role.id);
      createPage(mockPage).then(createdPage => {
        expect(createdPage.status).to.equal(200);
        expect(createdPage.body.data[0].title).to.be.equal(mockPage.title);
        expect(createdPage.body.title).to.be.equal(undefined);
        pages.push(mockPage.id);
        nullRefTags.push({ name: '__rbac', value: 'nomMgmt' });
        shared.logout(request, () => {
          shared.login(request, loginURL, testUser, testPassword, () => {
            const mockPageUpdated = {
              ...mockData.page,
              id: 'roletest',
              title: 'role test no group',
              tags: []
            };
            // cannot update a page
            updatePage(mockPageUpdated).then(updatedPage => {
              expect(updatedPage.status).to.equal(401);
              expect(updatedPage.body.error).to.equal(true);
              done();
            }).catch(done);
          });
        });
      });
    });
  });

  it('should be able to create a page of specific group and tags with FullControl permission of MemberOfAnyGroup', done => {
    const role = {
      name: 'rbac_tester',
      description: 'Test role for foundation',
      permission: [{
        // eslint-disable-next-line camelcase
        operation_key: 'FullControl',
        // eslint-disable-next-line camelcase
        resource_key: 'default_action<>MemberOfAnyGroup'
      }]
    };

    const mockPage = {
      ...mockData.page,
      id: 'roletest',
      title: 'role test',
      tags: [{ name: '__rbac', values: ['nomMgmt']}]
    };

    createRole(role).then(res => {
      expect(res.status).to.equal(200);
      expect(res.body.role).to.not.equal(null);
      expect(res.body.role.name).to.equal('rbac_tester');
      roles.push(res.body.role.id);
      createNullRefTags().then(() => {
        shared.logout(request, () => {
          shared.login(request, loginURL, testUser, testPassword, () => {
            createPage(mockPage).then(createdPage => {
              expect(createdPage.status).to.equal(200);
              expect(createdPage.body.data[0].title).to.be.equal(mockPage.title);
              expect(createdPage.body.title).to.be.equal(undefined);
              pages.push(mockPage.id);
              nullRefTags.push({ name: '__rbac', value: 'nomMgmt' });
              const tag = { ref: 'roletest', refType: 'page', name: '__rbac', value: 'myTest' };
              request
                .post(apiTag)
                .set('X-Secure-Modify-Token', shared.secureModifyToken())
                .send(tag)
                .end((err, tagRes) => {
                  if (err) {
                    return done(err);
                  }
                  expect(tagRes.status).to.equal(200);
                  expect(tagRes.body.data[0].value).to.be.eq(tag.value);
                  return done();
                });
            }).catch(done);
          });
        });
      });
    });
  });
});

describe('Page specific group permission', () => {
  const testUser = 'rbacTester';
  const testPassword = 'rbacTester';
  let roles = [];
  let pages = [];
  let nullRefTags = [];

  beforeEach(done => {
    roles = [];
    pages = [];
    nullRefTags = [];
    shared.login(request, loginURL, superAdmin, superAdminPassword, done);
  });

  afterEach(done => {
    const pagePromises = [];
    const rolePromises = [];
    const nullRefTagsPromises = [];
    shared.logout(request, () => {
      shared.login(request, loginURL, superAdmin, superAdminPassword, () => {
        nullRefTags.forEach(nullRefTag => {
          nullRefTagsPromises.push(deleteTagByValue(nullRefTag.name, nullRefTag.value));
        });
        Promise.all(nullRefTagsPromises).then(() => {
          pages.forEach(pageId => {
            pagePromises.push(deletePage(pageId));
            pagePromises.push(deleteTag(pageId));
          });
          Promise.all(pagePromises).then(() => {
            roles.forEach(roleId => {
              rolePromises.push(deleteRole(roleId));
            });
            Promise.all(rolePromises).then(() => {
              shared.logout(request, done);
            }).catch(error => {
              console.log(error);
            });
          });
        });
      });
    });
  });

  it('Cannot view specific group pages', done => {
    const role = {
      name: 'rbac_tester',
      description: 'Test role for foundation',
      permission: [{
        // eslint-disable-next-line camelcase
        operation_key: 'View',
        // eslint-disable-next-line camelcase
        resource_key: 'default_action<>Group-Operators'
      }]
    };

    const mockPage = {
      ...mockData.page,
      id: 'roletest',
      title: 'role test',
      tags: [{ name: '__rbac', values: ['nomMgmt']}]
    };

    createRole(role).then(res => {
      expect(res.status).to.equal(200);
      expect(res.body.role).to.not.equal(null);
      expect(res.body.role.name).to.equal('rbac_tester');
      roles.push(res.body.role.id);
      createPage(mockPage).then(createdPage => {
        expect(createdPage.status).to.equal(200);
        expect(createdPage.body.data[0].id).to.be.equal(mockPage.id);
        expect(createdPage.body[0]).to.be.equal(undefined);
        pages.push(mockPage.id);
        nullRefTags.push({ name: '__rbac', value: 'nomMgmt' });
        shared.logout(request, () => {
          shared.login(request, loginURL, testUser, testPassword, () => {
            getPage(mockPage.id).then(result => {
              expect(result.status).to.equal(401);
              expect(result.body.error).to.equal(true);
              done();
            }).catch(done);
          });
        });
      }).catch(done);
    }).catch(done);
  });

  it('Cannot modify a page of specific group with view permission', done => {
    const role = {
      name: 'rbac_tester',
      description: 'Test role for foundation',
      permission: [{
        // eslint-disable-next-line camelcase
        operation_key: 'View',
        // eslint-disable-next-line camelcase
        resource_key: 'default_action<>Group-Operators'
      }]
    };

    const mockPage = {
      ...mockData.page,
      id: 'roletest',
      title: 'role test',
      tags: [{ name: '__rbac', values: ['nomMgmt', 'dca', 'Operators']}]
    };

    createRole(role).then(roleResp => {
      expect(roleResp.status).to.equal(200);
      expect(roleResp.body.role).to.not.equal(null);
      expect(roleResp.body.role.name).to.equal('rbac_tester');
      roles.push(roleResp.body.role.id);
      createPage(mockPage).then(res => {
        expect(res.status).to.equal(200);
        pages.push(mockPage.id);
        nullRefTags.push({ name: '__rbac', value: 'nomMgmt' });
        nullRefTags.push({ name: '__rbac', value: 'dca' });
        nullRefTags.push({ name: '__rbac', value: 'Operators' });
        shared.logout(request, () => {
          shared.login(request, loginURL, testUser, testPassword, () => {
            getPage(mockPage.id).then(result => {
              expect(result.status).to.equal(200);
              expect(result.body.data.title).to.be.equal(mockPage.title);
              expect(result.body.title).to.be.equal(undefined);
              updatePage(mockPage).then(updatedPage => {
                expect(updatedPage.status).to.equal(401);
                expect(updatedPage.body.error).to.equal(true);
                done();
              }).catch(done);
            }).catch(done);
          });
        });
      }).catch(done);
    }).catch(done);
  });

  it('View using specific group when page has more group than user and cannot delete the page', done => {
    const role = {
      name: 'rbac_tester',
      description: 'Test role for foundation',
      permission: [{
        // eslint-disable-next-line camelcase
        operation_key: 'View',
        // eslint-disable-next-line camelcase
        resource_key: 'default_action<>Group-Operators'
      }]
    };

    const mockPage = {
      ...mockData.page,
      id: 'roletest',
      title: 'role test',
      tags: [{ name: '__rbac', values: ['nomMgmt', 'Operators', 'dca']}]
    };

    createRole(role).then(roleResp => {
      expect(roleResp.status).to.equal(200);
      expect(roleResp.body.role).to.not.equal(null);
      expect(roleResp.body.role.name).to.equal('rbac_tester');
      roles.push(roleResp.body.role.id);
      createPage(mockPage).then(res => {
        expect(res.status).to.equal(200);
        pages.push(mockPage.id);
        nullRefTags.push({ name: '__rbac', value: 'nomMgmt' });
        nullRefTags.push({ name: '__rbac', value: 'dca' });
        nullRefTags.push({ name: '__rbac', value: 'Operators' });
        shared.logout(request, () => {
          shared.login(request, loginURL, testUser, testPassword, () => {
            getPage(mockPage.id).then(result => {
              expect(result.status).to.equal(200);
              expect(result.body.data.title).to.be.equal(mockPage.title);
              expect(result.body.title).to.be.equal(undefined);
              deletePage(mockPage.id).then(deletedPage => {
                expect(deletedPage.status).to.equal(401);
                expect(deletedPage.body.error).to.equal(true);
                done();
              }).catch(done);
            }).catch(done);
          });
        });
      }).catch(done);
    }).catch(done);
  });

  it('Delete using specific group when page has more group than user', done => {
    const role = {
      name: 'rbac_tester',
      description: 'Test role for foundation',
      permission: [{
        // eslint-disable-next-line camelcase
        operation_key: 'Delete',
        // eslint-disable-next-line camelcase
        resource_key: 'default_action<>Group-Operators'
      }]
    };

    const mockPage = {
      ...mockData.page,
      id: 'roletest',
      title: 'role test',
      tags: [{ name: '__rbac', values: ['nomMgmt', 'Operators', 'dca']}]
    };

    createRole(role).then(roleResp => {
      expect(roleResp.status).to.equal(200);
      expect(roleResp.body.role).to.not.equal(null);
      expect(roleResp.body.role.name).to.equal('rbac_tester');
      roles.push(roleResp.body.role.id);
      createPage(mockPage).then(res => {
        expect(res.status).to.equal(200);
        expect(res.body.error).to.equal(false);
        pages.push(mockPage.id);
        nullRefTags.push({ name: '__rbac', value: 'nomMgmt' });
        nullRefTags.push({ name: '__rbac', value: 'dca' });
        nullRefTags.push({ name: '__rbac', value: 'Operators' });
        shared.logout(request, () => {
          shared.login(request, loginURL, testUser, testPassword, () => {
            getPage(mockPage.id).then(result => {
              expect(result.status).to.equal(401);
              expect(result.body.error).to.equal(true);
              deletePage(mockPage.id).then(deletedPage => {
                expect(deletedPage.status).to.equal(401);
                expect(deletedPage.body.error).to.equal(true);
                done();
              }).catch(done);
            }).catch(done);
          });
        });
      }).catch(done);
    }).catch(done);
  });

  it('Cannot delete using AssingPage privilege when page has more group than user', done => {
    const role = {
      name: 'rbac_tester',
      description: 'Test role for foundation',
      permission: [{
        // eslint-disable-next-line camelcase
        operation_key: 'AssignPages',
        // eslint-disable-next-line camelcase
        resource_key: 'default_action<>Group-Operators'
      }]
    };

    const mockPage = {
      ...mockData.page,
      id: 'roletest',
      title: 'role test',
      tags: [{ name: '__rbac', values: ['nomMgmt', 'Operators', 'dca']}]
    };

    createRole(role).then(roleResp => {
      expect(roleResp.status).to.equal(200);
      expect(roleResp.body.role).to.not.equal(null);
      expect(roleResp.body.role.name).to.equal('rbac_tester');
      roles.push(roleResp.body.role.id);
      createPage(mockPage).then(res => {
        expect(res.status).to.equal(200);
        expect(res.body.error).to.equal(false);
        pages.push(mockPage.id);
        nullRefTags.push({ name: '__rbac', value: 'nomMgmt' });
        nullRefTags.push({ name: '__rbac', value: 'dca' });
        nullRefTags.push({ name: '__rbac', value: 'Operators' });
        shared.logout(request, () => {
          shared.login(request, loginURL, testUser, testPassword, () => {
            getPage(mockPage.id).then(result => {
              expect(result.status).to.equal(401);
              expect(result.body.error).to.equal(true);
              deletePage(mockPage.id).then(deletedPage => {
                expect(deletedPage.status).to.equal(401);
                expect(deletedPage.body.error).to.equal(true);
                done();
              }).catch(done);
            }).catch(done);
          });
        });
      }).catch(done);
    }).catch(done);
  });

  it('Delete using FullControl privilege when page has more group than user', done => {
    const role = {
      name: 'rbac_tester',
      description: 'Test role for foundation',
      permission: [{
        // eslint-disable-next-line camelcase
        operation_key: 'FullControl',
        // eslint-disable-next-line camelcase
        resource_key: 'default_action<>Group-Operators'
      }]
    };

    const mockPage = {
      ...mockData.page,
      id: 'roletest',
      title: 'role test',
      tags: [{ name: '__rbac', values: ['nomMgmt', 'dca', 'Operators']}]
    };

    createRole(role).then(roleResp => {
      expect(roleResp.status).to.equal(200);
      expect(roleResp.body.role).to.not.equal(null);
      expect(roleResp.body.role.name).to.equal('rbac_tester');
      roles.push(roleResp.body.role.id);
      createPage(mockPage).then(res => {
        expect(res.status).to.equal(200);
        expect(res.body.error).to.equal(false);
        pages.push(mockPage.id);
        nullRefTags.push({ name: '__rbac', value: 'nomMgmt' });
        nullRefTags.push({ name: '__rbac', value: 'dca' });
        nullRefTags.push({ name: '__rbac', value: 'Operators' });
        shared.logout(request, () => {
          shared.login(request, loginURL, testUser, testPassword, () => {
            getPage(mockPage.id).then(result => {
              expect(result.status).to.equal(200);
              expect(result.body.error).to.equal(false);
              deletePage(mockPage.id).then(deletedPage => {
                expect(deletedPage.status).to.equal(200);
                expect(deletedPage.body.error).to.equal(false);
                pages.pop();
                done();
              }).catch(done);
            }).catch(done);
          });
        });
      }).catch(done);
    }).catch(done);
  });

  it('Modify a page of a specific group', done => {
    const role = {
      name: 'rbac_tester',
      description: 'Test role for foundation',
      permission: [{
        // eslint-disable-next-line camelcase
        operation_key: 'Modify',
        // eslint-disable-next-line camelcase
        resource_key: 'default_action<>Group-Operators'
      }]
    };

    const tagValues = ['Operators'];
    const mockPage = {
      ...mockData.page,
      id: 'roletest',
      title: 'role test',
      tags: [{ name: '__rbac', values: tagValues }]
    };

    createRole(role).then(roleResp => {
      expect(roleResp.status).to.equal(200);
      expect(roleResp.body.role).to.not.equal(null);
      expect(roleResp.body.role.name).to.equal('rbac_tester');
      roles.push(roleResp.body.role.id);
      shared.logout(request, () => {
        shared.login(request, loginURL, testUser, testPassword, () => {
          createPage(mockPage).then(pageResp => {
            expect(pageResp.status).to.equal(401);
            expect(pageResp.body.error).to.equal(true);
            shared.logout(request, () => {
              shared.login(request, loginURL, superAdmin, superAdminPassword, () => {
                createPage(mockPage).then(createdPage => {
                  expect(createdPage.status).to.equal(200);
                  expect(createdPage.body.error).to.equal(false);
                  pages.push(mockPage.id);
                  nullRefTags.push({ name: '__rbac', value: 'Operators' });
                  const newPage = {
                    ...mockData.page,
                    id: 'roletest',
                    title: 'role test modified'
                  };
                  shared.logout(request, () => {
                    shared.login(request, loginURL, testUser, testPassword, () => {
                      updatePage(newPage).then(updatedResult => {
                        expect(updatedResult.status).to.equal(200);
                        expect(updatedResult.body.error).to.equal(false);
                        done();
                      }).catch(done);
                    });
                  });
                }).catch(done);
              });
            });
          }).catch(done);
        });
      });
    }).catch(done);
  });

  it('Delete and modify permission on page of a specific group', done => {
    const role = {
      name: 'rbac_tester',
      description: 'Test role for foundation',
      permission: [{
        // eslint-disable-next-line camelcase
        operation_key: 'Delete',
        // eslint-disable-next-line camelcase
        resource_key: 'default_action<>Group-Operators'
      },
      {
        // eslint-disable-next-line camelcase
        operation_key: 'Modify',
        // eslint-disable-next-line camelcase
        resource_key: 'default_action<>Group-Operators'
      }]
    };

    const mockPage = {
      ...mockData.page,
      id: 'roletest',
      title: 'role test',
      tags: [{ name: '__rbac', values: ['Operators']}]
    };

    createRole(role).then(roleResp => {
      expect(roleResp.status).to.equal(200);
      expect(roleResp.body.role).to.not.equal(null);
      expect(roleResp.body.role.name).to.equal('rbac_tester');
      roles.push(roleResp.body.role.id);
      shared.logout(request, () => {
        shared.login(request, loginURL, testUser, testPassword, () => {
          createPage(mockPage).then(pageResp => {
            expect(pageResp.status).to.equal(401);
            expect(pageResp.body.error).to.equal(true);
            shared.logout(request, () => {
              shared.login(request, loginURL, superAdmin, superAdminPassword, () => {
                createPage(mockPage).then(createdPage => {
                  expect(createdPage.status).to.equal(200);
                  expect(createdPage.body.error).to.equal(false);
                  pages.push(mockPage.id);
                  nullRefTags.push({ name: '__rbac', value: 'Operators' });
                  const newPage = {
                    ...mockData.page,
                    id: 'roletest',
                    title: 'role test modified'
                  };
                  shared.logout(request, () => {
                    shared.login(request, loginURL, testUser, testPassword, () => {
                      getPage(newPage.id).then(getpage => {
                        expect(getpage.status).to.equal(401);
                        expect(getpage.body.error).to.equal(true);
                        updatePage(newPage).then(modifiedResult => {
                          expect(modifiedResult.status).to.equal(200);
                          expect(modifiedResult.body.error).to.equal(false);
                          deletePage(newPage.id).then(deletedRes => {
                            expect(deletedRes.status).to.equal(200);
                            expect(deletedRes.body.error).to.equal(false);
                            pages.pop();
                            done();
                          }).catch(done);
                        }).catch(done);
                      }).catch(done);
                    });
                  });
                }).catch(done);
              });
            });
          }).catch(done);
        });
      });
    }).catch(done);
  });

  it('AssignPages permission on a page of a specific group', done => {
    const role = {
      name: 'rbac_tester',
      description: 'Test role for foundation',
      permission: [{
        // eslint-disable-next-line camelcase
        operation_key: 'AssignPages',
        // eslint-disable-next-line camelcase
        resource_key: 'default_action<>Group-nomMgmt'
      }]
    };

    const mockPage = {
      ...mockData.page,
      id: 'roletest',
      title: 'role test',
      tags: [{ name: '__rbac', values: ['nomMgmt']}]
    };

    createRole(role).then(roleResp => {
      expect(roleResp.status).to.equal(200);
      expect(roleResp.body.role).to.not.equal(null);
      expect(roleResp.body.role.name).to.equal('rbac_tester');
      roles.push(roleResp.body.role.id);
      shared.logout(request, () => {
        shared.login(request, loginURL, testUser, testPassword, () => {
          createPage(mockPage).then(pageResp => {
            expect(pageResp.status).to.equal(401);
            expect(pageResp.body.error).to.equal(true);
            done();
          }).catch(done);
        });
      });
    }).catch(done);
  });

  it('AssignPages and specific group where one is not permitted', done => {
    const role = {
      name: 'rbac_tester',
      description: 'Test role for foundation',
      permission: [
        {
        // eslint-disable-next-line camelcase
          operation_key: 'AssignPages',
          // eslint-disable-next-line camelcase
          resource_key: 'default_action<>Group-Operators'
        }
      ]
    };

    const mockPage = {
      ...mockData.page,
      id: 'roletest',
      title: 'role test',
      tags: [{ name: '__rbac', values: ['nomMgmt']}]
    };

    createRole(role).then(roleResp => {
      expect(roleResp.status).to.equal(200);
      expect(roleResp.body.role).to.not.equal(null);
      expect(roleResp.body.role.name).to.equal('rbac_tester');
      roles.push(roleResp.body.role.id);
      shared.logout(request, () => {
        shared.login(request, loginURL, testUser, testPassword, () => {
          createPage(mockPage).then(pageResp => {
            expect(pageResp.status).to.equal(401);
            expect(pageResp.body.error).to.equal(true);
            shared.logout(request, () => {
              shared.login(request, loginURL, superAdmin, superAdminPassword, () => {
                createPage(mockPage).then(newpage => {
                  expect(newpage.status).to.equal(200);
                  expect(newpage.body.error).to.equal(false);
                  pages.push(mockPage.id);
                  nullRefTags.push({ name: '__rbac', value: 'nomMgmt' });
                  const newPage = {
                    ...mockData.page,
                    id: 'roletest',
                    title: 'role test modified'
                  };
                  shared.logout(request, () => {
                    shared.login(request, loginURL, testUser, testPassword, () => {
                      updatePage(newPage).then(updateResp => {
                        expect(updateResp.status).to.equal(401);
                        expect(updateResp.body.error).to.equal(true);
                        done();
                      }).catch(done);
                    });
                  });
                }).catch(done);
              });
            });
          }).catch(done);
        });
      });
    }).catch(done);
  });

  it('FullControl permission on a page of a specific group', done => {
    const role = {
      name: 'rbac_tester',
      description: 'Test role for foundation',
      permission: [{
        // eslint-disable-next-line camelcase
        operation_key: 'FullControl',
        // eslint-disable-next-line camelcase
        resource_key: 'default_action<>Group-Operators'
      }]
    };

    const mockPage = {
      ...mockData.page,
      id: 'roletest',
      title: 'role test',
      tags: [{ name: '__rbac', values: ['nomMgmt']}]
    };

    createRole(role).then(roleResp => {
      expect(roleResp.status).to.equal(200);
      expect(roleResp.body.role).to.not.equal(null);
      expect(roleResp.body.role.name).to.equal('rbac_tester');
      roles.push(roleResp.body.role.id);
      shared.logout(request, () => {
        shared.login(request, loginURL, testUser, testPassword, () => {
          createPage(mockPage).then(createdPage => {
            expect(createdPage.status).to.equal(401);
            expect(createdPage.body.error).to.equal(true);
            mockPage.tags = [{ name: '__rbac', values: ['Operators']}];
            createPage(mockPage).then(createRes => {
              expect(createRes.status).to.equal(200);
              expect(createRes.body.error).to.equal(false);
              pages.push(mockPage.id);
              deletePage(mockPage.id).then(deleteResp => {
                expect(deleteResp.status).to.equal(200);
                expect(deleteResp.body.error).to.equal(false);
                pages.pop();
                done();
              }).catch(done);
            }).catch(done);
          }).catch(done);
        });
      });
    }).catch(done);
  });

  it('Create permission on a page of specific group', done => {
    const mockPage = {
      ...mockData.page,
      id: 'roletest',
      title: 'role test any group',
      tags: [{ name: '__rbac', values: ['nomMgmt']}]
    };
    const role = {
      name: 'rbac_tester',
      description: 'View role for foundation',
      permission: [{
        // eslint-disable-next-line camelcase
        operation_key: 'Create',
        // eslint-disable-next-line camelcase
        resource_key: 'default_action<>Group-nomMgmt'
      }]
    };

    createRole(role).then(roleResp => {
      assert.equal(roleResp.status, 200, 'Role creation');
      expect(roleResp.body.role).to.not.equal(null);
      expect(roleResp.body.role.name).to.equal('rbac_tester');
      roles.push(roleResp.body.role.id);
      shared.logout(request, () => {
        shared.login(request, loginURL, testUser, testPassword, () => {
          createPage(mockPage).then(createRes => {
            assert.equal(createRes.status, 401, 'Page creation');
            expect(createRes.body.error).to.equal(true);
            getPage(mockPage.id).then(pageResp => {
              assert.equal(pageResp.status, 404, 'get Page');
              expect(pageResp.body.error).to.equal(true);
              done();
            }).catch(done);
          }).catch(done);
        });
      });
    }).catch(done);
  });
});

describe('More page operation test', () => {
  const testUser = 'rbacTester';
  const testPassword = 'rbacTester';
  let roles = [];
  let pages = [];
  let nullRefTags = [];

  beforeEach(done => {
    roles = [];
    pages = [];
    nullRefTags = [];
    shared.login(request, loginURL, superAdmin, superAdminPassword, done);
  });

  afterEach(done => {
    const pagePromises = [];
    const rolePromises = [];
    const nullRefTagsPromises = [];
    shared.logout(request, () => {
      shared.login(request, loginURL, superAdmin, superAdminPassword, () => {
        nullRefTags.forEach(nullRefTag => {
          nullRefTagsPromises.push(deleteTagByValue(nullRefTag.name, nullRefTag.value));
        });
        Promise.all(nullRefTagsPromises).then(() => {
          pages.forEach(pageId => {
            pagePromises.push(deletePage(pageId));
            pagePromises.push(deleteTag(pageId));
          });
          Promise.all(pagePromises).then(() => {
            roles.forEach(roleId => {
              rolePromises.push(deleteRole(roleId));
            });
            Promise.all(rolePromises).then(() => {
              shared.logout(request, done);
            }).catch(error => {
              console.log(error);
            });
          });
        });
      });
    });
  });

  it('Check greedy with conflicting permission', done => {
    const role = {
      name: 'rbac_tester',
      description: 'Test role for foundation',
      permission: [{
        // eslint-disable-next-line camelcase
        operation_key: 'AssignPages',
        // eslint-disable-next-line camelcase
        resource_key: 'default_action<>MemberOfNoGroup'
      },
      {
        // eslint-disable-next-line camelcase
        operation_key: 'Create',
        // eslint-disable-next-line camelcase
        resource_key: 'default_action<>All'
      },
      {
        // eslint-disable-next-line camelcase
        operation_key: 'AssignPages',
        // eslint-disable-next-line camelcase
        resource_key: 'default_action<>Group-Operators2'
      }]
    };
    const mockPage = {
      ...mockData.page,
      id: 'roletest',
      title: 'role test',
      tags: [{ name: '__rbac', values: ['Operators2']}]
    };

    createRole(role).then(createdRole => {
      assert.equal(createdRole.status, 200, 'Role creation');
      roles.push(createdRole.body.role.id);
      createNullRefRBACTag('Operators2').then(createdTags => {
        assert.equal(createdTags.status, 200, 'Null ref tag creation');
        expect(createdTags.body.error).to.equal(false);
        nullRefTags.push({ name: '__rbac', value: 'Operators2' });
        shared.logout(request, () => {
          shared.login(request, loginURL, testUser, testPassword, () => {
            createPage(mockPage).then(createdPage => {
              assert.equal(createdPage.status, 200, 'Page creation');
              expect(createdPage.body.error).to.equal(false);
              pages.push(mockPage.id);
              return done();
            }).catch(done);
          });
        });
      }).catch(done);
    }).catch(done);
  });

  it('Check greedy with conflicting permission and more page', done => {
    const role = {
      name: 'rbac_tester',
      description: 'Test role for foundation',
      permission: [{
        // eslint-disable-next-line camelcase
        operation_key: 'AssignPages',
        // eslint-disable-next-line camelcase
        resource_key: 'default_action<>MemberOfNoGroup'
      },
      {
        // eslint-disable-next-line camelcase
        operation_key: 'AssignPages',
        // eslint-disable-next-line camelcase
        resource_key: 'default_action<>Group-Operators3'
      },
      {
        // eslint-disable-next-line camelcase
        operation_key: 'Create',
        // eslint-disable-next-line camelcase
        resource_key: 'default_action<>All'
      },
      {
        // eslint-disable-next-line camelcase
        operation_key: 'AssignPages',
        // eslint-disable-next-line camelcase
        resource_key: 'default_action<>Group-nomMgmt3'
      }]
    };

    const mockPage = {
      ...mockData.page,
      id: 'roletest',
      title: 'role test',
      tags: [{ name: '__rbac', values: ['Operators']}]
    };
    const mockPage2 = {
      ...mockData.page,
      id: 'roletest2',
      title: 'role test nom',
      tags: [{ name: '__rbac', values: ['nomMgmt']}]
    };
    const page = [mockPage, mockPage2];
    createRole(role).then(createdRole => {
      assert.equal(createdRole.status, 200, 'Role creation');
      roles.push(createdRole.body.role.id);
      createNullRefRBACTag('Operators3').then(createdTags => {
        assert.equal(createdTags.status, 200, 'Null ref tag Operators creation');
        expect(createdTags.body.error).to.equal(false);
        nullRefTags.push({ name: '__rbac', value: 'Operators3' });
        createNullRefRBACTag('nomMgmt3').then(createdTagRes => {
          assert.equal(createdTagRes.status, 200, 'Null ref tag nomMgnt creation');
          expect(createdTagRes.body.error).to.equal(false);
          nullRefTags.push({ name: '__rbac', value: 'nomMgmt3' });
          shared.logout(request, () => {
            shared.login(request, loginURL, testUser, testPassword, () => {
              createPage(page).then(createdPage => {
                assert.equal(createdPage.status, 200, 'Creation of 2 pages');
                expect(createdPage.body.error).to.equal(false);
                pages.push(mockPage.id);
                pages.push(mockPage2.id);
                return done();
              }).catch(done);
            });
          });
        }).catch(done);
      }).catch(done);
    }).catch(done);
  });

  it('Create a user with Page View permission for default_action<>MemberOfNoGroup', done => {
    const role = {
      name: 'rbac_tester',
      description: 'Test role for foundation',
      permission: [{
        // eslint-disable-next-line camelcase
        operation_key: 'View',
        // eslint-disable-next-line camelcase
        resource_key: 'default_action<>MemberOfNoGroup'
      },
      {
        // eslint-disable-next-line camelcase
        operation_key: 'FullControl',
        // eslint-disable-next-line camelcase
        resource_key: 'menu<>All'
      },
      {
        // eslint-disable-next-line camelcase
        operation_key: 'exec',
        // eslint-disable-next-line camelcase
        resource_key: 'action<>All'
      }]
    };

    const mockPage = {
      ...mockData.page,
      id: 'roletest',
      title: 'role test'
    };
    delete mockPage.tags;

    createRole(role).then(createdRole => {
      expect(createdRole.status).to.equal(200);
      roles.push(createdRole.body.role.id);
      createPage(mockPage).then(createdPage => {
        expect(createdPage.status).to.equal(200);
        expect(createdPage.body.error).to.equal(false);
        pages.push(mockPage.id);
        shared.logout(request, () => {
          shared.login(request, loginURL, testUser, testPassword, () => {
            getPage(mockPage.id).then(result => {
              expect(result.status).to.equal(200);
              expect(result.body.error).to.equal(false);
              return done();
            }).catch(done);
          });
        });
      }).catch(done);
    }).catch(done);
  });

  it('Create a user with Page AssignPages permission for default_action<>MemberOfAnyGroup', done => {
    const role = {
      name: 'rbac_tester',
      description: 'Test role for foundation',
      permission: [{
        // eslint-disable-next-line camelcase
        operation_key: 'AssignPages',
        // eslint-disable-next-line camelcase
        resource_key: 'default_action<>MemberOfAnyGroup'
      },
      {
        // eslint-disable-next-line camelcase
        operation_key: 'Create',
        // eslint-disable-next-line camelcase
        resource_key: 'default_action<>MemberOfAnyGroup'
      },
      {
        // eslint-disable-next-line camelcase
        operation_key: 'FullControl',
        // eslint-disable-next-line camelcase
        resource_key: 'menu<>All'
      },
      {
        // eslint-disable-next-line camelcase
        operation_key: 'exec',
        // eslint-disable-next-line camelcase
        resource_key: 'action<>All'
      }]
    };

    const mockPage = {
      ...mockData.page,
      id: 'roletest',
      title: 'role test',
      tags: [{ name: '__rbac', values: ['nomMgmt']}]
    };

    createRole(role).then(createdRole => {
      expect(createdRole.status).to.equal(200);
      roles.push(createdRole.body.role.id);
      shared.logout(request, () => {
        shared.login(request, loginURL, testUser, testPassword, () => {
          createPage(mockPage).then(createdPage => {
            expect(createdPage.status).to.equal(200);
            expect(createdPage.body.error).to.equal(false);
            pages.push(mockPage.id);
            getPage(mockPage.id).then(result => {
              expect(result.status).to.equal(200);
              expect(result.body.error).to.equal(false);
              shared.logout(request, () => {
                shared.login(request, loginURL, superAdmin, superAdminPassword, () => {
                  deletePage(mockPage.id).then(deletedres => {
                    expect(deletedres.status).to.equal(200);
                    expect(deletedres.body.error).to.equal(false);
                    pages.pop();
                    shared.logout(request, () => {
                      shared.login(request, loginURL, testerUser, adminPasswd, () => {
                        delete mockPage.tags;
                        createPage(mockPage).then(createdResult => {
                          expect(createdResult.status).to.equal(200);
                          expect(createdResult.body.error).to.equal(false);
                          pages.push(mockPage.id);
                          getPage(mockPage.id).then(getResult => {
                            expect(getResult.status).to.equal(200);
                            expect(getResult.body.error).to.equal(false);
                            shared.logout(request, () => {
                              shared.login(request, loginURL, superAdmin, superAdminPassword, () => {
                                deletePage(mockPage.id).then(deletedResult => {
                                  expect(deletedResult.status).to.equal(200);
                                  expect(deletedResult.body.error).to.equal(false);
                                  pages.pop();
                                  deleteRole(roles[0]).then(deletedRole => {
                                    expect(deletedRole.status).to.equal(200);
                                    roles.pop();
                                    shared.logout(request, () => {
                                      shared.login(request, loginURL, testerUser, adminPasswd, () => {
                                        const mockPageNew = {
                                          ...mockData.page,
                                          id: 'roletestNew',
                                          title: 'role test'
                                        };
                                        delete mockPageNew.tags;
                                        createPage(mockPage).then(newPage => {
                                          expect(newPage.status).to.equal(401);
                                          expect(newPage.body.error).to.equal(true);
                                          return done();
                                        }).catch(done);
                                      });
                                    });
                                  }).catch(done);
                                }).catch(done);
                              });
                            });
                          }).catch(done);
                        }).catch(done);
                      });
                    });
                  }).catch(done);
                });
              });
            }).catch(done);
          }).catch(done);
        });
      }).catch(done);
    });
  });

  it('Create a user with Page AssignPages permission for default_action<>MemberOfNoGroup', done => {
    const role = {
      name: 'rbac_tester',
      description: 'Test role for foundation',
      permission: [{
        // eslint-disable-next-line camelcase
        operation_key: 'AssignPages',
        // eslint-disable-next-line camelcase
        resource_key: 'default_action<>MemberOfNoGroup'
      },
      {
        // eslint-disable-next-line camelcase
        operation_key: 'Create',
        // eslint-disable-next-line camelcase
        resource_key: 'default_action<>MemberOfAnyGroup'
      },
      {
        // eslint-disable-next-line camelcase
        operation_key: 'FullControl',
        // eslint-disable-next-line camelcase
        resource_key: 'menu<>All'
      },
      {
        // eslint-disable-next-line camelcase
        operation_key: 'exec',
        // eslint-disable-next-line camelcase
        resource_key: 'action<>All'
      }]
    };

    const mockPage = {
      ...mockData.page,
      id: 'roletest',
      title: 'role test',
      tags: [{ name: '__rbac', values: ['nomMgmt']}]
    };

    createRole(role).then(createdRole => {
      expect(createdRole.status).to.equal(200);
      roles.push(createdRole.body.role.id);
      shared.logout(request, () => {
        shared.login(request, loginURL, testUser, testPassword, () => {
          createPage(mockPage).then(createdPage => {
            expect(createdPage.status).to.equal(401);
            expect(createdPage.body.error).to.equal(true);
            delete mockPage.tags;
            createPage(mockPage).then(newPage => {
              expect(newPage.status).to.equal(200);
              expect(newPage.body.error).to.equal(false);
              pages.push(mockPage.id);
              getPage(mockPage.id).then(result => {
                expect(result.status).to.equal(200);
                expect(result.body.error).to.equal(false);
                return done();
              }).catch(done);
            }).catch(done);
          }).catch(done);
        });
      }).catch(done);
    });
  });
});

describe('Default template unowned pages', () => {
  const testUser = 'rbacTester';
  const testPassword = 'rbacTester';
  let roles = [];
  let pages = [];
  let nullRefTags = [];

  beforeEach(done => {
    roles = [];
    pages = [];
    nullRefTags = [];
    shared.login(request, loginURL, superAdmin, superAdminPassword, done);
  });

  afterEach(done => {
    const pagePromises = [];
    const rolePromises = [];
    const nullRefTagsPromises = [];
    shared.logout(request, () => {
      shared.login(request, loginURL, superAdmin, superAdminPassword, () => {
        nullRefTags.forEach(nullRefTag => {
          nullRefTagsPromises.push(deleteTagByValue(nullRefTag.name, nullRefTag.value));
        });
        Promise.all(nullRefTagsPromises).then(() => {
          pages.forEach(pageId => {
            pagePromises.push(deletePage(pageId));
            pagePromises.push(deleteTag(pageId));
          });
          Promise.all(pagePromises).then(() => {
            roles.forEach(roleId => {
              rolePromises.push(deleteRole(roleId));
            });
            Promise.all(rolePromises).then(() => {
              shared.logout(request, done);
            }).catch(error => {
              console.log(error);
            });
          });
        });
      });
    });
  });

  it('Unowned role and test without template', done => {
    const role = {
      name: '__unowned',
      description: 'Test role for foundation',
      permission: [
        {
        // eslint-disable-next-line camelcase
          operation_key: 'View',
          // eslint-disable-next-line camelcase
          resource_key: 'menu<>All'
        }
      ]
    };
    const mockPage = {
      ...mockData.page,
      id: 'unownedPage',
      title: 'role test'
    };
    delete mockPage.tags;
    pages.push(mockPage.id);
    createRole(role).then(res => {
      expect(res.status).to.equal(200);
      expect(res.body.role).to.not.equal(null);
      expect(res.body.role.name).to.equal('__unowned');
      roles.push(res.body.role.id);
      createPage(mockPage).then(createdPage => {
        expect(createdPage.status).to.equal(200);
        expect(createdPage.body.error).to.equal(false);
        expect(createdPage.body[0]).to.be.equal(undefined);
        expect(createdPage.body.data[0].id).to.be.equal(mockPage.id);
        shared.logout(request, () => {
          shared.login(request, loginURL, testUser, testPassword, () => {
            getPage(mockPage.id).then(result => {
              expect(result.status).to.equal(401);
              expect(result.body.error).to.equal(true);
              done();
            }).catch(done);
          });
        });
      }).catch(done);
    }).catch(done);
  });

  it('UnOwnedPage default permission test', done => {
    const mockPage = {
      ...mockData.page,
      id: 'unownedPage',
      title: 'role test'
    };
    const role = {
      name: '__unowned',
      description: 'Test role for foundation',
      permission: [
        {
        // eslint-disable-next-line camelcase
          operation_key: 'View',
          // eslint-disable-next-line camelcase
          resource_key: 'default_action<>All'
        }
      ]
    };
    pages.push(mockPage.id);
    createRole(role).then(res => {
      expect(res.status).to.equal(200);
      expect(res.body.role).to.not.equal(null);
      expect(res.body.role.name).to.equal('__unowned');
      roles.push(res.body.role.id);
      createPage(mockPage).then(createdPage => {
        expect(createdPage.status).to.equal(200);
        expect(createdPage.body.error).to.equal(false);
        expect(createdPage.body[0]).to.be.equal(undefined);
        expect(createdPage.body.data[0].id).to.be.equal(mockPage.id);
        shared.logout(request, () => {
          shared.login(request, loginURL, testUser, testPassword, () => {
            getPage(mockPage.id).then(result => {
              expect(result.status).to.equal(200);
              expect(result.body.error).to.equal(false);
              done();
            }).catch(done);
          });
        });
      }).catch(done);
    }).catch(done);
  });

  it('Role permission over UnOwned permission', done => {
    const mockPage = {
      ...mockData.page,
      id: 'unownedPage',
      title: 'role test'
    };
    const role = {
      name: '__unowned',
      description: 'Test role for foundation',
      permission: [
        {
        // eslint-disable-next-line camelcase
          operation_key: 'Delete',
          // eslint-disable-next-line camelcase
          resource_key: 'default_action<>All'
        }
      ]
    };
    const userRole = {
      name: 'rbac_tester',
      description: 'Test role for foundation',
      permission: [
        {
        // eslint-disable-next-line camelcase
          operation_key: 'View',
          // eslint-disable-next-line camelcase
          resource_key: 'default_action<>All'
        }
      ]
    };

    createRole(userRole).then(res => {
      expect(res.status).to.equal(200);
      expect(res.body.role).to.not.equal(null);
      expect(res.body.role.name).to.equal('rbac_tester');
      // eslint-disable-next-line no-unused-vars
      roles.push(res.body.role.id);
      createRole(role).then(defaulRolRes => {
        expect(defaulRolRes.status).to.equal(200);
        expect(defaulRolRes.body.role).to.not.equal(null);
        expect(defaulRolRes.body.role.name).to.equal('__unowned');
        roles.push(defaulRolRes.body.role.id);
        createPage(mockPage).then(pageResp => {
          expect(pageResp.status).to.equal(200);
          expect(pageResp.body.error).to.equal(false);
          pages.push(mockPage.id);
          shared.logout(request, () => {
            shared.login(request, loginURL, testUser, testPassword, () => {
              getPage(mockPage.id).then(result => {
                expect(result.status).to.equal(200);
                expect(result.body.error).to.equal(false);
                deletePage(mockPage.id).then(deleteResponse => {
                  expect(deleteResponse.status).to.equal(401);
                  expect(deleteResponse.body.error).to.equal(true);
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

describe('Default template grouped pages', () => {
  const testUser = 'rbacTester';
  const testPassword = 'rbacTester';
  let roles = [];
  let pages = [];
  let nullRefTags = [];

  beforeEach(done => {
    roles = [];
    pages = [];
    nullRefTags = [];
    shared.login(request, loginURL, superAdmin, superAdminPassword, done);
  });

  afterEach(done => {
    const pagePromises = [];
    const rolePromises = [];
    const nullRefTagsPromises = [];
    shared.logout(request, () => {
      shared.login(request, loginURL, superAdmin, superAdminPassword, () => {
        nullRefTags.forEach(nullRefTag => {
          nullRefTagsPromises.push(deleteTagByValue(nullRefTag.name, nullRefTag.value));
        });
        Promise.all(nullRefTagsPromises).then(() => {
          pages.forEach(pageId => {
            pagePromises.push(deletePage(pageId));
            pagePromises.push(deleteTag(pageId));
          });
          Promise.all(pagePromises).then(() => {
            roles.forEach(roleId => {
              rolePromises.push(deleteRole(roleId));
            });
            Promise.all(rolePromises).then(() => {
              shared.logout(request, done);
            }).catch(error => {
              console.log(error);
            });
          });
        });
      });
    });
  });

  const page = {
    ...mockData.page,
    id: 'groupedPage',
    title: 'role test',
    tags: [{ name: '__rbac', values: ['nomMgmt']}]
  };
  const groupedRoleViewPermission = {
    name: '__grouped',
    description: 'Test role for foundation',
    permission: [
      {
        // eslint-disable-next-line camelcase
        operation_key: 'View',
        // eslint-disable-next-line camelcase
        resource_key: 'default_action<>All'
      }
    ]
  };

  it('GroupedPage default permission test', done => {
    const mockPage = page;
    const role = groupedRoleViewPermission;
    createRole(role).then(res => {
      expect(res.status).to.equal(200);
      expect(res.body.role).to.not.equal(null);
      expect(res.body.role.name).to.equal('__grouped');
      roles.push(res.body.role.id);
      createPage(mockPage).then(createdPage => {
        expect(createdPage.status).to.equal(200);
        expect(createdPage.body[0]).to.be.equal(undefined);
        expect(createdPage.body.data[0].id).to.be.equal(mockPage.id);
        pages.push(mockPage.id);
        shared.logout(request, () => {
          shared.login(request, loginURL, testUser, testPassword, () => {
            getPage(mockPage.id).then(result => {
              expect(result.status).to.equal(200);
              expect(result.body.error).to.equal(false);
              done();
            }).catch(done);
          });
        });
      }).catch(done);
    }).catch(done);
  });

  it('Role permission over Grouped permission', done => {
    const mockPage = page;
    const role = groupedRoleViewPermission;
    const userRole = {
      name: 'rbac_tester',
      description: 'Test role for foundation',
      permission: [
        {
        // eslint-disable-next-line camelcase
          operation_key: 'View',
          // eslint-disable-next-line camelcase
          resource_key: 'default_action<>All'
        }
      ]
    };

    createRole(userRole).then(res => {
      expect(res.status).to.equal(200);
      expect(res.body.role).to.not.equal(null);
      expect(res.body.role.name).to.equal('rbac_tester');
      roles.push(res.body.role.id);
      createRole(role).then(defaulRolRes => {
        expect(defaulRolRes.status).to.equal(200);
        expect(defaulRolRes.body.role).to.not.equal(null);
        expect(defaulRolRes.body.role.name).to.equal('__grouped');
        roles.push(defaulRolRes.body.role.id);
        createPage(mockPage).then(pageResp => {
          expect(pageResp.status).to.equal(200);
          expect(pageResp.body.error).to.equal(false);
          pages.push(mockPage.id);
          shared.logout(request, () => {
            shared.login(request, loginURL, testUser, testPassword, () => {
              getPage(mockPage.id).then(result => {
                expect(result.status).to.equal(200);
                expect(result.body.error).to.equal(false);
                deletePage(mockPage.id).then(deleteResponse => {
                  expect(deleteResponse.status).to.equal(401);
                  expect(deleteResponse.body.error).to.equal(true);
                  done();
                }).catch(done);
              }).catch(done);
            });
          });
        }).catch(done);
      }).catch(done);
    }).catch(done);
  });

  it('Grouped and UnOnwed permission', done => {
    const mockPage = page;
    const groupedRole = groupedRoleViewPermission;
    const unOwnedRole = {
      name: '__unowned',
      description: 'Test role for foundation',
      permission: [
        {
          // eslint-disable-next-line camelcase
          operation_key: 'Delete',
          // eslint-disable-next-line camelcase
          resource_key: 'default_action<>Group-nomGroup'
        }
      ]
    };

    createRole(unOwnedRole).then(res => {
      expect(res.status).to.equal(200);
      expect(res.body.role).to.not.equal(null);
      expect(res.body.role.name).to.equal('__unowned');
      roles.push(res.body.role.id);
      createRole(groupedRole).then(defaulRolRes => {
        expect(defaulRolRes.status).to.equal(200);
        expect(defaulRolRes.body.role).to.not.equal(null);
        expect(defaulRolRes.body.role.name).to.equal('__grouped');
        roles.push(defaulRolRes.body.role.id);
        createPage(mockPage).then(pageResp => {
          expect(pageResp.status).to.equal(200);
          expect(pageResp.body.error).to.equal(false);
          pages.push(mockPage.id);
          shared.logout(request, () => {
            shared.login(request, loginURL, testUser, testPassword, () => {
              getPage(mockPage.id).then(result => {
                expect(result.status).to.equal(200);
                expect(result.body.error).to.equal(false);
                deletePage(mockPage.id).then(deleteResponse => {
                  expect(deleteResponse.status).to.equal(401);
                  expect(deleteResponse.body.error).to.equal(true);
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

describe('Default template ungrouped pages', () => {
  const testUser = 'rbacTester';
  const testPassword = 'rbacTester';
  let roles = [];
  let pages = [];
  let nullRefTags = [];

  beforeEach(done => {
    roles = [];
    pages = [];
    nullRefTags = [];
    shared.login(request, loginURL, superAdmin, superAdminPassword, done);
  });

  afterEach(done => {
    const pagePromises = [];
    const rolePromises = [];
    const nullRefTagsPromises = [];
    shared.logout(request, () => {
      shared.login(request, loginURL, superAdmin, superAdminPassword, () => {
        nullRefTags.forEach(nullRefTag => {
          nullRefTagsPromises.push(deleteTagByValue(nullRefTag.name, nullRefTag.value));
        });
        Promise.all(nullRefTagsPromises).then(() => {
          pages.forEach(pageId => {
            pagePromises.push(deletePage(pageId));
            pagePromises.push(deleteTag(pageId));
          });
          Promise.all(pagePromises).then(() => {
            roles.forEach(roleId => {
              rolePromises.push(deleteRole(roleId));
            });
            Promise.all(rolePromises).then(() => {
              shared.logout(request, done);
            }).catch(error => {
              console.log(error);
            });
          });
        });
      });
    });
  });

  it('Grouped page and test without template', done => {
    const role = {
      name: '__ungrouped',
      description: 'Test role for foundation',
      permission: [
        {
        // eslint-disable-next-line camelcase
          operation_key: 'View',
          // eslint-disable-next-line camelcase
          resource_key: 'menu<>All'
        }
      ]
    };
    const mockPage = {
      ...mockData.page,
      id: 'unGroupedPage',
      title: 'role test',
      tags: [{
        name: '__rbac', values: ['nomGroup']
      }]
    };

    createRole(role).then(res => {
      expect(res.status).to.equal(200);
      expect(res.body.role).to.not.equal(null);
      expect(res.body.role.name).to.equal('__ungrouped');
      roles.push(res.body.role.id);
      createPage(mockPage).then(createdPage => {
        expect(createdPage.status).to.equal(200);
        expect(createdPage.body[0]).to.be.equal(undefined);
        expect(createdPage.body.data[0].id).to.be.equal(mockPage.id);
        pages.push(mockPage.id);
        shared.logout(request, () => {
          shared.login(request, loginURL, testUser, testPassword, () => {
            getPage(mockPage.id).then(result => {
              expect(result.status).to.equal(401);
              expect(result.body.error).to.equal(true);
              done();
            }).catch(done);
          });
        });
      }).catch(done);
    }).catch(done);
  });

  it('UnGrouped FullControl permission test', done => {
    const mockPage = {
      ...mockData.page,
      id: 'unGroupedPage',
      title: 'role test'
    };
    const role = {
      name: '__ungrouped',
      description: 'Test role for foundation',
      permission: [
        {
        // eslint-disable-next-line camelcase
          operation_key: 'FullControl',
          // eslint-disable-next-line camelcase
          resource_key: 'default_action<>All'
        }
      ]
    };

    createRole(role).then(res => {
      expect(res.status).to.equal(200);
      expect(res.body.role).to.not.equal(null);
      expect(res.body.role.name).to.equal('__ungrouped');
      roles.push(res.body.role.id);
      createPage(mockPage).then(createdPage => {
        expect(createdPage.status).to.equal(200);
        expect(createdPage.body[0]).to.be.equal(undefined);
        expect(createdPage.body.data[0].id).to.be.equal(mockPage.id);
        pages.push(mockPage.id);
        shared.logout(request, () => {
          shared.login(request, loginURL, testUser, testPassword, () => {
            getPage(mockPage.id).then(result => {
              expect(result.status).to.equal(200);
              expect(result.body.error).to.equal(false);
              done();
            }).catch(done);
          });
        });
      }).catch(done);
    }).catch(done);
  });

  it('Role permission over UnGrouped permission', done => {
    const mockPage = {
      ...mockData.page,
      id: 'unGroupedPage',
      title: 'role test'
    };
    const role = {
      name: '__ungrouped',
      description: 'Test role for foundation',
      permission: [
        {
        // eslint-disable-next-line camelcase
          operation_key: 'Delete',
          // eslint-disable-next-line camelcase
          resource_key: 'default_action<>All'
        }
      ]
    };
    const userRole = {
      name: 'rbac_tester',
      description: 'Test role for foundation',
      permission: [
        {
        // eslint-disable-next-line camelcase
          operation_key: 'View',
          // eslint-disable-next-line camelcase
          resource_key: 'default_action<>Group-nomGroup'
        }
      ]
    };

    createRole(userRole).then(res => {
      expect(res.status).to.equal(200);
      expect(res.body.role).to.not.equal(null);
      expect(res.body.role.name).to.equal('rbac_tester');
      roles.push(res.body.role.id);
      createRole(role).then(roleResp => {
        expect(roleResp.status).to.equal(200);
        expect(roleResp.body.role).to.not.equal(null);
        expect(roleResp.body.role.name).to.equal('__ungrouped');
        roles.push(roleResp.body.role.id);
        createPage(mockPage).then(createdPage => {
          expect(createdPage.status).to.equal(200);
          expect(createdPage.body[0]).to.be.equal(undefined);
          expect(createdPage.body.data[0].id).to.be.equal(mockPage.id);
          pages.push(mockPage.id);
          shared.logout(request, () => {
            shared.login(request, loginURL, testUser, testPassword, () => {
              getPage(mockPage.id).then(result => {
                expect(result.body.error).to.equal(true);
                expect(result.status).to.equal(401);
                deletePage(mockPage.id).then(deleteResponse => {
                  expect(deleteResponse.status).to.equal(401);
                  expect(deleteResponse.body.error).to.equal(true);
                  done();
                }).catch(done);
              }).catch(done);
            });
          });
        }).catch(done);
      }).catch(done);
    }).catch(done);
  });

  it('UnGrouped and UnOwned permission', done => {
    const mockPage = {
      ...mockData.page,
      id: 'unGroupedPage',
      title: 'role test'
    };
    const unGroupRole = {
      name: '__ungrouped',
      description: 'Test role for foundation',
      permission: [
        {
        // eslint-disable-next-line camelcase
          operation_key: 'Delete',
          // eslint-disable-next-line camelcase
          resource_key: 'default_action<>All'
        }
      ]
    };
    const unOwnedRole = {
      name: '__unowned',
      description: 'Test role for foundation',
      permission: [
        {
        // eslint-disable-next-line camelcase
          operation_key: 'View',
          // eslint-disable-next-line camelcase
          resource_key: 'default_action<>Group-nomGroup'
        }
      ]
    };

    createRole(unOwnedRole).then(res => {
      expect(res.status).to.equal(200);
      expect(res.body.role).to.not.equal(null);
      expect(res.body.role.name).to.equal('__unowned');
      roles.push(res.body.role.id);
      createRole(unGroupRole).then(roleResp => {
        expect(roleResp.status).to.equal(200);
        expect(roleResp.body.role).to.not.equal(null);
        expect(roleResp.body.role.name).to.equal('__ungrouped');
        roles.push(roleResp.body.role.id);
        createPage(mockPage).then(createdPage => {
          expect(createdPage.status).to.equal(200);
          expect(createdPage.body[0]).to.be.equal(undefined);
          expect(createdPage.body.data[0].id).to.be.equal(mockPage.id);
          pages.push(mockPage.id);
          shared.logout(request, () => {
            shared.login(request, loginURL, testUser, testPassword, () => {
              getPage(mockPage.id).then(result => {
                expect(result.status).to.equal(401);
                expect(result.body.error).to.equal(true);
                deletePage(mockPage.id).then(deleteResponse => {
                  expect(deleteResponse.status).to.equal(200);
                  expect(deleteResponse.body.error).to.equal(false);
                  pages.pop();
                  done();
                }).catch(done);
              }).catch(done);
            });
          });
        }).catch(done);
      }).catch(done);
    }).catch(done);
  });

  it('Gain access using UnGrouped and UnOwned permission', done => {
    const mockPage = {
      ...mockData.page,
      id: 'unGroupedPageUpdaate',
      title: 'role test '
    };
    delete mockPage.tags;
    const unGroupRole = {
      name: '__ungrouped',
      description: 'Test role for foundation',
      permission: [
        {
        // eslint-disable-next-line camelcase
          operation_key: 'View',
          // eslint-disable-next-line camelcase
          resource_key: 'default_action<>All'
        }
      ]
    };
    const unOwnedRole = {
      name: '__unowned',
      description: 'Test role for foundation',
      permission: [
        {
        // eslint-disable-next-line camelcase
          operation_key: 'Modify',
          // eslint-disable-next-line camelcase
          resource_key: 'default_action<>All'
        }
      ]
    };

    createRole(unOwnedRole).then(res => {
      expect(res.status).to.equal(200);
      expect(res.body.role).to.not.equal(null);
      expect(res.body.role.name).to.equal('__unowned');
      roles.push(res.body.role.id);
      createRole(unGroupRole).then(roleResp => {
        expect(roleResp.status).to.equal(200);
        expect(roleResp.body.role).to.not.equal(null);
        expect(roleResp.body.role.name).to.equal('__ungrouped');
        roles.push(roleResp.body.role.id);
        createPage(mockPage).then(createdPage => {
          expect(createdPage.status).to.equal(200);
          expect(createdPage.body[0]).to.be.equal(undefined);
          expect(createdPage.body.data[0].id).to.be.equal(mockPage.id);
          pages.push(mockPage.id);
          shared.logout(request, () => {
            shared.login(request, loginURL, testUser, testPassword, () => {
              getPage(mockPage.id).then(result => {
                expect(result.status).to.equal(200);
                expect(result.body.error).to.equal(false);
                updatePage(mockPage).then(deleteResponse => {
                  expect(deleteResponse.status).to.equal(200);
                  expect(deleteResponse.body.error).to.equal(false);
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
