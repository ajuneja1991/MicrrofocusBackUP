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

function waitAfterItemSelection(parameterCount) {
  shared.waitForDataCalls({ name: '@getPagesMetadata', count: 1 });
  shared.waitForDataCalls({ name: '@getChannelStateResponse', count: 1 });
  shared.waitForDataCalls({ name: '@paramDataCollectors', count: parameterCount });
  cy.get('[data-cy="omnibarSpinnerOverlay"]').should('not.exist');
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

describe('Predefined query with parameter depends on multiple parameters', shared.defaultTestOptions, () => {
  bvdURL = shared.getBaseUrlForRequest(Cypress.config().baseUrl);

  before(() => {
    uploadFileRequest('foundation/bvdOnUIF/dataCollectorsMultiParams.bvddc', `${bvdURL}/rest/${Cypress.env('API_VERSION')}/dataCollector`, 1, 'dataCollectorsFile');
  });

  beforeEach(() => {
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pages/toc*`
    }).as('getTOC');
    cy.intercept({ method: 'POST', url: `${Cypress.env('BVD_CONTEXT_ROOT')}/rest/${Cypress.env('API_VERSION')}/dataCollector` }).as('postDataCollector');
    cy.intercept(`${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/uiTestMultiParamDC*`).as('waitForMultiParamsPage');
    cy.intercept({
      method: 'POST',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/dataCollector/*/values`
    }).as('paramDataCollectors');
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
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/menuEntries?filter=pages`
    }).as('getMenuEntries');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/widgets?showInPalette=true`
    }).as('getWidgetPalette');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/dataCollector?type=dataQueries`
    }).as('getDataCollectors');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/dataCollector/*`
    }).as('getDataCollector');
    cy.bvdLogin();
  });

  it('Metric box should get updated with the value when the multiple dependent params is selected', () => {
    shared.visitPage('/uiTestMultiParamDC', 1, 'waitForMultiParamsPage');
    cy.wait('@getTOC');
    cy.get('[data-cy="widget-title"]').should('have.text', 'Performance Metric');
    cy.get('[data-cy="metric-box-value"]').should('have.text', '90.0');
    cy.get('[data-cy="omnibar-input-field"]').should('have.attr', 'placeholder', 'Type to search for a context...');
    cy.get('[data-cy="omnibar-input-field"]').click();
    shared.waitForDataCalls({ name: '@paramDataCollectors', count: 4 });
    cy.get('[data-cy="omnibarSpinnerOverlay"]').should('not.exist');
    cy.get('[data-cy="omnibar-content-panel"]');
    cy.get('[data-cy="omnibar-footer"]');
    cy.get('[data-cy="omnibar-content-panel"]').find('[data-cy="type-CPU usage"] [data-cy="20"]').click();
    waitAfterItemSelection(3);
    cy.get('[data-cy="omnibar-content-panel"]').find('[data-cy="type-CPU usage"] [data-cy="20"] input[type="checkbox"]').should('have.attr', 'aria-checked', 'true');
    cy.get('[data-cy="omnibar-content-panel"]').find('[data-cy="type-os"] [data-cy="IOS"]').click();
    waitAfterItemSelection(3);
    cy.get('[data-cy="omnibar-content-panel"]').find('[data-cy="type-os"] [data-cy="IOS"] input[type="checkbox"]').should('have.attr', 'aria-checked', 'true');
    cy.get('[data-cy="omnibar-content-panel"]').find('[data-cy="type-Performance Param"] [data-cy="30"]').click();
    waitAfterItemSelection(3);
    cy.get('[data-cy="omnibar-content-panel"]').find('[data-cy="type-Performance Param"] [data-cy="30"] input[type="checkbox"]').should('have.attr', 'aria-checked', 'true');
    cy.get('[data-cy="context-items"] [data-cy="context-tag-CPU usage"]').contains('CPU usage: 20');
    cy.get('[data-cy="context-items"] [data-cy="context-tag-os"]').contains('os: IOS');
    cy.get('[data-cy="context-items"] [data-cy="context-tag-Performance Param"]').contains('Performance Param: 30');
    cy.get('[data-cy="omnibar-close-btn"]').click();
    cy.get('[data-cy="metric-box-value"]').should('have.text', '30.0');
    cy.get('[data-cy="metric-box-unit-title"]').should('have.text', ' performance');
  });

  it('Child parameter should filter result on selection of dependent parameter in omnibar', () => {
    shared.visitPage('/uiTestMultiParamDC', 1, 'waitForMultiParamsPage');
    cy.wait('@getTOC');
    cy.get('[data-cy="omnibar-input-field"]').should('have.attr', 'placeholder', 'Type to search for a context...');
    cy.get('[data-cy="omnibar-input-field"]').click();
    shared.waitForDataCalls({ name: '@paramDataCollectors', count: 4 });
    cy.get('[data-cy="omnibarSpinnerOverlay"]').should('not.exist');
    cy.get('[data-cy="omnibar-content-panel"]').find('[data-cy="type-os"] [data-cy="Windows"]').click();
    waitAfterItemSelection(3);
    cy.get('[data-cy="omnibar-content-panel"]').find('[data-cy="type-os"] [data-cy="Windows"] input[type="checkbox"]').should('have.attr', 'aria-checked', 'true');
    cy.get('[data-cy="type-Performance Param"] [data-cy="items-count"]').contains('5 items');
    cy.get('[data-cy="omnibar-content-panel"]').find('[data-cy="type-CPU usage"] [data-cy="23"]').click();
    waitAfterItemSelection(3);
    cy.get('[data-cy="type-Performance Param"] [data-cy="items-count"]').contains('1 items');
    cy.get('[data-cy="omnibar-close-btn"]').click();
    cy.get('[data-cy="metric-box-value"]').first().contains('90.0');
  });

  it('Verify that date context is pre-populated when date parameter is used in multi-parameter data query', () => {
    navigateToVisualization();
    selectPredefinedQuery('CalendarMachineData');
    cy.get('[data-cy="visualization-section"]').click();
    cy.get('[data-cy="visualization-dropdown"]').click();
    cy.get('[data-cy="visualization-chartTypes"]').contains('Number').click();
    cy.wait(['@getChannelInfo', '@getChannelStateResponse']);
    cy.get('[placeholder="Type to add items or select from the list"]').click();
    cy.get('ux-typeahead-options-list').find('span.ux-typeahead-option').contains('performance').click();
    cy.get('[data-cy="cancel-button"]').click();
    cy.get('[data-cy="context-filter-menu"]').should('be.visible');
    cy.get('[data-cy="metric-box-value"]').should('have.text', '30.0');
    cy.get('[data-cy="omnibar-input-field"]').should('have.attr', 'placeholder', 'Type to search for a context...');
    cy.get('[data-cy="omnibar-input-field"]').click();
    shared.waitForDataCalls({ name: '@paramDataCollectors', count: 3 });
    cy.get('[data-cy="omnibarSpinnerOverlay"]').should('not.exist');
    cy.get('[data-cy="omnibar-content-panel"]').find('[data-cy="type-os"] [data-cy="Windows"]').click();
    waitAfterItemSelection(2);
    cy.get('[data-cy="omnibar-content-panel"]').find('[data-cy="type-os"] [data-cy="Windows"] input[type="checkbox"]').should('have.attr', 'aria-checked', 'true');
    cy.get('[data-cy="omnibar-content-panel"]').find('[data-cy="type-CPU usage"] [data-cy="23"]').click();
    waitAfterItemSelection(2);
    cy.get('[data-cy="omnibar-content-panel"]').find('[data-cy="type-Performance Param"] [data-cy="94"]').click();
    waitAfterItemSelection(2);
    cy.get('[data-cy="omnibar-close-btn"]').click();
    cy.get('[data-cy="metric-box-value"]').contains('94.0');
    cy.get('[data-cy="context-filter-menu"]').find('span').contains('1/2/2020');
    cy.get('[data-cy="context-filter-menu"]').find('span').contains('8/7/2021');
  });

  it('Verify category chart data is getting updated on selecting dependent parameters from omnibar', () => {
    navigateToVisualization();
    selectPredefinedQuery('Machines Performance');
    cy.get('[data-cy="visualization-section"]').click();
    cy.get('[data-cy="visualization-dropdown"]').click();
    cy.get('[data-cy="visualization-chartTypes"]').contains('Categorized bar').click();
    cy.wait(['@getChannelInfo', '@getChannelStateResponse']);
    cy.get('[placeholder="Type to add items or select from the list"]').click();
    cy.get('ux-typeahead-options-list').find('span.ux-typeahead-option').contains('performance').click();
    cy.get('[placeholder="Type to add items or select from the list"]').click();
    cy.get('input[placeholder="Select a dimension"]').click();
    cy.get(`ux-typeahead[id='options.config.graph.category-typeahead']`).find('ux-typeahead-options-list').contains('os').click();
    cy.get('[data-cy="cancel-button"]').click();
    cy.get('echarts-chart').find('[data-cy="legend-title-performance"]').should('have.text', 'performance');

    cy.get('[data-cy="echart"]').then(element => {
      cy.wrap(element).trigger('mousemove', 'center');
      cy.wrap(element).rightclick('center');
      cy.wrap(element).find('[data-cy="interactive-tooltip"]').should('be.visible');
      cy.wrap(element).find('[data-cy="interactive-tooltip"]').contains('Linux').should('be.visible');
      cy.wrap(element).find('[id="tooltipDataHostName"] span').contains('performance');
      cy.wrap(element).find('span#tooltipDataItemValue').contains('100');
      cy.wrap(element).trigger('mouseout');
    });
    cy.get('[data-cy="omnibar-input-field"]').click();
    shared.waitForDataCalls({ name: '@paramDataCollectors', count: 3 });
    cy.get('[data-cy="omnibarSpinnerOverlay"]').should('not.exist');
    cy.get('[data-cy="omnibar-content-panel"]').find('[data-cy="type-os"] [data-cy="Windows"]').click();
    waitAfterItemSelection(3);
    cy.get('[data-cy="omnibar-content-panel"]').find('[data-cy="type-os"] [data-cy="Windows"] input[type="checkbox"]').should('have.attr', 'aria-checked', 'true');
    cy.get('[data-cy="omnibar-content-panel"]').find('[data-cy="type-CPU usage"] [data-cy="23"]').click();
    waitAfterItemSelection(3);
    cy.get('[data-cy="omnibar-content-panel"]').find('[data-cy="type-Performance Param"] [data-cy="94"]').click();
    waitAfterItemSelection(3);
    cy.get('[data-cy="omnibar-close-btn"]').click();

    cy.get('[data-cy="echart"]').then(element => {
      cy.wrap(element).trigger('mousemove', 'center');
      cy.wrap(element).rightclick('center');
      cy.wrap(element).find('[data-cy="interactive-tooltip"]').contains('Windows').should('be.visible');
      cy.wrap(element).find('[id="tooltipDataHostName"] span').contains('performance');
      cy.wrap(element).find('span#tooltipDataItemValue').contains('94');
      cy.wrap(element).trigger('mouseout');
    });
  });

  it('Verify widget data & check default values get pre-selected in omnibar for predefined query having multiple parameter with default values', () => {
    navigateToVisualization();
    selectPredefinedQuery('DefaultPerformance');
    cy.get('[data-cy="visualization-section"]').click();
    cy.get('[data-cy="visualization-dropdown"]').click();
    cy.get('[data-cy="visualization-chartTypes"]').contains('Number').click();
    cy.wait(['@getChannelInfo', '@getChannelStateResponse']);
    cy.get('[placeholder="Type to add items or select from the list"]').click();
    cy.get('ux-typeahead-options-list').find('span.ux-typeahead-option').contains('performance').click();
    cy.get('[data-cy="cancel-button"]').click();
    cy.get('[data-cy="context-tag-Default CPU Usage"]').should('be.visible');
    cy.get('[data-cy="contextLabelType-Default CPU Usage"]').should('have.text', ' 53 ');
    cy.get('[data-cy="context-tag-Default OS"]').should('be.visible');
    cy.get('[data-cy="contextLabelType-Default OS"]').should('have.text', ' Linux ');
    cy.get('[data-cy="metric-box-value"]').should('have.text', '72.0');
  });

  it('Should not show the dependent parameters in omnibar when parameter dependency is removed from parameter query', () => {
    cy.wrap(dataCollector.getAllDataCollectors(bvdURL)).then(result => {
      const oneDataCollector = result.dataCollectors.find(item => item.data.variableName === 'performance');
      if (oneDataCollector) {
        dataCollector.deleteSingleQuery(bvdURL, oneDataCollector._id, result.secureModifyToken);
        shared.visitPage('/uiTestMultiParamDC', 1, 'waitForMultiParamsPage');
        cy.wait('@getTOC');
        cy.get('[data-cy="widget-title"]').should('have.text', 'Performance Metric');
        cy.get('[data-cy="metric-box-value"]').should('have.text', '90.0');
        cy.get('[data-cy="omnibar-input-field"]').should('have.attr', 'placeholder', 'Type to search for a context...');
        cy.get('[data-cy="omnibar-input-field"]').click();
        shared.waitForDataCalls({ name: '@paramDataCollectors', count: 1 });
        cy.get('[data-cy="omnibarSpinnerOverlay"]').should('not.exist');
        cy.get('[data-cy="type-CPU usage"]').should('not.exist');
        cy.get('[data-cy="type-os"]').should('not.exist');
        cy.get('[data-cy="type-Performance Param"]').should('not.exist');
        cy.get('[data-cy="type-Model Param"]').should('be.visible');
      }
    });
  });

  after(() => {
    dataCollector.deleteAllQueries(bvdURL);
  });
});

describe('Non admin access for Multiple Parameter Dependency', shared.defaultTestOptions, () => {
  bvdURL = shared.getBaseUrlForRequest(Cypress.config().baseUrl);

  before(() => {
    uploadFileRequest('foundation/bvdOnUIF/dataCollectorsMultiParams.bvddc', `${bvdURL}/rest/${Cypress.env('API_VERSION')}/dataCollector`, 1, 'dataCollectorsFile');
    createRoles();
  });

  beforeEach(() => {
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pages/toc*`
    }).as('getTOC');
    cy.intercept({ method: 'POST', url: `${Cypress.env('BVD_CONTEXT_ROOT')}/rest/${Cypress.env('API_VERSION')}/dataCollector` }).as('postDataCollector');
    cy.intercept(`${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/uiTestMultiParamDC*`).as('waitForMultiParamsPage');
    cy.intercept({
      method: 'POST',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/dataCollector/*/values`
    }).as('paramDataCollectors');
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
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/menuEntries?filter=pages`
    }).as('getMenuEntries');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/widgets?showInPalette=true`
    }).as('getWidgetPalette');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/dataCollector?type=dataQueries`
    }).as('getDataCollectors');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/dataCollector/*`
    }).as('getDataCollector');
  });

  after(() => {
    cy.bvdLogin();
    dataCollector.deleteAllQueries(bvdURL);
    cy.bvdLogout();
    role.roleDeletion(nonAdminWithDataCollectorRole, true);
    role.roleDeletion(uifRole, false);
  });

  it('Verify time-seris chart data is getting updated on selecting dependent parameters from omnibar', () => {
    cy.bvdLogout();
    cy.bvdLogin(nonAdminuserName, nonAdminuserPwd);
    navigateToVisualization();
    selectPredefinedQuery('CalendarMachineData');
    cy.get('[data-cy="visualization-section"]').click();
    cy.get('[data-cy="visualization-dropdown"]').click();
    cy.get('[data-cy="visualization-chartTypes"]').contains('Time-series line').scrollIntoView().click();
    cy.wait(['@getChannelInfo', '@getChannelStateResponse']);
    cy.get('[placeholder="Type to add items or select from the list"]').click();
    cy.get('ux-typeahead-options-list').find('span.ux-typeahead-option').contains('performance').click();
    cy.get('[placeholder="Type to add items or select from the list"]').click();
    cy.get('input[placeholder="Select a time field"]').click();
    cy.get('ux-typeahead[id="options.config.graph.timestamp-typeahead"]').contains('timestamp').click();
    cy.get('[data-cy="cancel-button"]').click();
    cy.get('echarts-chart').find('[data-cy="legend-title-performance"]').should('have.text', 'performance');
    cy.get('[data-cy="omnibar-input-field"]').click();
    shared.waitForDataCalls({ name: '@paramDataCollectors', count: 2 });
    cy.get('[data-cy="omnibarSpinnerOverlay"]').should('not.exist');
    cy.get('[data-cy="omnibar-content-panel"]').find('[data-cy="type-CPU usage"] [data-cy="53"]').click();
    waitAfterItemSelection(2);
    cy.get('[data-cy="omnibar-content-panel"]').find('[data-cy="type-os"] [data-cy="Linux"]').click();
    waitAfterItemSelection(2);
    cy.get('[data-cy="omnibar-content-panel"]').find('[data-cy="type-os"] [data-cy="Linux"] input[type="checkbox"]').should('have.attr', 'aria-checked', 'true');
    cy.get('[data-cy="omnibar-content-panel"]').find('[data-cy="type-Performance Param"] [data-cy="72"]').click();
    waitAfterItemSelection(2);
    cy.get('[data-cy="omnibar-close-btn"]').click();
    cy.get('[data-cy="echart"]').then(element => {
      cy.wrap(element).trigger('mousemove', 'center');
      cy.wrap(element).rightclick('center');
      cy.wrap(element).find('[data-cy="interactive-tooltip"]').should('be.visible');
      cy.wrap(element).find('[id="tooltipDataHostName"] span').contains('performance');
      cy.wrap(element).find('span#tooltipDataItemValue').contains('72');
      cy.wrap(element).trigger('mouseout');
    });
  });
});
