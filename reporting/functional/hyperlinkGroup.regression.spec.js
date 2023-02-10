const shared = require('../../shared/shared');

import dataCollector from '../../../../support/reporting/restUtils/dataCollector';
import dashboard from '../../../../support/reporting/restUtils/dashboard';
import MainPage from '../../../../support/reporting/pageObjects/MainPage';
import { uploadFileRequest } from '../../../../support/reporting/restUtils/uploadFile';

describe('Hyperlink group test', shared.defaultTestOptions, () => {
  beforeEach(() => {
    cy.intercept(`${Cypress.env('BVD_CONTEXT_ROOT')}/rest/${Cypress.env('API_VERSION')}/system`).as('pageloadSystem');
    cy.intercept(`${Cypress.env('BVD_CONTEXT_ROOT')}/rest/${Cypress.env('API_VERSION')}/session/user`).as('pageloadUser');
    cy.intercept({ method: 'POST', url: `${Cypress.env('BVD_CONTEXT_ROOT')}/rest/${Cypress.env('API_VERSION')}/channel/state` }).as('channelState');
  });

  it('Hyperlink group widget test', () => {
    uploadFileRequest('reporting/Discos.bvd', `${Cypress.env('BVD_CONTEXT_ROOT')}/urest/${Cypress.env('API_VERSION')}/dashboard`);
    uploadFileRequest('reporting/hyperlinkGroup.bvd', `${Cypress.env('BVD_CONTEXT_ROOT')}/urest/${Cypress.env('API_VERSION')}/dashboard`);
    cy.bvdLogin();
    cy.visit('/#/show/hyperlinkGroup?params=none');
    cy.wait(['@pageloadSystem', '@pageloadUser']);
    // open dashboard
    cy.get('#group4').click();
    cy.wait('@channelState');
    cy.url().should('include', 'Discos?params=none');
    // launch external url
    cy.visit('/#/show/hyperlinkGroup?params=none');
    cy.wait('@pageloadUser');
    MainPage.checkIfExternalLinkBannerIsPresent();
    cy.get('#group11').invoke('attr', 'opr_hyperlink').then(value => {
      expect(value).to.equal('enc:https%3A%2F%2Fwww.google.com');
    });
    cy.get('#group11').click();
    cy.url().should('include', 'hyperlinkGroup?params=none');
  });

  after(() => {
    // Logout of session if test fails during execution and logout does not occur through UI
    dashboard.dashboardDelete('hyperlinkGroup');
    dashboard.dashboardDelete('Discos');
    dataCollector.deleteAllQueries();
    cy.bvdLogout();
  });
});
