// <reference types="Cypress" />
import 'cypress-iframe';
const shared = require('../../../shared/shared');

describe('iFrame', shared.defaultTestOptions, () => {
  beforeEach(() => {
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/iFrame*`
    }).as('loadPage');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pages/toc*`
    }).as('getTOC');
    cy.bvdLogin();
  });

  it('iFrame with old configuration', () => {
    cy.visit('/iFrameOldConfig');
    cy.wait(['@loadPage', '@getTOC']);
    cy.frameLoaded('[data-cy="mondrian-iframe-oldConfig"]');
    cy.iframe().contains('AngularJS');
  });

  it('iFrame with new configuration', () => {
    cy.visit('/iFrameNewConfig');
    cy.wait(['@loadPage', '@getTOC']);
    cy.frameLoaded('[data-cy="mondrian-iframe-newConfig"]');
    cy.iframe().contains('Angular');
  });

  it('iFrame with old and new configuration', () => {
    cy.visit('/iFrameOldNewConfig');
    cy.wait(['@loadPage', '@getTOC']);
    cy.frameLoaded('[data-cy="mondrian-iframe-wrongConfig"]');
    cy.get('[data-cy="notification-error-text"]').contains('Unsupported configuration');
    cy.iframe().contains('Angular CLI');
  });
});
