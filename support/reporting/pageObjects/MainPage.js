import 'cypress-iframe';
const moment = require('moment');
const shared = require('../../../integration/bvd/shared/shared');
const TWO_MINUTES = 2 * 60 * 1000;

class MainPage {
  constructor() {
    this.adminMenu = '#nav_admin_menu';
    this.dataCollectorDropDownlink = '#nav_system_data_collector';
    this.dashboardsDropDownLink = '#nav_system_manage';
    this.resourcesDropDownLink = '#nav_system_downloads';
    this.spinner = '.spinner';
    this.defaultDashboard = '#nav_default_dashboard';
    this.defaultDashboardbtn = 'button#nav_default_dashboard';
    this.navUserMenu = 'button#nav_user_menu';
    this.navLogOutBtn = '#nav_logout';
    this.logOutLink = 'button#logout-link';
    this.dashboardsLink = '#nav_dashboards_menu';
    this.loadSpinner = '#load-spinner';
    this.divProgressBar = `div[data-progress='99']`;
    this.slideOut = 'button.slideout-button';
    this.verifySlideOutOpen = 'div.slideout-open';
    this.calendarUXIcon = `.controls>[data-cy='date-string']~button>.qtm-font-icon`;
    this.calendarContainer = 'div.filter-menu-container';
    this.startDatePickerBtn = `ux-date-time-picker.start-date-picker button[aria-label='Switch to show months in the year']`;
    this.startDecadeBtn = `ux-date-time-picker.start-date-picker button[aria-label='Switch to show years in the decade']`;
    this.endDecadeBtn = `ux-date-time-picker.end-date-picker button[aria-label='Switch to show years in the decade']`;
    this.endDatePickerBtn = `ux-date-time-picker.end-date-picker button[aria-label='Switch to show months in the year']`;
    this.startDatePreviousBtn = `ux-date-time-picker.start-date-picker [name='previous']`;
    this.enddatePreviousBtn = `ux-date-time-picker.end-date-picker [name='previous']`;
    this.fromDateInputHour = `ux-date-time-picker.start-date-picker input[type='text'][aria-label='hour']`;
    this.fromdateTimeZone = `ux-date-time-picker.start-date-picker input[type='text'][aria-label='Time Zone']`;
    this.fromDateTimeZoneIncreaseKey = `ux-date-time-picker.start-date-picker button[aria-label='Switch to the next time zone'] ux-icon`;
    this.toDateTimeZoneDecreaseKey = `ux-date-time-picker.end-date-picker button[aria-label='Switch to the previous time zone'] ux-icon`;
    this.toDateTimeZone = `ux-date-time-picker.end-date-picker input[type='text'][aria-label='Time Zone']`;
    this.fromDateInputMinute = `ux-date-time-picker.start-date-picker input[type='text'][aria-label='minute']`;
    this.toDateInputHour = `ux-date-time-picker.end-date-picker input[type='text'][aria-label='hour']`;
    this.toDateInputMinute = `ux-date-time-picker.end-date-picker input[type='text'][aria-label='minute']`;
    this.selectedFromDate = `ux-date-time-picker.start-date-picker  button[aria-selected='true']`;
    this.selectedTodate = `ux-date-time-picker.end-date-picker  button[aria-selected='true']`;
    this.toDateAmPm = `ux-date-time-picker.end-date-picker button[role='radio'][aria-checked='true']`;
    this.fromDateAmPm = `ux-date-time-picker.start-date-picker button[role='radio'][aria-checked='true']`;
    this.applyBtnForParamValue = '[data-cy="apply-button"]';
    this.parameterPanelDateString = '[data-cy=date-string]';
    this.editButton = '[data-cy=edit-dashboard-button]';
    this.externalLinkBanner = '[data-cy=external-link]';
    this.externalLinkBannerClosebtn = '[data-cy=external-link] button';
    this.externalLinkBannerRemoveLink = 'a#hide-message';
    this.externalBanner = '[data-cy=hide-message]';
    this.iframeid = 'iframe#url_shape1';
  }

  checkIfExternalLinkBannerIsPresent() {
    cy.get(this.externalLinkBanner);
    cy.get(this.externalLinkBannerClosebtn);
    cy.get(this.externalBanner).should('have.text', 'Do not show this message again');
  }

  checkExternalLinkBannerIsNotPresent() {
    cy.get(this.externalLinkBanner).should('not.exist');
  }

  hideExternalBanner() {
    cy.get(this.externalLinkBannerClosebtn).click();
    cy.get(this.externalLinkBanner).should('not.exist');
  }

  removeExtBannerForEver() {
    cy.get(this.externalLinkBannerRemoveLink).should('be.visible');
    cy.get(this.externalLinkBannerRemoveLink).click();
    cy.get(this.externalLinkBanner).should('not.exist');
  }

  resetExtBannerForever() {
    cy.getCookie('secureModifyToken').then(val => {
      cy.request({
        method: 'PUT',
        url: '/rest/v2/session/user',
        body: { userDetails: { settings: {
          timezone: '',
          useSystemTimeZone: true
        }}},
        headers: {
          'X-Secure-Modify-Token': val.value
        }
      });
    });
  }

  validateIfMainPage() {
    cy.get(this.spinner).should('not.be.visible');
    cy.get(this.defaultDashboard).should('be.visible');
    cy.get(this.defaultDashboardbtn).should('be.visible');
  }

  navigateToDashboards() {
    cy.get(this.adminMenu).click();
    cy.get(this.dashboardsDropDownLink).should('be.visible').click();
    cy.get(this.spinner).should('not.be.visible');
  }

  navigateToDataCollector() {
    cy.get(this.adminMenu).click();
    cy.get(this.dataCollectorDropDownlink).should('be.visible').click();
  }

  navigateToSystemSettings() {
    cy.get('[data-cy="administration-button"]').click();
    cy.get('[data-cy="system-settings"]').click();
  }

  navigateToPersonalSettings() {
    cy.get('[data-cy="personal-user-settings"]').click();
    cy.get('[data-cy="user-settings"]').click();
  }

  logOutOfBVD() {
    cy.get(this.loadSpinner).should('not.be.visible');
    cy.get(this.navUserMenu).should('be.visible').click();
    cy.get(this.navLogOutBtn).should('be.visible').click();
    cy.location('pathname').should('include', '/idm-service');
  }

  validateValueInTextWidget(widgetSelector, widgetValue) {
    cy.get(widgetSelector).should('have.text', widgetValue);
  }

  navigteToResources() {
    cy.get(this.adminMenu).click();
    cy.get(this.resourcesDropDownLink).click();
  }

  viewDashboard(dashboardName) {
    cy.intercept({
      method: 'POST',
      path: `${shared.reportingContextRoot}/rest/${Cypress.env('API_VERSION')}/channel/state`
    }).as('channelState');
    cy.intercept({
      method: 'GET',
      path: `${shared.reportingContextRoot}/rest/${Cypress.env('API_VERSION')}/dashboard?type=dashboards,instances&excludeNotInMenu=true`
    }).as('dashboards');
    cy.get(this.dashboardsLink).should('be.visible').click();
    cy.wait('@dashboards');
    cy.get('div.categorized-dashboard-list').should('be.visible');
    cy.get('a').contains(dashboardName).scrollIntoView().should('be.visible').click();
    cy.wait('@channelState');
    cy.get(this.loadSpinner).should('not.be.visible');
  }

  viewDashboardforIframe(dashboardName) {
    cy.intercept({
      method: 'GET',
      path: `${shared.reportingContextRoot}/rest/${Cypress.env('API_VERSION')}/session/user`
    }).as('pageloadUser');
    cy.get(this.dashboardsLink).should('be.visible').click();
    cy.get('div.categorized-dashboard-list').should('be.visible');
    cy.get('a').contains(dashboardName).should('be.visible').click();
    cy.wait('@pageloadUser');
    cy.get(this.loadSpinner).should('not.be.visible');
  }

  validateIFrameUrl(anchorTitle) {
    cy.iframe(this.iframeid).find(`a[title='${anchorTitle}']`).should('be.visible');
  }

  clickDashboardEdit() {
    cy.get(this.editButton).click();
    cy.get(this.loadSpinner).should('not.be.visible');
  }

  barCount(widget, barCount, color = '#5b9bd5') {
    cy.get(this.loadSpinner).should('not.be.visible');
    cy.get(`#${widget}`).should('be.visible');
    cy.get(`g#${widget} svg path[fill="${color}"]`).should('be.visible');
    cy.get(`g#${widget} svg path[fill="${color}"]`).should('have.length', barCount);
  }

  lineChartPoints(widget, points) {
    cy.get(this.loadSpinner).should('not.be.visible');
    cy.get(`#${widget}`).should('be.visible');
    cy.get(`g#${widget} svg path[d='M1 0A1 1 0 1 1 1 -0.0001']`).should('be.visible');
    cy.get(`g#${widget} svg path[d='M1 0A1 1 0 1 1 1 -0.0001']`).should('have.length', points);
  }

  checkEquality(actual, expected) {
    const actual1 = actual.substr(0, actual.indexOf('Z'));
    const expected1 = expected.substr(0, actual.indexOf('Z'));
    assert.strictEqual(expected1, actual1);
  }

  getXandYAxisText(widget, expectedTextArray) {
    const textArray = [];
    cy.get(`g#${widget} svg text`).each(widgetText => {
      textArray.push(widgetText.text());
    }).then(() => {
      expect(textArray).to.include.members(expectedTextArray);
    });
  }

  checkIfWidgetIsHidden(widget) {
    cy.get(`#${widget}`).invoke('css', 'visibility').should('equal', 'hidden');
  }

  getDataPointsTitleWithoutGMT(widget, expectedTextArray) {
    const textArray = [];
    cy.get(`g#${widget} title`).each(widgetText => {
      const str = widgetText.text();
      const strwithoutgmt = str.replace('\n', ' ').substr(0, str.search('2019') + 4);
      textArray.push(0, strwithoutgmt);
    }).then(() => {
      expect(textArray).to.include.members(expectedTextArray);
    });
  }

  checkText(widget, value) {
    this.waitForWidget(widget);
    cy.get(`#${widget}`).should('contain', value);
  }

  checkClearedText(widget) {
    this.waitForWidget(widget);
    cy.get(`#${widget}`).should('contain', '');
  }

  waitForWidget(widget) {
    cy.get(this.loadSpinner).should('not.be.visible');
    cy.get(`#${widget}`).should('be.visible');
  }

  checkTextWithCalculation(widget, timeValue, preCalculated = undefined, allowVariance = false) {
    this.waitForWidget(widget);
    cy.get(`#${widget}`).invoke('text').should('not.include', 'Value');
    cy.get(`#${widget}`).invoke('text').then(widgetText => {
      const formattedString = moment(widgetText, 'MM/DD/YYYY, h:mm:ss A').format();
      const actualTime = new Date(formattedString);

      const today = new Date();
      let calculatedTime;
      if (preCalculated) {
        calculatedTime = new Date(preCalculated);
      } else {
        calculatedTime = new Date(today.getTime() - timeValue);
      }
      calculatedTime.setSeconds(0, 0);
      if (allowVariance) {
        expect(calculatedTime).to.be.within(new Date(actualTime.getTime() - TWO_MINUTES), new Date(actualTime.getTime() + TWO_MINUTES));
      } else {
        expect(calculatedTime.toString()).to.equal(actualTime.toString());
      }
    });
  }

  checkUrl(predefinedId) {
    cy.url().should('include', predefinedId);
  }

  checkPickedPredefinedTime(predefinedId, labelLong, start, end) {
    this.clickSlideOutForParamSelection();
    this.checkLabelSlideOut(labelLong);

    this.toggleMenu(true);
    cy.get(`[data-cy="${predefinedId}"]`).should('have.class', 'active');
    cy.get(`ux-date-time-picker.start-date-picker table.calendar button[aria-label='${start}`).should('be.visible').click();
    cy.get(`ux-date-time-picker.end-date-picker table.calendar button[aria-label='${end}`).should('have.class', 'active');
    this.toggleMenu(false);
  }

  checkLabelSlideOut(text) {
    cy.get(this.parameterPanelDateString).contains(text);
  }

  clickSlideOutForParamSelection() {
    cy.get(this.slideOut).click();
    cy.get(this.verifySlideOutOpen).should('be.visible');
  }

  selectPredefinedTime(selector) {
    this.toggleMenu(true);
    cy.get(`[data-cy="${selector}"]`).click();
  }

  selectDropDownParameter(dropDownValue, paramName) {
    cy.get(`bvd-ng2-dropdown[data-cy=${paramName}] input[type="text"]`).click();
    // Hardcoded wait added because of timing issues, cypress types the value quickly but the corresponding value is not reflected in the dropdown
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.get(`bvd-ng2-dropdown[data-cy=${paramName}] input[type="text"]`).type(dropDownValue).wait(100);
    cy.get(`bvd-ng2-dropdown[data-cy=${paramName}] ol li span`).contains(dropDownValue).parent().click();
  }

  selectMultipleValuesInDropDownParameter(dropDownValues, paramName) {
    for (let i = 0; i < dropDownValues.length; i++) {
      cy.get(`bvd-ng2-dropdown[data-cy=${paramName}] input[type="text"]`).click();
      // Hardcoded wait added because of timing issues, cypress types the value quickly but the corresponding value is not reflected in the dropdown
      // eslint-disable-next-line cypress/no-unnecessary-waiting
      cy.get(`bvd-ng2-dropdown[data-cy=${paramName}] input[type="text"]`).type(dropDownValues[i]).wait(100);
      cy.get(`bvd-ng2-dropdown[data-cy=${paramName}] ol li span`).contains(dropDownValues[i]).parent().click();
    }
    cy.get(`bvd-ng2-dropdown[data-cy=${paramName}] input[type="text"]`).type('{esc}');
  }

  clearDropdownValue(paramName) {
    cy.get(`bvd-ng2-dropdown[data-cy=${paramName}] i.ux-select-clear-icon`).click();
  }

  getFormattedTime(text) {
    const splitted = text.split(' ');
    let time = `${splitted[0]}:00`;
    const temp = splitted[1].split('M');
    time = `${time} ${temp[0]}M`;
    const date = temp[1];
    const dateTimeString = `${date} ${time}`;
    cy.log(moment.utc(dateTimeString).format());
    return moment.utc(dateTimeString).format();
  }

  toggleMenu(open) {
    cy.get(this.calendarUXIcon).should('be.visible').click();
    if (open) {
      cy.get(this.calendarContainer).should('be.visible');
    } else {
      cy.get(this.calendarContainer).should('not.exist');
    }
  }

  unSelectDates(fromDateArr, toDateArr) {
    cy.get(`ux-date-time-picker.start-date-picker table.calendar button[aria-label='${fromDateArr[2]}`).should('be.visible').click();
    cy.get(`ux-date-time-picker.end-date-picker table.calendar button[aria-label='${toDateArr[2]}`).should('be.visible').click();
  }

  selectDates(fromDateArr, toDateArr, dataCollector = false, CurrentDecade) {
    if (!dataCollector) {
      this.toggleMenu(true);
    }
    cy.get(this.startDatePickerBtn).should('be.visible').click();
    cy.get(this.startDecadeBtn).should('be.visible').click();
    if (CurrentDecade === undefined) {
      cy.get(this.startDatePreviousBtn).should('be.visible').click();
    }
    cy.get(`button.calendar-item[aria-label='${fromDateArr[0]}']`).should('be.visible').click();
    cy.get(`button.calendar-item[aria-label='${fromDateArr[1]}']`).should('be.visible').click();
    cy.get(`ux-date-time-picker.start-date-picker table.calendar button[aria-label='${fromDateArr[2]}']`).should('be.visible').click();
    cy.get(this.endDatePickerBtn).should('be.visible').click();
    cy.get(this.endDecadeBtn).should('be.visible').click();
    cy.get(this.enddatePreviousBtn).should('be.visible').click();
    cy.get(`button.calendar-item[aria-label='${toDateArr[0]}']`).should('be.visible').click();
    cy.get(`button.calendar-item[aria-label='${toDateArr[1]}']`).should('be.visible').click();
    cy.get(`ux-date-time-picker.end-date-picker table.calendar button[aria-label='${toDateArr[2]}']`).should('be.visible').click();
  }

  selectDateParamsFromSlideout(fromDateArr, toDateArr, dataCollector = false, CurrentDecade) {
    this.selectDates(fromDateArr, toDateArr, dataCollector, CurrentDecade);
    cy.get(this.fromDateInputHour).should('be.visible').click();
    cy.get(this.fromDateInputHour).clear();
    cy.get(this.fromDateInputHour).type(fromDateArr[3]);
    cy.get(this.fromDateInputMinute).should('be.visible').click();
    cy.get(this.fromDateInputMinute).clear();
    cy.get(this.fromDateInputMinute).type(fromDateArr[4]);
    cy.get(this.toDateInputHour).should('be.visible').click();
    cy.get(this.toDateInputHour).clear();
    cy.get(this.toDateInputHour).type(toDateArr[3]);
    cy.get(this.toDateInputMinute).should('be.visible').click();
    cy.get(this.toDateInputMinute).clear();
    cy.get(this.toDateInputMinute).type(toDateArr[4]);
    if (this._hasAMPMInDateRange(toDateArr, fromDateArr)) {
      cy.log('AM/PM is defined');
      cy.get(`ux-date-time-picker.start-date-picker button[aria-label='${fromDateArr[5]}']`).should('be.visible').click();
      cy.get(`ux-date-time-picker.end-date-picker button[aria-label='${toDateArr[5]}']`).should('be.visible').click();
      cy.get(`ux-date-time-picker.end-date-picker button[aria-label='${toDateArr[5]}']`).type('{esc}');
    } else {
      cy.log('AM/PM is not defined');
      cy.get('.time-picker-meridian>.btn-group').should('not.exist');
      if (!dataCollector) {
        this.toggleMenu(false);
      }
    }
  }
  _hasAMPMInDateRange(toDateArr, fromDateArr) {
    return toDateArr[5] && fromDateArr[5];
  }

  _hasAMPMInSingleDate(date) {
    return date[4];
  }

  selectSingleDateParamFromSlideout(startWeekDay, dateParamName, selectToday, date) {
    if (selectToday) {
      cy.get(`[title='${dateParamName}']~div.input-container`).click();
      cy.get('table.calendar thead tr th:nth-child(1)').should('have.text', startWeekDay);
      cy.get('[data-cy="single-date-picker-now-btn"]').click();
      cy.get(`[title='${dateParamName}']~div.input-container`).type('{esc}');
    } else {
      cy.get(`[title='${dateParamName}']~div.input-container`).click();
      cy.get(`ux-date-time-picker-header button[aria-label='Switch to show months in the year']`).click();
      cy.get(`ux-date-time-picker-header button[aria-label='Switch to show years in the decade']`).click();
      cy.get(`ux-date-time-picker-year-view button[aria-label='2020']`).click();
      cy.get(`ux-date-time-picker-month-view button[aria-label='${date[0]}']`).click();
      cy.get(`ux-date-time-picker-day-view button[aria-label='${date[1]}']`).click();
      cy.get(`ux-time-picker input[aria-label='hour']`).clear();
      cy.get(`ux-time-picker input[aria-label='hour']`).type(date[2]);
      cy.get(`ux-time-picker input[aria-label='minute']`).clear();
      cy.get(`ux-time-picker input[aria-label='minute']`).type(date[3]);
      if (this._hasAMPMInSingleDate(date)) {
        cy.log('AM/PM is defined');
        cy.get(`ux-time-picker button[aria-label='${date[4]}']`).click();
      } else {
        cy.log('AM/PM is not defined');
        cy.get('.time-picker-meridian>.btn-group').should('not.exist');
      }
      cy.get(`[title='${dateParamName}']~div.input-container`).type('{esc}');
    }
  }

  selectSingleDateParamFromSlideoutForNestedParam(startWeekDay, dateParamName, selectToday, date, selectedYear) {
    cy.intercept(`${Cypress.env('BVD_CONTEXT_ROOT')}/rest/${Cypress.env('API_VERSION')}/dataCollector/parameter/*`).as('parameterExecution');
    if (selectToday) {
      cy.get(`[data-cy='${dateParamName}'] input`).click();
      cy.wait('@parameterExecution');
      cy.get('table.calendar thead tr th:nth-child(1)').should('have.text', startWeekDay);
      cy.get('[data-cy="single-date-picker-now-btn"]').click();
      cy.get(`[data-cy='${dateParamName}'] input`).type('{esc}');
    } else {
      cy.get(`[data-cy='${dateParamName}'] input`).click();
      cy.wait('@parameterExecution');
      cy.get(`ux-date-time-picker-header button[aria-label='Switch to show months in the year']`).click();
      cy.get(`ux-date-time-picker-header button[aria-label='Switch to show years in the decade']`).click();
      if (Number(selectedYear) < 2019) {
        cy.get(`ux-date-time-picker-header button[aria-label='Previous decade']`).click();
      }
      cy.get(`ux-date-time-picker-year-view button[aria-label='${selectedYear}']`).click();
      cy.get(`ux-date-time-picker-month-view button[aria-label='${date[0]}']`).click();
      cy.get(`ux-date-time-picker-day-view button[aria-label='${date[1]}']`).click();
      cy.wait('@parameterExecution');
      cy.get(`ux-time-picker input[aria-label='hour']`).clear();
      cy.get(`ux-time-picker input[aria-label='hour']`).type(date[2]);
      cy.wait('@parameterExecution');
      cy.get(`ux-time-picker input[aria-label='minute']`).clear();
      cy.get(`ux-time-picker input[aria-label='minute']`).type(date[3]);
      cy.wait('@parameterExecution');
      cy.get(`ux-time-picker button[aria-label='${date[4]}']`).click();
      cy.wait('@parameterExecution');
      cy.get(`[data-cy='${dateParamName}'] input`).type('{esc}');
    }
  }

  leftBarParameterApplyValue(interceptNeeded = true) {
    // should only be false if the tests already has that intercept. The solution gives a better overview.
    if (interceptNeeded) {
      cy.intercept({
        method: 'POST',
        path: `${shared.reportingContextRoot}/rest/${Cypress.env('API_VERSION')}/channel/state`
      }).as('channelState');
    }
    cy.intercept(`${Cypress.env('BVD_CONTEXT_ROOT')}/rest/${Cypress.env('API_VERSION')}/session/user`).as('pageloadUser');
    cy.intercept(`${Cypress.env('BVD_CONTEXT_ROOT')}/rest/${Cypress.env('API_VERSION')}/dashboard/**`).as('dashboard');
    cy.get(this.calendarContainer).should('not.exist');
    cy.get(this.applyBtnForParamValue).should('be.visible').click();
    cy.wait(['@pageloadUser']);
    cy.url().should('include', 'params');
    cy.wait(['@dashboard']);
    cy.wait(['@channelState']);
    cy.get(this.loadSpinner).should('not.be.visible');
  }

  resetParameterValue() {
    cy.get('[data-cy="reset-button"]').should('be.visible');
    cy.get('[data-cy="reset-button"]').click();
    cy.get('[data-cy="reset-button"]').should('be.disabled');
  }

  checkForResetButtonStatus(isEnable = '') {
    cy.get('[data-cy="reset-button"]').should(`${isEnable}`);
  }

  checkForApplyButtonStatus(isEnable = '') {
    cy.get('[data-cy="apply-button"]').should(`${isEnable}`);
  }

  checkIfDropDownHasSelectedParameter(valueToBeChecked = '', paramName = '') {
    cy.get(`[data-cy="${paramName}"] input`).then(element => {
      expect(element.val()).to.be.equal(valueToBeChecked.toString());
    });
  }

  checkIfDropDownHasDateRange(valueToBeChecked = '', paramName = '') {
    cy.get(`[data-cy="${paramName}"]`).should('have.text', valueToBeChecked);
  }

  checkIfDropDownHasDateRangeAbsoluteValue(valueToBeChecked, paramName = '') {
    cy.get(`[data-cy="${paramName}"]`).invoke('text').then(text => {
      valueToBeChecked.split(' ').forEach(item => {
        expect(text).to.contains(item);
      });
    });
  }

  checkIfDropDownIsEmpty(paramName) {
    cy.get(`bvd-ng2-dropdown[data-cy=${paramName}] input[type="text"]`).should('have.value', '');
  }

  checkIfDropDownHasEmptyData(paramName) {
    cy.get(`bvd-ng2-dropdown[data-cy=${paramName}] span`).should('have.text', ' No results ');
  }

  checkSingleDateParamAfterReset() {
    cy.get('[data-cy="date-time-input"]').its('ng-reflect-model').should('be.undefined');
  }

  checkActiveCalendarDates(calculatedTime, iFrameBody = undefined) {
    const cyHelper = this.retrieveElementQueryFunction(iFrameBody);
    // Checks the active dates
    cyHelper('ux-date-time-picker.start-date-picker').first().find(`[aria-label="${calculatedTime.firstDayString}"]`).should('have.class', 'active');
    // Next necessary because end of the week could be in another month!
    cyHelper('ux-date-time-picker.start-date-picker').next().find(`[aria-label="${calculatedTime.lastDayString}"]`).should('have.class', 'active');
  }

  checkCalendarStart(calculatedTime, iFrameBody = undefined) {
    const cyHelper = this.retrieveElementQueryFunction(iFrameBody);
    cyHelper('.calendar > thead > tr > th').first().contains(calculatedTime.shortName.charAt(0));
  }

  validateDatePickerWithProvidedValue(dateOnPicker, paramVariableName) {
    cy.get(`bvd-specific-date[data-cy=${paramVariableName}] input[data-cy='date-time-input']`).then(element => {
      expect(element.val()).to.be.equal(dateOnPicker);
    });
  }

  retrieveElementQueryFunction(iFrameBody) {
    if (iFrameBody) {
      return name => iFrameBody().find(name);
    }
    return name => cy.get(name);
  }

  verifyTheHoverTextOnTextWidget(widgetId, hoverText) {
    cy.get(`g[id='${widgetId}'] > title`).invoke('text').then(text => {
      assert.equal(text, hoverText);
    });
  }

  // verifying text after text overflow is applied
  verifyingWrapAndTruncateTextForWidget(id, widget, testText, cLength, overflow) {
    cy.get(`g > rect[id = '${id}']`).should('be.visible');
    const actualText = [];
    if (overflow) {
      cy.get(`g[id='${widget}'] text`).children().should('have.length', cLength)
        .each(tspan => cy.get(tspan).invoke('text').then(text => actualText.push(text.trimEnd()))).then(() => assert.equal(actualText.join(' '), testText));
    } else {
      cy.get(`g[id='${widget}']  title`).invoke('text').then(titleText => assert.equal(titleText, testText));
    }
  }

  validateDataForScrollPage() {
    const dataBeforeScroll = [];
    const dataAfterScroll = [];
    cy.get('[id*=-shape13]').should('be.visible');
    cy.get('[id*=-shape13] text').each(e1 => {
      dataBeforeScroll.push(e1.text());
    }).then(() => {
      cy.get('rect[opr_scroll_parent]').then(clickelem => {
        cy.log(clickelem.position());
        // eslint-disable-next-line cypress/no-force -- scrollto is not working hence using force
        cy.get('rect[opr_scroll_parent]').click(clickelem.position().left, clickelem.position().top + 10, { force: true });
        cy.get('[id*=-shape13] text').each(e2 => {
          dataAfterScroll.push(e2.text());
        }).then(() => {
          assert.notEqual(dataBeforeScroll, dataAfterScroll, 'Scrolled to a different Page');
        });
      });
    });
  }

  typeTextInSearchBoxAndValidate(searchText) {
    cy.get('[id*=-shape13] text').should('be.visible');
    cy.get(`g[opr_item_type='opr_search_box'] rect`).should('be.visible').click();
    cy.get(`input[placeholder='Search']`).click().type(searchText);
    cy.get(`g[opr_item_type='opr_search_box'] rect`).click();
    // No network calls happening here thus used sleep
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(500);
    const dataArray = [];
    cy.get('[id*=-shape13] text').each(e3 => {
      dataArray.push(e3.text());
    }).then(() => {
      assert.equal(dataArray[0], searchText, 'Search Success');
    });
  }

  clickApplyAndCheckStatus() {
    cy.get(this.applyBtnForParamValue).click();
    cy.wait(['@pageloadUser', '@channelState', '@dataCollectorChannel']);
    this.clickSlideOutForParamSelection();
    this.checkForApplyButtonStatus('be.disabled');
    this.checkForResetButtonStatus('not.be.disabled');
  }

  clickApplyBtnForParamValue() {
    cy.get(this.applyBtnForParamValue).click();
  }

  verifyingTextValueForBarChart(barChartTextValues) {
    cy.get(`g>text.st2[y='0']`).each(($elem, index) => {
      expect(barChartTextValues[index]).contains($elem.text().trim());
    });
  }
  barChartCount(widgetlocator, noOfBars) {
    cy.get(widgetlocator).should('have.length', noOfBars);
  }
}
export default new MainPage();
