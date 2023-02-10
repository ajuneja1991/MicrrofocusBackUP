'use strict';

const supertest = require('supertest');
const shared = require('./../helpers/shared');

const requestAlive = supertest.agent(shared.testURL),
  requestReady = supertest.agent(shared.testURL + shared.rootContext);

describe('Docker Status Test', () => {
  it('alive test', done => {
    requestAlive
      .get('/docker/alive')
      .expect(200)
      .end((err, res) => {
        if (err) {
          return done(new Error(`Error: ${err}`));
        }

        expect(res.text).to.equal('OK');

        return done();
      });
  });

  it('ready test', done => {
    requestReady
      .get('/docker/ready')
      .expect(200)
      .end((err, res) => {
        if (err) {
          return done(new Error(`Error: ${err}`));
        }

        expect(res.text).to.equal('OK');

        return done();
      });
  });
});
