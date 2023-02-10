const shared = require('../helpers/shared');
const supertest = require('supertest');
const mockData = require('../mockData');
const request = supertest.agent(shared.exploreTestURL);
const path = require('path');

const loginURL = '/rest/v2/pages/';
const apiCategory = '/rest/v2/plugin/';
const adminLogin = shared.tenant.email;
const adminPasswd = shared.tenant.password;

describe('Plugins crud operations', () => {
  it('Login admin', done => {
    shared.login(request, loginURL, adminLogin, adminPasswd, done);
  });

  it('Create a plugin', done => {
    request
      .post(apiCategory)
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .field('id', mockData.plugin.id)
      .field('type', mockData.plugin.type)
      .attach('pluginZipFile', path.join(__dirname, '/plugin.zip'))
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.status).to.equal(200);

        request
          .get(`${apiCategory}${mockData.plugin.id}`)
          .end((err, res1) => {
            if (err) {
              return done(err);
            }
            expect(res1.status).to.equal(200);
            expect(res1.body.data.id).to.equal(mockData.plugin.id);
            expect(res1.body.id).to.equal(undefined);
            done();
          });
      });
  });

  it('Get all plugins', done => {
    request
      .get(`${apiCategory}`)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.status).to.equal(200);
        expect(res.body.data.length).to.be.equal(1);
        expect(res.body.id).to.equal(undefined);
      });
    done();
  });

  it('Get plugin by id', done => {
    request
      .get(`${apiCategory}${mockData.plugin.id}`)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.status).to.equal(200);
        expect(res.body.data.id).to.be.equal(mockData.plugin.id);
        expect(res.body.id).to.equal(undefined);
        done();
      });
  });

  it('Get plugin by id should fail for non existing pluginid', done => {
    request
      .get(`${apiCategory}nonexisting`)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.status).to.equal(404);
        done();
      });
  });

  it('Update a plugin by id', done => {
    request
      .put(`${apiCategory}${mockData.plugin.id}`)
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .field('id', mockData.plugin.id)
      .attach('pluginZipFile', path.join(__dirname, '/plugin.zip'))
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.status).to.equal(200);

        request
          .get(`${apiCategory}${mockData.plugin.id}`)
          .end((err, res1) => {
            if (err) {
              return done(err);
            }
            expect(res1.status).to.equal(200);
            expect(res1.body.data.id).to.equal(mockData.plugin.id);
            expect(res1.body.id).to.equal(undefined);
            done();
          });
      });
  });

  it('Update a plugin by id which is not existing in the DB', done => {
    request
      .put(`${apiCategory}testnew`)
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .field('type', mockData.plugin.type)
      .attach('pluginZipFile', path.join(__dirname, '/plugin.zip'))
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.status).to.equal(200);
        expect(res.body.error).to.be.equal(false);

        // delete the plugin once creation is successful
        request
          .delete(`${apiCategory}testnew`)
          .set('X-Secure-Modify-Token', shared.secureModifyToken())
          .end((err1, res1) => {
            if (err1) {
              return done(err1);
            }
            expect(res1.status).to.equal(200);
            expect(res1.body.data.result).to.be.equal('Plugin deleted');
            expect(res1.body.id).to.equal(undefined);
            done();
          });
      });
  });

  it('Update a plugin by id which is not existing in the DB should fail for no type parameter', done => {
    request
      .put(`${apiCategory}testnew`)
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .attach('pluginZipFile', path.join(__dirname, '/plugin.zip'))
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.status).to.equal(400);
        expect(res.body.error).to.be.equal(true);
        expect(res.body.additionalInfo[0]).to.include(`Request does not contain the plugin type.`);
        done();
      });
  });

  it('Delete a plugin by id', done => {
    request
      .delete(`${apiCategory}${mockData.plugin.id}`)
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.status).to.equal(200);
        expect(res.body.data.result).to.be.equal('Plugin deleted');
        expect(res.body.id).to.equal(undefined);
        done();
      });
  });

  it('Delete should fail for a non-existing plugin id', done => {
    request
      .delete(`${apiCategory}dummy`)
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.status).to.equal(404);
        expect(res.body.error).to.be.equal(true);
        expect(res.body.additionalInfo[0]).to.include(`Plugin with the id dummy does not exists.`);
        done();
      });
  });

  it('logout', done => {
    shared.logout(request, done);
  });
});
