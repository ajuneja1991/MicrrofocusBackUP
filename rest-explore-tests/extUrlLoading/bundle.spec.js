const shared = require('../helpers/shared');
const supertest = require('supertest');
const request = supertest.agent(shared.exploreTestURL);
const appConfigTestData = require('./appConfig.test.data.json');

describe('Bundle Rest Service Test', () => {
  // A duplicate of the describe for v0 is not required because the bundle has no changes to the response.
  // The other endpoints have already been tested in other tests.
  const adminLogin = shared.tenant.email;
  const adminPassword = shared.tenant.password;
  const loginURL = '/rest/v2/pages';
  const bundleUrl = '/rest/v2/load/bundle';
  const appConfigUrl = '/rest/v2/appConfig';
  const apiSystem = '/rest/v2/system';

  it('Login admin', done => {
    shared.login(request, loginURL, adminLogin, adminPassword, done);
  });

  it('Call not existing url', done => {
    const notExistingBundleUrl = '{EXPLORE_CONTEXT_ROOT}/externalcomponents/external-components/bundles/notExistingBundle';
    const notExistingEncodedUrl = Buffer.from(notExistingBundleUrl).toString('base64');
    const bundleUrlToUse = `${bundleUrl}/${notExistingEncodedUrl}`;
    request
      .get(bundleUrlToUse)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.status).to.equal(404);
        done();
      });
  });

  it('Call with non encoded url', done => {
    const notEncodedBundleUrl = 'something.which.is.not.base64.encoded';
    const bundleUrlToUse = `${bundleUrl}/${notEncodedBundleUrl}`;
    request
      .get(bundleUrlToUse)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.status).to.equal(400);
        done();
      });
  });

  it('Accept loading bundles from same server by default (without specifying the acceptedPatterns/remoteAccessPatterns)', done => {
    request
      .put(`${appConfigUrl}/MyApp`)
      .send(appConfigTestData.appConfigWithoutRemoteAccessPatterns)
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
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

            const bundleToLoad = '{EXPLORE_CONTEXT_ROOT}/externalcomponents/external-components.umd.js';
            const bundleToLoadEncodedURL = Buffer.from(bundleToLoad).toString('base64');
            request
              .get(`${bundleUrl}/${bundleToLoadEncodedURL}`)
              .end((err, resultGetBundle) => {
                if (err) {
                  return done(err);
                }
                expect(resultGetBundle.status).to.equal(200);
                done();
              });
          });
      });
  });

  it('Deprecated - Accept loading bundles from same server by default (acceptedPatterns is defined but empty)', done => {
    request
      .put(`${appConfigUrl}/MyApp`)
      .send(appConfigTestData.appConfigWithEmptyAcceptedPattern)
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
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

            const bundleToLoad = '{EXPLORE_CONTEXT_ROOT}/externalcomponents/external-components.umd.js';
            const bundleToLoadEncodedURL = Buffer.from(bundleToLoad).toString('base64');
            request
              .get(`${bundleUrl}/${bundleToLoadEncodedURL}`)
              .end((err, resultGetBundle) => {
                if (err) {
                  return done(err);
                }
                expect(resultGetBundle.status).to.equal(200);
                done();
              });
          });
      });
  });

  it('Accept loading bundles from same server by default (remoteAccessPatterns is defined but empty)', done => {
    request
      .put(`${appConfigUrl}/MyApp`)
      .send(appConfigTestData.appConfigWithEmptyRemoteAccessPatterns)
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
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

            const bundleToLoad = '{EXPLORE_CONTEXT_ROOT}/externalcomponents/external-components.umd.js';
            const bundleToLoadEncodedURL = Buffer.from(bundleToLoad).toString('base64');
            request
              .get(`${bundleUrl}/${bundleToLoadEncodedURL}`)
              .end((err, resultGetBundle) => {
                if (err) {
                  return done(err);
                }
                expect(resultGetBundle.status).to.equal(200);
                done();
              });
          });
      });
  });

  it('Deprecated - Accept loading bundles with specifying the acceptedPatterns and passing', done => {
    request
      .put(`${appConfigUrl}/MyApp`)
      .send(appConfigTestData.appConfigWithAcceptedPattern)
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
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

            const bundleToLoad = '{EXPLORE_CONTEXT_ROOT}/externalcomponents/external-components.umd.js';
            const bundleToLoadEncodedURL = Buffer.from(bundleToLoad).toString('base64');
            request
              .get(`${bundleUrl}/${bundleToLoadEncodedURL}`)
              .end((err, resultGetBundle) => {
                if (err) {
                  return done(err);
                }
                expect(resultGetBundle.status).to.equal(200);
                done();
              });
          });
      });
  });

  it('Accept loading bundles with specifying the remoteAccessPatterns and passing', done => {
    request
      .put(`${appConfigUrl}/MyApp`)
      .send(appConfigTestData.appConfigWithAcceptedPattern)
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
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

            const bundleToLoad = '{EXPLORE_CONTEXT_ROOT}/externalcomponents/external-components.umd.js';
            const bundleToLoadEncodedURL = Buffer.from(bundleToLoad).toString('base64');
            request
              .get(`${bundleUrl}/${bundleToLoadEncodedURL}`)
              .end((err, resultGetBundle) => {
                if (err) {
                  return done(err);
                }
                expect(resultGetBundle.status).to.equal(200);
                done();
              });
          });
      });
  });

  it('Deprecated - Accept loading bundles with specifying the acceptedPatterns to avoid loading', done => {
    request
      .put(`${appConfigUrl}/MyApp`)
      .send(appConfigTestData.appConfigWithAcceptedPatternNotPassing)
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
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

            const bundleToLoad = '{EXPLORE_CONTEXT_ROOT}/externalcomponents/external-components.umd.js';
            const bundleToLoadEncodedURL = Buffer.from(bundleToLoad).toString('base64');
            request
              .get(`${bundleUrl}/${bundleToLoadEncodedURL}`)
              .end((err, resultGetBundle) => {
                if (err) {
                  return done(err);
                }
                expect(resultGetBundle.status).to.equal(403);
                done();
              });
          });
      });
  });

  it('Accept loading bundles with specifying the remoteAccessPatterns to avoid loading', done => {
    request
      .put(`${appConfigUrl}/MyApp`)
      .send(appConfigTestData.appConfigWithRemoteAccessPatternsNotPassing)
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
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

            const bundleToLoad = '{EXPLORE_CONTEXT_ROOT}/externalcomponents/external-components.umd.js';
            const bundleToLoadEncodedURL = Buffer.from(bundleToLoad).toString('base64');
            request
              .get(`${bundleUrl}/${bundleToLoadEncodedURL}`)
              .end((err, resultGetBundle) => {
                if (err) {
                  return done(err);
                }
                expect(resultGetBundle.status).to.equal(403);
                done();
              });
          });
      });
  });

  it('Deprecated - Accept loading bundles with specifying multiple acceptedPatterns', done => {
    request
      .put(`${appConfigUrl}/MyApp`)
      .send(appConfigTestData.appConfigWithMultipleAcceptedPatterns)
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
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

            const bundleToLoad = '{EXPLORE_CONTEXT_ROOT}/externalcomponents/external-components.umd.js';
            const bundleToLoadEncodedURL = Buffer.from(bundleToLoad).toString('base64');
            request
              .get(`${bundleUrl}/${bundleToLoadEncodedURL}`)
              .end((err, resultGetBundle) => {
                if (err) {
                  return done(err);
                }
                expect(resultGetBundle.status).to.equal(200);
                done();
              });
          });
      });
  });

  it('Accept loading bundles with specifying multiple remoteAccessPatterns', done => {
    request
      .put(`${appConfigUrl}/MyApp`)
      .send(appConfigTestData.appConfigWithMultipleRemoteAccessPatterns)
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
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

            const bundleToLoad = '{EXPLORE_CONTEXT_ROOT}/externalcomponents/external-components.umd.js';
            const bundleToLoadEncodedURL = Buffer.from(bundleToLoad).toString('base64');
            request
              .get(`${bundleUrl}/${bundleToLoadEncodedURL}`)
              .end((err, resultGetBundle) => {
                if (err) {
                  return done(err);
                }
                expect(resultGetBundle.status).to.equal(200);
                done();
              });
          });
      });
  });

  it('logout', done => {
    shared.logout(request, done);
  });
});
