/* eslint-disable camelcase, node/no-process-env, node/global-require, no-unused-expressions */
const { randomUUID } = require('crypto');

describe('channelFilterController tests', () => {
  let app,
    tenantId1,
    tenantId2;
  const channel1 = 'testChannel1',
    channel2 = 'testChannel2';

  const tenant1Data = {
    name: randomUUID(),
    description: 'tenant description',
    apiKey: randomUUID().replace(/-/g, ''),
    default: false
  };

  const tenant2Data = {
    name: randomUUID(),
    description: 'tenant description',
    apiKey: randomUUID().replace(/-/g, ''),
    default: false
  };

  const dashboard1 = {
    tenantId: tenantId1,
    name: 'documentation.dd$dd',
    schemaVersion: 1,
    defaultDashboard: false,
    showInMenu: true,
    widgets: [{
      widgetId: 'shape87-51',
      opr_item_type: 'opr_update_color',
      opr_channel: 'cpu-status,dataChanged',
      schemaVersion: 1
    }, {
      widgetId: 'shape88-53',
      opr_item_type: 'opr_update_color',
      opr_channel: 'cpu-status,dataChanged',
      schemaVersion: 1
    }, {
      widgetId: 'group90-55',
      opr_item_type: 'opr_update_color',
      opr_channel: 'cpu-status,dataChanged',
      schemaVersion: 1
    }, {
      widgetId: 'shape91-76',
      opr_item_type: 'opr_update_text',
      opr_channel: 'cpu-status,dataChanged',
      opr_text_value: true,
      opr_text_color: false,
      schemaVersion: 1
    }, {
      widgetId: 'shape92-79',
      opr_item_type: 'opr_update_text',
      opr_channel: 'cpu-status,dataChanged',
      opr_text_value: true,
      opr_text_color: true,
      schemaVersion: 1
    }, {
      widgetId: 'shape93-82',
      opr_item_type: 'opr_update_text',
      opr_channel: 'cpu-status,dataChanged',
      opr_text_value: false,
      opr_text_color: true,
      schemaVersion: 1
    }, {
      widgetId: 'group96-86',
      opr_item_type: 'opr_update_images',
      opr_channel: 'cpu-status,dataChanged',
      opr_switch_default: 'grey',
      schemaVersion: 1
    }, {
      widgetId: 'group104-99',
      opr_item_type: 'opr_update_sparkline',
      opr_channel: 'cpu-status,dataChanged',
      opr_chart_max_value: 100,
      opr_chart_min_value: 0,
      opr_chart_auto_scale: false,
      opr_mouse_over: true,
      opr_chart_period: 10,
      schemaVersion: 1
    }, {
      widgetId: 'group108-109',
      opr_item_type: 'opr_update_sparkline',
      opr_channel: 'cpu-status,dataChanged',
      opr_chart_max_value: 100,
      opr_chart_min_value: 0,
      opr_chart_auto_scale: false,
      opr_mouse_over: true,
      opr_chart_period: 10,
      schemaVersion: 1
    }, {
      widgetId: 'shape126-118',
      opr_item_type: 'opr_update_feed',
      opr_channel: 'rss,newItem',
      opr_feed_max_items: 10,
      schemaVersion: 1
    }, {
      widgetId: 'shape136-143',
      opr_item_type: 'opr_update_url',
      opr_channel: 'http://www.tagesschau.de/templates/pages/multimedia/livestream_player.jsp&#10;',
      schemaVersion: 1
    }, {
      widgetId: 'group156-150',
      opr_item_type: 'opr_update_bar_chart',
      opr_channel: 'summary,dataChanged',
      opr_field: 'summaryvalue_1;summaryvalue_2;summaryvalue_3;summaryvalue_4;summaryvalue_5',
      opr_chart_max_value: 100,
      opr_chart_numbers: true,
      schemaVersion: 1
    }, {
      widgetId: 'group166-172',
      opr_item_type: 'opr_update_donut_gauge',
      opr_channel: 'cpu-status,dataChanged',
      opr_chart_max_value: 100,
      opr_chart_numbers: true,
      schemaVersion: 1
    }, {
      widgetId: 'group181-206',
      opr_item_type: 'opr_update_visibility',
      opr_channel: 'cpu-status,dataChanged',
      schemaVersion: 1
    }],
    opr_channel: ''
  };

  before(function(done) {
  /* set the timeout for mocha tests to 10sec */
    this.timeout(100000);
    const db = require('../helpers/db');
    db.cleanAll(err => {
      if (err) {
        return done(err);
      }
      app = app = require('../../../shared/app');

      app.controllers.bvdTenant.create(tenant1Data, (err, tenant1Doc) => {
        if (err) {
          return done(err);
        }
        tenantId1 = tenant1Doc._id.toString();
        dashboard1.tenantId = tenantId1;

        app.controllers.bvdTenant.create(tenant2Data, (err, tenant2Doc) => {
          if (err) {
            return done(err);
          }
          tenantId2 = tenant2Doc._id.toString();
          return done();
        });
      });
    });
  });

  after(function(done) {
  /* set the timeout for mocha tests to 10sec */
    this.timeout(100000);
    app.controllers.bvdTenant.remove({
      name: tenant1Data.name
    }, err => {
      if (err) {
        return done(err);
      }
      app.controllers.bvdTenant.remove({
        name: tenant2Data.name
      }, err => {
        if (err) {
          return done(err);
        }
        const db = require('../helpers/db');
        db.cleanAll(err => {
          if (err) {
            return done(err);
          }

          return done(); // tell mocha that the tear down code is finished
        });
      });
    });
  });

  it('channelFilterController unescape filter name', () => {
    const result = app.controllers.filters._forTesting.unescapeChannelName('cpu-status&#60;&#62;dataChanged');
    expect(result).equal('cpu-status<>dataChanged');
  });

  it('channelFilterController create 1', function(done) {
    this.timeout(3000); // Give this test 3 instead of 2 seconds to complete
    const dashboardWidgetMap = {
      documentation1: ['aa', 'bb']
    };
    app.controllers.filters.createOrUpdate(channel1, dashboardWidgetMap, tenantId1, (err, filter) => {
      if (err) {
        return done(err);
      }
      // as the filter map is filled via redis pub/sub, it takes a few milliseconds until
      // the created filter was added
      setTimeout(() => {
        const channelFilter = app.controllers.filters.get(channel1, tenantId1);
        expect(channelFilter).not.equal(undefined);
        expect(channelFilter.name).not.equal(undefined);
        expect(channelFilter.name).equal(filter.name);
        expect(channelFilter.name).equal(channel1);
        expect(channelFilter.tenantId).equal(tenantId1);
        expect(channelFilter.dashboardWidgetMap).not.equal(undefined);
        expect(channelFilter.dashboardWidgetMap.documentation1).not.equal(undefined);
        expect(channelFilter.dashboardWidgetMap.documentation1.length).equal(2);
        expect(channelFilter.dashboardWidgetMap.documentation1[0]).equal('aa');
        expect(channelFilter.dashboardWidgetMap.documentation1[1]).equal('bb');

        let all4Tenant = app.controllers.filters.getAll4Tenant('662049e7a671609c2604ff4e');
        expect(all4Tenant.length).equal(0);

        all4Tenant = app.controllers.filters.getAll4Tenant(tenantId1);
        expect(all4Tenant.length).equal(1);

        const all = app.controllers.filters.getAll();
        expect(all.length).equal(1);

        done();
      }, 2000);
    });
  });

  it('channelFilterController create 2', function(done) {
    this.timeout(3000); // Give this test 3 instead of 2 seconds to complete
    const dashboardWidgetMap = {
      documentation2: ['cc']
    };
    app.controllers.filters.createOrUpdate(channel2, dashboardWidgetMap, tenantId2, (err, filter) => {
      if (err) {
        return done(err);
      }
      // as the filter map is filled via redis pub/sub, it takes a few milliseconds until
      // the created filter was added
      setTimeout(() => {
        const channelFilter = app.controllers.filters.get(channel2, tenantId2);
        expect(channelFilter).not.equal(undefined);
        expect(channelFilter.name).not.equal(undefined);
        expect(channelFilter.name).equal(filter.name);
        expect(channelFilter.name).equal(channel2);
        expect(channelFilter.tenantId).equal(tenantId2);
        expect(channelFilter.dashboardWidgetMap).not.equal(undefined);
        expect(channelFilter.dashboardWidgetMap.documentation2).not.equal(undefined);
        expect(channelFilter.dashboardWidgetMap.documentation2.length).equal(1);
        expect(channelFilter.dashboardWidgetMap.documentation2[0]).equal('cc');

        let all4Tenant = app.controllers.filters.getAll4Tenant('772049e7a671609c2604ff4e');
        expect(all4Tenant.length).equal(0);

        all4Tenant = app.controllers.filters.getAll4Tenant(tenantId1);
        expect(all4Tenant.length).equal(1);

        all4Tenant = app.controllers.filters.getAll4Tenant(tenantId2);
        expect(all4Tenant.length).equal(1);

        const all = app.controllers.filters.getAll();
        expect(all.length).equal(2);

        done();
      }, 1500);
    });
  });

  it('channelFilterController update 1', function(done) {
    this.timeout(3000); // Give this test 3 instead of 2 seconds to complete
    const channelFilter = app.controllers.filters.get(channel2, tenantId2);
    expect(channelFilter).not.equal(undefined);
    expect(channelFilter.name).not.equal(undefined);
    expect(channelFilter.name).equal(channel2);
    expect(channelFilter.tenantId).equal(tenantId2);
    expect(channelFilter.dashboardWidgetMap).not.equal(undefined);
    expect(channelFilter.dashboardWidgetMap.documentation2).not.equal(undefined);
    expect(channelFilter.dashboardWidgetMap.documentation2.length).equal(1);
    expect(channelFilter.dashboardWidgetMap.documentation2[0]).equal('cc');

    const dashboardWidgetMap = channelFilter.dashboardWidgetMap;
    dashboardWidgetMap.documentation3 = ['dd', 'ee'];

    app.controllers.filters.createOrUpdate(channel2, dashboardWidgetMap, tenantId2, (err, filter) => {
      if (err) {
        return done(err);
      }
      // as the filter map is filled via redis pub/sub, it takes a few milliseconds until
      // the created filter was added
      setTimeout(() => {
        const channel2Filter = app.controllers.filters.get(channel2, tenantId2);
        expect(channel2Filter).not.equal(undefined);
        expect(channel2Filter.name).not.equal(undefined);
        expect(channel2Filter.name).equal(filter.name);
        expect(channel2Filter.name).equal(channel2);
        expect(channel2Filter.tenantId).to.eql(tenantId2);

        expect(channel2Filter.dashboardWidgetMap).not.equal(undefined);
        expect(channel2Filter.dashboardWidgetMap.documentation2).not.equal(undefined);
        expect(channel2Filter.dashboardWidgetMap.documentation2.length).equal(1);
        expect(channel2Filter.dashboardWidgetMap.documentation2[0]).equal('cc');

        expect(channel2Filter.dashboardWidgetMap.documentation3).not.equal(undefined);
        expect(channel2Filter.dashboardWidgetMap.documentation3.length).equal(2);
        expect(channel2Filter.dashboardWidgetMap.documentation3[0]).equal('dd');
        expect(channel2Filter.dashboardWidgetMap.documentation3[1]).equal('ee');

        let all4Tenant = app.controllers.filters.getAll4Tenant('772049e7a671609c2604ff4e');
        expect(all4Tenant.length).equal(0);

        all4Tenant = app.controllers.filters.getAll4Tenant(tenantId1);
        expect(all4Tenant.length).equal(1);

        all4Tenant = app.controllers.filters.getAll4Tenant(tenantId2);
        expect(all4Tenant.length).equal(1);

        const all = app.controllers.filters.getAll();
        expect(all.length).equal(2);

        done();
      }, 2000);
    });
  });

  it('channelFilterController update 2', function(done) {
    this.timeout(3000); // Give this test 3 instead of 2 seconds to complete
    const channelFilter = app.controllers.filters.get(channel2, tenantId2);
    expect(channelFilter).not.equal(undefined);
    expect(channelFilter.name).not.equal(undefined);
    expect(channelFilter.name).equal(channel2);
    expect(channelFilter.tenantId).equal(tenantId2);

    expect(channelFilter.dashboardWidgetMap).not.equal(undefined);
    expect(channelFilter.dashboardWidgetMap.documentation2).not.equal(undefined);
    expect(channelFilter.dashboardWidgetMap.documentation2.length).equal(1);
    expect(channelFilter.dashboardWidgetMap.documentation2[0]).equal('cc');

    expect(channelFilter.dashboardWidgetMap.documentation3).not.equal(undefined);
    expect(channelFilter.dashboardWidgetMap.documentation3.length).equal(2);
    expect(channelFilter.dashboardWidgetMap.documentation3[0]).equal('dd');
    expect(channelFilter.dashboardWidgetMap.documentation3[1]).equal('ee');

    const dashboardWidgetMap = channelFilter.dashboardWidgetMap;
    delete dashboardWidgetMap.documentation2;
    dashboardWidgetMap.documentation3 = ['dd'];

    app.controllers.filters.createOrUpdate(channel2, dashboardWidgetMap, tenantId2, (err, filter) => {
      if (err) {
        return done(err);
      }
      // as the filter map is filled via redis pub/sub, it takes a few milliseconds until
      // the created filter was added
      setTimeout(() => {
        const channel2Filter = app.controllers.filters.get(channel2, tenantId2);
        expect(channel2Filter).not.equal(undefined);
        expect(channel2Filter.name).not.equal(undefined);
        expect(channel2Filter.name).equal(filter.name);
        expect(channel2Filter.name).equal(channel2);
        expect(channel2Filter.tenantId).equal(tenantId2);

        expect(channel2Filter.dashboardWidgetMap).not.equal(undefined);
        expect(channel2Filter.dashboardWidgetMap.documentation2).equal(undefined);

        expect(channel2Filter.dashboardWidgetMap.documentation3).not.equal(undefined);
        expect(channel2Filter.dashboardWidgetMap.documentation3.length).equal(1);
        expect(channel2Filter.dashboardWidgetMap.documentation3[0]).equal('dd');

        let all4Tenant = app.controllers.filters.getAll4Tenant('772049e7a671609c2604ff4e');
        expect(all4Tenant.length).equal(0);

        all4Tenant = app.controllers.filters.getAll4Tenant(tenantId1);
        expect(all4Tenant.length).equal(1);

        all4Tenant = app.controllers.filters.getAll4Tenant(tenantId2);
        expect(all4Tenant.length).equal(1);

        const all = app.controllers.filters.getAll();
        expect(all.length).equal(2);

        done();
      }, 2000);
    });
  });

  it('channelFilterController update 3', function(done) {
    this.timeout(3000); // Give this test 3 instead of 2 seconds to complete
    const filter = app.controllers.filters.get(channel2, tenantId2);
    expect(filter).not.equal(undefined);
    expect(filter.name).not.equal(undefined);
    expect(filter.name).equal(channel2);
    expect(filter.tenantId).equal(tenantId2);

    expect(filter.dashboardWidgetMap).not.equal(undefined);
    expect(filter.dashboardWidgetMap.documentation2).equal(undefined);

    expect(filter.dashboardWidgetMap.documentation3).not.equal(undefined);
    expect(filter.dashboardWidgetMap.documentation3.length).equal(1);
    expect(filter.dashboardWidgetMap.documentation3[0]).equal('dd');

    let dashboardWidgetMap;
    app.controllers.filters.createOrUpdate(channel2, dashboardWidgetMap, tenantId2, err => {
      if (err) {
        return done(err);
      }
      // as the filter map is filled via redis pub/sub, it takes a few milliseconds until
      // the created filter was added
      setTimeout(() => {
        const fil = app.controllers.filters.get(channel2, tenantId2);
        expect(fil).equal(undefined);

        let all4Tenant = app.controllers.filters.getAll4Tenant('772049e7a671609c2604ff4e');
        expect(all4Tenant.length).equal(0);

        all4Tenant = app.controllers.filters.getAll4Tenant(tenantId1);
        expect(all4Tenant.length).equal(1);

        all4Tenant = app.controllers.filters.getAll4Tenant(tenantId2);
        expect(all4Tenant.length).equal(0);

        const all = app.controllers.filters.getAll();
        expect(all.length).equal(1);

        done();
      }, 2000);
    });
  });

  it('channelFilterController remove', function(done) {
    this.timeout(3000); // Give this test 3 instead of 2 seconds to complete
    const filter = app.controllers.filters.get(channel1, tenantId1);
    expect(filter).not.equal(undefined);
    expect(filter.name).not.equal(undefined);
    expect(filter.name).equal(channel1);
    expect(filter.tenantId).equal(tenantId1);

    app.controllers.filters.remove(channel1, tenantId1, err => {
      if (err) {
        return done(err);
      }
      // as the filter map is filled via redis pub/sub, it takes a few milliseconds until
      // the removed filter was really removed from the map
      setTimeout(() => {
        const fil = app.controllers.filters.get(channel1, tenantId1);
        expect(fil).equal(undefined);

        const all4Tenant = app.controllers.filters.getAll4Tenant(tenantId1);
        expect(all4Tenant.length).equal(0);

        const all = app.controllers.filters.getAll();
        expect(all.length).equal(0);
        done();
      }, 2000);
    });
  });

  it('channelFilterController dashboard save', function(done) {
    this.timeout(3000); // Give this test 3 instead of 2 seconds to complete
    const all4Tenant = app.controllers.filters.getAll4Tenant(tenantId1);
    expect(all4Tenant.length).equal(0);

    const all = app.controllers.filters.getAll();
    expect(all.length).equal(0);

    app.controllers.filters.updateFilters4Dashboard(dashboard1.name, [dashboard1], dashboard1.tenantId, true, err => {
      if (err) {
        return done(err);
      }
      // as the filter map is filled via redis pub/sub, it takes a few milliseconds until
      // the removed filter was really removed from the map
      setTimeout(() => {
        const allForTenant = app.controllers.filters.getAll4Tenant(tenantId1);
        expect(allForTenant.length).equal(3);

        const allFilter = app.controllers.filters.getAll();
        expect(allFilter.length).equal(3);

        done();
      }, 2000);
    });
  });

  it('channelFilterController dashboard update', function(done) {
    this.timeout(3000); // Give this test 3 instead of 2 seconds to complete
    const all4Tenant = app.controllers.filters.getAll4Tenant(tenantId1);
    expect(all4Tenant.length).equal(3);

    const all = app.controllers.filters.getAll();
    expect(all.length).equal(3);

    app.controllers.filters.removeFilters4Dashboard(dashboard1.name, dashboard1.tenantId, err => {
      if (err) {
        return done(err);
      }
      app.controllers.filters.updateFilters4Dashboard(dashboard1.name, [dashboard1], dashboard1.tenantId, false, err => {
        if (err) {
          return done(err);
        }
        // as the filter map is filled via redis pub/sub, it takes a few milliseconds until
        // the removed filter was really removed from the map
        setTimeout(() => {
          const allForTenant = app.controllers.filters.getAll4Tenant(tenantId1);
          expect(allForTenant.length).equal(3);

          const allFilter = app.controllers.filters.getAll();
          expect(allFilter.length).equal(3);

          done();
        }, 2000);
      });
    });
  });

  it('channelFilterController dashboard remove', function(done) {
    this.timeout(4000); // Give this test 4 instead of 2 seconds to complete
    const all4Tenant = app.controllers.filters.getAll4Tenant(tenantId1);
    expect(all4Tenant.length).equal(3);

    const all = app.controllers.filters.getAll();
    expect(all.length).equal(3);

    app.controllers.filters.removeFilters4Dashboard(dashboard1.name, dashboard1.tenantId, err => {
      if (err) {
        return done(err);
      }
      // as the filter map is filled via redis pub/sub, it takes a few milliseconds until
      // the removed filter was really removed from the map
      setTimeout(() => {
        const allForTenant = app.controllers.filters.getAll4Tenant(tenantId1);
        expect(allForTenant.length).equal(0);

        const allFilter = app.controllers.filters.getAll();
        expect(allFilter.length).equal(0);

        done();
      }, 2000);
    });
  });
});
