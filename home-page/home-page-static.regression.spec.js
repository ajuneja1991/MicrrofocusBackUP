// <reference types="Cypress" />
const shared = require('../../../shared/shared');
const { featureToggleEnabled } = require('../../../../../support/reporting/restUtils/featureToggleEnabled');

/**
 * This test is dependent to the feature toggle DYNAMIC_HOME_PAGE
 * If the feature toggle is true, the test will be skipped.
 */

describe('Home page static', shared.defaultTestOptions, () => {
  before(async function() {
    cy.bvdLogin();
    const ft = await featureToggleEnabled('DYNAMIC_HOME_PAGE');
    console.log('DYNAMIC_HOME_PAGE feature toggle:', ft);
    if (ft) {
      this.skip();
    }
  });

  beforeEach(() => {
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pages/toc*`
    }).as('getTOC');
  });

  it('should static home page have two products', () => {
    cy.visit('/');
    cy.wait(['@getTOC']);
    cy.url().should('eq', `${Cypress.config().baseUrl}/`);
    cy.get('[data-cy="spinnerOverlay"]').should('not.be.visible');
    cy.get('[data-cy="static-home-page"]');
    cy.get('[data-cy="product-cards-container"]').children().should('have.length', 2);
  });
});
