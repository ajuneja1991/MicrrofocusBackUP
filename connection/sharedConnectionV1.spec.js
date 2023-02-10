/* eslint-disable node/no-sync, node/no-process-env, node/global-require, no-unused-expressions */

const supertest = require('supertest');
const { randomUUID } = require('crypto');
const shared = require('./../helpers/shared');
const request = supertest.agent(shared.testURL);

const tenant = {
  name: randomUUID(),
  email: `${randomUUID()}@example.com`,
  password: 'aA!12345'
};

describe('Shared Connection API Test - V1', () => {
  const apiBase = '/rest/v2/connection';
  const bvdAdmin = 'bvdAdmin';
  const adminPassword = 'Da$hb0ard!';
  const adminLogin = shared.tenant.email;
  const adminPasswd = shared.tenant.password;
  const mockConnection = {
    tenant: 'tenant1',
    database: 'test',
    host: 'localhost',
    port: 123,
    username: 'test',
    password: 'test'
  };

  it('Login admin user', done => {
    shared.login(request, `${shared.rootContext}/rest/v2/tenant/systemsettings`, adminLogin, adminPassword, done);
  });

  it('should fail while creating a connection for tenant that don\'t exist', done => {
    request
      .put(apiBase)
      .set('Content-Type', 'multipart/form-data')
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .field('connection', JSON.stringify(mockConnection))
      .expect(400)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.body.message).not.to.be.equal('OK');
        done();
      });
  });

  it('should create a new connection if don\'t exist for new tenant', done => {
    mockConnection.tenant = tenant.name;
    request
      .post('/rest/v2/tnnt')
      .send(tenant)
      .expect(200, err => {
        if (err) {
          return done(err);
        }
        request
          .put(apiBase)
          .set('Content-Type', 'multipart/form-data')
          .set('X-Secure-Modify-Token', shared.secureModifyToken())
          .field('connection', JSON.stringify(mockConnection))
          .expect(200)
          .end((err, res) => {
            if (err) {
              return done(err);
            }
            expect(res.body.message).to.be.equal('OK');
            shared.logout(request, err => {
              if (err) {
                return done(err);
              }
              // Login in here as bvdAdmin with new tenant as tenant user don't have permission
              shared.login(request, `${shared.rootContext}/rest/v2/tenant/systemsettings`, bvdAdmin, adminPasswd, err => {
                if (err) {
                  return done(err);
                }
                request
                  .get(`${shared.rootContext}${apiBase}`)
                  .expect(200)
                  .end((err, resp) => {
                    if (err) {
                      return done(err);
                    }
                    expect(res.body.error).to.be.false;
                    const responseData = resp.body.data;

                    delete responseData._id;
                    expect(resp.body.data).to.deep.equal({
                      configuredFromHelm: true,
                      name: 'default',
                      type: 'vertica',
                      data: {
                        database: 'test',
                        host: 'localhost',
                        port: 123,
                        username: 'test'
                      },
                      secret: {
                        password: '**dummySecretValue**1234**'
                      }
                    });
                    shared.logout(request, done, `${shared.rootContext}/logout`);
                  });
              }, tenant.name);
            }, `${shared.rootContext}/logout`);
          });
      });
  });

  it('delete newly created tenant', done => {
    shared.login(request, `${shared.rootContext}/rest/v2/tenant/systemsettings`, adminLogin, adminPasswd, err => {
      if (err) {
        return done(err);
      }
      request
        .delete(`/rest/v2/tnnt/${encodeURIComponent(tenant.name)}`)
        .expect(200, err => {
          if (err) {
            return done(err);
          }
          shared.logout(request, done, `${shared.rootContext}/logout`);
        });
    });
  });
});
