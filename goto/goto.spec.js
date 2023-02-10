'use strict';

const supertest = require('supertest');
const shared = require('./../helpers/shared');

const request = supertest.agent(shared.testURL + shared.rootContext);

describe('GoTo Forwarder Test', () => {
  it('forward to getingstarted', done => {
    request
      .get('/rest/goto/getstarted')
      .expect(302)
      .end((err, res) => {
        if (err) {
          return done(new Error(`Error: ${err}`));
        }

        expect(res.res.headers.location).to.contain('help');

        return done();
      });
  });

  it('forward to nonexisting', done => {
    request
      .get('/rest/goto/notexisting')
      .expect(404)
      .end(done);
  });
});
