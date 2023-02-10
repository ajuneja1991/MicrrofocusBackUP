/* eslint-disable camelcase */
// <reference types="Cypress" />
const shared = require('../../../shared/shared');
import 'cypress-file-upload';
import 'cypress-iframe';
import { clone } from 'ramda';
import { uploadFileRequest } from '../../../../../support/reporting/restUtils/uploadFile';
const dataCollector = require('../../../../../support/reporting/restUtils/dataCollector');
let bvdURL = '';
const role = require('../../../../../support/reporting/restUtils/role');
const nonAdminuserName = 'nonAdminTestUser';
const nonAdminuserPwd = 'control@123D';
let nonAdminWithDataCollectorRole;
let uifRole;

const permissionArray = [{
  operation_key: 'full-control',
  resource_key: 'omi-event'
},
{
  operation_key: 'View',
  resource_key: 'default_action<>Group-__bvd_data_collector'
}];
const permissionArrayForUIF = [{ operation_key: 'View',
  resource_key: 'default_action<>MemberOfNoGroup' }, {
  operation_key: 'View', resource_key: 'menu<>Item-uiTestDataCollectors'
}];

function createRoleForNonAdmin() {
  cy.wrap(role.roleCreationWithPermissionArray('NonAdminPage', 'NonAdminPage', permissionArrayForUIF, false)).then(uifRoleId => {
    cy.wrap(role.roleCreationWithPermissionArray('DefaultBvdRole', 'DefaultBvdRole', permissionArray, true)).then(nonAdminRoleId => {
      nonAdminWithDataCollectorRole = nonAdminRoleId;
      uifRole = uifRoleId;
    });
  });
}

function waitAfterItemSelection() {
  cy.wait(['@getPagesMetadata']);
  shared.waitForDataCalls({ name: '@getChannelStateResponse', count: 3 });
  shared.waitForDataCalls({ name: '@getParameterResponse', count: 4 });
  cy.get('[data-cy="omnibarSpinnerOverlay"]').should('not.exist');
}

describe('DS Proxy predefined Query', shared.defaultTestOptions, () => {
  bvdURL = shared.getBaseUrlForRequest(Cypress.config().baseUrl);

  before(() => {
    uploadFileRequest('foundation/bvdOnUIF/BVDDataCollector.bvddc', `${bvdURL}/rest/${Cypress.env('API_VERSION')}/dataCollector`, 1, 'dataCollectorsFile');
  });

  beforeEach(() => {
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pages/toc*`
    }).as('getTOC');
    cy.intercept({ method: 'POST', url: `${Cypress.env('BVD_CONTEXT_ROOT')}/rest/${Cypress.env('API_VERSION')}/dataCollector` }).as('postDataCollector');
    cy.intercept(`${shared.reportingContextRoot}/rest/${Cypress.env('API_VERSION')}/system`).as('reportingPageloadSystem');
    cy.intercept(`${shared.reportingContextRoot}/rest/${Cypress.env('API_VERSION')}/session/user`).as('reportingPageloadUser');
    cy.intercept(`${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/uiTestDataCollectors*`).as('waitForDataCollectorPage');
    cy.intercept(`${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/uiTestDSProxyDC*`).as('waitForTestDSProxyDCPage');
    cy.intercept({
      method: 'POST',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/dataCollector/channel`
    }).as('getChannelInfo');
    cy.intercept({
      method: 'POST',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/channel/state`
    }).as('getChannelStateResponse');
    cy.bvdLogin();
  });

  it('Check multiple widgets shows the correct data from predefined query', () => {
    cy.visit('/');
    cy.wait('@getTOC');
    cy.get('[data-cy="navigation-category-T2"]').click();
    cy.get('[data-cy="secondLevelItem-T7"]').click();
    cy.get('[data-cy="thirdLevelItem-uiTestDataCollectors"]').click();
    cy.wait(['@waitForDataCollectorPage']);
    shared.waitForDataCalls({ name: '@getChannelInfo', count: 9 });
    shared.waitForDataCalls({ name: '@getChannelStateResponse', count: 9 });

    // Metric box
    cy.get('#ui-test-metric-box-with-data-collector [data-cy="metric-box-value"]').contains('12.0');

    // data table
    cy.get('#ui-test-data-table-dataCollector ag-grid-angular').contains('ID');
    cy.get('#ui-test-data-table-dataCollector ag-grid-angular').contains('Type');
    cy.get('#ui-test-data-table-dataCollector ag-grid-angular').contains('Source Type');
    cy.get('#ui-test-data-table-dataCollector ag-grid-angular').contains('ci_collection');
    cy.get('#ui-test-data-table-dataCollector ag-grid-angular').contains('membership');
    cy.get('#ui-test-data-table-dataCollector ag-grid-angular').contains('containment');
    cy.get('#ui-test-data-table-dataCollector ag-grid-angular').contains('1');

    // echart
    cy.get('#ui-test-chart-dataCollectors').find('echarts-chart').should('not.contain.text', 'No data');
    cy.get('[data-cy="echarts-legend-Page load time"]');
    // eslint-disable-next-line cypress/no-force
    cy.get('#ui-test-chart-dataCollectors').find('echarts-chart').find('svg').find('g').eq(1).trigger('mousedown', { force: true })
      .trigger('mousemove', 100, 100, { force: true })
      .trigger('mouseup', { force: true });
    cy.get('div.hideChartTooltip').contains('Page load time');
    cy.get('[data-cy="echarts-legend-Page load time"]');

    // Pie Chart
    cy.get('#Pie_Chart_With_dataCollector');
    cy.get('text[stroke="rgb(255,255,255)"]').contains('100');
    cy.get('text[stroke="rgb(255,255,255)"]').contains('200');
    cy.get('text[stroke="rgb(255,255,255)"]').contains('400');
    cy.get('[data-cy="echarts-legend-Hostname: hostname: host1"]');
    cy.get('[data-cy="echarts-legend-Hostname: hostname: host2"]');
    cy.get('[data-cy="echarts-legend-Hostname: hostname: host3"]');

    // Group widget bar EChart
    shared.visitPage('/uiTestDSProxyDC?_m=uiTestDSProxyDC', 4, 'waitForTestDSProxyDCPage');
    cy.get('#bar_chart_with_dataCollector');
    cy.get('[data-cy="legend-title-Active CPU"]');
    cy.get('#bar_chart_with_dataCollector').find('echarts-chart').should('not.contain.text', 'No data');
    // eslint-disable-next-line cypress/no-force
    cy.get('#bar_chart_with_dataCollector').find('echarts-chart').find('svg').find('g').eq(1).trigger('mousedown', { force: true })
      .trigger('mousemove', 100, 100, { force: true })
      .trigger('mouseup', { force: true });
    cy.get('div.hideChartTooltip').contains('Active CPU');

    // Two metric chart
    cy.get('#twoMetric_chart_with_dataCollector');
    cy.get('[data-cy="echarts-legend-Active CPU"]');
    cy.get('[data-cy="echarts-legend-Idle CPU"]');
    cy.get('#twoMetric_chart_with_dataCollector').find('echarts-chart').should('not.contain.text', 'No data');
    // eslint-disable-next-line cypress/no-force
    cy.get('#twoMetric_chart_with_dataCollector').find('echarts-chart').find('svg').find('g').eq(1).trigger('mousedown', { force: true })
      .trigger('mousemove', 100, 100, { force: true })
      .trigger('mouseup', { force: true });
    cy.get('div.hideChartTooltip').contains('Active CPU');
    cy.get('div.hideChartTooltip').contains('Idle CPU');
  });

  it('Check if EChart shows data no data for last two hours', () => {
    shared.visitPage('/uiTestDataCollectors?_m=uiTestDataCollectors', 9, 'waitForDataCollectorPage');
    cy.get('[data-cy="context-filter-menu"]').click();
    cy.get('div.filter-menu-container');
    cy.get('[data-cy="RL2hours"]').click();
    cy.get('[data-cy="contextFilterApplyButton"]').click();
    shared.waitForDataCalls({ name: '@getChannelStateResponse', count: 9 });
    cy.get('#ui-test-chart-dataCollectors').find('[data-cy="notification-info-text"]').should('contain.text', 'No data');
  });

  it('Should not display any data if predefined query is deleted', () => {
    cy.wrap(dataCollector.getAllDataCollectors(bvdURL)).then(result => {
      const dataCollectorItem = result.dataCollectors.find(dc => dc.name === 'Metric Box Query');
      if (dataCollectorItem) {
        dataCollector.deleteSingleQuery(bvdURL, dataCollectorItem._id, result.secureModifyToken);
        shared.visitPage('/uiTestDataCollectors', 9, 'waitForDataCollectorPage');
        cy.get('#ui-test-metric-box-with-data-collector [data-cy="metric-box-value"]').contains('0.0');
      } else {
        expect(dataCollectorItem).not.to.be.undefined;
      }
    });
  });

  it('Should not display deleted predefined query in the dropdown', () => {
    cy.visit('/');
    cy.wait('@getTOC');
    cy.get('[data-cy="masthead-design-button"]').contains('DESIGN').click();
    cy.get('[data-cy="widget-type-dataVisualization"]').click();
    cy.get('[data-cy="data-collector-dropdown"]').click();
    cy.get('.filter-container > input').type('2 metric query');
    cy.get('.dropdown-options').contains('2 metric query').click();
    cy.wrap(dataCollector.getAllDataCollectors(bvdURL)).then(result => {
      const dataCollectorItem = result.dataCollectors.find(dc => dc.name === '2 metric query');
      if (dataCollectorItem) {
        dataCollector.deleteSingleQuery(bvdURL, dataCollectorItem._id, result.secureModifyToken);
        cy.visit('/');
        cy.get('[data-cy="masthead-design-button"]').contains('DESIGN').click();
        cy.get('[data-cy="widget-type-dataVisualization"]').click();
        cy.get('[data-cy="data-collector-dropdown"]').click();
        cy.get('.dropdown-options').should('not.contain.text', '2 metric query');
      }
    });
  });

  it('Should open Edit chart Panel', () => {
    shared.visitPage('/uiTestDataCollectors?_m=uiTestDataCollectors', 9, 'waitForDataCollectorPage');
    const pieChart = 3;
    cy.get('mondrian-widget').eq(pieChart).then(widgetElement => {
      cy.wrap(widgetElement).find('[data-cy="action-button"]').click();
      cy.get('[data-cy="action-button-edit"]').click();
    });
    cy.get('right-side-panel').find('[data-cy="side-panel-header"]').contains('Edit Data Visualization');
    cy.get('right-side-panel').find('[data-cy="btn-side-panel-close"]');
    cy.get('[data-cy="definition-section"]');
    cy.get('[data-cy="visualization-section"]');
  });

  after(() => {
    dataCollector.deleteAllQueries(bvdURL);
  });
});

describe('DS Proxy predefined query with parameters', shared.defaultTestOptions, () => {
  bvdURL = shared.getBaseUrlForRequest(Cypress.config().baseUrl);

  before(() => {
    uploadFileRequest('foundation/bvdOnUIF/DataCollectorWithParams.bvddc', `${bvdURL}/rest/${Cypress.env('API_VERSION')}/dataCollector`, 1, 'dataCollectorsFile');
  });

  beforeEach(() => {
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pages/toc*`
    }).as('getTOC');
    cy.intercept({ method: 'POST', url: `${Cypress.env('BVD_CONTEXT_ROOT')}/rest/${Cypress.env('API_VERSION')}/dataCollector` }).as('postDataCollector');
    cy.intercept(`${shared.reportingContextRoot}/rest/${Cypress.env('API_VERSION')}/system`).as('reportingPageloadSystem');
    cy.intercept(`${shared.reportingContextRoot}/rest/${Cypress.env('API_VERSION')}/session/user`).as('reportingPageloadUser');
    cy.intercept(`${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/uiTestDataCollectors*`).as('waitForDataCollectorPage');
    cy.intercept(`${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/TestDSProxyWithParams*`).as('waitForDataCollectorWithParamsPage');
    cy.intercept(`${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/TestDSProxyDefaultValue*`).as('waitForDataCollectorDefaultValuePage');
    cy.intercept({
      method: 'POST',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/dataCollector/*/values`
    }).as('getParameterResponse');
    cy.intercept({
      method: 'POST',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/dataCollector/channel`
    }).as('getChannelInfo');
    cy.intercept({
      method: 'POST',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/channel/state`
    }).as('getChannelStateResponse');
    cy.intercept({
      method: 'POST',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pages/metadata`
    }).as('getPagesMetadata');
    cy.bvdLogin();
  });

  it('Metric box should get updated with the value when the dependent params is selected', () => {
    shared.visitPage('/TestDSProxyWithParams', 3, 'waitForDataCollectorWithParamsPage');
    cy.get('[data-cy="omnibar-input-field"]').should('have.attr', 'placeholder', 'Type to search for a context...');
    cy.get('[data-cy="omnibar-input-field"]').click();
    shared.waitForDataCalls({ name: '@getParameterResponse', count: 5 });
    cy.get('[data-cy="omnibarSpinnerOverlay"]').should('not.exist');
    cy.get('[data-cy="omnibar-content-panel"]');
    cy.get('[data-cy="omnibar-footer"]');
    cy.get('[data-cy="omnibar-content-panel"]').find('[data-cy="type-CPU usage"] [data-cy="20"]').click();
    waitAfterItemSelection();
    cy.get('[data-cy="omnibar-content-panel"]').find('[data-cy="type-CPU usage"] [data-cy="20"] input[type="checkbox"]').should('have.attr', 'aria-checked', 'true');
    cy.get('[data-cy="omnibar-content-panel"]').find('[data-cy="type-os"] [data-cy="IOS"]').click();
    waitAfterItemSelection();
    cy.get('[data-cy="omnibar-content-panel"]').find('[data-cy="type-os"] [data-cy="IOS"] input[type="checkbox"]').should('have.attr', 'aria-checked', 'true');
    cy.get('[data-cy="omnibar-close-btn"]').click();
    cy.get('[data-cy="context-items"] [data-cy="context-tag-CPU usage"]').contains('CPU usage: 20');
    cy.get('[data-cy="context-items"] [data-cy="context-tag-os"]').contains('os: IOS');
    cy.get('[data-cy="metric-box-outer"]').first().contains('30');
  });

  it('Should check the dependency of the parameters in omnibar for nested parameters', () => {
    shared.visitPage('/TestDSProxyWithParams', 3, 'waitForDataCollectorWithParamsPage');
    cy.get('div.omnibar-menu').click();
    shared.waitForDataCalls({ name: '@getParameterResponse', count: 5 });
    cy.get('[data-cy="type-location"]');
    cy.get('[data-cy="type-id"] [data-cy="items-count"]').contains('24 items');
    cy.get('[data-cy="type-sold_item"]');
    cy.get('[data-cy="omnibar-content-panel"]').find('[data-cy="type-location"] [data-cy="India"]').click();
    waitAfterItemSelection();
    cy.get('[data-cy="type-id"] [data-cy="items-count"]').contains('14 items');
    cy.get('[data-cy="omnibar-content-panel"]').find('[data-cy="type-location"] [data-cy="Bangalore"]').click();
    waitAfterItemSelection();
    cy.get('[data-cy="type-id"] [data-cy="items-count"]').contains('2 items');
    cy.get('[data-cy="omnibar-content-panel"]').find('[data-cy="type-id"] [data-cy="25"]').click();
    waitAfterItemSelection();
    cy.get('[data-cy="type-sold_item"] [data-cy="items-count"]').contains('1 items');
  });

  it('Should not show the dependent parameters in omnibar when parameter dependency is removed from parameter query', () => {
    cy.wrap(dataCollector.getAllDataCollectors(bvdURL)).then(result => {
      const oneDataCollector = result.dataCollectors.find(item => item.data.variableName === 'idparam');
      const clonedDataCollector = clone(oneDataCollector);
      clonedDataCollector.data.queryText = 'select distinct id from bvd_lwr_demo_test1';
      dataCollector.updateDataCollector(bvdURL, clonedDataCollector._id, result.secureModifyToken, clonedDataCollector);
      shared.visitPage('/TestDSProxyWithParams', 3, 'waitForDataCollectorWithParamsPage');
      cy.get('div.omnibar-menu').click();
      shared.waitForDataCalls({ name: '@getParameterResponse', count: 4 });
      cy.get('[data-cy="type-location"]').should('not.exist');
      cy.get('[data-cy="type-id"]');
      cy.get('[data-cy="type-sold_item"]');
      dataCollector.updateDataCollector(bvdURL, oneDataCollector._id, result.secureModifyToken, oneDataCollector);
      shared.visitPage('/TestDSProxyWithParams', 3, 'waitForDataCollectorWithParamsPage');
      cy.get('div.omnibar-menu').click();
      shared.waitForDataCalls({ name: '@getParameterResponse', count: 5 });
      cy.get('[data-cy="type-location"]');
      cy.get('[data-cy="type-id"]');
      cy.get('[data-cy="type-sold_item"]');
    });
  });

  it('Multi value selection for parameters', () => {
    shared.visitPage('/TestDSProxyWithParams?_s=1634880240000&_e=1635751440000&_tft=A', 3, 'waitForDataCollectorWithParamsPage');
    cy.get('div.omnibar-menu').click();
    shared.waitForDataCalls({ name: '@getParameterResponse', count: 5 });
    cy.get('[data-cy="type-location"]');
    cy.get('[data-cy="type-id"] [data-cy="items-count"]').contains('24 items');
    cy.get('[data-cy="type-sold_item"]');
    cy.get('[data-cy="omnibar-content-panel"]').find('[data-cy="type-location"] [data-cy="Bangalore"]').click();
    waitAfterItemSelection();
    cy.get('[data-cy="type-id"] [data-cy="items-count"]').contains('2 items');
    /* Clicking the checkbox to perform multiselect
    Using force to overcome the issue: This element is not visible because its parent <div.ux-checkbox-container> has CSS property: visibility: hidden,
    Do not see visibility property getting applied in the DOM */
    // eslint-disable-next-line cypress/no-force
    cy.get('[data-cy="omnibar-content-panel"]').find('[data-cy="type-location"] [data-cy="Mumbai"] input[type="checkbox"]').click({ force: true });
    waitAfterItemSelection();
    cy.get('[data-cy="type-id"] [data-cy="items-count"]').contains('3 items');
    cy.get('[data-cy="omnibar-content-panel"]').find('[data-cy="type-id"] [data-cy="24"]').click();
    waitAfterItemSelection();
    cy.get('[data-cy="type-sold_item"] [data-cy="items-count"]').contains('1 items');
    cy.get('[data-cy="omnibar-content-panel"]').find('[data-cy="type-sold_item"] [data-cy="56"]');
    // eslint-disable-next-line cypress/no-force
    cy.get('[data-cy="omnibar-content-panel"]').find('[data-cy="type-id"] [data-cy="25"] input[type="checkbox"]').click({ force: true });
    waitAfterItemSelection();
    cy.get('[data-cy="type-sold_item"] [data-cy="items-count"]').contains('1 items');
    cy.get('[data-cy="omnibar-content-panel"]').find('[data-cy="type-sold_item"] [data-cy="56"]').click();
    waitAfterItemSelection();
    cy.get('[data-cy="omnibar-close-btn"]').click();
    cy.get('[data-cy="legend-title-Sold Item"]');
  });

  it('Should show the default value as 53 as selected in omnibar for "cpu_usage" param and metric box should show data as 72', () => {
    cy.wrap(dataCollector.getAllDataCollectors(bvdURL)).then(result => {
      const originalDataCollector = result.dataCollectors.find(item => item.data.variableName === 'cpu_usage');
      const clonedDataCollector = clone(originalDataCollector);
      clonedDataCollector.data.value = '53';
      dataCollector.updateDataCollector(bvdURL, clonedDataCollector._id, result.secureModifyToken, clonedDataCollector);
      shared.visitPage('/TestDSProxyWithParams', 3, 'waitForDataCollectorWithParamsPage');
      cy.get('[data-cy="metric-box-outer"]').first().contains('72');
      cy.get('div.omnibar-menu').click();
      shared.waitForDataCalls({ name: '@getParameterResponse', count: 5 });
      cy.get('[data-cy="type-CPU usage"] [data-cy="53"]').should('have.class', 'active ux-checkbox-selected ux-selection-selected');
      dataCollector.updateDataCollector(bvdURL, originalDataCollector._id, result.secureModifyToken, originalDataCollector);
    });
  });

  it('Should show data when default date is given as absolute date string: "2021-10-19 05:00:00 — 2021-11-03 23:59:00"', () => {
    cy.wrap(dataCollector.getAllDataCollectors(bvdURL)).then(result => {
      const originalDataCollector = result.dataCollectors.find(item => item.data.variableName === 'Calendar');
      const clonedDataCollector = clone(originalDataCollector);
      clonedDataCollector.data.value = '10/31/2021 12:00 AM — 11/01/2021 11:59 AM';
      dataCollector.updateDataCollector(bvdURL, clonedDataCollector._id, result.secureModifyToken, clonedDataCollector);
      shared.visitPage('/TestDSProxyWithParams', 3, 'waitForDataCollectorWithParamsPage');
      cy.get('[data-cy="context-filter-menu"]').then(textContent => {
        expect(textContent.text()).to.include('FROM:  10/31/2021  12:00:00 AM  TO:  11/1/2021  11:59:00 AM');
        cy.get('[data-cy="echart"]').eq(0).then(element => {
          cy.wrap(element).rightclick('center');
          cy.wrap(element).find('[data-cy="interactive-tooltip"]').should('be.visible');
          cy.get('#tooltipDataItem').should('contain', 'Sold Item').and('contain', '56');
        });
        cy.get('#ui-test-data-table-dataCollector ag-grid-angular').should('contain', 'ID');
        cy.get('#ui-test-data-table-dataCollector ag-grid-angular').should('contain', 'Sold Item');
        cy.get('#ui-test-data-table-dataCollector ag-grid-angular').should('contain', 'Time Stamp');
        cy.get('#ui-test-data-table-dataCollector ag-grid-angular').should('contain', '24');
        cy.get('#ui-test-data-table-dataCollector ag-grid-angular').should('contain', '56');
        cy.get('#ui-test-data-table-dataCollector ag-grid-angular').should('contain', '2021-10-31 17:00:00+01');
        dataCollector.updateDataCollector(bvdURL, originalDataCollector._id, result.secureModifyToken, originalDataCollector);
      });
    });
  });

  it('should show correct data in charts when default value set in parameter query for data with "Value List" set in predefined query', () => {
    cy.wrap(dataCollector.getAllDataCollectors(bvdURL)).then(result => {
      const originalDataCollector = result.dataCollectors.find(item => item.data.variableName === 'Calendar');
      const clonedDataCollector = clone(originalDataCollector);
      clonedDataCollector.data.value = '10/31/2019 12:00 AM — 11/01/2021 11:59 AM';
      dataCollector.updateDataCollector(bvdURL, clonedDataCollector._id, result.secureModifyToken, clonedDataCollector);
      shared.visitPage('/TestDSProxyDefaultValue', 3, 'waitForDataCollectorDefaultValuePage');
      cy.get('[data-cy="context-filter-menu"]').then(textContent => {
        expect(textContent.text()).to.include('FROM:  10/31/2019  12:00:00 AM  TO:  11/1/2021  11:59:00 AM');
        cy.get('#ui-test-data-table-dataCollector ag-grid-angular').should('contain', 'ID');
        cy.get('#ui-test-data-table-dataCollector ag-grid-angular').should('contain', 'Sold Item');
        cy.get('#ui-test-data-table-dataCollector ag-grid-angular').should('contain', 'Time Stamp');
        cy.get('#ui-test-data-table-dataCollector ag-grid-angular').should('contain', '24');
        cy.get('#ui-test-data-table-dataCollector ag-grid-angular').should('contain', '56');
        cy.get('#ui-test-data-table-dataCollector ag-grid-angular').should('contain', '2021-10-31 17:00:00+01');
        dataCollector.updateDataCollector(bvdURL, originalDataCollector._id, result.secureModifyToken, originalDataCollector);
      });
    });
  });

  it('should not show any data if incorrect default value is set in parameter query', () => {
    cy.wrap(dataCollector.getAllDataCollectors(bvdURL)).then(result => {
      const originalDataCollector = result.dataCollectors.find(item => item.data.variableName === 'OSW');
      const clonedDataCollector = clone(originalDataCollector);
      clonedDataCollector.data.value = 'test';
      dataCollector.updateDataCollector(bvdURL, clonedDataCollector._id, result.secureModifyToken, clonedDataCollector);
      shared.visitPage('/TestDSProxyDefaultValue', 3, 'waitForDataCollectorDefaultValuePage');
      cy.get('[data-cy="metric-box-outer"]').first().contains('0.0');
      cy.get('span:contains( Operating System: )').should('be.visible');
      cy.get('[data-cy="contextLabelType-Operating System"]').should('have.text', ' test ');
      dataCollector.updateDataCollector(bvdURL, originalDataCollector._id, result.secureModifyToken, originalDataCollector);
    });
  });

  it('Should show the data on metric box based on context loaded from URL', () => {
    shared.visitPage('/TestDSProxyWithParams', 3, 'waitForDataCollectorWithParamsPage');
    cy.get('div.omnibar-menu').click();
    shared.waitForDataCalls({ name: '@getParameterResponse', count: 5 });
    cy.get('[data-cy="type-CPU usage"] [data-cy="20"]').click();
    waitAfterItemSelection();
    cy.get('[data-cy="omnibar-close-btn"]').click();
    cy.get('[data-cy="metric-box-outer"]').first().contains('30');
    cy.reload();
    cy.wait('@waitForDataCollectorWithParamsPage');
    shared.waitForDataCalls({ name: '@getChannelInfo', count: 3 });
    shared.waitForDataCalls({ name: '@getChannelStateResponse', count: 3 });
    cy.get('[data-cy="metric-box-outer"]').first().contains('30');
  });

  after(() => {
    dataCollector.deleteAllQueries(bvdURL);
  });
});

describe('DS Proxy predefined query for Non Admin', shared.defaultTestOptions, () => {
  bvdURL = shared.getBaseUrlForRequest(Cypress.config().baseUrl);

  before(() => {
    uploadFileRequest('foundation/bvdOnUIF/BVDDataCollector.bvddc', `${bvdURL}/rest/${Cypress.env('API_VERSION')}/dataCollector`, 1, 'dataCollectorsFile');
    uploadFileRequest('foundation/bvdOnUIF/DataCollectorWithParams.bvddc', `${bvdURL}/rest/${Cypress.env('API_VERSION')}/dataCollector`, 1, 'dataCollectorsFile');
    cy.wrap(createRoleForNonAdmin());
  });

  beforeEach(() => {
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pages/toc*`
    }).as('getTOC');
    cy.intercept({ method: 'POST', url: `${Cypress.env('BVD_CONTEXT_ROOT')}/rest/${Cypress.env('API_VERSION')}/dataCollector` }).as('postDataCollector');
    cy.intercept(`${shared.reportingContextRoot}/rest/${Cypress.env('API_VERSION')}/system`).as('reportingPageloadSystem');
    cy.intercept(`${shared.reportingContextRoot}/rest/${Cypress.env('API_VERSION')}/session/user`).as('reportingPageloadUser');
    cy.intercept(`${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/uiTestDataCollectors*`).as('waitForDataCollectorPage');
    cy.intercept(`${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/TestDSProxyWithParams*`).as('waitForDataCollectorWithParamsPage');
    cy.intercept(`${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/TestDSProxyDefaultValue*`).as('waitForDataCollectorDefaultValuePage');
    cy.intercept(`${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/uiTestDSProxyDC*`).as('waitForTestDSProxyDCPage');
    cy.intercept({
      method: 'POST',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/dataCollector/*/values`
    }).as('getParameterResponse');
    cy.intercept({
      method: 'POST',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/dataCollector/channel`
    }).as('getChannelInfo');
    cy.intercept({
      method: 'POST',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/channel/state`
    }).as('getChannelStateResponse');
    cy.intercept({
      method: 'POST',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pages/metadata`
    }).as('getPagesMetadata');
  });

  after(() => {
    cy.bvdLogout();
    role.roleDeletion(uifRole, false);
    role.roleDeletion(nonAdminWithDataCollectorRole, true);
  });

  it('Check metric chart shows correct data from predefined query when its name contains special characters', () => {
    cy.bvdLogin(nonAdminuserName, nonAdminuserPwd);
    shared.visitPage('/uiTestDSProxyDC?_m=uiTestDSProxyDC', 4, 'waitForTestDSProxyDCPage');
    cy.get('#ui-special-char-test-metric-box-with-data-collector');
    cy.get('span.widget-title-span').contains('Special Character Metric');
    cy.get('#ui-special-char-test-metric-box-with-data-collector [data-cy="metric-box-value"]').contains('15.5');
  });

  it('Update the predefined query\'s query and check for updated data in multiple widgets & charts', () => {
    cy.bvdLogin(nonAdminuserName, nonAdminuserPwd);
    uploadFileRequest('foundation/bvdOnUIF/updatedqueryBVDDataCollector.bvddc', `${bvdURL}/rest/${Cypress.env('API_VERSION')}/dataCollector`, 1, 'dataCollectorsFile');
    shared.visitPage('/uiTestDataCollectors?_m=uiTestDataCollectors', 9, 'waitForDataCollectorPage');
    cy.get('#ui-test-metric-box-with-data-collector [data-cy="metric-box-value"]').contains('13.0');
    // pie chart
    cy.get('#Pie_Chart_With_dataCollector');
    cy.get('text[stroke="rgb(255,255,255)"]').contains('100');
    cy.get('text[stroke="rgb(255,255,255)"]').contains('200');
    cy.get('text[stroke="rgb(255,255,255)"]').contains('400');
    cy.get('[data-cy="echarts-legend-Hostname: hostname: host1"]');
    cy.get('[data-cy="echarts-legend-Hostname: hostname: host2"]');
    cy.get('[data-cy="echarts-legend-Hostname: hostname: host3"]');
    // e-chart
    cy.get('#ui-test-chart-dataCollectors').find('echarts-chart').should('not.contain.text', 'No data');
    cy.get('[data-cy="echarts-legend-Page load time"]');
    // eslint-disable-next-line cypress/no-force
    cy.get('#ui-test-chart-dataCollectors').find('echarts-chart').find('svg').find('g').eq(1).trigger('mousedown', { force: true })
      .trigger('mousemove', 100, 100, { force: true })
      .trigger('mouseup', { force: true });
    cy.get('div.hideChartTooltip').contains('Page load time');
    // data table
    cy.get('#ui-test-data-table-dataCollector ag-grid-angular').contains('ci_collection');
    cy.get('#ui-test-data-table-dataCollector ag-grid-angular').contains('membership');
    cy.get('#ui-test-data-table-dataCollector ag-grid-angular').contains('containment');
    cy.get('#ui-test-data-table-dataCollector ag-grid-angular').contains('10');
  });

  it('Update the predefined query name and check the data table for "No rows to show" message', () => {
    cy.bvdLogin(nonAdminuserName, nonAdminuserPwd);
    dataCollector.getAllDataCollectors(bvdURL).then(result => {
      result.dataCollectors.forEach(oneDataCollector => {
        if (oneDataCollector.name === 'Test Data') {
          oneDataCollector.name = 'Test Data 1';
          dataCollector.updateDataCollector(bvdURL, oneDataCollector._id, result.secureModifyToken, oneDataCollector);
          shared.visitPage('/uiTestDataCollectors', 9, 'waitForDataCollectorPage');
          cy.get('#ui-test-data-table-dataCollector ag-grid-angular').should('contain', 'No rows to show');
        }
      });
    });
  });

  it('Instead of data query name use Data Query Description Name as the predefined query Name in the json and validate data is not displayed', () => {
    cy.bvdLogin(nonAdminuserName, nonAdminuserPwd);
    dataCollector.getAllDataCollectors(bvdURL).then(result => {
      result.dataCollectors.forEach(oneDataCollector => {
        if (oneDataCollector.name === 'Group widget query') {
          oneDataCollector.name = 'Test description';
          dataCollector.updateDataCollector(bvdURL, oneDataCollector._id, result.secureModifyToken, oneDataCollector);
          shared.visitPage('/uiTestDSProxyDC?_m=uiTestDSProxyDC', 4, 'waitForTestDSProxyDCPage');
          cy.get('#bar_chart_with_dataCollector');
          cy.get('[data-cy="legend-title-Active CPU"]');
          cy.get('#bar_chart_with_dataCollector').find('echarts-chart').should('contain.text', 'No data');
        }
      });
    });
  });

  it('Should show data in charts when they are configured with predefined query ds proxy for a time range', () => {
    cy.bvdLogin(nonAdminuserName, nonAdminuserPwd);
    shared.visitPage('/TestDSProxyWithParams?_s=1634880240000&_e=1635751440000&_tft=A', 3, 'waitForDataCollectorWithParamsPage');
    cy.get('#ui-test-chart-dataCollectors').find('echarts-chart').should('not.contain.text', 'No data');
    cy.get('[data-cy="legend-title-Sold Item"]');
    // eslint-disable-next-line cypress/no-force
    cy.get('#ui-test-chart-dataCollectors').find('echarts-chart').find('svg').find('g').eq(1).trigger('mousedown', { force: true })
      .trigger('mousemove', 100, 100, { force: true })
      .trigger('mouseup', { force: true });
    cy.get('div.hideChartTooltip').contains('Sold Item');

    cy.get('[data-cy=timeSelectorStartDate]').click();
    cy.get('[data-cy="RL2hours"]').click();
    cy.get('[data-cy="contextFilterApplyButton"]').click();
    cy.get('#ui-test-chart-dataCollectors').find('[data-cy="notification-info-text"]').should('contain.text', 'No data');
    shared.visitPage('/TestDSProxyWithParams?_s=1633062960000&_e=1635834960000&_tft=A', 3, 'waitForDataCollectorWithParamsPage');
    cy.get('#ui-test-data-table-dataCollector ag-grid-angular').contains('1');
    cy.get('#ui-test-data-table-dataCollector ag-grid-angular').contains('25');
  });

  it('Should not show the params in the omnibar once they are removed from the predefined query', () => {
    cy.bvdLogin(nonAdminuserName, nonAdminuserPwd);
    cy.wrap(dataCollector.getAllDataCollectors(bvdURL)).then(result => {
      const originalDataCollector = result.dataCollectors.find(dataCollectorItem => dataCollectorItem.name === 'MachinesData');
      const clonedDataCollector = clone(originalDataCollector);
      // eslint-disable-next-line no-template-curly-in-string
      clonedDataCollector.data.queryText = 'select performance from machinesdata where ${cpu_usage=${cpu_usage}} limit 1';
      dataCollector.updateDataCollector(bvdURL, clonedDataCollector._id, result.secureModifyToken, clonedDataCollector);
      shared.visitPage('/TestDSProxyWithParams', 3, 'waitForDataCollectorWithParamsPage');
      cy.get('[data-cy="omnibar-input-field"]').should('have.attr', 'placeholder', 'Type to search for a context...');
      cy.get('[data-cy="omnibar-input-field"]').click();
      shared.waitForDataCalls({ name: '@getParameterResponse', count: 4 });
      cy.get('[data-cy="omnibarSpinnerOverlay"]').should('not.exist');
      cy.get('[data-cy="omnibar-content-panel"]');
      cy.get('[data-cy="omnibar-footer"]');
      cy.get('[data-cy="omnibar-content-panel"]').find('[data-cy="type-os"]').should('not.exist');
      // eslint-disable-next-line no-template-curly-in-string
      originalDataCollector.data.queryText = 'select performance from machinesdata where ${cpu_usage=${cpu_usage}} and ${os=${os}} limit 1';
      dataCollector.updateDataCollector(bvdURL, originalDataCollector._id, result.secureModifyToken, originalDataCollector);
      shared.visitPage('/TestDSProxyWithParams', 3, 'waitForDataCollectorWithParamsPage');
      cy.get('[data-cy="omnibar-input-field"]').should('have.attr', 'placeholder', 'Type to search for a context...');
      cy.get('[data-cy="omnibar-input-field"]').click();
      shared.waitForDataCalls({ name: '@getParameterResponse', count: 5 });
      cy.get('[data-cy="omnibarSpinnerOverlay"]').should('not.exist');
      cy.get('[data-cy="omnibar-content-panel"]');
      cy.get('[data-cy="omnibar-footer"]');
      cy.get('[data-cy="omnibar-content-panel"]').find('[data-cy="type-os"]').should('exist');
    });
  });

  it('Should not show any data on chart and table when default value is given as relative string: "RTyear"', () => {
    cy.bvdLogin(nonAdminuserName, nonAdminuserPwd);
    cy.wrap(dataCollector.getAllDataCollectors(bvdURL)).then(result => {
      const originalDataCollector = result.dataCollectors.find(item => item.data.variableName === 'Calendar');
      const clonedDataCollector = clone(originalDataCollector);
      clonedDataCollector.data.value = 'T_YEAR';
      dataCollector.updateDataCollector(bvdURL, clonedDataCollector._id, result.secureModifyToken, clonedDataCollector);
      shared.visitPage('/TestDSProxyWithParams', 3, 'waitForDataCollectorWithParamsPage');
      cy.get('[data-cy="context-filter-menu"]').then(textContent => {
        expect(textContent.text().trim()).to.include('THIS:  Year  |');
        cy.get('#ui-test-chart-dataCollectors').find('[data-cy="notification-info-text"]').should('contain.text', 'No data');
        cy.get('#ui-test-chart-dataCollectors').find('[data-cy="notification-info-text"]').should('contain.text', 'No data');
        dataCollector.updateDataCollector(bvdURL, originalDataCollector._id, result.secureModifyToken, originalDataCollector);
      });
    });
  });

  it('should show correct data in metric box when param query default value contains special characters', () => {
    cy.bvdLogin(nonAdminuserName, nonAdminuserPwd);
    shared.visitPage('/TestDSProxyDefaultValue', 3, 'waitForDataCollectorDefaultValuePage');
    cy.get('[data-cy="metric-box-outer"]').first().contains('10.0');
    cy.get('span:contains( Operating System: )').should('be.visible');
    cy.get('[data-cy="contextLabelType-Operating System"]').should('have.text', ' Windows,_&% ');
    cy.get('[data-cy="context-tag-Operating System"]').should('be.visible');
  });

  it('should show correct data if default value is updated in param query', () => {
    cy.bvdLogin(nonAdminuserName, nonAdminuserPwd);
    cy.wrap(dataCollector.getAllDataCollectors(bvdURL)).then(result => {
      const originalDataCollector = result.dataCollectors.find(item => item.data.variableName === 'OSW');
      const clonedDataCollector = clone(originalDataCollector);
      clonedDataCollector.data.value = 'Linux_&%';
      dataCollector.updateDataCollector(bvdURL, clonedDataCollector._id, result.secureModifyToken, clonedDataCollector);
      shared.visitPage('/TestDSProxyDefaultValue', 3, 'waitForDataCollectorDefaultValuePage');
      cy.get('[data-cy="metric-box-outer"]').first().contains('20.0');
      cy.get('span:contains(Operating System)').should('be.visible');
      cy.get('[data-cy="contextLabelType-Operating System"]').should('have.text', ' Linux_&% ');
      cy.get('[data-cy="context-tag-Operating System"]').should('be.visible');
      dataCollector.updateDataCollector(bvdURL, originalDataCollector._id, result.secureModifyToken, originalDataCollector);
    });
  });

  it('should show correct data in metric box when default value set in parameter query with different values for Value and Label column in predefined query', () => {
    cy.bvdLogin(nonAdminuserName, nonAdminuserPwd);
    cy.wrap(dataCollector.getAllDataCollectors(bvdURL)).then(result => {
      const originalDataCollector = result.dataCollectors.find(item => item.data.variableName === 'Calendar');
      const clonedDataCollector = clone(originalDataCollector);
      clonedDataCollector.data.value = '10/31/2019 12:00 AM — 11/01/2021 11:59 AM';
      dataCollector.updateDataCollector(bvdURL, clonedDataCollector._id, result.secureModifyToken, clonedDataCollector);
      shared.visitPage('/TestDSProxyDefaultValue', 3, 'waitForDataCollectorDefaultValuePage');
      cy.wait('@getTOC');
      cy.get('[data-cy="context-filter-menu"]').then(textContent => {
        expect(textContent.text()).to.include('FROM:  10/31/2019  12:00:00 AM  TO:  11/1/2021  11:59:00 AM');
        cy.get('[data-cy="echart"]').eq(0).then(element => {
          cy.wrap(element).rightclick('center');
          cy.wrap(element).find('[data-cy="interactive-tooltip"]').should('be.visible');
          cy.get('#tooltipDataItem').should('contain', 'Performance').and('contain', '90');
        });
        cy.get('span:contains(CPU Usage Performance)').should('be.visible');
        cy.get('[data-cy="contextLabelType-CPU Usage Performance"]').should('have.text', ' 80 ');
        cy.get('[data-cy="context-tag-CPU Usage Performance"]').should('be.visible');
        cy.get('div.omnibar-menu').click();
        shared.waitForDataCalls({ name: '@getParameterResponse', count: 3 });
        cy.get('[data-cy="type-CPU Usage Performance"] [data-cy="80"]').should('have.class', 'active ux-checkbox-selected ux-selection-selected');
        cy.get('[data-cy="omnibar-close-btn"]').click();
        dataCollector.updateDataCollector(bvdURL, originalDataCollector._id, result.secureModifyToken, originalDataCollector);
      });
    });
  });
});
