const shared = require('../../shared/shared');
import MainPage from '../../../../support/reporting/pageObjects/MainPage';
import DataCollectorPage from '../../../../support/reporting/pageObjects/DataCollectorPage';
import EditDashBoardPage from '../../../../support/reporting/pageObjects/EditDashboardPage';
import DashBoardPage from '../../../../support/reporting/pageObjects/DashboardPage';
const role = require('../../../../support/reporting/restUtils/role');
const dashboard = require('../../../../support/reporting/restUtils/dashboard');
const dataCollector = require('../../../../support/reporting/restUtils/dataCollector');

describe('DateTime Parameter Test', shared.defaultTestOptions, () => {
  beforeEach(() => {
    cy.intercept(`${Cypress.env('BVD_CONTEXT_ROOT')}/rest/${Cypress.env('API_VERSION')}/system`).as('pageloadSystem');
    cy.intercept(`${Cypress.env('BVD_CONTEXT_ROOT')}/rest/${Cypress.env('API_VERSION')}/session/user`).as('pageloadUser');
    cy.intercept({ method: 'POST', url: `${Cypress.env('BVD_CONTEXT_ROOT')}/rest/${Cypress.env('API_VERSION')}/channel/state` }).as('channelState');
  });
  const dataQueryText = `select * from datetimeparam_table where \${timestamp > \${parameter_dateTime:start}} and \${timestamp < \${parameter_dateTime:end}} order by timestamp`;
  const fromdatelist = ['2017', 'Jan 2017', 'Jan 27, 2017', '8', '00', 'AM'];
  const todatelist = ['2017', 'Jan 2017', 'Jan 30, 2017', '8', '00', 'AM'];
  const columnsArray = ['id', 'timestamp', 'data1', 'data2'];
  const dashboardName = 'DateTimeParameter';
  const widget = 'group90';
  const userName = 'TesterDateTimeParam';
  const querytypeParam = 'Param Query';
  const querytypeData = 'Data Query';
  const userPwd = 'Test@123';
  const roleName = 'testdatetimeparam';
  const roleDesc = 'For datetimeparam';
  const categoryName = 'All';
  const accessType = 'full-control';
  const paramDesc = 'DateTimeparameter';
  const paramQueryName = 'paramquery_datetime';
  const paramVariable = 'parameter_dateTime';
  const dataQueryDefault = 'default';
  const dataQueryDesc = 'data query desc';
  const dataChannel = 'dateTimeParameterChannel';

  let roleId;
  it('create a Role through REST', () => {
    role.roleCreation(roleName, roleDesc, categoryName, accessType).then(newRoleId => {
      roleId = newRoleId;
    });
  });

  it('Date Time Parameter Validation', () => {
    cy.bvdLogin();
    cy.visit('/#/dataCollector');
    cy.wait(['@pageloadSystem', '@pageloadUser']);
    DataCollectorPage.clickNewQuery(querytypeData);
    DataCollectorPage.filldataQueryDetails(dataChannel, dataQueryDesc, '', dataQueryDefault, dataQueryText);
    DataCollectorPage.validateQueryResults(4, columnsArray);
    DataCollectorPage.clickSaveDataQuery();
    DataCollectorPage.clickNewQuery(querytypeParam);
    DataCollectorPage.fillparamDateSelectorDetails(paramQueryName, paramVariable, paramDesc, 'None');
    DataCollectorPage.clickSaveDataQuery();
    MainPage.navigateToDashboards();
    DashBoardPage.validateIfDashboardPage();
    DashBoardPage.uploadDashboard(`reporting/${dashboardName}.svg`);
    EditDashBoardPage.saveConfig(dashboardName);
  });

  it('login As Non Admin User And Validate', () => {
    const startDateText = '1/27/2017, 8:00:00 AM';
    const endDateText = '1/30/2017, 8:00:00 AM';
    cy.bvdLogin(userName, userPwd);
    cy.visit('/#/show/DateTimeParameter?params=none');
    cy.wait(['@pageloadSystem', '@pageloadUser', '@channelState']);
    cy.get('#load-spinner').should('not.be.visible');
    MainPage.barCount(widget, 5);
    MainPage.clickSlideOutForParamSelection();
    MainPage.selectDateParamsFromSlideout(fromdatelist, todatelist);
    MainPage.leftBarParameterApplyValue();
    MainPage.barCount(widget, 2);
    MainPage.validateValueInTextWidget('g#shape388 text', startDateText);
    MainPage.validateValueInTextWidget('g#shape384 text', endDateText);
    MainPage.logOutOfBVD();
  });

  it('Date Param Query Should Clear Default Value on Switching to Value List', () => {
    cy.bvdLogin();
    cy.visit('/#/dataCollector');
    cy.wait(['@pageloadSystem', '@pageloadUser']);
    DataCollectorPage.clickNewQuery(querytypeParam);
    DataCollectorPage.defaultValForDtRangeShouldClear('Value', 'SEVEN_DAYS', 'Last 7 Days');
  });

  after(() => {
    // LogOut of session if test fails during execution and logout does not occur through UI
    cy.bvdLogout();
    dashboard.dashboardDelete(dashboardName);
    role.roleDeletion(roleId);
    dataCollector.deleteAllQueries();
  });
});
