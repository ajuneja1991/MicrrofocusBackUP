const shared = require('../../shared/shared');
import MainPage from '../../../../support/reporting/pageObjects/MainPage';
import EditDashBoardPage from '../../../../support/reporting/pageObjects/EditDashboardPage';
import { uploadFileRequest } from '../../../../support/reporting/restUtils/uploadFile';
const dataCollector = require('../../../../support/reporting/restUtils/dataCollector');
const dashboard = require('../../../../support/reporting/restUtils/dashboard');
const role = require('../../../../support/reporting/restUtils/role');

describe('Text Widget Text Overflow Options With Parameter Query Test', shared.defaultTestOptions, () => {
  beforeEach(() => {
    cy.intercept(`${Cypress.env('BVD_CONTEXT_ROOT')}/rest/${Cypress.env('API_VERSION')}/system`).as('pageloadSystem');
    cy.intercept(`${Cypress.env('BVD_CONTEXT_ROOT')}/rest/${Cypress.env('API_VERSION')}/session/user`).as('pageloadUser');
    cy.intercept({ method: 'POST', url: `${Cypress.env('BVD_CONTEXT_ROOT')}/rest/${Cypress.env('API_VERSION')}/channel/state` }).as('channelState');
  });
  const dashboardName = 'dashboard_parameter_query';
  const userName = 'TesterTextValueWidgetTextOverflowOptionsParamQuery';
  const userPwd = 'Test@123';
  const widget1 = 'shape1';
  const widget2 = 'shape2';
  const widget3 = 'shape3';
  const testText1 = 'sample sample sample sample sample samplesamplesample...';
  const testText2 = 'sample sample sample sample ...';
  const testTextSpecialChar = '###$%%--->>';
  const hoverText = 'sample sample sample sample sample samplesamplesamplesamplesample';
  const hoverTextSpecialChar = '###$%%--->>';
  const id = 'background';
  const roleName = 'testTextValueWidgetTextOverflowOptionsParamQuery';
  const roleDesc = 'For text value widget text overflow options paramquery';
  const categoryName = 'All';
  const accessType = 'full-control';
  const bn = 'bn';
  let roleId;
  it('create a Role through REST', () => {
    role.roleCreation(roleName, roleDesc, categoryName, accessType).then(newRoleId => {
      roleId = newRoleId;
    });
  });

  it('Validate text overflow options as admin', () => {
    uploadFileRequest('reporting/dashboard_parameter_query.bvd', `${Cypress.env('BVD_CONTEXT_ROOT')}/urest/${Cypress.env('API_VERSION')}/dashboard`);
    cy.bvdLogin();
    cy.visit('/#/show/dashboard_parameter_query?params=none');
    cy.wait(['@pageloadSystem', '@pageloadUser', '@channelState']);
    cy.get('#load-spinner').should('not.be.visible');
    MainPage.clickDashboardEdit();
    EditDashBoardPage.selectWidget(widget1);
    EditDashBoardPage.verifyDefaultTextOverflowOption('ng-not-empty');
    EditDashBoardPage.selectWidget(widget2);
    EditDashBoardPage.verifyDefaultTextOverflowOption('ng-not-empty');
    EditDashBoardPage.selectWidget(widget3);
    EditDashBoardPage.verifyDefaultTextOverflowOption('ng-empty');
    cy.visit(`/#/show/${dashboardName}?params=none`);
    cy.wait(['@channelState']);
    MainPage.clickSlideOutForParamSelection();
    MainPage.selectDropDownParameter('sample sample sample sample sample samplesamplesamplesamplesample', bn);
    MainPage.leftBarParameterApplyValue();
    MainPage.verifyingWrapAndTruncateTextForWidget(id, widget1, testText1, 3, true);
    MainPage.verifyTheHoverTextOnTextWidget(widget1, hoverText);
    MainPage.verifyingWrapAndTruncateTextForWidget(id, widget2, testText2, 2, true);
    MainPage.verifyTheHoverTextOnTextWidget(widget2, hoverText);
    MainPage.verifyTheHoverTextOnTextWidget(widget3, hoverText);
    MainPage.logOutOfBVD();
  });

  it('Validate text overflow options as non admin', () => {
    cy.bvdLogin(userName, userPwd, 100000);
    cy.visit('/#/show/dashboard_parameter_query?params=none');
    cy.wait(['@pageloadSystem', '@pageloadUser', '@channelState']);
    cy.get('#load-spinner').should('not.be.visible');
    MainPage.clickSlideOutForParamSelection();
    MainPage.selectDropDownParameter('###$%%--->>', bn);
    MainPage.leftBarParameterApplyValue();
    MainPage.verifyingWrapAndTruncateTextForWidget(id, widget1, testTextSpecialChar, 1, true);
    MainPage.verifyTheHoverTextOnTextWidget(widget1, hoverTextSpecialChar);
    MainPage.verifyingWrapAndTruncateTextForWidget(id, widget2, testTextSpecialChar, 1, true);
    MainPage.verifyTheHoverTextOnTextWidget(widget2, hoverTextSpecialChar);
    MainPage.verifyingWrapAndTruncateTextForWidget(id, widget3, testTextSpecialChar, 0, false);
    MainPage.verifyTheHoverTextOnTextWidget(widget3, hoverTextSpecialChar);
  });

  after(() => {
    cy.bvdLogout();
    dataCollector.deleteAllQueries();
    dashboard.dashboardDelete(dashboardName);
    role.roleDeletion(roleId);
  });
});
