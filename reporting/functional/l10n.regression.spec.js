import DataCollectorPage from '../../../../support/reporting/pageObjects/DataCollectorPage';
const shared = require('../../shared/shared');
const role = require('../../../../support/reporting/restUtils/role');
const dashboard = require('../../../../support/reporting/restUtils/dashboard');
const dataCollector = require('../../../../support/reporting/restUtils/dataCollector');
import MainPage from '../../../../support/reporting/pageObjects/MainPage';
import * as DateRangePickerDashboard from '../../../../support/reporting/pageObjects/DateRangePickerDashboard';
import { uploadFileRequest } from '../../../../support/reporting/restUtils/uploadFile';
import { dashboardDelete } from '../../../../support/reporting/restUtils/dashboard';

function getChromeLanguage() {
  const chromeLanguage = Cypress.env('CHROME_LANGUAGE');
  if (chromeLanguage === undefined) {
    return 'en';
  }
  return chromeLanguage;
}
const chromeLanguage = getChromeLanguage();
/**
 *
 * HOW TO USE THIS TEST!
 *
 * This test checks different browser languages.
 * It uses the Cypress environment variable: "CHROME_LANGUAGE".
 * If nothing is defined, it will run with the default browser language English.
 *
 * Possible languages are the ones we support:
 * ['en', 'de', 'es', 'fr', 'ja', 'ko', 'ru', 'zh-cn']
 *
 * If you want to test one of these languages, change the Cypress environment variable and run this test.
 * Other tests may not be successful because the tests are not adapted to different languages.
 *
 */

describe('L10N cypress tests', shared.defaultTestOptions, () => {
  beforeEach(() => {
    cy.intercept(`${Cypress.env('BVD_CONTEXT_ROOT')}/rest/${Cypress.env('API_VERSION')}/system`).as('pageloadSystem');
    cy.intercept(`${Cypress.env('BVD_CONTEXT_ROOT')}/rest/${Cypress.env('API_VERSION')}/session/user`).as('pageloadUser');
  });

  describe('Time range selector', shared.defaultTestOptions, () => {
    const dashboardName = 'datePicker';
    const widgetStart = 'shape1005';
    const widgetEnd = 'shape1006';

    const userName = 'TesterDateTimeParam';
    const userPwd = 'Test@123';
    const roleName = 'testdatetimeparam';
    const roleDesc = 'For datetimeparam';
    const categoryName = 'All';
    const accessType = 'full-control';
    const paramQueryName = 'param_query_datetime';
    let roleId;
    const languageMapDates = new Map([
      ['en', {
        startDate: ['2017', 'Jan 2017', 'Jan 27, 2017', '8', '00', 'AM'],
        endDate: ['2017', 'Jan 2017', 'Jan 30, 2017', '8', '00', 'AM'],
        dateString: '01/27/2017 08:00 AM — 01/30/2017 08:00 AM',
        startDateString: '1/27/2017, 8:00',
        endDateString: '1/30/2017, 8:00'
      }],
      ['de', {
        startDate: ['2017', 'Jan. 2017', 'Jan 27, 2017', '8', '00'],
        endDate: ['2017', 'Jan. 2017', 'Jan 30, 2017', '8', '00'],
        dateString: '27.01.2017 08:00 — 30.01.2017 08:00',
        startDateString: '27.1.2017, 08:00',
        endDateString: '30.1.2017, 08:00'
      }],
      ['es', {
        startDate: ['2017', 'ene. 2017', 'Jan 27, 2017', '8', '00'],
        endDate: ['2017', 'ene. 2017', 'Jan 30, 2017', '8', '00'],
        dateString: '27/01/2017 08:00 — 30/01/2017 08:00',
        startDateString: '27/1/2017 8:00',
        endDateString: '30/1/2017 8:00'
      }],
      ['ru', {
        startDate: ['2017', 'янв. 2017', 'Jan 27, 2017', '8', '00'],
        endDate: ['2017', 'янв. 2017', 'Jan 30, 2017', '8', '00'],
        dateString: '27.01.2017 08:00 — 30.01.2017 08:00',
        startDateString: '27.01.2017, 08:00',
        endDateString: '30.01.2017, 08:00'
      }],
      ['fr', {
        startDate: ['2017', 'janv. 2017', 'Jan 27, 2017', '8', '00'],
        endDate: ['2017', 'janv. 2017', 'Jan 30, 2017', '8', '00'],
        dateString: '27/01/2017 08:00 — 30/01/2017 08:00',
        startDateString: '27/01/2017, 08:00',
        endDateString: '30/01/2017, 08:00'
      }],
      ['ja', {
        startDate: ['2017', '1月 2017', 'Jan 27, 2017', '8', '00'],
        endDate: ['2017', '1月 2017', 'Jan 30, 2017', '8', '00'],
        dateString: '2017/01/27 08:00 — 2017/01/30 08:00',
        startDateString: '2017/1/27 8:00',
        endDateString: '2017/1/30 8:00'
      }],
      // will fail as soon as am/pm will be translated
      ['ko', {
        startDate: ['2017', '1월 2017', 'Jan 27, 2017', '8', '00', 'AM'],
        endDate: ['2017', '1월 2017', 'Jan 30, 2017', '8', '00', 'AM'],
        dateString: '2017. 01. 27. 오전 08:00 — 2017. 01. 30. 오전 08:00',
        startDateString: '2017. 1. 27. 오전 8:00',
        endDateString: '2017. 1. 30. 오전 8:00'
      }],
      // will fail as soon as am/pm will be translated
      ['zh-cn', {
        startDate: ['2017', '1月 2017', 'Jan 27, 2017', '8', '00', 'AM'],
        endDate: ['2017', '1月 2017', 'Jan 30, 2017', '8', '00', 'AM'],
        dateString: '2017/01/27 上午08:00 — 2017/01/30 上午08:00',
        startDateString: '2017/1/27上午8:00',
        endDateString: '2017/1/30上午8:00'
      }]
    ]);
    const specificLanguageDates = languageMapDates.get(chromeLanguage) ? languageMapDates.get(chromeLanguage) : 'en';

    it('create a Role through REST', () => {
      role.roleCreation(roleName, roleDesc, categoryName, accessType).then(newRoleId => {
        roleId = newRoleId;
      });
    });

    it('Create predefined query and dashboard', () => {
      DateRangePickerDashboard.createDataCollectorsAndDashboard(userName, userPwd);
    });

    it('should set absolute time in the side panel', () => {
      cy.bvdLogin(userName, userPwd);
      cy.intercept(`${Cypress.env('BVD_CONTEXT_ROOT')}/ui/dashboard/${dashboardName}?isInstance=true`).as('pageLoadingDone');
      cy.visit(`#/show/${dashboardName}`);
      cy.wait('@pageLoadingDone');
      MainPage.checkText(widgetStart, 'true');
      MainPage.clickSlideOutForParamSelection();
      MainPage.selectDateParamsFromSlideout(specificLanguageDates.startDate, specificLanguageDates.endDate);
      MainPage.checkLabelSlideOut(specificLanguageDates.dateString);
      MainPage.leftBarParameterApplyValue();
      MainPage.checkText(widgetStart, specificLanguageDates.startDateString);
      MainPage.checkText(widgetEnd, specificLanguageDates.endDateString);
    });

    it('should test the predefined query to define a default absolute value', () => {
      cy.bvdLogin();
      cy.visit('#/dataCollector');
      cy.wait(['@pageloadSystem', '@pageloadUser']);
      DataCollectorPage.editQuery({ paramQueryName, checkCalendar: true, absoluteDate: specificLanguageDates });
    });

    it('should verify the default value in the side panel', () => {
      cy.bvdLogin(userName, userPwd);
      cy.intercept(`${Cypress.env('BVD_CONTEXT_ROOT')}/ui/dashboard/${dashboardName}?isInstance=true`).as('pageLoadingDone');
      cy.visit(`#/show/${dashboardName}`);
      cy.wait('@pageLoadingDone');
      MainPage.checkText(widgetStart, specificLanguageDates.startDateString);
      MainPage.checkText(widgetEnd, specificLanguageDates.endDateString);
      MainPage.clickSlideOutForParamSelection();
      MainPage.checkLabelSlideOut(specificLanguageDates.dateString);
      MainPage.toggleMenu(true);
      cy.get(`ux-date-time-picker.start-date-picker table.calendar button[aria-label='${specificLanguageDates.startDate[2]}']`)
        .should('be.visible')
        .and('have.class', 'range-start')
        .and('have.class', 'active');
      cy.get(`ux-date-time-picker.end-date-picker table.calendar button[aria-label='${specificLanguageDates.endDate[2]}']`)
        .should('be.visible')
        .and('have.class', 'range-end')
        .and('have.class', 'active');
    });

    after(() => {
      // LogOut of session if test fails during execution and logout does not occur through UI
      cy.bvdLogout();
      dashboard.dashboardDelete(dashboardName);
      role.roleDeletion(roleId);
      dataCollector.deleteAllQueries();
    });
  });

  describe('Test l10n for dataCollector', () => {
    let specificLanguage;

    function getL10n(lang, cb) {
      if (lang === 'zh-cn') {
        lang = 'zh_CN';
      }
      cy.readFile(`../www/client/static/l10n/dashboard_${lang}.json`).then(dashboardL10n => {
        cy.request({
          method: 'GET',
          url: `/opr-l10n/resources/opr-common_${lang}.js`
        }).then(common => {
          cy.log(common);
          const commonL10n = JSON.parse(common.body);
          cb({ ...dashboardL10n, ...commonL10n });
        });
      });
    }

    beforeEach(() => {
      cy.intercept(`${Cypress.env('BVD_CONTEXT_ROOT')}/rest/${Cypress.env('API_VERSION')}/system`).as('pageloadSystem');
      cy.intercept(`${Cypress.env('BVD_CONTEXT_ROOT')}/rest/${Cypress.env('API_VERSION')}/session/user`).as('pageloadUser');
      cy.bvdLogin();
      cy.visit('#/dataCollector');
      cy.wait(['@pageloadSystem', '@pageloadUser']);
      getL10n(chromeLanguage || 'en', l10nData => {
        specificLanguage = l10nData;
      });
    });

    afterEach(() => {
      cy.bvdLogout();
    });

    it('Test localization of Create new', () => {
      DataCollectorPage.clickOn(DataCollectorPage.buttonNewCreateQuery, specificLanguage['dataCollector.list.new']);
      DataCollectorPage.validateTextPresence(specificLanguage['dataCollector.home.newicon.dataquery']);
      DataCollectorPage.validateTextPresence(specificLanguage['dataCollector.home.newicon.parameterquery']);
    });

    it('Test localization of filter', () => {
      DataCollectorPage.clickOn(DataCollectorPage.buttonFilter, specificLanguage['opr.common.filter']);
      DataCollectorPage.validateTextPresence(specificLanguage['dataCollector.home.toobarFilter.optionAll']);
      DataCollectorPage.validateTextPresence(specificLanguage['dataCollector.home.toolbarFilter.optionDatQueries']);
      DataCollectorPage.validateTextPresence(specificLanguage['dataCollector.home.toolbarFilter.optionParameterQueries']);
    });

    it('Test localization of More', () => {
      DataCollectorPage.clickOn(DataCollectorPage.buttonMoreOptions, specificLanguage['dataCollector.list.more']);
      DataCollectorPage.validateTextPresence(specificLanguage['dataCollector.home.toolbarMenu.optionExport']);
      DataCollectorPage.validateTextPresence(specificLanguage['dataCollector.home.toolbarMenu.optionImport']);
      DataCollectorPage.validateTextPresence(specificLanguage['dataCollector.home.toolbarMenu.optionDBSettings']);
    });

    it('Test localization of search', () => {
      DataCollectorPage.clickOnSearchBox(specificLanguage['opr.common.search'], specificLanguage['dataCollector.home.toolbarMenu.search']);
    });

    after(() => {
      dataCollector.deleteAllQueries();
    });
  });

  describe('Single DateTime Parameter Test', shared.defaultTestOptions, () => {
    beforeEach(() => {
      cy.intercept(`${Cypress.env('BVD_CONTEXT_ROOT')}/rest/${Cypress.env('API_VERSION')}/system`).as('pageloadSystem');
      cy.intercept(`${Cypress.env('BVD_CONTEXT_ROOT')}/rest/${Cypress.env('API_VERSION')}/session/user`).as('pageloadUser');
      cy.intercept({ method: 'POST', url: `${Cypress.env('BVD_CONTEXT_ROOT')}/rest/${Cypress.env('API_VERSION')}/channel/state` }).as('channelState');
    });
    const languageMapDates = new Map([
      ['en', {
        singleDate: ['Nov 2020', 'Nov 12, 2020', '10', '30', 'PM'],
        singleDateSecond: ['Nov 2020', 'Nov 30, 2020', '7', '30', 'AM'],
        dateString: '11/12/2020 10:30 PM',
        dateStringSecond: '11/30/2020 07:30 AM'
      }],
      ['de', {
        singleDate: ['Nov. 2020', 'Nov 12, 2020', '22', '30'],
        singleDateSecond: ['Nov. 2020', 'Nov 30, 2020', '7', '30'],
        dateString: '12.11.2020 22:30',
        dateStringSecond: '30.11.2020 07:30'
      }],
      ['es', {
        singleDate: ['nov. 2020', 'Nov 12, 2020', '22', '30'],
        singleDateSecond: ['nov. 2020', 'Nov 30, 2020', '7', '30'],
        dateString: '12/11/2020 22:30',
        dateStringSecond: '30/11/2020 07:30'
      }],
      ['ru', {
        singleDate: ['нояб. 2020', 'Nov 12, 2020', '22', '30'],
        singleDateSecond: ['нояб. 2020', 'Nov 30, 2020', '7', '30'],
        dateString: '12.11.2020 22:30',
        dateStringSecond: '30.11.2020 07:30'
      }],
      ['fr', {
        singleDate: ['nov. 2020', 'Nov 12, 2020', '22', '30'],
        singleDateSecond: ['nov. 2020', 'Nov 30, 2020', '7', '30'],
        dateString: '12/11/2020 22:30',
        dateStringSecond: '30/11/2020 07:30'
      }],
      ['ja', {
        singleDate: ['11月 2020', 'Nov 12, 2020', '22', '30'],
        singleDateSecond: ['11月 2020', 'Nov 30, 2020', '7', '30'],
        dateString: '2020/11/12 22:30',
        dateStringSecond: '2020/11/30 07:30'
      }],
      // will fail as soon as am/pm will be translated
      ['ko', {
        singleDate: ['11월 2020', 'Nov 12, 2020', '10', '30', 'PM'],
        singleDateSecond: ['11월 2020', 'Nov 30, 2020', '7', '30', 'AM'],
        dateString: '2020. 11. 12. 오후 10:30',
        dateStringSecond: '2020. 11. 30. 오전 07:30'
      }],
      // will fail as soon as am/pm will be translated
      ['zh-cn', {
        singleDate: ['11月 2020', 'Nov 12, 2020', '10', '30', 'PM'],
        singleDateSecond: ['11月 2020', 'Nov 30, 2020', '7', '30', 'AM'],
        dateString: '2020/11/12 下午10:30',
        dateStringSecond: '2020/11/30 上午07:30'
      }]
    ]);
    const dashboardName = 'DateTimeParameter';
    const specificLanguageDates = languageMapDates.get(chromeLanguage) ? languageMapDates.get(chromeLanguage) : 'en';
    const widget = 'group187';
    const secondWidget = 'group284';
    const userName = 'TesterSingleDateTimeParam';
    const userPwd = 'Test@123';
    const paramVariable = 'singleDateParameter';
    const paramVariableSecond = 'singleDateParameter_second';

    const roleName = 'testsingledatetimeparam';
    const roleDesc = 'For single datetimeparam';
    const categoryName = 'All';
    const accessType = 'full-control';
    const startWeekDay = Cypress.env('START_OF_THE_WEEK').substr(0, 3);
    let roleId;

    it('create a Role through REST', () => {
      role.roleCreation(roleName, roleDesc, categoryName, accessType).then(newRoleId => {
        roleId = newRoleId;
      });
    });

    it('should upload file', () => {
      uploadFileRequest('reporting/DateTimeParameter.bvd', `${Cypress.env('BVD_CONTEXT_ROOT')}/urest/${Cypress.env('API_VERSION')}/dashboard`);
    });

    it('should check one specific date', () => {
      cy.bvdLogin(userName, userPwd);
      cy.visit('/#/show/DateTimeParameter?params=none');
      cy.wait(['@pageloadSystem', '@pageloadUser', '@channelState']);
      cy.get('#load-spinner').should('not.be.visible');
      MainPage.barCount(widget, 20);
      MainPage.clickSlideOutForParamSelection();
      MainPage.selectSingleDateParamFromSlideout(startWeekDay, paramVariableSecond, false, specificLanguageDates.singleDateSecond);

      MainPage.validateDatePickerWithProvidedValue(specificLanguageDates.dateStringSecond, paramVariableSecond);
      MainPage.validateDatePickerWithProvidedValue('', paramVariable);

      MainPage.leftBarParameterApplyValue();
      MainPage.barCount(secondWidget, 10);
      cy.url().should('include', 'singleDateParameter_second%3D2020-11-30%2007:30');
      cy.bvdLogout();
    });

    it('should check two specific date and reset case', () => {
      cy.bvdLogin(userName, userPwd);
      cy.visit('/#/show/DateTimeParameter?params=none');
      cy.wait(['@pageloadSystem', '@pageloadUser', '@channelState']);
      cy.get('#load-spinner').should('not.be.visible');
      MainPage.barCount(widget, 20);
      MainPage.clickSlideOutForParamSelection();
      MainPage.selectSingleDateParamFromSlideout(startWeekDay, paramVariable, false, specificLanguageDates.singleDate);
      MainPage.selectSingleDateParamFromSlideout(startWeekDay, paramVariableSecond, false, specificLanguageDates.singleDateSecond);

      MainPage.validateDatePickerWithProvidedValue(specificLanguageDates.dateString, paramVariable);
      MainPage.validateDatePickerWithProvidedValue(specificLanguageDates.dateStringSecond, paramVariableSecond);

      MainPage.leftBarParameterApplyValue();
      MainPage.barCount(secondWidget, 10);
      cy.url().should('include', 'singleDateParameter%3D2020-11-12%2022:30');
      cy.url().should('include', 'singleDateParameter_second%3D2020-11-30%2007:30');

      // reset
      MainPage.clickSlideOutForParamSelection();
      MainPage.resetParameterValue();
      MainPage.validateDatePickerWithProvidedValue('', paramVariable);
      MainPage.validateDatePickerWithProvidedValue('', paramVariableSecond);
      MainPage.leftBarParameterApplyValue();
      cy.url().should('not.include', 'singleDateParameter%3D2020-11-12%2022:30');
      cy.url().should('not.include', 'singleDateParameter_second%3D2020-11-30%2007:30');

      MainPage.barCount(widget, 20);
    });

    after(() => {
      // Logout of session if test fails during execution and logout does not occur through UI
      cy.bvdLogout();
      dataCollector.deleteAllQueries();
      dashboardDelete(dashboardName);
      role.roleDeletion(roleId);
    });
  });
});
