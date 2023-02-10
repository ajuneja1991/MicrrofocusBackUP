// <reference types="Cypress" />

const shared = require('../../../shared/shared');

/**
 * Can be probably moved to new pgmt area
 */
describe('Generic', () => {
  beforeEach(() => {
    cy.intercept({
      method: 'POST',
      url: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/datasource/ws/data`
    }).as('getData');
    cy.intercept({
      method: 'POST',
      url: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pages`
    }).as('savePage');
    cy.intercept({
      method: 'PUT',
      url: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pages/*`
    }).as('updatePage');
    cy.intercept({
      method: 'DELETE',
      url: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pages/*`
    }).as('deletePage');
    cy.intercept({
      method: 'GET',
      url: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/menuEntries/testPageCrudEntry`
    }).as('getMenuEntry');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pages/toc*`
    }).as('getTOC');
    cy.bvdLogin();
    cy.visit('/uiTestPageCrud?_m=testPageCrudEntry');
    cy.wait(['@getData', '@getData', '@getTOC', '@getTOC']);
  });

  it('auto close dropdown during navigation', () => {
    cy.get('[data-cy="page-action-button"]').click();
    cy.get('[data-cy="page-action-item-saveAs"]');
    cy.get('[data-cy="page-action-item-delete"]');
    cy.get('[data-cy="page-action-button"]').type('{esc}');
    cy.get('[data-cy="navigation-category-T2"] button').click();
    cy.get('[data-cy="navigation-menuEntry-testNotificationEntry"] button').click();
    cy.get('[data-cy="page-action-item-saveAs"]').should('not.exist');
    cy.get('[data-cy="page-action-item-delete"]').should('not.exist');
  });
});

