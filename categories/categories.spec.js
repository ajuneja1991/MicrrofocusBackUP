const supertest = require('supertest');
const constants = require('../../../shared/constants'),
  shared = require('./../helpers/shared');

const request = supertest.agent(shared.testURL + shared.rootContext);

describe('Categories API Test', () => {
  const
    apiBase = '/rest/v2/categories',
    apiBaseMenuCategories = `/rest/v2/categories?scope=${constants.MENU_SCOPE}`,
    apiBaseCategories = `/rest/v2/categories?scope=${constants.PERMISSION_SCOPE}`,
    adminLogin = shared.tenant.email,
    adminPasswd = shared.tenant.password;

  it('Login Admin', done => {
    shared.login(request, apiBaseCategories, adminLogin, adminPasswd, done);
  });

  it('Create a permission category', done => {
    request
      .post(apiBase)
      .expect('Content-Type', 'application/json; charset=utf-8')
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .send({
        name: 'permission-category',
        scope: constants.PERMISSION_SCOPE
      })
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res.body.data).to.be.not.undefined;
        done();
      });
  });

  it('should fail to create a category/menu-category with invalid scope', done => {
    request
      .post(apiBase)
      .expect('Content-Type', 'application/json; charset=utf-8')
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .send({
        name: 'permission-category',
        scope: 'invalid-scope'
      })
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res.body.error).to.be.equal(true);
        expect(res.body.message).to.equal('Scope of category is invalid. Valid scopes are permission and menu');
        done();
      });
  });

  it('should fail to create a category/menu-category with empty scope', done => {
    request
      .post(apiBase)
      .expect('Content-Type', 'application/json; charset=utf-8')
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .send({
        name: 'permission-category',
        scope: ''
      })
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res.body.error).to.be.equal(true);
        expect(res.body.message).to.equal('Scope of dashboard category is empty.');
        done();
      });
  });

  it('Create a menu category', done => {
    request
      .post(apiBase)
      .expect('Content-Type', 'application/json; charset=utf-8')
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .send({
        name: 'menu-category',
        scope: constants.MENU_SCOPE
      })
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res.body.data).to.be.not.undefined;
        done();
      });
  });

  it('should fail to get categories/menu-categories with an empty scope', done => {
    request
      .get(`${apiBase}?scope=`)
      .expect('Content-Type', 'application/json; charset=utf-8')
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res.body.data).to.be.undefined;
        expect(res.body.message).to.be.equal('Scope of dashboard category is empty.');
        done();
      });
  });

  it('should fail to get categories/menu-categories with an invalid scope', done => {
    request
      .get(`${apiBase}?scope=invalid`)
      .expect('Content-Type', 'application/json; charset=utf-8')
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res.body.data).to.be.undefined;
        expect(res.body.message).to.be.equal('Scope of category is invalid. Valid scopes are permission and menu');
        done();
      });
  });

  it('Get all menu categories', done => {
    request
      .get(apiBaseMenuCategories)
      .expect('Content-Type', 'application/json; charset=utf-8')
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res.body.data).to.be.not.undefined;
        expect(res.body.data.length).to.be.equal(1);
        expect(res.body.data[0]).to.be.equal('menu-category');
        done();
      });
  });

  it('Get all permission based categories', done => {
    request
      .get(apiBaseCategories)
      .expect('Content-Type', 'application/json; charset=utf-8')
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res.body.data).to.be.not.undefined;
        expect(res.body.data.length).to.be.equal(1);
        expect(res.body.data[0]).to.be.equal('permission-category');
        done();
      });
  });

  it('should fail to delete an empty permission category', done => {
    request
      .delete(apiBase)
      .expect('Content-Type', 'application/json; charset=utf-8')
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .send({
        name: '',
        scope: constants.PERMISSION_SCOPE
      })
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res.body.message).to.be.equal('Can not delete a empty permission category.');
        done();
      });
  });

  it('delete permission based category', done => {
    request
      .delete(apiBase)
      .expect('Content-Type', 'application/json; charset=utf-8')
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .send({
        name: 'permission-category',
        scope: constants.PERMISSION_SCOPE
      })
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res.body.message).to.be.equal('OK');
        expect(res.body.data).to.be.equal(1);
        done();
      });
  });

  it('Perform deletion of menu category with invalid csrf token', done => {
    request
      .delete(apiBase)
      .expect('Content-Type', 'application/json; charset=utf-8')
      .set('X-Secure-Modify-Token', 'm6WBppef-xdWYLmZmOAtxDECtv62gaRaxNi')
      .send({
        name: 'menu-category',
        scope: constants.MENU_SCOPE
      })
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res.status).to.equal(403);
        expect(res.body.message).to.equal('Forbidden');

        return done();
      });
  });
  it('delete menu category', done => {
    request
      .delete(apiBase)
      .expect('Content-Type', 'application/json; charset=utf-8')
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .send({
        name: 'menu-category',
        scope: constants.MENU_SCOPE
      })
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res.body.message).to.be.equal('OK');
        expect(res.body.data).to.be.equal(1);
        done();
      });
  });

  it('Log out', done => {
    shared.logout(request, done);
  });
});
