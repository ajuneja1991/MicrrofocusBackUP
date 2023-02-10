// <reference types="Cypress" />
const shared = require('../../shared/shared');

describe('Navigation', shared.defaultTestOptions, () => {
  beforeEach(() => {
    cy.intercept({
      method: 'POST',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/datasource/ws/data`
    }).as('getWebServiceData');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/uiTestWidgets*`
    }).as('getPage');
    cy.bvdLogin();
    cy.visit('/uiTestWidgets');
    cy.wait(['@getPage', '@getWebServiceData']);
  });

  it('Help link', () => {
    // https://docs.cypress.io/guides/references/trade-offs.html#Multiple-tabs
    cy.get('[data-cy="help-button"]').click();
    cy.get('[data-cy="help"]').contains('Help on UI Foundation').click();
  });
});
