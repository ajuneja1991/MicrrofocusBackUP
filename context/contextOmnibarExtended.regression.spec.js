const shared = require('../../../shared/shared');
import 'cypress-file-upload';
import { uploadFileRequest } from '../../../../../support/reporting/restUtils/uploadFile';
const dataCollector = require('../../../../../support/reporting/restUtils/dataCollector');
let bvdURL = '';

function addQuery() {
  cy.visit('/');
  cy.wait('@getTOC');
  cy.get('[data-cy="masthead-design-button"]').contains('DESIGN').click();
  cy.wait('@getTOC');
  cy.get('[data-cy="widget-type-dataVisualization"]').click();
  cy.wait('@channelState');
  cy.get('[data-cy="data-collector-dropdown"]').click();
  cy.get('.filter-container > input').type('resource');
  cy.get('.dropdown-options').contains('resource').click();
  cy.wait('@selectDataCollector');
}

describe('Validate Omnibar/ContextView component with many items', shared.defaultTestOptions, () => {
  bvdURL = shared.getBaseUrlForRequest(Cypress.config().baseUrl);
  before(() => {
    uploadFileRequest('foundation/bvdOnUIF/omnibar_query_multipleDataSets.bvddc', `${Cypress.env('EXPLORE_CONTEXT_ROOT')}/rest/${Cypress.env('API_VERSION')}/dataCollector`, 1, 'dataCollectorsFile');
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
      method: 'POST',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/dataCollector/channel`
    }).as('getDataCollector');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/dataCollector/*`
    }).as('selectDataCollector');
    cy.intercept({
      method: 'POST',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/dataCollector/*/values`
    }).as('paramDataCollectors');
    cy.intercept({
      method: 'POST',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/channel/state`
    }).as('channelState');
    cy.bvdLogin();
    addQuery();
  });

  it('Validate omnibar with 1000 items and 50 context types', () => {
    cy.get('[data-cy="visualization-section"]').click();
    cy.get('[data-cy="visualization-dropdown"]').click();
    cy.get('.drop-down-option > span > span').contains('Categorized bar').click();
    cy.wait('@channelState');
    cy.get('ux-combobox[id="options.config.graph.value"]').click();
    cy.get('[id="options.config.graph.value-typeahead-option-5"]').click();
    cy.get('ux-combobox[id="options.config.graph.value"]').click();
    cy.get('[id="options.config.graph.category-input"]').click();
    cy.get('[id="options.config.graph.category-typeahead"]').find('li').contains('type').click();
    cy.get('[data-cy="omnibar-input-field"]').click();
    shared.waitForDataCalls({ name: '@paramDataCollectors', count: 7 });
    cy.get('div[class="omnibar-types"]>uif-list').should('have.length', 8);
    cy.get('div[class="omnibar-types"]>uif-list').each($el => {
      cy.wrap($el).scrollIntoView();
    });
    cy.get('div[class="omnibar-types"]>uif-list').eq(0).scrollIntoView();
    cy.get('[data-cy="type-sourceName"]>tbody>cdk-virtual-scroll-viewport>div>tr').each($el => {
      cy.wrap($el).scrollIntoView();
    });
  });

  after(() => {
    dataCollector.deleteAllQueries(bvdURL);
  });
});
