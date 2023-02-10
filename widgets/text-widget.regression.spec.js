// <reference types="Cypress" />
const shared = require('../../../shared/shared');

describe('Text Widget', shared.defaultTestOptions, () => {
  beforeEach(() => {
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/uiTestWidgetsTextWidget*`
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
    cy.visit('/uiTestWidgetsTextWidget');
    cy.wait(['@getPage', '@getTOC']);
  });

  it('Text widget exist', () => {
    cy.contains('Description');
    cy.get('text-widget');
  });

  it('Text widget has entries', () => {
    cy.get('text-widget').find('p').contains('This is a description for this page.');
  });

  it('Table text widget shows data', () => {
    cy.get('#ui-test-text-advanced-2').find('table')
      .should('contain', 'loadgen.mambo.net')
      .and('contain', '87.02');
    cy.get('#ui-test-text-advanced-2').find('p').should('contain', 'You can add simple tables with markdown. To style the table as seen below, set property');
  });

  it('Text widget shows data', () => {
    cy.get('#ui-test-text-advanced-5').find('p')
      .should('contain', 'This is an example of localized string with values for params:')
      .and('contain', '87.02')
      .and('contain', 'coming from the datasource');

    cy.get('#ui-test-text-simple').find('p').contains('Practice creates masters');
  });

  it('Context is applied on text widget', () => {
    cy.get('simple-list').contains('loadgen.mambo.net');
    cy.get('[data-cy="loadgen.mambo.net"]').click();
    cy.wait(['@getWebapiData', '@getWebapiData', '@getWebapiData']);
    cy.get('#ui-test-text-advanced-3').find('ul')
      .should('contain', 'loadgen.mambo.net')
      .and('contain', '87.02');
    cy.get('simple-list').contains('oba.mambo.net');
    cy.get('[data-cy="oba.mambo.net"]').click();
    cy.wait(['@getWebapiData', '@getWebapiData', '@getWebapiData']);
    cy.get('#ui-test-text-advanced-3').find('ul')
      .should('contain', 'oba.mambo.net')
      .and('contain', '49.52');
  });
});
