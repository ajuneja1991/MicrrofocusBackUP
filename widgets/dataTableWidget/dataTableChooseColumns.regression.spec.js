const shared = require('../../../../shared/shared');
describe('DataTable Choose Columns', () => {
  beforeEach(() => {
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/testChooseColumns*`
    }).as('getPage');
    cy.intercept({
      method: 'POST',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/datasource/ws/data`
    }).as('getWebapiData');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pages/toc*`
    }).as('getTOC');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/widgets/pgmt_save`
    }).as('pgmtAction');
    cy.bvdLogin();
    cy.visit('/testChooseColumns');
    cy.wait(['@getPage', '@getWebapiData', '@getTOC']);
  });

  it('should validate data table column selection', () => {
    cy.get('[col-id="severity"]').should('include.text', 'Severity');
    cy.get('[data-cy="action-button"]').first().click();
    cy.get('[data-cy= "action-button-chooseColumns"]').click();
    cy.get('span.ux-checkbox-label').contains('Severity').click();
    cy.get('body').click(); // To close the action button dropdown
    cy.get('[data-cy="page-action-button"]').click();
    cy.get('[data-cy="page-action-item-save"]').click();
    cy.get('[data-cy="submit-button"]').click();
    cy.wait('@pgmtAction');
    cy.get('[col-id="severity"]').should('not.exist');
    cy.get('[data-cy="action-button"]').first().click();
    cy.get('[data-cy= "action-button-chooseColumns"]').click();
    cy.get('span.ux-checkbox-label').contains('Severity').click();
    cy.get('body').click();
    cy.get('[data-cy="page-action-button"]').click();
    cy.get('[data-cy="page-action-item-save"]').click();
    cy.get('[data-cy="submit-button"]').click();
    cy.get('[col-id="severity"]').should('include.text', 'Severity');
  });

  it('should validate arranging of databtable columns using drag and drop', () => {
    cy.get('.ag-header-cell').eq(1).should('include.text', 'Title');
    cy.get('.ag-header-cell').eq(2).should('include.text', 'Severity');
    cy.get('.ag-header-row [col-id="severity"]').find('span.ag-header-cell-text').contains('Severity').trigger('mousedown', { button: 0 });
    cy.get('.ag-header-row [col-id="title"]').find('span.ag-header-cell-text').contains('Title').trigger('mousemove').trigger('mouseup');
    cy.get('[data-cy="page-action-button"]').click();
    cy.get('[data-cy="page-action-item-save"]').click();
    cy.get('[data-cy="submit-button"]').click();
    cy.reload();
    cy.wait(['@getPage', '@getWebapiData', '@getTOC']);
    cy.get('.ag-header-cell').eq(1).should('include.text', 'Severity');
    cy.get('.ag-header-cell').eq(2).should('include.text', 'Title');
    cy.get('.ag-header-row [col-id="severity"]').find('span.ag-header-cell-text').contains('Severity').trigger('mousedown', { button: 0 });
    cy.get('.ag-header-row [col-id="title"]').find('span.ag-header-cell-text').contains('Title').trigger('mousemove').trigger('mouseup');
    cy.get('[data-cy="page-action-button"]').click();
    cy.get('[data-cy="page-action-item-save"]').click();
    cy.get('[data-cy="submit-button"]').click();
    cy.reload();
    cy.wait(['@getPage', '@getWebapiData', '@getTOC']);
    cy.get('.ag-header-cell').eq(1).should('include.text', 'Title');
    cy.get('.ag-header-cell').eq(2).should('include.text', 'Severity');
  });
});

describe('DataTable Choose Columns with metadata support', () => {
  beforeEach(() => {
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/testChooseColumns*`
    }).as('getPage');
    cy.intercept({
      method: 'POST',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/datasource/ws/data`
    }).as('getWebapiData');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pages/toc*`
    }).as('getTOC');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/widgets/pgmt_save`
    }).as('pgmtAction');
    cy.bvdLogin();
    cy.visit('/testChooseColumnsMetadata');
    cy.wait(['@getPage', '@getWebapiData', '@getTOC']);
  });

  it('should validate column selection in data table with metadata support', () => {
    cy.get('[col-id="severity"]').should('include.text', 'Severity');
    cy.get('[data-cy="action-button"]').first().click();
    cy.get('[data-cy= "action-button-chooseColumns"]').click();
    cy.get('span.ux-checkbox-label').contains('Severity').click();
    cy.get('body').click(); // To close the action button dropdown
    cy.get('[data-cy="page-action-button"]').click();
    cy.get('[data-cy="page-action-item-save"]').click();
    cy.get('[data-cy="submit-button"]').click();
    cy.wait('@pgmtAction');
    cy.get('[col-id="severity"]').should('not.exist');
    cy.get('[data-cy="action-button"]').first().click();
    cy.get('[data-cy= "action-button-chooseColumns"]').click();
    cy.get('span.ux-checkbox-label').contains('Severity').click();
    cy.get('body').click();
    cy.get('[data-cy="page-action-button"]').click();
    cy.get('[data-cy="page-action-item-save"]').click();
    cy.get('[data-cy="submit-button"]').click();
    cy.get('[col-id="severity"]').should('include.text', 'Severity');
  });
});

describe('Data table widget should show appropriate help text if there are no columns selected', shared.defaultTestOptions, () => {
  before(() => {
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/uiTestDataTableSingle*`
    }).as('getPage');
    cy.intercept({
      method: 'POST',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/datasource/ws/data`
    }).as('getWebapiData');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pages/toc*`
    }).as('getTOC');
    cy.bvdLogin();
    cy.visit('/uiTestDataTableSingle');
    cy.wait(['@getPage', '@getWebapiData', '@getTOC']);
  });

  it('Should contain choose columns help text when no columns are selected', () => {
    cy.get('[data-cy="action-button"]').first().click();
    cy.get('[data-cy= "action-button-chooseColumns"]').click();
    cy.get('span.ux-checkbox-label').contains('Severity').click();
    cy.get('span.ux-checkbox-label').contains('Title').click();
    cy.get('body').type('{Esc}'); // To close the action button dropdown
    cy.get('[data-cy="no-col-container"]').should('contain.text', 'Choose columns to show in the table');
  });
});
