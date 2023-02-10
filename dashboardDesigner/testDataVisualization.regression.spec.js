/* eslint-disable camelcase */
// <reference types="Cypress" />
const shared = require('../../../shared/shared');
import 'cypress-file-upload';
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

const permissionArrayForUIF = [
  { operation_key: 'View', resource_key: 'default_action<>MemberOfNoGroup' },
  { operation_key: 'Create', resource_key: 'default_action<>MemberOfNoGroup' },
  { operation_key: 'View', resource_key: 'menu<>Item-uiTestDataCollectors' },
  { operation_key: 'exec', resource_key: 'action<>All' }
];

function createRoles() {
  cy.wrap(role.roleCreationWithPermissionArray('NonAdminPage', 'NonAdminPage', permissionArrayForUIF, false)).then(uifRoleId => {
    cy.wrap(role.roleCreationWithPermissionArray('NonAdminPage', 'NonAdminPage', permissionArray, true)).then(nonAdminRoleId => {
      nonAdminWithDataCollectorRole = nonAdminRoleId;
      uifRole = uifRoleId;
    });
  });
}

function visitAddMultipleColumnPage() {
  cy.visit('/uiTestMultipleColumn?_m=uiTestMultipleColumn');
  shared.waitForDataCalls({ name: '@getTOC', count: 2 });
  cy.wait(['@getPage']);
}

function navigateToVisualization() {
  cy.visit('/');
  cy.wait(['@getTOC', '@getMenuEntries', '@getTOC']);
  cy.get('[data-cy=masthead-design-button]').click();
  cy.wait('@getTOC');
  cy.get('[data-cy=widget-type-dataVisualization]').click();
  cy.wait(['@getWidgetPalette', '@getDataCollectors', '@getChannelStateResponse']);
}

function selectPredefinedQuery(queryName) {
  cy.get('[data-cy="data-collector-dropdown"]').click();
  cy.get('input[placeholder="Search data definitions"]').type(queryName);
  cy.contains(queryName).click();
  cy.wait(['@getDataCollector', '@getChannelInfo', '@getChannelStateResponse']);
}

function verifyPieAndDonutChartsData() {
  cy.get('echarts-chart').find('[data-cy="legend-title-active cpu: zone: East"]').should('be.visible');
  cy.get('echarts-chart').find('[data-cy="legend-title-active cpu: zone: North"]').should('be.visible');
  cy.get('echarts-chart').find('[data-cy="legend-title-active cpu: zone: West"]').should('be.visible');

  cy.get('echarts-chart > [data-cy="echart"]').find('svg').find('g')
    .then(element => {
      cy.wrap(element).find('path[fill= "#E57828"]');
      cy.wrap(element).find('path[fill= "#00ABF3"]');
      cy.wrap(element).find('path[fill= "#00ABF3"]');
    });

  cy.get('[data-cy="echarts-legend-active cpu: zone: East"]').click();
  cy.get('[data-cy="echarts-legend-active cpu: zone: North"]').click();
  cy.get('[data-cy="echarts-legend-active cpu: zone: West"]').click();
}

function verifyTimeSeriesChartsData() {
  cy.get('echarts-chart').find('[data-cy="echarts-legend-baseLineUpperBand"]').should('be.visible');
  cy.get('echarts-chart').find('[data-cy="legend-title-baseLineUpperBand"]').should('have.text', 'baseLineUpperBand');
  cy.get('echarts-chart').find('[data-cy="echarts-legend-baseLineUpperBand"]').click();

  cy.get('[data-cy="echart"]').then(element => {
    cy.wrap(element).trigger('mousemove', 'center');
    cy.wrap(element).find('[data-cy="echartTooltip"]').should('be.visible');
    cy.wrap(element).find('[data-cy="right-click-to-interact"]').contains('Right-click to interact').should('have.class', 'help-block');
    cy.wrap(element).rightclick('center');
    cy.wrap(element).find('[data-cy="interactive-tooltip"]').should('be.visible');
    cy.wrap(element).find('div.hideChartTooltip').find('[id="tooltipDataHostName"] span').should('have.text', 'baseLineUpperBand');
    cy.wrap(element).trigger('mouseout');
  });
}

describe('Create widgets using predefined data definition', shared.defaultTestOptions, () => {
  bvdURL = shared.getBaseUrlForRequest(Cypress.config().baseUrl);

  beforeEach(() => {
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pages/toc*`
    }).as('getTOC');
    cy.intercept({ method: 'POST', url: `${Cypress.env('BVD_CONTEXT_ROOT')}/rest/${Cypress.env('API_VERSION')}/dataCollector` }).as('postDataCollector');
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
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/datasource/ws/data`
    }).as('getData');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/dataCollector?type=dataQueries`
    }).as('getDataCollectors');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/uiTestMultipleColumn?*`
    }).as('getPage');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/dataCollector/*`
    }).as('getDataCollector');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/menuEntries?filter=pages`
    }).as('getMenuEntries');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/widgets?showInPalette=true`
    }).as('getWidgetPalette');
    cy.bvdLogin();
  });

  before(() => {
    uploadFileRequest('foundation/bvdOnUIF/BVDDataCollector.bvddc', `${Cypress.env('EXPLORE_CONTEXT_ROOT')}/rest/${Cypress.env('API_VERSION')}/dataCollector`, 1, 'dataCollectorsFile');
  });

  it('Verify Data Visualization sections and check visualization section get enable after selecting predefined query', () => {
    cy.visit('/');
    cy.wait(['@getTOC', '@getMenuEntries', '@getTOC']);
    cy.get('[data-cy=masthead-design-button]').click();
    cy.wait('@getTOC');
    cy.get('[data-cy=widget-type-dataVisualization] > .widget-type-title').should('have.text', ' Data Visualization ');
    cy.get('[data-cy=widget-type-dataVisualization]').click();
    cy.wait(['@getWidgetPalette', '@getDataCollectors', '@getChannelStateResponse']);
    cy.get('[data-cy="side-panel-header"] h2').should('have.text', 'Edit Data Visualization');
    cy.get('[data-cy="select-data-definition-label"]').first().should('have.text', ' Select a predefined data definition *');
    cy.get('[data-cy="data-collector-dropdown"]').should('be.visible');
    cy.get('[data-cy="data-collector-dropdown"]').contains('Search data definitions');
    cy.get('ux-accordion-panel-header').contains('VISUALIZATION').should('have.class', 'disabled-title-style');
    cy.get('[data-cy="data-collector-dropdown"]').click();
    cy.get('input[placeholder="Search data definitions"]').type('2 metric query');
    cy.get('div.dropdown-options').children('div').should('have.length', 1);
    cy.contains('2 metric query').click();
    cy.wait(['@getDataCollector', '@getChannelInfo', '@getChannelStateResponse']);
    cy.get('ux-accordion-panel-header').contains('VISUALIZATION').should('not.have.class', 'disabled-title-style');
    cy.get('[data-cy="visualization-section"]').click();
    cy.get('[data-cy="visualizationLabel"] > label').should('have.text', ' Visualization *');
    cy.get('td.inputLabel').contains('Metric values').should('be.visible');
    cy.get('td.inputLabel').contains('Categorize by').should('be.visible');
    cy.get('[data-cy="visualization-option-section"]').click();
    cy.get('[data-cy="options.title-label"]').find('span').first().should('have.text', 'Widget title');
    cy.get('input[id="options.title-input"]').should('be.visible');
  });

  // Skipping this test due to existing defect https://internal.almoctane.com/ui/entity-navigation?p=97002/8001&entityType=work_item&id=1770337
  // eslint-disable-next-line mocha/no-skipped-tests
  it.skip('Verify available charts in visualization for category and time column configured in data definition', () => {
    navigateToVisualization();
    selectPredefinedQuery('2 metric query');
    cy.get('[data-cy="visualization-section"]').click();
    cy.get('[data-cy="visualizationLabel"] label').should('have.text', ' Visualization *');
    cy.get('[data-cy="visualization-dropdown"]').click();
    const categoryCharts = ['Categorized bar', 'Categorized area', 'Categorized line', '# Number', 'Pie', 'Donut', 'Table'];
    cy.get('div.dropdown-option-item span span').each(($elem, index) => {
      expect(categoryCharts[index]).contains($elem.text().trim());
    });
    cy.get('div.dropdown-option-item').contains('Categorized line').click();
    cy.wait(['@getChannelInfo', '@getChannelStateResponse']);
    cy.get('[data-cy="visualization-option-section"]').contains('CATEGORIZED LINE OPTIONS');
    cy.get('[data-cy="definition-section"]').click();
    cy.get('[data-cy="data-collector-dropdown"]').click();
    cy.get('input[placeholder="Search data definitions"]').type('Page Load Time');
    cy.contains('Page Load Time').click();
    cy.wait('@getDataCollector');
    cy.get('[data-cy="visualization-section"]').click();
    cy.get('[data-cy="visualization-dropdown"]').click();
    const timeCharts = ['Time-series bar', '# Number', 'Time-series line', 'Time-series area'];
    cy.get('div.dropdown-option-item span span').each(($elem, index) => {
      expect(timeCharts[index]).contains($elem.text().trim());
    });
    cy.get('[data-cy="visualization-option-section"]').contains('TIME-SERIES BAR OPTIONS');
  });

  it('Verify that user is able to create various categorized chart using data definition metadata consist of single Category', () => {
    navigateToVisualization();
    selectPredefinedQuery('2 metric query');
    cy.get('[data-cy="visualization-section"]').click();
    cy.get('[data-cy="visualization-dropdown"]').click();
    cy.get('[data-cy="visualization-chartTypes"]').contains('Categorized bar').click();

    cy.get('[data-cy="visualization-option-section"]').click();
    cy.get('[data-cy="options.title-label"] label span').contains('Widget title');
    cy.get('input[id="options.title-input"]').should('be.visible');
    cy.get('echarts-chart').find('[data-cy="echarts-legend-active cpu"]').should('be.visible');
    cy.get('echarts-chart').find('[data-cy="echarts-legend-idle cpu"]').should('not.exist');
    cy.get('echarts-chart').find('[data-cy="legend-title-active cpu"]').should('have.text', 'active cpu');

    cy.get('[data-cy="echart"]').then(element => {
      cy.wrap(element).trigger('mousemove', 'center');
      cy.wrap(element).find('[data-cy="echartTooltip"]').should('be.visible');
      cy.wrap(element).find('[data-cy="right-click-to-interact"]').contains('Right-click to interact').should('have.class', 'help-block');
      cy.wrap(element).find('g').find('path[fill="#9B1E83"]').rightclick('center');
      cy.wrap(element).find('[data-cy="interactive-tooltip"]').should('be.visible');
      cy.wrap(element).find('[data-cy="interactive-tooltip"]').contains('West').should('be.visible');
      cy.wrap(element).find('div.hideChartTooltip').find('[id="tooltipDataHostName"] span').should('have.text', 'active cpu');
      cy.wrap(element).trigger('mouseout');
    });
    cy.get('[data-cy="visualization-section"]').click();
    cy.get('[data-cy="form-table"]').find('ux-icon[name=add]').first().click();
    cy.get('ux-typeahead-options-list').find('span.ux-typeahead-option').contains('idle cpu').click();
    cy.get('uif-advanced-input').contains('zone').should('be.visible');
    cy.get('echarts-chart').find('[data-cy="echarts-legend-active cpu"]').click();
    cy.get('echarts-chart').find('[data-cy="echarts-legend-idle cpu"]').should('be.visible');
    cy.get('echarts-chart').find('[data-cy="echarts-legend-active cpu"]').should('be.visible');
    cy.get('echarts-chart').find('[data-cy="legend-title-idle cpu"]').should('have.text', 'idle cpu');
    cy.get('echarts-chart').find('[data-cy="legend-title-active cpu"]').should('have.text', 'active cpu');

    cy.get('echarts-chart').find('svg').find('g').eq(0).find('g')
      .then(gElement => {
        cy.wrap(gElement).find('path').invoke('attr', 'stroke-width').should('contain', '2');
        cy.get('[data-cy="active cpu"] input').should('be.checked');
        cy.get('[data-cy="idle cpu"] input').should('not.be.checked');
        cy.wrap(gElement).find('path').invoke('attr', 'stroke').should('contain', '#5470c6');
      });

    cy.get('[data-cy="visualization-section"]').click();
    cy.get('[data-cy="visualization-dropdown"]').click();
    cy.get('[data-cy="visualization-chartTypes"]').contains('Categorized area').click();
    cy.get('[data-cy="form-table"]').find('ux-icon[name=add]').first().click();
    cy.get('ux-typeahead-options-list').find('span.ux-typeahead-option').contains('idle cpu').click();
    cy.get('echarts-chart').find('[data-cy="legend-title-idle cpu"]').should('have.text', 'idle cpu');
    cy.get('echarts-chart').find('[data-cy="legend-title-active cpu"]').should('have.text', 'active cpu');

    cy.get('[data-cy="echart"]').then(element => {
      cy.wrap(element).trigger('mousemove', 'center');
      cy.wrap(element).rightclick('center');
      cy.wrap(element).find('[data-cy="interactive-tooltip"]').should('be.visible');
      cy.wrap(element).find('[data-cy="interactive-tooltip"]').contains('East').should('be.visible');
      cy.wrap(element).find('[id="tooltipDataHostName"] span').contains('idle cpu');
      cy.wrap(element).trigger('mouseout');
    });

    cy.get('[data-cy="visualization-dropdown"]').click();
    cy.get('[data-cy="visualization-chartTypes"]').contains('Categorized line').click();
    cy.get('[data-cy="form-table"]').find('ux-icon[name=add]').first().click();
    cy.get('ux-typeahead-options-list').find('span.ux-typeahead-option').contains('idle cpu').click();

    cy.get('[data-cy="echart"]').then(element => {
      cy.wrap(element).trigger('mousemove', 'center');
      cy.wrap(element).rightclick('center');
      cy.wrap(element).find('[data-cy="interactive-tooltip"]').should('be.visible');
      cy.wrap(element).find('[data-cy="interactive-tooltip"]').contains('East').should('be.visible');
      cy.wrap(element).find('[id="tooltipDataHostName"] span').contains('idle cpu');
      cy.wrap(element).find('[id="tooltipDataHostName"] span').contains('active cpu');
      cy.wrap(element).trigger('mouseout');
    });
  });

  it('Verify that user is able to create pie or donut chart using data definition', () => {
    navigateToVisualization();
    selectPredefinedQuery('2 metric query');
    cy.get('[data-cy="visualization-section"]').click();
    cy.get('[data-cy="visualization-dropdown"]').click();
    cy.get('[data-cy=visualization-chartTypes]').contains('Pie').should('be.visible').click();
    verifyPieAndDonutChartsData();
    cy.get('[data-cy="visualization-section"]').click();
    cy.get('[data-cy="visualization-dropdown"]').click();
    cy.get('[data-cy="visualization-chartTypes"]').contains('Donut').should('be.visible').click();
    cy.get('uif-advanced-input').contains('zone').should('be.visible');
    cy.get('[data-cy="cancel-button"]').click();
    verifyPieAndDonutChartsData();
  });

  it('Verify that user is able to create time series chart using data definition metadata consist of time column configured', () => {
    visitAddMultipleColumnPage();
    cy.get('[data-cy="page-action-button"]').click();
    cy.get('[data-cy="page-action-item-addWidget"]').click();
    cy.get('[data-cy="widget-type-dataVisualization"]').click();
    selectPredefinedQuery('upperBandBaseLineChart');
    cy.get('[data-cy="visualization-section"]').click();
    cy.get('[data-cy="visualization-dropdown"]').click();
    cy.get('[data-cy="visualization-chartTypes"]').contains('Time-series bar').click();
    cy.get('uif-advanced-input').find('span').first().should('have.text', 'baseLineUpperBand');
    cy.get('uif-advanced-input').find('span').eq(1).contains('timestamp');
    verifyTimeSeriesChartsData();
    cy.get('[data-cy="visualization-dropdown"]').click();
    cy.get('[data-cy="visualization-chartTypes"]').contains('Time-series line').click();
    verifyTimeSeriesChartsData();
    cy.get('[data-cy="visualization-dropdown"]').click();
    cy.get('[data-cy="visualization-chartTypes"]').contains('Time-series area').click();
    cy.get('uif-advanced-input').find('span').first().should('have.text', 'baseLineUpperBand');
    verifyTimeSeriesChartsData();
  });

  it('Verify that user is able to edit widget predefined query & visualization option', () => {
    visitAddMultipleColumnPage();
    cy.get('[data-cy="page-action-button"]').click();
    cy.get('[data-cy="page-action-item-addWidget"]').click();
    cy.get('[data-cy="widget-type-dataVisualization"]').click();
    selectPredefinedQuery('upperBandBaseLineChart');
    cy.get('[data-cy="visualization-section"]').click();
    cy.get('[data-cy="visualization-dropdown"]').click();
    cy.get('[data-cy="visualization-chartTypes"]').contains('Time-series bar').click();
    cy.get('uif-advanced-input').find('span').first().should('have.text', 'baseLineUpperBand');
    cy.get('[data-cy="visualization-option-section"]').click();
    cy.get('input[id="options.title-input"]').clear().type('Test Widget1');
    cy.get('[data-cy="cancel-button"]').click();
    verifyTimeSeriesChartsData();
    cy.get('[data-cy="widget-title"]').should('have.text', 'Test Widget1');
    cy.get('[data-cy="action-button"]').click();
    cy.get('[data-cy="action-button-edit"]').click();
    cy.wait(['@getWidgetPalette', '@getDataCollectors', '@getDataCollector']);
    cy.get('[data-cy="definition-section"]').click();
    selectPredefinedQuery('2 metric query');
    cy.get('[data-cy="visualization-section"]').click();
    cy.get('[data-cy="visualization-dropdown"]').click();
    cy.get('[data-cy="visualization-chartTypes"]').contains('Pie').should('be.visible').click();
    cy.get('[data-cy="visualization-option-section"]').click();
    cy.get('input[id="options.title-input"]').clear().type('Updated Widget Test');
    cy.get('[data-cy="cancel-button"]').click();
    verifyPieAndDonutChartsData();
    cy.get('[data-cy="widget-title"]').should('have.text', 'Updated Widget Test');
  });

  it('Verify that when user types a blank space in beginning of predefined query search then it should not give junk null values', () => {
    navigateToVisualization();
    cy.get('[data-cy="data-collector-dropdown"]').click();
    cy.get('input[placeholder="Search data definitions"]').type('    ');
    cy.get('div.dropdown-list-container.dropdown-options').contains('null').should('not.exist');
  });

  it(`Check for a predefined data definition having tags it should not give any error when user select legends on widget`, () => {
    visitAddMultipleColumnPage();
    cy.get('[data-cy="page-action-button"]').click();
    cy.get('[data-cy="page-action-item-addWidget"]').click();
    cy.get('[data-cy="widget-type-dataVisualization"]').click();
    selectPredefinedQuery('Page Load Time');
    cy.get('[data-cy="visualization-section"]').click();
    cy.get('[data-cy="visualization-dropdown"]').click();
    cy.get('[data-cy="visualization-chartTypes"]').contains('Time-series bar').click();
    cy.get('[data-cy="echarts-legend-value of page load time"]').click();
    cy.contains('pageloadtime does not exist').should('not.exist');
  });

  after(() => {
    dataCollector.deleteAllQueries(bvdURL);
  });
});

describe('Non admin access for Data Visualization', shared.defaultTestOptions, () => {
  bvdURL = shared.getBaseUrlForRequest(Cypress.config().baseUrl);

  before(() => {
    uploadFileRequest('foundation/bvdOnUIF/BVDDataCollector.bvddc', `${bvdURL}/rest/${Cypress.env('API_VERSION')}/dataCollector`, 1, 'dataCollectorsFile');
    createRoles();
  });

  beforeEach(() => {
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pages/toc*`
    }).as('getTOC');
    cy.intercept({ method: 'POST', url: `${Cypress.env('BVD_CONTEXT_ROOT')}/rest/${Cypress.env('API_VERSION')}/dataCollector` }).as('postDataCollector');
    cy.intercept({
      method: 'POST',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/dataCollector/channel`
    }).as('getChannelInfo');
    cy.intercept({
      method: 'POST',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/channel/state`
    }).as('getChannelStateResponse');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/dataCollector?type=dataQueries`
    }).as('getDataCollectors');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/uiTestMultipleColumn?*`
    }).as('getPage');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/dataCollector/*`
    }).as('getDataCollector');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/menuEntries?filter=pages`
    }).as('getMenuEntries');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/widgets?showInPalette=true`
    }).as('getWidgetPalette');
  });

  after(() => {
    cy.bvdLogin();
    dataCollector.deleteAllQueries(bvdURL);
    cy.bvdLogout();
    role.roleDeletion(nonAdminWithDataCollectorRole, true);
    role.roleDeletion(uifRole, false);
  });

  it(`Verify that non admin user can configure multiple column with different labels on existing page`, () => {
    cy.bvdLogout();
    cy.bvdLogin(nonAdminuserName, nonAdminuserPwd);
    navigateToVisualization();
    selectPredefinedQuery('2 metric query');
    cy.get('[data-cy="visualization-section"]').click();
    cy.get('[data-cy="visualization-dropdown"').click();
    cy.get('[data-cy="visualization-chartTypes"]').contains('Pie').should('be.visible').click();
    verifyPieAndDonutChartsData();
  });
});
