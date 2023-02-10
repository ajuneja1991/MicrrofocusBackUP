const shared = require('../../shared/shared');
const role = require('../../../../support/reporting/restUtils/role');
const dashboard = require('../../../../support/reporting/restUtils/dashboard');
const dataCollector = require('../../../../support/reporting/restUtils/dataCollector');
import MainPage from '../../../../support/reporting/pageObjects/MainPage';
import DataCollectorPage from '../../../../support/reporting/pageObjects/DataCollectorPage';
import * as DateRangePickerDashboard from '../../../../support/reporting/pageObjects/DateRangePickerDashboard';
import * as TimeCalculations from '../../../../support/reporting/TimeCalculations';

const dashboardName = 'datePicker';

const roleName = 'testDateTimeParam';
const roleDesc = 'For dateTimeParam';
const categoryName = 'All';
const accessType = 'full-control';
const paramQueryName = 'param_query_datetime';
const userName = 'TesterDateTimeParam';
const userPwd = 'Test@123';

const startTimeDay = '12:00:00 AM';
const endTimeDay = '11:59:00 PM';

const thisWeek = 'T_WEEK';
const thisWeekLongLabel = 'This Week';
const previousWeek = 'WEEK';
const previousWeekLongLabel = 'Previous Week';
const widgetStart = 'shape1005';
const widgetEnd = 'shape1006';

function checkWeek(predefinedId, predefinedLabel, hasDefaultValue = false) {
  const calculatedTime = TimeCalculations.calcWeekInformation(predefinedId);

  const firstDay = TimeCalculations.getDateAsString(calculatedTime.firstDay.getDate(), calculatedTime.firstDay.getMonth() + 1, calculatedTime.firstDay.getFullYear());
  const lastDay = TimeCalculations.getDateAsString(calculatedTime.lastDay.getDate(), calculatedTime.lastDay.getMonth() + 1, calculatedTime.lastDay.getFullYear());

  MainPage.checkText(widgetStart, `${firstDay[0]}, ${startTimeDay}`);
  MainPage.checkText(widgetEnd, `${lastDay[0]}, ${endTimeDay}`);
  if (!hasDefaultValue) {
    MainPage.checkUrl(predefinedId);
  }
  MainPage.checkPickedPredefinedTime(predefinedId, predefinedLabel, firstDay[1], lastDay[1]);

  MainPage.toggleMenu(true);
  MainPage.checkActiveCalendarDates(calculatedTime);
  MainPage.checkCalendarStart(calculatedTime);
}

describe('Start of the week UI test', shared.defaultTestOptions, () => {
  beforeEach(() => {
    cy.intercept(`${Cypress.env('BVD_CONTEXT_ROOT')}/rest/${Cypress.env('API_VERSION')}/system`).as('pageloadSystem');
    cy.intercept(`${Cypress.env('BVD_CONTEXT_ROOT')}/rest/${Cypress.env('API_VERSION')}/session/user`).as('pageloadUser');
  });

  let roleId;
  it('create a Role through REST', () => {
    role.roleCreation(roleName, roleDesc, categoryName, accessType).then(newRoleId => {
      roleId = newRoleId;
    });
  });

  it('Create predefined query and dashboard', () => {
    DateRangePickerDashboard.createDataCollectorsAndDashboard(userName, userPwd);
  });

  it('Should test start of the week', () => {
    cy.bvdLogin(userName, userPwd);
    cy.visit('/#/show/Welcome');
    cy.wait(['@pageloadSystem', '@pageloadUser']);
    cy.get('#load-spinner').should('not.be.visible');
    MainPage.viewDashboard(dashboardName);
    MainPage.checkText(widgetStart, 'true');
    MainPage.clickSlideOutForParamSelection();
    MainPage.selectPredefinedTime(previousWeek);
    MainPage.leftBarParameterApplyValue();
    checkWeek(previousWeek, previousWeekLongLabel);
    MainPage.toggleMenu(false);
    MainPage.selectPredefinedTime(thisWeek);
    MainPage.leftBarParameterApplyValue();
    checkWeek(thisWeek, thisWeekLongLabel);
  });

  it('Should add default value to param query and test the start of the week in the predefined query section', () => {
    cy.bvdLogin();
    cy.visit('/#/show/Welcome');
    cy.wait(['@pageloadSystem', '@pageloadUser']);
    MainPage.validateIfMainPage();
    MainPage.navigateToDataCollector();
    DataCollectorPage.editQuery({ paramQueryName, predefinedId: previousWeek, checkCalendar: true });

    MainPage.viewDashboard(dashboardName);
    checkWeek(previousWeek, previousWeekLongLabel, true);

    MainPage.navigateToDataCollector();
    DataCollectorPage.editQuery({ paramQueryName, predefinedId: thisWeek, checkCalendar: false });

    MainPage.viewDashboard(dashboardName);
    checkWeek(thisWeek, thisWeekLongLabel, true);
  });

  after(() => {
    // LogOut of session if test fails during execution and logout does not occur through UI
    cy.bvdLogout();
    dashboard.dashboardDelete(dashboardName);
    role.roleDeletion(roleId);
    dataCollector.deleteAllQueries();
  });
});
