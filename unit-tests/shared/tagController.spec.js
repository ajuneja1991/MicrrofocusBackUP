/* eslint-disable node/no-sync, camelcase, node/no-process-env, node/global-require, no-unused-expressions */
const {
  randomUUID
} = require('crypto');
const db = require('../helpers/db');
const app = require('../../../shared/app');

const tenant = {
  name: randomUUID(),
  default: false,
  apiKey: randomUUID()
};

describe('TagController tests', () => {
  let tenantId;
  const tagData = [{
    name: '__licenses',
    value: 'bvd_licenseB',
    ref: 'testPage',
    refType: 'page'
  },
  {
    name: '__system',
    value: 'bvd_excludeA',
    ref: 'testPage',
    refType: 'page'
  },
  {
    name: '__licenses',
    value: 'licenseA',
    ref: 'testPage',
    refType: 'page'
  }
  ];
  const ref = 'testPage';
  const refType = 'page';
  const tagName = null;
  const ids = [];

  const prepareMocks = function() {
    tagData[0].tenant = tenantId;
    tagData[1].tenant = tenantId;
    tagData[2].tenant = tenantId;
  };

  before(function(done) {
    /* set the timeout for mocha tests to 10sec */
    this.timeout(100000);
    db.cleanAll(err => {
      if (err) {
        return done(err);
      }

      app.controllers.bvdTenant.create(tenant, (err, tenant1Doc) => {
        if (err) {
          return done(err);
        }
        tenantId = tenant1Doc._id;
        prepareMocks();
        done();
      });
    });
  });

  after(function(done) {
    /* set the timeout for mocha tests to 10sec */
    this.timeout(100000);
    app.controllers.bvdTenant.remove({
      name: tenant.name
    }, err => {
      if (err) {
        return done(err);
      }

      db.cleanAll(err => {
        if (err) {
          return done(err);
        }
        done(); // tell mocha that the tear down code is finished
      });
    });
  });

  it('Create Tags', done => {
    app.controllers.tagController.createTag(tagData[0], (err, tag) => {
      if (err) {
        return done(err);
      }
      expect(tag.value).to.be.equal(tagData[0].value);
      ids[0] = tag.id;
      app.controllers.tagController.createTag(tagData[1], (err, _tag) => {
        if (err) {
          return done(err);
        }
        expect(_tag.value).to.be.equal(tagData[1].value);
        app.controllers.tagController.createTag(tagData[2], (err, __tag) => {
          if (err) {
            return done(err);
          }
          expect(__tag.value).to.be.equal(tagData[2].value);
          app.controllers.tagController.getTagsByRef(ref, refType, tagName, tenantId, (err, tags) => {
            if (err) {
              return done(err);
            }
            expect(tags.length).to.be.equal(3);
            return done();
          });
        });
      });
    });
  });

  it('Get all Tags', done => {
    app.controllers.tagController.getAllTags(tenantId, (err, tags) => {
      if (err) {
        return done(err);
      }
      expect(tags.length).to.be.equal(3);
      return done();
    });
  });

  it('Get Tag By Tag id', done => {
    app.controllers.tagController.getTagById(ids[0], tenantId, (err, tag) => {
      if (err) {
        return done(err);
      }
      expect(tag.id).to.be.equal(ids[0]);
      return done();
    });
  });

  it('Get Tags By Tag reference', done => {
    app.controllers.tagController.getTagsByRef(ref, refType, tagName, tenantId, (err, tags) => {
      if (err) {
        return done(err);
      }
      expect(tags.length).to.be.equal(3);
      return done();
    });
  });

  it('Get Tag that does not exist', done => {
    app.controllers.tagController.getTagById('notExist', tenantId, (err, tag) => {
      if (err) {
        return done(err);
      }
      expect(tag).to.be.equal(undefined);
      return done();
    });
  });

  it('Update tag by id', done => {
    app.controllers.tagController.getAllTags(tenantId, (err, tags) => {
      if (err) {
        return done(err);
      }
      const value = tags[0].value;
      tags[0].value = 'test';
      app.controllers.tagController.updateTagById(tags[0], tenantId, (err, tag) => {
        if (err) {
          return done(err);
        }
        expect(tag.name).to.be.equal(tags[0].name);
        expect(tag.value).not.to.be.equal(value);
        expect(tag.value).to.be.equal('test');
        app.controllers.tagController.getTagById(tag.id, tenantId, (err, fetchedTag) => {
          if (err) {
            return done(err);
          }
          expect(fetchedTag.id).to.be.equal(tags[0].id);
          expect(fetchedTag.value).to.be.equal('test');
          return done();
        });
      });
    });
  });

  it('Delete tag by id', done => {
    app.controllers.tagController.getAllTags(tenantId, (err, tags) => {
      if (err) {
        return done(err);
      }
      expect(tags.length).to.be.equal(3);
      app.controllers.tagController.deleteTagById(tags[0].id, tenantId, (err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.result).to.be.equal('Tag deleted');
        app.controllers.tagController.getTagById(tags[0].id, tenantId, (err, theTag) => {
          if (err) {
            return done(err);
          }
          expect(theTag).to.be.equal(undefined);
          return done();
        });
      });
    });
  });

  it('Delete Tag by reference', done => {
    app.controllers.tagController.getTagsByRef(ref, refType, tagName, tenantId, (err, tags) => {
      if (err) {
        return done(err);
      }
      expect(tags).to.be.not.empty;
      expect(tags.length).to.not.equal(0);
      app.controllers.tagController.deleteTagsByRef(ref, refType, tenantId, (err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.result).to.be.equal('Tags deleted');
        app.controllers.tagController.getTagsByRef(ref, refType, tagName, tenantId, (err, tagsAfterDeletion) => {
          if (err) {
            return done(err);
          }
          expect(tagsAfterDeletion.length).to.be.equal(0);
          return done();
        });
      });
    });
  });

  it('Delete Tag that does not exist', done => {
    const tagId = 'TagNotExist';
    app.controllers.tagController.deleteTagById(tagId, tenantId, err => {
      if (err) {
        if (err.message) {
          expect(err.message).to.be.equal(`Tag "${tagId}" not found.`);
          return done();
        }
        return done(err);
      }
      return done(new Error('Test failed: trying to delete tag that does not exist'));
    });
  });

  it('Create a tag with null reference and null ref type', done => {
    const tagToBeCreated = {
      name: '__rbac',
      value: 'nom_admin',
      tenant: tenantId
    };
    app.controllers.tagController.createTag(tagToBeCreated, (err, res) => {
      if (err) {
        return done(err);
      }
      expect(res.value).to.be.equal(tagToBeCreated.value);
      return done();
    });
  });

  it('Get the list of tags with the matching name', done => {
    app.controllers.tagController.getTagsByName('__rbac', tenantId, (err, tagsGetBeforeDelete) => {
      if (err) {
        return done(err);
      }
      expect(tagsGetBeforeDelete.length).to.be.eq(1);
      return done();
    });
  });

  it('Deletes a tag by name and value, should delete the tag with or without ref', done => {
    const tagToBeCreatedWithRef = {
      name: '__rbac',
      value: 'nom_user',
      ref,
      refType,
      tenant: tenantId
    };
    const tagToBeCreatedWithNullRef = {
      name: '__rbac',
      value: 'nom_user',
      tenant: tenantId
    };
    app.controllers.tagController.createTag(tagToBeCreatedWithRef, (err, res) => {
      if (err) {
        return done(err);
      }
      expect(res.value).to.be.equal(tagToBeCreatedWithRef.value);
      app.controllers.tagController.createTag(tagToBeCreatedWithNullRef, (err, tagWithoutRefRes) => {
        if (err) {
          return done(err);
        }
        expect(tagWithoutRefRes.value).to.be.equal(tagToBeCreatedWithNullRef.value);
        app.controllers.tagController.getAllTags(tenantId, (err, tagsGetBeforeDelete) => {
          if (err) {
            return done(err);
          }
          expect(tagsGetBeforeDelete.length).to.be.eq(1);
          app.controllers.tagController.deleteTagsByVal(tagToBeCreatedWithRef.name, tagToBeCreatedWithRef.value, tenantId, (err, tagsDelRes) => {
            if (err) {
              return done(err);
            }
            expect(tagsDelRes.result).to.be.eq('Tags deleted');
            app.controllers.tagController.getAllTags(tenantId, (err, tagsGetAfterDelete) => {
              if (err) {
                return done(err);
              }
              expect(tagsGetAfterDelete.length).to.be.eq(0);
              return done();
            });
          });
        });
      });
    });
  });

  it('Get the list of tags with the matching name and value', done => {
    app.controllers.tagController.getTagsByVal('__rbac', 'nom_admin', tenantId, (err, tagGetRes) => {
      if (err) {
        return done(err);
      }
      expect(tagGetRes.length).to.be.eq(1);
      return done();
    });
  });

  async function readOnlyResource(tagToBeCreatedWithRef, tagToBeCreatedWithNullRef) {
    return new Promise((resolve, reject) => {
      app.controllers.tagController.createTag(tagToBeCreatedWithNullRef, (err, tagWithoutRefRes) => {
        if (err) {
          return reject(err);
        }
        expect(tagWithoutRefRes.value).to.be.equal(tagToBeCreatedWithNullRef.value);
        app.controllers.tagController.createTag(tagToBeCreatedWithRef, (errForRef, tagToBeCreatedWithRefRes) => {
          if (errForRef) {
            return reject(errForRef);
          }
          expect(tagToBeCreatedWithRefRes.value).to.be.equal(tagToBeCreatedWithRef.value);
          app.controllers.tagController.getSystemResourcesByRefType({ refType: tagToBeCreatedWithRef.refType }, tenantId, (errForRes, resources) => {
            if (errForRes) {
              return reject(errForRes);
            }
            expect(resources.length).to.be.equal(1);
            expect(resources.includes(tagToBeCreatedWithRef.ref));
            app.controllers.tagController.deleteTagsByRef(tagToBeCreatedWithRef.ref, tagToBeCreatedWithRef.refType, tenantId, (delErr, res) => {
              if (delErr) {
                return reject(delErr);
              }
              expect(res.result).to.be.equal('Tags deleted');
              app.controllers.tagController.deleteTagsByVal(tagToBeCreatedWithNullRef.name, tagToBeCreatedWithNullRef.value, tenantId, (tagByRefErr, tagsDelRes) => {
                if (tagByRefErr) {
                  return reject(tagByRefErr);
                }
                expect(tagsDelRes.result).to.be.eq('Tags deleted');
                return resolve();
              });
            });
          });
        });
      });
    });
  }
  it('Create and get system resources by page type', async () => {
    const tagToBeCreatedWithRef = [{
      name: '__system',
      value: '__readOnly',
      ref: 'mypage',
      refType: 'page',
      tenant: tenantId
    },
    {
      name: '__system',
      value: '__readOnly',
      ref: 'mycategory',
      refType: 'category',
      tenant: tenantId
    },
    {
      name: '__system',
      value: '__readOnly',
      ref: 'mymenu',
      refType: 'menuEntry',
      tenant: tenantId
    }
    ];
    const tagToBeCreatedWithNullRef = {
      name: '__system',
      value: '__readOnly',
      tenant: tenantId
    };
    for (const item of tagToBeCreatedWithRef) {
      try {
        await readOnlyResource(item, tagToBeCreatedWithNullRef);
      } catch (err) {
        return err;
      }
    }
    return;
  });
});
