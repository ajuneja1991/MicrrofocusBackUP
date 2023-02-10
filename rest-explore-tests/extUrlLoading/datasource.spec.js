const shared = require('../helpers/shared');
const appConfigTestData = require('./appConfig.test.data.json');
const supertest = require('supertest');
const request = supertest.agent(shared.exploreTestURL);

describe('Datasource rest service test', () => {
  const adminLogin = shared.tenant.email;
  const adminPasswd = shared.tenant.password;
  const promUrl = '/rest/v2/datasource/prometheus/data';
  const wsDataUrl = '/rest/v2/datasource/ws/data';
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

describe('Datasource remote access test', () => {
  // A duplicate of the describe for v0 is not required because the data source has no changes to the response.
  // The other endpoints have already been tested in other tests.
  const appConfigUrl = '/rest/v2/appConfig';
  const apiSystem = '/rest/v2/system';
  const adminLogin = shared.tenant.email;
  const adminPassword = shared.tenant.password;
  const wsDataUrl = '/rest/v2/datasource/ws/data';
  const loginURL = '/rest/v2/pages';

  it('Accept loading datasource from same server by default (without specifying the acceptedPatterns/remoteAccessPatterns)', done => {
    shared.login(request, loginURL, adminLogin, adminPassword, () => {
      request
        .put(`${appConfigUrl}/MyApp`)
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
        .put(`${appConfigUrl}/MyApp`)
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
        .put(`${appConfigUrl}/MyApp`)
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
        .put(`${appConfigUrl}/MyApp`)
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
        .put(`${appConfigUrl}/MyApp`)
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

describe('Infinite scrolling test', () => {
  const adminLogin = shared.tenant.email;
  const adminPassword = shared.tenant.password;
  const apiSystem = '/rest/v2/system';
  const wsDataUrl = '/rest/v2/datasource/ws/data';
  const loginURL = '/rest/v2/pages';
  const appConfigUrl = '/rest/v2/appConfig';

  it('pagination test', done => {
    const body = {
      url: 'http://localhost:4010/mock/infiniteScrolling?start=:start_pos&end=:end_pos&column=:sort_column&order=:sort_order&search_id=:search_field&search_str=:search_string',
      params: {
        // eslint-disable-next-line camelcase
        end_pos: '20',
        // eslint-disable-next-line camelcase
        start_pos: '10'
      },
      operation: 'read'
    };

    shared.login(request, loginURL, adminLogin, adminPassword, () => {
      request
        .put(`${appConfigUrl}/MyApp`)
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
                .send(body)
                .end((err, res) => {
                  expect(err).to.be.null;
                  expect(res.statusCode).to.be.equal(200);
                  expect(res.body.data.length).to.be.equal(10);
                  expect(res.body.total).to.be.equal(99999);
                  shared.updateCookie(res);
                  shared.logout(request, done);
                });
            });
        });
    });
  });

  it('search test', done => {
    const body = {
      url: 'http://localhost:4010/mock/infiniteScrolling?start=:start_pos&end=:end_pos&column=:sort_column&order=:sort_order&search_id=:search_field&search_str=:search_string',
      params: {
        // eslint-disable-next-line camelcase
        search_field: '*',
        // eslint-disable-next-line camelcase
        search_string: 'xyz',
        // eslint-disable-next-line camelcase
        end_pos: '20',
        // eslint-disable-next-line camelcase
        start_pos: '10'
      },
      operation: 'read'
    };

    shared.login(request, loginURL, adminLogin, adminPassword, () => {
      request
        .put(`${appConfigUrl}/MyApp`)
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
                .send(body)
                .end((err, res) => {
                  expect(err).to.be.null;
                  expect(res.statusCode).to.be.equal(200);
                  expect(res.body.length).to.be.equal(0);
                  shared.updateCookie(res);
                  shared.logout(request, done);
                });
            });
        });
    });
  });

  it('search and desc test', done => {
    const body = {
      url: 'http://localhost:4010/mock/infiniteScrolling?start=:start_pos&end=:end_pos&column=:sort_column&order=:sort_order&search_id=:search_field&search_str=:search_string',
      params: {
        // eslint-disable-next-line camelcase
        search_field: 'name',
        // eslint-disable-next-line camelcase
        search_string: 'Miles',
        // eslint-disable-next-line camelcase
        end_pos: '20',
        // eslint-disable-next-line camelcase
        start_pos: '10',
        column: 'age',
        order: 'desc'

      },
      operation: 'read'
    };

    shared.login(request, loginURL, adminLogin, adminPassword, () => {
      request
        .put(`${appConfigUrl}/MyApp`)
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
                .send(body)
                .end((err, res) => {
                  expect(err).to.be.null;
                  expect(res.statusCode).to.be.equal(200);
                  expect(res.body.data.length).to.be.equal(10);
                  expect(res.body.data[0]?.age).to.be.equal(56);
                  expect(res.body.total).to.be.equal(188); // 188 records matched the search criteria
                  shared.updateCookie(res);
                  shared.logout(request, done);
                });
            });
        });
    });
  });

  it('without pagination test', done => {
    const body = {
      url: 'http://localhost:4010/mock/infiniteScrolling?start=:start_pos&end=:end_pos&column=:sort_column&order=:sort_order&search_id=:search_field&search_str=:search_string',
      params: {
      },
      operation: 'read'
    };

    shared.login(request, loginURL, adminLogin, adminPassword, () => {
      request
        .put(`${appConfigUrl}/MyApp`)
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
                .send(body)
                .end((err, res) => {
                  expect(err).to.be.null;
                  expect(res.statusCode).to.be.equal(200);
                  expect(res.body.length).to.be.equal(99999);
                  expect(res.body.last).to.equal(undefined);
                  shared.updateCookie(res);
                  shared.logout(request, done);
                });
            });
        });
    });
  });
});
