// <reference types="Cypress" />
const shared = require('../../shared/shared');

describe('Login Logout', shared.defaultTestOptions, () => {
  beforeEach(() => {
    cy.intercept({
      method: 'POST',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/datasource/ws/data`
    }).as('getWebServiceData');
  });

  it('Login to default page and then log out', () => {
    cy.visit('/', { timeout: 30000 });
    cy.bvdUiLogin();
    cy.bvdUiLogout();
  });

  it('Login to action page', () => {
    cy.visit('/uiTestActions', { timeout: 30000 });
    cy.bvdUiLogin();
    cy.get('[data-cy="action-button"]').first();
  });

  it('should set context and breadcrumbs when loading a new page and the user is logged out', () => {
    cy.visit('/uiTestNotification?_ctx=~(~(type~%27host~id~%27loadgen.mambo.net~name~%27loadgen.mambo.net))&_s=1603950600000&_e=1603957800000&_tft=A');
    cy.bvdUiLogin();
    cy.url().should('include', 'loadgen.mambo.net');
    cy.get('[data-cy="breadcrumb-uiTestNotification"]');
    cy.get('[data-cy="contextLabelType-Host"]').contains('loadgen.mambo.net');
  });
});
