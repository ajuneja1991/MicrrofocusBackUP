/* eslint-disable node/global-require, no-unused-expressions, no-underscore-dangle */

const dbTypes = require('../../../shared/db/pg_driver/dbTypes');

describe('pg-driver-dataItem tests', () => {
  let app;
  const mock = {
      timeStamp1: new Date(),
      timeStamp2: undefined,
      channel1: '55b5fdc2fa7ef1c419859246:84W7vNdoya6QDNopKnSw1xEIq6M=',
      channel2: 'a:b',
      defaultTenantId: '',
      defaultTenantName: '',
      tenantId: '66b5fdc2fa7ef1c419859246'
    },
    mockBulk = [{
      ts: new Date(),
      channel: 'test1:test2',
      data: {
        test1: 'test1',
        test2: 'test2'
      }
    }, {
      ts: new Date(),
      channel: 'test11:test22',
      data: {
        test11: 'test11',
        test22: 'test22'
      }
    }, {
      ts: new Date(),
      channel: 'test111:test222',
      data: {
        test1: 'test111',
        test2: 'test222'
      }
    }],
    pgDBDriverType = 'sql';

  before(function(done) {
  /* set the timeout for mocha tests to 10sec */
    this.timeout(100000);
    const db = require('../helpers/db');

    db.cleanAll(err => {
      if (err) {
        return done(err);
      }
      app = require('../../../shared/app');

      /* ensure that the two data item tables that are created on the fly do not exist (e.g. because of a failed test) */
      return app.controllers.item.dropTable(mock.tenantId, 1, err => {
        if (err) {
          return done(err);
        }

        return app.controllers.item.dropTable(mock.tenantId, 2, err => {
          if (err) {
            return done(err);
          }

          return app.controllers.bvdTenant.createDefaultTenant((err, tenant) => {
            if (err) {
              return done(err);
            }
            mock.defaultTenantId = tenant._id;
            mock.defaultTenantName = tenant.name;

            app.controllers.filters.createOrUpdate(
              mock.channel1, {},
              mock.defaultTenantId,
              err => {
                if (err) {
                  return done(err);
                }

                done();
              });
          });
        });
      });
    });
  });

  after(function(done) {
  /* set the timeout for mocha tests to 10sec */
    this.timeout(100000);
    const db = require('../helpers/db');

    app.controllers.bvdTenant.remove({
      name: mock.defaultTenantName,
      force: true
    }, err => {
      if (err) {
        return done(err);
      }

      return db.cleanAll(done);
    });
  });

  it('pg-driver-dataItem: create dataItem', done => {
    if (app.dbConnection.driverType !== pgDBDriverType) {
      return done();
    }
    const params = {
      channel: mock.channel1,
      envelope: {
        tenantId: mock.defaultTenantId,
        channel: mock.channel1,
        data: {
          d1: 1,
          d2: 2,
          d3: 3
        },
        ts: mock.timeStamp1
      }
    };

    app.controllers.item.create(params,
      (err, result) => {
        if (err) {
          return done(err);
        }
        expect(result).to.exist;
        expect(result.data).to.exist;
        expect(result.data.d1).to.equal(1);
        expect(result.data.d2).to.equal(2);
        expect(result.data.d3).to.equal(3);
        expect(result.ts).to.eql(mock.timeStamp1);
        expect(result.channel).to.eql(mock.channel1);

        return done();
      }
    );
  });

  it('pg-driver-dataItem: get dataItem', done => {
    if (app.dbConnection.driverType !== pgDBDriverType) {
      return done();
    }
    app.controllers.item.get({
      tenantId: mock.defaultTenantId,
      query: {
        ts: mock.timeStamp1,
        channel: mock.channel1
      }
    },
    (err, result) => {
      if (err) {
        return done(err);
      }
      expect(result).to.exist;
      expect(result).to.be.instanceof(Array);
      expect(result).to.have.length(1);
      const di = result[0];

      expect(di.data).to.exist;
      expect(di.data.d1).to.equal(1);
      expect(di.data.d2).to.equal(2);
      expect(di.data.d3).to.equal(3);
      expect(di.ts).to.eql(mock.timeStamp1);
      expect(di.channel).to.eql(mock.channel1);

      return done();
    }
    );
  });

  it('pg-driver-dataItem: get no dataItem 1', done => {
    if (app.dbConnection.driverType !== pgDBDriverType) {
      return done();
    }
    app.controllers.item.get({
      tenantId: mock.defaultTenantId,
      query: {
        ts: mock.timeStamp1,
        channel: 'haha'
      }
    },
    (err, result) => {
      if (err) {
        return done(err);
      }
      expect(result).to.exist;
      expect(result).to.be.instanceof(Array);
      expect(result).to.have.length(0);

      return done();
    }
    );
  });

  it('pg-driver-dataItem: get no dataItem 2', done => {
    if (app.dbConnection.driverType !== pgDBDriverType) {
      return done();
    }
    app.controllers.item.get({
      tenantId: mock.defaultTenantId,
      query: {
        ts: new Date(),
        channel: mock.channel1
      }
    },
    (err, result) => {
      if (err) {
        return done(err);
      }
      expect(result).to.exist;
      expect(result).to.be.instanceof(Array);
      expect(result).to.have.length(0);

      return done();
    }
    );
  });

  it('pg-driver-dataItem: exist dataItem true', done => {
    if (app.dbConnection.driverType !== pgDBDriverType) {
      return done();
    }
    app.dbConnection.exists(dbTypes.dataItem, {
      table: [mock.defaultTenantId, 1],
      query: {
        ts: mock.timeStamp1,
        channel: mock.channel1
      }
    },
    (err, exists) => {
      if (err) {
        return done(err);
      }
      expect(exists).to.be.true;

      return done();
    }
    );
  });

  it('pg-driver-dataItem: exist dataItem false', done => {
    if (app.dbConnection.driverType !== pgDBDriverType) {
      return done();
    }
    app.dbConnection.exists(
      dbTypes.dataItem, {
        table: [mock.defaultTenantId, 1],
        query: {
          ts: mock.timeStamp1,
          channel: 'c:d'
        }
      },
      (err, exists) => {
        if (err) {
          return done(err);
        }
        expect(exists).to.be.false;

        return done();
      }
    );
  });

  it('pg-driver-dataItem: update dataItem', done => {
    if (app.dbConnection.driverType !== pgDBDriverType) {
      return done();
    }
    app.dbConnection.update(
      dbTypes.dataItem, {
        table: [mock.defaultTenantId, 1],
        query: {
          channel: mock.channel1
        }
      }, {
        data: {
          d1: 3,
          d2: 2,
          d3: 1
        }
      },
      (err, result) => {
        if (err) {
          return done(err);
        }
        expect(result).to.exist;
        expect(result).to.be.instanceof(Array);
        expect(result).to.have.length(1);
        const di = result[0];

        expect(di.data).to.exist;

        return done();
      }
    );
  });

  it('pg-driver-dataItem: update dataItem check', done => {
    if (app.dbConnection.driverType !== pgDBDriverType) {
      return done();
    }
    app.controllers.item.get({
      tenantId: mock.defaultTenantId,
      query: {
        channel: mock.channel1
      }
    },
    (err, result) => {
      if (err) {
        return done(err);
      }
      expect(result).to.exist;
      expect(result).to.be.instanceof(Array);
      expect(result).to.have.length(1);

      const di = result[0];

      expect(di.data).to.exist;
      expect(di.data.d1).to.equal(3);
      expect(di.data.d2).to.equal(2);
      expect(di.data.d3).to.equal(1);
      expect(di.ts).to.eql(mock.timeStamp1);

      expect(di.channel).to.eql(mock.channel1);

      return done();
    }
    );
  });

  it('pg-driver-dataItem: create or update dataItem 1', done => {
    if (app.dbConnection.driverType !== pgDBDriverType) {
      return done();
    }
    app.dbConnection.createOrUpdate(
      dbTypes.dataItem, {
        table: [mock.defaultTenantId, 1],
        query: {
          channel: mock.channel2
        }
      }, {
        channel: mock.channel2,
        data: {
          d1: 0,
          d2: 5,
          d3: 6
        },
        ts: mock.timeStamp1
      },
      (err, result) => {
        if (err) {
          return done(err);
        }
        expect(result).to.exist;
        expect(result.data).to.exist;
        expect(result.data.d1).to.equal(0);
        expect(result.data.d2).to.equal(5);
        expect(result.data.d3).to.equal(6);
        expect(result.ts).to.eql(mock.timeStamp1);
        expect(result.channel).to.eql(mock.channel2);

        return done();
      }
    );
  });

  it('pg-driver-dataItem: create or update dataItem 1 check', done => {
    if (app.dbConnection.driverType !== pgDBDriverType) {
      return done();
    }
    app.controllers.item.get({
      tenantId: mock.defaultTenantId,
      query: {
        channel: mock.channel2
      }
    },
    (err, result) => {
      if (err) {
        return done(err);
      }
      expect(result).to.exist;
      expect(result).to.be.instanceof(Array);
      expect(result).to.have.length(1);

      const di = result[0];

      expect(di.data).to.exist;
      expect(di.data.d1).to.equal(0);
      expect(di.data.d2).to.equal(5);
      expect(di.data.d3).to.equal(6);
      expect(di.ts).to.eql(mock.timeStamp1);

      expect(di.channel).to.eql(mock.channel2);

      return done();
    }
    );
  });

  it('pg-driver-dataItem: create or update dataItem 2', done => {
    if (app.dbConnection.driverType !== pgDBDriverType) {
      return done();
    }
    mock.timeStamp2 = new Date();
    app.dbConnection.createOrUpdate(
      dbTypes.dataItem, {
        table: [mock.defaultTenantId, 1],
        query: {
          channel: mock.channel2
        }
      }, {
        data: {
          d1: 4,
          d2: 5,
          d3: 6
        },
        ts: mock.timeStamp2
      },
      (err, result) => {
        if (err) {
          return done(err);
        }
        expect(result).to.exist;
        expect(result).to.be.instanceof(Array);
        expect(result).to.have.length(1);
        const di = result[0];

        expect(di.data).to.exist;
        expect(di.data.d1).to.equal(4);
        expect(di.data.d2).to.equal(5);
        expect(di.data.d3).to.equal(6);
        expect(di.ts).to.eql(mock.timeStamp2);

        expect(di.channel).to.eql(mock.channel2);

        return done();
      }
    );
  });

  it('pg-driver-dataItem: create or update dataItem 2 check 1', done => {
    if (app.dbConnection.driverType !== pgDBDriverType) {
      return done();
    }
    app.controllers.item.get({
      tenantId: mock.defaultTenantId,
      query: {
        channel: mock.channel2
      }
    },
    (err, result) => {
      if (err) {
        return done(err);
      }
      expect(result).to.exist;
      expect(result).to.be.instanceof(Array);
      expect(result).to.have.length(1);

      const di = result[0];

      expect(di.data).to.exist;
      expect(di.data.d1).to.equal(4);
      expect(di.data.d2).to.equal(5);
      expect(di.data.d3).to.equal(6);
      expect(di.ts).to.eql(mock.timeStamp2);

      expect(di.channel).to.eql(mock.channel2);

      return done();
    }
    );
  });

  it('pg-driver-dataItem: create or update dataItem 2 check 2', done => {
    if (app.dbConnection.driverType !== pgDBDriverType) {
      return done();
    }
    app.controllers.item.get({
      tenantId: mock.defaultTenantId,
      query: {}
    },
    (err, result) => {
      if (err) {
        return done(err);
      }
      expect(result).to.exist;
      expect(result).to.be.instanceof(Array);
      expect(result).to.have.length(2);

      return done();
    }
    );
  });

  it('pg-driver-dataItem: get dataItem 2', done => {
    if (app.dbConnection.driverType !== pgDBDriverType) {
      return done();
    }
    app.controllers.item.get({
      tenantId: mock.defaultTenantId,
      query: {
        ts: {
          $gt: mock.timeStamp1
        }
      }
    },
    (err, result) => {
      if (err) {
        return done(err);
      }
      expect(result).to.exist;
      expect(result).to.be.instanceof(Array);
      expect(result).to.have.length(1);

      return done();
    }
    );
  });

  it('pg-driver-dataItem: remove dataItem 1', done => {
    if (app.dbConnection.driverType !== pgDBDriverType) {
      return done();
    }
    app.dbConnection.remove(
      dbTypes.dataItem, {
        table: [mock.defaultTenantId, 1],
        query: {
          channel: mock.channel1
        }
      },
      (err, result) => {
        if (err) {
          return done(err);
        }
        expect(result).to.exist;
        expect(result).to.equal(1);

        return done();
      }
    );
  });

  it('pg-driver-dataItem: remove dataItem 1 check 1', done => {
    if (app.dbConnection.driverType !== pgDBDriverType) {
      return done();
    }
    app.controllers.item.get({
      tenantId: mock.defaultTenantId,
      query: {}
    },
    (err, result) => {
      if (err) {
        return done(err);
      }
      expect(result).to.exist;
      expect(result).to.be.instanceof(Array);
      expect(result).to.have.length(1);

      return done();
    }
    );
  });

  it('pg-driver-dataItem: remove dataItem 1 check 2', done => {
    if (app.dbConnection.driverType !== pgDBDriverType) {
      return done();
    }
    app.controllers.item.get({
      tenantId: mock.defaultTenantId,
      query: {
        ts: mock.timeStamp2
      }
    },
    (err, result) => {
      if (err) {
        return done(err);
      }
      expect(result).to.exist;
      expect(result).to.be.instanceof(Array);
      expect(result).to.have.length(1);

      const di = result[0];

      expect(di.data).to.exist;
      expect(di.data.d1).to.equal(4);
      expect(di.data.d2).to.equal(5);
      expect(di.data.d3).to.equal(6);
      expect(di.ts).to.eql(mock.timeStamp2);

      expect(di.channel).to.eql(mock.channel2);

      return done();
    }
    );
  });

  it('pg-driver-dataItem: bulk create dataItem', done => {
    let dataItemCount;

    if (app.dbConnection.driverType !== pgDBDriverType) {
      return done();
    }

    app.controllers.item.get({
      tenantId: mock.defaultTenantId,
      query: {}
    }, (err, result) => {
      if (err) {
        return done(err);
      }
      expect(result).to.exist;
      expect(result).to.be.instanceof(Array);
      dataItemCount = result.length;

      app.dbConnection.bulkCreate(dbTypes.dataItem, {
        table: [mock.defaultTenantId, 1]
      }, mockBulk, err => {
        if (err) {
          return done(err);
        }

        /* wait a second until bulkwriter wrote data to DB */
        setTimeout(() => {
          app.controllers.item.get({
            tenantId: mock.defaultTenantId,
            query: {}
          }, (err, resultWithBulk) => {
            if (err) {
              return done(err);
            }
            expect(resultWithBulk).to.exist;
            expect(resultWithBulk).to.be.instanceof(Array);
            expect(resultWithBulk).to.have.length(dataItemCount + mockBulk.length);

            return done();
          });
        }, 1000);
      });
    });
  });

  it('pg-driver-dataItem: create dataItem table', done => {
    if (app.dbConnection.driverType !== pgDBDriverType) {
      return done();
    }
    app.controllers.item.createTable(mock.tenantId, 1,
      err => {
        if (err) {
          return done(err);
        }

        return done();
      });
  });

  it('pg-driver-dataItem: check if dataItem table exists', done => {
    if (app.dbConnection.driverType !== pgDBDriverType) {
      return done();
    }
    app.controllers.item.existsTable(mock.tenantId, 1,
      (err, exists) => {
        if (err) {
          return done(err);
        }
        expect(exists).to.be.true;

        return done();
      });
  });

  it('pg-driver-dataItem: rename dataItem table', done => {
    if (app.dbConnection.driverType !== pgDBDriverType) {
      return done();
    }
    app.controllers.item.renameTable(mock.tenantId, 1, 2, err => {
      if (err) {
        return done(err);
      }

      return done();
    });
  });

  it('pg-driver-dataItem: check if renamed dataItem table exists', done => {
    if (app.dbConnection.driverType !== pgDBDriverType) {
      return done();
    }
    app.controllers.item.existsTable(mock.tenantId, 2,
      (err, exists) => {
        if (err) {
          return done(err);
        }
        expect(exists).to.be.true;

        return done();
      });
  });

  it('pg-driver-dataItem: drop dataItem table', done => {
    if (app.dbConnection.driverType !== pgDBDriverType) {
      return done();
    }
    app.controllers.item.dropTable(mock.tenantId, 2, err => {
      if (err) {
        return done(err);
      }

      return done();
    });
  });
});
