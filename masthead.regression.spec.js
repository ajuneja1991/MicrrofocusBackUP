const shared = require('../../shared/shared');

function clickOnAdminAndHelpMenu(sidePanelHeading) {
  cy.get('h2').contains(sidePanelHeading);
  cy.get('[data-cy="user-button"]').click(); // to open the admin-menu dropdown
  cy.get('[data-cy="user-logout"]');
  cy.get('body').click(); // to close the admin-menu dropdown
  cy.get('[data-cy="help-button"]').click();
  cy.get('[data-cy="help"]');
}

describe('Mondrian masthead', shared.defaultTestOptions, () => {
  beforeEach(() => {
    cy.bvdLogin();
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/uiTestActions*`
    }).as('getPagesData');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pages/toc*`
    }).as('getTOC');
    cy.visit('/uiTestActions');
    cy.wait('@getPagesData');
  });

  it('should check the logo, the icon size and suite background color', () => {
    cy.get('.page-header-logo-container').should('have.css', 'width', '160px');
    cy.get('.page-header-logo-container').should('have.css', 'height', '56px');
    cy.get('.page-header-logo-container').should('have.css', 'background-color').and('eq', 'rgb(0, 171, 243)');
  });

  it('should be able to click on the logo to launch the home page', () => {
    cy.get('[data-cy="mfLogo"]').click();
    cy.wait(['@getTOC']);
    cy.url().should('eq', `${Cypress.config().baseUrl}/?tenant=Provider`);
  });

  it('Should be able to click on admin and help menu when add metrics panel is open', () => {
    cy.get('[data-cy="page-action-button"]').click();
    cy.get('[data-cy="page-action-item-open_metric_browser"]').click();
    clickOnAdminAndHelpMenu('Simple List');
  });

  it('Should be able to click on admin and help menu when edit widget panel is open', () => {
    cy.get('[data-cy="action-button"]').eq(0).click();
    cy.get('[data-cy="action-button-edit"]').click();
    clickOnAdminAndHelpMenu('Edit Widget');
  });
});
