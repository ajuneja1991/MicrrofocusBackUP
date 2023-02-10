// <reference types="Cypress" />
const shared = require('../../../shared/shared');

describe('Gauge', shared.defaultTestOptions, () => {
  beforeEach(() => {
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/uiTestGauge*`
    }).as('getPage');
    cy.bvdLogin();
    cy.visit('/uiTestGauge');
    cy.wait('@getPage');
  });

  it('Check small gauge', () => {
    cy.get('[data-cy="gauge-value"]').first().should('have.css', 'font-size', '16px');
  });

  it('Check medium gauge', () => {
    cy.get('[data-cy="gauge-value"]').eq(1).should('have.css', 'font-size', '48px');
  });

  it('Check large gauge', () => {
    cy.get('[data-cy="gauge-value"]').eq(2).should('have.css', 'font-size', '72px');
  });

  it('gauge widget has no Export to CSV action', () => {
    cy.get('[data-cy="action-button"]').first().click();
    cy.get('.ux-menu').should('not.contain', 'Export to CSV');
  });
});
