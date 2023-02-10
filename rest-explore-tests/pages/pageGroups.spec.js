const shared = require('../helpers/shared');
const supertest = require('supertest');
const testData = require('../mockData');
const mockData = JSON.parse(JSON.stringify(testData));
const request = supertest.agent(shared.exploreTestURL);

const loginURL = '/rest/v2/pageGroups';
const apiPageGroup = '/rest/v2/pageGroups/';
const adminLogin = shared.tenant.email;
const adminPasswd = shared.tenant.password;

describe('PageGroup CRUD operation', () => {
  it('Login admin', done => {
    shared.login(request, loginURL, adminLogin, adminPasswd, done);
  });

  it('Create PageGroups', done => {
    shared.createItems(request, apiPageGroup, mockData.pageGroups, done);
  });

  it('Create duplicate PageGroup', done => {
    request
      .post(apiPageGroup)
      .send(mockData.pageGroups[0])
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .end((err, res) => {
        if (err) {
          return err;
        }
        expect(res.status).to.equal(500);
        expect(res.body.defaultText).to.include(`The server reported the following error: Page group ${mockData.pageGroups[0].name} already exists.`);
        return done();
      });
  });

  it('Create a single Page group and delete it', done => {
    request
      .post(apiPageGroup)
      .send(mockData.pageGroup)
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.status).to.equal(200); // Successfull creation of page group
        expect(res.body.data[0].name).to.eql(mockData.pageGroup.name);

        request
          .get(apiPageGroup.concat(mockData.pageGroup.name))
          .end((err, responsePageGroup1) => {
            if (err) {
              return done(err);
            }
            expect(responsePageGroup1.status).to.equal(200); // when fetching a page group that exist
            expect(responsePageGroup1.body.data.name).to.eql(mockData.pageGroup.name);

            request
              .delete(apiPageGroup.concat(mockData.pageGroup.name))
              .set('X-Secure-Modify-Token', shared.secureModifyToken())
              .end((err, responsePageGroup2) => {
                if (err) {
                  return done(err);
                }
                expect(responsePageGroup2.status).to.equal(200); // when deleting a page group that exist
                expect(responsePageGroup2.body.data.result).equal('Page group deleted');

                request
                  .get(apiPageGroup.concat(mockData.pageGroup.name))
                  .end((err, responsePageGroup3) => {
                    if (err) {
                      return done(err);
                    }
                    expect(responsePageGroup3.status).to.equal(404); // when fetching a page group that doesn't exist

                    request
                      .delete(apiPageGroup.concat(mockData.pageGroup.name))
                      .set('X-Secure-Modify-Token', shared.secureModifyToken())
                      .end((err, responsePageGroup4) => {
                        if (err) {
                          return done(err);
                        }
                        expect(responsePageGroup4.status).to.equal(404); // when deleting a page group that doesn't exist
                        expect(responsePageGroup4.body.error).equal(true);
                        expect(responsePageGroup4.body.additionalInfo[0]).equal('Page group not found');
                        done();
                      });
                  });
              });
          });
      });
  });

  it('Get all Page Groups', done => {
    request
      .get(apiPageGroup)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.status).to.equal(200);
        expect(res.body.data.length).to.equal(2);
        done();
      });
  });

  it('Get page group by name', done => {
    request
      .get(apiPageGroup.concat(mockData.pageGroups[0].name))
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.status).to.equal(200);
        expect(res.body.data.name).to.eql(mockData.pageGroups[0].name);
        done();
      });
  });

  it('Get page groups by page name which don\'t exist ', done => {
    request
      .get(apiPageGroup.concat('dev'))
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.status).to.equal(404);
        done();
      });
  });

  it('Update page group', done => {
    const updatePageGroup = mockData.pageGroups[0];
    updatePageGroup.description = 'test change indescription';
    request
      .put(apiPageGroup.concat(updatePageGroup.name))
      .send(updatePageGroup)
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.status).to.equal(200);

        request
          .get(apiPageGroup.concat(updatePageGroup.name))
          .end((err, responsePageGroup1) => {
            if (err) {
              return done(err);
            }
            expect(responsePageGroup1.status).to.equal(200);
            expect(responsePageGroup1.body.data.description).to.eql('test change indescription');
            done();
          });
      });
  });

  it('Delete page groups', done => {
    shared.deleteItems(request, apiPageGroup, mockData.pageGroups, done);
  });

  it('logout', done => {
    shared.logout(request, done);
  });
});
