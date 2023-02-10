'use strict';
/* this test is always executed last and makes sure that the test tenant is deleted again */

const supertest = require('supertest');
const shared = require('./helpers/shared');
const request = supertest.agent(shared.exploreRootUrl);

describe('Tear down Explore API Tests', () => {
  it('deleteTenant', done => {
    request
      .delete(`/rest/v2/tnnt/${encodeURIComponent(shared.tenant.name)}`)
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .expect(200, done);
  });
});
