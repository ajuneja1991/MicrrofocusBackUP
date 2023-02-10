const shared = require('../../shared/shared');

describe('Mondrian mashup', shared.defaultTestOptions, () => {
  beforeEach(() => {
    cy.intercept({
      method: 'POST',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/datasource/ws/data`
    }).as('getWebapiData');
    cy.intercept({
      method: 'POST',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pages/metadata`
    }).as('getPagesMetadata');
    cy.bvdLogin();
  });

  it('Fetch Widgets', () => {
    cy.visit('/uiTestWidgets');
    cy.wait('@getWebapiData');
    cy.get('ux-dashboard');
  });

  it('Testing drop placeholder text', () => {
    cy.visit('/uiTestWidgetDataExplorer');
    cy.get('.placeholder-text').contains('Drag and drop your components here');
  });

  it('Drop placeholder text should not be visible, if page was not configured placeholder', () => {
    cy.visit('/uiTestDefaultCtx');
    cy.get('.placeholder-text').should('not.exist');
  });
});
