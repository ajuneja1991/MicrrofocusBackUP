// <reference types="Cypress" />
const shared = require('../../../shared/shared');

describe('External Widgets', shared.defaultTestOptions, () => {
  beforeEach(() => {
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest//${Cypress.env('API_VERSION')}/pagesWithComponents/externalWidgetOnPageLevel*`
    }).as('externalWidgetOnPageLevel');
    cy.bvdLogin();
  });

  it('Check the loading of an external widget defined on page level', () => {
    cy.visit('/externalWidgetOnPageLevel');
    cy.wait('@externalWidgetOnPageLevel');
    cy.get('[data-cy=breadcrumb-externalWidgetOnPageLevel]');
    cy.url().should('include', 'externalWidgetOnPageLevel');
    cy.get('#btnTestSpinnerOverlay');
  });
});
