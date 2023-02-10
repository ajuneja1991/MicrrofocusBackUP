const shared = require('../../shared/shared');

function checkSaveButtonStatusOnInputChange(selector) {
  cy.bvdLogin();
  cy.visit('/#/show/Welcome?params=none');
  cy.get('[data-cy="administration-button"]').click();
  cy.get('[data-cy="system-settings"]').click();
  cy.wait(['@loadSystemSettings']);
  cy.get('[data-cy="save-system-settings"]').should('be.disabled');
  cy.get(`[data-cy="${selector}"] button.opr-number-spinner-up`).click();
  cy.get('[data-cy="save-system-settings"]').should('be.enabled');
  cy.get('[data-cy="cancel-system-settings"]').click();
  cy.get('[data-cy="administration-button"]').click();
  cy.get('[data-cy="system-settings"]').click();
  cy.wait(['@loadSystemSettings']);
  cy.get('[data-cy="save-system-settings"]').should('be.disabled');
  cy.get('[data-cy="cancel-system-settings"]').click();
  cy.get('[data-cy="administration-button"]').click();
  cy.get('[data-cy="system-settings"]').click();
  cy.wait(['@loadSystemSettings']);
  cy.get(`[data-cy="${selector}"] input`).click().clear().type(23);
  cy.get('[data-cy="save-system-settings"]').should('be.enabled');
  cy.get('[data-cy="cancel-system-settings"]').click();
}

describe('System settings test', shared.defaultTestOptions, () => {
  beforeEach(() => {
    cy.intercept(`${Cypress.env('BVD_CONTEXT_ROOT')}/rest/${Cypress.env('API_VERSION')}/system`).as('pageloadSystem');
    cy.intercept(`${Cypress.env('BVD_CONTEXT_ROOT')}/rest/${Cypress.env('API_VERSION')}/session/user`).as('pageloadUser');
    cy.intercept(`${Cypress.env('BVD_CONTEXT_ROOT')}/rest/${Cypress.env('API_VERSION')}/tenant/systemsettings`).as('loadSystemSettings');
    cy.intercept(`${Cypress.env('BVD_CONTEXT_ROOT')}/rest/${Cypress.env('API_VERSION')}/channel/purge`).as('purge');
  });

  it('Should check if save button is enabled when changing the bvd aging settings', () => {
    checkSaveButtonStatusOnInputChange('bvd-aging-age');
  });

  it('Should check if save button is enabled when changing the bvd aging stats settings', () => {
    checkSaveButtonStatusOnInputChange('bvd-aging-stats');
  });

  it('should check system setting page can be access from URL', () => {
    cy.bvdLogin();
    cy.visit('/#/settings');
    cy.wait(['@loadSystemSettings']);
    cy.get('[id="bvd-timeZone"]');
    cy.get('.alert.purgeInfo').should('not.exist');
    cy.get('[id="bvd-purging"] > button').click();
    cy.wait(['@purge']);
    cy.get('[id="bvd-purging"] > div.purgingInfo');
    cy.get(`[data-cy="bvd-aging-age"] input`).click().clear().type(23);
    cy.get('[data-cy="save-system-settings"]').should('be.enabled');
    cy.get('[id="slide-panel-alert-success"]').should('not.exist');
    cy.get('[data-cy="save-system-settings"]').click();
    cy.wait(['@loadSystemSettings']);
    cy.get('[id="slide-panel-alert-success"]');
  });

  after(() => {
    // LogOut of session if test fails during execution and logout does not occur through UI
    cy.bvdLogout();
  });
});

