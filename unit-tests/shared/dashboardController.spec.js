/* eslint-disable node/no-sync */
/* eslint-disable node/global-require */
/* eslint-disable camelcase */
const _ = require('lodash');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');
const sinon = require('sinon');
const { decodeDashboardProperty } = require('../../../shared/utils/svg');

describe('dashboardController tests', () => {
  const mock = {
    dashboardName: 'test-dashboard',

    dashboardCreateObject: {
      widgets: [{
        widgetId: 'test-create-widget-id',
        opr_channel: 'test-channel'
      }]
    },

    dashboardFile: {
      originalname: 'test-documentation.svg',
      path: path.resolve(__dirname, '../test-files/test-documentation.svg'),
      mimetype: 'image/svg+xml'
    },

    testDashboardFile: {
      originalname: 'test-dashboard-export.svg',
      path: path.resolve(__dirname, '../test-files/test-dashboard-export.svg'),
      mimetype: 'image/svg+xml'
    },

    testDashboardShowInMenuFile: {
      originalname: 'test-dashboard-export-show-in-menu.svg',
      path: path.resolve(__dirname, '../test-files/test-dashboard-export-show-in-menu.svg'),
      mimetype: 'image/svg+xml'
    },

    testDashboardScalingFile: {
      originalname: 'test-dashboard-export-scaling.svg',
      path: path.resolve(__dirname, '../test-files/test-dashboard-export-scaling.svg'),
      mimetype: 'image/svg+xml'
    },

    newTenantParams: {
      tenantCompany: 'test-company',
      adminUserEmail: 'testUser@testCompany.com',
      adminUserPassword: 'testPassword123!',
      noDashboardImport: true
    },

    dashboardUpdateObject: {
      __v: 0,
      schemaVersion: 1,
      defaultDashboard: false,
      showInMenu: true,
      widgets: [{
        opr_item_type: 'opr_update_color',
        opr_channel: 'cpu-status<>dataChanged<>TEST'
      }],
      dataChannel: '',
      svgFile: '{}'
    },

    widgetPropertyTest: {
      widgetPropertyName: 'opr_item_type'
    },

    replaceSvgFiles: {
      jsonFile: path.resolve(__dirname, '../test-files/replace-svg-test.json'),
      svgFile: {
        path: path.resolve(__dirname, '../test-files/replace-svg-test-documentation.svg'),
        originalname: 'replace-svg-test-documentation'
      }
    },

    templateCreateObject: {
      name: 'test-template',
      title: 'test-template-title',
      widgets: [{
        widgetId: 'test-template-widget-id',
        opr_channel: 'd1<>NewYork<>d2<>5'
      }],
      svgFile: {
        contentType: 'image/svg+xml',
        data: '<?xml version="1.0" encoding="UTF-8" standalone="no"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd"><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:ev="http://www.w3.org/2001/xml-events" xmlns:v="http://schemas.microsoft.com/visio/2003/SVGExtensions/" width="11.2307in" height="7.48365in" viewBox="0 0 808.607 538.823" xml:space="preserve" color-interpolation-filters="sRGB" class="st48" preserveAspectRatio="xMidYMin"><g><a class="ddown" xlink:href="#/show/documentation1"><g id="test-template-widget-id" transform="translate(181.071,-422.171)" opr_dashboard_item="1" opr_item_type="opr_update_color" opr_channel="d1&#60;&#62;Berlin&#60;&#62;d2&#60;&#62;7"><path d="M0 507.87 A30.9541 30.9541 0 0 1 61.91 507.87 A30.9541 30.9541 0 1 1 0 507.87 Z" class="st11"/></g></a></g></svg>'
      }
    },

    templateUpdateObject: {
      name: 'test-template',
      widgets: [{
        widgetId: 'test-template-widget-id',
        opr_channel: 'd1<>NewYork<>d2<>5',
        opr_channel_vars: [null, 'location', null, 'floor']
      }],
      variables: ['location', 'floor']
    },

    templateVariables: ['location', 'floor'],

    templateVariablesUpdateObj: {
      name: 'test-template',
      widgets: [],
      variables: ['location', 'address', 'houseNo']
    },

    instanceObj: {
      variables: {
        location: 'Belgrade',
        floor: 16
      },
      title: 'second'
    }
  };
  let app,
    tenantId;

  function prepareMocks() {
    mock.dashboardCreateObject.tenantId = tenantId;
    mock.dashboardCreateObject.name = mock.dashboardName;

    mock.templateCreateObject.tenantId = tenantId;

    mock.dashboardUpdateObject.tenantId = tenantId;
    mock.dashboardUpdateObject.name = mock.dashboardName;
    mock.dashboardUpdateObject.widgets[0].widgetId = mock.dashboardCreateObject.widgets[0].widgetId;

    mock.widgetPropertyTest.dashboardName = mock.dashboardName;
    mock.widgetPropertyTest.widgetId = mock.dashboardCreateObject.widgets[0].widgetId;

    mock.dashboardUpdateObject.category = ['a', 'bb', 'ccc'].join(';');
  }

  before(function(done) {
  /* set the timeout for mocha tests to 10sec */
    this.timeout(100000);
    const db = require('../helpers/db');

    db.cleanAll(err => {
      if (err) {
        return done(err);
      }
      app = require('../../../shared/app');

      app.controllers.bvdTenant.createNewTenant(mock.newTenantParams, err => {
        if (err) {
          return done(err);
        }
        app.controllers.bvdTenant.findTenantInDB({
          name: mock.newTenantParams.tenantCompany
        }, (err, newTenant) => {
          if (err) {
            return done(err);
          }
          if (newTenant) {
            tenantId = newTenant._id;
            prepareMocks();

            return done();
          }

          return done(new Error('Test tenant not created.'));
        });
      });
    });
  });

  after(function(done) {
  /* set the timeout for mocha tests to 10sec */
    this.timeout(100000);
    app.controllers.bvdTenant.remove({
      name: mock.newTenantParams.tenantCompany
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

  it('dashboardController: create dashboard', done => {
    app.controllers.dashboard.create(mock.dashboardCreateObject, {}, (err, dashboardDoc) => {
      if (err) {
        return done(err);
      }

      expect(dashboardDoc).not.equal(undefined);
      expect(dashboardDoc).not.equal(null);
      expect(dashboardDoc.name).to.equal(mock.dashboardCreateObject.name);
      expect(dashboardDoc.widgets).to.be.a('Array');
      expect(dashboardDoc.widgets.length > 0).equal(true);
      expect(dashboardDoc.category).to.be.a('Array');

      return done();
    });
  });

  it('dashboardController: upload dashboard', done => {
    app.controllers.dashboard.upload(true, mock.dashboardFile, tenantId, (err, dashboardDoc) => {
      if (err) {
        return done(err);
      }

      expect(dashboardDoc).not.equal(undefined);
      expect(dashboardDoc).not.equal(null);
      expect(dashboardDoc.name).to.equal(mock.dashboardFile.originalname.substring(0, mock.dashboardFile.originalname.length - 4));

      return done();
    });
  });

  it('dashboardController: upload dashboard, testing rules and custom properties', done => {
    app.controllers.dashboard.upload(true, mock.testDashboardFile, tenantId, (err, dashboardDoc) => {
      if (err) {
        return done(err);
      }

      expect(dashboardDoc).not.equal(undefined);
      expect(dashboardDoc).not.equal(null);
      expect(dashboardDoc.name).to.equal(mock.testDashboardFile.originalname.substring(0, mock.testDashboardFile.originalname.length - 4));

      return done();
    });
  });

  it('dashboardController: upload dashboard', done => {
    app.controllers.dashboard.upload(true, mock.testDashboardShowInMenuFile, tenantId, (err, dashboardDoc) => {
      if (err) {
        return done(err);
      }

      expect(dashboardDoc).not.equal(undefined);
      expect(dashboardDoc).not.equal(null);
      expect(dashboardDoc.name).to.equal(mock.testDashboardShowInMenuFile.originalname.substring(0, mock.testDashboardShowInMenuFile.originalname.length - 4));

      return done();
    });
  });

  it('dashboardController: upload dashboard, options property', done => {
    app.controllers.dashboard.upload(true, mock.testDashboardScalingFile, tenantId, (err, dashboardDoc) => {
      if (err) {
        return done(err);
      }

      expect(dashboardDoc).not.equal(undefined);
      expect(dashboardDoc).not.equal(null);
      expect(typeof dashboardDoc.options).to.equal('object');
      expect(dashboardDoc.name).to.equal(mock.testDashboardScalingFile.originalname.substring(0, mock.testDashboardScalingFile.originalname.length - 4));

      return done();
    });
  });

  it('dashboardController: export dashboard, test for show in menu properties if set to true', done => {
    const testDashboardName = mock.testDashboardFile.originalname.substring(0, mock.testDashboardFile.originalname.length - 4);

    app.controllers.dashboard.exportDashboard(testDashboardName, tenantId, (err, testDashboardSvg) => {
      if (err) {
        return done(err);
      }
      expect(testDashboardSvg).not.equal(undefined);
      expect(testDashboardSvg).not.equal(null);

      const svgDOM = cheerio.load(testDashboardSvg, {
        decodeEntities: false,
        xmlMode: true
      });

      expect(svgDOM).not.equal(null);
      const svgElement = svgDOM('svg').first();

      // testing the show in menu property
      expect(svgElement.attr('opr_dashboard_show_in_menu')).to.equal('true');

      return done();
    });
  });

  it('dashboardController: get one dashboard', done => {
    app.controllers.dashboard.getOne({
      name: mock.dashboardName,
      tenantId
    }, (err, dashboardDoc) => {
      if (err) {
        return done(err);
      }
      expect(dashboardDoc).not.equal(undefined);
      expect(dashboardDoc).not.equal(null);
      expect(dashboardDoc.name).to.equal(mock.dashboardName);

      return done();
    });
  });

  it('dashboardController: export dashboard', done => {
    const dashboardName = mock.dashboardFile.originalname.substring(0, mock.dashboardFile.originalname.length - 4);

    app.controllers.dashboard.exportDashboard(dashboardName, tenantId, (err, dashboardSvg) => {
      if (err) {
        return done(err);
      }
      expect(dashboardSvg).not.equal(undefined);
      expect(dashboardSvg).not.equal(null);

      const svgDOM = cheerio.load(dashboardSvg, {
        decodeEntities: false,
        xmlMode: true
      });

      expect(svgDOM).not.equal(null);
      const svgElement = svgDOM('svg').first();

      expect(svgElement.attr('opr_dashboard_title')).to.equal(dashboardName);
      expect(svgElement.attr('fileId')).not.equal(undefined);
      expect(svgElement.attr('opr_template_variables')).to.equal(undefined);

      /* there must be no instances */
      expect(svgDOM('instances').length).to.equal(0);

      expect(svgDOM('g').first().attr('opr_background')).to.equal('bg');

      /* validate one widget */
      const groupElement = svgDOM('#group156');

      expect(groupElement.attr('opr_bar_numbers')).to.equal('1');
      expect(groupElement.attr('opr_channel')).to.equal('summary&lt;&gt;dataChanged');
      expect(groupElement.attr('opr_chart_max_value')).to.equal('100');
      expect(groupElement.attr('opr_chart_numbers')).to.equal('opr_true');
      expect(groupElement.attr('opr_dashboard_item')).to.equal('1');
      expect(groupElement.attr('opr_field')).to.equal('summaryvalue_1&#x3b;summaryvalue_2&#x3b;summaryvalue_3&#x3b;summaryvalue_4&#x3b;summaryvalue_5');
      expect(groupElement.attr('opr_item_type')).to.equal('opr_update_bar_chart');

      /* check count of widgets */
      expect(svgDOM('[opr_dashboard_item=\'1\']').length).to.equal(17);

      return done();
    });
  });

  it('dashboardController: export dashboard, testing rules', done => {
    const testDashboardName = mock.testDashboardFile.originalname.substring(0, mock.testDashboardFile.originalname.length - 4);

    app.controllers.dashboard.exportDashboard(testDashboardName, tenantId, (err, testDashboardSvg) => {
      if (err) {
        return done(err);
      }
      expect(testDashboardSvg).not.equal(undefined);
      expect(testDashboardSvg).not.equal(null);

      const svgDOM = cheerio.load(testDashboardSvg, {
        decodeEntities: false,
        xmlMode: true
      });

      expect(svgDOM).not.equal(null);
      const svgElement = svgDOM('svg').first();

      expect(svgElement.attr('opr_dashboard_title')).to.equal(testDashboardName);

      let groupElement = svgDOM('#group1746').children('#shape1747');

      // Testing the coloring and visibility rule
      expect(groupElement.attr('opr_visibility_rule')).to.equal('Performance&gt;10');
      expect(groupElement.attr('opr_coloring_rule')).to.equal('&#x23;0073E7&#x3a;Performance&lt;30&#x3b;&#x23;AABBCC&#x3a;Performance&lt;60&#x3b;&#x23;00ff00');

      groupElement = svgDOM('#group1754').children('#shape1755');
      expect(groupElement.attr('opr_calculation_rule')).to.equal('&#x28;Performance&#x2b;10&#x29;&gt;&#x3d;50');

      expect(svgDOM('[opr_dashboard_item=\'1\']').length).to.equal(7);

      return done();
    });
  });

  it('dashboardController: export dashboard, testing custom properties', done => {
    const testDashboardName = mock.testDashboardFile.originalname.substring(0, mock.testDashboardFile.originalname.length - 4);

    app.controllers.dashboard.exportDashboard(testDashboardName, tenantId, (err, testDashboardSvg) => {
      if (err) {
        return done(err);
      }
      expect(testDashboardSvg).not.equal(undefined);
      expect(testDashboardSvg).not.equal(null);

      const svgDOM = cheerio.load(testDashboardSvg, {
        decodeEntities: false,
        xmlMode: true
      });

      expect(svgDOM).not.equal(null);
      const svgElement = svgDOM('svg').first();

      expect(svgElement.attr('opr_dashboard_title')).to.equal(testDashboardName);

      const groupElement = svgDOM('#group1894');

      // Testing custom properties and their values
      expect(groupElement.attr('bvd_legend')).to.equal('opr_true');
      expect(groupElement.attr('bvd_stack')).to.equal('opr_false');
      expect(groupElement.attr('bvd_time')).to.equal('10');
      expect(groupElement.attr('bvd_date_time_format')).to.equal('hh&#x3a;mm');

      expect(svgDOM('[opr_dashboard_item=\'1\']').length).to.equal(7);

      return done();
    });
  });

  it('dashboardController: export dashboard, testing categories exported', done => {
    const testDashboardName = mock.testDashboardFile.originalname.substring(0, mock.testDashboardFile.originalname.length - 4);

    app.controllers.dashboard.exportDashboard(testDashboardName, tenantId, (err, testDashboardSvg) => {
      if (err) {
        return done(err);
      }
      expect(testDashboardSvg).not.equal(undefined);
      expect(testDashboardSvg).not.equal(null);

      const svgDOM = cheerio.load(testDashboardSvg, {
        decodeEntities: false,
        xmlMode: true
      });

      expect(svgDOM).not.equal(null);
      expect(svgDOM('opr_dashboard_categories').length).equal(1);
      expect(svgDOM('category').length).equal(1);
      expect(svgDOM('category')[0].children[0].data).equal('Alpha; Gamma');

      return done();
    });
  });

  it('dashboardController: export dashboard, testing options exported', done => {
    const testDashboardName = mock.testDashboardScalingFile.originalname.substring(0, mock.testDashboardScalingFile.originalname.length - 4);

    app.controllers.dashboard.exportDashboard(testDashboardName, tenantId, (err, testDashboardSvg) => {
      if (err) {
        return done(err);
      }
      expect(testDashboardSvg).not.equal(undefined);
      expect(testDashboardSvg).not.equal(null);

      const svgDOM = cheerio.load(testDashboardSvg, {
        decodeEntities: false,
        xmlMode: true
      });

      expect(svgDOM).not.equal(null);
      expect(svgDOM('opr_dashboard_options').length).equal(1);
      expect(JSON.parse(decodeDashboardProperty(svgDOM('opr_dashboard_options')[0].children[0].data)).fit).equal('width');

      return done();
    });
  });

  it('dashboardController: update one dashboard', done => {
    app.controllers.dashboard.update(mock.dashboardUpdateObject, {}, tenantId, null, (err, dashboardDoc) => {
      if (err) {
        return done(err);
      }

      expect(dashboardDoc).not.equal(undefined);
      expect(dashboardDoc).not.equal(null);
      expect(dashboardDoc[0].name).equal(mock.dashboardName);
      expect(dashboardDoc[0].category).to.be.a('Array');
      expect(dashboardDoc[0].category.length === 3).to.equal(true);

      const widget = _.find(dashboardDoc[0].widgets, widgetItem => widgetItem.widgetId === mock.dashboardUpdateObject.widgets[0].widgetId);

      expect(widget).not.equal(undefined);
      expect(widget).not.equal(null);
      expect(widget.opr_channel).equal(mock.dashboardUpdateObject.widgets[0].opr_channel);

      return done();
    });
  });

  it('dashboardController: get all dashboards', done => {
    app.controllers.dashboard.getList({
      tenantId
    }, (err, dashboardDocs) => {
      if (err) {
        return done(err);
      }
      expect(dashboardDocs).not.equal(undefined);
      expect(dashboardDocs).not.equal(null);
      expect(dashboardDocs).to.be.a('Array');
      expect(dashboardDocs.length > 0).equal(true);

      return done();
    });
  });

  it('dashboardController: replace SVG file', done => {
    const fileContents = fs.readFileSync(mock.replaceSvgFiles.jsonFile, {
      encoding: 'utf8'
    });

    mock.dashboardUpdateObject = JSON.parse(fileContents);

    app.controllers.dashboard.update(mock.dashboardUpdateObject, {}, tenantId, null, (err, updatedDoc) => {
      if (err) {
        return done(err);
      }

      expect(updatedDoc[0].title).equal('documentation-test');

      return done();
    });
  });

  it('dashboardController: get one dashboard (with categories)', done => {
    app.controllers.dashboard.getOne({
      name: mock.dashboardName,
      tenantId,
      categories: true
    }, (err, dashboardDoc) => {
      if (err) {
        return done(err);
      }
      expect(dashboardDoc).to.exist;
      expect(dashboardDoc.name).to.equal(mock.dashboardName);
      expect(dashboardDoc.category).to.exist;
      expect(dashboardDoc.category.length).to.equal(3);

      return done();
    });
  });

  it('dashboardController: transform dashboard to template', done => {
    app.controllers.dashboard.create(mock.templateCreateObject, {}, (err, wannabeTemplateDoc) => {
      if (err) {
        return done(err);
      }
      expect(wannabeTemplateDoc).not.equal(undefined);
      expect(wannabeTemplateDoc).not.equal(null);
      expect(wannabeTemplateDoc.name).to.equal(mock.templateCreateObject.name);
      expect(wannabeTemplateDoc.title).to.equal(mock.templateCreateObject.title);
      expect(wannabeTemplateDoc.widgets).to.be.a('Array');
      expect(wannabeTemplateDoc.widgets.length > 0).equal(true);

      // make a stub for statsController.getChannelStats()
      const stubGetChannelStats = sinon.stub(app.controllers.stats, 'getChannelStats');

      stubGetChannelStats.yields(null, {
        dims: 'd1,location,d2,floor',
        lastPayload: {},
        lastSeen: new Date()
      });

      app.controllers.dashboard.update(mock.templateUpdateObject, {}, tenantId, null, (err, dashboard) => {
        stubGetChannelStats.restore();

        if (err) {
          return done(err);
        }
        const templateDoc = dashboard[0],
          templateInstances = dashboard[1];

        expect(templateDoc).not.equal(undefined);
        expect(templateDoc).not.equal(null);
        expect(templateDoc.widgets).to.be.a('Array');
        expect(templateDoc.widgets.length > 0).equal(true);
        expect(templateDoc.widgets[0].opr_channel_vars).not.equal(undefined);
        expect(templateDoc.widgets[0].opr_channel_vars).not.equal(null);
        expect(templateDoc.widgets[0].opr_channel_vars).to.be.a('Array');
        expect(templateDoc.widgets[0].opr_channel_vars.length).to.equal(4);

        /* verify first instance */
        expect(templateInstances).to.be.a('Array');
        expect(templateInstances.length === 1).equal(true);
        expect(templateInstances[0]).not.equal(undefined);
        expect(templateInstances[0]).not.equal(null);
        expect(templateInstances[0].title).to.equal(
          'Automatically created dashboard instance (test-template-title template)'
        );
        expect(templateInstances[0].templateId.toString()).to.equal(templateDoc._id.toString());
        expect(_.isEmpty(templateInstances[0].variables.location)).to.equal(true);

        return done();
      });
    });
  });

  it('dashboardController: create dashboard template instance', done => {
    app.controllers.dashboard.updateTemplateInstances(mock.templateCreateObject.name, [], mock.instanceObj, false, tenantId, err => {
      if (err) {
        return done(err);
      }
      app.controllers.dashboard.getTemplateInstances(mock.templateCreateObject.name, tenantId, (err, instanceDocs) => {
        if (err) {
          return done(err);
        }
        expect(instanceDocs).to.be.a('Array');
        expect(instanceDocs.length === 2).equal(true);
        const instanceDoc = _.filter(instanceDocs, doc => doc.title.toLowerCase().indexOf('automatically') >= 0);

        expect(instanceDoc).to.be.a('Array');
        expect(instanceDoc.length === 1).equal(true);
        expect(instanceDoc[0]).not.equal(undefined);
        expect(instanceDoc[0]).not.equal(null);
        expect(instanceDoc[0].name).equal(instanceDoc[0]._id.toString());
        expect(instanceDoc[0].variables).not.equal(undefined);
        expect(instanceDoc[0].variables).not.equal(null);
        expect(instanceDoc[0].variables.location).not.equal(null);
        expect(instanceDoc[0].variables.location).not.equal(undefined);
        expect(instanceDoc[0].variables.floor).not.equal(null);
        expect(instanceDoc[0].variables.floor).not.equal(undefined);

        return done();
      });
    });
  });

  it('dashboardController: export dashboard template', done => {
    const dashboardName = mock.templateCreateObject.name;

    app.controllers.dashboard.exportDashboard(dashboardName, tenantId, (err, dashboardSvg) => {
      if (err) {
        return done(err);
      }
      expect(dashboardSvg).not.equal(undefined);
      expect(dashboardSvg).not.equal(null);

      const svgDOM = cheerio.load(dashboardSvg, {
        decodeEntities: false,
        xmlMode: true
      });

      expect(svgDOM).not.equal(null);
      const svgElement = svgDOM('svg').first();

      expect(svgElement.attr('opr_dashboard_title')).to.equal('test-template-title');
      expect(svgElement.attr('opr_template_variables')).to.equal('location,floor');

      /* there must be an instance */
      const instancesElement = svgDOM('instances');

      expect(instancesElement.length).to.equal(1);

      const instances = JSON.parse(instancesElement.text());

      const expectedInstances = [{
        title: 'Automatically created dashboard instance (test-template-title template)',
        showInMenu: true,
        backgroundColor: null,
        variables: {
          location: '',
          floor: ''
        }
      }, {
        title: 'second',
        showInMenu: true,
        backgroundColor: null,
        variables: {
          location: 'Belgrade',
          floor: 16
        }
      }];

      // How can this be fixed for Oracle? It sometimes takes to long and runs into a timeout
      expect(instances).to.deep.equal(expectedInstances);

      expect(svgDOM('g').first().attr('opr_background')).to.equal('bg');

      /* check count of widgets */
      expect(svgDOM('[opr_dashboard_item=\'1\']').length).to.equal(1);

      return done();
    });
  });

  it('dashboardController: get all dashboard template instances', done => {
    app.controllers.dashboard.getTemplateInstances(mock.templateCreateObject.name, tenantId, (err, instanceDocs) => {
      if (err) {
        return done(err);
      }

      expect(instanceDocs).not.equal(undefined);
      expect(instanceDocs).not.equal(null);
      expect(instanceDocs).to.be.a('Array');
      expect(instanceDocs.length).to.equal(2);

      return done();
    });
  });

  it('dashboardController: update dashboard template instance', done => {
    app.controllers.dashboard.getTemplateInstances(mock.templateCreateObject.name, tenantId, (err, instanceDocs) => {
      if (err) {
        return done(err);
      }

      expect(instanceDocs).not.equal(undefined);
      expect(instanceDocs).not.equal(null);
      expect(instanceDocs).to.be.a('Array');
      expect(instanceDocs.length).to.equal(2);

      const updateObj = {
        name: instanceDocs[0].name,
        widgets: [],
        variables: {
          element: 'testElement',
          postfix: 10
        }
      };

      app.controllers.dashboard.updateTemplateInstances(mock.templateCreateObject.name, updateObj, [], false, tenantId, (err, updatedInstances) => {
        if (err) {
          return done(err);
        }

        const updatedInstance = _.find(updatedInstances, {
          name: updateObj.name
        });

        expect(updatedInstance).not.equal(undefined);
        expect(updatedInstance).not.equal(null);
        expect(updatedInstance.variables).not.equal(undefined);
        expect(updatedInstance.variables).not.equal(null);
        expect(updatedInstance.variables.element).not.equal(undefined);
        expect(updatedInstance.variables.element).not.equal(null);
        expect(updatedInstance.variables.postfix).not.equal(undefined);
        expect(updatedInstance.variables.postfix).not.equal(null);

        return done();
      });
    });
  });

  it('dashboardController: update template -> variables change', done => {
    app.controllers.dashboard.update(mock.templateVariablesUpdateObj, {}, tenantId, null, (err, dashboard) => {
      if (err) {
        return done(err);
      }

      const updatedTemplate = dashboard[0],
        updatedInstances = dashboard[1];

      expect(updatedTemplate).not.equal(undefined);
      expect(updatedTemplate).not.equal(null);
      expect(updatedTemplate.variables).not.equal(null);
      expect(updatedTemplate.variables).not.equal(undefined);
      expect(updatedTemplate.variables).to.be.a('Array');
      expect(updatedTemplate.variables.indexOf('address') > -1).to.equal(true);
      expect(updatedTemplate.variables.indexOf('houseNo') > -1).to.equal(true);

      expect(updatedInstances).not.equal(undefined);
      expect(updatedInstances).not.equal(null);
      expect(_.isPlainObject(updatedInstances[0].variables)).to.equal(true);
      expect(!_.isEmpty(updatedInstances[0].variables)).to.equal(true);
      expect(updatedInstances[0].variables.address).not.equal(undefined);
      expect(updatedInstances[0].variables.houseNo).not.equal(undefined);

      return done();
    });
  });

  it('dashboardController: delete dashboard template instance', done => {
    app.controllers.dashboard.getTemplateInstances(mock.templateCreateObject.name, tenantId, (err, instanceDocs) => {
      if (err) {
        return done(err);
      }

      expect(instanceDocs).not.equal(undefined);
      expect(instanceDocs).not.equal(null);
      expect(instanceDocs).to.be.a('Array');
      expect(instanceDocs.length).to.equal(2);

      const instanceName = instanceDocs[0].name;

      app.controllers.dashboard.delete(instanceName, tenantId, err => {
        if (err) {
          return done(err);
        }

        app.controllers.dashboard.getTemplateInstances(mock.templateCreateObject.name, tenantId, (err, newInstanceDocs) => {
          if (err) {
            return done(err);
          }

          expect(newInstanceDocs).not.equal(undefined);
          expect(newInstanceDocs).not.equal(null);
          expect(newInstanceDocs).to.be.a('Array');
          expect(newInstanceDocs.length).to.equal(1);

          return done();
        });
      });
    });
  });

  it('dashboardController: get dashboards by type -> include templates', done => {
    app.controllers.dashboard.getByType(false, true, true, false, tenantId, (err, dashboardDocs) => {
      if (err) {
        return done(err);
      }

      const templates = _.filter(dashboardDocs, doc => doc.variables && _.isArray(doc.variables));

      expect(templates).not.equal(undefined);
      expect(templates).not.equal(null);
      expect(templates.length).to.equal(1);

      return done();
    });
  });

  it('dashboardController: get dashboards by type -> include instances', done => {
    app.controllers.dashboard.getByType(true, false, true, false, tenantId, (err, dashboardDocs) => {
      if (err) {
        return done(err);
      }

      const instances = _.filter(dashboardDocs, doc => doc.variables && _.isPlainObject(doc.variables) && !_.isEmpty(doc.variables));

      expect(instances).not.equal(undefined);
      expect(instances).not.equal(null);
      expect(instances.length).to.equal(1);

      return done();
    });
  });

  it('dashboardController: get dashboards by type -> regular dashboards only', done => {
    app.controllers.dashboard.getByType(true, true, false, false, tenantId, (err, dashboardDocs) => {
      if (err) {
        return done(err);
      }

      const regularDashboards = _.filter(dashboardDocs, doc => app.controllers.dashboard.isDashboard(doc));

      expect(regularDashboards).not.equal(undefined);
      expect(regularDashboards).not.equal(null);
      expect(regularDashboards.length > 0).to.equal(true);

      return done();
    });
  });

  it('dashboardController: bulk create dashboard template instances', done => {
    const instanceObjs = [{
      variables: {
        location: 'Hong Kong',
        floor: 5
      },
      showInMenu: true
    }, {
      variables: {
        location: 'Paris',
        floor: 15
      },
      showInMenu: false
    }];

    app.controllers.dashboard.updateTemplateInstances(mock.templateCreateObject.name, [], instanceObjs, false, tenantId, err => {
      if (err) {
        return done(err);
      }
      app.controllers.dashboard.getByType(true, false, true, false, tenantId, (err, dashboardDocs) => {
        if (err) {
          return done(err);
        }

        const instances = _.filter(dashboardDocs, doc => doc.variables && _.isPlainObject(doc.variables) && !_.isEmpty(doc.variables));

        expect(instances).not.equal(undefined);
        expect(instances).not.equal(null);
        expect(instances.length).to.equal(3);

        return done();
      });
    });
  });

  it('dashboardController: delete template', done => {
    app.controllers.dashboard.deleteTemplate(mock.templateCreateObject.name, tenantId, err => {
      if (err) {
        return done(err);
      }
      app.controllers.dashboard.getByType(false, false, false, false, tenantId, (err, dashboardDocs) => {
        if (err) {
          return done(err);
        }

        const templates = _.filter(dashboardDocs, doc => doc.variables && _.isArray(doc.variables));

        expect(templates).not.equal(undefined);
        expect(templates).not.equal(null);
        expect(templates.length).to.equal(0);

        return done();
      });
    });
  });
});
