// <reference types="Cypress" />
const shared = require('../../../shared/shared');

describe('External Widgets', shared.defaultTestOptions, () => {
  beforeEach(() => {
    cy.intercept({
      method: 'GET',
      url: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/componentTestFullPageViewer*`
    }).as('externalWidget');
    cy.bvdLogin();
  });

  it('Check the loading of the of fullPages using external widget', () => {
    cy.visit('/componentTestFullPageViewer');
    cy.get('[data-cy="fullPage-external-widget"]').should('have.class', 'mondrian-full-page');
    cy.get('[data-cy="fullPage-external-widget"]').find('.title').contains('Overview');
  });
});
