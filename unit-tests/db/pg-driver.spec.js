/* eslint-disable node/no-sync, camelcase, node/global-require */

describe('pg-driver tests', () => {
  const path = require('path');
  const fs = require('fs');
  const _ = require('lodash');
  const { randomUUID, createHash } = require('crypto');
  const dbTypes = require('../../../shared/db/pg_driver/dbTypes');
  const constants = require('../../../shared/constants');

  let app;
  const pgDBDriverType = 'sql',
    mock = {
      tenantData: {
        name: randomUUID(),
        apiKey: 'TEST-TENANT-API-KEY',
        default: false
      },
      tenant1: undefined,

      channel: 'omi<>bvd<>test',

      filterData: {
        name: `${randomUUID()}<>${randomUUID()}`,
        dashboardWidgetMap: {
          documentation1: ['aaa']
        }
      },

      filterDataArray: [{
        name: `${randomUUID()}<>${randomUUID()}`,
        dashboardWidgetMap: {
          documentation1: ['aaa']
        }
      },
      {
        name: `${randomUUID()}<>${randomUUID()}`,
        dashboardWidgetMap: {
          documentation1: ['aaa']
        }
      },
      {
        name: `${randomUUID()}<>${randomUUID()}`,
        dashboardWidgetMap: {
          documentation1: ['aaa']
        }
      }
      ],

      filterUpdateObject: {
        dashboardWidgetMap: {
          documentation1: [
            'aaa', 'bbb'
          ]
        }
      },

      category1Data: {
        name: 'TestCategory1'
      },
      category1: undefined,
      category2Data: {
        name: 'TestCategory2'
      },
      category2UpdateObject: {
        name: 'Test Category 2',
        dashboard: undefined
      },
      category2: undefined,

      dashboardData: {
        backgroundColor: randomUUID(),
        name: randomUUID(),
        title: randomUUID(),
        sortTitle: randomUUID(),
        defaultDashboard: false,
        showInMenu: false,
        widgets: [{
          opr_channel: `${randomUUID()}<>${randomUUID()}`,
          opr_item_type: 'opr_TEST',
          opr_dashboard_item: 1,
          widgetId: `shape${Math.floor(Math.random() * 100)}`
        }],
        svgFile: {
          contentType: 'image/svg+xml',
          data: fs.readFileSync(path.resolve(__dirname, '../test-files/test-documentation-processed.svg'), 'utf8')
        },
        options: {
          fit: 'full'
        }
      },

      dashboardUpdateObject: {
        dataChannel: 'TEST-DATA-CHANNEL'
      }
    },
    queryParams = {
      tenantQuery: {
        name: mock.tenantData.name
      },
      filterQuery: {
        name: mock.filterData.name
      },
      dashboardQuery: {
        name: mock.dashboardData.name
      }
    };

  function createFilterHash(tenant, channel) {
    const hash = createHash('sha1');
    hash.update(tenant + constants.TENANT_CHANNEL_SEPARATOR + channel, 'utf8');
    return hash.digest('base64');
  }

  before(function(done) {
  /* set the timeout for mocha tests to 10sec */
    this.timeout(100000);
    const db = require('../helpers/db');
    db.cleanAll(
      err => {
        if (err) {
          return done(err);
        }
        app = require('../../../shared/app');
        done(); // tell mocha that the setup code is finished
      }
    );
  }
  );

  after(function(done) {
  /* set the timeout for mocha tests to 10sec */
    this.timeout(100000);
    const db = require('../helpers/db');
    db.cleanAll(
      err => {
        if (err) {
          return done(err);
        }
        done(); // tell mocha that the tear down code is finished
      }
    );
  }
  );

  it('pg-driver: create tenant', done => {
    if (app.dbConnection.driverType !== pgDBDriverType) {
      return done();
    }
    app.dbConnection.create(dbTypes.bvdTenant, {}, mock.tenantData,
      (err, result) => {
        if (err) {
          return done(err);
        }
        expect(result).to.exist;
        expect(result.apiKey).to.equal(mock.tenantData.apiKey);
        expect(result.name).to.equal(mock.tenantData.name);
        expect(result.default).to.be.false;

        done();
      });
  });

  it('pg-driver: get tenant', done => {
    if (app.dbConnection.driverType !== pgDBDriverType) {
      return done();
    }
    app.dbConnection.get(dbTypes.bvdTenant, {
      query: queryParams.tenantQuery
    },
    (err, result) => {
      if (err) {
        return done(err);
      }
      expect(result).to.exist;
      expect(result).to.be.instanceof(Array);
      expect(result).to.have.length(1);
      const tenant = result[0];
      expect(tenant.apiKey).to.equal(mock.tenantData.apiKey);
      expect(tenant.name).to.equal(mock.tenantData.name);
      expect(tenant.default).to.be.false;

      mock.tenant1 = tenant;

      done();
    });
  });

  it('pg-driver: create filter 1', done => {
    if (app.dbConnection.driverType !== pgDBDriverType) {
      return done();
    }
    app.dbConnection.get(dbTypes.bvdTenant, {
      query: queryParams.tenantQuery
    },
    (err, tenantDoc) => {
      if (err) {
        return done(err);
      }
      mock.filterData.tenantId = tenantDoc[0]._id;
      mock.filterData.hash = createFilterHash(mock.filterData.tenantId, mock.channel);

      app.dbConnection.create(dbTypes.filter, {}, mock.filterData,
        (err, result) => {
          if (err) {
            return done(err);
          }
          expect(result).to.exist;
          expect(result.name).to.equal(mock.filterData.name);
          expect(result.dashboardWidgetMap).to.exist;

          const keys = Object.keys(mock.filterData.dashboardWidgetMap);
          expect(result.dashboardWidgetMap[keys[0]].length === 1).to.equal(true);
          done();
        });
    });
  });

  it('pg-driver: create filter 2', done => {
    if (app.dbConnection.driverType !== pgDBDriverType) {
      return done();
    }
    app.dbConnection.get(dbTypes.bvdTenant, {
      query: queryParams.tenantQuery
    },
    (err, tenantDoc) => {
      if (err) {
        return done(err);
      }
      _.forEach(mock.filterDataArray, filterData => {
        filterData.tenantId = tenantDoc[0]._id;
        filterData.hash = createFilterHash(filterData.tenantId, mock.channel);
      });
      app.dbConnection.create(dbTypes.filter, {}, mock.filterDataArray,
        (err, result) => {
          if (err) {
            return done(err);
          }
          expect(result).to.exist;
          expect(result).to.be.instanceof(Array);
          expect(result).to.have.length(3);
          const filter = result[0];
          expect(filter.dashboardWidgetMap).to.exist;

          const keys = Object.keys(mock.filterData.dashboardWidgetMap);
          expect(filter.dashboardWidgetMap[keys[0]].length === 1).to.equal(true);
          done();
        });
    });
  });

  it('pg-driver: update filter', done => {
    if (app.dbConnection.driverType !== pgDBDriverType) {
      return done();
    }
    app.dbConnection.update(dbTypes.filter, {}, mock.filterUpdateObject,
      (err, result) => {
        if (err) {
          return done(err);
        }
        expect(result).to.exist;
        expect(result).to.be.instanceof(Array);
        expect(result).to.have.length(4);
        const filter = result[0];
        expect(filter.dashboardWidgetMap).to.exist;

        const keys = Object.keys(mock.filterUpdateObject.dashboardWidgetMap);
        expect(filter.dashboardWidgetMap[keys[0]].length === 2).to.equal(true);

        done();
      });
  });

  it('pg-driver: get filter 1', done => {
    if (app.dbConnection.driverType !== pgDBDriverType) {
      return done();
    }
    app.dbConnection.get(dbTypes.filter, {
      query: {}
    },
    (err, result) => {
      if (err) {
        return done(err);
      }
      expect(result).to.exist;
      expect(result).to.be.instanceof(Array);
      expect(result).to.have.length(4);
      done();
    });
  });

  it('pg-driver: remove filter', done => {
    if (app.dbConnection.driverType !== pgDBDriverType) {
      return done();
    }
    app.dbConnection.remove(dbTypes.filter, {
      query: {}
    }, (err, removedCount) => {
      if (err) {
        return done(err);
      }
      expect(removedCount).to.exist;
      expect(removedCount).to.equal(4);
      done();
    });
  });

  it('pg-driver: get filter 2', done => {
    if (app.dbConnection.driverType !== pgDBDriverType) {
      return done();
    }
    app.dbConnection.get(dbTypes.filter, {
      query: {}
    },
    (err, result) => {
      if (err) {
        return done(err);
      }
      expect(result).to.exist;
      expect(result).to.be.instanceof(Array);
      expect(result).to.have.length(0);
      done();
    });
  });

  it('pg-driver: create category 1', done => {
    if (app.dbConnection.driverType !== pgDBDriverType) {
      return done();
    }
    mock.category1Data.tenant = mock.tenant1._id;
    app.dbConnection.create(dbTypes.dashboardCategory, {}, mock.category1Data,
      (err, result) => {
        if (err) {
          return done(err);
        }
        expect(result).to.exist;
        expect(result.name).to.equal(mock.category1Data.name);
        expect(result.tenant).to.equal(mock.category1Data.tenant);
        expect(result._id).to.exist;
        expect(result._id).to.be.not.empty;
        expect(result.createdAt).to.exist;
        expect(result.updatedAt).to.exist;

        mock.category1 = result;

        done();
      });
  });

  it('pg-driver: create category 2', done => {
    if (app.dbConnection.driverType !== pgDBDriverType) {
      return done();
    }
    mock.category2Data.tenant = mock.tenant1._id;
    app.dbConnection.create(dbTypes.dashboardCategory, {}, mock.category2Data,
      (err, result) => {
        if (err) {
          return done(err);
        }
        expect(result).to.exist;
        expect(result.name).to.equal(mock.category2Data.name);
        expect(result.tenant).to.equal(mock.category2Data.tenant);
        expect(result._id).to.exist;
        expect(result._id).to.be.not.empty;
        expect(result.createdAt).to.exist;
        expect(result.updatedAt).to.exist;

        mock.category2 = result;

        done();
      });
  });

  it('pg-driver: get all categories 1', done => {
    if (app.dbConnection.driverType !== pgDBDriverType) {
      return done();
    }
    const populate = {
      propertyName: 'tenant',
      dbType: dbTypes.bvdTenant
    };
    app.dbConnection.get(dbTypes.dashboardCategory, {
      query: {},
      populate
    },
    (err, result) => {
      if (err) {
        return done(err);
      }
      expect(result).to.exist;
      expect(result).to.be.instanceof(Array);
      expect(result).to.have.length(2);

      const c1 = _.find(result, category => category._id === mock.category1._id);
      expect(c1).to.exist;

      const c2 = _.find(result, category => category._id === mock.category2._id);
      expect(c2).to.exist;

      expect(c2.dashboard).to.exist;
      expect(c2.dashboard).to.be.instanceof(Array);
      expect(c2.dashboard).to.have.length(0);

      done();
    });
  });

  it('pg-driver: create dashboard', done => {
    if (app.dbConnection.driverType !== pgDBDriverType) {
      return done();
    }
    app.dbConnection.get(dbTypes.bvdTenant, {
      query: queryParams.tenantQuery
    },
    (err, tenantDoc) => {
      if (err) {
        return done(err);
      }
      mock.dashboardData.tenantId = tenantDoc[0]._id;

      app.dbConnection.create(dbTypes.dashboard, {}, mock.dashboardData,
        (err, result) => {
          if (err) {
            return done(err);
          }
          expect(result).to.exist;
          expect(result.name.toLowerCase()).to.equal(mock.dashboardData.name.toLowerCase());
          expect(result.widgets.length > 0).to.equal(true);
          expect(result.widgets[0].widgetId).to.equal(mock.dashboardData.widgets[0].widgetId);
          expect(result.options.fit).to.equal(mock.dashboardData.options.fit);
          done();
        }
      );
    });
  });

  it('pg-driver: update dashboard', done => {
    if (app.dbConnection.driverType !== pgDBDriverType) {
      return done();
    }
    mock.dashboardUpdateObject.category = [mock.category1, mock.category2];
    app.dbConnection.update(dbTypes.dashboard, {
      query: queryParams.dashboardQuery
    }, mock.dashboardUpdateObject,
    (err, result) => {
      if (err) {
        return done(err);
      }
      expect(result).to.exist;
      expect(result).to.be.instanceof(Array);
      expect(result).to.have.length(1);
      const db = result[0];
      expect(db.dataChannel).to.equal(mock.dashboardUpdateObject.dataChannel);
      expect(db.category).to.exist;
      expect(db.category).to.be.instanceof(Array);
      expect(db.category).to.have.length(2);
      done();
    });
  });

  it('pg-driver: get dashboard 1',
    done => {
      if (app.dbConnection.driverType !== pgDBDriverType) {
        return done();
      }
      const populate = [{
        propertyName: 'tenantId',
        dbType: dbTypes.bvdTenant
      }];
      app.dbConnection.get(dbTypes.dashboard, {
        query: queryParams.dashboardQuery,
        populate
      },
      (err, result) => {
        if (err) {
          return done(err);
        }
        expect(result).to.exist;
        expect(result).to.be.instanceof(Array);
        expect(result).to.have.length(1);
        const db = result[0];
        expect(db.dataChannel).to.equal(mock.dashboardUpdateObject.dataChannel);
        expect(db.name).to.equal(mock.dashboardData.name);
        expect(db.title).to.equal(mock.dashboardData.title);
        expect(db.sortTitle).to.equal(mock.dashboardData.sortTitle.toLowerCase());
        expect(db.backgroundColor).to.equal(mock.dashboardData.backgroundColor);
        expect(db.defaultDashboard).to.equal(mock.dashboardData.defaultDashboard);
        expect(db.tenantId).to.exist;
        expect(db.tenantId.apiKey).to.equal(mock.tenantData.apiKey);
        expect(db.tenantId.name).to.equal(mock.tenantData.name);
        expect(db.tenantId.default).to.be.false;

        expect(db.category).to.exist;
        expect(db.category).to.be.instanceof(Array);
        expect(db.category).to.have.length(2);

        const c1 = _.find(db.category, category => category._id === mock.category1._id);
        expect(c1).to.exist;

        const c2 = _.find(db.category, category => category._id === mock.category2._id);
        expect(c2).to.exist;

        done();
      });
    });

  it('pg-driver: get all categories 2', done => {
    if (app.dbConnection.driverType !== pgDBDriverType) {
      return done();
    }
    const populate = {
      propertyName: 'tenant',
      dbType: dbTypes.bvdTenant
    };
    app.dbConnection.get(dbTypes.dashboardCategory, {
      query: {},
      populate
    },
    (err, result) => {
      if (err) {
        return done(err);
      }
      expect(result).to.exist;
      expect(result).to.be.instanceof(Array);
      expect(result).to.have.length(2);

      const c1 = _.find(result, category => category._id === mock.category1._id);
      expect(c1).to.exist;
      expect(c1.dashboard).to.exist;
      expect(c1.dashboard).to.be.instanceof(Array);
      expect(c1.dashboard).to.have.length(1);

      const c2 = _.find(result, category => category._id === mock.category2._id);
      expect(c2).to.exist;

      expect(c2.dashboard).to.exist;
      expect(c2.dashboard).to.be.instanceof(Array);
      expect(c2.dashboard).to.have.length(1);

      done();
    });
  });

  it('pg-driver: remove category 2', done => {
    if (app.dbConnection.driverType !== pgDBDriverType) {
      return done();
    }
    app.dbConnection.remove(dbTypes.dashboardCategory, {
      query: {
        name: mock.category2.name
      }
    },
    (err, removedCount) => {
      if (err) {
        return done(err);
      }
      expect(removedCount).to.exist;
      expect(removedCount).to.equal(1);
      done();
    });
  });

  it('pg-driver: get dashboard 2', done => {
    if (app.dbConnection.driverType !== pgDBDriverType) {
      return done();
    }
    const populate = [{
      propertyName: 'tenantId',
      dbType: dbTypes.bvdTenant
    }];
    app.dbConnection.get(dbTypes.dashboard, {
      query: queryParams.dashboardQuery,
      populate
    },
    (err, result) => {
      if (err) {
        return done(err);
      }
      expect(result).to.exist;
      expect(result).to.be.instanceof(Array);
      expect(result).to.have.length(1);
      const db = result[0];
      expect(db.category).to.exist;
      expect(db.category).to.be.instanceof(Array);
      expect(db.category).to.have.length(1);
      expect(db.category[0].name).to.eql(mock.category1.name);

      done();
    });
  });

  it('pg-driver: update category 1', done => {
    if (app.dbConnection.driverType !== pgDBDriverType) {
      return done();
    }
    const dashboardUpdateObject = {
      dashboard: []
    };
    app.dbConnection.update(dbTypes.dashboardCategory, {
      query: {
        name: mock.category1.name
      }
    }, dashboardUpdateObject,
    (err, result) => {
      if (err) {
        return done(err);
      }
      expect(result).to.exist;
      expect(result).to.be.instanceof(Array);
      expect(result).to.have.length(1);
      const category = result[0];
      expect(category.name).to.eql(mock.category1.name);
      expect(category.dashboard).to.exist;
      expect(category.dashboard).to.be.instanceof(Array);
      expect(category.dashboard).to.have.length(0);
      done();
    });
  });
});
