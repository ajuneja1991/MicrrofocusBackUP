const shared = require('../../shared/shared');

describe('System info dialog', shared.defaultTestOptions, () => {
  beforeEach(() => {
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/system`
    }).as('getSystemData');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/session/user`
    }).as('getUserData');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pages/toc*`
    }).as('getTOC');
    cy.bvdLogin();
    cy.visit('/');
    cy.wait(['@getSystemData', '@getUserData', '@getTOC']);
    cy.get('[data-cy="help-button"]').click();
    cy.get('[data-cy="aboutDialog"]').click();
    cy.get('[data-cy="aboutDialogModal"]');
    cy.get('.modal-backdrop');
    cy.get('[data-cy="suitePanel"]');
  });

  it('Check system info dialog contents', () => {
    cy.get('[data-cy="system-info"]').click();
    cy.get('[data-cy="system-info-dialog"]');
    cy.get('[data-cy="system-info-header"]').contains('SYSTEM INFORMATION');
    cy.get('[data-cy="system-info-body"]').contains('UIS VERSION');
    cy.get('[data-cy="system-info-copy-button"]').click();
    cy.bvdCheckToast('Content copied to clipboard');
    cy.get('[data-cy="system-info-close-button"]').click();
    cy.get('[data-cy="system-info-dialog"]').should('not.exist');
  });
});
