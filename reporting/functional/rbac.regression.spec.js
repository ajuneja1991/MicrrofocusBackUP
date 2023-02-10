import shared from '../../shared/shared';
import role from '../../../../support/reporting/restUtils/role';
import dataCollector from '../../../../support/reporting/restUtils/dataCollector';
import dashboard from '../../../../support/reporting/restUtils/dashboard';
import { uploadFileRequest } from '../../../../support/reporting/restUtils/uploadFile';

import MainPage from '../../../../support/reporting/pageObjects/MainPage';
import DataCollectorPage from '../../../../support/reporting/pageObjects/DataCollectorPage';
import EditDashBoardPage from '../../../../support/reporting/pageObjects/EditDashboardPage';

describe('RBAC Test', shared.defaultTestOptions, () => {
  beforeEach(() => {
    cy.intercept(`${Cypress.env('BVD_CONTEXT_ROOT')}/rest/${Cypress.env('API_VERSION')}/system`).as('pageloadSystem');
    cy.intercept(`${Cypress.env('BVD_CONTEXT_ROOT')}/rest/${Cypress.env('API_VERSION')}/session/user`).as('pageloadUser');
  });
  const dashboardName = 'RBACTest';
  const dataQueryDefault = 'default';
  const dataQueryDesc = 'data query desc';
  const dataChannelUser = 'userChannel';
  const dataChannelGroup = 'groupChannel';
  let roleId;

  it('create a Role through REST', () => {
    const roleName = 'roleRBAC';
    const roleDesc = 'roleRBAC';
    const categoryName = 'All';
    const accessType = 'full-control';
    role.roleCreation(roleName, roleDesc, categoryName, accessType).then(newRoleId => {
      expect(newRoleId).to.not.be.undefined;
      roleId = newRoleId;
    });
  });

  it('create incorrect data for user and group', () => {
    uploadFileRequest('reporting/RBACTest.bvd', `${Cypress.env('BVD_CONTEXT_ROOT')}/urest/${Cypress.env('API_VERSION')}/dashboard`);
    // const dataQueryText = 'select ${${sys.users}} as loginuser';
    const rbacErrorUser = 'The referenced parameter query with variable name \'sys.users\' is missing. Please create a parameter query with this name.';
    const rbacErrorGroup = 'The referenced parameter query with variable name \'sys.group\' is missing. Please create a parameter query with this name.';
    cy.bvdLogin();

    cy.visit('/#/dataCollector');
    cy.wait(['@pageloadSystem', '@pageloadUser']);
    DataCollectorPage.selectDataQueryFromList('error'.concat(dataChannelUser));
    DataCollectorPage.validateErrorAlert(rbacErrorUser);
    DataCollectorPage.selectDataQueryFromList('error'.concat(dataChannelGroup));
    DataCollectorPage.validateErrorAlert(rbacErrorGroup);
    cy.bvdLogout();
  });

  it('create correct data for user', () => {
    // eslint-disable-next-line no-template-curly-in-string
    const dataQueryText = 'select ${${sys.user}} as loginuser';
    cy.bvdLogin();
    cy.visit('/#/dataCollector');
    cy.wait(['@pageloadSystem', '@pageloadUser']);
    DataCollectorPage.editDataQuery('error'.concat(dataChannelUser), dataChannelUser, dataQueryDesc, '', dataQueryDefault, dataQueryText);
    DataCollectorPage.validateQueryResults(1, ['loginuser'], ['admin']);
    DataCollectorPage.clickSaveDataQuery();
    cy.bvdLogout();
  });

  it('create correct data for group', () => {
    // eslint-disable-next-line no-template-curly-in-string
    const dataQueryText = 'select ${${sys.groups}} as groupname';
    cy.bvdLogin();
    cy.visit('/#/dataCollector');
    cy.wait(['@pageloadSystem', '@pageloadUser']);
    DataCollectorPage.editDataQuery('error'.concat(dataChannelGroup), dataChannelGroup, dataQueryDesc, '', dataQueryDefault, dataQueryText);
    DataCollectorPage.validateQueryResults(1, ['groupname'], ['Administrators']);
    DataCollectorPage.clickSaveDataQuery();
    cy.bvdLogout();
  });

  it('Validate dashboard upload for admin user', () => {
    const widgetValueUser = 'admin';
    const widgetValueGroup = 'Administrators';
    const dataFieldAdmin = 'loginuser';
    const dataFieldGroup = 'groupname';
    cy.bvdLogin();
    cy.visit('/#/config/RBACTest');
    cy.wait(['@pageloadSystem', '@pageloadUser']);
    EditDashBoardPage.selectWidget('shape2');
    EditDashBoardPage.setDataChannel(dataChannelUser);
    EditDashBoardPage.setMultipleDataField(dataFieldAdmin);
    EditDashBoardPage.selectWidget('shape3');
    EditDashBoardPage.setDataChannel(dataChannelGroup);
    EditDashBoardPage.setMultipleDataField(dataFieldGroup);
    EditDashBoardPage.applyConfig();
    MainPage.viewDashboard(dashboardName);
    MainPage.validateValueInTextWidget('g#shape2 text', widgetValueUser);
    MainPage.validateValueInTextWidget('g#shape3 text', widgetValueGroup);
    MainPage.validateValueInTextWidget('g#shape4 text', 'Value');
    cy.bvdLogout();
  });

  it('Validate dashboard for RBAC user', () => {
    const widgetValueUser = 'RBACTest';
    const widgetValueGroup = 'roleRBACgroup';
    const nonAdminUser = 'RBACTest';
    const nonAdminPwd = 'Test@123';
    cy.bvdLogin(nonAdminUser, nonAdminPwd);
    cy.visit('/#/dataCollector');
    cy.wait(['@pageloadSystem', '@pageloadUser']);
    cy.get('#load-spinner').should('not.be.visible');
    MainPage.viewDashboard(dashboardName);
    MainPage.validateValueInTextWidget('g#shape2 text', widgetValueUser);
    MainPage.validateValueInTextWidget('g#shape3 text', widgetValueGroup);
    MainPage.validateValueInTextWidget('g#shape4 text', 'Value');
    cy.bvdLogout();
  });

  after(() => {
    cy.bvdLogout();
    role.roleDeletion(roleId);
    dataCollector.deleteAllQueries();
    dashboard.dashboardDelete(dashboardName);
  });
});

