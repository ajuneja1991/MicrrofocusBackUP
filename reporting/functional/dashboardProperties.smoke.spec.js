const shared = require('../../shared/shared');
import DashBoardPage from '../../../../support/reporting/pageObjects/DashboardPage';
import EditDashBoardPage from '../../../../support/reporting/pageObjects/EditDashboardPage';
const dashboard = require('../../../../support/reporting/restUtils/dashboard');

describe('Dashboard properties test', shared.defaultTestOptions, () => {
  const dashboardName = 'DahboardProperties';
  beforeEach(() => {
    cy.intercept(`${Cypress.env('BVD_CONTEXT_ROOT')}/rest/${Cypress.env('API_VERSION')}/system`).as('pageloadSystem');
    cy.intercept(`${Cypress.env('BVD_CONTEXT_ROOT')}/rest/${Cypress.env('API_VERSION')}/session/user`).as('pageloadUser');
    cy.intercept(`${Cypress.env('BVD_CONTEXT_ROOT')}/rest/${Cypress.env('API_VERSION')}/dashboard/*`).as('dashboardLoad');
    cy.intercept(`${Cypress.env('BVD_CONTEXT_ROOT')}/ui/dashboard/*`).as('svgDashboardLoad');

    cy.intercept({ method: 'POST', url: `${Cypress.env('BVD_CONTEXT_ROOT')}/rest/${Cypress.env('API_VERSION')}/channel/state` }).as('channelState');
  });

  // Only scaling and category property test is automated, it has to be extended to test all the dashboard properties in future.
  it('Testing dashboard properties', () => {
    cy.bvdLogin();
    cy.visit('/#/config');
    cy.wait(['@pageloadSystem', '@pageloadUser', '@svgDashboardLoad']);
    DashBoardPage.uploadDashboard(`reporting/${dashboardName}.svg`);
    EditDashBoardPage.selectScaling('Fit-to-Page');
    EditDashBoardPage.addCategory('PropertyTest');
    EditDashBoardPage.saveConfig(dashboardName);

    cy.visit('/#/config');
    cy.wait(['@pageloadUser', '@dashboardLoad']);
    const downloadFile = DashBoardPage.downloadDashboard(dashboardName);
    DashBoardPage.openDashboardForEdit(dashboardName);
    EditDashBoardPage.selectScaling('Fit-to-Window');
    EditDashBoardPage.addCategory('PropertyTest2');
    EditDashBoardPage.saveConfig(dashboardName);
    cy.readFile(downloadFile).then(fileContent => {
      cy.log(fileContent);
      DashBoardPage.uploadDashboard({ fileContent, fileName: `${dashboardName}.svg`, mimeType: 'image/svg+xml' }, true);
      cy.get('span[class="ux-tag-text"]').contains('PropertyTest');
      cy.get('span[class="ux-tag-text"]').contains('PropertyTest2');
      cy.get('#displayName-input').should('contain.text', 'Fit-to-Window');
      EditDashBoardPage.saveConfig(dashboardName);
    });
  });

  afterEach(() => {
    // LogOut of session if test fails during execution and logout does not occur through UI
    cy.bvdLogout();
    dashboard.dashboardDelete(dashboardName);
  });
});
