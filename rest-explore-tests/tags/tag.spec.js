const shared = require('../helpers/shared');
const supertest = require('supertest');
const testData = require('../mockData');
const assert = require('chai').assert;
const mockData = JSON.parse(JSON.stringify(testData));
const request = supertest.agent(shared.exploreTestURL);
const { randomUUID } = require('crypto');
const async = require('async');
const loginURL = '/rest/v2/tag/';
const apiTag = '/rest/v2/tag/';
const apiPage = '/rest/v2/pages/';
const apiTagVal = '/rest/v2/tagVal/';
const apiRole = '/rest/v2/role/';
const adminLogin = shared.tenant.email;
const adminPasswd = shared.tenant.password;
const testerUser = 'tester';

const nonAdminUser = {
  login: `${randomUUID()}@example.com`,
  passwd: 'Abc1234$'
};

const duplicateTag = {
  name: '__system',
  value: 'write',
  ref: 'testPage',
  refType: 'page'
};

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

const deleteRole = roleId => new Promise((resolve, reject) => {
  request.delete(apiRole.concat(roleId))
    .set('X-Secure-Modify-Token', shared.secureModifyToken())
    .end((err, response) => {
      if (err) {
        return reject(err);
      }
      resolve(response);
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

const deleteAllTags = tagsToDelete => new Promise((resolve, reject) => {
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

const deletePage = pageId => new Promise((resolve, reject) => {
  request
    .delete(`${apiPage}${pageId}`)
    .set('X-Secure-Modify-Token', shared.secureModifyToken())
    .end((err, res) => {
      if (err) {
        return reject(err);
      }
      resolve(res);
    });
});

const roleWithAssignPagesAndMemberOfNoGrpPerm = {
  name: 'bvd_tester',
  description: 'Test role for foundation',
  permission: [
    {
      // eslint-disable-next-line camelcase
      operation_key: 'AssignPages',
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
    }
  ]
};

const roleWithAssignPagesAndMemberOfAnyGrpPerm = {
  name: 'bvd_tester',
  description: 'Test role for foundation',
  permission: [
    {
      // eslint-disable-next-line camelcase
      operation_key: 'AssignPages',
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

const createNullRefTags = tags => new Promise((resolve, reject) => {
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

describe('Tag Rest Service Test', () => {
  let nullRefTags = [];

  beforeEach(done => {
    nullRefTags = [];
    shared.login(request, loginURL, adminLogin, adminPasswd, () => {
      createNullRefTags(mockData.tags).then(() => {
        mockData.tags.forEach(nullTag => {
          nullRefTags.push(nullTag);
        });
        shared.createItems(request, apiTag, mockData.tags, done);
      });
    });
  });

  afterEach(done => {
    const nullRefTagsPromises = [];
    shared.logout(request, () => {
      shared.login(request, loginURL, adminLogin, adminPasswd, () => {
        nullRefTags.forEach(nullRefTag => {
          nullRefTagsPromises.push(deleteTagByValue(nullRefTag.name, nullRefTag.value));
        });
        Promise.all(nullRefTagsPromises).then(() => {
          shared.logout(request, done);
        });
      });
    });
  });

  it('Perform tag creation with invalid csrf token', done => {
    request
      .post(apiTag)
      .set('X-Secure-Modify-Token', 'm6WBppef-xdWYLmZmOAtxDECtv62gaRaxNi')
      .send(mockData.tags)
      .end((err, res) => {
        if (err) {
          return done(new Error(`Error while creating items (${mockData.tags}): ${err}`));
        }
        if (res && res.body.error) {
          expect(res.status).to.equal(403);
          expect(res.body.message).to.equal('Forbidden');
        }
        return done();
      });
  });

  it('Create duplicate Tag', done => {
    request
      .post(apiTag)
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .send(duplicateTag)
      .end((err, res) => {
        if (err) {
          return done(new Error(`Error while creating items (${mockData.tags}): ${err}`));
        }
        if (res && res.body.error) {
          expect(res.body.defaultText).to.include('unique constraint');
        }
        return done();
      });
  });

  it('Get all Tags', done => {
    request
      .get(apiTag)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.status).to.equal(200);
        expect(res.body.data.length).to.equal(3);
        done();
      });
  });

  it('Get tag by tag id', done => {
    request
      .get(apiTag)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        request
          .get(apiTag.concat(res.body.data[0].id))
          .end((err, getRes) => {
            if (err) {
              return done(err);
            }
            expect(res.status).to.equal(200);
            expect(getRes.body.data.id).to.eql(res.body.data[0].id);
            done();
          });
      });
  });

  it('Get Tags by Tag id which don\'t exist ', done => {
    request
      .get(`${apiTag}production`)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.status).to.equal(404);
        done();
      });
  });

  it('Update tag that don\'t exist', done => {
    request
      .put(`${apiTag}nonExistingTagId`)
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .send(mockData.tags[0])
      .end((err, res1) => {
        if (err) {
          return done(err);
        }
        expect(res1.status).to.equal(500);
        return done();
      });
  });

  it('Delete Tag that don\'t exist', done => {
    const tagId = 'dev';
    request
      .delete(`${apiTag}${tagId}`)
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.status).to.equal(404);
        expect(res.body.additionalInfo[0]).to.equal(`Tag with id ${tagId} not found`);
        return done();
      });
  });

  it('Update tag by id', done => {
    request
      .get(apiTag)
      .query(`refType=page&ref=${mockData.page.id}`)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.status).to.equal(200);
        const updateTag = res.body.data[0];
        const tagId = updateTag.id;
        updateTag.ref = 'SelfMonitoring';
        request
          .put(apiTag.concat(tagId))
          .set('X-Secure-Modify-Token', shared.secureModifyToken())
          .send(updateTag)
          .end((err, res1) => {
            if (err) {
              return done(err);
            }
            expect(res1.status).to.equal(200);
            expect(res1.body.data.value).to.equal(updateTag.value);
            request
              .get(apiTag.concat(res1.body.data.id))
              .end((err, tagGetRes) => {
                if (err) {
                  return done(err);
                }
                expect(tagGetRes.status).to.equal(200);
                expect(tagGetRes.body.data.value).to.equal(updateTag.value);
                return done();
              });
          });
      });
  });

  it('Fail updating tag when tag id does not exist', done => {
    request
      .get(apiTag)
      .query(`refType=page&ref=${mockData.page.id}`)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.status).to.equal(200);
        const tagToBeUpdated = res.body.data[0];
        let tagId = tagToBeUpdated.id;
        tagId = 'test';
        tagToBeUpdated.id = tagId;
        request
          .put(apiTag.concat(tagId))
          .send(tagToBeUpdated)
          .set('X-Secure-Modify-Token', shared.secureModifyToken())
          .end((err, updateRes) => {
            if (err) {
              return done(err);
            }
            expect(updateRes.status).to.equal(500);
            expect(updateRes.body.defaultText).to.be.equal(`The server reported the following error: Tag with the id ${tagId} does not exists`);
            done();
          });
      });
  });

  it('Fail to update a tag with the name and value not matching with any known tag', done => {
    request
      .get(apiTag)
      .query(`refType=page&ref=${mockData.page.id}`)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.status).to.equal(200);
        const tagToBeUpdated = res.body.data[0];
        tagToBeUpdated.value = 'NoKnownTagPresent';
        request
          .put(apiTag.concat(tagToBeUpdated.id))
          .send(tagToBeUpdated)
          .set('X-Secure-Modify-Token', shared.secureModifyToken())
          .end((err, updateRes) => {
            if (err) {
              return done(err);
            }
            expect(updateRes.status).to.equal(500);
            expect(updateRes.body.defaultText).to.be.equal(`The server reported the following error: Invalid tag specification: No known tag found with name ${tagToBeUpdated.name} and value ${tagToBeUpdated.value}`);
            done();
          });
      });
  });

  it('should update a tag with the name and value matching with a known tag', done => {
    const tag = { ...mockData.tags[0], name: '__licenses', value: 'nom_ultimate' };
    request
      .post(apiTagVal.concat(tag.name).concat('/', tag.value))
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .end((err, tagPostRes) => {
        if (err) {
          return done(err);
        }
        expect(tagPostRes.status).to.equal(200);
        request
          .post(apiTag)
          .set('X-Secure-Modify-Token', shared.secureModifyToken())
          .send(tag)
          .end((err, tagRes) => {
            if (err) {
              return done(err);
            }
            expect(tagRes.status).to.equal(200);
            const tagToBeUpdated = tagRes.body.data[0];
            tagToBeUpdated.ref = 'widgetsPage';
            request
              .put(apiTag.concat(tagToBeUpdated.id))
              .send(tagToBeUpdated)
              .set('X-Secure-Modify-Token', shared.secureModifyToken())
              .end((err, updateRes) => {
                if (err) {
                  return done(err);
                }
                expect(updateRes.status).to.equal(200);
                request
                  .get(apiTag)
                  .query(`refType=page&ref=${updateRes.body.data.ref}`)
                  .end((err, res) => {
                    if (err) {
                      return done(err);
                    }
                    expect(res.status).to.equal(200);
                    expect(res.body.data[0].ref).to.equal(tagToBeUpdated.ref);
                    done();
                  });
              });
          });
      });
  });

  it('Get tags by ref', done => {
    request
      .get(apiTag)
      .query(`refType=page&ref=${mockData.page.id}`)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.status).to.equal(200);
        expect(res.body.data.length).to.equal(3);
        done();
      });
  });

  it('Delete tags by reference', done => {
    request
      .get(apiTag)
      .query(`refType=page&ref=${mockData.page.id}`)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.status).to.equal(200);
        expect(res.body.data.length).to.equal(3);
        request
          .delete(apiTag)
          .query(`refType=page&ref=${mockData.page.id}`)
          .set('X-Secure-Modify-Token', shared.secureModifyToken())
          .end((err, deleteRes) => {
            if (err) {
              return done(new Error(`Error while deleting tag with the reference (${mockData.page.id}): ${err}`));
            }
            expect(deleteRes.body.data.result).to.equal('Tags deleted');
            request
              .get(apiTag)
              .query(`refType=page&ref=${mockData.page.id}`)
              .end((err, getResAfterDelete) => {
                if (err) {
                  return done(err);
                }
                expect(getResAfterDelete.status).to.equal(404);
                return done();
              });
          });
      });
  });

  it('Create two rbac tags by tag value and name', done => {
    const tagVal = 'test';
    const tagName = '__rbac';
    request
      .post(apiTagVal.concat(tagName).concat('/', tagVal))
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.status).to.equal(200);
        expect(res.body.data.name).to.be.equal(tagName);
        const tagValNom = 'nom_express';
        request
          .post(apiTagVal.concat(tagName).concat('/', tagValNom))
          .set('X-Secure-Modify-Token', shared.secureModifyToken())
          .end((err, tagRes) => {
            if (err) {
              return done(err);
            }
            expect(tagRes.status).to.equal(200);
            expect(tagRes.body.data.name).to.be.equal(tagName);
            return done();
          });
      });
  });

  it('Create rbac tag with reference, but it will not be returned using tagVal API', done => {
    const tag = { ...mockData.tags[0], name: '__rbac', value: 'test' };
    request
      .get(apiTagVal.concat(tag.name))
      .end((err, tagGetRes) => {
        if (err) {
          return done(err);
        }
        expect(tagGetRes.body.data.length).to.be.at.least(1);
        const filteredTagValue = tagGetRes.body.data.filter(tagVal => tagVal === tag.value);
        expect(filteredTagValue.length).to.equal(1);
        request
          .post(apiTag)
          .set('X-Secure-Modify-Token', shared.secureModifyToken())
          .send(tag)
          .end((err, res) => {
            if (err) {
              return done(err);
            }
            expect(res.status).to.equal(200);
            expect(res.body.data[0].value).to.be.eq(tag.value);
            request
              .get(apiTagVal.concat(tag.name))
              .end((err, tagGetValRes) => {
                if (err) {
                  return done(err);
                }
                expect(tagGetValRes.status).to.equal(200);
                const tagsArray = tagGetValRes.body.data;
                const testTagVal = tagsArray.filter(tagVal => tagVal === 'test');
                expect(testTagVal.length).to.equal(1);
                const nomTagVal = tagsArray.filter(tagVal => tagVal === 'nom_express');
                expect(nomTagVal.length).to.equal(1);
                done();
              });
          });
      });
  });

  it('Create an existing rbac tag by tag value and name should throw error', done => {
    const tagVal = 'test';
    const tagName = '__rbac';
    request
      .post(apiTagVal.concat(tagName).concat('/', tagVal))
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.status).to.equal(500);
        done();
      });
  });

  it('Get empty response when tag entry is not present with the matching tag name', done => {
    request
      .get(apiTagVal.concat('__test'))
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.status).to.equal(404);
        done();
      });
  });

  it('Get tags by name', done => {
    request
      .get(apiTagVal.concat('__rbac'))
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.status).to.equal(200);
        done();
      });
  });

  it('Delete tag by tag value and name', done => {
    const tagVal = 'test';
    const tagName = '__rbac';
    request
      .get(apiTagVal.concat(tagName))
      .end((err, tagGetBeforeDeleteRes) => {
        if (err) {
          return done(err);
        }
        expect(tagGetBeforeDeleteRes.status).to.equal(200);
        const countOfRBACTags = tagGetBeforeDeleteRes.body.data.length;
        deleteTagByValue(tagName, tagVal).then(tagDeleteRes => {
          expect(tagDeleteRes.status).to.equal(200);
          expect(tagDeleteRes.body.data.result).to.be.equal('Tags deleted');
          request
            .get(apiTagVal.concat(tagName))
            .end((err, tagGetAfterDeleteRes) => {
              if (err) {
                return done(err);
              }
              expect(tagGetAfterDeleteRes.status).to.equal(200);
              expect(tagGetAfterDeleteRes.body.data.length).to.equal(countOfRBACTags - 1);
              done();
            });
        }).catch(done);
      });
  });

  it('should create a tag with refType as menuEntry', done => {
    const tag = { ...mockData.tags[0], ref: 'cxyGt', refType: 'menuEntry' };
    request
      .post(apiTag)
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .send(tag)
      .end((err, tagRes) => {
        if (err) {
          return done(err);
        }
        expect(tagRes.status).to.equal(200);
        const receivedTag = tagRes.body.data[0];
        request
          .get(apiTag)
          .query(`refType=menuEntry&ref=${receivedTag.ref}`)
          .end((err, res) => {
            if (err) {
              return done(err);
            }
            expect(res.status).to.equal(200);
            expect(res.body.data[0].ref).to.equal(receivedTag.ref);
            done();
          });
      });
  });

  it('should fail to create a tag with invalid refType', done => {
    const tag = { ...mockData.tags[0], ref: 'cxyGt', refType: 'menuEntry123' };
    request
      .post(apiTag)
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .send(tag)
      .end((err, tagRes) => {
        if (err) {
          return done(err);
        }
        expect(tagRes.status).to.equal(500);
        done();
      });
  });

  it('Deleting all the created tags', done => {
    const tagsToDelete = [{ name: '__rbac', value: 'nom_express' },
      { name: '__licenses', value: 'nom_ultimate' },
      { name: mockData.tags[0].name, value: mockData.tags[0].value },
      { name: mockData.tags[1].name, value: mockData.tags[1].value },
      { name: mockData.tags[2].name, value: mockData.tags[2].value }
    ];
    deleteAllTags(tagsToDelete).then(done).catch(done);
  });
});

describe('Tags permissions test', () => {
  let roles = [];
  let pages = [];
  let nullRefTags = [];

  beforeEach(done => {
    roles = [];
    pages = [];
    nullRefTags = [];
    shared.login(request, loginURL, adminLogin, adminPasswd, done);
  });

  afterEach(done => {
    const pagePromises = [];
    const rolePromises = [];
    const nullRefTagsPromises = [];
    shared.logout(request, () => {
      shared.login(request, loginURL, adminLogin, adminPasswd, () => {
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

  it('Non-admin user(with view/create permissions) should not be able to create ref tags', done => {
    const myRole = {
      name: 'bvd_tester',
      description: 'Test role for foundation with view and create permission',
      permission: [{
        // eslint-disable-next-line camelcase
        operation_key: 'View',
        // eslint-disable-next-line camelcase
        resource_key: 'default_action<>All'
      },
      {
        // eslint-disable-next-line camelcase
        operation_key: 'Create',
        // eslint-disable-next-line camelcase
        resource_key: 'default_action<>All'
      }]
    };

    createRole(myRole).then(res => {
      assert.equal(res.status, 200, 'Role creation');
      expect(res.body.role).to.not.equal(null);
      expect(res.body.role.name).to.equal('bvd_tester');
      roles.push(res.body.role.id);
      shared.logout(request, () => {
        shared.login(request, loginURL, testerUser, nonAdminUser.passwd, () => {
          request
            .post(apiTag)
            .set('X-Secure-Modify-Token', shared.secureModifyToken())
            .send(mockData.tags[0])
            .end((err, tagPostRes) => {
              if (err) {
                return done(err);
              }
              assert.equal(tagPostRes.status, 401, 'Tag creation');
              expect(tagPostRes.body.additionalInfo[0]).to.equal('User has no permission to create tag(s).');
              expect(tagPostRes.error.text).not.to.equal('User has no permission to create tag(s).');
              return done();
            });
        });
      });
    }).catch(done);
  });

  it('Non-admin user(with full control permissions) should be able to create ref tags', done => {
    const myRole = {
      name: 'bvd_tester',
      description: 'Test role for foundation with fullControl',
      permission: [{
        // eslint-disable-next-line camelcase
        operation_key: 'FullControl',
        // eslint-disable-next-line camelcase
        resource_key: 'default_action<>All'
      }]
    };
    createRole(myRole).then(res => {
      assert.equal(res.status, 200, 'Role creation');
      expect(res.body.role).to.not.equal(null);
      expect(res.body.role.name).to.equal('bvd_tester');
      roles.push(res.body.role.id);
      request
        .post(`${apiTagVal}${mockData.tags[0].name}/${mockData.tags[0].value}`)
        .set('X-Secure-Modify-Token', shared.secureModifyToken())
        .end((err, tagValPostRes) => {
          if (err) {
            return done(err);
          }
          assert.equal(tagValPostRes.status, 200, 'Null ref tag creation');
          nullRefTags.push(mockData.tags[0]);
          shared.logout(request, () => {
            shared.login(request, loginURL, testerUser, nonAdminUser.passwd, () => {
              request
                .post(apiTag)
                .set('X-Secure-Modify-Token', shared.secureModifyToken())
                .send(mockData.tags[0])
                .end((err, tagPostRes) => {
                  if (err) {
                    return done(err);
                  }
                  assert.equal(tagPostRes.status, 200, 'Tag creation');
                  expect(tagPostRes.body.data[0].value).to.equal(mockData.tags[0].value);
                  return done();
                });
            });
          });
        });
    });
  });

  it('Non-admin user(with assignPages permissions) should be able to create ref tags', done => {
    const myRole = {
      name: 'bvd_tester',
      description: 'Test role for foundation with assignPages',
      permission: [{
        // eslint-disable-next-line camelcase
        operation_key: 'AssignPages',
        // eslint-disable-next-line camelcase
        resource_key: 'default_action<>All'
      }]
    };

    createRole(myRole).then(res => {
      assert.equal(res.status, 200, 'Role creation');
      expect(res.body.role).to.not.equal(null);
      expect(res.body.role.name).to.equal('bvd_tester');
      roles.push(res.body.role.id);
      request
        .post(`${apiTagVal}${mockData.tags[1].name}/${mockData.tags[1].value}`)
        .set('X-Secure-Modify-Token', shared.secureModifyToken())
        .end((err, tagValPostRes) => {
          if (err) {
            return done(err);
          }
          assert.equal(tagValPostRes.status, 200, 'Null tag ref creation');
          nullRefTags.push(mockData.tags[1]);
          shared.logout(request, () => {
            shared.login(request, loginURL, testerUser, nonAdminUser.passwd, () => {
              request
                .post(apiTag)
                .set('X-Secure-Modify-Token', shared.secureModifyToken())
                .send(mockData.tags[1])
                .end((err, tagPostRes) => {
                  if (err) {
                    return done(err);
                  }
                  assert.equal(tagPostRes.status, 200, 'Tag creation');
                  expect(tagPostRes.body.data[0].value).to.equal(mockData.tags[1].value);
                  return done();
                });
            });
          });
        });
    }).catch(done);
  });

  it('Non-admin user(with assignPages permissions) should be able to delete ref tags', done => {
    const myRole = {
      name: 'bvd_tester',
      description: 'Test role for foundation with assignPages',
      permission: [{
        // eslint-disable-next-line camelcase
        operation_key: 'AssignPages',
        // eslint-disable-next-line camelcase
        resource_key: 'default_action<>All'
      }]
    };
    createRole(myRole).then(res => {
      assert.equal(res.status, 200, 'Role creation');
      expect(res.body.role).to.not.equal(null);
      expect(res.body.role.name).to.equal('bvd_tester');
      roles.push(res.body.role.id);
      request
        .post(`${apiTagVal}${mockData.tags[1].name}/${mockData.tags[1].value}`)
        .set('X-Secure-Modify-Token', shared.secureModifyToken())
        .end((err, tagValPostRes) => {
          if (err) {
            return done(err);
          }
          assert.equal(tagValPostRes.status, 200, 'Null ref tag creation');
          nullRefTags.push(mockData.tags[1]);
          shared.logout(request, () => {
            shared.login(request, loginURL, testerUser, nonAdminUser.passwd, () => {
              request
                .post(apiTag)
                .set('X-Secure-Modify-Token', shared.secureModifyToken())
                .send(mockData.tags[1])
                .end((err, tagPostRes) => {
                  if (err) {
                    return done(err);
                  }
                  assert.equal(tagPostRes.status, 200, 'Tag creation');
                  expect(tagPostRes.body.data[0].value).to.equal(mockData.tags[1].value);
                  request
                    .delete(apiTag.concat(tagPostRes.body.data[0].id))
                    .set('X-Secure-Modify-Token', shared.secureModifyToken())
                    .end((err, deleteRes) => {
                      if (err) {
                        return done(err);
                      }
                      assert(deleteRes.status, 200, 'Delete Tag');
                      expect(deleteRes.body.data.result).to.equal('Tag deleted');
                      return done();
                    });
                });
            });
          });
        });
    }).catch(done);
  });

  it('Non-admin user(with view/delete permissions) should not be able to delete ref tags', done => {
    const myRole = {
      name: 'bvd_tester',
      description: 'Test role for foundation with view and delete',
      permission: [{
        // eslint-disable-next-line camelcase
        operation_key: 'View',
        // eslint-disable-next-line camelcase
        resource_key: 'default_action<>All'
      },
      {
        // eslint-disable-next-line camelcase
        operation_key: 'Delete',
        // eslint-disable-next-line camelcase
        resource_key: 'default_action<>All'
      }]
    };
    createRole(myRole).then(res => {
      assert.equal(res.status, 200, 'Role creation');
      expect(res.body.role).to.not.equal(null);
      expect(res.body.role.name).to.equal('bvd_tester');
      roles.push(res.body.role.id);
      request
        .post(`${apiTagVal}${mockData.tags[1].name}/${mockData.tags[1].value}`)
        .set('X-Secure-Modify-Token', shared.secureModifyToken())
        .end((err, tagValPostRes) => {
          if (err) {
            return done(err);
          }
          assert(tagValPostRes.status, 200, 'Null ref tag creation');
          nullRefTags.push(mockData.tags[1]);
          request
            .post(apiTag)
            .set('X-Secure-Modify-Token', shared.secureModifyToken())
            .send(mockData.tags[1])
            .end((err, tagPostRes) => {
              if (err) {
                return done(err);
              }
              assert(tagPostRes.status, 200, 'Tag creation');
              expect(tagPostRes.body.data[0].value).to.equal(mockData.tags[1].value);
              shared.logout(request, () => {
                shared.login(request, loginURL, testerUser, nonAdminUser.passwd, () => {
                  request
                    .delete(apiTag.concat(tagPostRes.body.data[0].id))
                    .set('X-Secure-Modify-Token', shared.secureModifyToken())
                    .end((err, deleteRes) => {
                      if (err) {
                        return done(err);
                      }
                      assert.equal(deleteRes.status, 401, 'Tag deletion');
                      expect(deleteRes.body.additionalInfo[0]).to.equal('User has no permission to delete tag.');
                      expect(deleteRes.error.text).not.to.equal('User has no permission to delete tag.');
                      return done();
                    });
                });
              });
            });
        });
    }).catch(done);
  });

  it('Non-admin user(with view/modify permissions) should not be able to update ref tags', done => {
    const myRole = {
      name: 'bvd_tester',
      description: 'Test role for foundation with view and modify',
      permission: [{
        // eslint-disable-next-line camelcase
        operation_key: 'View',
        // eslint-disable-next-line camelcase
        resource_key: 'default_action<>All'
      },
      {
        // eslint-disable-next-line camelcase
        operation_key: 'Modify',
        // eslint-disable-next-line camelcase
        resource_key: 'default_action<>All'
      }]
    };

    createRole(myRole).then(res => {
      assert.equal(res.status, 200, 'Role creation');
      expect(res.body.role).to.not.equal(null);
      expect(res.body.role.name).to.equal('bvd_tester');
      roles.push(res.body.role.id);
      request
        .post(`${apiTagVal}${mockData.tags[1].name}/${mockData.tags[1].value}`)
        .set('X-Secure-Modify-Token', shared.secureModifyToken())
        .end((err, tagValPostRes) => {
          if (err) {
            return done(err);
          }
          assert.equal(tagValPostRes.status, 200, 'Null ref tag creation');
          nullRefTags.push(mockData.tags[1]);
          request
            .post(apiTag)
            .set('X-Secure-Modify-Token', shared.secureModifyToken())
            .send(mockData.tags[1])
            .end((err, tagPostRes) => {
              if (err) {
                return done(err);
              }
              assert.equal(tagPostRes.status, 200, 'Tag creation');
              expect(tagPostRes.body.data[0].value).to.equal(mockData.tags[1].value);
              const tagId = tagPostRes.body.data[0].id;
              shared.logout(request, () => {
                shared.login(request, loginURL, testerUser, nonAdminUser.passwd, () => {
                  const tagToBeUpdated = { ...tagPostRes.body.data[0], refType: 'widget' };
                  request
                    .put(apiTag.concat(tagId))
                    .send(tagToBeUpdated)
                    .set('X-Secure-Modify-Token', shared.secureModifyToken())
                    .end((err, tagPutRes) => {
                      if (err) {
                        return done(err);
                      }
                      assert.equal(tagPutRes.status, 401, 'Tag update');
                      expect(tagPutRes.body.additionalInfo[0]).to.equal('User has no permission to modify tag.');
                      expect(tagPutRes.error.text).not.to.equal('User has no permission to modify tag.');
                      return done();
                    });
                });
              });
            });
        });
    }).catch(done);
  });

  it('Non-admin user(with assignPages permissions for all the groups) should be able to create/get/update/delete ref tags', done => {
    const myRole = {
      name: 'bvd_tester',
      description: 'Test role for foundation with assignPages',
      permission: [{
        // eslint-disable-next-line camelcase
        operation_key: 'AssignPages',
        // eslint-disable-next-line camelcase
        resource_key: 'default_action<>All'
      }]
    };
    createRole(myRole).then(res => {
      assert.equal(res.status, 200, 'Role creation');
      expect(res.body.role).to.not.equal(null);
      expect(res.body.role.name).to.equal('bvd_tester');
      roles.push(res.body.role.id);
      request
        .post(`${apiTagVal}${mockData.tags[1].name}/${mockData.tags[1].value}`)
        .set('X-Secure-Modify-Token', shared.secureModifyToken())
        .end((err, tagValPostRes) => {
          if (err) {
            return done(err);
          }
          assert.equal(tagValPostRes.status, 200, 'Null ref tag creation');
          nullRefTags.push(mockData.tags[1]);
          shared.logout(request, () => {
            shared.login(request, loginURL, testerUser, nonAdminUser.passwd, () => {
              request
                .post(apiTag)
                .set('X-Secure-Modify-Token', shared.secureModifyToken())
                .send(mockData.tags[1])
                .end((err, tagPostRes) => {
                  if (err) {
                    return done(err);
                  }
                  assert.equal(tagPostRes.status, 200, 'Tag creation');
                  expect(tagPostRes.body.data[0].value).to.equal(mockData.tags[1].value);
                  const tagId = tagPostRes.body.data[0].id;
                  const tagToBeUpdated = { ...tagPostRes.body.data[0], refType: 'widget' };
                  request
                    .put(apiTag.concat(tagId))
                    .send(tagToBeUpdated)
                    .set('X-Secure-Modify-Token', shared.secureModifyToken())
                    .end((err, tagPutRes) => {
                      if (err) {
                        return done(err);
                      }
                      assert.equal(tagPutRes.status, 200, 'Tag update');
                      request
                        .delete(apiTag.concat(tagId))
                        .set('X-Secure-Modify-Token', shared.secureModifyToken())
                        .end((err, deleteRes) => {
                          if (err) {
                            return done(err);
                          }
                          assert.equal(deleteRes.status, 200, 'Tag delete');
                          request
                            .get(apiTag.concat(tagId))
                            .end((err, tagGetRes) => {
                              if (err) {
                                return done(err);
                              }
                              assert.equal(tagGetRes.status, 404, 'get Tag');
                              return done();
                            });
                        });
                    });
                });
            });
          });
        });
    }).catch(done);
  });
});

describe('Tags group permissions test', () => {
  let roles = [];
  let pages = [];
  let nullRefTags = [];

  beforeEach(done => {
    roles = [];
    pages = [];
    nullRefTags = [];
    shared.login(request, loginURL, adminLogin, adminPasswd, done);
  });

  afterEach(done => {
    const pagePromises = [];
    const rolePromises = [];
    const nullRefTagsPromises = [];
    shared.logout(request, () => {
      shared.login(request, loginURL, adminLogin, adminPasswd, () => {
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

  it('With Specific group permission, creating a unauthorized rbac tag referring to a page, should throw unauthorized', done => {
    const myRole = {
      name: 'bvd_tester',
      description: 'Test role for foundation with assignPages permission',
      permission: [{
        // eslint-disable-next-line camelcase
        operation_key: 'View',
        // eslint-disable-next-line camelcase
        resource_key: 'default_action<>All'
      }, {
        // eslint-disable-next-line camelcase
        operation_key: 'AssignPages',
        // eslint-disable-next-line camelcase
        resource_key: 'default_action<>Group-grp1'
      }]
    };
    const page = { ...mockData.page, id: 'PageToTestRbacInTags', title: 'PageToTestRbacInTags', tags: []};
    const tag = {
      ref: page.id,
      refType: 'page',
      name: '__rbac',
      value: 'grp2'
    };
    createRole(myRole).then(res => {
      assert.equal(res.status, 200, 'Role creation');
      expect(res.body.role).to.not.equal(null);
      expect(res.body.role.name).to.equal('bvd_tester');
      roles.push(res.body.role.id);
      createPage(page).then(createdPage => {
        assert.equal(createdPage.status, 200, 'Page creation');
        pages.push(page.id);
        shared.logout(request, () => {
          shared.login(request, loginURL, testerUser, nonAdminUser.passwd, () => {
            request
              .post(apiTag)
              .set('X-Secure-Modify-Token', shared.secureModifyToken())
              .send(tag)
              .end((err, tagPostRes) => {
                if (err) {
                  return done(err);
                }
                expect(tagPostRes.status).to.equal(401);
                expect(tagPostRes.body.additionalInfo[0]).to.equal('User has no permission to create tag(s).');
                expect(tagPostRes.error.text).not.to.equal('User has no permission to create tag(s).');
                return done();
              });
          });
        });
      }).catch(done);
    }).catch(done);
  });

  it('With Specific group permission, creating a authorized rbac tag referring to a page, should be successful', done => {
    const myRole = {
      name: 'bvd_tester',
      description: 'Test role for foundation with assignPages permission',
      permission: [{
        // eslint-disable-next-line camelcase
        operation_key: 'View',
        // eslint-disable-next-line camelcase
        resource_key: 'default_action<>All'
      }, {
        // eslint-disable-next-line camelcase
        operation_key: 'AssignPages',
        // eslint-disable-next-line camelcase
        resource_key: 'default_action<>Group-grp1'
      }]
    };
    const page = { ...mockData.page, id: 'PageToTestRbacInTags', title: 'PageToTestRbacInTags', tags: []};
    const tag = {
      ref: page.id,
      refType: 'page',
      name: '__rbac',
      value: 'grp1'
    };

    createRole(myRole).then(res => {
      assert.equal(res.status, 200, 'Role creation');
      expect(res.body.role).to.not.equal(null);
      expect(res.body.role.name).to.equal('bvd_tester');
      roles.push(res.body.role.id);
      createPage(page).then(createdPage => {
        assert.equal(createdPage.status, 200, 'Page creation');
        pages.push(page.id);
        request
          .post(`${apiTagVal}${tag.name}/${tag.value}`)
          .set('X-Secure-Modify-Token', shared.secureModifyToken())
          .end((err, tagValPostRes) => {
            if (err) {
              return done(err);
            }
            assert.equal(tagValPostRes.status, 200, 'Null ref tag creation');
            nullRefTags.push(tag);
            shared.logout(request, () => {
              shared.login(request, loginURL, testerUser, nonAdminUser.passwd, () => {
                request
                  .post(apiTag)
                  .set('X-Secure-Modify-Token', shared.secureModifyToken())
                  .send(tag)
                  .end((err, tagPostRes) => {
                    if (err) {
                      return done(err);
                    }
                    assert.equal(tagPostRes.status, 200, 'Tag creation');
                    return done();
                  });
              });
            });
          });
      }).catch(done);
    }).catch(done);
  });

  it('With Specific group permission, updating a page to a different page group, should throw unauthorized', done => {
    const myRole = {
      name: 'bvd_tester',
      description: 'Test role for foundation with assignPages permission',
      permission: [{
        // eslint-disable-next-line camelcase
        operation_key: 'View',
        // eslint-disable-next-line camelcase
        resource_key: 'default_action<>All'
      }, {
        // eslint-disable-next-line camelcase
        operation_key: 'Create',
        // eslint-disable-next-line camelcase
        resource_key: 'default_action<>All'
      }, {
        // eslint-disable-next-line camelcase
        operation_key: 'AssignPages',
        // eslint-disable-next-line camelcase
        resource_key: 'default_action<>Group-grp1'
      }]
    };
    const page = { ...mockData.page,
      id: 'PageToTestRbacInTags',
      title: 'PageToTestRbacInTags',
      tags: [{
        name: '__rbac', values: ['grp1']
      }]};

    createRole(myRole).then(res => {
      assert.equal(res.status, 200, 'Role creation');
      expect(res.body.role).to.not.equal(null);
      expect(res.body.role.name).to.equal('bvd_tester');
      roles.push(res.body.role.id);
      shared.logout(request, () => {
        shared.login(request, loginURL, testerUser, nonAdminUser.passwd, () => {
          createPage(page).then(pageCreateRes => {
            assert.equal(pageCreateRes.status, 200, 'Page creation');
            expect(pageCreateRes.body.error).to.equal(false);
            pages.push(page.id);
            request
              .get(apiTag)
              .query(`refType=page&ref=${page.id}`)
              .end((err, tagGetRes) => {
                if (err) {
                  return done(err);
                }
                assert.equal(tagGetRes.status, 200, 'Tag creation');
                const tagToBeUpdated = { ...tagGetRes.body.data[0], value: 'grp2' };
                request
                  .put(apiTag.concat(tagGetRes.body.data[0].id))
                  .send(tagToBeUpdated)
                  .set('X-Secure-Modify-Token', shared.secureModifyToken())
                  .end((err, tagPutRes) => {
                    if (err) {
                      return done(err);
                    }
                    assert.equal(tagPutRes.status, 401, 'Tag update');
                    expect(tagPutRes.body.additionalInfo[0]).to.equal('User has no permission to modify tag.');
                    expect(tagPutRes.error.text).not.to.equal('User has no permission to modify tag.');
                    return done();
                  });
              });
          });
        });
      });
    }).catch(done);
  });

  it('With Specific group permission, deleting a rbac tag, should throw unauthorized', done => {
    const myRole = {
      name: 'bvd_tester',
      description: 'Test role for foundation with assignPages permission',
      permission: [{
        // eslint-disable-next-line camelcase
        operation_key: 'View',
        // eslint-disable-next-line camelcase
        resource_key: 'default_action<>All'
      }, {
        // eslint-disable-next-line camelcase
        operation_key: 'Create',
        // eslint-disable-next-line camelcase
        resource_key: 'default_action<>All'
      }, {
        // eslint-disable-next-line camelcase
        operation_key: 'AssignPages',
        // eslint-disable-next-line camelcase
        resource_key: 'default_action<>Group-grp1'
      }]
    };
    const page = { ...mockData.page,
      id: 'PageToTestRbacInTags',
      title: 'PageToTestRbacInTags',
      tags: [{
        name: '__rbac', values: ['grp2']
      }]};

    createRole(myRole).then(res => {
      assert.equal(res.status, 200, 'Role creation');
      expect(res.body.role).to.not.equal(null);
      expect(res.body.role.name).to.equal('bvd_tester');
      roles.push(res.body.role.id);
      createPage(page).then(createdPage => {
        assert.equal(createdPage.status, 200, 'Page creation');
        pages.push(page.id);
        shared.logout(request, () => {
          shared.login(request, loginURL, testerUser, nonAdminUser.passwd, () => {
            request
              .delete(apiTag)
              .query(`refType=page&ref=${page.id}`)
              .set('X-Secure-Modify-Token', shared.secureModifyToken())
              .end((err, deleteRes) => {
                if (err) {
                  return done(err);
                }
                assert.equal(deleteRes.status, 401, 'Tag deletion');
                expect(deleteRes.body.additionalInfo[0]).to.equal(`User has no permission to delete tag with ref ${page.id}`);
                expect(deleteRes.error.text).not.to.equal(`User has no permission to delete tag with ref ${page.id}`);
                return done();
              });
          });
        });
      }).catch(done);
    }).catch(done);
  });

  it('With Specific group permission, putting the page under different group should throw unauthorized', done => {
    const myRole = {
      name: 'bvd_tester',
      description: 'Test role for foundation',
      permission: [
        {
          // eslint-disable-next-line camelcase
          operation_key: 'AssignPages',
          // eslint-disable-next-line camelcase
          resource_key: 'default_action<>Group-nom'
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
        }
      ]
    };
    const testPages = [{ ...mockData.page,
      id: 'PageWithAuthorizedRbacTag',
      title: 'PageWithAuthorizedRbacTag',
      tags: [{
        name: '__rbac', values: ['nom']
      }]},
    { ...mockData.page,
      id: 'PageWithUnauthorizedRbacTag',
      title: 'PageWithUnauthorizedRbacTag',
      tags: [{
        name: '__rbac', values: ['dca']
      }]}];

    createRole(myRole).then(res => {
      expect(res.status).to.equal(200);
      expect(res.body.role).to.not.equal(null);
      expect(res.body.role.name).to.equal('bvd_tester');
      roles.push(res.body.role.id);
      shared.createItems(request, apiPage, testPages, () => {
        pages.push(testPages[0].id);
        pages.push(testPages[1].id);
        shared.logout(request, () => {
          shared.login(request, loginURL, testerUser, nonAdminUser.passwd, () => {
            const tagToBeCreated = { name: '__rbac', value: 'sitescope', ref: testPages[1].id, refType: 'page' };
            request
              .post(apiTag)
              .set('X-Secure-Modify-Token', shared.secureModifyToken())
              .send(tagToBeCreated)
              .end((err, tagPostRes) => {
                if (err) {
                  return done(err);
                }
                expect(tagPostRes.status).to.equal(401);
                expect(tagPostRes.body.additionalInfo[0]).to.equal('User has no permission to create tag(s).');
                expect(tagPostRes.text).not.to.equal('User has no permission to create tag(s).');
                return done();
              });
          });
        });
      });
    }).catch(done);
  });

  it('With Specific group permission, putting the page under same group should pass', done => {
    const myRole = {
      name: 'bvd_tester',
      description: 'Test role for foundation',
      permission: [
        {
          // eslint-disable-next-line camelcase
          operation_key: 'AssignPages',
          // eslint-disable-next-line camelcase
          resource_key: 'default_action<>Group-nom'
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
        }
      ]
    };
    const testPages = [{ ...mockData.page,
      id: 'PageWithAuthorizedRbacTag',
      title: 'PageWithAuthorizedRbacTag',
      tags: [{
        name: '__rbac', values: ['nom']
      }]},
    { ...mockData.page,
      id: 'PageWithUnauthorizedRbacTag',
      title: 'PageWithUnauthorizedRbacTag',
      tags: [{
        name: '__rbac', values: ['dca']
      }]}];
    createRole(myRole).then(res => {
      assert.equal(res.status, 200, 'Roles creation');
      expect(res.body.role).to.not.equal(null);
      expect(res.body.role.name).to.equal('bvd_tester');
      roles.push(res.body.role.id);
      shared.createItems(request, apiPage, pages, () => {
        pages.push(testPages[0].id);
        pages.push(testPages[1].id);
        shared.logout(request, () => {
          shared.login(request, loginURL, testerUser, nonAdminUser.passwd, () => {
            const tagToBeCreated = { name: '__rbac', value: 'nom', ref: testPages[1].id, refType: 'page' };
            request
              .post(apiTag)
              .set('X-Secure-Modify-Token', shared.secureModifyToken())
              .send(tagToBeCreated)
              .end((err, tagPostRes) => {
                if (err) {
                  return done(err);
                }
                expect(tagPostRes.status).to.equal(200);
                return done();
              });
          });
        });
      });
    }).catch(done);
  });

  it('With Specific group permission, deletion of page under the same group should pass', done => {
    const myRole = {
      name: 'bvd_tester',
      description: 'Test role for foundation',
      permission: [
        {
          // eslint-disable-next-line camelcase
          operation_key: 'AssignPages',
          // eslint-disable-next-line camelcase
          resource_key: 'default_action<>Group-nom'
        },
        {
          // eslint-disable-next-line camelcase
          operation_key: 'Delete',
          // eslint-disable-next-line camelcase
          resource_key: 'default_action<>Group-nom'
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
        }
      ]
    };
    const page = { ...mockData.page,
      id: 'PageWithAuthorizedRbacTag',
      title: 'PageWithAuthorizedRbacTag',
      tags: [{
        name: '__rbac', values: ['nom']
      }]};
    createRole(myRole).then(res => {
      assert.equal(res.status, 200, 'Roles creation');
      expect(res.body.role).to.not.equal(null);
      expect(res.body.role.name).to.equal('bvd_tester');
      roles.push(res.body.role.id);
      createPage(page).then(createPageRes => {
        assert.equal(createPageRes.status, 200, 'Page creation');
        pages.push(page.id);
        shared.logout(request, () => {
          shared.login(request, loginURL, testerUser, nonAdminUser.passwd, () => {
            deletePage(page.id).then(deletePageRes => {
              assert.equal(deletePageRes.status, 200, 'Page deletion');
              pages.pop();
              return done();
            }).catch(done);
          });
        });
      }).catch(done);
    }).catch(done);
  });

  it('With specific group permission, deletion of page under the different group should throw unauthorized', done => {
    const myRole = {
      name: 'bvd_tester',
      description: 'Test role for foundation',
      permission: [
        {
          // eslint-disable-next-line camelcase
          operation_key: 'AssignPages',
          // eslint-disable-next-line camelcase
          resource_key: 'default_action<>Group-nom'
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
        }
      ]
    };
    const testPages = [{ ...mockData.page,
      id: 'PageWithAuthorizedRbacTag',
      title: 'PageWithAuthorizedRbacTag',
      tags: [{
        name: '__rbac', values: ['nom']
      }]},
    { ...mockData.page,
      id: 'PageWithUnauthorizedRbacTag',
      title: 'PageWithUnauthorizedRbacTag',
      tags: [{
        name: '__rbac', values: ['dca']
      }]}];

    createRole(myRole).then(res => {
      assert.equal(res.status, 200, 'Roles creation');
      expect(res.body.role).to.not.equal(null);
      expect(res.body.role.name).to.equal('bvd_tester');
      roles.push(res.body.role.id);
      shared.createItems(request, apiPage, testPages, () => {
        pages.push(testPages[0].id);
        pages.push(testPages[1].id);
        shared.logout(request, () => {
          shared.login(request, loginURL, testerUser, nonAdminUser.passwd, () => {
            deletePage(testPages[1].id).then(deletePageRes => {
              expect(deletePageRes.status).to.equal(401);
              expect(deletePageRes.body.additionalInfo[0]).to.equal('User has no permission to delete page.');
              expect(deletePageRes.text).not.to.equal('User has no permission to delete page.');
              return done();
            }).catch(done);
          });
        });
      });
    }).catch(done);
  });

  it('With specific group permission, deletion of tags referring to page(part of different groups) should throw unauthorized', done => {
    const myRole = {
      name: 'bvd_tester',
      description: 'Test role for foundation',
      permission: [
        {
          // eslint-disable-next-line camelcase
          operation_key: 'AssignPages',
          // eslint-disable-next-line camelcase
          resource_key: 'default_action<>Group-nom'
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
        }
      ]
    };
    const page = { ...mockData.page,
      id: 'PageWithAUnAuthorizedRbacTag',
      title: 'PageWithAUnAuthorizedRbacTag',
      tags: [{
        name: '__rbac', values: ['nom', 'dca']
      }]};
    createRole(myRole).then(res => {
      assert.equal(res.status, 200, 'Role creation');
      expect(res.body.role).to.not.equal(null);
      expect(res.body.role.name).to.equal('bvd_tester');
      roles.push(res.body.role.id);
      createPage(page).then(createPageRes => {
        assert.equal(createPageRes.status, 200, 'Page creation');
        pages.push(page.id);
        shared.logout(request, () => {
          shared.login(request, loginURL, testerUser, nonAdminUser.passwd, () => {
            request
              .delete(apiTag)
              .set('X-Secure-Modify-Token', shared.secureModifyToken())
              .query(`refType=page&ref=${page.id}`)
              .end((err, tagDeleteRes) => {
                if (err) {
                  return done(err);
                }
                assert.equal(tagDeleteRes.status, 401, 'Tag deletion');
                expect(tagDeleteRes.body.additionalInfo[0]).to.equal(`User has no permission to delete tag with ref ${page.id}`);
                expect(tagDeleteRes.text).not.to.equal(`User has no permission to delete tag with ref ${page.id}`);
                return done();
              });
          });
        });
      }).catch(done);
    }).catch(done);
  });

  it('With memberOfAnyGroup permission, should be able to attach a rbac tag to a page with no rbac tag assigned', done => {
    const page = { ...mockData.page,
      id: 'PageWithoutRbacTag',
      title: 'PageWithoutRbacTag',
      tags: [{
        name: '__system', values: ['nom_ultimate']
      }]};
    const tagNom = { name: '__rbac', value: 'nom_somthing' };

    createRole(roleWithAssignPagesAndMemberOfAnyGrpPerm).then(res => {
      assert.equal(res.status, 200, 'Role creation');
      expect(res.body.role).to.not.equal(null);
      expect(res.body.role.name).to.equal('bvd_tester');
      roles.push(res.body.role.id);
      createPage(page).then(createPageRes => {
        assert.equal(createPageRes.status, 200, 'Page creation');
        pages.push(page.id);
        request
          .post(`${apiTagVal}${tagNom.name}/${tagNom.value}`)
          .set('X-Secure-Modify-Token', shared.secureModifyToken())
          .end((err, tagValPostRes) => {
            if (err) {
              return done(err);
            }
            assert.equal(tagValPostRes.status, 200, 'Null ref tag creation');
            nullRefTags.push(tagNom);
            shared.logout(request, () => {
              shared.login(request, loginURL, testerUser, nonAdminUser.passwd, () => {
                const tagToBeCreated = { name: tagNom.name, value: tagNom.value, ref: page.id, refType: 'page' };
                request
                  .post(apiTag)
                  .set('X-Secure-Modify-Token', shared.secureModifyToken())
                  .send(tagToBeCreated)
                  .end((err, tagPostRes) => {
                    if (err) {
                      return done(err);
                    }
                    assert.equal(tagPostRes.status, 200, 'Tag creation');
                    return done();
                  });
              });
            });
          });
      }).catch(done);
    }).catch(done);
  });

  it('With memberOfAnyGroup permission, should be able to attach a rbac tag to a page which is part of some group', done => {
    const page = { ...mockData.page,
      id: 'PageWithRbacTag',
      title: 'PageWithRbacTag',
      tags: [{
        name: '__rbac', values: ['nom']
      }]};

    createRole(roleWithAssignPagesAndMemberOfAnyGrpPerm).then(res => {
      assert.equal(res.status, 200, 'Role creation');
      expect(res.body.role).to.not.equal(null);
      expect(res.body.role.name).to.equal('bvd_tester');
      roles.push(res.body.role.id);
      request
        .post(`${apiTagVal}${mockData.tags[0].name}/${mockData.tags[0].value}`)
        .set('X-Secure-Modify-Token', shared.secureModifyToken())
        .end((err, tagValPostRes) => {
          if (err) {
            return done(err);
          }
          assert.equal(tagValPostRes.status, 200, 'Null ref tag creation');
          nullRefTags.push(mockData.tags[0]);
          createPage(page).then(createPageRes => {
            assert.equal(createPageRes.status, 200, 'Page creation');
            pages.push(page.id);
            shared.logout(request, () => {
              shared.login(request, loginURL, testerUser, nonAdminUser.passwd, () => {
                const tagToBeCreated = { name: mockData.tags[0].name, value: mockData.tags[0].value, ref: page.id, refType: 'page' };
                request
                  .post(apiTag)
                  .set('X-Secure-Modify-Token', shared.secureModifyToken())
                  .send(tagToBeCreated)
                  .end((err, tagPostRes) => {
                    if (err) {
                      return done(err);
                    }
                    assert.equal(tagPostRes.status, 200, 'Tag creation');
                    return done();
                  });
              });
            });
          }).catch(done);
        });
    }).catch(done);
  });

  it('With memberOfAnyGroup permission, should be able to delete a rbac tag referring to a page', done => {
    const page = { ...mockData.page,
      id: 'PageWithRbacTag',
      title: 'PageWithRbacTag',
      tags: [{
        name: '__rbac', values: ['nom']
      }]};
    createRole(roleWithAssignPagesAndMemberOfAnyGrpPerm).then(res => {
      assert.equal(res.status, 200, 'Role creation');
      expect(res.body.role).to.not.equal(null);
      expect(res.body.role.name).to.equal('bvd_tester');
      roles.push(res.body.role.id);
      createPage(page).then(pageCreateRes => {
        assert.equal(pageCreateRes.status, 200, 'Page creation');
        pages.push(page.id);
        shared.logout(request, () => {
          shared.login(request, loginURL, testerUser, nonAdminUser.passwd, () => {
            request
              .delete(apiTag)
              .set('X-Secure-Modify-Token', shared.secureModifyToken())
              .query(`refType=page&ref=${page.id}`)
              .end((err, tagDeleteRes) => {
                if (err) {
                  return done(err);
                }
                assert.equal(tagDeleteRes.status, 200, 'Tag deletion');
                expect(tagDeleteRes.body.data.result).to.equal('Tags deleted');
                return done();
              });
          });
        });
      }).catch(done);
    }).catch(done);
  });

  it('With memberOfAnyGroup permission, should be able to modify a rbac tag referring to a page', done => {
    const page = { ...mockData.page,
      id: 'PageWithRbacTag',
      title: 'PageWithRbacTag',
      tags: [{
        name: '__rbac', values: ['nom']
      }]};
    const tag = { name: '__rbac', value: 'read' };

    createRole(roleWithAssignPagesAndMemberOfAnyGrpPerm).then(res => {
      assert.equal(res.status, 200, 'Role creation');
      expect(res.body.role).to.not.equal(null);
      expect(res.body.role.name).to.equal('bvd_tester');
      roles.push(res.body.role.id);
      createPage(page).then(pageCreateRes => {
        assert.equal(pageCreateRes.status, 200, 'Page creation');
        pages.push(page.id);
        request
          .post(`${apiTagVal}${tag.name}/${tag.value}`)
          .set('X-Secure-Modify-Token', shared.secureModifyToken())
          .end((err, tagValPostRes) => {
            if (err) {
              return done(err);
            }
            assert.equal(tagValPostRes.status, 200, 'Null ref tag creation');
            nullRefTags.push(tag);
            shared.logout(request, () => {
              shared.login(request, loginURL, testerUser, nonAdminUser.passwd, () => {
                request
                  .get(apiTag)
                  .query(`refType=page&ref=${page.id}`)
                  .end((err, tagGetRes) => {
                    if (err) {
                      return done(err);
                    }
                    assert.equal(tagGetRes.status, 200, 'get Tag');
                    // __Owner tag was added too during page creation
                    expect(tagGetRes.body.data.length).to.be.at.least(2);
                    const rbacTag = tagGetRes.body.data.find(eachTag => eachTag.name === '__rbac');
                    const tagToBeUpdated = { ...rbacTag, value: tag.value };
                    request
                      .put(apiTag.concat(rbacTag.id))
                      .set('X-Secure-Modify-Token', shared.secureModifyToken())
                      .send(tagToBeUpdated)
                      .end((err, tagUpdateRes) => {
                        if (err) {
                          return done(err);
                        }
                        assert.equal(tagUpdateRes.status, 200, 'Tag update');
                        expect(tagUpdateRes.body.data.value).to.equal(tagToBeUpdated.value);
                        return done();
                      });
                  });
              });
            });
          });
      }).catch(done);
    }).catch(done);
  });

  it('With memberOfNoGroup permission, should not be able to create tags', done => {
    const page = { ...mockData.page,
      id: 'PageWithNoTag',
      title: 'PageWithNoTag',
      tags: []};
    createRole(roleWithAssignPagesAndMemberOfNoGrpPerm).then(res => {
      assert.equal(res.status, 200, 'Role creation');
      expect(res.body.role).to.not.equal(null);
      expect(res.body.role.name).to.equal('bvd_tester');
      roles.push(res.body.role.id);
      createPage(page).then(createPageRes => {
        assert.equal(createPageRes.status, 200, 'Page creation');
        pages.push(page.id);
        shared.logout(request, () => {
          shared.login(request, loginURL, testerUser, nonAdminUser.passwd, () => {
            const tagToBeCreated = { name: mockData.tags[0].name, value: mockData.tags[0].value, ref: page.id, refType: 'page' };
            request
              .post(apiTag)
              .set('X-Secure-Modify-Token', shared.secureModifyToken())
              .send(tagToBeCreated)
              .end((err, tagPostRes) => {
                if (err) {
                  return done(err);
                }
                assert.equal(tagPostRes.status, 401, 'Tag creation');
                expect(tagPostRes.body.additionalInfo[0]).to.equal('User has no permission to create tag(s).');
                expect(tagPostRes.text).not.to.equal('User has no permission to create tag(s).');
                return done();
              });
          });
        });
      }).catch(done);
    }).catch(done);
  });

  it('With memberOfNoGroup permission, should not be able to delete tags', done => {
    const page = { ...mockData.page,
      id: 'PageWithRbacTag',
      title: 'PageWithRbacTag',
      tags: [{
        name: '__rbac', values: ['nom']
      }]};
    createRole(roleWithAssignPagesAndMemberOfNoGrpPerm).then(res => {
      assert.equal(res.status, 200, 'Role creation');
      expect(res.body.role).to.not.equal(null);
      expect(res.body.role.name).to.equal('bvd_tester');
      roles.push(res.body.role.id);
      createPage(page).then(createPageRes => {
        assert.equal(createPageRes.status, 200, 'Page creation');
        pages.push(page.id);
        shared.logout(request, () => {
          shared.login(request, loginURL, testerUser, nonAdminUser.passwd, () => {
            request
              .delete(apiTag)
              .query(`refType=page&ref=${page.id}`)
              .set('X-Secure-Modify-Token', shared.secureModifyToken())
              .end((err, tagDeleteRes) => {
                if (err) {
                  return done(err);
                }
                assert.equal(tagDeleteRes.status, 401, 'Tag deletion');
                expect(tagDeleteRes.body.additionalInfo[0]).to.equal(`User has no permission to delete tag with ref ${page.id}`);
                expect(tagDeleteRes.text).not.to.equal(`User has no permission to delete tag with ref ${page.id}`);
                return done();
              });
          });
        });
      }).catch(done);
    }).catch(done);
  });

  it('With memberOfNoGroup permission, should not be able to modify tags', done => {
    const page = { ...mockData.page,
      id: 'PageWithRbacTag',
      title: 'PageWithRbacTag',
      tags: [{
        name: '__rbac', values: ['nom']
      }]};

    createRole(roleWithAssignPagesAndMemberOfNoGrpPerm).then(res => {
      assert.equal(res.status, 200, 'Role creation');
      expect(res.body.role).to.not.equal(null);
      expect(res.body.role.name).to.equal('bvd_tester');
      roles.push(res.body.role.id);
      createPage(page).then(pageCreateRes => {
        assert.equal(pageCreateRes.status, 200, 'Page creation');
        pages.push(page.id);
        shared.logout(request, () => {
          shared.login(request, loginURL, testerUser, nonAdminUser.passwd, () => {
            request
              .get(apiTag)
              .query(`refType=page&ref=${page.id}`)
              .end((err, tagGetRes) => {
                if (err) {
                  return done(err);
                }
                assert.equal(tagGetRes.status, 200, 'get Tag');
                expect(tagGetRes.body.data.length).to.be.at.least(1);
                const tagToBeUpdated = { ...tagGetRes.body.data[0], value: 'finance' };
                request
                  .put(apiTag.concat(tagGetRes.body.data[0].id))
                  .set('X-Secure-Modify-Token', shared.secureModifyToken())
                  .send(tagToBeUpdated)
                  .end((err, tagUpdateRes) => {
                    if (err) {
                      return done(err);
                    }
                    assert.equal(tagUpdateRes.status, 401, 'Update tag');
                    expect(tagUpdateRes.body.additionalInfo[0]).to.equal('User has no permission to modify tag.');
                    expect(tagUpdateRes.text).not.to.equal('User has no permission to modify tag.');
                    return done();
                  });
              });
          });
        });
      }).catch(done);
    }).catch(done);
  });

  it('Non admin (User with AssignPages on group) should be able to get known rbac tags by name', done => {
    const rbacTag = {
      name: '__rbac',
      value: 'newGroup'
    };
    // User with AssignPages on group
    const newRole = {
      name: 'bvd_tester',
      // eslint-disable-next-line camelcase
      permission: [{ operation_key: 'AssignPages', resource_key: 'default_action<>Group-newGroup' }]
    };
    createRole(newRole).then(res => {
      assert.equal(res.status, 200, 'Role creation');
      expect(res.body.role.name).to.equal('bvd_tester');
      roles.push(res.body.role.id);
      request
        .post(`${apiTagVal}${rbacTag.name}/${rbacTag.value}`)
        .set('X-Secure-Modify-Token', shared.secureModifyToken())
        .end((err, result) => {
          if (err) {
            return done(err);
          }
          assert.equal(result.status, 200, 'Null ref tag creation');
          nullRefTags.push(rbacTag);
          expect(result.body.data.value).to.be.eq(rbacTag.value);
          shared.logout(request, () => {
            shared.login(request, loginURL, testerUser, nonAdminUser.passwd, () => {
              request
                .get(`${apiTagVal}${rbacTag.name}`)
                .set('X-Secure-Modify-Token', shared.secureModifyToken())
                .end((err, _result) => {
                  if (err) {
                    return done(err);
                  }
                  assert.equal(_result.body.data.length, 1, 'get Tag');
                  expect(_result.body.data).to.include.members(['newGroup']);
                  return done();
                });
            });
          });
        });
    }).catch(done);
  });

  it('Non admin (User with AssignPages on group along with MemberOfNoGroup) should be able to get known rbac tags by name', done => {
    const rbacTag = {
      name: '__rbac',
      value: 'newGroup'
    };
    // User with AssignPages on group along with MemberOfNoGroup
    const newRole = {
      name: 'bvd_tester',
      permission: [
        // eslint-disable-next-line camelcase
        { operation_key: 'AssignPages', resource_key: 'default_action<>Group-newGroup' },
        // eslint-disable-next-line camelcase
        { operation_key: 'AssignPages', resource_key: 'default_action<>MemberOfNoGroup' }
      ]
    };
    createRole(newRole).then(res => {
      assert.equal(res.status, 200, 'Role creation');
      expect(res.body.role.name).to.equal('bvd_tester');
      roles.push(res.body.role.id);
      request
        .post(`${apiTagVal}${rbacTag.name}/${rbacTag.value}`)
        .set('X-Secure-Modify-Token', shared.secureModifyToken())
        .end((err, result) => {
          if (err) {
            return done(err);
          }
          assert.equal(result.status, 200, 'Null ref tag creation');
          expect(result.body.data.value).to.be.eq(rbacTag.value);
          nullRefTags.push(rbacTag);
          shared.logout(request, () => {
            shared.login(request, loginURL, testerUser, nonAdminUser.passwd, () => {
              request
                .get(`${apiTagVal}${rbacTag.name}`)
                .set('X-Secure-Modify-Token', shared.secureModifyToken())
                .end((err, _result) => {
                  if (err) {
                    return done(err);
                  }
                  assert.equal(_result.body.data.length, 1, 'get Tag');
                  expect(_result.body.data).to.include.members(['newGroup']);
                  return done();
                });
            });
          });
        });
    }).catch(done);
  });

  it('Non admin (User with AssignPages on MemberOfNoGroup and FullControl on MemberOfAnyGroup) should be able to get known rbac tags by name', done => {
    const rbacTag = {
      name: '__rbac',
      value: 'newGroup'
    };
    // User with AssignPages on MemberOfNoGroup and FullControl on MemberOfAnyGroup
    const newRole = {
      name: 'bvd_tester',
      permission: [
        // eslint-disable-next-line camelcase
        { operation_key: 'FullControl', resource_key: 'default_action<>MemberOfAnyGroup' },
        // eslint-disable-next-line camelcase
        { operation_key: 'AssignPages', resource_key: 'default_action<>MemberOfNoGroup' }
      ]
    };
    createRole(newRole).then(res => {
      assert.equal(res.status, 200, 'Page creation');
      expect(res.body.role.name).to.equal('bvd_tester');
      roles.push(res.body.role.id);
      request
        .post(`${apiTagVal}${rbacTag.name}/${rbacTag.value}`)
        .set('X-Secure-Modify-Token', shared.secureModifyToken())
        .end((err, result) => {
          if (err) {
            return done(err);
          }
          assert.equal(result.status, 200, 'Null ref tag creation');
          expect(result.body.data.value).to.be.eq(rbacTag.value);
          nullRefTags.push(rbacTag);
          shared.logout(request, () => {
            shared.login(request, loginURL, testerUser, nonAdminUser.passwd, () => {
              request
                .get(`${apiTagVal}${rbacTag.name}`)
                .set('X-Secure-Modify-Token', shared.secureModifyToken())
                .end((err, _result) => {
                  if (err) {
                    return done(err);
                  }
                  expect(_result.body.data).to.include.members(['newGroup']);
                  return done();
                });
            });
          });
        });
    }).catch(done);
  });

  it('Non admin (User with FullControl on MemberOfNoGroup) should get empty rbac tags', done => {
    const rbacTag = {
      name: '__rbac',
      value: 'newGroup'
    };
    // User with FullControl on MemberOfNoGroup
    const newRole = {
      name: 'bvd_tester',
      // eslint-disable-next-line camelcase
      permission: [{ operation_key: 'FullControl', resource_key: 'default_action<>MemberOfNoGroup' }]
    };
    createRole(newRole).then(res => {
      assert.equal(res.status, 200, 'Role creation');
      expect(res.body.role.name).to.equal('bvd_tester');
      roles.push(res.body.role.id);
      request
        .post(`${apiTagVal}${rbacTag.name}/${rbacTag.value}`)
        .set('X-Secure-Modify-Token', shared.secureModifyToken())
        .end((err, result) => {
          if (err) {
            return done(err);
          }
          assert.equal(result.status, 200, 'Null ref tag creation');
          expect(result.body.data.value).to.be.eq(rbacTag.value);
          nullRefTags.push(rbacTag);
          shared.logout(request, () => {
            shared.login(request, loginURL, testerUser, nonAdminUser.passwd, () => {
              request
                .get(`${apiTagVal}${rbacTag.name}`)
                .set('X-Secure-Modify-Token', shared.secureModifyToken())
                .end((err, _result) => {
                  if (err) {
                    return done(err);
                  }
                  assert.equal(_result.statusCode, 404, 'get Tag');
                  return done();
                });
            });
          });
        });
    }).catch(done);
  });
});
