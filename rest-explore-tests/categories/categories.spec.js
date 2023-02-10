const shared = require('../helpers/shared');
const supertest = require('supertest');
const testData = require('../mockData');
const mockData = JSON.parse(JSON.stringify(testData));
const request = supertest.agent(shared.exploreTestURL);

const loginURL = '/rest/v2/pages/';
const apiCategory = '/rest/v2/categories/';
const adminLogin = shared.tenant.email;
const adminPasswd = shared.tenant.password;

describe('Category crud operations', () => {
  it('Login admin', done => {
    shared.login(request, loginURL, adminLogin, adminPasswd, done);
  });

  it('Create category', done => {
    request
      .post(apiCategory)
      .send(mockData.category)
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.status).to.equal(200);
        expect(res.body.data[0].id).to.be.equal(mockData.category.id);
        expect(res.body[0]).to.equal(undefined);

        request
          .get(`${apiCategory}${mockData.category.id}`)
          .end((err, res1) => {
            if (err) {
              return done(err);
            }
            expect(res1.status).to.equal(200);
            expect(res1.body.data.id).to.equal(mockData.category.id);
            expect(res1.body.id).to.equal(undefined);
            done();
          });
      });
  });

  it('Create multiple categories', done => {
    request
      .post(apiCategory)
      .send(mockData.categories)
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.status).to.equal(200);
        expect(res.body.data.length).to.equal(mockData.categories.length);

        const testCategoryId1 = mockData.categories[0].id;
        request
          .get(`${apiCategory}${testCategoryId1}`)
          .end((err, res1) => {
            if (err) {
              return done(err);
            }
            expect(res1.status).to.equal(200);
            expect(res1.body.id).to.equal(undefined);
            expect(res1.body.data.id).to.equal(testCategoryId1);

            const testCategoryId2 = mockData.categories[1].id;
            request
              .get(`${apiCategory}${testCategoryId2}`)
              .end((err, res2) => {
                if (err) {
                  return done(err);
                }
                expect(res2.status).to.equal(200);
                expect(res2.body.data.id).to.equal(testCategoryId2);
                expect(res2.body.id).to.equal(undefined);
                done();
              });
          });
      });
  });

  it('Update category', done => {
    mockData.category.title = 'test_change_title';
    request
      .put(`${apiCategory}${mockData.category.id}`)
      .send(mockData.category)
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.status).to.equal(200);
        expect(res.body.data.title).to.be.equal('test_change_title');
        expect(res.body.title).to.equal(undefined);

        request
          .get(`${apiCategory}${mockData.category.id}`)
          .end((err, res1) => {
            if (err) {
              return done(err);
            }
            expect(res1.status).to.equal(200);
            expect(res1.body.data.title).to.be.equal(mockData.category.title);
            expect(res1.body.title).to.equal(undefined);
            done();
          });
      });
  });

  it('Get category by id', done => {
    request
      .get(`${apiCategory}${mockData.category.id}`)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.status).to.equal(200);
        expect(res.body.data.id).to.be.equal('testCategory');
        expect(res.body.id).to.equal(undefined);
        done();
      });
  });

  it('Delete category', done => {
    request
      .get(`${apiCategory}${mockData.category.id}`)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.status).to.equal(200);
        request
          .delete(`${apiCategory}${mockData.category.id}`)
          .set('X-Secure-Modify-Token', shared.secureModifyToken())
          .end((err, deleteCategoryRes) => {
            if (err) {
              return done(err);
            }
            expect(deleteCategoryRes.status).to.equal(200);
            expect(deleteCategoryRes.body.data).to.be.equal('Menu item deleted successfully');
            expect(deleteCategoryRes.body.result).to.equal(undefined);
            request
              .get(`${apiCategory}${mockData.category.id}`)
              .end((err, categoryGetRes) => {
                if (err) {
                  return done(err);
                }
                expect(categoryGetRes.status).to.equal(404);
                done();
              });
          });
      });
  });

  it('Creation of category should fail if widget json is passed as category config', done => {
    request
      .post(apiCategory)
      .send(mockData.widget)
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.status).to.be.equal(400);
        expect(res.body.error).to.equal(true);
        expect(res.body.additionalInfo[0]).to.be.equal('Invalid category specification: Title can\'t be blank,Abbreviation can\'t be blank');
        expect(res.error.text).not.to.be.equal('Invalid category specification: Title can\'t be blank,Abbreviation can\'t be blank');
        return done();
      });
  });

  it('Get a non-existing category by id', done => {
    request
      .get(`${apiCategory}nonExistingCategoryId`)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.status).to.equal(404);
        expect(res.body.error).to.equal(true);
        done();
      });
  });

  it('Update a non-existing category by id', done => {
    request
      .put(`${apiCategory}nonExistingCategoryId`)
      .send(mockData.category)
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.status).to.equal(500);
        expect(res.body.error).to.equal(true);
        done();
      });
  });

  it('Delete a non-existing category by id', done => {
    request
      .delete(`${apiCategory}nonExistingCategoryId`)
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .end((err, deleteCategoryRes) => {
        if (err) {
          return done(err);
        }
        expect(deleteCategoryRes.status).to.equal(500);
        expect(deleteCategoryRes.body.error).to.equal(true);
        done();
      });
  });

  it('Delete categories', done => {
    shared.deleteItems(request, apiCategory, mockData.categories, done);
  });

  it('logout', done => {
    shared.logout(request, done);
  });
});
