/* eslint node/no-sync: 0 */
const shared = require('../helpers/shared');
const supertest = require('supertest');
const testData = require('../mockData');
const mockData = JSON.parse(JSON.stringify(testData));
const request = supertest.agent(shared.exploreTestURL);
const path = require('path');
const fs = require('fs');
const { randomUUID } = require('crypto');
const getEnv = require('../../../shared/config/getEnv');
const loginURL = '/rest/v2/pages/';
const apiPage = '/rest/v2/pages/';
const apiPageWithComponents = '/rest/v2/pagesWithComponents/';
const apiMetaContext = '/rest/v2/pages/metadata';
const apiToc = '/rest/v2/pages/toc';
const apiTag = '/rest/v2/tag/';
const apiTagVal = '/rest/v2/tagVal/';
const apiCategory = '/rest/v2/categories/';
const apiSystem = '/rest/v2/system';
const apiAppConfig = '/rest/v2/appConfig';
const apiMenuEntry = '/rest/v2/menuEntries';
const adminLogin = shared.tenant.email;
const adminPasswd = shared.tenant.password;
const testerUser = 'tester';

const nonAdminUser = {
  login: `${randomUUID()}@example.com`,
  passwd: 'Abc1234$'
};

const apiRole = '/rest/v2/role/';
const role = {
  name: 'bvd_tester',
  description: 'Test role for foundation',
  permission: [{
    // eslint-disable-next-line camelcase
    operation_key: 'FullControl',
    // eslint-disable-next-line camelcase
    resource_key: 'default_action<>All'
  }]
};
let roleId;
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

const deleteTag = page => new Promise((resolve, reject) => {
  request
    .delete(apiTag)
    .query(`refType=page&ref=${page.id}`)
    .set('X-Secure-Modify-Token', shared.secureModifyToken())
    .end((err, res) => {
      if (err) {
        return reject(err);
      }
      resolve(res);
    });
});

describe('Pages Rest Service Test', () => {
  it('Login admin', done => {
    shared.login(request, loginURL, adminLogin, adminPasswd, done);
  });

  it('Load LandingPage with components', done => {
    request
      .get(apiPageWithComponents.concat('BVDFoundationLandingPage'))
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.status).to.equal(200);
        expect(res.body.page).to.equal(undefined);
        expect(res.body.components).to.equal(undefined);
        expect(res.body.data.page.id).to.equal('BVDFoundationLandingPage');
        expect(res.body.error).to.equal(false);

        done();
      });
  });

  it('Fetch LandingPage', done => {
    request
      .get(apiPage.concat('BVDFoundationLandingPage'))
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.status).to.equal(200);
        expect(res.body.id).to.equal(undefined);
        expect(res.body.error).to.equal(false);
        expect(res.body.data.id).to.equal('BVDFoundationLandingPage');
        expect(res.body.data.components).to.equal(undefined);
        done();
      });
  });

  it('Create pages', done => {
    shared.createItems(request, apiPage, mockData.pages, done);
  });

  it('Get all pages', done => {
    request
      .get(apiPage)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.status).to.equal(200);
        expect(res.body.error).to.equal(false);
        expect(res.body.items).to.equal(undefined);
        expect(res.body.data.length).not.to.equal(0);

        done();
      });
  });

  it('Tags table should contain __owner Tag for all page creations', done => {
    request
      .get(apiTag)
      .query(`refType=page&ref=${mockData.pages[0].id}`)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        const ownerTag = res.body.data.some(tag => tag.name === '__owner');
        expect(res.body.data).to.be.an('array');
        expect(res.body.error).to.equal(false);
        expect(ownerTag).to.be.true;
        expect(res.status).to.eq(200);
        done();
      });
  });

  it('Tags table should be updated with the page tags after page creation', done => {
    request
      .get(apiTag)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.status).to.equal(200);
        expect(res.body.error).to.equal(false);
        const refTagsCreated = res.body.data.filter(tag => (tag.name === mockData.pages[4].tags[0].name && tag.value === mockData.pages[4].tags[0].values[0] && tag.ref === mockData.pages[4].id) ||
          (tag.name === mockData.pages[4].tags[0].name && tag.value === mockData.pages[4].tags[0].values[1] && tag.ref === mockData.pages[4].id));
        expect(refTagsCreated.length).to.eq(2);
        done();
      });
  });

  it('Return meta data of pages by context 1', done => {
    const context = [{
      type: 'host'
    }];
    request
      .post(apiMetaContext)
      .send(context)
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.status).to.equal(200);
        expect(res.body.data[0]).not.to.equal(undefined);
        expect(res.body.data.length).to.equal(2);
        expect(res.body.items).to.equal(undefined);
        expect(res.body.data[0].view).to.equal(undefined);
        expect(res.body.data.length).to.equal(2);
        done();
      });
  });

  it('Return meta data of pages by context 2', done => {
    const context = [{
      type: 'application'
    }];
    request
      .post(apiMetaContext)
      .send(context)
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.status).to.equal(200);
        expect(res.body.data.length).not.to.equal(0);
        expect(res.body.items).to.equal(undefined);
        const resultPageIds = res.body.data.map(page => page.id);
        expect(resultPageIds.includes('testPage4')).to.equal(true);
        done();
      });
  });

  it('Tags table should be updated after page deletion', done => {
    const page = {
      ...mockData.page
    };
    page.id = 'pageToTestTagDeletion';
    request
      .post(apiPage)
      .send(page)
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .end((err, pageCreateRes) => {
        if (err) {
          return done(err);
        }
        expect(pageCreateRes.status).to.eq(200);
        expect(pageCreateRes.body.error).to.equal(false);
        expect(pageCreateRes.body.data.length).not.to.equal(0);
        request
          .get(apiTag)
          .query(`refType=page&ref=${page.id}`)
          .end((err, tagGetRes) => {
            if (err) {
              return done(err);
            }
            expect(tagGetRes.status).to.eq(200);
            expect(tagGetRes.body.data).to.be.an('array');
            expect(tagGetRes.body.data.length).to.eq(2);
            expect(pageCreateRes.body.error).to.equal(false);
            const ownerTag = tagGetRes.body.data.some(tag => tag.name === '__owner');
            expect(ownerTag).to.be.true;
            expect(tagGetRes.body.data[0].ref).to.eq(page.id);
            request
              .delete(apiPage.concat(page.id))
              .set('X-Secure-Modify-Token', shared.secureModifyToken())
              .end((err, pageDeleteRes) => {
                if (err) {
                  return done(err);
                }
                expect(pageDeleteRes.status).to.eq(200);
                request
                  .get(apiTag)
                  .query(`refType=page&ref=${page.id}`)
                  .end((err, tagGetAfterPageDeleteRes) => {
                    if (err) {
                      return done(err);
                    }
                    expect(tagGetAfterPageDeleteRes.status).to.equal(404);
                    // Should contain the null ref tags, even after removal of ref tags
                    request
                      .get(apiTagVal.concat(page.tags[0].name))
                      .end((err, tagValGetRes) => {
                        if (err) {
                          return done(err);
                        }
                        expect(tagValGetRes.status).to.equal(200);
                        const filteredNullRefTags = tagValGetRes.body.data.filter(tagValue => tagValue === page.tags[0].values[0]);
                        expect(filteredNullRefTags.length).to.equal(1);
                        return done();
                      });
                  });
              });
          });
      });
  });

  it('Creation of page should fail if category json is passed as page config', done => {
    const category = {
      id: '7',
      abbreviation: 'P',
      parent: '2',
      title: 'Pages'
    };
    request
      .post(apiPage)
      .send(category)
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.status).to.be.equal(400);
        expect(res.body.error).to.be.equal(true);
        // res.error still display something ?
        expect(res.body.additionalInfo[0]).to.be.equal('Invalid page specification: View can\'t be blank');
        return done();
      });
  });

  it('Delete pages', done => {
    shared.deleteItems(request, apiPage, mockData.pages, done);
  });

  it('Should create menu entry for page with categoryId (Backward compatibility test)', done => {
    const mockPage = {
      ...mockData.page,
      categoryId: '3'
    };
    request
      .post(apiPage)
      .send(mockPage)
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.status).to.equal(200);
        expect(res.body.error).to.equal(false);
        const pageId = res.body.data[0].id;
        request
          .get(apiMenuEntry)
          .end((err, menuEntryGetRes) => {
            if (err) {
              return done(err);
            }
            expect(menuEntryGetRes.status).to.be.equal(200);
            expect(menuEntryGetRes.body.error).to.be.equal(false);
            const menuEntry = menuEntryGetRes.body.data.filter(menu => menu.pageId === pageId);
            const menuEntryId = menuEntry[0].id;
            expect(menuEntry.length).to.equal(1);

            request
              .delete(apiPage.concat(mockPage.id))
              .set('X-Secure-Modify-Token', shared.secureModifyToken())
              .end(err => {
                if (err) {
                  return done(err);
                }
                request
                  .delete(apiMenuEntry.concat(menuEntryId))
                  .set('X-Secure-Modify-Token', shared.secureModifyToken())
                  .end(err => {
                    if (err) {
                      return done(err);
                    }
                    return done();
                  });
              });
          });
      });
  });

  it('Should not create menu entry for page without categoryId', done => {
    const mockPage = {
      ...mockData.page
    };
    request
      .post(apiPage)
      .send(mockPage)
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.status).to.equal(200);
        const pageId = res.body.data[0].id;
        request
          .get(apiMenuEntry)
          .end((err, menuEntryGetRes) => {
            if (err) {
              return done(err);
            }
            expect(menuEntryGetRes.status).to.be.equal(200);
            expect(menuEntryGetRes.body.error).to.be.equal(false);
            const menuEntry = menuEntryGetRes.body.data.filter(menu => menu.pageId === pageId);
            expect(menuEntry.length).to.equal(0);
            request
              .delete(apiPage.concat(mockPage.id))
              .set('X-Secure-Modify-Token', shared.secureModifyToken())
              .end(err => {
                if (err) {
                  return done(err);
                }
                done();
              });
          });
      });
  });

  it('logout', done => {
    shared.logout(request, done);
  });
});

describe('Page crud operation', () => {
  it('Login admin', done => {
    shared.login(request, loginURL, adminLogin, adminPasswd, done);
  });

  it('Create page', done => {
    request
      .post(apiPage)
      .send(mockData.page)
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.status).to.equal(200);
        expect(res.body.error).to.equal(false);
        expect(res.body.data[0].id).to.be.equal(mockData.page.id);

        request
          .get(apiPage.concat(mockData.page.id))
          .end((err, res1) => {
            if (err) {
              return done(err);
            }
            expect(res1.status).to.equal(200);
            expect(res.body.error).to.equal(false);
            expect(res1.body.data.id).to.equal(mockData.page.id);
            expect(res1.body.data.tags).to.eql([{
              name: '__system',
              values: ['read']
            }]);
            done();
          });
      });
  });

  it('create tag with page failure (page exists)', done => {
    const mockPage = {
      ...mockData.page,
      tags: [{
        name: '__system',
        values: ['prod']
      }]
    };
    request
      .post(apiPage)
      .send(mockPage)
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.status).to.equal(403);
        expect(res.body.error).to.equal(true);
        expect(res.body.additionalInfo[0]).to.equal('Page testPage already exists.');
        request
          .get(apiTag.concat('prod'))
          .end((err, res1) => {
            if (err) {
              return done(err);
            }
            expect(res1.status).to.equal(404);
            expect(res1.body.error).to.equal(true);
            expect(res1.body.additionalInfo[0]).to.equal('Tag with id prod not found');
            done();
          });
      });
  });

  it('create page with tag failure', done => {
    const mockPage = {
      ...mockData.page,
      tags: [{
        customer: 'user'
      }],
      id: 'newPage',
      title: 'newPage'
    };
    request
      .post(apiPage)
      .send(mockPage)
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.status).to.equal(400);
        expect(res.body.additionalInfo[0]).to.equal('Invalid page specification: Tags must be of type tagTypeArray');
        request
          .get(apiPage.concat('newPage'))
          .end((err, res1) => {
            if (err) {
              return done(err);
            }
            expect(res1.status).to.equal(404);
            expect(res1.body.additionalInfo[0]).to.equal('Page not found');

            done();
          });
      });
  });

  it(`create page with not supported id '.'`, done => {
    const mockPage = {
      ...mockData.page,
      id: '.',
      title: 'Page with 1 dot as id'
    };
    request
      .post(apiPage)
      .send(mockPage)
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.status).to.equal(403);
        expect(res.body.additionalInfo[0]).to.equal(`Page id as '.' or '..' is not allowed`);
        request
          .get(`${apiPage}.`)
          .end((err, res1) => {
            if (err) {
              return done(err);
            }
            expect(res1.status).to.equal(404);
            expect(res1.body.additionalInfo[0]).to.equal('Page not found');
            done();
          });
      });
  });

  it(`create page with not supported id '..'`, done => {
    const mockPage = {
      ...mockData.page,
      id: '..',
      title: 'Page with 2 dot as id'
    };
    request
      .post(apiPage)
      .send(mockPage)
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.status).to.equal(403);
        expect(res.body.additionalInfo[0]).to.equal(`Page id as '.' or '..' is not allowed`);
        request
          .get(`${apiPage}..`)
          .end((err, res1) => {
            if (err) {
              return done(err);
            }
            expect(res1.status).to.equal(404);
            expect(res1.body.additionalInfo[0]).to.equal('Page not found');
            done();
          });
      });
  });

  it(`create page with supported id '...'`, done => {
    const mockPage = {
      ...mockData.page,
      id: '...',
      title: 'Page with 3 dot as id'
    };
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
          .get(`${apiPage}...`)
          .end((err, res1) => {
            if (err) {
              return done(err);
            }
            expect(res1.status).to.equal(200);
            request
              .delete(`${apiPage}...`)
              .set('X-Secure-Modify-Token', shared.secureModifyToken())
              .end(err => {
                if (err) {
                  return done(err);
                }
                return done();
              });
          });
      });
  });

  it(`create 2 pages with same title`, done => {
    const mockPageSameTitle1 = {
      ...mockData.page,
      id: 'SameTitle1',
      title: 'Same title'
    };
    const mockPageSameTitle2 = {
      ...mockData.page,
      id: 'SameTitle2',
      title: 'Same title'
    };
    request
      .post(apiPage)
      .send(mockPageSameTitle1)
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .end((err, resCreate1) => {
        if (err) {
          return done(err);
        }
        expect(resCreate1.status).to.equal(200);
        request
          .post(apiPage)
          .send(mockPageSameTitle2)
          .set('X-Secure-Modify-Token', shared.secureModifyToken())
          .end((err, resCreate2) => {
            if (err) {
              return done(err);
            }
            expect(resCreate2.status).to.equal(200);
            request
              .get(`${apiPage}${mockPageSameTitle1.id}`)
              .end((err, resGet1) => {
                if (err) {
                  return done(err);
                }
                expect(resGet1.status).to.equal(200);
                expect(resGet1.body.data.id).to.equal(mockPageSameTitle1.id);
                expect(resGet1.body.data.title).to.equal(mockPageSameTitle1.title);
                request
                  .get(`${apiPage}${mockPageSameTitle2.id}`)
                  .end((err, resGet2) => {
                    if (err) {
                      return done(err);
                    }
                    expect(resGet2.status).to.equal(200);
                    expect(resGet2.body.data.id).to.equal(mockPageSameTitle2.id);
                    expect(resGet2.body.data.title).to.equal(mockPageSameTitle2.title);
                    request
                      .delete(`${apiPage}${mockPageSameTitle1.id}`)
                      .set('X-Secure-Modify-Token', shared.secureModifyToken())
                      .end(err => {
                        if (err) {
                          return done(err);
                        }
                        request
                          .delete(`${apiPage}${mockPageSameTitle2.id}`)
                          .set('X-Secure-Modify-Token', shared.secureModifyToken())
                          .end(err => {
                            if (err) {
                              return done(err);
                            }
                            return done();
                          });
                      });
                  });
              });
          });
      });
  });

  it('Create multiple pages', done => {
    request
      .post(apiPage)
      .send(mockData.pages)
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.status).to.equal(200);
        expect(res.body.data.length).to.equal(mockData.pages.length);

        const testPageId1 = mockData.pages[0].id;
        request
          .get(apiPage.concat(testPageId1))
          .end((err, res1) => {
            if (err) {
              return done(err);
            }
            expect(res1.status).to.equal(200);
            expect(res1.body.data.id).to.equal(testPageId1);

            const testPageId2 = mockData.pages[1].id;
            request
              .get(apiPage.concat(testPageId2))
              .end((err, res2) => {
                if (err) {
                  return done(err);
                }
                expect(res2.status).to.equal(200);
                expect(res2.body.data.id).to.equal(testPageId2);
                done();
              });
          });
      });
  });

  it('Update page', done => {
    mockData.page.title = 'newTitle';
    mockData.page.tags = [{
      name: '__system',
      values: ['read']
    }];
    request
      .put(apiPage.concat(mockData.page.id))
      .send(mockData.page)
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.status).to.equal(200);
        expect(res.body.data.title).to.be.equal(mockData.page.title);

        request
          .get(apiPage.concat(mockData.page.id))
          .end((err, res1) => {
            if (err) {
              return done(err);
            }
            expect(res1.status).to.equal(200);
            expect(res1.body.data.title).to.be.equal(mockData.page.title);
            expect(res1.body.data.tags).to.eql([{
              name: '__system',
              values: ['read']
            }]);
            done();
          });
      });
  });

  it('Delete page', done => {
    request
      .get(apiPage.concat(mockData.page.id))
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.status).to.equal(200);
        expect(res.body.error).to.equal(false);
        request
          .delete(apiPage.concat(mockData.page.id))
          .set('X-Secure-Modify-Token', shared.secureModifyToken())
          .end((err, res1) => {
            if (err) {
              return done(err);
            }
            expect(res1.status).to.equal(200);
            expect(res1.body.data.result).to.be.equal('Page deleted');
            request
              .get(apiPage.concat(mockData.page.id))
              .end((err, res2) => {
                if (err) {
                  return done(err);
                }
                expect(res2.status).to.equal(404);
                expect(res2.body.additionalInfo[0]).to.equal('Page not found');
                done();
              });
          });
      });
  });

  it('Delete pages', done => {
    shared.deleteItems(request, apiPage, mockData.pages, done);
  });

  it('logout', done => {
    shared.logout(request, done);
  });
});

describe('Get TOC', () => {
  it('Login admin', done => {
    shared.login(request, loginURL, adminLogin, adminPasswd, done);
  });

  it('Create categories', done => {
    shared.createItems(request, apiCategory, mockData.categories, done);
  });

  it('Create pages', done => {
    shared.createItems(request, apiPage, mockData.pages, done);
  });

  it('Return toc', done => {
    request
      .get(apiToc)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.status).to.equal(200);
        expect(res.body.items).to.equal(undefined);
        expect(res.body.data.length).to.equal(2);
        if (res.body.data[0].children) {
          expect(res.body.data[0].children.length).to.be.equal(3);
        } else {
          expect(res.body.data[1].children.length).to.be.equal(1);
        }
        done();
      });
  });

  it('Delete categories', done => {
    shared.deleteItems(request, apiCategory, mockData.categories, done);
  });

  it('Delete pages', done => {
    shared.deleteItems(request, apiPage, mockData.pages, done);
  });

  it('logout', done => {
    shared.logout(request, done);
  });
});

describe('Limit pages by tags operations', () => {
  let originalAppConfig;

  it('Login non-admin', done => {
    shared.login(request, loginURL, nonAdminUser.login, nonAdminUser.passwd, done);
  });

  it('Save original appConfig', done => {
    request
      .get(`${apiAppConfig}/MyApp`)
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

  it('Upload app config needed for testing', done => {
    shared.logout(request, () => {
      shared.login(request, loginURL, adminLogin, adminPasswd, () => {
        request
          .put(`${apiAppConfig}/MyApp`)
          .send(mockData.appConfig)
          .set('X-Secure-Modify-Token', shared.secureModifyToken())
          .end((err, res) => {
            if (err) {
              return done(err);
            }
            expect(res.status).to.equal(200);
            expect(res.body.appConfig).to.equal(undefined);
            expect(res.body.data.appConfig.app.l10n).not.to.be.undefined;
            shared.logout(request, () => {
              shared.login(request, loginURL, nonAdminUser.login, nonAdminUser.passwd, () => {
                request
                  .get(apiSystem)
                  .end((err, systemRes) => {
                    if (err) {
                      return done(err);
                    }
                    expect(systemRes.status).to.equal(200);
                    expect(systemRes.body.appConfig.app).not.to.be.undefined;
                    expect(systemRes.body.appConfig.context).not.to.be.undefined;
                    expect(systemRes.body.data).not.to.be.undefined;
                    return done();
                  });
              });
            });
          });
      });
    });
  });

  it('should fail to get a page when one of the page tag matches with excludeTags', done => {
    shared.logout(request, () => {
      shared.login(request, loginURL, adminLogin, adminPasswd, () => {
        createRole(role).then(res => {
          expect(res.status).to.equal(200);
          expect(res.body.role).to.not.equal(null);
          expect(res.body.role.name).to.equal('bvd_tester');
          roleId = res.body.role.id;
          const mockPage = {
            ...mockData.page,
            id: 'excludedPage',
            title: 'excludedPage',
            tags: [{
              name: '__system',
              values: ['dev']
            }]
          };
          request
            .post(apiPage)
            .send(mockPage)
            .set('X-Secure-Modify-Token', shared.secureModifyToken())
            .end((err, pageResult) => {
              if (err) {
                return done(err);
              }
              expect(pageResult.status).to.equal(200);
              expect(pageResult.body.error).to.equal(false);
              shared.logout(request, () => {
                shared.login(request, loginURL, testerUser, adminPasswd, () => {
                  request
                    .get(apiSystem)
                    .end((err, systemRes) => {
                      if (err) {
                        return done(err);
                      }
                      expect(systemRes.status).to.equal(200);
                      request
                        .get(apiPage.concat(mockPage.id))
                        .end((err, pageGetRes) => {
                          if (err) {
                            return done(err);
                          }
                          expect(pageGetRes.status).to.equal(404);
                          expect(pageGetRes.body.error).to.equal(true);
                          expect(pageGetRes.body.id).to.equal(undefined);
                          expect(pageGetRes.body.data).to.equal(undefined);
                          // Delete of the page is not done, since it can't be deleted due to the exclude tags
                          shared.logout(request, () => {
                            shared.login(request, loginURL, adminLogin, adminPasswd, () => {
                              deleteRole(roleId).then(deleteResult => {
                                expect(deleteResult.status).to.equal(200);
                                return done();
                              }).catch(done);
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
  });

  it('should be able to get the page when page tags are empty', done => {
    const mockPage = {
      ...mockData.page,
      id: 'noTags',
      title: 'noTags',
      tags: []
    };
    request
      .post(apiPage)
      .send(mockPage)
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.status).to.equal(200);
        expect(res.body.error).to.equal(false);
        request
          .get(apiPage.concat(mockPage.id))
          .end((err, pageGetRes) => {
            if (err) {
              return done(err);
            }
            expect(pageGetRes.status).to.equal(200);
            expect(pageGetRes.body.id).to.equal(undefined);
            expect(pageGetRes.body.data.id).to.equal(mockPage.id);

            request
              .delete(apiPage.concat(mockPage.id))
              .set('X-Secure-Modify-Token', shared.secureModifyToken())
              .end(err => {
                if (err) {
                  return done(err);
                }
                return done();
              });
          });
      });
  });

  it('should be able to get the page when none of the page tags matches with excludeTags', done => {
    const mockPage = {
      ...mockData.page,
      id: 'nonMatchingTag',
      title: 'nonMatchingTag',
      tags: [{
        name: '__system',
        values: ['prod', 'build']
      }]
    };
    request
      .post(apiPage)
      .send(mockPage)
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.status).to.equal(200);
        expect(res.body.error).to.equal(false);
        request
          .get(apiPage.concat(mockPage.id))
          .end((err, pageGetRes) => {
            if (err) {
              return done(err);
            }
            expect(pageGetRes.status).to.equal(200);
            expect(pageGetRes.body.id).to.equal(undefined);
            expect(pageGetRes.body.data.id).to.equal(mockPage.id);
            request
              .delete(apiPage.concat(mockPage.id))
              .set('X-Secure-Modify-Token', shared.secureModifyToken())
              .end(err => {
                if (err) {
                  return done(err);
                }
                return done();
              });
          });
      });
  });

  it('should fail to get the page when at least one of the page tags matches excludeTags', done => {
    shared.logout(request, () => {
      shared.login(request, loginURL, adminLogin, adminPasswd, () => {
        createRole(role).then(res => {
          expect(res.status).to.equal(200);
          expect(res.body.role).to.not.equal(null);
          expect(res.body.role.name).to.equal('bvd_tester');
          roleId = res.body.role.id;
          const mockPage = {
            ...mockData.page,
            id: 'matchesOneTag',
            title: 'nonMatchingTag',
            tags: [{
              name: '__system',
              values: ['prod', 'test']
            }]
          };
          request
            .post(apiPage)
            .send(mockPage)
            .set('X-Secure-Modify-Token', shared.secureModifyToken())
            .end((err, pageResult) => {
              if (err) {
                return done(err);
              }
              expect(pageResult.status).to.equal(200);
              expect(pageResult.body.error).to.equal(false);
              shared.logout(request, () => {
                shared.login(request, loginURL, testerUser, adminPasswd, () => {
                  request
                    .get(apiSystem)
                    .end((err, systemRes) => {
                      if (err) {
                        return done(err);
                      }
                      expect(systemRes.status).to.equal(200);
                      request
                        .get(apiPage)
                        .end((err, pageGetRes) => {
                          if (err) {
                            return done(err);
                          }
                          expect(pageGetRes.status).to.equal(200);
                          expect(systemRes.body.items).to.equal(undefined);
                          pageGetRes.body.data.forEach(page => {
                            expect(page.id).to.not.equal(mockPage.id);
                          });
                          // Delete of the page is not done, since it can't be deleted due to the exclude tags
                          shared.logout(request, () => {
                            shared.login(request, loginURL, adminLogin, adminPasswd, () => {
                              deleteRole(roleId).then(deleteResult => {
                                expect(deleteResult.status).to.equal(200);
                                return done();
                              }).catch(done);
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
  });

  it('should fail to get the page when all of the page tags matches with excludeTags', done => {
    shared.logout(request, () => {
      shared.login(request, loginURL, adminLogin, adminPasswd, () => {
        createRole(role).then(res => {
          expect(res.status).to.equal(200);
          expect(res.body.role).to.not.equal(null);
          expect(res.body.role.name).to.equal('bvd_tester');
          roleId = res.body.role.id;
          const mockPage = {
            ...mockData.page,
            id: 'matchesAllTags',
            title: 'matchesAllTags',
            tags: [{
              name: '__system',
              values: ['dev', 'test']
            }]
          };
          request
            .post(apiPage)
            .send(mockPage)
            .set('X-Secure-Modify-Token', shared.secureModifyToken())
            .end((err, createdPage) => {
              if (err) {
                return done(err);
              }
              expect(createdPage.status).to.equal(200);
              expect(createdPage.body.error).to.equal(false);
              shared.logout(request, () => {
                shared.login(request, loginURL, testerUser, adminPasswd, () => {
                  request
                    .get(apiSystem)
                    .end((err, systemRes) => {
                      if (err) {
                        return done(err);
                      }
                      expect(systemRes.status).to.equal(200);
                      request
                        .get(apiPage)
                        .end((err, pageGetRes) => {
                          if (err) {
                            return done(err);
                          }
                          expect(pageGetRes.status).to.equal(200);
                          expect(pageGetRes.body.items).to.equal(undefined);
                          pageGetRes.body.data.forEach(page => {
                            expect(page.id).to.not.equal(mockPage.id);
                          });
                          // Delete of the page is not done, since it can't be deleted due to the exclude tags
                          shared.logout(request, () => {
                            shared.login(request, loginURL, adminLogin, adminPasswd, () => {
                              deleteRole(roleId).then(deleteResult => {
                                expect(deleteResult.status).to.equal(200);
                                return done();
                              }).catch(done);
                            });
                          });
                        });
                    });
                });
              });
            });
        });
      });
    });
  });

  it('should fail to get the page meta data when page tag matches excludeTags', done => {
    shared.logout(request, () => {
      shared.login(request, loginURL, adminLogin, adminPasswd, () => {
        createRole(role).then(res => {
          expect(res.status).to.equal(200);
          expect(res.body.role).to.not.equal(null);
          expect(res.body.role.name).to.equal('bvd_tester');
          roleId = res.body.role.id;

          const mockPage = {
            ...mockData.page,
            id: 'matchesTagsGetMetaData',
            title: 'matchesTagsGetMetaData',
            tags: [{
              name: '__system',
              values: ['dev', 'test']
            }]
          };
          const context = [{
            type: 'host'
          }];
          request
            .post(apiPage)
            .send(mockPage)
            .set('X-Secure-Modify-Token', shared.secureModifyToken())
            .end((err, createdPage) => {
              if (err) {
                return done(err);
              }
              expect(createdPage.status).to.equal(200);
              expect(createdPage.body.error).to.equal(false);
              shared.logout(request, () => {
                shared.login(request, loginURL, testerUser, adminPasswd, () => {
                  request
                    .get(apiSystem)
                    .end((err, systemRes) => {
                      if (err) {
                        return done(err);
                      }
                      expect(systemRes.status).to.equal(200);
                      request
                        .post(apiMetaContext)
                        .send(context)
                        .set('X-Secure-Modify-Token', shared.secureModifyToken())
                        .end((err, pageMetaRes) => {
                          if (err) {
                            return done(err);
                          }
                          expect(pageMetaRes.status).to.equal(200);
                          expect(pageMetaRes.body.items).to.equal(undefined);

                          pageMetaRes.body.data.forEach(page => {
                            expect(page.id).to.not.equal(mockPage.id);
                          });
                          // Delete of the page is not done, since it can't be deleted due to the exclude tags
                          shared.logout(request, () => {
                            shared.login(request, loginURL, adminLogin, adminPasswd, () => {
                              deleteRole(roleId).then(deleteResult => {
                                expect(deleteResult.status).to.equal(200);
                                return done();
                              }).catch(done);
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
  });

  it('Restore original appConfig', done => {
    request
      .put(`${apiAppConfig}/MyApp`)
      .send(originalAppConfig)
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.status).to.equal(200);
        expect(res.body.appConfig).to.equal(undefined);
        expect(res.body.data.appConfig.app).not.to.be.undefined;
        return done();
      });
  });

  it('logout', done => {
    shared.logout(request, done);
  });

  // login as admin and delete the pages
  it('Login admin', done => {
    shared.login(request, loginURL, adminLogin, adminPasswd, done);
  });

  it('Delete pages', done => {
    const pagesToDelete = [{
      id: 'matchesTagsGetMetaData'
    },
    {
      id: 'matchesOneTag'
    },
    {
      id: 'matchesAllTags'
    },
    {
      id: 'excludedPage'
    }
    ];
    shared.deleteItems(request, apiPage, pagesToDelete, done);
  });

  // eslint-disable-next-line mocha/no-identical-title
  it('logout', done => {
    shared.logout(request, done);
  });
});

describe('Admin User Limit pages with tags', () => {
  it('Login admin', done => {
    shared.login(request, loginURL, getEnv.bvd_idm_integration_user, adminPasswd, done);
  });

  it('Put excludeTags in user session object', done => {
    request
      .get(apiSystem)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.status).to.equal(200);
        expect(res.body.appConfig.app).not.to.be.undefined;
        expect(res.body.appConfig.context).not.to.be.undefined;
        expect(res.body.data).not.to.be.undefined;
        done();
      });
  });

  it('should get a page when one of the page tag matches with excludeTags due to Admin User', done => {
    const mockPage = {
      ...mockData.page,
      id: 'excludedPageWithAdminUser',
      title: 'excludedPageWithAdminUser',
      tags: [{
        name: '__system',
        values: ['dev']
      }]
    };
    request
      .post(apiPage)
      .send(mockPage)
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.status).to.equal(200);
        expect(res.body.error).to.equal(false);
        request
          .get(apiPage.concat(mockPage.id))
          .end((err, pageGetRes) => {
            if (err) {
              return done(err);
            }
            expect(pageGetRes.status).to.equal(200);
            expect(pageGetRes.body.data.id).to.equal(mockPage.id);
            expect(pageGetRes.body.id).to.equal(undefined);
            request
              .delete(apiPage.concat(mockPage.id))
              .set('X-Secure-Modify-Token', shared.secureModifyToken())
              .end(err => {
                if (err) {
                  return done(err);
                }
                return done();
              });
          });
      });
  });

  it('should get the page when at least one of the page tags matches excludeTags due to Admin User', done => {
    const mockPage = {
      ...mockData.page,
      id: 'matchesOneTagWithAdminUser',
      title: 'matchesOneTagWithAdminUser',
      tags: [{
        name: '__system',
        values: ['prod', 'test']
      }]
    };
    request
      .post(apiPage)
      .send(mockPage)
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.status).to.equal(200);
        expect(res.body.error).to.equal(false);
        request
          .get(apiPage)
          .end((err, pageGetRes) => {
            if (err) {
              return done(err);
            }
            expect(pageGetRes.status).to.equal(200);
            expect(pageGetRes.body.error).to.equal(false);
            expect(pageGetRes.body.items).to.equal(undefined);
            const filteredPages = pageGetRes.body.data.filter(page => page.id === mockPage.id);
            expect(filteredPages.length).to.equal(1);
            expect(filteredPages[0].id).to.equal(mockPage.id);
            request
              .delete(apiPage.concat(mockPage.id))
              .set('X-Secure-Modify-Token', shared.secureModifyToken())
              .end(err => {
                if (err) {
                  return done(err);
                }
                return done();
              });
          });
      });
  });

  it('should get the page when all of the page tags matches with excludeTags due to Admin User', done => {
    const mockPage = {
      ...mockData.page,
      id: 'matchesAllTagsWithAdminUser',
      title: 'matchesAllTagsWithAdminUser',
      tags: [{
        name: '__system',
        values: ['dev', 'test']
      }]
    };
    request
      .post(apiPage)
      .send(mockPage)
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.status).to.equal(200);
        expect(res.body.error).to.equal(false);
        request
          .get(apiPage)
          .end((err, pageGetRes) => {
            if (err) {
              return done(err);
            }
            expect(pageGetRes.status).to.equal(200);
            expect(pageGetRes.body.error).to.equal(false);
            expect(pageGetRes.body.items).to.equal(undefined);
            const filteredPages = pageGetRes.body.data.filter(page => page.id === mockPage.id);
            expect(filteredPages.length).to.equal(1);
            expect(filteredPages[0].id).to.equal(mockPage.id);
            request
              .delete(apiPage.concat(mockPage.id))
              .set('X-Secure-Modify-Token', shared.secureModifyToken())
              .end(err => {
                if (err) {
                  return done(err);
                }
                return done();
              });
          });
      });
  });

  it('should get the page meta data when page tag matches excludeTags due to Admin User', done => {
    const mockPage = {
      ...mockData.page,
      id: 'matchesTagsGetMetaDataWithAdminUser',
      title: 'matchesTagsGetMetaDataWithAdminUser',
      tags: [{
        name: '__system',
        values: ['dev', 'test']
      }]
    };
    const context = [{
      type: 'host'
    }];
    request
      .post(apiPage)
      .send(mockPage)
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.status).to.equal(200);
        expect(res.body.error).to.equal(false);
        request
          .post(apiMetaContext)
          .send(context)
          .set('X-Secure-Modify-Token', shared.secureModifyToken())
          .end((err, pageMetaRes) => {
            if (err) {
              return done(err);
            }
            expect(pageMetaRes.status).to.equal(200);
            expect(pageMetaRes.body.error).to.equal(false);
            expect(pageMetaRes.body.items).to.equal(undefined);

            const filteredPages = pageMetaRes.body.data.filter(page => page.id === mockPage.id);
            expect(filteredPages.length).to.equal(1);
            expect(filteredPages[0].id).to.equal(mockPage.id);
            request
              .delete(apiPage.concat(mockPage.id))
              .set('X-Secure-Modify-Token', shared.secureModifyToken())
              .end(err => {
                if (err) {
                  return done(err);
                }
                return done();
              });
          });
      });
  });

  it('logout', done => {
    shared.logout(request, done);
  });
});

describe('Limit pages by tags when user re-authenticates', () => {
  const context = [{
    type: 'host'
  }];
  let originalAppConfig;

  it('Login admin', done => {
    shared.login(request, loginURL, nonAdminUser.login, nonAdminUser.passwd, done);
  });

  it('Save original appConfig', done => {
    request
      .get(`${apiAppConfig}/MyApp`)
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

  it('Upload app config needed for testing', done => {
    shared.logout(request, () => {
      shared.login(request, loginURL, adminLogin, adminPasswd, () => {
        request
          .put(`${apiAppConfig}/MyApp`)
          .send(mockData.appConfig)
          .set('X-Secure-Modify-Token', shared.secureModifyToken())
          .end((err, res) => {
            if (err) {
              return done(err);
            }
            expect(res.status).to.equal(200);
            expect(res.body.appConfig).to.equal(undefined);
            expect(res.body.data.appConfig.app.l10n).not.to.be.undefined;
            request
              .get(apiSystem)
              .end((err, systemRes) => {
                if (err) {
                  return done(err);
                }
                expect(systemRes.status).to.equal(200);
                expect(systemRes.body.appConfig.app).not.to.be.undefined;
                expect(systemRes.body.appConfig.context).not.to.be.undefined;
                expect(systemRes.body.data).not.to.be.undefined;
                return done();
              });
          });
      });
    });
  });

  it('should be able to get the page meta data when tags not matching with excludeTags', done => {
    const mockPage = {
      ...mockData.page,
      id: 'noTagsMatches',
      title: 'noTagsMatches',
      tags: [{
        name: '__system',
        values: ['dev', 'test']
      }]
    };
    mockData.appConfig.app.excludeTags = ['prod', 'build'];
    shared.logout(request, () => {
      shared.login(request, loginURL, adminLogin, adminPasswd, () => {
        createRole(role).then(res => {
          expect(res.status).to.equal(200);
          expect(res.body.role).to.not.equal(null);
          expect(res.body.role.name).to.equal('bvd_tester');
          roleId = res.body.role.id;
          request
            .put(`${apiAppConfig}/MyApp`)
            .send(mockData.appConfig)
            .set('X-Secure-Modify-Token', shared.secureModifyToken())
            .end((err, result) => {
              if (err) {
                return done(err);
              }
              expect(result.status).to.equal(200);
              expect(result.body.error).to.equal(false);
              request
                .post(apiPage)
                .send(mockPage)
                .set('X-Secure-Modify-Token', shared.secureModifyToken())
                .end((err, pageCreateRes) => {
                  if (err) {
                    return done(err);
                  }
                  expect(pageCreateRes.status).to.equal(200);
                  expect(pageCreateRes.body.error).to.equal(false);

                  shared.logout(request, () => {
                    shared.login(request, loginURL, testerUser, nonAdminUser.passwd, () => {
                      request
                        .get(apiSystem)
                        .end((err, systemRes) => {
                          if (err) {
                            return done(err);
                          }
                          expect(systemRes.status).to.equal(200);

                          request
                            .post(apiMetaContext)
                            .send(context)
                            .set('X-Secure-Modify-Token', shared.secureModifyToken())
                            .end((err, pageMetaRes) => {
                              if (err) {
                                return done(err);
                              }
                              expect(pageMetaRes.status).to.equal(200);
                              expect(pageMetaRes.body.error).to.equal(false);
                              expect(pageMetaRes.body.items).to.equal(undefined);
                              const resultPageIds = pageMetaRes.body.data.map(page => page.id);
                              expect(resultPageIds.includes(mockPage.id)).to.equal(true);

                              shared.logout(request, () => {
                                shared.login(request, loginURL, adminLogin, adminPasswd, () => {
                                  request
                                    .delete(apiPage.concat(mockPage.id))
                                    .set('X-Secure-Modify-Token', shared.secureModifyToken())
                                    .end(err => {
                                      if (err) {
                                        return done(err);
                                      }
                                      deleteRole(roleId).then(deleteResult => {
                                        expect(deleteResult.status).to.equal(200);
                                        return done();
                                      }).catch(done);
                                    });
                                });
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
  });

  it('should fail to get the page meta data when one of the page tag matches with excludeTags', done => {
    const mockPage = {
      ...mockData.page,
      id: 'matchesTagsGetMetaDataWithLogin',
      title: 'matchesTagsGetMetaDataWithLogin',
      tags: [{
        name: '__system',
        values: ['dev', 'test']
      }]
    };
    mockData.appConfig.app.excludeTags = ['prod', 'dev'];
    shared.logout(request, () => {
      shared.login(request, loginURL, adminLogin, adminPasswd, () => {
        createRole(role).then(res => {
          expect(res.status).to.equal(200);
          expect(res.body.role).to.not.equal(null);
          expect(res.body.role.name).to.equal('bvd_tester');
          roleId = res.body.role.id;
          request
            .put(`${apiAppConfig}/MyApp`)
            .send(mockData.appConfig)
            .set('X-Secure-Modify-Token', shared.secureModifyToken())
            .end((err, configResult) => {
              if (err) {
                return done(err);
              }
              expect(configResult.status).to.equal(200);
              expect(configResult.body.error).to.equal(false);
              request
                .post(apiPage)
                .send(mockPage)
                .set('X-Secure-Modify-Token', shared.secureModifyToken())
                .end((err, pageCreateRes) => {
                  if (err) {
                    return done(err);
                  }
                  expect(pageCreateRes.status).to.equal(200);
                  expect(pageCreateRes.body.error).to.equal(false);
                  shared.logout(request, () => {
                    shared.login(request, loginURL, testerUser, nonAdminUser.passwd, () => {
                      request
                        .get(apiSystem)
                        .end((err, systemRes) => {
                          if (err) {
                            return done(err);
                          }
                          expect(systemRes.status).to.equal(200);
                          request
                            .post(apiMetaContext)
                            .send(context)
                            .set('X-Secure-Modify-Token', shared.secureModifyToken())
                            .end((err, pageMetaRes) => {
                              if (err) {
                                return done(err);
                              }
                              expect(pageMetaRes.status).to.equal(200);
                              expect(pageMetaRes.body.error).to.equal(false);
                              expect(pageMetaRes.body.items).to.equal(undefined);
                              const resultPageIds = pageMetaRes.body.data.map(page => page.id);
                              expect(resultPageIds.includes(mockPage.id)).to.equal(false);
                              // Delete of the page is not done, since it can't be deleted due to the exclude tags
                              shared.logout(request, () => {
                                shared.login(request, loginURL, adminLogin, adminPasswd, () => {
                                  deleteRole(roleId).then(deleteResult => {
                                    expect(deleteResult.status).to.equal(200);
                                    return done();
                                  }).catch(done);
                                });
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
  });

  it('Pages with tags must be listed when no tags are added in excludeTags of appConfig', done => {
    const mockPage = {
      ...mockData.page,
      id: 'noTagsInAppConfig',
      title: 'noTagsInAppConfig',
      tags: [{
        name: '__system',
        values: ['dev', 'test']
      }]
    };
    mockData.appConfig.app.excludeTags = [];
    shared.logout(request, () => {
      shared.login(request, loginURL, adminLogin, adminPasswd, () => {
        createRole(role).then(res => {
          expect(res.status).to.equal(200);
          expect(res.body.role).to.not.equal(null);
          expect(res.body.role.name).to.equal('bvd_tester');
          roleId = res.body.role.id;

          request
            .put(`${apiAppConfig}/MyApp`)
            .send(mockData.appConfig)
            .set('X-Secure-Modify-Token', shared.secureModifyToken())
            .end((err, configResult) => {
              if (err) {
                return done(err);
              }
              expect(configResult.status).to.equal(200);
              expect(configResult.body.error).to.equal(false);
              request
                .post(apiPage)
                .send(mockPage)
                .set('X-Secure-Modify-Token', shared.secureModifyToken())
                .end((err, pageCreateRes) => {
                  if (err) {
                    return done(err);
                  }
                  expect(pageCreateRes.status).to.equal(200);
                  expect(pageCreateRes.body.error).to.equal(false);
                  shared.logout(request, () => {
                    shared.login(request, loginURL, testerUser, nonAdminUser.passwd, () => {
                      request
                        .get(apiSystem)
                        .end((err, systemRes) => {
                          if (err) {
                            return done(err);
                          }
                          expect(systemRes.status).to.equal(200);
                          request
                            .post(apiMetaContext)
                            .send(context)
                            .set('X-Secure-Modify-Token', shared.secureModifyToken())
                            .end((err, pageMetaRes) => {
                              if (err) {
                                return done(err);
                              }
                              expect(pageMetaRes.status).to.equal(200);
                              expect(pageMetaRes.body.error).to.equal(false);
                              expect(pageMetaRes.body.items).to.equal(undefined);
                              const resultPageIds = pageMetaRes.body.data.map(page => page.id);
                              expect(resultPageIds.includes(mockPage.id)).to.equal(true);
                              request
                                .delete(apiPage.concat(mockPage.id))
                                .set('X-Secure-Modify-Token', shared.secureModifyToken())
                                .end(err => {
                                  if (err) {
                                    return done(err);
                                  }
                                  shared.logout(request, () => {
                                    shared.login(request, loginURL, adminLogin, adminPasswd, () => {
                                      deleteRole(roleId).then(deleteResult => {
                                        expect(deleteResult.status).to.equal(200);
                                        deleteTag(mockPage).then(result => {
                                          expect(result).not.to.equal(null);
                                          return done();
                                        }).catch(done);
                                      }).catch(done);
                                    });
                                  });
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
  });

  it('Pages with no tags also must be listed when tags are added in excludeTags of appConfig', done => {
    const mockPage = {
      ...mockData.page,
      id: 'noTagsOnPage',
      title: 'noTagsOnPage',
      tags: []
    };
    mockData.appConfig.app.excludeTags = ['dev', 'test'];
    shared.logout(request, () => {
      shared.login(request, loginURL, adminLogin, adminPasswd, () => {
        createRole(role).then(res => {
          expect(res.status).to.equal(200);
          expect(res.body.role).to.not.equal(null);
          expect(res.body.role.name).to.equal('bvd_tester');
          roleId = res.body.role.id;
          request
            .put(`${apiAppConfig}/MyApp`)
            .send(mockData.appConfig)
            .set('X-Secure-Modify-Token', shared.secureModifyToken())
            .end((err, configResult) => {
              if (err) {
                return done(err);
              }
              expect(configResult.status).to.equal(200);
              expect(configResult.body.error).to.equal(false);

              request
                .post(apiPage)
                .send(mockPage)
                .set('X-Secure-Modify-Token', shared.secureModifyToken())
                .end((err, pageCreateRes) => {
                  if (err) {
                    return done(err);
                  }
                  expect(pageCreateRes.status).to.equal(200);
                  expect(pageCreateRes.body.error).to.equal(false);
                  shared.logout(request, () => {
                    shared.login(request, loginURL, testerUser, nonAdminUser.passwd, () => {
                      request
                        .get(apiSystem)
                        .end((err, systemRes) => {
                          if (err) {
                            return done(err);
                          }
                          expect(systemRes.status).to.equal(200);
                          request
                            .post(apiMetaContext)
                            .send(context)
                            .set('X-Secure-Modify-Token', shared.secureModifyToken())
                            .end((err, pageMetaRes) => {
                              if (err) {
                                return done(err);
                              }
                              expect(pageMetaRes.status).to.equal(200);
                              expect(pageMetaRes.body.error).to.equal(false);
                              expect(pageMetaRes.body.items).to.equal(undefined);
                              const resultPageIds = pageMetaRes.body.data.map(page => page.id);
                              expect(resultPageIds.includes(mockPage.id)).to.equal(true);
                              shared.logout(request, () => {
                                shared.login(request, loginURL, adminLogin, adminPasswd, () => {
                                  deleteRole(roleId).then(deleteResult => {
                                    expect(deleteResult.status).to.equal(200);
                                    request
                                      .delete(apiPage.concat(mockPage.id))
                                      .set('X-Secure-Modify-Token', shared.secureModifyToken())
                                      .end(err => {
                                        if (err) {
                                          return done(err);
                                        }
                                        return done();
                                      });
                                  }).catch(done);
                                });
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
  });

  it('Restore original appConfig', done => {
    request
      .put(`${apiAppConfig}/MyApp`)
      .send(originalAppConfig)
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.status).to.equal(200);
        expect(res.body.error).to.equal(false);
        expect(res.body.appConfig).to.equal(undefined);
        expect(res.body.data.appConfig.app).not.to.equal(undefined);
        return done();
      });
  });

  it('logout', done => {
    shared.logout(request, done);
  });

  // login as admin and delete the pages
  // eslint-disable-next-line mocha/no-identical-title
  it('Login admin', done => {
    shared.login(request, loginURL, adminLogin, adminPasswd, done);
  });

  it('Delete pages', done => {
    const pagesToDelete = [{
      id: 'matchesTagsGetMetaDataWithLogin'
    }];
    shared.deleteItems(request, apiPage, pagesToDelete, done);
  });

  // eslint-disable-next-line mocha/no-identical-title
  it('logout', done => {
    shared.logout(request, done);
  });
});

describe('Pages can enabled with licenses via page tagging', () => {
  const mockLicenseFilePath = '../../../../tools/FakeAPServer/mockLicense.json';
  let originalAppConfig;
  let originalLicenseInfo = '';
  const emptyLicenseInfo = {
    features: [],
    total: -1,
    details: [{
      expDateString: null,
      type: '',
      expDate: null,
      capacity: -1
    }],
    instantOn: false
  };

  it('Login admin', done => {
    shared.login(request, loginURL, nonAdminUser.login, nonAdminUser.passwd, done);
  });

  it('Save original appConfig', done => {
    request
      .get(`${apiAppConfig}/MyApp`)
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

  it('Upload app config needed for testing', done => {
    shared.logout(request, () => {
      shared.login(request, loginURL, adminLogin, adminPasswd, () => {
        request
          .put(`${apiAppConfig}/MyApp`)
          .send(mockData.appConfig)
          .set('X-Secure-Modify-Token', shared.secureModifyToken())
          .end((err, res) => {
            if (err) {
              return done(err);
            }
            expect(res.status).to.equal(200);
            expect(res.body.error).to.equal(false);
            expect(res.body.appConfig).to.equal(undefined);
            expect(res.body.data.appConfig.app.l10n).not.to.be.undefined;
            shared.logout(request, () => {
              shared.login(request, loginURL, nonAdminUser.login, nonAdminUser.passwd, () => {
                request
                  .get(apiSystem)
                  .end((err, systemRes) => {
                    if (err) {
                      return done(err);
                    }
                    expect(systemRes.status).to.equal(200);
                    expect(systemRes.body.appConfig.app).not.to.be.undefined;
                    expect(systemRes.body.appConfig.context).not.to.be.undefined;
                    expect(systemRes.body.data).not.to.be.undefined;
                    return done();
                  });
              });
            });
          });
      });
    });
  });

  it('Read mock license file', done => {
    originalLicenseInfo = JSON.parse(fs.readFileSync(path.resolve(__dirname, mockLicenseFilePath)));
    done();
  });

  it('License based page should be retrieved when license is installed and appConfig contains the license information', done => {
    const mockPage = {
      ...mockData.page,
      id: 'licenseTest',
      title: 'licenseTest',
      tags: [{
        name: '__licenses',
        values: ['nomUltimate']
      }]
    };
    mockData.appConfig.app.features = {
      nomUltimate: [100006, 1204],
      npmExpress: [362]
    };
    shared.logout(request, () => {
      shared.login(request, loginURL, adminLogin, adminPasswd, () => {
        createRole(role).then(res => {
          expect(res.status).to.equal(200);
          expect(res.body.role).to.not.equal(null);
          expect(res.body.role.name).to.equal('bvd_tester');
          roleId = res.body.role.id;
          request
            .put(`${apiAppConfig}/MyApp`)
            .send(mockData.appConfig)
            .set('X-Secure-Modify-Token', shared.secureModifyToken())
            .end((err, result) => {
              if (err) {
                return done(err);
              }
              expect(result.status).to.equal(200);
              expect(result.body.error).to.equal(false);
              request
                .post(apiPage)
                .send(mockPage)
                .set('X-Secure-Modify-Token', shared.secureModifyToken())
                .end((err, pageCreateRes) => {
                  if (err) {
                    return done(err);
                  }
                  expect(pageCreateRes.status).to.be.equal(200);
                  expect(pageCreateRes.body.error).to.equal(false);
                  shared.logout(request, () => {
                    shared.login(request, loginURL, testerUser, adminPasswd, () => {
                      fs.writeFileSync(path.resolve(__dirname, mockLicenseFilePath), JSON.stringify(originalLicenseInfo, null, 2));
                      request
                        .get(apiSystem)
                        .end((err, systemRes) => {
                          if (err) {
                            return done(err);
                          }
                          expect(systemRes.status).to.equal(200);
                          request
                            .get(apiPage.concat(mockPage.id))
                            .end((err, pageGetRes) => {
                              if (err) {
                                return done(err);
                              }
                              expect(pageGetRes.status).to.equal(200);
                              expect(pageGetRes.body.error).to.equal(false);
                              shared.logout(request, () => {
                                shared.login(request, loginURL, adminLogin, adminPasswd, () => {
                                  request
                                    .delete(apiPage.concat(mockPage.id))
                                    .set('X-Secure-Modify-Token', shared.secureModifyToken())
                                    .end(err => {
                                      if (err) {
                                        return done(err);
                                      }
                                      deleteRole(roleId).then(deleteResult => {
                                        expect(deleteResult.status).to.equal(200);
                                        return done();
                                      }).catch(done);
                                    });
                                });
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
  });

  it('Page with no license info should be retrieved when license is installed and appConfig contains the same license info', done => {
    const mockPage = {
      ...mockData.page,
      id: 'licenseTest',
      title: 'licenseTest',
      tags: []
    };
    mockData.appConfig.app.features = {
      nomUltimate: [100006, 1204],
      npmExpress: [362]
    };
    shared.logout(request, () => {
      shared.login(request, loginURL, adminLogin, adminPasswd, () => {
        createRole(role).then(res => {
          expect(res.status).to.equal(200);
          expect(res.body.role).to.not.equal(null);
          expect(res.body.role.name).to.equal('bvd_tester');
          roleId = res.body.role.id;
          request
            .put(`${apiAppConfig}/MyApp`)
            .send(mockData.appConfig)
            .set('X-Secure-Modify-Token', shared.secureModifyToken())
            .end((err, result) => {
              if (err) {
                return done(err);
              }
              expect(result.status).to.equal(200);
              expect(result.body.error).to.equal(false);
              request
                .post(apiPage)
                .send(mockPage)
                .set('X-Secure-Modify-Token', shared.secureModifyToken())
                .end((err, pageCreateRes) => {
                  if (err) {
                    return done(err);
                  }
                  expect(pageCreateRes.status).to.be.equal(200);
                  expect(pageCreateRes.body.error).to.equal(false);
                  shared.logout(request, () => {
                    shared.login(request, loginURL, testerUser, nonAdminUser.passwd, () => {
                      fs.writeFileSync(path.resolve(__dirname, mockLicenseFilePath), JSON.stringify(originalLicenseInfo, null, 2));
                      request
                        .get(apiSystem)
                        .end((err, systemRes) => {
                          if (err) {
                            return done(err);
                          }
                          expect(systemRes.status).to.equal(200);
                          request
                            .get(apiPage.concat(mockPage.id))
                            .end((err, pageGetRes) => {
                              if (err) {
                                return done(err);
                              }
                              expect(pageGetRes.status).to.equal(200);
                              expect(pageGetRes.body.error).to.equal(false);
                              shared.logout(request, () => {
                                shared.login(request, loginURL, adminLogin, adminPasswd, () => {
                                  request
                                    .delete(apiPage.concat(mockPage.id))
                                    .set('X-Secure-Modify-Token', shared.secureModifyToken())
                                    .end(err => {
                                      if (err) {
                                        return done(err);
                                      }
                                      deleteRole(roleId).then(deleteResult => {
                                        expect(deleteResult.status).to.equal(200);
                                        return done();
                                      }).catch(done);
                                    });
                                });
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
  });

  it('Page with no license info should be retrieved when license is installed but appConfig feature list is empty', done => {
    const mockPage = {
      ...mockData.page,
      id: 'licenseTest',
      title: 'licenseTest',
      tags: []
    };
    mockData.appConfig.app.features = {};
    shared.logout(request, () => {
      shared.login(request, loginURL, adminLogin, adminPasswd, () => {
        createRole(role).then(res => {
          expect(res.status).to.equal(200);
          expect(res.body.role).to.not.equal(null);
          expect(res.body.role.name).to.equal('bvd_tester');
          roleId = res.body.role.id;
          request
            .put(`${apiAppConfig}/MyApp`)
            .send(mockData.appConfig)
            .set('X-Secure-Modify-Token', shared.secureModifyToken())
            .end((err, result) => {
              if (err) {
                return done(err);
              }
              expect(result.status).to.equal(200);
              expect(result.body.error).to.equal(false);
              request
                .post(apiPage)
                .send(mockPage)
                .set('X-Secure-Modify-Token', shared.secureModifyToken())
                .end((err, pageCreateRes) => {
                  if (err) {
                    return done(err);
                  }
                  expect(pageCreateRes.status).to.be.equal(200);
                  expect(pageCreateRes.body.error).to.equal(false);
                  shared.logout(request, () => {
                    shared.login(request, loginURL, testerUser, nonAdminUser.passwd, () => {
                      fs.writeFileSync(path.resolve(__dirname, mockLicenseFilePath), JSON.stringify(originalLicenseInfo, null, 2));
                      request
                        .get(apiSystem)
                        .end((err, systemRes) => {
                          if (err) {
                            return done(err);
                          }
                          expect(systemRes.status).to.equal(200);

                          request
                            .get(apiPage.concat(mockPage.id))
                            .end((err, pageGetRes) => {
                              if (err) {
                                return done(err);
                              }
                              expect(pageGetRes.status).to.equal(200);
                              shared.logout(request, () => {
                                shared.login(request, loginURL, adminLogin, adminPasswd, () => {
                                  request
                                    .delete(apiPage.concat(mockPage.id))
                                    .set('X-Secure-Modify-Token', shared.secureModifyToken())
                                    .end(err => {
                                      if (err) {
                                        return done(err);
                                      }
                                      deleteRole(roleId).then(deleteResult => {
                                        expect(deleteResult.status).to.equal(200);
                                        return done();
                                      }).catch(done);
                                    });
                                });
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
  });

  it('License based page should not be retrieved when license is installed but appConfig feature list is empty', done => {
    const mockPage = {
      ...mockData.page,
      id: 'emptyFeatureAppConfig',
      title: 'emptyFeatureAppConfig',
      tags: [{
        name: '__licenses',
        values: ['nomUltimate']
      }]
    };
    mockData.appConfig.app.features = {};
    shared.logout(request, () => {
      shared.login(request, loginURL, adminLogin, adminPasswd, () => {
        createRole(role).then(res => {
          expect(res.status).to.equal(200);
          expect(res.body.role).to.not.equal(null);
          expect(res.body.role.name).to.equal('bvd_tester');
          roleId = res.body.role.id;
          request
            .put(`${apiAppConfig}/MyApp`)
            .send(mockData.appConfig)
            .set('X-Secure-Modify-Token', shared.secureModifyToken())
            .end((err, result) => {
              if (err) {
                return done(err);
              }
              expect(result.status).to.equal(200);
              expect(result.body.error).to.equal(false);
              shared.logout(request, () => {
                shared.login(request, loginURL, adminLogin, adminPasswd, () => {
                  fs.writeFileSync(path.resolve(__dirname, mockLicenseFilePath), JSON.stringify(originalLicenseInfo, null, 2));
                  request
                    .get(apiSystem)
                    .end((err, systemRes) => {
                      if (err) {
                        return done(err);
                      }
                      expect(systemRes.status).to.equal(200);
                      request
                        .post(apiPage)
                        .send(mockPage)
                        .set('X-Secure-Modify-Token', shared.secureModifyToken())
                        .end((err, pageCreateRes) => {
                          if (err) {
                            return done(err);
                          }
                          expect(pageCreateRes.status).to.be.equal(200);
                          expect(pageCreateRes.body.error).to.equal(false);
                          shared.logout(request, () => {
                            shared.login(request, loginURL, testerUser, nonAdminUser.passwd, () => {
                              request
                                .get(apiPage.concat(mockPage.id))
                                .end((err, pageGetRes) => {
                                  if (err) {
                                    return done(err);
                                  }
                                  expect(pageGetRes.status).to.equal(404);
                                  // Delete of the page is not done, since it can't be deleted due to the license
                                  shared.logout(request, () => {
                                    shared.login(request, loginURL, adminLogin, adminPasswd, () => {
                                      deleteRole(roleId).then(deleteResult => {
                                        expect(deleteResult.status).to.equal(200);
                                        return done();
                                      }).catch(done);
                                    });
                                  });
                                });
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
  });

  it('License based page should not be retrieved when the license installed does not matches with the page licenses', done => {
    const mockPage = {
      ...mockData.page,
      id: 'otherLicense',
      title: 'otherLicense',
      tags: [{
        name: '__licenses',
        values: ['nomMgmt']
      }]
    };
    mockData.appConfig.app.features = {
      nomUltimate: [100006, 1204],
      npmExpress: [362]
    };
    shared.logout(request, () => {
      shared.login(request, loginURL, adminLogin, adminPasswd, () => {
        createRole(role).then(res => {
          expect(res.status).to.equal(200);
          expect(res.body.role).to.not.equal(null);
          expect(res.body.role.name).to.equal('bvd_tester');
          roleId = res.body.role.id;
          request
            .put(`${apiAppConfig}/MyApp`)
            .send(mockData.appConfig)
            .set('X-Secure-Modify-Token', shared.secureModifyToken())
            .end((err, result) => {
              if (err) {
                return done(err);
              }
              expect(result.status).to.equal(200);
              expect(result.body.error).to.equal(false);
              shared.logout(request, () => {
                shared.login(request, loginURL, adminLogin, adminPasswd, () => {
                  fs.writeFileSync(path.resolve(__dirname, mockLicenseFilePath), JSON.stringify(originalLicenseInfo, null, 2));
                  request
                    .get(apiSystem)
                    .end((err, systemRes) => {
                      if (err) {
                        return done(err);
                      }
                      expect(systemRes.status).to.equal(200);
                      request
                        .post(apiPage)
                        .send(mockPage)
                        .set('X-Secure-Modify-Token', shared.secureModifyToken())
                        .end((err, pageCreateRes) => {
                          if (err) {
                            return done(err);
                          }
                          expect(pageCreateRes.status).to.be.equal(200);
                          expect(pageCreateRes.body.error).to.equal(false);
                          shared.logout(request, () => {
                            shared.login(request, loginURL, testerUser, nonAdminUser.passwd, () => {
                              request
                                .get(apiPage.concat(mockPage.id))
                                .end((err, pageGetRes) => {
                                  if (err) {
                                    return done(err);
                                  }
                                  expect(pageGetRes.status).to.equal(404);
                                  expect(pageGetRes.body.error).to.equal(true);
                                  // Delete of the page is not done, since it can't be deleted due to the license
                                  shared.logout(request, () => {
                                    shared.login(request, loginURL, adminLogin, adminPasswd, () => {
                                      deleteRole(roleId).then(deleteResult => {
                                        expect(deleteResult.status).to.equal(200);
                                        deleteTag(mockPage).then(tagResult => {
                                          expect(tagResult.status).to.equal(200);
                                          return done();
                                        }).catch(done);
                                      }).catch(done);
                                    });
                                  });
                                });
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
  });

  it('License based page should not be retrieved when license is not installed 1', done => {
    const mockPage = {
      ...mockData.page,
      id: 'noLicenseInstalled',
      title: 'noLicenseInstalled',
      tags: [{
        name: '__licenses',
        values: ['nomUltimate']
      }]
    };
    mockData.appConfig.app.features = {
      nomUltimate: [5678, 1204],
      npmExpress: [362]
    };
    shared.logout(request, () => {
      shared.login(request, loginURL, adminLogin, adminPasswd, () => {
        createRole(role).then(res => {
          expect(res.status).to.equal(200);
          expect(res.body.role).to.not.equal(null);
          expect(res.body.role.name).to.equal('bvd_tester');
          roleId = res.body.role.id;
          request
            .put(`${apiAppConfig}/MyApp`)
            .send(mockData.appConfig)
            .set('X-Secure-Modify-Token', shared.secureModifyToken())
            .end((err, result) => {
              if (err) {
                return done(err);
              }
              expect(result.status).to.equal(200);
              expect(result.body.error).to.equal(false);
              shared.logout(request, () => {
                shared.login(request, loginURL, adminLogin, adminPasswd, () => {
                  fs.writeFileSync(path.resolve(__dirname, mockLicenseFilePath), JSON.stringify(emptyLicenseInfo, null, 2));
                  request
                    .get(apiSystem)
                    .end((err, systemRes) => {
                      if (err) {
                        return done(err);
                      }
                      expect(systemRes.status).to.equal(200);
                      request
                        .post(apiPage)
                        .send(mockPage)
                        .set('X-Secure-Modify-Token', shared.secureModifyToken())
                        .end((err, pageCreateRes) => {
                          if (err) {
                            return done(err);
                          }
                          expect(pageCreateRes.status).to.be.equal(200);
                          expect(pageCreateRes.body.error).to.equal(false);
                          shared.logout(request, () => {
                            shared.login(request, loginURL, testerUser, nonAdminUser.passwd, () => {
                              request
                                .get(apiPage.concat(mockPage.id))
                                .end((err, pageGetRes) => {
                                  if (err) {
                                    return done(err);
                                  }
                                  expect(pageGetRes.status).to.equal(404);
                                  expect(pageGetRes.body.error).to.equal(true);
                                  // Delete of the page is not done, since it can't be deleted due to the license
                                  shared.logout(request, () => {
                                    shared.login(request, loginURL, adminLogin, adminPasswd, () => {
                                      deleteRole(roleId).then(deleteResult => {
                                        expect(deleteResult.status).to.equal(200);
                                        return done();
                                      }).catch(done);
                                    });
                                  });
                                });
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
  });

  it('License based page should not be retrieved when license is not installed 2', done => {
    const mockPage = {
      ...mockData.page,
      id: 'noLicenseInstalledAppConfigMultipleValues',
      title: 'noLicenseInstalledAppConfigMultipleValues',
      tags: [{
        name: '__licenses',
        values: ['nomUltimate', 'nomPremium']
      }]
    };
    mockData.appConfig.app.features = {
      nomUltimate: [100006, 1204],
      npmExpress: [362]
    };
    shared.logout(request, () => {
      shared.login(request, loginURL, adminLogin, adminPasswd, () => {
        createRole(role).then(res => {
          expect(res.status).to.equal(200);
          expect(res.body.role).to.not.equal(null);
          expect(res.body.role.name).to.equal('bvd_tester');
          roleId = res.body.role.id;
          request
            .put(`${apiAppConfig}/MyApp`)
            .send(mockData.appConfig)
            .set('X-Secure-Modify-Token', shared.secureModifyToken())
            .end((err, result) => {
              if (err) {
                return done(err);
              }
              expect(result.status).to.equal(200);
              expect(result.body.error).to.equal(false);
              shared.logout(request, () => {
                shared.login(request, loginURL, adminLogin, adminPasswd, () => {
                  fs.writeFileSync(path.resolve(__dirname, mockLicenseFilePath), JSON.stringify(emptyLicenseInfo, null, 2));
                  request
                    .get(apiSystem)
                    .end((err, systemRes) => {
                      if (err) {
                        return done(err);
                      }
                      expect(systemRes.status).to.equal(200);
                      request
                        .post(apiPage)
                        .send(mockPage)
                        .set('X-Secure-Modify-Token', shared.secureModifyToken())
                        .end((err, pageCreateRes) => {
                          if (err) {
                            return done(err);
                          }
                          expect(pageCreateRes.status).to.be.equal(200);
                          expect(pageCreateRes.body.error).to.equal(false);
                          shared.logout(request, () => {
                            shared.login(request, loginURL, testerUser, nonAdminUser.passwd, () => {
                              request
                                .get(apiPage.concat(mockPage.id))
                                .end((err, pageGetRes) => {
                                  if (err) {
                                    return done(err);
                                  }
                                  expect(pageGetRes.status).to.equal(404);
                                  expect(pageGetRes.body.error).to.equal(true);
                                  // Delete of the page is not done, since it can't be deleted due to the license
                                  shared.logout(request, () => {
                                    shared.login(request, loginURL, adminLogin, adminPasswd, () => {
                                      deleteRole(roleId).then(deleteResult => {
                                        expect(deleteResult.status).to.equal(200);
                                        return done();
                                      }).catch(done);
                                    });
                                  });
                                });
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
  });

  it('should create menu entry for licensed page (Backward compatibility test)', done => {
    const mockPage = {
      ...mockData.page,
      tags: [{
        name: '__licenses',
        values: ['npmExpress']
      }],
      categoryId: '3.3'
    };
    mockData.appConfig.app.features = {
      nomUltimate: [100006, 1204],
      npmExpress: [362]
    };

    shared.logout(request, () => {
      shared.login(request, loginURL, adminLogin, adminPasswd, () => {
        createRole(role).then(res => {
          expect(res.status).to.equal(200);
          expect(res.body.role).to.not.equal(null);
          expect(res.body.role.name).to.equal('bvd_tester');
          roleId = res.body.role.id;

          request
            .put(`${apiAppConfig}/MyApp`)
            .send(mockData.appConfig)
            .set('X-Secure-Modify-Token', shared.secureModifyToken())
            .end((err, result) => {
              if (err) {
                return done(err);
              }
              expect(result.status).to.equal(200);
              expect(result.body.error).to.equal(false);
              shared.logout(request, () => {
                shared.login(request, loginURL, adminLogin, adminPasswd, () => {
                  fs.writeFileSync(path.resolve(__dirname, mockLicenseFilePath), JSON.stringify(originalLicenseInfo, null, 2));
                  request
                    .get(apiSystem)
                    .end((err, systemRes) => {
                      if (err) {
                        return done(err);
                      }
                      expect(systemRes.status).to.equal(200);
                      request
                        .post(apiPage)
                        .send(mockPage)
                        .set('X-Secure-Modify-Token', shared.secureModifyToken())
                        .end((err, pageCreateRes) => {
                          if (err) {
                            return done(err);
                          }
                          expect(pageCreateRes.status).to.equal(200);
                          expect(pageCreateRes.body.error).to.equal(false);
                          expect(pageCreateRes.body[0]).to.equal(undefined);
                          const pageId = pageCreateRes.body.data[0].id;
                          request
                            .get(apiMenuEntry)
                            .end((err, menuEntryGetRes) => {
                              if (err) {
                                return done(err);
                              }
                              expect(menuEntryGetRes.status).to.be.equal(200);
                              const menuEntry = menuEntryGetRes.body.data.filter(menu => menu.pageId === pageId);
                              const menuEntryId = menuEntry[0].id;
                              expect(menuEntry.length).to.equal(1);

                              request
                                .delete(apiPage.concat(mockPage.id))
                                .set('X-Secure-Modify-Token', shared.secureModifyToken())
                                .end(err => {
                                  if (err) {
                                    return done(err);
                                  }
                                  request
                                    .delete(apiMenuEntry.concat(menuEntryId))
                                    .set('X-Secure-Modify-Token', shared.secureModifyToken())
                                    .end(err => {
                                      if (err) {
                                        return done(err);
                                      }
                                      deleteRole(roleId).then(deleteResult => {
                                        expect(deleteResult.status).to.equal(200);
                                        return done();
                                      }).catch(done);
                                    });
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
  });

  it('Page with no license should be retrieved when license is not installed but appConfig has license info', done => {
    const mockPage = {
      ...mockData.page,
      id: 'pageNoLicense',
      title: 'pageNoLicense',
      tags: []
    };
    mockData.appConfig.app.features = {
      nomUltimate: [100006, 1204],
      npmExpress: [362]
    };
    shared.logout(request, () => {
      shared.login(request, loginURL, adminLogin, adminPasswd, () => {
        createRole(role).then(res => {
          expect(res.status).to.equal(200);
          expect(res.body.role).to.not.equal(null);
          expect(res.body.role.name).to.equal('bvd_tester');
          roleId = res.body.role.id;
          request
            .put(`${apiAppConfig}/MyApp`)
            .send(mockData.appConfig)
            .set('X-Secure-Modify-Token', shared.secureModifyToken())
            .end((err, result) => {
              if (err) {
                return done(err);
              }
              expect(result.status).to.equal(200);
              expect(result.body.error).to.equal(false);
              request
                .post(apiPage)
                .send(mockPage)
                .set('X-Secure-Modify-Token', shared.secureModifyToken())
                .end((err, pageCreateRes) => {
                  if (err) {
                    return done(err);
                  }
                  expect(pageCreateRes.status).to.be.equal(200);
                  expect(pageCreateRes.body.error).to.equal(false);
                  shared.logout(request, () => {
                    shared.login(request, loginURL, testerUser, nonAdminUser.passwd, () => {
                      fs.writeFileSync(path.resolve(__dirname, mockLicenseFilePath), JSON.stringify(emptyLicenseInfo, null, 2));
                      request
                        .get(apiSystem)
                        .end((err, systemRes) => {
                          if (err) {
                            return done(err);
                          }
                          expect(systemRes.status).to.equal(200);

                          request
                            .get(apiPage.concat(mockPage.id))
                            .end((err, pageGetRes) => {
                              if (err) {
                                return done(err);
                              }
                              expect(pageGetRes.status).to.equal(200);
                              expect(pageGetRes.body.error).to.equal(false);
                              shared.logout(request, () => {
                                shared.login(request, loginURL, adminLogin, adminPasswd, () => {
                                  request
                                    .delete(apiPage.concat(mockPage.id))
                                    .set('X-Secure-Modify-Token', shared.secureModifyToken())
                                    .end(err => {
                                      if (err) {
                                        return done(err);
                                      }
                                      deleteRole(roleId).then(deleteResult => {
                                        expect(deleteResult.status).to.equal(200);
                                        return done();
                                      }).catch(done);
                                    });
                                });
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
  });

  it('Page should not be retrieved when appConfig features are empty and page license tag not matches with the license installed', done => {
    const mockPage = {
      ...mockData.page,
      id: 'pageNoFeatureAppConfig',
      title: 'pageNoFeatureAppConfig',
      tags: [{
        name: '__licenses',
        values: ['nomUltimate']
      }]
    };
    mockData.appConfig.app.features = {};
    const newLicenseInfo = {
      features: [
        100008
      ],
      total: -1,
      details: [{
        expDateString: 1609677644000,
        type: 'Suite License',
        expDate: 1609688644,
        capacity: -1
      }],
      instantOn: false
    };
    shared.logout(request, () => {
      shared.login(request, loginURL, adminLogin, adminPasswd, () => {
        createRole(role).then(res => {
          expect(res.status).to.equal(200);
          expect(res.body.role).to.not.equal(null);
          expect(res.body.role.name).to.equal('bvd_tester');
          roleId = res.body.role.id;
          request
            .put(`${apiAppConfig}/MyApp`)
            .send(mockData.appConfig)
            .set('X-Secure-Modify-Token', shared.secureModifyToken())
            .end((err, result) => {
              if (err) {
                return done(err);
              }
              expect(result.status).to.equal(200);
              expect(result.body.error).to.equal(false);
              shared.logout(request, () => {
                shared.login(request, loginURL, adminLogin, adminPasswd, () => {
                  fs.writeFileSync(path.resolve(__dirname, mockLicenseFilePath), JSON.stringify(newLicenseInfo, null, 2));
                  request
                    .get(apiSystem)
                    .end((err, systemRes) => {
                      if (err) {
                        return done(err);
                      }
                      expect(systemRes.status).to.equal(200);
                      request
                        .post(apiPage)
                        .send(mockPage)
                        .set('X-Secure-Modify-Token', shared.secureModifyToken())
                        .end((err, createPageRes) => {
                          if (err) {
                            return done(err);
                          }
                          expect(createPageRes.status).to.be.equal(200);
                          expect(createPageRes.body.error).to.equal(false);
                          shared.logout(request, () => {
                            shared.login(request, loginURL, testerUser, nonAdminUser.passwd, () => {
                              request
                                .get(apiPage.concat(mockPage.id))
                                .end((err, getPageRes) => {
                                  if (err) {
                                    return done(err);
                                  }
                                  expect(getPageRes.status).to.equal(404);
                                  expect(getPageRes.body.error).to.equal(true);
                                  // Delete of the page is not done, since it can't be deleted due to the license
                                  shared.logout(request, () => {
                                    shared.login(request, loginURL, adminLogin, adminPasswd, () => {
                                      deleteRole(roleId).then(deleteResult => {
                                        expect(deleteResult.status).to.equal(200);
                                        return done();
                                      }).catch(done);
                                    });
                                  });
                                });
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
  });

  it('Page should be retrieved when the page license tag matches with one of the licenses installed', done => {
    const mockPage = {
      ...mockData.page,
      id: 'licenseTest',
      title: 'licenseTest',
      tags: [{
        name: '__licenses',
        values: ['nomPremium']
      }]
    };
    mockData.appConfig.app.features = {
      nomUltimate: [100006, 1204],
      nomPremium: [100033],
      npmExpress: [362]
    };
    const newLicenseInfo = {
      features: [
        100133, 100033, 100035
      ],
      total: -1,
      details: [{
        expDateString: 1609677644000,
        type: 'Suite License',
        expDate: 1609688644,
        capacity: -1
      }],
      instantOn: false
    };
    shared.logout(request, () => {
      shared.login(request, loginURL, adminLogin, adminPasswd, () => {
        request
          .put(`${apiAppConfig}/MyApp`)
          .send(mockData.appConfig)
          .set('X-Secure-Modify-Token', shared.secureModifyToken())
          .end((err, res) => {
            if (err) {
              return done(err);
            }
            expect(res.status).to.equal(200);
            expect(res.body.error).to.equal(false);
            fs.writeFileSync(path.resolve(__dirname, mockLicenseFilePath), JSON.stringify(newLicenseInfo, null, 2));
            request
              .get(apiSystem)
              .end((err, systemRes) => {
                if (err) {
                  return done(err);
                }
                expect(systemRes.status).to.equal(200);
                request
                  .post(apiPage)
                  .send(mockPage)
                  .set('X-Secure-Modify-Token', shared.secureModifyToken())
                  .end((err, createPageRes) => {
                    if (err) {
                      return done(err);
                    }
                    expect(createPageRes.status).to.be.equal(200);
                    expect(createPageRes.body.error).to.equal(false);
                    request
                      .get(apiPage.concat(mockPage.id))
                      .end((err, getPageRes) => {
                        if (err) {
                          return done(err);
                        }
                        expect(getPageRes.status).to.equal(200);
                        expect(getPageRes.body.error).to.equal(false);
                        request
                          .delete(apiPage.concat(mockPage.id))
                          .set('X-Secure-Modify-Token', shared.secureModifyToken())
                          .end(err => {
                            if (err) {
                              return done(err);
                            }
                            return done();
                          });
                      });
                  });
              });
          });
      });
    });
  });

  it('Reverting back the changes in mock license file', done => {
    fs.writeFileSync(path.resolve(__dirname, mockLicenseFilePath), JSON.stringify(originalLicenseInfo, null, 2));
    return done();
  });

  it('Restore original appConfig', done => {
    shared.logout(request, () => {
      shared.login(request, loginURL, adminLogin, adminPasswd, () => {
        request
          .put(`${apiAppConfig}/MyApp`)
          .send(originalAppConfig)
          .set('X-Secure-Modify-Token', shared.secureModifyToken())
          .end((err, res) => {
            if (err) {
              return done(err);
            }
            expect(res.status).to.equal(200);
            expect(res.body.error).to.equal(false);
            expect(res.body.appConfig).to.equal(undefined);
            expect(res.body.data.appConfig.app).not.to.be.undefined;
            return done();
          });
      });
    });
  });

  it('Create special tags from non-admin user', done => {
    const mockPage = {
      ...mockData.page,
      id: 'noLicenseInstalled',
      title: 'noLicenseInstalled',
      tags: [{
        name: '__licenses',
        values: ['nomUltimate']
      }]
    };
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
    shared.logout(request, () => {
      shared.login(request, loginURL, adminLogin, adminPasswd, () => {
        createRole(myRole).then(res => {
          expect(res.status).to.equal(200);
          expect(res.body.role).to.not.equal(null);
          expect(res.body.role.name).to.equal('bvd_tester');
          roleId = res.body.role.id;
          shared.logout(request, () => {
            shared.login(request, loginURL, testerUser, nonAdminUser.passwd, () => {
              request
                .get(apiSystem)
                .end((err, result) => {
                  if (err) {
                    return done(err);
                  }
                  expect(result.status).to.equal(200);
                  request
                    .post(apiPage)
                    .send(mockPage)
                    .set('X-Secure-Modify-Token', shared.secureModifyToken())
                    .end((err, pageCreateRes) => {
                      if (err) {
                        return done(err);
                      }
                      expect(pageCreateRes.status).to.be.equal(403);
                      expect(pageCreateRes.body.error).to.equal(true);
                      expect(pageCreateRes.body.additionalInfo[0]).to.equal('User is Un-Authorized to create special tags.');
                      shared.logout(request, () => {
                        shared.login(request, loginURL, adminLogin, adminPasswd, () => {
                          deleteRole(roleId).then(deleteResult => {
                            expect(deleteResult.status).to.equal(200);
                            return done();
                          }).catch(done);
                        });
                      });
                    });
                });
            });
          });
        }).catch(done);
      });
    });
  });

  it('Update special tags from non-admin user', done => {
    const mockPage = {
      ...mockData.page,
      id: 'updateLicenseTest',
      title: 'UpdateLicenseTest',
      tags: []
    };
    const myRole = {
      name: 'bvd_tester',
      description: 'Test role for foundation',
      permission: [{
        // eslint-disable-next-line camelcase
        operation_key: 'FullControl',
        // eslint-disable-next-line camelcase
        resource_key: 'default_action<>All'
      }]
    };
    shared.logout(request, () => {
      shared.login(request, loginURL, adminLogin, adminPasswd, () => {
        createRole(myRole).then(res => {
          expect(res.status).to.equal(200);
          expect(res.body.role).to.not.equal(null);
          expect(res.body.role.name).to.equal('bvd_tester');
          roleId = res.body.role.id;
          request
            .post(apiPage)
            .send(mockPage)
            .set('X-Secure-Modify-Token', shared.secureModifyToken())
            .end((err, pageCreateRes) => {
              if (err) {
                return done(err);
              }
              expect(pageCreateRes.status).to.be.equal(200);
              expect(pageCreateRes.body.error).to.equal(false);
              shared.logout(request, () => {
                shared.login(request, loginURL, testerUser, nonAdminUser.passwd, () => {
                  request
                    .get(apiSystem)
                    .end((err, result) => {
                      if (err) {
                        return done(err);
                      }
                      expect(result.status).to.equal(200);

                      mockPage.tags = [{
                        name: '__licenses',
                        values: ['nomUltimate']
                      }];
                      request
                        .put(apiPage.concat(mockPage.id))
                        .send(mockPage)
                        .set('X-Secure-Modify-Token', shared.secureModifyToken())
                        .end((err, pageUpdateRes) => {
                          if (err) {
                            return done(err);
                          }
                          expect(pageUpdateRes.status).to.equal(403);
                          expect(pageUpdateRes.body.error).to.equal(true);
                          expect(pageUpdateRes.body.additionalInfo[0]).to.equal('Not authorized to update page.');
                          shared.logout(request, () => {
                            shared.login(request, loginURL, adminLogin, adminPasswd, () => {
                              deleteRole(roleId).then(deleteResult => {
                                expect(deleteResult.status).to.equal(200);
                                return done();
                              }).catch(done);
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
  });

  it('logout', done => {
    shared.logout(request, done);
  });

  // login as admin and delete the pages
  // eslint-disable-next-line mocha/no-identical-title
  it('Login admin', done => {
    shared.login(request, loginURL, adminLogin, adminPasswd, done);
  });

  it('Delete pages', done => {
    const pagesToDelete = [{
      id: 'emptyFeatureAppConfig'
    },
    {
      id: 'otherLicense'
    },
    {
      id: 'noLicenseInstalled'
    },
    {
      id: 'noLicenseInstalledAppConfigMultipleValues'
    },
    {
      id: 'pageNoFeatureAppConfig'
    },
    {
      id: 'updateLicenseTest'
    },
    {
      id: 'pageToTestTagDeletion'
    }
    ];
    shared.deleteItems(request, apiPage, pagesToDelete, done);
  });

  // eslint-disable-next-line mocha/no-identical-title
  it('logout', done => {
    shared.logout(request, done);
  });
});

describe('Pages with external content', () => {
  it('Login admin', done => {
    shared.login(request, loginURL, adminLogin, adminPasswd, done);
  });

  it('Should get external content (page)', done => {
    const externalPageConfig = {
      id: 'dynamicPageFullPageConfig',
      title: 'Dynamic Page',
      contentSource: {
        url: '{EXPLORE_CONTEXT_ROOT}/externalcomponents/dynamic/basicExternalPageFullPageConfig',
        path: '$.item'
      },
      view: {}
    };
    shared.createItems(request, apiPage, externalPageConfig, err => {
      if (err) {
        return done(err);
      }
      request
        .get(`${apiPage}dynamicPageFullPageConfig`)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res.status).to.equal(200);
          expect(res.body.data.id).to.equal('dynamicPageFullPageConfig');
          expect(res.body.data.view).to.not.be.undefined;
          expect(res.body.data.view.views.length).to.equal(1);
          shared.deleteItems(request, apiPage, [externalPageConfig], done);
        });
    });
  });

  it('Should get initial page on error on external content request (page)', done => {
    const externalPageConfig = {
      id: 'dynamicPageFullPageConfigNotExistingContentUrl',
      title: 'Dynamic Page',
      contentSource: {
        url: '{EXPLORE_CONTEXT_ROOT}/externalcomponents/dynamic/basicExternalPageFullPageConfigNotExisting',
        path: '$.item'
      },
      view: {}
    };
    shared.createItems(request, apiPage, externalPageConfig, err => {
      if (err) {
        return done(err);
      }
      request
        .get(`${apiPage}dynamicPageFullPageConfigNotExistingContentUrl`)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res.status).to.equal(200);
          expect(res.body.data.id).to.equal('dynamicPageFullPageConfigNotExistingContentUrl');
          expect(res.body.data.view).to.not.be.undefined;
          shared.deleteItems(request, apiPage, [externalPageConfig], done);
        });
    });
  });

  it('logout', done => {
    shared.logout(request, done);
  });
});
