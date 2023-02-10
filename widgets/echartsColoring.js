// <reference types="Cypress" />
const shared = require('../../../shared/shared');
const { uploadFileRequest } = require('../../../../../support/reporting/restUtils/uploadFile');
const dataCollector = require('../../../../../support/reporting/restUtils/dataCollector');
let bvdURL = '';

const selectColorMapping = function(widgetId, mapping, initialMapping) {
  cy.get(`[id^=${widgetId}] [data-cy="action-button"]`).click();
  cy.get('[data-cy="action-button-edit"]').click();
  cy.get('right-side-panel > ux-side-panel').should('have.class', 'open');
  cy.get('[data-cy="color-mapping-input"]').should('be.visible').should('contain', initialMapping).click();
  cy.get(`[data-cy=option-${mapping}]`).click();
  cy.wait(['@getDataCollector', '@channelState']);
  cy.get('[data-cy=default-option]').should('not.exist');
  cy.get('[data-cy=btn-side-panel-close]').click();
  cy.get('ux-side-panel').should('not.exist');
  cy.get('[data-cy=spinnerOverlay]').should('not.be.visible');
};

describe('EChart Coloring', shared.defaultTestOptions, () => {
  beforeEach(() => {
    cy.intercept({
      method: 'POST',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/datasource/ws/data`
    }).as('getWebapiData');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/echartColorMapping*`
    }).as('getPage');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pages/toc*`
    }).as('getTOC');
    cy.intercept({
      method: 'POST',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/dataCollector/channel`
    }).as('getDataCollector');
    cy.intercept({
      method: 'POST',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/channel/state`
    }).as('channelState');
    cy.bvdLogin();
    cy.visit('/echartColorMapping');
    cy.wait(['@getPage', '@getTOC', '@getDataCollector', '@getDataCollector', '@getDataCollector', '@getDataCollector', '@getDataCollector', '@channelState']);
    cy.get('echarts-chart').find('mondrian-spinner-overlay').find('.spinner-overlay').should('be.hidden');
  });

  bvdURL = shared.getBaseUrlForRequest(Cypress.config().baseUrl);

  before(() => {
    uploadFileRequest('foundation/bvdOnUIF/colorMappingDataCollectors.bvddc', `${bvdURL}/rest/${Cypress.env('API_VERSION')}/dataCollector`, 1, 'dataCollectorsFile');
  });

  it('should color chart according to set color mapping', () => {
    cy.get('#severityColorsChart').find('#normal').parent().find('path').should('have.attr', 'fill', '#1AAC60');
    cy.get('#severityColorsChart').find('#critical').parent().find('path').should('have.attr', 'fill', '#E5004C');
    cy.get('#severityColorsChart').find('#major').parent().find('path').should('have.attr', 'fill', '#F48B34');
    cy.get('#priorityColorsChart').find('#lowest').parent().find('path').should('have.attr', 'fill', '#DCDEDF');
    cy.get('#priorityColorsChart').find('#low').parent().find('path').should('have.attr', 'fill', '#656668');
    cy.get('#errorStateColorsChart').find('#info').parent().find('path').should('have.attr', 'fill', '#29CEFF');
    cy.get('#errorStateColorsChart').find('#severe').parent().find('path').should('have.attr', 'fill', '#E5004C');

    cy.get('#coloredLineChart [data-cy="echarts-legend-CPU Utilization (avg): host_name: oba.mambo.net"] .legend-svg path').should('have.attr', 'fill', '#FFB000');
    cy.get('#coloredLineChart [data-cy="echarts-legend-CPU Utilization (avg): host_name: vdb.mambo.net"] .legend-svg path').should('have.attr', 'fill', '#C6179D');
    cy.get('#coloredLineChart [data-cy="echarts-legend-Memory Utilization (avg): host_name: vdb.mambo.net"] .legend-svg path').should('have.attr', 'fill', '#3939C6');
  });

  it('should edit color mapping in edit widget panel', () => {
    cy.get('[id^=chartMappingExample] #critical').scrollIntoView().parent().find('path').should('have.attr', 'fill', '#3939C6');
    cy.get('[id^=chartMappingExample] #major').parent().find('path').should('have.attr', 'fill', '#E57828');
    selectColorMapping('chartMappingExample', 'SeverityMapping', 'Default color sequence');
    cy.get('[id^=chartMappingExample] #critical').scrollIntoView().parent().find('path').should('have.attr', 'fill', '#E5004C');
    cy.get('[id^=chartMappingExample] #major').parent().find('path').should('have.attr', 'fill', '#F48B34');
    selectColorMapping('chartMappingExample', 'ErrorStateMapping', 'Severity mapping');
    cy.get('[id^=chartMappingExample] #critical').scrollIntoView().parent().find('path').should('have.attr', 'fill', '#E5004C');
    cy.get('[id^=chartMappingExample] #major').parent().find('path').should('have.attr', 'fill', '#3939C6');
    cy.get('[id^=chartMappingExample] #minor').parent().find('path').should('have.attr', 'fill', '#E57828');
    cy.get('[id^=chartMappingExample] #normal').parent().find('path').should('have.attr', 'fill', '#1AAC60');
  });

  it('should display color mappings grouped', () => {
    cy.get('[id^=chartMappingExample] [data-cy="action-button"]').click();
    cy.get('[data-cy="action-button-edit"]').click();
    cy.get('right-side-panel > ux-side-panel').should('have.class', 'open');
    cy.get('[data-cy="color-mapping-input"]').should('be.visible').click();
    cy.get('[data-cy=option-HostNameMapping]').should('not.exist');
    cy.get('[data-cy=option-hostname-mappings]').click();
    cy.get('[data-cy=option-HostNameMapping]').should('be.visible');
  });

  it('should display initial color mapping in edit widget', () => {
    selectColorMapping('barChartWithColorMapping', 'PriorityMapping', 'Severity mapping');
    cy.get('[id^=barChartWithColorMapping] #normal').parent().find('path').should('have.attr', 'fill', '#29CEFF');
  });

  after(() => {
    cy.bvdLogout();
    dataCollector.deleteAllQueries();
  });
});
