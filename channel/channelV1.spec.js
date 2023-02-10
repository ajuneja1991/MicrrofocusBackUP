const _ = require('lodash');
const supertest = require('supertest');
const shared = require('./../helpers/shared');

const request = supertest.agent(shared.testURL + shared.rootContext);

describe('Channels API Test - V1', () => {
  const apiBase = '/rest/v1/channel/',
    adminLogin = shared.tenant.email,
    adminPasswd = shared.tenant.password,
    date = new Date();

  const mockData = {
    channelId: 'cpu-status<>dataChanged',
    channels: ['global<>Americas-Revenue<>dataChanged'],
    variables: ['element']
  };

  it('login admin', done => {
    shared.login(request, `${apiBase + mockData.channelId}/state`, adminLogin, adminPasswd, done);
  });

  it('get channel initial state', done => {
    const api = `${apiBase + mockData.channelId}/state`;
    request.get(api).set('X-Secure-Modify-Token', shared.secureModifyToken())
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        expect(res.body.data).not.equal(undefined);
        expect(res.body.data).to.be.a('Array');

        if (!_.isEmpty(res.body.data)) {
          expect(res.body.data.length).to.equal(1);
        }

        return done();
      });
  });

  it('get channel initial state (exactly 3 records)', done => {
    const api = `${apiBase + mockData.channelId}/state`;
    request.get(api).set('X-Secure-Modify-Token', shared.secureModifyToken()).query('count=3')
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        expect(res.body.data).not.equal(undefined);
        expect(res.body.data).to.be.a('Array');

        if (!_.isEmpty(res.body.data)) {
          expect(res.body.data.length <= 3).to.equal(true);
        }

        return done();
      });
  });

  it('get channel initial state (specified timestamp)', done => {
    const api = `${apiBase + mockData.channelId}/state`;
    request.get(api).set('X-Secure-Modify-Token', shared.secureModifyToken())
      .query(`timestamp=${date.getTime()}`)
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        expect(res.body.data).not.equal(undefined);
        expect(res.body.data).to.be.a('Array');

        if (!_.isEmpty(res.body.data)) {
          expect(res.body.data.length).to.equal(1);
        }

        return done();
      });
  });

  it('get channel initial state (non-existing channel)', done => {
    const api = `${apiBase}fake<>channel<>id/state`;
    request.get(api).set('X-Secure-Modify-Token', shared.secureModifyToken())
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        expect(res.body.data).not.equal(undefined);
        expect(res.body.data).to.be.a('Array');
        expect(_.isEmpty(res.body.data)).to.equal(true);
        return done();
      });
  });

  it('get channels', done => {
    request.get(apiBase).expect(200)
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res.body.error).to.be.false;
        done();
      });
  });

  it('get channel stats', done => {
    request.get(`${apiBase + mockData.channelId}/stats`).expect(200)
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res.body.error).to.be.false;
        done();
      });
  });

  it('get channel variations', done => {
    request.post(`${apiBase}variations`)
      .send({
        channels: mockData.channels,
        variables: mockData.variables
      }).set('X-Secure-Modify-Token', shared.secureModifyToken()).expect(200)
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res.body.error).to.be.false;
        done();
      });
  });

  it('post channel state ', done => {
    request.post(`${apiBase}state`)
      .send({
        requestedChannels: [{ id: 'cpu-status<>dataChanged', count: '1' }],
        parameters: {}
      }).set('X-Secure-Modify-Token', shared.secureModifyToken()).expect(200)
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res.body.error).to.be.false;
        done();
      });
  });

  it('Perform post channel state with invalid csrf token', done => {
    request.post(`${apiBase}state`)
      .send({
        requestedChannels: [{ id: 'cpu-status<>dataChanged', count: '1' }],
        parameters: {}
      }).set('X-Secure-Modify-Token', 'm6WBppef-xdWYLmZmOAtxDECtv62gaRaxNi')
      .expect(403)
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res.status).to.equal(403);
        expect(res.body.message).to.equal('Forbidden');
        return done();
      });
  });

  it('logout', done => {
    shared.logout(request, done);
  });
});
