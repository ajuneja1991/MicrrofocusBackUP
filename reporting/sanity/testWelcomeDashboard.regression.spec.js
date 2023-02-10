const shared = require('../../shared/shared');

function renderPage() {
  cy.visit('/#/show/Welcome');
  cy.wait(['@pageloadSystem', '@pageloadUser', '@svgDashboardLoad', '@dashboardLoad']);
}

describe('Test Welcome Dashboard', shared.defaultTestOptions, () => {
  beforeEach(() => {
    cy.intercept(`${Cypress.env('BVD_CONTEXT_ROOT')}/rest/${Cypress.env('API_VERSION')}/system`).as('pageloadSystem');
    cy.intercept(`${Cypress.env('BVD_CONTEXT_ROOT')}/rest/${Cypress.env('API_VERSION')}/session/user`).as('pageloadUser');
    cy.intercept(`${Cypress.env('BVD_CONTEXT_ROOT')}/ui/dashboard/?*`).as('svgDashboardLoad');
    cy.intercept(`${shared.reportingContextRoot}/rest/${Cypress.env('API_VERSION')}/dashboard/*`).as('dashboardLoad');
  });

  it('Test Hyperlinks to Help Doc on Welcome Dashboard', () => {
    cy.bvdLogin();
    renderPage();
    cy.get('a.ddown').eq(0).invoke('attr', 'xlink:href').should('contain', '/rest/goto/getstarted');
    cy.get('a.ddown').eq(1).invoke('attr', 'xlink:href').should('contain', '/rest/goto/getstarted');
  });
});
