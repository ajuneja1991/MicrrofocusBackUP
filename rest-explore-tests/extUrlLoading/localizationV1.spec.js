const shared = require('../helpers/shared');
const supertest = require('supertest');
const request = supertest.agent(shared.exploreTestURL);
const mockL10nEN = require('../../mockdata/assets/externalL10n_en.json');
const mockL10nDE = require('../../mockdata/assets/externalL10n_de.json');

describe('Localization Rest Service Test - V1', () => {
  // A duplicate of the describe for v0 is not required because the localization has no changes to the response.
  // The other endpoints have already been tested in other tests.
  const adminLogin = shared.tenant.email,
    adminPasswd = shared.tenant.password,
    localizationUrl = '/rest/v1/load/application/localization';

  it('Login admin', done => {
    shared.login(request, localizationUrl, adminLogin, adminPasswd, done);
  });

  it('Get localization data - for not existing language (returning default EN)', done => {
    const url = localizationUrl.concat('/noLanguage');
    request
      .get(url)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.status).to.equal(200);
        expect(res.body[0].body).to.deep.equal(mockL10nEN);
        done();
      });
  });

  it('Get localization data for English', done => {
    const url = localizationUrl.concat('/en');
    request
      .get(url)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.status).to.equal(200);
        expect(res.body[0].body).to.deep.equal(mockL10nEN);
        done();
      });
  });

  it('Get localization data for German', done => {
    const url = localizationUrl.concat('/de');
    request
      .get(url)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.status).to.equal(200);
        expect(res.body[0].body).to.deep.equal(mockL10nDE);
        done();
      });
  });

  it('logout', done => {
    shared.logout(request, done);
  });
});
