/* eslint-disable node/global-require, no-unused-expressions, no-underscore-dangle */

describe('itemController tests', () => {
  const async = require('async'),
    moment = require('moment');

  const Envelope = require('../../../receiver/server/envelope');

  const channel1 = 'east<>NYC<>c64.hpe.com<>cpuLoad',
    channel2 = 'west<>LA<>mac.hpe.com<>cpuLoad',
    data1 = {
      location: 'NYC',
      host: 'c64.hpe.com',
      metric: 'cpuLoad',
      value: 98
    },
    data2 = {
      location: 'LA',
      host: 'mac.hpe.com',
      metric: 'cpuLoad',
      value: 77
    },
    dims = ['location', 'host', 'metric'],
    numOfDataItems1 = 100,
    tags1 = ['east'],
    tags2 = ['west'];

  let aging,
    app,
    config,
    dataItem1,
    moment1,
    moment2,
    tenant;

  before(function(done) {
  /* set the timeout for mocha tests to 10sec */
    this.timeout(100000);
    const db = require('../helpers/db');

    db.cleanAll(err => {
      if (err) {
        return done(err);
      }
      app = require('../../../shared/app');
      config = app.config;
      aging = require('../../../controller/aging');

      app.controllers.bvdTenant.createDefaultTenant((err, tenantDoc) => {
        if (err) {
          return done(err);
        }
        tenant = tenantDoc;
        const dashboardWidgetMap = {
          dashboard1: true
        };

        app.controllers.filters.createOrUpdate(
          channel1,
          dashboardWidgetMap,
          tenant._id,
          err => {
            if (err) {
              return done(err);
            }

            return done();
          }
        );
      });
    });
  });

  beforeEach(done => {
    config.bulkWriterEnabled = false;
    done();
  });

  after(function(done) {
  /* set the timeout for mocha tests to 10sec */
    this.timeout(100000);
    const db = require('../helpers/db');
    db.cleanAll(err => {
      if (err) {
        return done(err);
      }

      return done(); // tell mocha that the tear down code is finished
    });
  });

  it('itemController:create one', done => {
    moment1 = moment();
    const date = moment1.toDate(),
      envelope1 = new Envelope(data1, tags1, dims, tenant, date);

    app.controllers.stats.updateStats(envelope1, err => {
      if (err) {
        return done(err);
      }

      app.controllers.item.create({
        channel: channel1,
        envelope: envelope1
      }, (err, dataItem) => {
        if (err) {
          return done(err);
        }
        expect(dataItem).to.exist;
        expect(dataItem.ts).to.exist;
        expect(dataItem.ts).eql(date);
        expect(dataItem.data).to.exist;
        expect(dataItem.data).eql(data1);
        expect(dataItem.channel).to.exist;
        expect(dataItem.channel).to.eql(channel1);
        dataItem1 = dataItem;

        return done();
      });
    });
  });

  it('itemController:create unused stat', done => {
    moment2 = moment().subtract(5, 'm');
    const envelope2 = new Envelope(data2, tags2, dims, tenant, moment2.toDate());

    app.controllers.stats.updateStats(envelope2,
      err => {
        if (err) {
          return done(err);
        }

        return done();
      });
  });

  it('itemController:get data item', done => {
    const options = {
      tenantId: tenant._id,
      query: {
        channel: channel1
      },
      sort: {
        ts: 'desc'
      },
      limit: 1
    };

    app.controllers.item.get(options, (err, items) => {
      if (err) {
        return done(err);
      }
      expect(items).to.exist;
      expect(items).to.be.instanceof(Array);
      expect(items).to.have.lengthOf(1);
      expect(items[0]).to.eql(dataItem1);

      return done();
    });
  });

  it('itemController:get stats', done => {
    app.controllers.stats.getChannelStats(tenant._id, channel1, (err, stats1) => {
      if (err) {
        return done(err);
      }
      expect(stats1).to.exist;
      expect(stats1.dims).to.exist;
      expect(stats1.dims).eql(dims.join(','));
      expect(stats1.tags).to.exist;
      expect(stats1.tags).eql(tags1.join(','));
      expect(stats1.lastPayload).to.exist;
      expect(stats1.lastPayload).eql(data1);
      expect(stats1.lastSeen).to.exist;
      expect(Number(stats1.lastSeen)).to.eql(moment1.valueOf());

      app.controllers.stats.getChannelStats(tenant._id, channel2, (err, stats2) => {
        if (err) {
          return done(err);
        }
        expect(stats2).to.exist;
        expect(stats2.dims).to.exist;
        expect(stats2.dims).eql(dims.join(','));
        expect(stats2.tags).to.exist;
        expect(stats2.tags).eql(tags2.join(','));
        expect(stats2.lastPayload).to.exist;
        expect(stats2.lastPayload).eql(data2);
        expect(stats2.lastSeen).to.exist;
        expect(Number(stats2.lastSeen)).to.eql(moment2.valueOf());

        return done();
      });
    });
  });

  it('itemController:create many data items', done => {
    config.bulkWriterEnabled = true;
    config.bulkWriterCount = 20;

    const seconds = Array.from({
      length: numOfDataItems1
    }, (value, i) => i + 1);

    async.eachSeries(seconds, (second, cb) => {
      const date = moment1.clone().subtract(2, 'h').subtract(second, 's'),
        envelope = new Envelope(data1, tags1, dims, tenant, date.toDate());

      app.controllers.item.create({
        channel: channel1,
        envelope
      }, err => {
        if (err) {
          return cb(err);
        }

        return cb();
      });
    }, err => {
      if (err) {
        return done(err);
      }
      const options = {
        tenantId: tenant._id,
        query: {
          channel: channel1
        },
        sort: {
          ts: 'desc'
        },
        // Workaround:
        //    Union all queries in Oracle doesn't work if the queries contain an 'order by'. With specifying the limit we
        //    suround the query with the 'order by' with an additional query:
        //    (select * from (select ... order by "ts" desc) where rownum <= ?)
        //         union all
        //    (select * from (select ... order by "ts" desc) where rownum <= ?)
        limit: 10000
      };

      app.controllers.item.get(options, (err, items) => {
        if (err) {
          return done(err);
        }
        expect(items).to.exist;
        expect(items).to.be.instanceof(Array);
        expect(items).to.have.lengthOf(numOfDataItems1 + 1);

        return done();
      });
    });
  });

  it('itemController:aging delete older than', done => {
    aging.dataAging(err => {
      if (err) {
        return done(err);
      }
      const options = {
        tenantId: tenant._id,
        table: 1,
        query: {
          channel: channel1
        },
        sort: {
          ts: 'desc'
        }
      };

      /* check that the first table is empty */
      app.controllers.item.get(options, (err, items1) => {
        if (err) {
          return done(err);
        }
        expect(items1).to.exist;
        expect(items1).to.be.instanceof(Array);
        expect(items1).to.have.lengthOf(0);

        /* check that the second table still contains 101 items */
        options.table = 2;
        app.controllers.item.get(options, (err, items2) => {
          if (err) {
            return done(err);
          }
          expect(items2).to.exist;
          expect(items2).to.be.instanceof(Array);
          expect(items2).to.have.lengthOf(101);
          expect(items2[0].ts).to.exist;
          expect(items2[0].ts).eql(moment1.toDate());
          expect(items2[0].data).to.exist;
          expect(items2[0].data).eql(data1);
          expect(items2[0].channel).to.exist;
          expect(items2[0].channel).to.eql(channel1);

          aging.statsAging(err => {
            if (err) {
              return done(err);
            }

            /* check that the unused stat was deleted */
            app.controllers.stats.getChannelStats(tenant._id, channel1, (err, stats) => {
              if (err) {
                return done(err);
              }
              expect(stats).to.exist;
              expect(stats.dims).to.exist;
              expect(stats.dims).eql(dims.join(','));
              expect(stats.tags).to.exist;
              expect(stats.tags).eql(tags1.join(','));
              expect(stats.lastPayload).to.exist;
              expect(stats.lastPayload).eql(data1);
              expect(stats.lastSeen).to.exist;
              expect(Number(stats.lastSeen)).to.eql(moment1.valueOf());

              return done();
            });
          });
        });
      });
    });
  });

  it('itemController:aging delete all in second table', done => {
    aging.dataAging(err => {
      if (err) {
        return done(err);
      }
      const options = {
        tenantId: tenant._id,
        table: 1,
        query: {
          channel: channel1
        },
        sort: {
          ts: 'desc'
        }
      };

      /* check that the first table is empty */
      app.controllers.item.get(options, (err, items1) => {
        if (err) {
          return done(err);
        }
        expect(items1).to.exist;
        expect(items1).to.be.instanceof(Array);
        expect(items1).to.have.lengthOf(0);

        /* check that the second table is empty */
        options.table = 2;
        app.controllers.item.get(options, (err, items2) => {
          if (err) {
            return done(err);
          }
          expect(items2).to.exist;
          expect(items2).to.be.instanceof(Array);
          expect(items2).to.have.lengthOf(0);

          return done();
        });
      });
    });
  });
});
