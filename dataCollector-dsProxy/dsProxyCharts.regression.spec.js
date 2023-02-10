/* eslint-disable camelcase */
// <reference types="Cypress" />
const shared = require('../../../shared/shared');
import 'cypress-file-upload';
import 'cypress-iframe';
import { uploadFileRequest } from '../../../../../support/reporting/restUtils/uploadFile';
let bvdURL = '';
const dataCollector = require('../../../../../support/reporting/restUtils/dataCollector');
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

function verifyDataOnCharts() {
  cy.get('simple-list table tbody tr td:nth-child(2)').should('have.length', 3);
  cy.get('[data-cy="oba.mambo.net"]').click();
  shared.waitForDataCalls({ name: '@getChannelStateResponse', count: 6 });
  cy.get('[data-cy="oba.mambo.net"]').click();
  shared.waitForDataCalls({ name: '@getChannelStateResponse', count: 2 });
  cy.wait(['@getChannelStateResponse']);
  // Validate BaseLine Chart
  cy.get('div.dashboard').find('div#avg_cpu_baseline_chart').prev().should('contain', 'Simple Baseline Chart');
  cy.get('#avg_cpu_baseline_chart > echarts-chart svg g[clip-path^="url"] path[d^="M"]').should('have.length', 4);
  // Validate Complex Chart
  cy.get('div.dashboard').find('div#ui-test-complex-chart-dsproxy').prev().should('contain', 'Complex Chart');
  cy.get('#ui-test-complex-chart-dsproxy [data-cy="legend-title-CPU Utilization (avg)"]').click();
  cy.get('[data-cy="CPU Utilization (avg)"] label.ux-checkbox-checked');
  cy.get('#ui-test-complex-chart-dsproxy [data-cy="legend-title-Memory Utilization (avg)"]').click();
  cy.get('[data-cy="Memory Utilization (avg)"] label.ux-checkbox-checked');
  cy.get('span.widget-title-span').contains('Tag Data Table');
  cy.get('#ui-tag-test-data-table-dataCollector ag-grid-angular').contains('ID');
  cy.get('#ui-tag-test-data-table-dataCollector ag-grid-angular').contains('Type');
  cy.get('#ui-tag-test-data-table-dataCollector ag-grid-angular').contains('Source Type');
  cy.get('#ui-tag-test-data-table-dataCollector ag-grid-angular').contains('ci_collection');
  cy.get('#ui-tag-test-data-table-dataCollector ag-grid-angular').contains('membership');
  cy.get('#ui-tag-test-data-table-dataCollector ag-grid-angular').contains('containment');
  cy.get('#ui-tag-test-data-table-dataCollector ag-grid-angular').contains('1');
  cy.get('#ui-tag-test-data-table-dataCollector ag-grid-angular div[role="row"]:nth-child(7) div[role="gridcell"]:nth-child(3) span.uif-text-cell').scrollIntoView({ offset: { bottom: 100, left: 0 }});
  cy.get('#ui-tag-test-data-table-dataCollector ag-grid-angular div[role="row"]:nth-child(10) div[role="gridcell"]:nth-child(3) span.uif-text-cell').scrollIntoView();
}

describe('DS Proxy Predefined Query with Different Charts', shared.defaultTestOptions, () => {
  beforeEach(() => {
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pages/toc*`
    }).as('getTOC');
    cy.intercept({ method: 'POST', url: `${Cypress.env('BVD_CONTEXT_ROOT')}/rest/${Cypress.env('API_VERSION')}/dataCollector` }).as('postDataCollector');
    cy.intercept(`${shared.reportingContextRoot}/rest/${Cypress.env('API_VERSION')}/system`).as('reportingPageloadSystem');
    cy.intercept(`${shared.reportingContextRoot}/rest/${Cypress.env('API_VERSION')}/session/user`).as('reportingPageloadUser');
    cy.intercept(`${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/dsProxy-ChartsForDataQuery*`).as('waitForDataCollectorPage');
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
  bvdURL = shared.getBaseUrlForRequest(Cypress.config().baseUrl);

  before(() => {
    uploadFileRequest('foundation/bvdOnUIF/BVDDataCollector.bvddc', `${Cypress.env('EXPLORE_CONTEXT_ROOT')}/rest/${Cypress.env('API_VERSION')}/dataCollector`, 1, 'dataCollectorsFile');
  });

  it('Check the Data from DataCollector is displayed on Charts', () => {
    cy.bvdLogin();
    shared.visitPage('/dsProxy-ChartsForDataQuery?_s=1615788480000&_e=1621066080000&_tft=A', 3, 'waitForDataCollectorPage');
    verifyDataOnCharts();
  });

  it('Non Admin - Check the Data from DataCollector is displayed on Charts', () => {
    cy.wrap(createRoleForNonAdmin()).then(() => {
      cy.bvdLogout();
      cy.bvdLogin(nonAdminuserName, nonAdminuserPwd);
      verifyDataOnCharts();
      cy.bvdUiLogout();
      role.roleDeletion(uifRole, false);
      role.roleDeletion(nonAdminWithDataCollectorRole, true);
    });
  });

  after(() => {
    dataCollector.deleteAllQueries(bvdURL);
  });
});
