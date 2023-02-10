'use strict';

/* eslint-disable no-unused-expressions */

const supertest = require('supertest');
const shared = require('./../helpers/shared');

const request = supertest.agent(shared.testURL);

describe('Tenant API Test - V1', () => {
  const apiBase = '/rest/v2/tenant/',
    CSS = 'body {color: red;}';
  let cssBackup,
    newApiKey,
    oldApiKey;
  const adminLogin = shared.tenant.email,
    adminPasswd = shared.tenant.password,
    bvdAdmin = 'bvdAdmin';

  it('Unauthenticated access', done => {
    request
      .get(`${shared.rootContext}${apiBase}systemsettings`)
      .expect(401, done);
  });

  it('Login Admin', done => {
    shared.login(request, `${shared.rootContext}${apiBase}systemsettings`, adminLogin, adminPasswd, done);
  });

  it('Backup existing CSS', done => {
    request
      .get(`${shared.rootContext}${apiBase}systemsettings`)
      .expect(200)
      .expect('Content-Type', 'application/json; charset=utf-8')
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res.body.error).to.be.false;
        cssBackup = res.body.data.css;
        done();
      });
  });

  it('Perform write css with invalid csrf token', done => {
    request
      .post(`${shared.rootContext}${apiBase}systemsettings`)
      .send({
        css: CSS
      })
      .set('X-Secure-Modify-Token', 'm6WBppef-xdWYLmZmOAtxDECtv62gaRaxNi')
      .expect(403)
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res.body.message).to.equal('Forbidden');
        done();
      });
  });

  it('Write CSS', done => {
    request
      .post(`${shared.rootContext}${apiBase}systemsettings`)
      .send({
        css: CSS
      })
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .expect(200)
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res.body.error).to.be.false;
        done();
      });
  });

  it('Check CSS', done => {
    request
      .get(`${shared.rootContext}${apiBase}systemsettings`)
      .expect(200)
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res.body.error).to.be.false;
        expect(res.body.data.css).equal(CSS);
        done();
      });
  });

  it('Restore existing CSS', done => {
    request
      .post(`${shared.rootContext}${apiBase}systemsettings`)
      .send({
        css: cssBackup
      })
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .expect(200)
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res.body.error).to.be.false;
        done();
      });
  });

  it('Get user details', done => {
    request
      .get(`${shared.rootContext}/rest/v2/session/user`)
      .expect(200)
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res.body.error).to.be.false;
        expect(res.body.data.userDetails.apiKey).not.equal(undefined);
        oldApiKey = res.body.data.userDetails.apiKey;
        done();
      });
  });

  it('Request new API Key', done => {
    request
      .post(`${shared.rootContext}${apiBase}apikey`)
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .expect(200)
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res.body.error).to.be.false;
        expect(res.body.additionalInfo).to.be.not.empty;
        expect(res.body.additionalInfo[0]).not.equal(oldApiKey);
        expect(res.body.additionalInfo.length).equal(1);
        newApiKey = res.body.additionalInfo[0];
        done();
      });
  });

  it('Get user details again', done => {
    request
      .get(`${shared.rootContext}/rest/v2/session/user`)
      .expect(200)
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res.body.error).to.be.false;
        expect(res.body.data.userDetails.apiKey).equal(newApiKey);
        done();
      });
  });

  it('createTenant test', done => {
    const body = {
      name: 'NOM',
      description: 'NOM Organization'
    };

    request
      .post('/rest/v2/tnnt')
      .send(body)
      .expect(200)
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res.text).equal('NOM');
        done();
      });
  });

  it('createTenant duplicate', done => {
    const body = {
      name: 'NOM',
      description: 'NOM Organization'
    };

    request
      .post('/rest/v2/tnnt')
      .send(body)
      .expect(400)
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res.text).equal('Tenant NOM already exists.');
        done();
      });
  });

  it('Populate Tenant test', done => {
    const body = {
      srcTenant: 'Provider',
      destTenant: 'NOM'
    };

    request
      .post('/rest/v2/tnnt/populate')
      .send(body)
      .expect(200)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.body.name).equal('NOM');
        const destTenantName = res.body.name;
        // check list of dashboards in destination tenant
        shared.logout(request, err => {
          if (err) {
            return done(err);
          }
          // Login in here as bvdAdmin with destination tenant
          shared.login(request, `${shared.rootContext}/rest/v2/tenant/systemsettings`, bvdAdmin, adminPasswd, err => {
            if (err) {
              return done(err);
            }
            request
              .get(`${shared.rootContext}/rest/v2/dashboard`)
              .expect(200)
              .end((err, response) => {
                if (err) {
                  return done(err);
                }
                expect(response.body.data).to.not.equal(undefined);
                expect(response.body.data).to.not.equal(null);
                expect(JSON.stringify(response.body.data)).includes('documentation1');
                shared.logout(request, done, `${shared.rootContext}/logout`);
              });
          }, destTenantName);
        }, `${shared.rootContext}/logout`);
      });
  });

  it('Delete Tenant test', done => {
    shared.login(request, `${shared.rootContext}/rest/v2/tenant/systemsettings`, adminLogin, adminPasswd, err => {
      if (err) {
        return done(err);
      }
      request
        .delete('/rest/v2/tnnt/NOM')
        .expect(200)
        .end((err, res) => {
          expect(err).to.be.null;
          expect(res.text).equal('OK');
          shared.logout(request, done, `${shared.rootContext}/logout`);
        });
    });
  });
});
