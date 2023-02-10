/* eslint-disable camelcase */
// <reference types="Cypress" />
const shared = require('../../shared/shared');
import 'cypress-file-upload';
import 'cypress-iframe';
import { uploadFileRequest } from '../../../../support/reporting/restUtils/uploadFile';

let bvdURL = '';
const dataCollector = require('../../../../support/reporting/restUtils/dataCollector');

function addSingleColumn(columnName, NotAfirstEntry) {
  if (NotAfirstEntry) {
    cy.get('[data-cy=inlineTableNewButton]').click();
  }
  cy.get('ux-combobox[automation-id=inlineTableDropdownField] input').type(columnName);
  cy.get('ol li div').contains(columnName).click();
  cy.get('[data-cy="inlineTableInputField"]').clear();
  cy.get('[data-cy="inlineTableInputField"]').type('RowNumber');
  cy.get('[data-cy="itemActionBarInlineTableApplyButton"]').click();
}

describe('Cross Tenant Tests on Designer Dashboards Metric Box', shared.defaultTestOptions, () => {
  beforeEach(() => {
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pages/toc*`
    }).as('getTOC');
    cy.intercept({ method: 'POST', url: `${Cypress.env('BVD_CONTEXT_ROOT')}/rest/${Cypress.env('API_VERSION')}/dataCollector` }).as('postDataCollector');
    cy.intercept(`${shared.reportingContextRoot}/rest/${Cypress.env('API_VERSION')}/system`).as('reportingPageloadSystem');
    cy.intercept(`${shared.reportingContextRoot}/rest/${Cypress.env('API_VERSION')}/session/user`).as('reportingPageloadUser');
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
    dataCollector.deleteAllQueries(bvdURL, 'customer3Admin@microfocus.com', 'Control@123', 'Customer3');
    uploadFileRequest('foundation/bvdOnUIF/metricChartDataCollector_Customer3.bvddc', `${Cypress.env('EXPLORE_CONTEXT_ROOT')}/rest/${Cypress.env('API_VERSION')}/dataCollector`, 1, 'dataCollectorsFile', 'customer3Admin@microfocus.com', 'Control@123', 'Customer3');
  });

  it('Check the Data from DataCollector is displayed on Charts in New Tenant', () => {
    cy.bvdLogout();
    cy.visit('?tenant=Customer3');
    cy.get('#username').should('be.visible');
    cy.get('#username').type('customer3Admin@microfocus.com');
    cy.get('#password').type('Control@123');
    cy.get('#submit').should('be.visible').click();
    cy.wait(['@getTOC']);
    cy.visit('/testMetricBoxWidget');
    cy.wait(['@getTOC', '@getChannelInfo']);
    cy.get('[data-cy="page-actions"]').click();
    cy.wait(['@getTOC', '@getChannelStateResponse']);
    cy.get('[data-cy="page-action-item-addWidget"]');
    cy.get('[data-cy="page-action-item-addWidget"]').click();
    cy.get('[data-cy="widget-types"]');
    cy.get('[data-cy="widget-type-dataVisualization"]').click();
    cy.get('div.dashboard-widget-container').should('have.length', 2);
    cy.wait('@getChannelStateResponse');
    cy.get('[data-cy="widgetNameInput"]').click();
    cy.get('[data-cy="widgetNameInput"]').clear();
    cy.get('[data-cy="widgetNameInput"]').type('Metric Widget 1');
    cy.contains('Metric Widget 1').parent('h5').should('have.class', 'dashboard-widget-title');
    cy.get('[data-cy="data-collector-dropdown"]');
    cy.get('[data-cy="data-collector-dropdown"] div button').click();
    cy.get('div[role="menu"].ux-menu div span').should('have.length', 4);
    const expectedPredefinedQueries = ['ComplexChartdata1', 'MachinesData', 'Page Load Time', 'sample_test_dateparam_test1'];
    cy.get('div[role="menu"].ux-menu div span').each(($elem, index) => {
      expect(expectedPredefinedQueries[index]).contains($elem.text().trim());
    });
    cy.get('input[placeholder="Search predefined queries"]').type('Page Load Time');
    cy.contains('Page Load Time').click();
    addSingleColumn('value');
    cy.get('label[for="ux-checkbox-1-input"]').click();
    cy.get('[data-cy="time-column"] input[role="combobox"]').click();
    cy.get('ux-checkbox[data-cy="time-checkbox"]~div ux-typeahead-options-list li:nth-child(1)').click();
    cy.get('[data-cy="submit-button"]').click();
    cy.get('div#line').should('have.class', 'active');
    cy.wait('@getChannelInfo');
    cy.get('[data-cy="notification-info-text"]').should('have.text', ' No data ');
    cy.wait('@getChannelStateResponse');
    cy.get('div#metricBox').click();
    cy.contains('Metric Widget 1').parent('h5').should('have.class', 'dashboard-widget-title');
    cy.wait(['@getChannelInfo', '@getChannelStateResponse']);
    cy.get('ux-dashboard-widget mondrian-widget metric-box').last().find('uis-spinner-overlay').find('.spinner-overlay').should('be.hidden');
    cy.get('mondrian-widget metric-box h1').last().should('have.text', '6.1');
    cy.get('[data-cy="cancel-button"]').click();
    cy.get('[data-cy="action-button"]').last().click();
    cy.get('[data-cy="action-button-edit"]').click();
    cy.get('[data-cy="action-item-qtm-icon-edit-button"]').click();
    cy.wait(['@getChannelInfo']);
    cy.get('div.ux-side-panel-host').find('uis-spinner-overlay').find('.spinner-overlay').should('be.hidden');
    cy.wait(['@getChannelStateResponse']);
    cy.contains('Page Load Time').click();
    cy.get('input[placeholder="Search predefined queries"]');
    cy.get('input[placeholder="Search predefined queries"]').click();
    cy.get('div[role="menu"].ux-menu').should('be.visible');
    cy.get('div[role="menu"].ux-menu').should('be.visible');
    cy.get('input[placeholder="Search predefined queries"]').type('ComplexChartdata1');
    cy.get('div.drop-down-item').should('be.visible');
    cy.contains('ComplexChartdata1');
    cy.contains('ComplexChartdata1').trigger('mouseover').click();
    // remove true once ux issue is resolved
    addSingleColumn('data1', true);
    cy.get('[data-cy="time-checkbox"]').click();
    cy.get('[data-cy="time-column"] input[role="combobox"]').click();
    cy.get('ux-checkbox[data-cy="time-checkbox"]~div ux-typeahead-options-list li:nth-child(1)').click();
    cy.get('[data-cy="submit-button"]').click();
    cy.get('div#metricBox').should('have.class', 'active');
    cy.wait(['@getChannelInfo', '@getChannelStateResponse']);
    cy.get('ux-dashboard-widget mondrian-widget metric-box').last().find('uis-spinner-overlay').find('.spinner-overlay').should('be.hidden');
    cy.get('mondrian-widget metric-box h1').last().should('have.text', '10.0');
    cy.get('[data-cy="cancel-button"]').click();
    cy.get('[data-cy="page-actions"]').click();
    cy.get('[data-cy="page-action-item-newPage"]').click();
    cy.get('[data-cy="mondrianModalDialogButton"]').click();
    cy.wait('@getTOC');
    cy.get('[data-cy="widget-types"]');
    cy.get('[data-cy="widget-type-dataVisualization"]').click();
    cy.get('div.dashboard-widget-container').should('have.length', 1);
    cy.wait('@getChannelStateResponse');
    cy.get('[data-cy="widgetNameInput"]').click();
    cy.get('[data-cy="widgetNameInput"]').clear();
    cy.get('[data-cy="widgetNameInput"]').type('Metric Widget 2');
    cy.wait('@getChannelStateResponse');
    cy.contains('Metric Widget 2').parent('h5').should('have.class', 'dashboard-widget-title');
    cy.get('[data-cy="data-collector-dropdown"]');
    cy.get('[data-cy="data-collector-dropdown"] div button').click();
    cy.get('input[placeholder="Search predefined queries"]').type('Page Load Time');
    cy.contains('Page Load Time').click();
    addSingleColumn('value');
    cy.get('[data-cy="time-checkbox"]').click();
    cy.get('[data-cy="time-column"] input[role="combobox"]').click();
    cy.get('ux-checkbox[data-cy="time-checkbox"]~div ux-typeahead-options-list li:nth-child(1)').click();
    cy.get('[data-cy="submit-button"]').click();
    cy.wait('@getChannelInfo');
    cy.get('div#line').should('have.class', 'active');
    cy.get('div.alert-content span').should('have.text', ' No data ');
    cy.wait('@getChannelStateResponse');
    cy.get('div#metricBox').click();
    cy.contains('Metric Widget 2').parent('h5').should('have.class', 'dashboard-widget-title');
    cy.wait(['@getChannelInfo', '@getChannelStateResponse']);
    cy.get('ux-dashboard-widget mondrian-widget metric-box').last().find('uis-spinner-overlay').find('.spinner-overlay').should('be.hidden');
    cy.get('mondrian-widget metric-box h1').last().should('have.text', '6.1');
  });
  after(() => {
    dataCollector.deleteAllQueries(bvdURL, 'customer3Admin@microfocus.com', 'Control@123', 'Customer3');
  });
});

describe('Cross Tenant Tests on Designer Dashboards Data Table', shared.defaultTestOptions, () => {
  beforeEach(() => {
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pages/toc*`
    }).as('getTOC');
    cy.intercept({ method: 'POST', url: `${Cypress.env('BVD_CONTEXT_ROOT')}/rest/${Cypress.env('API_VERSION')}/dataCollector` }).as('postDataCollector');
    cy.intercept(`${shared.reportingContextRoot}/rest/${Cypress.env('API_VERSION')}/system`).as('reportingPageloadSystem');
    cy.intercept(`${shared.reportingContextRoot}/rest/${Cypress.env('API_VERSION')}/session/user`).as('reportingPageloadUser');
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
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/testMetricBoxWidget*`
    }).as('getMetricBoxWidget');
  });
  bvdURL = shared.getBaseUrlForRequest(Cypress.config().baseUrl);

  before(() => {
    dataCollector.deleteAllQueries(bvdURL, 'customer3Admin@microfocus.com', 'Control@123', 'Customer3');
    uploadFileRequest('foundation/bvdOnUIF/tableWidgetDataCollector.bvddc', `${Cypress.env('EXPLORE_CONTEXT_ROOT')}/rest/${Cypress.env('API_VERSION')}/dataCollector`, 1, 'dataCollectorsFile', 'customer3Admin@microfocus.com', 'Control@123', 'Customer3');
  });

  it('Check the add remove widget properties on a page for Data table in a Non default Tenant', () => {
    cy.bvdLogout();
    cy.visit('?tenant=Customer3');
    cy.get('#username').should('be.visible');
    cy.get('#username').type('customer3Admin@microfocus.com');
    cy.get('#password').type('Control@123');
    cy.get('#submit').should('be.visible').click();
    cy.wait(['@getTOC']);
    cy.visit('/testMetricBoxWidget?_s=1634898600000&_e=1635831000000&_tft=A');
    cy.wait(['@getMetricBoxWidget', '@getChannelInfo', '@getChannelStateResponse']);
    shared.waitForDataCalls({ name: '@getTOC', count: 2 });
    cy.get('[data-cy="page-actions"]').click();
    cy.get('[data-cy="page-action-item-addWidget"]');
    cy.get('[data-cy="page-action-item-addWidget"]').click();
    cy.get('[data-cy="widget-types"]');
    cy.get('[data-cy="widget-type-table"]').click();
    cy.wait(['@getChannelStateResponse']);
    cy.get('div.dashboard-widget-container').should('have.length', 2);
    cy.get('[data-cy="widgetNameInput"]').click();
    cy.get('[data-cy="widgetNameInput"]').clear();
    cy.get('[data-cy="widgetNameInput"]').type('TableWidget1');
    cy.contains('TableWidget1').parent('h5').should('have.class', 'dashboard-widget-title');
    cy.get('[data-cy="data-collector-dropdown"]');
    cy.get('[data-cy="data-collector-dropdown"] div button').click();
    cy.get('input[placeholder="Search predefined queries"]').type('KeyValueDC');
    cy.wait(['@getChannelStateResponse']);
    cy.contains('KeyValueDC').click();
    cy.get('span[ref="eCellValue"]').should('have.length', 51);
    cy.wait(['@getChannelInfo', '@getChannelStateResponse']);
    cy.get('ux-dashboard-widget mondrian-widget').last().find('uis-spinner-overlay').find('.spinner-overlay').should('be.hidden');
    cy.get('div.ux-side-panel-host').find('uis-spinner-overlay').find('.spinner-overlay').should('be.hidden');
    cy.get('[data-cy="cancel-button"]');
    cy.get('[data-cy="cancel-button"]').click();
    cy.get('[data-cy="action-button"]').last().click();
    cy.get('[data-cy="action-button-edit"]').click();
    cy.get('div.ux-side-panel-host').find('uis-spinner-overlay').find('.spinner-overlay').should('be.hidden');
    cy.contains('KeyValueDC').click();
    cy.get('input[placeholder="Search predefined queries"]');
    cy.get('input[placeholder="Search predefined queries"]').click();
    cy.get('div[role="menu"].ux-menu').should('be.visible');
    cy.get('div[role="menu"].ux-menu').should('be.visible');
    cy.get('input[placeholder="Search predefined queries"]').type('data_query');
    cy.get('div.drop-down-item').should('be.visible');
    cy.contains('data_query');
    cy.contains('data_query').trigger('mouseover').click();
    cy.wait(['@getChannelInfo', '@getChannelStateResponse']);
    cy.get('span[ref="eCellValue"]').should('have.length', 34);
    cy.get('ux-dashboard-widget mondrian-widget').last().find('uis-spinner-overlay').find('.spinner-overlay').should('be.hidden');
    cy.get('div.ux-side-panel-host').find('uis-spinner-overlay').find('.spinner-overlay').should('be.hidden');
    cy.get('[data-cy="cancel-button"]');
    cy.get('[data-cy="cancel-button"]').click();
    cy.get('[data-cy="action-button"]').last().click();
    cy.get('[data-cy="action-button-refreshWidget"]').click();
    cy.wait(['@getChannelInfo', '@getChannelStateResponse']);
    cy.get('span[ref="eCellValue"]').should('have.length', 34);
    cy.get('div.dashboard-widget-container').should('have.length', 2);
    cy.get('[data-cy="action-button"]').last().click();
    cy.get('[data-cy="action-button-duplicateWidget"]').click();
    cy.wait(['@getChannelInfo', '@getChannelStateResponse']);
    cy.get('div.dashboard-widget-container').should('have.length', 3);
    cy.contains('Copy of TableWidget1').parent('h5').should('have.class', 'dashboard-widget-title');
    cy.get('div.dashboard-widget-container').last().find('span[ref="eCellValue"]').should('have.length', 34);
    cy.get('[data-cy="action-button"]').last().click();
    cy.get('[data-cy="action-button-removeWidget"]').click();
    cy.get('div.dashboard-widget-container').should('have.length', 2);
    cy.get('span[ref="eCellValue"]').should('have.length', 34);
    cy.contains('Copy of TableWidget1').should('not.exist');
  });
  after(() => {
    dataCollector.deleteAllQueries(bvdURL, 'customer3Admin@microfocus.com', 'Control@123', 'Customer3');
  });
});
