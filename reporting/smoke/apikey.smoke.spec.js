const shared = require('../../shared/shared');

describe('API Key Test', shared.defaultTestOptions, () => {
  beforeEach(() => {
    cy.intercept(`${Cypress.env('BVD_CONTEXT_ROOT')}/rest/${Cypress.env('API_VERSION')}/system`).as('pageloadSystem');
    cy.intercept(`${Cypress.env('BVD_CONTEXT_ROOT')}/rest/${Cypress.env('API_VERSION')}/tenant/apikey`).as('apiKey');
  });

  it('should check API key generate component is available from URL', () => {
    cy.bvdLogin();
    cy.visit('/#/apikey');
    cy.wait(['@pageloadSystem']);
    cy.get('[data-cy="new_api_key"]').click();
    cy.get('.modal-dialog  #new_api_key').click();
    cy.wait(['@apiKey']);
    cy.get('[id="slide-panel-alert-success"]');
  });
});
