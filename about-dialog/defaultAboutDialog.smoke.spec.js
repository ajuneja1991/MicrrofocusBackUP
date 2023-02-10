const shared = require('../../../shared/shared');

describe('Default About dialog', shared.defaultTestOptions, () => {
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
  });

  it('Check for contents in the default about dialog', () => {
    if (Cypress.env('TestEnvironment') === 'development') {
      cy.get('.modal-backdrop');
      cy.get('[data-cy="suitePanel"]');
      cy.get('[data-cy="detailsPage"]');
      cy.get('[data-cy="closeButton"]');
      cy.get('[data-cy="copyright"]').contains('Micro Focus or one of its affiliates');
      cy.get('[data-cy="suiteName"]').contains('OPTIC One');
      cy.get('[data-cy="suiteAboutLogo"]').invoke('attr', 'src').then(suiteAboutIcon => {
        cy.get('[data-cy="suiteLogo"]').invoke('attr', 'src').should('eq', suiteAboutIcon);
      });
      cy.get('[data-cy="suiteRelease"]');
      cy.get('[data-cy="familyName"]').contains('IT Operations Management');
      cy.get('[data-cy="detailsPageHeading"]').should('not.exist');
      cy.get('[data-cy="capabilities"]').should('not.exist');
      cy.get('[data-cy="appDescription"]').contains('No content packs have been installed yet.');
      cy.get('[data-cy="copyright"]').contains('Micro Focus or one of its affiliates');
      cy.get('[data-cy="closeButton"]').click();
    }
  });
});
