const shared = require('../../shared/shared');
import 'cypress-file-upload';
import { uploadFileRequest } from '../../../../support/reporting/restUtils/uploadFile';
const dataCollector = require('../../../../support/reporting/restUtils/dataCollector');
let bvdURL = '';

function addQuery() {
  cy.visit('/');
  cy.wait('@getTOC');
  cy.wait(['@menuEntry']);
  cy.get('[data-cy="masthead-design-button"]').contains('DESIGN').click();
  cy.wait('@getTOC');
  cy.get('[data-cy="widget-type-dataVisualization"]').click();
  cy.wait('@channelState');
  cy.get('[data-cy="data-collector-dropdown"]').click();
  cy.get('.filter-container > input').type('Category chart query');
  cy.get('.dropdown-options').contains('Category chart query').click();
  cy.wait('@selectDataCollector');
}

describe('Bar chart - Category coloring', shared.defaultTestOptions, () => {
  bvdURL = shared.getBaseUrlForRequest(Cypress.config().baseUrl);

  before(() => {
    uploadFileRequest('foundation/bvdOnUIF/categoryBarChartDataCollector.bvddc', `${Cypress.env('EXPLORE_CONTEXT_ROOT')}/rest/${Cypress.env('API_VERSION')}/dataCollector`, 1, 'dataCollectorsFile');
  });

  beforeEach(() => {
    cy.intercept({
      method: 'POST',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/datasource/ws/data`
    }).as('getWebapiData');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/colorMapping*`
    }).as('getPage');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pages/toc*`
    }).as('getTOC');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/menuEntries*`
    }).as('menuEntry');
    cy.intercept({
      method: 'POST',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/dataCollector/channel`
    }).as('getDataCollector');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/dataCollector/*`
    }).as('selectDataCollector');
    cy.intercept({
      method: 'POST',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/channel/state`
    }).as('channelState');
    cy.bvdLogin();
    addQuery();
  });

  it('Single series bar chart', () => {
    // select bar chart visualization.
    cy.get('[data-cy="visualization-section"]').click();
    cy.get('[data-cy="visualization-dropdown"] button').click();
    cy.get('[data-cy="visualization-chartTypes"]').contains('Categorized bar').click();
    cy.wait('@channelState');
    // select active cpu in metric.
    cy.get('ux-combobox[id="options.config.graph.value"] input').click();
    cy.get('ux-combobox[id="options.config.graph.value"] ux-typeahead-options-list').find('li[id="options.config.graph.value-typeahead-option-0"]').click();
    cy.get('ux-combobox[id="options.config.graph.value"] input').click();
    // add zone in groupby.
    cy.get('ux-combobox[id="options.config.graph.category"] input').click();
    cy.get(`ux-typeahead-options-list`).find('li[id="options.config.graph.category-typeahead-option-2"]').click();
    cy.get('[data-cy="cancel-button"]').click();
    cy.wait('@channelState');

    cy.get('echarts-chart').find('svg').find('g').eq(0).then(gElement => {
      cy.wrap(gElement).find('path[fill="#E57828"]').should('be.visible');
      cy.wrap(gElement).find('path[fill="#00ABF3"]').should('be.visible');
      cy.wrap(gElement).find('path[fill="#9B1E83"]').should('be.visible');
    });
  });

  it('Multi series and stacked bar chart', () => {
    cy.get('[data-cy="visualization-section"]').click();
    cy.get('[data-cy="visualization-dropdown"] button').click();
    cy.get('[data-cy="visualization-chartTypes"]').contains('Categorized bar').click();
    cy.wait('@channelState');
    // select active cpu and idle cpu in metric.
    cy.get('ux-combobox[id="options.config.graph.value"] input').click();
    cy.get('ux-combobox[id="options.config.graph.value"] ux-typeahead-options-list').find('li[id="options.config.graph.value-typeahead-option-0"]').click();
    cy.get('ux-combobox[id="options.config.graph.value"] ux-typeahead-options-list').find('li[id="options.config.graph.value-typeahead-option-1"]').click();
    cy.get('ux-combobox[id="options.config.graph.value"] input').click();
    cy.wait('@channelState');
    // add zone in groupby.
    cy.get('ux-combobox[id="options.config.graph.category"] input').click();
    cy.get(`ux-typeahead-options-list`).find('li[id="options.config.graph.category-typeahead-option-2"]').click();
    cy.get('echarts-chart').find('svg').find('g').eq(0).then(gElement => {
      cy.wrap(gElement).find('path[fill="#E57828"]').should('be.visible').and('have.length', '3');
      cy.wrap(gElement).find('path[fill="#3939C6"]').should('be.visible').and('have.length', '3');
    });
    cy.get('[data-cy="visualization-option-section"]').click();
    cy.get('.ux-toggleswitch-container').click();
    cy.get('echarts-chart').find('svg').find('g').eq(0).then(gElement => {
      cy.wrap(gElement).find('path[fill="#E57828"]').should('be.visible').and('have.length', '3');
      cy.wrap(gElement).find('path[fill="#3939C6"]').should('be.visible').and('have.length', '3');
    });
    cy.get('[data-cy="cancel-button"]').click();
  });

  after(() => {
    dataCollector.deleteAllQueries(bvdURL);
  });
});
