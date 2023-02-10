const supertest = require('supertest');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
dayjs.extend(utc);
const shared = require('./../helpers/shared');
const getEnv = require('../../../shared/config/getEnv');
const bvdIdmExternalUrl = getEnv.bvd_idm_external_url || 'http://localhost:5555';
const constants = require('../../../shared/constants');

const request = supertest.agent(shared.testURL + shared.rootContext);
const authRequest = supertest.agent(bvdIdmExternalUrl);
describe('Notifications API Test', () => {
  const notificationId = [];
  const
    apiBaseNotification = '/rest/v2/notification',
    adminLogin = shared.tenant.email,
    adminPasswd = shared.tenant.password;
  const getUserId = () => new Promise((resolve, reject) => {
    const data = {
      passwordCredentials: {
        username: adminLogin,
        password: adminPasswd
      },
      // eslint-disable-next-line node/no-process-env
      tenantName: process.env.IDM_ORGANIZATION || 'Provider'

    };
    authRequest.post(`${constants.IDM_CONTEXT}`)
      .set(
        { 'Content-Type': 'application/json;charset=UTF-8',
          'Access-Control-Allow-Origin': '*',
          Accept: 'application/json' }).send(data).end((err, res) => {
        if (err) {
          return reject('Failed to get user id');
        }
        request.get(`/rest/v2/session/user`).set('X-Auth-Token', res.body.token.id)
          .end((err, response) => {
            if (err) {
              return reject('Failed to get user id');
            }
            return resolve(response.body.data.userDetails.userId);
          });
      });
  });

  const createNotification = () => new Promise(resolve => {
    getUserId().then(userId => {
      request
        .post(apiBaseNotification)
        .expect('Content-Type', 'application/json; charset=utf-8')
        .set('X-Secure-Modify-Token', shared.secureModifyToken())
        .send({
          userIds: `${userId}`,
          data: { type: 'Success', message: 'Notification Created' },
          expiresAt: new Date(Date.now() + (30 * 60 * 1000))
        })
        .end((err, res) => {
          expect(err).to.be.null;
          expect(res.body.data).to.be.not.undefined;
          expect(res.body.data.data.message).to.be.eql('Notification Created');
          notificationId.push(res.body.data._id);
          return resolve();
        });
    });
  });

  it('Login Admin', done => {
    shared.login(request, apiBaseNotification, adminLogin, adminPasswd, done);
  });

  it('Create a notification to myself', done => {
    request
      .post(apiBaseNotification)
      .expect('Content-Type', 'application/json; charset=utf-8')
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .send({
        data: { type: 'Success', message: 'Notification Created' },
        expiresAt: new Date(Date.now() + (30 * 60 * 1000))
      })
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res.body.data).to.be.not.undefined;
        expect(res.body.error).to.be.false;
        expect(res.body.data.data.message).to.be.eql('Notification Created');
        return done();
      });
  });

  it('Create a notification for a user', done => {
    createNotification().then(() => done());
  });

  it('should fail when expired time for notification is not provided', done => {
    request
      .post(apiBaseNotification)
      .expect('Content-Type', 'application/json; charset=utf-8')
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .send({
        data: { type: 'Success', message: 'Notification Created' },
        userIds: 123
      })
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res.body.data).to.be.undefined;
        expect(res.body.error).to.be.true;
        expect(res.body.message).to.be.equal('Expires at must be present for notification');
        return done();
      });
  });

  it('should fail when data content for notification is not provided', done => {
    request
      .post(apiBaseNotification)
      .expect('Content-Type', 'application/json; charset=utf-8')
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .send({
        userIds: 123,
        expiresAt: new Date(Date.now() + (30 * 60 * 1000))
      })
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res.body.data).to.be.undefined;
        expect(res.body.error).to.be.true;
        expect(res.body.message).to.be.equal('Data Content of notification must be present');
        return done();
      });
  });

  it('should get notification for currently logged in user', done => {
    request
      .get(apiBaseNotification)
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res.body.data).to.be.not.undefined;
        expect(res.body.data[0].data.message).to.be.eql('Notification Created');
        return done();
      });
  });

  it('should get notification for currently logged in user when lastFetchTime is provided', done => {
    const lastFetchTime = dayjs.utc(Date.now() - (3 * 60 * 1000)).format(); // 3 minutes before
    request
      .get(`${apiBaseNotification}?modifiedSince=${lastFetchTime}`)
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res.body.data).to.be.not.undefined;
        expect(res.body.data[0].data.message).to.be.eql('Notification Created');
        return done();
      });
  });

  it('should get notification for currently logged in user when intervalTime is provided', done => {
    request
      .get(`${apiBaseNotification}?intervalTime=${3 * 60 * 1000}`)
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res.body.data).to.be.not.undefined;
        expect(res.body.data.length).to.be.eql(2);
        return done();
      });
  });

  it('should get notification count for currently logged in user when lastFetchTime is provided', done => {
    request
      .get(`${apiBaseNotification}/count`)
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res.body.data).to.be.not.undefined;
        const initialCount = res.body.data;
        createNotification().then(() => {
          request
            .get(`${apiBaseNotification}/count`)
            .end((err, result) => {
              expect(err).to.be.null;
              expect(result.body.data).to.be.not.undefined;
              expect(result.body.data).to.be.eql(initialCount + 1);
              return done();
            });
        });
      });
  });

  it('should not get notification for currently logged in user', done => {
    const lastFetchTime = dayjs.utc(Date.now() + (120 * 1000)).format(); // two minutes later
    request
      .get(`${apiBaseNotification}?modifiedSince=${lastFetchTime}`)
      .expect('Content-Type', 'application/json; charset=utf-8')
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res.body.data.length).to.be.eql(0);
        return done();
      });
  });

  it('should get notification for currently logged in user when intervalTime is too short', done => {
    setTimeout(() => {
      request
        .get(`${apiBaseNotification}?intervalTime=${100}`)
        .end((err, res) => {
          expect(err).to.be.null;
          expect(res.body.data).to.be.not.undefined;
          expect(res.body.data.length).to.be.eql(0);
          return done();
        });
    }, 100);
  });

  it('should get notification for currently logged in user when intervalTime is not provided', done => {
    request
      .get(`${apiBaseNotification}?intervalTime=`)
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res.body.data).to.be.not.undefined;
        expect(res.body.data.length).to.be.eql(3);
        return done();
      });
  });

  it('should delete the notification', async () => {
    await createNotification();
    await createNotification();
    request
      .delete(`${apiBaseNotification}`)
      .expect('Content-Type', 'application/json; charset=utf-8')
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .send(notificationId)
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res.body.data).to.be.not.undefined;
        expect(res.body.error).to.be.equal(false);
        expect(res.body.data).to.be.equal('Deleted Successfully');
        return;
      });
  });

  it('should delete the non existing notification', done => {
    const data = ['123'];
    request
      .delete(`${apiBaseNotification}`)
      .expect('Content-Type', 'application/json; charset=utf-8')
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .send(data)
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res.body.data).to.be.undefined;
        expect(res.body.error).to.be.equal(true);
        expect(res.body.message).to.be.equal('Not found');
        return done();
      });
  });

  it('Log out', done => {
    shared.logout(request, done);
  });
});

