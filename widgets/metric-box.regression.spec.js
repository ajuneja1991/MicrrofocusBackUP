// <reference types="Cypress" />
const shared = require('../../../shared/shared');

describe('Metric Box', shared.defaultTestOptions, () => {
  beforeEach(() => {
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/uiTestMetricBox*`
    }).as('getPage');
    cy.bvdLogin();
    cy.visit('/uiTestMetricBox');
    cy.wait('@getPage');
  });

  it('Check metric box font sizes', () => {
    cy.get('[data-cy=spinnerOverlay]').should('not.be.visible');
    cy.get('[data-cy="metric-box-value"]').first().contains('49.5');
    cy.get('[data-cy="metric-box-value"]').first().should('have.css', 'font-size', '36px');
    cy.get('[data-cy="metric-box-value"]').eq(1).should('have.css', 'font-size', '48px');
    cy.get('[data-cy="metric-box-value"]').eq(2).should('have.css', 'font-size', '72px');
    cy.log('check normal colors');
    cy.get('[data-cy="metric-box-outer"]').eq(3).should('have.css', 'background-color', 'rgb(26, 172, 96)');
    cy.get('[data-cy="metric-box-outer"]').eq(4).should('have.css', 'background-color', 'rgb(255, 192, 2)');
    cy.get('[data-cy="metric-box-outer"]').eq(5).should('have.css', 'background-color', 'rgb(229, 0, 76)');
    cy.log('check inverted colors');
    cy.get('[data-cy="metric-box-outer"]').eq(6).should('have.css', 'background-color', 'rgb(229, 0, 76)');
    cy.get('[data-cy="metric-box-outer"]').eq(7).should('have.css', 'background-color', 'rgb(255, 192, 2)');
    cy.get('[data-cy="metric-box-outer"]').eq(8).should('have.css', 'background-color', 'rgb(26, 172, 96)');
  });
});
