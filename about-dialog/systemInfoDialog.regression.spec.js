const getSecureModifyToken = require('../../../../../support/reporting/restUtils/getSecureModifyToken');
const shared = require('../../../shared/shared');

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

  it('Check release version and build number', () => {
    const baseUrl = Cypress.config().baseUrl;
    cy.get('[data-cy="system-info"]').click();
    cy.get('[data-cy="system-info-dialog"]');
    cy.get('[data-cy="system-info-header"]').contains('SYSTEM INFORMATION');
    cy.get('[data-cy="system-info-body"]').invoke('text').then(value => {
      cy.request({
        method: 'GET',
        url: `${baseUrl}/rest/${Cypress.env('API_VERSION')}/system`,
        headers: {
          'X-Secure-Modify-Token': getSecureModifyToken.getToken
        }
      }).then(result => {
        expect(value).contains(result.body.data.version.releaseVersion);
        expect(value).contains(result.body.data.version.buildNumber);
      });
    });
  });
});
