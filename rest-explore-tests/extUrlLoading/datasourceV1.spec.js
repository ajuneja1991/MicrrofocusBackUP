const shared = require('../helpers/shared');
const appConfigTestData = require('./appConfig.test.data.json');
const supertest = require('supertest');
const request = supertest.agent(shared.exploreTestURL);

describe('Datasource rest service test - V1', () => {
  const adminLogin = shared.tenant.email;
  const adminPasswd = shared.tenant.password;
  const promUrl = '/rest/v1/datasource/prometheus/data';
  const wsDataUrl = '/rest/v1/datasource/ws/data';
  const loginURL = '/rest/v2/pages';

  it('Login admin', done => {
    shared.login(request, loginURL, adminLogin, adminPasswd, done);
  });

  it('Prometheus API test', done => {
    const body = {
      url: 'rate(bvd_receiver_bytes_read_sum[30s])',
      params: {
        // eslint-disable-next-line camelcase
        start_time: '2019-12-13T08:26:48.841Z',
        // eslint-disable-next-line camelcase
        end_time: '2019-12-13T10:26:48.841Z',
        step: '15s',
        // eslint-disable-next-line camelcase
        metric_name: 'bvd_receiver_bytes_read_sum'
      }
    };
    request
      .post(`${promUrl}`)
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .send(body)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        const returnStatus = 503;
        expect(res.statusCode).to.equal(returnStatus);
        done();
      });
  });

  it('ws/data API invalid content type test', done => {
    const body = {
      url: 'rate(bvd_receiver_bytes_read_sum[30s])',
      params: {
        // eslint-disable-next-line camelcase
        start_time: '2019-12-13T08:26:48.841Z',
        // eslint-disable-next-line camelcase
        end_time: '2019-12-13T10:26:48.841Z',
        step: '15s',
        // eslint-disable-next-line camelcase
        metric_name: 'bvd_receiver_bytes_read_sum'
      }
    };

    request
      .post(`${wsDataUrl}`)
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .set('content-type', 'Application/json')
      .send(body)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        const returnStatus = 415;
        expect(res.statusCode).to.equal(returnStatus);
        expect(res.body.error.message).to.equal('Unsupported Media Type');
        done();
      });
  });

  it('logout', done => {
    shared.logout(request, done);
  });
});

describe('Datasource remote access test - V1', () => {
  // A duplicate of the describe for v0 is not required because the data source has no changes to the response.
  // The other endpoints have already been tested in other tests.
  const appConfigUrl = '/rest/v1/appConfig';
  const apiSystem = '/rest/v1/system';
  const adminLogin = shared.tenant.email;
  const adminPassword = shared.tenant.password;
  const wsDataUrl = '/rest/v1/datasource/ws/data';
  const loginURL = '/rest/v1/pages';

  it('Accept loading datasource from same server by default (without specifying the acceptedPatterns/remoteAccessPatterns)', done => {
    shared.login(request, loginURL, adminLogin, adminPassword, () => {
      request
        .put(appConfigUrl)
        .set('X-Secure-Modify-Token', shared.secureModifyToken())
        .send(appConfigTestData.appConfigWithoutRemoteAccessPatterns)
        .end((err, resultPutAppConfig) => {
          if (err) {
            return done(err);
          }
          expect(resultPutAppConfig.status).to.equal(200);
          request
            .get(apiSystem)
            .end((err, resGetAppConfig) => {
              if (err) {
                return done(err);
              }
              expect(resGetAppConfig.status).to.equal(200);

              request
                .post(wsDataUrl)
                .set('X-Secure-Modify-Token', shared.secureModifyToken())
                .send({
                  url: '{EXPLORE_CONTEXT_ROOT}/mock/data/ui_test_metric_cpu.json'
                })
                .end((err, res) => {
                  expect(err).to.be.null;
                  expect(res.statusCode).to.be.equal(200);
                  shared.updateCookie(res);
                  shared.logout(request, done);
                });
            });
        });
    });
  });

  it('Accept loading bundles from same server by default (remoteAccessPatterns is defined but empty)', done => {
    shared.login(request, loginURL, adminLogin, adminPassword, () => {
      request
        .put(appConfigUrl)
        .set('X-Secure-Modify-Token', shared.secureModifyToken())
        .send(appConfigTestData.appConfigWithEmptyRemoteAccessPatterns)
        .end((err, resultPutAppConfig) => {
          if (err) {
            return done(err);
          }
          expect(resultPutAppConfig.status).to.equal(200);
          request
            .get(apiSystem)
            .end((err, resGetAppConfig) => {
              if (err) {
                return done(err);
              }
              expect(resGetAppConfig.status).to.equal(200);

              request
                .post(wsDataUrl)
                .set('X-Secure-Modify-Token', shared.secureModifyToken())
                .send({
                  url: '{EXPLORE_CONTEXT_ROOT}/mock/data/ui_test_metric_cpu.json'
                })
                .end((err, res) => {
                  expect(err).to.be.null;
                  expect(res.statusCode).to.be.equal(200);
                  shared.updateCookie(res);
                  shared.logout(request, done);
                });
            });
        });
    });
  });

  it('Accept loading bundles with specifying the remoteAccessPatterns and passing', done => {
    shared.login(request, loginURL, adminLogin, adminPassword, () => {
      request
        .put(appConfigUrl)
        .set('X-Secure-Modify-Token', shared.secureModifyToken())
        .send(appConfigTestData.appConfigWithRemoteAccessPatterns)
        .end((err, resultPutAppConfig) => {
          if (err) {
            return done(err);
          }
          expect(resultPutAppConfig.status).to.equal(200);
          request
            .get(apiSystem)
            .end((err, resGetAppConfig) => {
              if (err) {
                return done(err);
              }
              expect(resGetAppConfig.status).to.equal(200);

              request
                .post(wsDataUrl)
                .set('X-Secure-Modify-Token', shared.secureModifyToken())
                .send({
                  url: '{EXPLORE_CONTEXT_ROOT}/mock/data/ui_test_metric_cpu.json'
                })
                .end((err, res) => {
                  expect(err).to.be.null;
                  expect(res.statusCode).to.be.equal(200);
                  shared.updateCookie(res);
                  shared.logout(request, done);
                });
            });
        });
    });
  });

  it('Accept loading bundles with specifying the remoteAccessPatterns to avoid loading', done => {
    shared.login(request, loginURL, adminLogin, adminPassword, () => {
      request
        .put(appConfigUrl)
        .set('X-Secure-Modify-Token', shared.secureModifyToken())
        .send(appConfigTestData.appConfigWithRemoteAccessPatternsNotPassing)
        .end((err, resultPutAppConfig) => {
          if (err) {
            return done(err);
          }
          expect(resultPutAppConfig.status).to.equal(200);
          request
            .get(apiSystem)
            .end((err, resGetAppConfig) => {
              if (err) {
                return done(err);
              }
              expect(resGetAppConfig.status).to.equal(200);

              request
                .post(wsDataUrl)
                .set('X-Secure-Modify-Token', shared.secureModifyToken())
                .send({
                  url: '{EXPLORE_CONTEXT_ROOT}/mock/data/ui_test_metric_cpu.json'
                })
                .end((err, res) => {
                  expect(err).to.be.null;
                  expect(res.statusCode).to.be.equal(403);
                  shared.updateCookie(res);
                  shared.logout(request, done);
                });
            });
        });
    });
  });

  it('Accept loading bundles with specifying multiple remoteAccessPatterns', done => {
    shared.login(request, loginURL, adminLogin, adminPassword, () => {
      request
        .put(appConfigUrl)
        .set('X-Secure-Modify-Token', shared.secureModifyToken())
        .send(appConfigTestData.appConfigWithMultipleRemoteAccessPatterns)
        .end((err, resultPutAppConfig) => {
          if (err) {
            return done(err);
          }
          expect(resultPutAppConfig.status).to.equal(200);
          request
            .get(apiSystem)
            .end((err, resGetAppConfig) => {
              if (err) {
                return done(err);
              }
              expect(resGetAppConfig.status).to.equal(200);

              request
                .post(wsDataUrl)
                .set('X-Secure-Modify-Token', shared.secureModifyToken())
                .send({
                  url: '{EXPLORE_CONTEXT_ROOT}/mock/data/ui_test_metric_cpu.json'
                })
                .end((err, res) => {
                  expect(err).to.be.null;
                  expect(res.statusCode).to.be.equal(200);
                  shared.updateCookie(res);
                  shared.logout(request, done);
                });
            });
        });
    });
  });
});
