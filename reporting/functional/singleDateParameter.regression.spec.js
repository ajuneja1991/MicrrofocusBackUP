const shared = require('../../shared/shared');
import MainPage from '../../../../support/reporting/pageObjects/MainPage';
import { uploadFileRequest } from '../../../../support/reporting/restUtils/uploadFile';
const dataCollector = require('../../../../support/reporting/restUtils/dataCollector');
const dashboard = require('../../../../support/reporting/restUtils/dashboard');
const role = require('../../../../support/reporting/restUtils/role');

describe('Single DateTime Parameter Test', shared.defaultTestOptions, () => {
  beforeEach(() => {
    cy.intercept(`${Cypress.env('BVD_CONTEXT_ROOT')}/rest/${Cypress.env('API_VERSION')}/system`).as('pageloadSystem');
    cy.intercept(`${Cypress.env('BVD_CONTEXT_ROOT')}/rest/${Cypress.env('API_VERSION')}/session/user`).as('pageloadUser');
    cy.intercept({ method: 'POST', url: `${Cypress.env('BVD_CONTEXT_ROOT')}/rest/${Cypress.env('API_VERSION')}/channel/state` }).as('channelState');
  });
  const dashboardName = 'DateTimeParameter';
  const widget = 'group187';
  const userName = 'TesterSingleDateTimeParam';
  const userPwd = 'Test@123';
  const paramVariable = 'singleDateParameter';
  const roleName = 'testsingledatetimeparam';
  const roleDesc = 'For single datetimeparam';
  const categoryName = 'All';
  const accessType = 'full-control';
  const startWeekDay = Cypress.env('START_OF_THE_WEEK').substr(0, 3);
  let roleId;

  // In the l10n test, the single date picker is tested with specific dates in different languages.

  it('create a Role through REST', () => {
    role.roleCreation(roleName, roleDesc, categoryName, accessType).then(newRoleId => {
      roleId = newRoleId;
    });
  });

  it('check today and reset', () => {
    uploadFileRequest('reporting/DateTimeParameter.bvd', `${Cypress.env('BVD_CONTEXT_ROOT')}/urest/${Cypress.env('API_VERSION')}/dashboard`);
    cy.bvdLogin(userName, userPwd);
    cy.visit('/#/show/DateTimeParameter?params=none');
    cy.wait(['@pageloadSystem', '@pageloadUser', '@channelState']);
    cy.get('#load-spinner').should('not.be.visible');
    MainPage.barCount(widget, 20);
    // Check with select today option
    MainPage.clickSlideOutForParamSelection();
    MainPage.selectSingleDateParamFromSlideout(startWeekDay, paramVariable, true);
    MainPage.leftBarParameterApplyValue();
    MainPage.barCount(widget, 20);
    // Check reset case
    MainPage.clickSlideOutForParamSelection();
    MainPage.resetParameterValue();
    MainPage.checkSingleDateParamAfterReset();
    MainPage.leftBarParameterApplyValue();
    MainPage.barCount(widget, 20);
  });

  after(() => {
    // Logout of session if test fails during execution and logout does not occur through UI
    cy.bvdLogout();
    dataCollector.deleteAllQueries();
    dashboard.dashboardDelete(dashboardName);
    role.roleDeletion(roleId);
  });
});
