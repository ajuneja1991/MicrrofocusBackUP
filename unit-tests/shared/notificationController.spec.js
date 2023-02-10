const { randomUUID } = require('crypto');
let app;

describe('notificationController tests', () => {
  const tenantData = {
    name: randomUUID(),
    description: 'tenant description',
    apiKey: randomUUID().replace(/-/g, ''),
    default: false
  };
  const newUserData = {
    login: 'testuser1',
    name: 'test user 1',
    // eslint-disable-next-line camelcase
    email_address: 'testuser1@test.com',
    password: '$Test1$!!',
    // eslint-disable-next-line camelcase
    time_zone: '',
    // eslint-disable-next-line camelcase
    super_administrator: false
  };
  const newUserData2 = {
    login: 'testuser2',
    name: 'test user 2',
    // eslint-disable-next-line camelcase
    email_address: 'testuser1@test.com',
    password: '$Test1$!!',
    // eslint-disable-next-line camelcase
    time_zone: '',
    // eslint-disable-next-line camelcase
    super_administrator: false
  };
  let userId;
  const userIds = [];

  before(function(done) {
    /* set the timeout for mocha tests to 10sec */
    this.timeout(10000);
    // eslint-disable-next-line node/global-require
    const db = require('../helpers/db');
    db.cleanAll(err => {
      if (err) {
        return done(err);
      }
      // eslint-disable-next-line node/global-require
      app = require('../../../shared/app');
      app.controllers.bvdTenant.create(tenantData, (err, tenantDoc) => {
        if (err) {
          return done(err);
        }
        newUserData.tenant = tenantDoc._id;
        newUserData2.tenant = tenantDoc._id;
        app.controllers.bvdUser.create(newUserData, {}, (err, user) => {
          if (err) {
            return done(err);
          }
          userId = user.user_object.id;
          app.controllers.bvdUser.create(newUserData2, {}, (err, user2) => {
            if (err) {
              return done(err);
            }
            userIds.push(user2.user_object.id);
            return done();
          });
        });
      });
    });
  });

  after(function(done) {
    /* set the timeout for mocha tests to 10sec */
    this.timeout(10000);
    app.controllers.bvdTenant.remove({
      name: tenantData.name
    }, err => {
      if (err) {
        return done(err);
      }

      // eslint-disable-next-line node/global-require
      const db = require('../helpers/db');

      db.cleanAll(err => {
        if (err) {
          return done(err);
        }

        return done(); // tell mocha that the tear down code is finished
      });
    });
  });

  const notification = {
    data: {
      type: 'Success',
      message: 'PDF is generated'
    },
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + (30 * 60 * 1000)),
    sendToAll: false
  };

  it('notificationController: create, get and delete a notification', done => {
    notification.creator = userId;
    notification.userIds = userIds;
    app.controllers.notificationController.createNotification(notification).then(newNotification => {
      expect(newNotification.creator).eql(userId);

      // creation happened in a transaction. Used setTimeout to give Knex an opportunity to finish the transaction
      setTimeout(async () => {
        const createdNotification = await app.controllers.notificationController.getNotification(newNotification._id);
        expect(createdNotification.data.message).eql('PDF is generated');
        expect(createdNotification.data).eql(notification.data);
        expect(createdNotification.expiresAt).eql(notification.expiresAt);
        const deleteRes = await app.controllers.notificationController.deleteNotification(newNotification._id);
        expect(deleteRes).eql(200);
        done();
      }, 10);
    });
  });

  it('notificationController: delete expired notification', done => {
    notification.creator = userId;
    notification.expiresAt = new Date(Date.now() - (30 * 60 * 1000));
    app.controllers.notificationController.createNotification(notification).then(createdNotification => {
      expect(createdNotification.creator).eql(userId);

      // creation happened in a transaction. Used setTimeout to give Knex an opportunity to finish the transaction
      setTimeout(async () => {
        const res = await app.controllers.notificationController.deleteExpiredNotification();
        expect(res).eql(200);
        app.controllers.notificationController.getNotification(createdNotification._id).then(result => {
          expect(result).eql('Not found');
          done();
        });
      }, 10);
    });
  });

  it('notificationController: should get notifications in sorted order, latest should always be on top', done => {
    notification.creator = userId;
    notification.expiresAt = new Date(Date.now() + (365 * 24 * 60 * 60 * 1000));
    notification.data.message = 'This is the latest notification';
    app.controllers.notificationController.createNotification(notification).then(createdNotification => {
      expect(createdNotification.creator).eql(userId);

      // creation happened in a transaction. Used setTimeout to give Knex an opportunity to finish the transaction
      setTimeout(async () => {
        notification.data.message = 'This is the older notification';
        notification.createdAt = new Date(Date.now() - (24 * 60 * 60 * 1000));
        app.controllers.notificationController.createNotification(notification).then(async createdNotification1 => {
          expect(createdNotification1.creator).eql(userId);
          // creation happened in a transaction. Used setTimeout to give Knex an opportunity to finish the transaction
          setTimeout(async () => {
            app.controllers.notificationController.getUserSpecificNotifications({ userId: notification.userIds[0] }).then(result => {
              expect(result[0].data.message).eql('This is the latest notification');
              expect(result[1].data.message).eql('This is the older notification');
              done();
            });
          }, 10);
        }, 10);
      });
    });
  });
});
