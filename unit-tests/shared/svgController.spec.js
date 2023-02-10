/* eslint-disable node/no-sync, camelcase, node/no-process-env, node/global-require, no-unused-expressions */
const path = require('path');
const fs = require('fs');

describe('svgController tests', () => {
  let app;
  const mock = {
    newTenantParams: {
      tenantCompany: 'test-company',
      adminUserEmail: 'testUser@testCompany.com',
      adminUserPassword: 'testPassword123!',
      noDashboardImport: true
    },

    dashboardFile: {
      originalname: 'test-documentation.svg',
      path: path.resolve(__dirname, '../test-files/test-documentation.svg'),
      mimetype: 'image/svg+xml'
    },

    testDashboardFileShowInMenu: {
      originalname: 'test-dashboard-export-show-in-menu.svg',
      path: path.resolve(__dirname, '../test-files/test-dashboard-export-show-in-menu.svg'),
      mimetype: 'image/svg+xml'
    },

    testDashboardFileExportedCategories: {
      originalname: 'test-dashboard-export.svg',
      path: path.resolve(__dirname, '../test-files/test-dashboard-export.svg'),
      mimetype: 'image/svg+xml'
    },

    testDashboardScalingFile: {
      originalname: 'test-dashboard-export-scaling.svg',
      path: path.resolve(__dirname, '../test-files/test-dashboard-export-scaling.svg'),
      mimetype: 'image/svg+xml'
    },

    testDashboardWithDataLinkFile: {
      originalname: 'test-dashboard-with-data-link.svg',
      path: path.resolve(__dirname, '../test-files/test-dashboard-with-data-link.svg'),
      mimetype: 'image/svg+xml'
    },

    testDashboardWithoutDataLinkFile: {
      originalname: 'test-dashboard-without-data-link.svg',
      path: path.resolve(__dirname, '../test-files/test-dashboard-without-data-link.svg'),
      mimetype: 'image/svg+xml'
    }

  };

  before(function(done) {
  /* set the timeout for mocha tests to 10sec */
    this.timeout(100000);
    const db = require('../helpers/db');

    db.cleanAll(err => {
      if (err) {
        return done(err);
      }
      app = require('../../../shared/app');

      if (!app.controllers.bvdTenant.exist({
        name: mock.newTenantParams.tenantCompany
      })) {
        /* create one tenant that will be used for testing */
        app.controllers.bvdTenant.createNewTenant(mock.newTenantParams, err => {
          if (err) {
            return done(err);
          }

          const newTenant = app.controllers.bvdTenant.getByName(mock.newTenantParams.tenantCompany);

          if (newTenant) {
            return done();
          }

          return done(new Error('Test tenant not created.'));
        });
      } else {
        /* use existing tenant */
        const tenant = app.controllers.bvdTenant.getByName(mock.newTenantParams.tenantCompany);

        if (tenant) {
          return done();
        }

        return done(new Error('Test tenant not found.'));
      }
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

  it('svgController: process SVG file', () => {
    const svgContent = fs.readFileSync(mock.dashboardFile.path, {
      encoding: 'utf8'
    });
    const result = app.controllers.svg.processSvgFile({ svgContent, fileName: mock.dashboardFile.originalname });

    expect(result.length).equal(36545);
  });

  it('svgController: extract data from SVG file and check from show in menu', () => {
    const svgContent = fs.readFileSync(mock.testDashboardFileShowInMenu.path, {
      encoding: 'utf8'
    });
    const result = app.controllers.svg.processSvgFile({ svgContent, fileName: mock.testDashboardFileShowInMenu.originalname });
    const dashboardData = app.controllers.svg.extractAllPropertiesFromSvg(result);
    expect(dashboardData.showInMenu).equal(false);
  });

  it('svgController: extract data from SVG file and check for imported categories and menu categories', () => {
    const svgContent = fs.readFileSync(mock.testDashboardFileExportedCategories.path, {
      encoding: 'utf8'
    });
    const result = app.controllers.svg.processSvgFile({ svgContent, fileName: mock.testDashboardFileExportedCategories.originalname });
    const dashboardData = app.controllers.svg.extractAllPropertiesFromSvg(result);
    expect(dashboardData.category.length).equal(1);
    expect(dashboardData.category[0]).equal('Alpha; Gamma');
    expect(dashboardData.menuCategory.length).equal(1);
    expect(dashboardData.menuCategory[0]).equal('menu-category');
  });

  it('svgController: extract data from SVG file and check for options', () => {
    const svgContent = fs.readFileSync(mock.testDashboardScalingFile.path, {
      encoding: 'utf8'
    });
    const result = app.controllers.svg.processSvgFile({ svgContent, fileName: mock.testDashboardScalingFile.originalname });
    const dashboardData = app.controllers.svg.extractAllPropertiesFromSvg(result);
    expect(dashboardData.options.fit).equal('width');
  });

  it('svgController: Filter data links from hrefs', () => {
    let svgContent = fs.readFileSync(mock.testDashboardWithDataLinkFile.path, {
      encoding: 'utf8'
    });
    const resultA = app.controllers.svg.processSvgFile({ svgContent, fileName: mock.testDashboardWithDataLinkFile.originalname });
    expect((resultA.match(/xlink:href/g) || []).length).to.equal(0);
    expect(resultA.indexOf('data:')).to.equal(-1);
    expect(resultA.indexOf('  Data:')).to.equal(-1);

    // Valid href's should not be altered
    svgContent = fs.readFileSync(mock.testDashboardWithoutDataLinkFile.path, {
      encoding: 'utf8'
    });
    const resultB = app.controllers.svg.processSvgFile({ svgContent, fileName: mock.testDashboardWithoutDataLinkFile.originalname });
    expect(resultB.match(/xlink:href/g).length).to.equal(11);
    expect(resultB.indexOf('http://localhost:4000/bvd/#/show/documentation')).to.not.equal(-1);
    expect(resultB.indexOf('#/show/BVD-step_2')).to.not.equal(-1);
  });
});
