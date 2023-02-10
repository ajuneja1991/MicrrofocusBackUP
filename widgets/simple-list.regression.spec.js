// <reference types="Cypress" />
const shared = require('../../../shared/shared');

describe('Simple list', shared.defaultTestOptions, () => {
  before(() => {
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/uiTestWidgets*`
    }).as('getPage');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pages/toc*`
    }).as('getTOC');
    cy.bvdLogin();
    cy.visit('/uiTestWidgets');
    cy.wait(['@getPage', '@getTOC']);
  });

  it('Simple list widget exist', () => {
    cy.contains('Simple List');
    cy.get('simple-list');
  });

  it('Simple list widget has entries', () => {
    cy.get('simple-list').find('tbody').contains('loadgen.mambo.net');
  });
});
