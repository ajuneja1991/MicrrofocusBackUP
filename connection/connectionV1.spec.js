/* eslint-disable node/no-sync, node/no-process-env, node/global-require, no-unused-expressions */

const { randomUUID } = require('crypto');
const supertest = require('supertest');
const shared = require('./../helpers/shared');
const fs = require('fs'),
  path = require('path');

const request = supertest.agent(shared.testURL + shared.rootContext);

describe('Connection API Test - V1', () => {
  const nonAdminUser = {
    login: `${randomUUID()}@example.com`,
    passwd: 'Abc1234$'
  };

  const apiBase = '/rest/v1/connection';
  const adminLogin = shared.tenant.email;
  const adminPasswd = shared.tenant.password;

  it('Login non admin user', done => {
    shared.login(request, '/rest/v1/tenant/systemsettings', nonAdminUser.login, nonAdminUser.passwd, done);
  });

  it('access not authorized', done => {
    request
      .post(apiBase)
      .expect(403)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.text).not.equal(undefined);
        expect(res.text).not.equal(null);

        const result = JSON.parse(res.text);

        expect(result.error).equal(true);
        expect(result.message).equal('Forbidden');

        return done();
      });
  });

  it('Log out', done => {
    shared.logout(request, done);
  });

  it('access not authenticated', done => {
    request
      .post(apiBase)
      .expect(401)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.text).not.equal(undefined);
        expect(res.text).not.equal(null);

        const result = JSON.parse(res.text);

        expect(result.message).equal('Unauthorized');

        return done();
      });
  });

  it('Login Admin', done => {
    shared.login(request, apiBase, adminLogin, adminPasswd, done);
  });

  it('should return with an validation issue', done => {
    request
      .put(apiBase)
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .set('Content-Type', 'multipart/form-data')
      .field('connection', 'abc')
      .expect(400)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.body.message).to.be.equal('dataCollector.error.connection.missingParameters');
        done();
      });
  });

  it('should return with an validation issue when wrong host specified', done => {
    request
      .put(apiBase)
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .set('Content-Type', 'multipart/form-data')
      .field('connection', JSON.stringify({
        host: 'localhost'
      }))
      .expect(400)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.body.message).to.be.equal('dataCollector.error.connection.missingParameters');
        done();
      });
  });

  it('should create a connection with TLS enabled', done => {
    request
      .put(apiBase)
      .set('Content-Type', 'multipart/form-data')
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .field('connection', JSON.stringify({
        host: 'localhost',
        port: 123,
        username: 'test',
        password: 'test',
        database: 'test',
        forceTLS: true
      }))
      .attach('certificatePath', './test/lwr.crt')
      .expect(200)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.body.message).to.be.equal('OK');
        done();
      });
  });

  it('should return with a file too big message', done => {
    const buffer = Buffer.alloc((3 * 1024 * 1024) + 1);

    fs.writeFileSync(path.resolve(__dirname, 'test.file'), buffer);

    request
      .put(apiBase)
      .set('Content-Type', 'multipart/form-data')
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .field('connection', JSON.stringify({
        host: 'localhost',
        port: 123,
        username: 'test',
        password: 'test',
        database: 'test',
        forceTLS: true
      }))
      .attach('certificatePath', path.resolve(__dirname, 'test.file'))
      .expect(500)
      .end(err => {
        if (err) {
          return done(err);
        }
        done();
      });
  });

  it('should read a connection', done => {
    request
      .get(apiBase)
      .send()
      .expect(200)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.body.error).to.be.false;
        const responseData = res.body.data;

        delete responseData._id;
        expect(res.body.data).to.deep.equal({
          configuredFromHelm: true,
          name: 'default',
          type: 'vertica',
          data: {
            database: 'test',
            host: 'localhost',
            port: 123,
            username: 'test',
            forceTLS: true,
            certName: 'lwr.crt'
          },
          secret: {
            certificate: '**dummySecretValue**1234**',
            password: '**dummySecretValue**1234**'
          }
        });
        done();
      });
  });

  it('should update a connection with dummy certificate', done => {
    request
      .put(apiBase)
      .set('Content-Type', 'multipart/form-data')
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .field('connection', JSON.stringify({
        host: 'localhost',
        port: 123,
        username: 'test',
        password: 'test',
        database: 'test',
        forceTLS: true,
        certificate: '**dummySecretValue**1234**'
      }))
      .expect(200)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.body.message).to.be.equal('OK');
        done();
      });
  });

  it('should create a connection without tls', done => {
    request
      .put(apiBase)
      .set('Content-Type', 'multipart/form-data')
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .field('connection', JSON.stringify({
        host: '10.168.179.57',
        port: 5433,
        username: 'dbadmin',
        password: 'installed',
        database: 'opsadb'
      }))
      .expect(200)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.body.message).to.be.equal('OK');
        done();
      });
  });

  it('should return an validation issue when creating a connection with TLS but without a certificate', done => {
    request
      .put(apiBase)
      .set('Content-Type', 'multipart/form-data')
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .field('connection', JSON.stringify({
        host: 'localhost',
        port: 123,
        username: 'test',
        password: 'test',
        database: 'test',
        forceTLS: true
      }))
      .expect(400)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.body.message).to.be.equal('dataCollector.error.connection.missingCertificate');
        done();
      });
  });

  it('should test a connection', done => {
    request
      .post(`${apiBase}/test`)
      .set('Content-Type', 'multipart/form-data')
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .field('connection', JSON.stringify({
        host: '10.168.179.57',
        port: 5433,
        username: 'dbadmin',
        password: 'installed',
        database: 'opsadb'
      }))
      .expect(200)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.body.message).to.be.equal('success');
        done();
      });
  });

  it('Perform test connection with invalid csrf token', done => {
    request
      .post(`${apiBase}/test`)
      .set('Content-Type', 'multipart/form-data')
      .set('X-Secure-Modify-Token', 'm6WBppef-xdWYLmZmOAtxDECtv62gaRaxNi')
      .field('connection', JSON.stringify({
        host: '10.168.179.57',
        port: 5433,
        username: 'dbadmin',
        password: 'installed',
        database: 'opsadb'
      }))
      .expect(403)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.body.message).to.equal('Forbidden');
        return done();
      });
  });

  it('should test a connection with dummy secret as password', done => {
    request
      .post(`${apiBase}/test`)
      .set('Content-Type', 'multipart/form-data')
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .field('connection', JSON.stringify({
        host: '10.168.179.57',
        port: 5433,
        username: 'dbadmin',
        password: '**dummySecretValue**1234**',
        database: 'opsadb'
      }))
      .expect(200)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.body.message).to.be.equal('success');
        done();
      });
  });

  it('should get auth issue when testing a connection', done => {
    request
      .post(`${apiBase}/test`)
      .set('Content-Type', 'multipart/form-data')
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .field('connection', JSON.stringify({
        host: '10.168.179.57',
        port: 5433,
        username: 'dbadmin',
        password: 'wrong',
        database: 'opsadb'
      }))
      .expect(400)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.body.message).to.be.equal('quexserv.error.auth');
        done();
      });
  });

  it('Log out after checking auth issue', done => {
    shared.logout(request, done);
  });
});
