const shared = require('../helpers/shared');
const apiHelper = require('../../rest-api-tests/helpers/shared');
const supertest = require('supertest');
const testData = require('../mockData');
const mockData = JSON.parse(JSON.stringify(testData));
const { reject } = require('async');
const request = supertest.agent(shared.exploreTestURL);

const loginURL = '/rest/v1/menuEntries';
const apiMenuEntry = '/rest/v1/menuEntries/';
const apiPage = '/rest/v1/pages/';
const apiAppConfig = '/rest/v1/appConfig';
const apiRole = '/rest/v1/role/';
const apiSystem = '/rest/v1/system';
const adminLogin = shared.tenant.email;
const adminPasswd = shared.tenant.password;
const testerUser = 'tester';
let roleId;
// menu entries v0 is already tested in another test file
describe('Menu entry CRUD operations - V1', () => {
  let firstPageId = '';
  let secondPageId = '';
  const id = [];

  it('Login admin', done => {
    shared.login(request, loginURL, adminLogin, adminPasswd, done);
  });

  it('Create pages to which menu entries can refer', done => {
    request
      .post(apiPage)
      .send(mockData.page)
      .set('X-Secure-Modify-Token', apiHelper.secureModifyToken())
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.status).to.equal(200);
        expect(res.body.data[0].id).to.equal(mockData.page.id);
        expect(res.body[0]).to.equal(undefined);
        firstPageId = res.body.data[0].id;
        const mockPage = { ...mockData.page, id: 'testingPage', title: 'testingPage' };
        request
          .post(apiPage)
          .send(mockPage)
          .set('X-Secure-Modify-Token', apiHelper.secureModifyToken())
          .end((err, pageResult) => {
            if (err) {
              return done(err);
            }
            expect(pageResult.status).to.equal(200);
            expect(pageResult.body.data[0].id).to.equal(mockPage.id);
            expect(pageResult.body[0]).to.equal(undefined);
            secondPageId = pageResult.body.data[0].id;
            return done();
          });
      });
  });

  it('Create menu entry without existing page reference', done => {
    request
      .post(apiMenuEntry)
      .send(mockData.menuEntries[0])
      .set('X-Secure-Modify-Token', apiHelper.secureModifyToken())
      .end((err, res) => {
        if (err) {
          return err;
        }
        expect(res.status).to.equal(500);
        expect(res.body.defaultText).to.include(`The server reported the following error: Menu entry ${mockData.menuEntries[0].title} was not created because the referenced page ${mockData.menuEntries[0].pageId} does not exist.`);
        return done();
      });
  });

  it('Create menu entry with empty object', done => {
    request
      .post(apiMenuEntry)
      .send()
      .set('X-Secure-Modify-Token', apiHelper.secureModifyToken())
      .end((err, res) => {
        if (err) {
          return err;
        }
        expect(res.status).to.equal(400);
        expect(res.body.additionalInfo[0]).to.include('Bad request: Menu entry object i.e to be created is not as expected');
        return done();
      });
  });

  it('Create a menu entry associated with a new page reference', done => {
    mockData.menuEntries[0].pageId = firstPageId;
    const mockMenuEntry = mockData.menuEntries[0];
    request
      .post(apiMenuEntry)
      .send(mockMenuEntry)
      .set('X-Secure-Modify-Token', apiHelper.secureModifyToken())
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.status).to.equal(200);
        id[0] = res.body.data[0].id;
        expect(id[0].length).to.be.equal(6);
        request
          .get(apiMenuEntry.concat(id[0]))
          .end((getErr, fetchRes) => {
            expect(fetchRes.status).to.equal(200);
            expect(fetchRes.body.data.title).to.be.equal(mockData.menuEntries[0].title);
            return done();
          });
      });
  });

  it('Get a menu entry', done => {
    request
      .get(apiMenuEntry.concat(id[0]))
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.status).to.equal(200);

        // check for no dublicate entries

        expect(res.body.data.title).to.be.equal(mockData.menuEntries[0].title);
        expect(res.body.data.categoryId).to.be.equal(mockData.menuEntries[0].categoryId);
        expect(res.body.data.pageId).to.be.equal(mockData.menuEntries[0].pageId);
        return done();
      });
  });

  it('should not have duplicate id in get menu entry response', done => {
    request
      .get(apiMenuEntry)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.status).to.equal(200);
        const ids = res.body.data.map(item => item.id);
        const uniqueId = new Set(ids);
        expect(ids.length).to.be.equal(uniqueId.size);
        return done();
      });
  });

  it('Delete a menu entry', done => {
    request
      .delete(apiMenuEntry.concat(id[0]))
      .set('X-Secure-Modify-Token', apiHelper.secureModifyToken())
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.status).to.equal(200);
        expect(res.body.data.result).to.be.equal('Menu Entry deleted');
        request
          .get(apiMenuEntry.concat(id[0]))
          .end((getErr, getRes) => {
            expect(getRes.status).to.be.equal(404);
            return done();
          });
      });
  });

  it('Create multiple menu entries associated with a new page reference', done => {
    mockData.menuEntries[0].pageId = secondPageId;
    mockData.menuEntries[1].pageId = secondPageId;
    request
      .post(apiMenuEntry)
      .send(mockData.menuEntries)
      .set('X-Secure-Modify-Token', apiHelper.secureModifyToken())
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.status).to.equal(200);
        expect(res.body.data.length).to.be.equal(2);
        const menuEntryIds = res.body.data.map(menuEntry => menuEntry.id);
        const menuEntryTitles = res.body.data.map(menuEntry => menuEntry.title);
        request
          .get(apiMenuEntry.concat(menuEntryIds[0]))
          .end((err1, menuEntryResult) => {
            if (err1) {
              reject(done);
            }
            expect(menuEntryResult.status).to.be.equal(200);
            expect(menuEntryTitles.includes(mockData.menuEntries[0].title)).to.equal(true);
            request
              .get(apiMenuEntry.concat(menuEntryIds[1]))
              .end((err2, menuEntryRes) => {
                if (err2) {
                  reject(done);
                }
                expect(menuEntryRes.status).to.be.equal(200);
                expect(menuEntryTitles.includes(mockData.menuEntries[1].title)).to.equal(true);
                return done();
              });
          });
      });
  });

  it('Create two menu entries one by one with the same title in the same categoryId referencing the same page', done => {
    mockData.menuEntries[0] = { ...mockData.menuEntries[0], title: 'ABC', categoryId: 'Operations', pageId: firstPageId };
    mockData.menuEntries[1] = { ...mockData.menuEntries[1], title: 'ABC', categoryId: 'Operations', pageId: firstPageId };
    request
      .post(apiMenuEntry)
      .send(mockData.menuEntries[0])
      .set('X-Secure-Modify-Token', apiHelper.secureModifyToken())
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.status).to.equal(200);
        const menuEntryId1 = res.body.data[0].id;
        request
          .post(apiMenuEntry)
          .send(mockData.menuEntries[1])
          .set('X-Secure-Modify-Token', apiHelper.secureModifyToken())
          .end((err, createMenuEntryResult) => {
            if (err) {
              return done(err);
            }
            expect(res.status).to.equal(200);
            const menuEntryId2 = createMenuEntryResult.body.data[0].id;
            request
              .get(apiMenuEntry.concat(menuEntryId1))
              .end((getErr1, getRes1) => {
                if (getErr1) {
                  reject(done);
                }
                expect(getRes1.body.data.title).to.be.equal(mockData.menuEntries[0].title);
                expect(getRes1.body.data.categoryId).to.be.equal(mockData.menuEntries[0].categoryId);
                request
                  .get(apiMenuEntry.concat(menuEntryId2))
                  .end((getErr2, getRes2) => {
                    if (getErr2) {
                      reject(done);
                    }
                    expect(getRes2.body.data.title).to.be.equal(mockData.menuEntries[1].title);
                    expect(getRes2.body.data.categoryId).to.be.equal(mockData.menuEntries[1].categoryId);
                    return done();
                  });
              });
          });
      });
  });

  it('Create two menu entries with the same title under different category', done => {
    mockData.menuEntries[0] = { ...mockData.menuEntries[0], title: 'JKL', categoryId: 'Operations', pageId: firstPageId };
    mockData.menuEntries[1] = { ...mockData.menuEntries[1], title: 'MNO', categoryId: 'Testing', pageId: firstPageId };
    request
      .post(apiMenuEntry)
      .send(mockData.menuEntries)
      .set('X-Secure-Modify-Token', apiHelper.secureModifyToken())
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.status).to.equal(200);
        expect(res.body.data.length).to.be.equal(2);
        const menuEntryIds = res.body.data.map(menuEntry => menuEntry.id);
        request
          .get(apiMenuEntry.concat(menuEntryIds[0]))
          .end((getErr1, getRes1) => {
            if (getErr1) {
              reject(done);
            }
            expect(getRes1.status).to.equal(200);
            expect(getRes1.body.data.title).to.be.equal(mockData.menuEntries[0].title);
            expect(getRes1.body.data.categoryId).to.be.equal(mockData.menuEntries[0].categoryId);
            request
              .get(apiMenuEntry.concat(menuEntryIds[1]))
              .end((getErr2, getRes2) => {
                if (getErr2) {
                  reject(done);
                }
                expect(getRes2.status).to.equal(200);
                expect(getRes2.body.data.title).to.be.equal(mockData.menuEntries[1].title);
                expect(getRes2.body.data.categoryId).to.be.equal(mockData.menuEntries[1].categoryId);
                return done();
              });
          });
      });
  });

  it('Create two menu entries at once with the same title in the same categoryId referencing the same page', done => {
    mockData.menuEntries[0] = { ...mockData.menuEntries[0], title: 'GHI', categoryId: 'Operations', pageId: firstPageId };
    mockData.menuEntries[1] = { ...mockData.menuEntries[1], title: 'DEF ', categoryId: 'Operations', pageId: firstPageId };
    request
      .post(apiMenuEntry)
      .send(mockData.menuEntries)
      .set('X-Secure-Modify-Token', apiHelper.secureModifyToken())
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.status).to.equal(200);
        id[0] = res.body.data[0].id;
        id[1] = res.body.data[1].id;
        expect(res.body.data.length).to.be.equal(2);
        request
          .get(apiMenuEntry.concat(id[0]))
          .end((getErr1, getRes1) => {
            if (getErr1) {
              reject(done);
            }
            expect(getRes1.body.data.title).to.be.equal(mockData.menuEntries[0].title);
            expect(getRes1.body.data.categoryId).to.be.equal(mockData.menuEntries[0].categoryId);
            request
              .get(apiMenuEntry.concat(id[1]))
              .end((getErr2, getRes2) => {
                if (getErr2) {
                  reject(done);
                }
                expect(getRes2.body.data.title).to.be.equal(mockData.menuEntries[1].title);
                expect(getRes2.body.data.categoryId).to.be.equal(mockData.menuEntries[1].categoryId);
                return done();
              });
          });
      });
  });

  it('Update a menu entry with non existing menu entry id', done => {
    request
      .put(apiMenuEntry.concat('random'))
      .send(mockData.menuEntries[0])
      .set('X-Secure-Modify-Token', apiHelper.secureModifyToken())
      .end((err, updateMenuEntry) => {
        if (err) {
          return done(err);
        }
        expect(updateMenuEntry.status).to.equal(404);
        expect(updateMenuEntry.body.additionalInfo[0]).to.equal('Menu entry random not found.');
        return done();
      });
  });

  it('Update a menu entry with new page id', done => {
    request
      .get(apiMenuEntry.concat(id[0]))
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.status).to.equal(200);
        const previousPageId = res.body.data.pageId;
        const newPageId = 'testingPage';
        mockData.menuEntries[0].pageId = newPageId;
        request
          .put(apiMenuEntry.concat(id[0]))
          .send(mockData.menuEntries[0])
          .set('X-Secure-Modify-Token', apiHelper.secureModifyToken())
          .end((err, resnew) => {
            if (err) {
              return done(err);
            }
            expect(resnew.status).to.equal(200);
            request
              .get(apiMenuEntry.concat(id[0]))
              .end((getErr, getRes) => {
                if (getErr) {
                  reject(done);
                }
                expect(getRes.body.data.pageId).to.not.equal(previousPageId);
                expect(getRes.body.data.pageId).to.equal(newPageId);
                return done();
              });
          });
      });
  });

  it('Create, update & delete menu entry with optional id', done => {
    mockData.menuEntries[0].pageId = firstPageId;
    const mockMenuEntry = mockData.menuEntries[0];
    mockMenuEntry.id = 'MyId';
    request
      .post(apiMenuEntry)
      .send(mockMenuEntry)
      .set('X-Secure-Modify-Token', apiHelper.secureModifyToken())
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.status).to.equal(200);
        const optId = res.body.data[0].id;
        expect(optId).to.be.equal(mockMenuEntry.id);
        request
          .get(apiMenuEntry.concat(optId))
          .end((getErr, fetchRes) => {
            expect(fetchRes.status).to.equal(200);
            expect(fetchRes.body.data.title).to.be.equal(mockData.menuEntries[0].title);
            expect(fetchRes.body.data.id).to.be.equal(mockData.menuEntries[0].id);

            const newPageId = 'testingPage';
            mockData.menuEntries[0].pageId = newPageId;
            request
              .put(apiMenuEntry.concat(optId))
              .send(mockData.menuEntries[0])
              .set('X-Secure-Modify-Token', apiHelper.secureModifyToken())
              .end((err, resnew) => {
                if (err) {
                  return done(err);
                }
                expect(resnew.status).to.equal(200);
                request
                  .get(apiMenuEntry.concat(optId))
                  .end((getErrAfterUpdate, getRes) => {
                    if (getErrAfterUpdate) {
                      reject(done);
                    }
                    expect(getRes.body.data.pageId).to.equal(newPageId);
                    request
                      .delete(apiMenuEntry.concat(optId))
                      .set('X-Secure-Modify-Token', apiHelper.secureModifyToken())
                      .end((err, deletedMenu) => {
                        if (err) {
                          return done(err);
                        }
                        expect(deletedMenu.status).to.equal(200);
                        expect(deletedMenu.body.data.result).to.be.equal('Menu Entry deleted');
                        request
                          .get(apiMenuEntry.concat(optId))
                          .end((getErrAfterDelete, getResAfterDelete) => {
                            expect(getResAfterDelete.status).to.be.equal(404);
                            return done();
                          });
                      });
                  });
              });
          });
      });
  });

  it('Delete all the created pages', done => {
    request
      .delete(apiPage.concat(firstPageId))
      .set('X-Secure-Modify-Token', apiHelper.secureModifyToken())
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.body.result).to.equal(undefined);
        expect(res.body.data.result).to.be.equal('Page deleted');
        request
          .delete(apiPage.concat(secondPageId))
          .set('X-Secure-Modify-Token', apiHelper.secureModifyToken())
          .end((err, pageResult) => {
            if (err) {
              return done(err);
            }
            expect(pageResult.body.result).to.equal(undefined);
            expect(pageResult.body.data.result).to.equal('Page deleted');
            return done();
          });
      });
  });

  it('logout', done => {
    shared.logout(request, done);
  });
});

describe('Limit menu entries by tags - V1', () => {
  let originalAppConfig,
    menuEntryId;

  it('Login admin', done => {
    shared.login(request, loginURL, adminLogin, adminPasswd, done);
  });

  it('Save original appConfig', done => {
    request
      .get(apiAppConfig)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.status).to.equal(200);
        expect(res.body.data.appConfig.app).not.to.be.undefined;
        expect(res.body.data.appConfig.context).not.to.be.undefined;
        expect(res.body.data).not.to.be.undefined;
        originalAppConfig = res.body.data.appConfig;
        return done();
      });
  });

  it('Create a page and menu entry referencing to the respective page', done => {
    const mockPage = { ...mockData.page, tags: [{ name: '__system', values: ['dev']}]};
    request
      .post(apiPage)
      .send(mockPage)
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.status).to.equal(200);
        request
          .post(apiMenuEntry)
          .send(mockData.menuEntry)
          .set('X-Secure-Modify-Token', apiHelper.secureModifyToken())
          .end((err, createMenuEntryResult) => {
            if (err) {
              return done(err);
            }
            expect(createMenuEntryResult.status).to.equal(200);
            menuEntryId = createMenuEntryResult.body.data[0].id;
            request
              .get(apiMenuEntry.concat(menuEntryId))
              .end((err, menuEntryResult) => {
                if (err) {
                  return done(err);
                }
                expect(menuEntryResult.body.data.pageId).to.equal(mockPage.id);
                return done();
              });
          });
      });
  });

  it('Upload app config needed for testing', done => {
    request
      .put(apiAppConfig)
      .send(mockData.appConfig)
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.status).to.equal(200);
        expect(res.body.appConfig).to.be.undefined;
        expect(res.body.data.appConfig.app.l10n).not.to.be.undefined;
        request
          .get(apiSystem)
          .end((err, systemResult) => {
            if (err) {
              return done(err);
            }
            expect(systemResult.status).to.equal(200);
            expect(systemResult.body.appConfig.app).not.to.be.undefined;
            expect(systemResult.body.appConfig.context).not.to.be.undefined;
            expect(systemResult.body.data).not.to.be.undefined;
            return done();
          });
      });
  });

  it('should fail to create a menu entry when referencing page\'s tag matches with excludeTags', done => {
    shared.logout(request, () => {
      shared.login(request, loginURL, adminLogin, adminPasswd, async () => {
        const role = {
          name: 'bvd_tester',
          description: 'Test role for foundation',
          permission: [{
            // eslint-disable-next-line camelcase
            operation_key: 'FullControl',
            // eslint-disable-next-line camelcase
            resource_key: `menu<>Category-TagsLimit`
          }]
        };
        request.post(apiRole)
          .send(role)
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
                  .get(apiSystem)
                  .end((err, systemResult) => {
                    if (err) {
                      return done(err);
                    }
                    expect(systemResult.status).to.equal(200);
                    request
                      .post(apiMenuEntry)
                      .send(mockData.menuEntry)
                      .set('X-Secure-Modify-Token', apiHelper.secureModifyToken())
                      .end((err, menuEntryResult) => {
                        if (err) {
                          return done(err);
                        }
                        expect(menuEntryResult.status).to.equal(500);
                        return done();
                      });
                  });
              });
            });
          });
      });
    });
  });

  it('should fail to get the menu entry when referencing page\'s tag matches with excludeTags', done => {
    shared.logout(request, () => {
      shared.login(request, loginURL, testerUser, adminPasswd, () => {
        request
          .get(apiSystem)
          .end((err, res) => {
            if (err) {
              return done(err);
            }
            expect(res.status).to.equal(200);
            request
              .get(apiMenuEntry.concat(menuEntryId))
              .end((err, menuEntryResult) => {
                if (err) {
                  return done(err);
                }
                expect(menuEntryResult.status).to.equal(404);
                shared.logout(request, () => {
                  shared.login(request, loginURL, adminLogin, adminPasswd, async () => {
                    request.delete(apiRole.concat(roleId))
                      .set('X-Secure-Modify-Token', shared.secureModifyToken())
                      .end((err, roleResult) => {
                        if (err) {
                          return done(err);
                        }
                        expect(roleResult.status).to.equal(200);
                        return done();
                      });
                  });
                });
              });
          });
      });
    });
  });

  it('Restore original appConfig', done => {
    request
      .put(apiAppConfig)
      .send(originalAppConfig)
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.status).to.equal(200);
        request
          .get(apiAppConfig)
          .set('X-Secure-Modify-Token', shared.secureModifyToken())
          .end((err, appres) => {
            if (err) {
              return done(err);
            }
            expect(appres.body.appConfig).to.be.undefined;
            expect(appres.body.data.appConfig.app).not.to.be.undefined;
            return done();
          });
      });
  });

  it('logout', done => {
    shared.logout(request, done);
  });

  // login as admin and delete the pages
  it('Login admin', done => {
    shared.login(request, loginURL, adminLogin, adminPasswd, done);
  });

  it('Retrieve menu entry that was created', done => {
    request
      .get(apiMenuEntry.concat(menuEntryId))
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.status).to.equal(200);
        return done();
      });
  });

  it('Delete pages', done => {
    const pagesToDelete = [
      { id: 'testPage' }
    ];
    shared.deleteItems(request, apiPage, pagesToDelete, done);
  });

  it('Delete page would delete all the menu entries referencing deleted page', done => {
    request
      .get(apiMenuEntry.concat(menuEntryId))
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.status).to.equal(404);
        return done();
      });
  });

  it('logout', done => {
    shared.logout(request, done);
  });
});
