const shared = require('../../shared/shared');
const role = require('../../../../support/reporting/restUtils/role');
const dashboard = require('../../../../support/reporting/restUtils/dashboard');
import DashBoardPage from '../../../../support/reporting/pageObjects/DashboardPage';
import EditDashBoardPage from '../../../../support/reporting/pageObjects/EditDashboardPage';
import MainPage from '../../../../support/reporting/pageObjects/MainPage';
const userName = 'TesterWebpage';
const userPwd = 'Test@123';
describe('WebPage Test', shared.defaultTestOptions, () => {
  beforeEach(() => {
    cy.intercept(`${Cypress.env('BVD_CONTEXT_ROOT')}/rest/${Cypress.env('API_VERSION')}/system`).as('pageloadSystem');
    cy.intercept(`${Cypress.env('BVD_CONTEXT_ROOT')}/rest/${Cypress.env('API_VERSION')}/session/user`).as('pageloadUser');
  });

  const roleName = 'testwebpage';
  const roleDesc = 'For tester';
  const categoryName = 'All';
  const accessType = 'full-control';
  const dashboardName = 'BaseDashboard';
  const widgetId = 'shape1';
  const urlforWebPage = 'https://www.tagesschau.de/';

  let roleId;
  it('create a Role for WebPage Test', () => {
    role.roleCreation(roleName, roleDesc, categoryName, accessType).then(newRoleId => {
      roleId = newRoleId;
    });
  });

  it('Validate WebPage Functionality', () => {
    cy.bvdLogin(userName, userPwd);
    cy.visit('/#/config');
    cy.wait(['@pageloadSystem', '@pageloadUser']);
    DashBoardPage.uploadDashboard(`reporting/${dashboardName}.svg`);
    EditDashBoardPage.selectWidget(widgetId);
    EditDashBoardPage.setUrlWidgetChannel(urlforWebPage);
    EditDashBoardPage.saveConfig(dashboardName);
    MainPage.viewDashboardforIframe(dashboardName);
    MainPage.validateIFrameUrl('zur Tagesschau Startseite');
    cy.bvdLogout();
  });

  after(() => {
    // LogOut of session if test fails during execution and logout does not occur through UI
    cy.bvdLogout();
    dashboard.dashboardDelete(dashboardName);
    role.roleDeletion(roleId);
  });
});
