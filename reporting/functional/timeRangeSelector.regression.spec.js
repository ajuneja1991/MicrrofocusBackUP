import timeUtils from '../../../../../../shared/utils/dateTime/timeUtils';
const shared = require('../../shared/shared');
const role = require('../../../../support/reporting/restUtils/role');
const dashboard = require('../../../../support/reporting/restUtils/dashboard');
const dataCollector = require('../../../../support/reporting/restUtils/dataCollector');
const timezoneRestUtil = require('../../../../support/reporting/restUtils/timezone');
import MainPage from '../../../../support/reporting/pageObjects/MainPage';
import DataCollectorPage from '../../../../support/reporting/pageObjects/DataCollectorPage';
import * as DateRangePickerDashboard from '../../../../support/reporting/pageObjects/DateRangePickerDashboard';
import * as TimeCalculations from '../../../../support/reporting/TimeCalculations';
import PersonalSettingsPage from '../../../../support/reporting/pageObjects/PersonalSettingsPage';
import SystemSettingsPage from '../../../../support/reporting/pageObjects/SystemSettingsPage';

const dashboardName = 'datePicker';
const widgetStart = 'shape1005';
const widgetEnd = 'shape1006';

const roleName = 'testDateTimeParam';
const roleDesc = 'For dateTimeParam';
const categoryName = 'All';
const accessType = 'full-control';
const paramQueryName = 'param_query_datetime';
const paramVariableName = 'parameter_datetime';
const userName = 'TesterDateTimeParam';
const userPwd = 'Test@123';

const startTimeDay = '12:00:00 AM';
const endTimeDay = '11:59:00 PM';

const thisDay = 'T_DAY';
const thisDayLongLabel = 'This Day (today)';
const thisYear = 'T_YEAR';
const previousDay = 'DAY';
const previousDayLongLabel = 'Previous Day (yesterday)';
const previousYear = 'YEAR';
const previousYearLongLabel = 'Previous Year';
const thisYearLongLabel = 'This Year';
const last5Minutes = 'FIVE_MINUTES';
const last5MinutesLongLabel = 'Last 5 Minutes';
const last30Days = 'THIRTY_DAYS';
const last30DaysLongLabel = 'Last 30 Days';
const last12Months = 'TWELVE_MONTHS';
const last12MonthsLongLabel = 'Last 12 Months';

const FIVE_MINUTES = 5 * 60 * 1000;
const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;
const TWELVE_MONTHS = 366 * 24 * 60 * 60 * 1000;

const timezones = {
  Calcutta: {
    name: 'Asia/Calcutta',
    offset: -330
  },
  Perth: {
    region: 'Australia',
    city: 'Perth',
    offset: -480
  }
};

function checkPreviousYear() {
  const today = new Date();
  const startDate = TimeCalculations.getDateAsString(1, 1, today.getFullYear() - 1);
  const endDate = TimeCalculations.getDateAsString(31, 12, today.getFullYear() - 1);
  MainPage.checkText(widgetStart, `${startDate[0]}, ${startTimeDay}`);
  MainPage.checkText(widgetEnd, `${endDate[0]}, ${endTimeDay}`);
  MainPage.checkPickedPredefinedTime(previousYear, previousYearLongLabel, startDate[1], endDate[1]);
}

function checkThisYear() {
  const today = new Date();
  const startDate = TimeCalculations.getDateAsString(1, 1, today.getFullYear());
  const endDate = TimeCalculations.getDateAsString(31, 12, today.getFullYear());
  MainPage.checkText(widgetStart, `${startDate[0]}, ${startTimeDay}`);
  MainPage.checkText(widgetEnd, `${endDate[0]}, ${endTimeDay}`);
  MainPage.checkPickedPredefinedTime(thisYear, thisYearLongLabel, startDate[1], endDate[1]);
}

function applyCalcAndCheckLast(predefinedId, predefinedLabel, timeValue, timezoneOffset) {
  MainPage.leftBarParameterApplyValue();

  let today;
  let start;
  if (predefinedId === 'TWELVE_MONTHS') {
    const date = new Date();
    const clientTimeZoneOffset = timezoneOffset || date.getTimezoneOffset();
    const calculateDates = timeUtils.calculateRelativeTime(predefinedId, ':both', clientTimeZoneOffset, undefined);
    today = calculateDates.end;
    start = calculateDates.start;
    MainPage.checkTextWithCalculation(widgetStart, timeValue, start, true);
    MainPage.checkTextWithCalculation(widgetEnd, 0, today, true);
  } else {
    today = new Date();
    start = new Date(today.getTime() - timeValue);
    MainPage.checkTextWithCalculation(widgetStart, timeValue);
    MainPage.checkTextWithCalculation(widgetEnd, 0);
  }
  MainPage.checkUrl(predefinedId);

  const dateEnd = TimeCalculations.getDateAsString(today.getDate(), today.getMonth() + 1, today.getFullYear());
  const dateStart = TimeCalculations.getDateAsString(start.getDate(), start.getMonth() + 1, start.getFullYear());
  MainPage.checkPickedPredefinedTime(predefinedId, predefinedLabel, dateStart[1], dateEnd[1]);
}

function checkTodayOrYesterday(predefinedId, predefinedLabel) {
  let date;
  const today = new Date();
  if (predefinedId === thisDay) {
    date = TimeCalculations.getDateAsString(today.getDate(), today.getMonth() + 1, today.getFullYear());
  } else if (predefinedId === previousDay) {
    today.setDate(today.getDate() - 1);
    const yesterday = new Date(today);
    date = TimeCalculations.getDateAsString(yesterday.getDate(), yesterday.getMonth() + 1, yesterday.getFullYear());
  }
  MainPage.checkText(widgetStart, `${date[0]}, ${startTimeDay}`);
  MainPage.checkText(widgetEnd, `${date[0]}, ${endTimeDay}`);
  MainPage.checkUrl(predefinedId);
  MainPage.checkPickedPredefinedTime(predefinedId, predefinedLabel, date[1], date[1]);
}

function renderPage() {
  cy.visit('/#/show/Welcome');
  cy.wait(['@pageloadSystem', '@pageloadUser']);
}

describe('Time Range Selector Test', shared.defaultTestOptions, () => {
  beforeEach(() => {
    cy.intercept(`${Cypress.env('BVD_CONTEXT_ROOT')}/rest/${Cypress.env('API_VERSION')}/system`).as('pageloadSystem');
    cy.intercept(`${Cypress.env('BVD_CONTEXT_ROOT')}/rest/${Cypress.env('API_VERSION')}/session/user`).as('pageloadUser');
    cy.intercept({ method: 'POST', url: `${Cypress.env('BVD_CONTEXT_ROOT')}/rest/${Cypress.env('API_VERSION')}/channel/state` }).as('channelState');
    cy.intercept({ method: 'PUT', url: `${Cypress.env('BVD_CONTEXT_ROOT')}/rest/${Cypress.env('API_VERSION')}/session/user` }).as('updateUserData');
    cy.intercept({ method: 'GET', url: `${Cypress.env('BVD_CONTEXT_ROOT')}/rest/${Cypress.env('API_VERSION')}/tenant/systemsettings` }).as('loadSystemSettings');
    cy.intercept({ method: 'POST', url: `${Cypress.env('BVD_CONTEXT_ROOT')}/rest/${Cypress.env('API_VERSION')}/tenant/systemsettings` }).as('updateSystemSettings');
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

  // absolute time will be tested in l10n.spec.js

  it('Should clear time input when start or end dates are unselected', () => {
    const fromDate = ['2017', 'Jan 2017', 'Jan 27, 2017'];
    const toDate = ['2017', 'Jan 2017', 'Jan 30, 2017'];
    cy.bvdLogin(userName, userPwd);
    renderPage();
    cy.get('#load-spinner').should('not.be.visible');
    cy.visit(`/#/show/${dashboardName}?params=none`);
    cy.wait(['@pageloadUser', '@channelState']);
    MainPage.checkText(widgetStart, 'true');
    MainPage.clickSlideOutForParamSelection();
    MainPage.selectDates(fromDate, toDate);
    MainPage.unSelectDates(fromDate, toDate);
    MainPage.checkClearedText(widgetStart);
    MainPage.logOutOfBVD();
  });

  it('Should set relative time Previous', () => {
    cy.bvdLogin(userName, userPwd);
    renderPage();
    cy.get('#load-spinner').should('not.be.visible');
    cy.visit(`/#/show/${dashboardName}?params=none`);
    cy.wait(['@pageloadUser', '@channelState']);
    MainPage.checkText(widgetStart, 'true');
    MainPage.clickSlideOutForParamSelection();
    MainPage.selectPredefinedTime(previousDay);
    MainPage.leftBarParameterApplyValue();
    checkTodayOrYesterday(previousDay, previousDayLongLabel);
    MainPage.logOutOfBVD();
  });

  it('Should set relative time This', () => {
    cy.bvdLogin(userName, userPwd);
    renderPage();
    cy.get('#load-spinner').should('not.be.visible');
    cy.visit(`/#/show/${dashboardName}?params=none`);
    cy.wait(['@pageloadUser', '@channelState']);
    MainPage.checkText(widgetStart, 'true');
    MainPage.clickSlideOutForParamSelection();
    MainPage.selectPredefinedTime(thisDay);
    MainPage.leftBarParameterApplyValue();
    checkTodayOrYesterday(thisDay, thisDayLongLabel);
    MainPage.selectPredefinedTime(thisYear);
    MainPage.leftBarParameterApplyValue();
    checkThisYear();
    MainPage.logOutOfBVD();
  });

  it('Should set relative time Last (5 Minutes)', () => {
    cy.bvdLogin(userName, userPwd);
    renderPage();
    cy.get('#load-spinner').should('not.be.visible');
    cy.visit(`/#/show/${dashboardName}?params=none`);
    cy.wait(['@pageloadUser', '@channelState']);
    MainPage.checkText(widgetStart, 'true');
    MainPage.clickSlideOutForParamSelection();
    MainPage.selectPredefinedTime(last5Minutes);
    applyCalcAndCheckLast(last5Minutes, last5MinutesLongLabel, FIVE_MINUTES);
    MainPage.logOutOfBVD();
  });

  it('Should set relative time Last (30 Days)', () => {
    cy.bvdLogin(userName, userPwd);
    renderPage();
    cy.get('#load-spinner').should('not.be.visible');
    cy.visit(`/#/show/${dashboardName}?params=none`);
    cy.wait(['@pageloadUser', '@channelState']);
    MainPage.checkText(widgetStart, 'true');
    MainPage.clickSlideOutForParamSelection();
    MainPage.selectPredefinedTime(last30Days);
    applyCalcAndCheckLast(last30Days, last30DaysLongLabel, THIRTY_DAYS);
    MainPage.logOutOfBVD();
  });

  it('Should set relative time Last (12 Months)', () => {
    cy.bvdLogin(userName, userPwd);
    renderPage();
    cy.get('#load-spinner').should('not.be.visible');
    cy.visit(`/#/show/${dashboardName}?params=none`);
    cy.wait(['@pageloadUser', '@channelState']);
    MainPage.checkText(widgetStart, 'true');
    MainPage.clickSlideOutForParamSelection();
    MainPage.selectPredefinedTime(last12Months);
    applyCalcAndCheckLast(last12Months, last12MonthsLongLabel, TWELVE_MONTHS);
    MainPage.logOutOfBVD();
  });

  it('Should reset value', () => {
    cy.bvdLogin(userName, userPwd);
    renderPage();
    cy.get('#load-spinner').should('not.be.visible');
    cy.visit(`/#/show/${dashboardName}?params=none`);
    cy.wait(['@pageloadUser', '@channelState']);
    MainPage.checkText(widgetStart, 'true');
    MainPage.clickSlideOutForParamSelection();
    MainPage.selectPredefinedTime(last5Minutes);
    applyCalcAndCheckLast(last5Minutes, last5MinutesLongLabel, FIVE_MINUTES);
    MainPage.resetParameterValue();
    cy.get('[data-cy=date-string]').should('be.empty');
    MainPage.logOutOfBVD();
  });

  it('Should add default value to param query', () => {
    cy.bvdLogin();
    renderPage();
    MainPage.validateIfMainPage();
    MainPage.navigateToDataCollector();
    DataCollectorPage.editQuery({ paramQueryName, predefinedId: 'YEAR' });
    DataCollectorPage.validateDateTypeandDefaultValue(paramQueryName, paramVariableName, 'Date range', 'Previous Year');
    cy.visit(`/#/show/${dashboardName}?params=none`);
    cy.wait(['@pageloadUser', '@channelState']);
    checkPreviousYear();
    MainPage.logOutOfBVD();
  });

  it('Should reset value with default value', () => {
    cy.bvdLogin(userName, userPwd);
    renderPage();
    cy.get('#load-spinner').should('not.be.visible');
    cy.visit(`/#/show/${dashboardName}?params=none`);
    cy.wait(['@pageloadUser', '@channelState']);
    checkPreviousYear();
    MainPage.selectPredefinedTime(last5Minutes);
    MainPage.resetParameterValue();
    MainPage.checkLabelSlideOut(previousYearLongLabel);
    MainPage.logOutOfBVD();
  });

  it('Should check for invalid inputs in date range selector', () => {
    cy.bvdLogin(userName, userPwd);
    renderPage();
    cy.get('#load-spinner').should('not.be.visible');
    cy.visit(`/#/show/${dashboardName}?params=none`);
    cy.wait(['@pageloadUser', '@channelState']);
    const currentYear = new Date().getFullYear();
    const fromdatelist = [currentYear, `Jul ${currentYear}`, `Jul 5, ${currentYear}`, '10', '00', 'AM'];
    const todatelist = [currentYear, `Jul ${currentYear}`, `Jul 7, ${currentYear}`, '11', '00', 'AM'];
    MainPage.clickSlideOutForParamSelection();
    MainPage.selectDateParamsFromSlideout(fromdatelist, todatelist, false, true);
    cy.get(`.controls>[data-cy='date-string']~button>.qtm-font-icon`).should('be.visible').click();

    // Select end date which is before from date
    cy.get(`ux-date-time-picker.end-date-picker button[aria-label="Jul 4, ${currentYear}"]`).click();
    cy.get('[data-cy=date-string]').should('be.empty');
    cy.get(`ux-date-time-picker.start-date-picker button[aria-label="Jul 5, ${currentYear}"]`).should('be.disabled');
    cy.get(`ux-date-time-picker.start-date-picker button[aria-label="Jul 2, ${currentYear}"]`).click();
    cy.get(`ux-date-time-picker.start-date-picker button[aria-label="Jul 5, ${currentYear}"]`).should('not.be.disabled');
    cy.get('[data-cy=date-string]').should('not.be.empty');

    // Select from date which is after end date
    cy.get(`ux-date-time-picker.start-date-picker button[aria-label="Jul 8, ${currentYear}"]`).click();
    cy.get('[data-cy=date-string]').should('be.empty');
    cy.get(`ux-date-time-picker.end-date-picker button[aria-label="Jul 7, ${currentYear}"]`).should('be.disabled');
    cy.get(`ux-date-time-picker.end-date-picker button[aria-label="Jul 9, ${currentYear}"]`).should('not.be.disabled');
    cy.get(`ux-date-time-picker.end-date-picker button[aria-label="Jul 9, ${currentYear}"]`).click();
    cy.get('[data-cy=date-string]').should('not.be.empty');
    MainPage.logOutOfBVD();
  });

  it('Should adapt calculated relative time range depending on user settings timezone', () => {
    cy.bvdLogin();
    cy.visit(`/#/show/${dashboardName}?params=none`);
    cy.wait(['@pageloadUser', '@channelState']);
    MainPage.navigateToSystemSettings();
    cy.wait('@loadSystemSettings');
    SystemSettingsPage.checkDefaultSystemSettings();
    SystemSettingsPage.changeRegion(timezones.Perth.region);
    SystemSettingsPage.changeCity(timezones.Perth.city);
    SystemSettingsPage.clickSaveSystemSettings();
    cy.wait('@updateSystemSettings');
    MainPage.clickSlideOutForParamSelection();
    MainPage.selectPredefinedTime(last12Months);
    applyCalcAndCheckLast(last12Months, last12MonthsLongLabel, TWELVE_MONTHS, timezones.Perth.offset);
  });

  it('Should adapt calculated relative time range depending on system settings timezone', () => {
    cy.bvdLogin();
    cy.visit(`/#/show/${dashboardName}?params=none`);
    cy.wait(['@pageloadUser', '@channelState']);
    cy.get('[data-cy="personal-user-settings"]').click();
    cy.get('[data-cy="user-settings"]').click();
    PersonalSettingsPage.selectMyTimezone();
    PersonalSettingsPage.changeMyTimezone(timezones.Calcutta.name);
    PersonalSettingsPage.clickSavePersonalSettings();
    cy.wait('@updateUserData');
    MainPage.clickSlideOutForParamSelection();
    MainPage.selectPredefinedTime(last12Months);
    applyCalcAndCheckLast(last12Months, last12MonthsLongLabel, TWELVE_MONTHS, timezones.Calcutta.offset);
  });

  after(() => {
    // LogOut of session if test fails during execution and logout does not occur through UI
    cy.bvdLogout();
    dashboard.dashboardDelete(dashboardName);
    role.roleDeletion(roleId);
    dataCollector.deleteAllQueries();
    timezoneRestUtil.updateSystemTimeZone('UTC');
    timezoneRestUtil.updateUserTimeZone('', true);
  });
});
