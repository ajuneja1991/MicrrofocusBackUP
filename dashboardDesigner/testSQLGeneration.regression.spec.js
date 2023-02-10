/* eslint-disable camelcase */
// <reference types="Cypress" />
const shared = require('../../../shared/shared');
import 'cypress-file-upload';
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

function openDataVisualizationSection() {
  cy.visit('/');
  cy.wait(['@getTOC', '@getMenuEntries', '@getTOC']);
  cy.get('[data-cy=masthead-design-button]').click();
  cy.wait('@getTOC');
  cy.get('[data-cy=widget-type-dataVisualization]').click();
  cy.wait(['@getWidgetPalette', '@getDataCollectors', '@getChannelStateResponse']);
}

function navigateToEditQuery() {
  openDataVisualizationSection();
  cy.get('[data-cy="new-data-definition"]').click();
  cy.wait(['@getEditQueryUI', '@postVerticaData', '@getDataCollectors']);
}

const checkColumnAndValues = (columnNames = [], columnValues = []) => {
  columnNames.forEach(columnName => {
    cy.get(`[data-cy="heading-name-${columnName}"]`);
  });
  columnValues.forEach(columnValue => {
    cy.get(`[data-cy="column-value-${columnValue}"]`);
  });
};

describe('Generate a SQL query using data collectors from a UI', shared.defaultTestOptions, () => {
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
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/dataCollector?type=dataQueries`
    }).as('getDataCollectors');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/widgets?showInPalette=true`
    }).as('getWidgetPalette');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/widgets/edit_query_ui`
    }).as('getEditQueryUI');
    cy.intercept({
      method: 'POST',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/datasource/vertica/data`
    }).as('postVerticaData');
    cy.intercept({
      method: 'POST',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/dataCollector/test`
    }).as('postQuery');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/menuEntries?filter=pages`
    }).as('getMenuEntries');
    cy.bvdLogin();
  });

  it('Verify left panel navigation on clicking Edit Query & Query sections in Edit Query', () => {
    cy.visit('/');
    cy.wait(['@getTOC', '@getMenuEntries', '@getTOC']);
    cy.get('[data-cy=masthead-design-button]').click();
    cy.wait('@getTOC');
    cy.get('[data-cy=widget-type-dataVisualization] > .widget-type-title').should('have.text', ' Data Visualization ');
    cy.get('[data-cy=widget-type-dataVisualization]').click();
    cy.wait(['@getWidgetPalette', '@getDataCollectors', '@getChannelStateResponse']);
    cy.get('[data-cy="side-panel-header"] h2').should('have.text', 'Edit Data Visualization');
    cy.get('[data-cy="new-data-definition"]').click();
    cy.wait(['@getEditQueryUI', '@postVerticaData', '@getDataCollectors']);
    cy.get('div.ux-side-panel-host').should('have.length', 2);
    cy.get('div.ux-side-panel-header').contains('New Data Definition').should('be.visible');
    cy.get('[automation-id="sideMenuItem"]').should('have.attr', 'placement', 'right');
    cy.get('[automation-id="sideMenuItem"] button').first().should('have.class', 'ux-side-menu-item-active');
    cy.get('div.ux-side-menu-item-content div').first().should('have.text', 'GENERAL');
    cy.get('[data-cy="query-section"] h3').should('have.text', 'QUERY');
    cy.get('div.ux-side-menu-item-content').contains('QUERY').click();
    cy.get('[data-cy="query-button"]').should('be.visible');
    cy.get('[data-cy="paper-size-label"]').should('have.text', ' Table*');
    cy.get('[data-cy="table-list-dropdown"]').should('be.visible');
    cy.get('[data-cy="description-text-table-selection"]').contains('Select a database table to query to continue.');
    cy.get('[data-cy="table-list-dropdown"]').should('be.visible');
    cy.get('[data-cy="query-button"]').click();
    cy.get('[data-cy="paper-size-label"]').contains('SQL Query');
    cy.get('[data-cy="sql-query-text"]').should('be.visible');
    cy.get('[data-cy="run-query"]').should('be.visible');
  });

  it('Verify user is able to browse and select tables from vertica database in edit query panel', () => {
    const tableName = 'CategoryChartTable';
    navigateToEditQuery();
    cy.get('[data-cy="table-list-dropdown"]').click();
    cy.get('[data-cy="table-list-dropdown"]').type(tableName);
    cy.get('ux-typeahead-options-list li').should('have.length', 1);
    cy.get('span.ux-filter-match').should('have.text', tableName);
    cy.get('ux-typeahead-options-list').contains(tableName).click();
    cy.wait('@postVerticaData');
    cy.get('[data-cy="preview-table"]').should('be.visible');
    cy.get('[data-cy="table-result"]').should('be.visible');
    const columnNames = ['hostname', 'Data1', 'Data2', 'id', 'category'];
    columnNames.forEach(columnName => {
      cy.get(`[data-cy="heading-name-${columnName}"]`);
    });
    cy.get('[data-cy="table-result"] tbody td').contains('host1');
  });

  it('Verify user is able to write & run an sql query and able to see correct result under preview section in edit query panel', () => {
    const query = `select * from machinesdata where os like '%Win%' order by performance limit 3`;
    openDataVisualizationSection();
    cy.get('[data-cy="new-data-definition"]').click();
    cy.wait(['@getEditQueryUI', '@postVerticaData', '@getDataCollectors']);
    cy.get('div.ux-side-menu-item-content div').first().should('have.text', 'GENERAL');
    cy.get('div.ux-side-menu-item-content div').eq(1).should('have.text', 'QUERY');
    cy.get('[data-cy="data-definition-label"]').clear().type('TestQuery');
    cy.get('[data-cy="data-definition-description"]').type('This is test query 123 for testing sql free editing.');
    cy.get('[data-cy="query-button"]').click();
    cy.get('[data-cy="paper-size-label"]').should('have.text', ' SQL Query *');
    cy.get('[data-cy="sql-query-text"]').should('be.visible');
    cy.get('[data-cy="sql-query-text"]').type(query);
    cy.get('[data-cy="run-query"]').click();
    cy.wait('@postQuery');
    cy.get('[data-cy="preview-table"]').should('be.visible');
    cy.get('[data-cy="table-result"]').should('be.visible');
    const columnNames = ['id', 'model_name', 'cpu_usage', 'performance', 'process', 'os', 'timestamp'];
    const columnValues = ['1', 'Elite Display e233', '26', '89', 'node', 'Windows', '2021-06-02'];
    checkColumnAndValues(columnNames, columnValues);
    // Check for the warning shown if the query has been modified.
    cy.get('[data-cy="sql-query-text"]').clear().type('select 12 as id');
    cy.get('[data-cy="sql-modified-warning-message"]');
    cy.get('[data-cy="submit-button"]').should('be.disabled');
  });

  // Skipping this test due to an existing defect https://internal.almoctane.com/ui/entity-navigation?p=97002/8001&entityType=work_item&id=1772747
  // eslint-disable-next-line mocha/no-skipped-tests
  it.skip('Verify error messages on edit query panel', () => {
    navigateToEditQuery();
    cy.get('[data-cy="data-definition-description"]').click();
    cy.get('[data-cy="empty-display-label-error"]').should('have.text', ' Display label needs to be specified ');
    cy.get('[data-cy="query-button"]').click();
    cy.get('[data-cy="paper-size-label"]').should('have.text', ' SQL Query *');
    cy.get('[data-cy="sql-query-text"]').should('be.visible');
    cy.get('[data-cy="sql-query-text"]').clear().type('test');
    cy.get('[data-cy="run-query"]').click();
    cy.get('[data-cy="invalid-query-error"]').should('be.visible');
    cy.get('[data-cy="sql-query-text"]').type('select * from');
    cy.get('[data-cy="run-query"]').click();
    cy.get('[data-cy="invalid-query-error"]').contains('Error while running the query. Syntax error at or near "EOL"');
  });

  after(() => {
    dataCollector.deleteAllQueries(bvdURL);
  });
});

describe('Non admin access for Edit Query', shared.defaultTestOptions, () => {
  bvdURL = shared.getBaseUrlForRequest(Cypress.config().baseUrl);

  before(() => {
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
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/widgets?showInPalette=true`
    }).as('getWidgetPalette');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/widgets/edit_query_ui`
    }).as('getEditQueryUI');
    cy.intercept({
      method: 'POST',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/datasource/vertica/data`
    }).as('postVerticaData');
    cy.intercept({
      method: 'POST',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/dataCollector/test`
    }).as('postQuery');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/menuEntries?filter=pages`
    }).as('getMenuEntries');
  });

  after(() => {
    cy.bvdLogin();
    dataCollector.deleteAllQueries(bvdURL);
    cy.bvdLogout();
    role.roleDeletion(nonAdminWithDataCollectorRole, true);
    role.roleDeletion(uifRole, false);
  });

  it(`Verify that non admin user can browse a table and same result shown after running select query in edit query panel`, () => {
    cy.bvdLogout();
    cy.bvdLogin(nonAdminuserName, nonAdminuserPwd);
    navigateToEditQuery();
    const tableName = 'samplewidget';
    const columnNames = ['id', 'nodename', 'nodevalue'];
    const columnValues = ['1', 'abc', '0'];
    navigateToEditQuery();
    cy.get('[data-cy="table-list-dropdown"]').click();
    cy.get('[data-cy="table-list-dropdown"]').type(tableName);
    cy.get('span.ux-filter-match').should('have.text', tableName);
    cy.get('ux-typeahead-options-list').contains(tableName).first().click();
    cy.wait('@postVerticaData');
    cy.get('[data-cy="preview-table"]').should('be.visible');
    cy.get('[data-cy="table-result"]').should('be.visible');
    checkColumnAndValues(columnNames, columnValues);
    cy.get('[data-cy="query-button"]').click();
    cy.get('[data-cy="paper-size-label"]').contains('SQL Query');
    cy.get('[data-cy="sql-query-text"]').should('be.visible');
    cy.get('[data-cy="run-query"]').click();
    cy.wait('@postQuery');
    cy.get('[data-cy="preview-table"]').should('be.visible');
    cy.get('[data-cy="table-result"]').should('be.visible');
    checkColumnAndValues(columnNames, columnValues);
  });
});
