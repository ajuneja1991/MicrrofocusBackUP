// <reference types="Cypress" />

const shared = require('../../../shared/shared');
import * as TimeCalculations from '../../../../../support/reporting/TimeCalculations';
const monthNamesShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function getDate(subtractDays) {
  const date = new Date();
  date.setDate(date.getDate() - subtractDays);
  const month = date.getMonth() + 1;
  return `${month}/${date.getDate()}/${date.getFullYear()}`;
}

function cancelInMenu() {
  // Using the toggle functionality to close the time filter menu as Cancel button is removed from the panel
  cy.get('[data-cy=context-filter-menu]').click();
}

function checkPredefinedLabelActive(expectedValue) {
  cy.get(expectedValue).should('have.class', 'active');
}

function zoomOut() {
  cy.get('@contextFilterMenu').find('[data-cy="zoomOut"]').click();
}

function zoomIn() {
  cy.get('@contextFilterMenu').find('[data-cy="zoomIn"]').click();
}

function checkFilterMenu(expectedValue) {
  cy.get('[data-cy="contextView"]').find('[data-cy="context-filter-menu"]')
    .contains(expectedValue);
}

function checkEndDate(expectedValue) {
  cy.get('ux-date-time-picker.start-date-picker').find('ux-date-time-picker-day-view')
    .find('.date-button.range-end.current.ux-focus-indicator').contains(expectedValue);
}

function setContextFilterMenu() {
  cy.get('[data-cy=contextView]')
    .find('[data-cy="context-filter-menu"]').as('contextFilterMenu');
}

function applyChangesInMenu() {
  cy.get('[data-cy=contextFilterApplyButton]').click();
}

function openMenuPickYesterday() {
  cy.get('[data-cy=timeSelectorPredefinedPrevious]').click();
  cy.get('[data-cy=form-group-previous]').contains('Day (yesterday)').click();
  applyChangesInMenu();
  cy.wait('@getWebapiData');
}

function openMenuPickThisYear() {
  cy.get('[data-cy=timeSelectorPredefinedThis]').click();
  cy.get('[data-cy=form-group-this]').contains('Year').click();
  applyChangesInMenu();
  cy.wait('@getWebapiData');
}

function openMenuPickLast5Minutes() {
  cy.get('[data-cy=timeSelectorPredefinedLast]').click();
  cy.get('[data-cy=form-group-last]').contains('5 Minutes').click();
  applyChangesInMenu();
  cy.wait('@getWebapiData');
}

/**
 *
 * To select an absolute date in the calendar, the calendar should be opened beforehand and the corresponding date should be provided in the calendar view.
 *
 * TODO: This could be extended later in this function.
 */
function setAbsoluteTime(start, end) {
  const startYear = start.getFullYear();
  const endYear = end.getFullYear();

  const startMonthShort = monthNamesShort[start.getMonth()];
  const endMonthShort = monthNamesShort[end.getMonth()];

  const startDay = start.getDate();
  const endDay = end.getDate();

  const findStringStart = `[aria-label="${startMonthShort} ${startDay}, ${startYear}"]`;
  const findStringEnd = `[aria-label="${endMonthShort} ${endDay}, ${endYear}"]`;
  cy.get('ux-date-time-picker.start-date-picker').find(findStringStart).click();
  cy.get('ux-date-time-picker.end-date-picker').find(findStringEnd).click();
}

function checkTimeOfDay() {
  cy.get('ux-date-time-picker.start-date-picker').find('ux-time-picker').find('[aria-label="hour"]').should('have.value', '12');
  cy.get('ux-date-time-picker.start-date-picker').find('ux-time-picker').find('[aria-label="minute"]').should('have.value', '00');
  cy.get('ux-date-time-picker.start-date-picker').find('ux-time-picker').find('[aria-label="AM"]').should('have.class', 'active');

  cy.get('ux-date-time-picker.end-date-picker').find('ux-time-picker').find('[aria-label="hour"]').should('have.value', '11');
  cy.get('ux-date-time-picker.end-date-picker').find('ux-time-picker').find('[aria-label="minute"]').should('have.value', '59');
  cy.get('ux-date-time-picker.end-date-picker').find('ux-time-picker').find('[aria-label="PM"]').should('have.class', 'active');
}

describe('Contextfilter', shared.defaultTestOptions, () => {
  beforeEach(() => {
    cy.intercept({
      method: 'POST',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/datasource/ws/data`
    }).as('getWebapiData');
    cy.bvdLogin();
    const start = shared.getDateTimeLocalized('28 Nov 2019 12:30:00 UTC');
    const end = shared.getDateTimeLocalized('28 Nov 2019 12:35:00 UTC');
    const url = `/uiTestWidgets?_s=${start}&_e=${end}&_tft=A`;
    cy.visit(url);
    cy.wait('@getWebapiData');
  });

  it('change time context via calendar picker - date change', () => {
    cy.get('[data-cy="contextView"]').find('[data-cy="context-filter-menu"]');
    cy.get('[data-cy=timeSelectorStartDate]').click();
    cy.get('[data-cy=contextView]').find('.filter-menu-container').as('filterMenuContainer');
    cy.get('ux-date-time-picker.start-date-picker').find('[aria-label="Nov 26, 2019"]').click();
    cy.get('ux-date-time-picker.end-date-picker').find('[aria-label="Nov 27, 2019"]').click();
    cy.get('[data-cy="contextView"]').find('[data-cy="context-filter-menu"]')
      .should('contain', '11/26/2019')
      .and('contain', '11/27/2019');
    applyChangesInMenu();
    cy.wait('@getWebapiData');
    cy.get('echarts-chart').find('svg');
    cy.get('echarts-chart').last().scrollIntoView();
    // resolution size differs in build, causing snapshots to not match
    /* cy.get('echarts-chart').toMatchImageSnapshot(
      {
        "createDiffImage": true,
        "threshold": 0.01,
        "name": "echart_after_timecontext_date_change",
        "thresholdType": "percent"
      }
    );*/
    cy.get('[data-cy=timeSelectorStartDate]').contains('11/26/2019');
    cy.get('[data-cy=timeSelectorEndDate]').contains('11/27/2019');

    const start = shared.getDateTimeLocalized('26 Nov 2019 12:30:00 UTC');
    const end = shared.getDateTimeLocalized('27 Nov 2019 12:35:00 UTC');
    cy.location().should(loc => {
      expect(loc.search).contains('_s='.concat(start));
      expect(loc.search).contains('_e='.concat(end));
      expect(loc.search).contains('&_tft=A');
    });
  });

  it('change time context via calendar picker - time change', () => {
    cy.get('[data-cy=timeSelectorStartDate]').click();

    cy.get('ux-date-time-picker.start-date-picker').find('[aria-label="Decrement the hour"]').click();
    cy.get('ux-date-time-picker.start-date-picker').find('[aria-label="Decrement the minute"]').as('startPickerDecrementMinBtn');
    cy.get('@startPickerDecrementMinBtn').click();
    cy.get('@startPickerDecrementMinBtn').click();
    cy.get('@startPickerDecrementMinBtn').click();
    cy.get('@startPickerDecrementMinBtn').click();
    cy.get('@startPickerDecrementMinBtn').click();
    cy.get('ux-date-time-picker.end-date-picker').find('[aria-label="Decrement the hour"]').click();
    cy.get('ux-date-time-picker.end-date-picker').find('[aria-label="Decrement the minute"]').as('endPickerDecrementMinBtn');
    cy.get('@endPickerDecrementMinBtn').click();
    cy.get('@endPickerDecrementMinBtn').click();
    cy.get('@endPickerDecrementMinBtn').click();
    cy.get('@endPickerDecrementMinBtn').click();
    cy.get('@endPickerDecrementMinBtn').click();

    cy.get('[data-cy=timeSelectorStartTime]').contains('11:25:00 AM');
    cy.get('[data-cy=timeSelectorEndTime]').contains('11:30:00 AM');

    cy.get('[data-cy=contextFilterApplyButton]').click();
    cy.wait('@getWebapiData');
    cy.get('echarts-chart').find('svg');
    cy.get('echarts-chart').last().scrollIntoView();
    // resolution size differs in build, causing snapshots to not match
    /* cy.get('echarts-chart').toMatchImageSnapshot(
      {
        "createDiffImage": true,
        "threshold": 0.01,
        "name": "echart_after_timecontext_time_change",
        "thresholdType": "percent"
      }
    );*/
    cy.get('[data-cy=timeSelectorStartTime]').contains('11:25:00 AM');
    cy.get('[data-cy=timeSelectorEndTime]').contains('11:30:00 AM');

    const start = shared.getDateTimeLocalized('28 Nov 2019 11:25:00 UTC');
    const end = shared.getDateTimeLocalized('28 Nov 2019 11:30:00 UTC');
    cy.location().should(loc => {
      expect(loc.search).contains('_s='.concat(start));
      expect(loc.search).contains('_e='.concat(end));
      expect(loc.search).contains('&_tft=A');
    });
  });

  it('should revert changes ', () => {
    cy.get('[data-cy=timeSelectorStartDate]').click();

    cy.get('ux-date-time-picker.start-date-picker').find('[aria-label="Nov 26, 2019"]').click();
    cy.get('ux-date-time-picker.end-date-picker').find('[aria-label="Nov 27, 2019"]').click();
    cancelInMenu();
    cy.wait('@getWebapiData');
    cy.get('[data-cy=timeSelectorStartDate]').contains('11/28/2019');
    cy.get('[data-cy=timeSelectorEndDate]').contains('11/28/2019');

    const start = shared.getDateTimeLocalized('28 Nov 2019 12:30:00 UTC');
    const end = shared.getDateTimeLocalized('28 Nov 2019 12:35:00 UTC');
    cy.location().should(loc => {
      expect(loc.search).contains('_s='.concat(start));
      expect(loc.search).contains('_e='.concat(end));
      expect(loc.search).contains('&_tft=A');
    });
  });

  it('change time context via input - time change', () => {
    cy.get('[data-cy=timeSelectorStartDate]').click();

    cy.get('ux-date-time-picker.start-date-picker').find('ux-time-picker').find('[aria-label="hour"]').clear().type('7');
    cy.get('ux-date-time-picker.start-date-picker').find('ux-time-picker').find('[aria-label="minute"]').clear().type('5');
    cy.get('ux-date-time-picker.start-date-picker').find('ux-time-picker').find('[aria-label="PM"]').click();
    cy.get('ux-date-time-picker.end-date-picker').find('ux-time-picker').find('[aria-label="hour"]').clear().type('8');
    cy.get('ux-date-time-picker.end-date-picker').find('ux-time-picker').find('[aria-label="minute"]').clear().type('2');
    cy.get('ux-date-time-picker.start-date-picker').find('ux-time-picker').find('[aria-label="PM"]').click();
    applyChangesInMenu();
    cy.wait('@getWebapiData');
    cy.get('[data-cy=timeSelectorStartDate]').contains('11/28/2019');
    cy.get('[data-cy=timeSelectorStartTime]').contains('7:05:00 PM');
    cy.get('[data-cy=timeSelectorEndDate]').contains('11/28/2019');
    cy.get('[data-cy=timeSelectorEndTime]').contains('8:02:00 PM');

    const start = shared.getDateTimeLocalized('28 Nov 2019 19:05:00 UTC');
    const end = shared.getDateTimeLocalized('28 Nov 2019 20:02:00 UTC');
    cy.location().should(loc => {
      expect(loc.search).contains('_s='.concat(start));
      expect(loc.search).contains('_e='.concat(end));
      expect(loc.search).contains('&_tft=A');
    });
  });

  it('signal error on invalid time', () => {
    cy.get('[data-cy=timeSelectorStartDate]').click();
    cy.get('ux-date-time-picker.start-date-picker').find('[aria-label="hour"]').clear().type('9');
    cy.get('ux-date-time-picker.start-date-picker').find('[aria-label="minute"]').clear().type('2');
    cy.get('ux-date-time-picker.end-date-picker').find('[aria-label="hour"]').clear().type('8');
    cy.get('ux-date-time-picker.end-date-picker').find('[aria-label="minute"]').clear().type('4');
    cy.get('ux-date-range-picker').should('not.have.class', 'time-has-error');
    cy.get('[data-cy=contextFilterApplyButton]').should('not.have.class', 'disabled');
  });

  it('signal error on equal date and time', () => {
    cy.get('[data-cy=timeSelectorStartDate]').click();
    cy.get('ux-date-time-picker.start-date-picker').find('[aria-label="hour"]').clear().type('8');
    cy.get('ux-date-time-picker.start-date-picker').find('[aria-label="minute"]').clear().type('4');
    cy.get('ux-date-time-picker.end-date-picker').find('[aria-label="hour"]').clear().type('8');
    cy.get('ux-date-time-picker.end-date-picker').find('[aria-label="minute"]').clear().type('4');
    cy.get('ux-date-range-picker').should('have.class', 'time-has-error');
    cy.get('[data-cy=contextFilterApplyButton]').should('have.class', 'disabled');
  });

  it('signal no error on unequal date but equal time', () => {
    cy.get('[data-cy=timeSelectorStartDate]').click();
    cy.get('ux-date-time-picker.start-date-picker').find('[aria-label="Nov 26, 2019"]').click();
    cy.get('ux-date-time-picker.end-date-picker').find('[aria-label="Nov 27, 2019"]').click();
    cy.get('ux-date-time-picker.start-date-picker').find('[aria-label="hour"]').clear().type('8');
    cy.get('ux-date-time-picker.start-date-picker').find('[aria-label="minute"]').clear().type('4');
    cy.get('ux-date-time-picker.end-date-picker').find('[aria-label="hour"]').clear().type('8');
    cy.get('ux-date-time-picker.end-date-picker').find('[aria-label="minute"]').clear().type('4');
    cy.get('ux-date-range-picker').should('not.have.class', 'time-has-error');
    cy.get('[data-cy=contextFilterApplyButton]').should('not.have.class', 'disabled');
  });

  it('should shift the date ahead by interval of one day in to date selector', () => {
    cy.get('[data-cy=timeSelectorStartDate]').click();
    cy.get('ux-date-time-picker.start-date-picker').find('[aria-label="Nov 26, 2019"]').click();
    cy.get('ux-date-time-picker.end-date-picker').find('[aria-label="Nov 27, 2019"]').click();
    cy.get('ux-date-time-picker.start-date-picker').find('[aria-label="Nov 28, 2019"]').click();
    cy.get('[data-cy=timeSelectorStartDate]').contains('11/28/2019');
    cy.get('[data-cy=timeSelectorEndDate]').contains('11/29/2019');
  });

  it('should shift the date before by interval of three days in from date selector', () => {
    cy.get('[data-cy=timeSelectorStartDate]').click();
    cy.get('ux-date-time-picker.start-date-picker').find('[aria-label="Nov 26, 2019"]').click();
    cy.get('ux-date-time-picker.end-date-picker').find('[aria-label="Nov 29, 2019"]').click();
    cy.get('ux-date-time-picker.end-date-picker').find('[aria-label="Nov 24, 2019"]').click();
    applyChangesInMenu();
    cy.get('[data-cy=timeSelectorStartDate]').contains('11/21/2019');
    cy.get('[data-cy=timeSelectorEndDate]').contains('11/24/2019');
  });

  it('should click on to date after from date in to date selector', () => {
    cy.get('[data-cy=timeSelectorStartDate]').click();
    cy.get('ux-date-time-picker.start-date-picker').find('[aria-label="Nov 21, 2019"]').click();
    cy.get('ux-date-time-picker.end-date-picker').find('[aria-label="Nov 27, 2019"]').click();
    applyChangesInMenu();
    cy.get('[data-cy=timeSelectorStartDate]').click();
    cy.get('ux-date-time-picker.end-date-picker').find('[aria-label="Nov 24, 2019"]').click();
    applyChangesInMenu();
    cy.get('[data-cy=timeSelectorStartDate]').contains('11/21/2019');
    cy.get('[data-cy=timeSelectorEndDate]').contains('11/24/2019');
  });

  it('should click on from date before to date in from date selector', () => {
    cy.get('[data-cy=timeSelectorStartDate]').click();
    cy.get('ux-date-time-picker.start-date-picker').find('[aria-label="Nov 21, 2019"]').click();
    cy.get('ux-date-time-picker.end-date-picker').find('[aria-label="Nov 27, 2019"]').click();
    applyChangesInMenu();
    cy.get('[data-cy=timeSelectorStartDate]').click();
    cy.get('ux-date-time-picker.start-date-picker').find('[aria-label="Nov 19, 2019"]').click();
    applyChangesInMenu();
    cy.get('[data-cy=timeSelectorStartDate]').contains('11/19/2019');
    cy.get('[data-cy=timeSelectorEndDate]').contains('11/27/2019');
  });

  it('should cancel changes on click of button contextfilter cancel', () => {
    cy.get('[data-cy=timeSelectorStartDate]').click();
    cy.get('ux-date-time-picker.start-date-picker').find('[aria-label="Nov 26, 2019"]').click();
    cancelInMenu();
    cy.wait('@getWebapiData');
    cy.get('[data-cy="contextView"]').find('[data-cy="context-filter-menu"]')
      .should('contain', '11/28/2019')
      .and('contain', '11/28/2019');
  });

  it('should cancel changes on contextfilter unfocus', () => {
    cy.get('[data-cy=timeSelectorStartDate]').click();
    cy.get('ux-date-time-picker.start-date-picker').find('[aria-label="Nov 26, 2019"]').click();
    cy.wait('@getWebapiData');
    cy.get('[data-cy="contextView"]').find('[data-cy="context-filter-menu"]')
      .should('contain', '11/28/2019')
      .and('contain', '11/28/2019');
  });

  it('Overlay should exist when user opens the calendar', () => {
    cy.get('[data-cy=timeSelectorStartDate]').click();
    cy.get('contextfilter').find('.time-picker-section').should('be.visible');
    cy.get('contextfilter').find('.date-picker-section').should('be.visible');
    cy.get('[data-cy="context-filter-overlay"]');
    cy.get('body').click(0, 0);
    cy.get('[data-cy="context-filter-overlay"]').should('not.be.visible');
  });

  it('Selected time should be highlighted in time frame', () => {
    cy.get('[data-cy=timeSelectorStartDate]').click();
    cy.get('[data-cy=form-group-last]').contains('1 Hour').should('not.have.class', 'active');
    cy.get('[data-cy=form-group-last]').contains('1 Hour').click();
    cy.get('[data-cy=form-group-last]').contains('1 Hour').should('have.class', 'active');
    cy.get('[data-cy=form-group-last]').contains('30 Minutes').click();
    cy.get('[data-cy=form-group-last]').contains('30 Minutes').should('have.class', 'active');
    cy.get('[data-cy=form-group-last]').contains('1 Hour').should('not.have.class', 'active');
  });

  it('Selecting Last 30 Days should highlight the entire last 30 Days ', () => {
    cy.get('[data-cy=timeSelectorStartDate]').click();
    cy.get('[data-cy=form-group-last]').contains('30 Days').click();
    cy.clock(new Date(Date.UTC(2020, 7, 3)));
    cy.get('[data-cy=form-group-last]').contains('30 Days').click();
    cy.get('ux-date-time-picker.start-date-picker').find('ux-date-time-picker-day-view')
      .find('.date-button.range-start.ux-focus-indicator').contains('4');
    cy.get('ux-date-time-picker.start-date-picker').find('ux-date-time-picker-day-view')
      .get('tr>td')
      .each(($td, index) => {
        if (index > 10 && index < 25) {
          cy.wrap($td).find('.date-button.range-between.ux-focus-indicator').should('be.visible');
        }
      });
    cancelInMenu();
  });

  it('Selecting Last 24 Hours should highlight the day before the current day', () => {
    cy.get('[data-cy=timeSelectorStartDate]').click();
    cy.clock(new Date(2020, 8, 14));
    cy.get('[data-cy=form-group-last]').contains('24 Hours').click();
    cy.get('ux-date-time-picker.start-date-picker').find('ux-date-time-picker-day-view')
      .find('.date-button.range-start.active').contains('13');
    checkEndDate('14');
  });

  it('Selecting Last 7 Days should show time from 8:30 AM till 8:30 AM ', () => {
    cy.get('[data-cy=timeSelectorStartDate]').click();
    cy.clock(new Date(2020, 8, 14, 8, 30));
    cy.get('[data-cy=form-group-last]').contains('Day').click();
    cy.get('ux-date-time-picker.start-date-picker').find('ux-time-picker').find('[aria-label="hour"]').should('have.value', '8');
    cy.get('ux-date-time-picker.start-date-picker').find('ux-time-picker').find('[aria-label="minute"]').should('have.value', '30');
    cy.get('ux-date-time-picker.start-date-picker').find('ux-time-picker').find('[aria-label="AM"]').should('have.class', 'active');

    cy.get('ux-date-time-picker.end-date-picker').find('ux-time-picker').find('[aria-label="hour"]').should('have.value', '8');
    cy.get('ux-date-time-picker.end-date-picker').find('ux-time-picker').find('[aria-label="minute"]').should('have.value', '30');
    cy.get('ux-date-time-picker.end-date-picker').find('ux-time-picker').find('[aria-label="AM"]').should('have.class', 'active');
    cancelInMenu();
  });

  it('Selecting This day should show time from 12:00 AM till 11:59 PM ', () => {
    cy.get('[data-cy=timeSelectorStartDate]').click();
    cy.clock(new Date(2020, 8, 14, 8, 30));
    cy.get('[data-cy=form-group-this]').contains('Day (today)').click();
    checkTimeOfDay();
    checkPredefinedLabelActive('[data-cy=RTtoday]');

    cancelInMenu();
  });

  it('Selecting previous week should show time from 12:00 AM till 11:59 PM ', () => {
    cy.get('[data-cy=timeSelectorStartDate]').click();
    cy.clock(new Date(2020, 8, 14, 8, 30));
    cy.get('[data-cy=form-group-previous]').contains('Week').click();
    checkTimeOfDay();
    checkPredefinedLabelActive('[data-cy=RPweek]');

    cancelInMenu();
  });

  it('should zoom out time - relative last open and close', () => {
    setContextFilterMenu();
    cy.get('[data-cy=timeSelectorStartDate]').click();
    cy.get('[data-cy=form-group-last]').contains('24 Hours').click();
    applyChangesInMenu();
    cy.wait('@getWebapiData');
    cy.get('[data-cy=timeSelectorPredefinedLast]').click();
    zoomOut();
    checkFilterMenu('LAST: 7 Days');
    zoomOut();
    checkFilterMenu('LAST: 30 Days');
    zoomOut();
    checkFilterMenu('LAST: 12 Months');
    cy.get('@contextFilterMenu').find('[data-cy="zoomOut"]').should('be.disabled');
    checkPredefinedLabelActive('[data-cy=RL12months]');

    cy.get('[data-cy=timeSelectorPredefinedLast]').click();

    checkFilterMenu('LAST: 24 Hours');
  });

  it('should zoom out time - relative last open and apply', () => {
    setContextFilterMenu();
    cy.get('[data-cy=timeSelectorStartDate]').click();
    cy.get('[data-cy=form-group-last]').contains('24 Hours').click();
    applyChangesInMenu();
    cy.wait('@getWebapiData');
    cy.get('[data-cy=timeSelectorPredefinedLast]').click();
    zoomOut();
    checkFilterMenu('LAST: 7 Days');
    zoomOut();
    checkFilterMenu('LAST: 30 Days');
    zoomOut();
    checkFilterMenu('LAST: 12 Months');
    cy.get('@contextFilterMenu').find('[data-cy="zoomOut"]').should('be.disabled');
    checkPredefinedLabelActive('[data-cy=RL12months]');

    applyChangesInMenu();

    checkFilterMenu('LAST: 12 Months');
  });

  it('should zoom in time - relative last open and close', () => {
    setContextFilterMenu();
    cy.get('[data-cy=timeSelectorStartDate]').click();
    cy.get('[data-cy=form-group-last]').contains('1 Hour').click();
    applyChangesInMenu();
    cy.wait('@getWebapiData');
    cy.get('[data-cy=timeSelectorPredefinedLast]').click();
    zoomIn();
    checkFilterMenu('LAST: 30 Minutes');
    zoomIn();
    checkFilterMenu('LAST: 15 Minutes');
    zoomIn();
    checkFilterMenu('LAST: 5 Minutes');
    cy.get('@contextFilterMenu').find('[id="zoomIn"]').should('be.disabled');
    checkPredefinedLabelActive('[data-cy=RL5minutes]');
    cy.get('[data-cy=timeSelectorPredefinedLast]').click();

    checkFilterMenu('LAST: 1 Hour');
  });

  it('should zoom in time - relative last open and apply', () => {
    setContextFilterMenu();
    cy.get('[data-cy=timeSelectorStartDate]').click();
    cy.get('[data-cy=form-group-last]').contains('1 Hour').click();
    applyChangesInMenu();
    cy.wait('@getWebapiData');
    cy.get('[data-cy=timeSelectorPredefinedLast]').click();
    zoomIn();
    checkFilterMenu('LAST: 30 Minutes');
    zoomIn();
    checkFilterMenu('LAST: 15 Minutes');
    zoomIn();
    checkFilterMenu('LAST: 5 Minutes');
    cy.get('@contextFilterMenu').find('[data-cy="zoomIn"]').should('be.disabled');
    checkPredefinedLabelActive('[data-cy=RL5minutes]');

    applyChangesInMenu();

    checkFilterMenu('LAST: 5 Minutes');
  });

  it('should zoom out time - relative this open and close', () => {
    setContextFilterMenu();
    cy.get('[data-cy=timeSelectorStartDate]').click();
    cy.get('[data-cy=form-group-this]').contains('Day (today)').click();
    applyChangesInMenu();
    cy.wait('@getWebapiData');
    cy.get('[data-cy=timeSelectorPredefinedThis]').click();
    zoomOut();
    checkFilterMenu('THIS: Week');
    zoomOut();
    checkFilterMenu('THIS: Month');
    zoomOut();
    checkFilterMenu('THIS: Year');
    cy.get('@contextFilterMenu').find('[data-cy="zoomOut"]').should('be.disabled');
    checkPredefinedLabelActive('[data-cy=RTyear]');

    cy.get('[data-cy=timeSelectorPredefinedThis]').click();

    checkFilterMenu('THIS: Day (today)');
  });

  it('should zoom out time - relative this open and apply', () => {
    setContextFilterMenu();
    cy.get('[data-cy=timeSelectorStartDate]').click();
    cy.get('[data-cy=form-group-this]').contains('Day (today)').click();
    applyChangesInMenu();
    cy.wait('@getWebapiData');
    cy.get('[data-cy=timeSelectorPredefinedThis]').click();
    zoomOut();
    checkFilterMenu('THIS: Week');
    zoomOut();
    checkFilterMenu('THIS: Month');
    zoomOut();
    checkFilterMenu('THIS: Year');
    cy.get('@contextFilterMenu').find('[data-cy="zoomOut"]').should('be.disabled');
    checkPredefinedLabelActive('[data-cy=RTyear]');

    applyChangesInMenu();

    checkFilterMenu('THIS: Year');
  });

  it('should zoom in time - relative this open and close', () => {
    setContextFilterMenu();
    cy.get('[data-cy=timeSelectorStartDate]').click();
    cy.get('[data-cy=form-group-this]').contains('Year').click();
    applyChangesInMenu();
    cy.wait('@getWebapiData');
    cy.get('[data-cy=timeSelectorPredefinedThis]').click();
    zoomIn();
    checkFilterMenu('THIS: Month');
    zoomIn();
    checkFilterMenu('THIS: Week');
    zoomIn();
    checkFilterMenu('THIS: Day (today)');
    cy.get('@contextFilterMenu').find('[data-cy="zoomIn"]').should('be.disabled');
    checkPredefinedLabelActive('[data-cy=RTtoday]');

    cy.get('[data-cy=timeSelectorPredefinedThis]').click();

    checkFilterMenu('THIS: Year');
  });

  it('should zoom in time - relative this open and apply', () => {
    setContextFilterMenu();
    cy.get('[data-cy=timeSelectorStartDate]').click();
    cy.get('[data-cy=form-group-this]').contains('Year').click();
    applyChangesInMenu();
    cy.wait('@getWebapiData');
    cy.get('[data-cy=timeSelectorPredefinedThis]').click();
    zoomIn();
    checkFilterMenu('THIS: Month');
    zoomIn();
    checkFilterMenu('THIS: Week');
    zoomIn();
    checkFilterMenu('THIS: Day (today)');
    cy.get('@contextFilterMenu').find('[data-cy="zoomIn"]').should('be.disabled');
    checkPredefinedLabelActive('[data-cy=RTtoday]');

    applyChangesInMenu();

    checkFilterMenu('THIS: Day (today)');
  });

  it('should zoom in time - relative previous open and close', () => {
    setContextFilterMenu();
    cy.get('[data-cy=timeSelectorStartDate]').click();
    cy.get('[data-cy=form-group-previous]').contains('Year').click();
    applyChangesInMenu();
    cy.wait('@getWebapiData');
    cy.get('[data-cy=timeSelectorPredefinedPrevious]').click();
    zoomIn();
    checkFilterMenu('PREVIOUS: Month');
    zoomIn();
    checkFilterMenu('PREVIOUS: Week');
    zoomIn();
    checkFilterMenu('PREVIOUS: Day (yesterday)');
    cy.get('@contextFilterMenu').find('[data-cy="zoomIn"]').should('be.disabled');
    checkPredefinedLabelActive('[data-cy=RPyesterday]');

    cy.get('[data-cy=form-group-previous]').contains('Year').click();

    checkFilterMenu('PREVIOUS: Year');
  });

  it('should zoom in time - relative previous open and apply', () => {
    setContextFilterMenu();
    cy.get('[data-cy=timeSelectorStartDate]').click();
    cy.get('[data-cy=form-group-previous]').contains('Year').click();
    applyChangesInMenu();
    cy.wait('@getWebapiData');
    cy.get('[data-cy=timeSelectorPredefinedPrevious]').click();
    zoomIn();
    checkFilterMenu('PREVIOUS: Month');
    zoomIn();
    checkFilterMenu('PREVIOUS: Week');
    zoomIn();
    checkFilterMenu('PREVIOUS: Day (yesterday)');
    cy.get('@contextFilterMenu').find('[data-cy="zoomIn"]').should('be.disabled');
    checkPredefinedLabelActive('[data-cy=RPyesterday]');

    applyChangesInMenu();

    checkFilterMenu('PREVIOUS: Day (yesterday)');
  });
});

describe('Contextfilter start with predefined last time', shared.defaultTestOptions, () => {
  beforeEach(() => {
    cy.intercept({
      method: 'POST',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/datasource/ws/data`
    }).as('getWebapiData');
    cy.bvdLogin();
    const start = shared.getDateTimeLocalized('28 Nov 2019 12:30:00 UTC');
    const end = shared.getDateTimeLocalized('28 Nov 2019 12:35:00 UTC');
    const url = '/uiTestWidgets?_s='.concat(start, '&_e=', end, '&_tft=RL5minutes');
    cy.visit(url);
    cy.wait('@getWebapiData');
  });

  it('open contextfilter', () => {
    cy.get('[data-cy="contextView"]').find('[data-cy="context-filter-menu"]');
    cy.get('[data-cy=timeSelectorPredefinedLast]').click();

    cy.get('[data-cy=contextView]').find('.filter-menu-container').as('filterMenuContainer');
    checkFilterMenu('LAST: 5 Minutes');
  });

  it('should get highlighted when we click on predefined label', () => {
    setContextFilterMenu();
    openMenuPickLast5Minutes();
    cy.get('[data-cy=timeSelectorPredefinedLast]').click();
    checkPredefinedLabelActive('[data-cy=RL5minutes]');

    cy.get('[data-cy=form-group-last]').contains('15 Minutes').click();
    applyChangesInMenu();
    zoomIn();
    cy.get('.time-trigger').first().click();
    cy.get('[data-cy=contextView]').find('.active')
      .contains('5 Minutes');

    cy.get('[data-cy=form-group-last]').contains('15 Minutes').click();
    applyChangesInMenu();
    cy.get('[data-cy=leftCaret]').click();
    cy.get('[data-cy=timeSelectorStartDate]').click();

    cy.get('[data-cy=contextView]').find('.time-trigger')
      .should('contain', 'FROM')
      .and('contain', 'TO');
  });

  it('should revert changes to predefined time last', () => {
    openMenuPickLast5Minutes();

    cy.get('[data-cy=timeSelectorPredefinedLast]').click();
    const date = new Date();
    const start = new Date(date.getFullYear(), date.getMonth(), 15);
    const end = new Date(date.getFullYear(), date.getMonth(), 16);
    setAbsoluteTime(start, end);
    cancelInMenu();
    cy.wait('@getWebapiData');
    checkFilterMenu('LAST: 5 Minutes');
  });

  it('should store the previous time after a reload and possible to select a absolute time', () => {
    setContextFilterMenu();

    checkFilterMenu('LAST: 5 Minutes');

    cy.get('[data-cy=timeSelectorPredefinedLast]').click();
    checkPredefinedLabelActive('[data-cy=RL5minutes]');

    const today = new Date();
    const todayString = TimeCalculations.getDateAsString(today.getDate(), today.getMonth() + 1, today.getFullYear());
    cy.get('ux-date-time-picker.start-date-picker').first().find(`[aria-label="${todayString[1]}"]`).click();

    applyChangesInMenu();
    const date = getDate(0);

    cy.get('@contextFilterMenu')
      .should('contain', date.toString());

    cy.reload();

    cy.get('@contextFilterMenu')
      .should('contain', date.toString());
  });

  it('change time context via predefined list', () => {
    cy.get('[data-cy=timeSelectorPredefinedLast]').click();
    cy.get('[data-cy=form-group-last]').contains('7 Days').click();
    cy.get('[data-cy="contextView"]').find('[data-cy="context-filter-menu"]')
      .should('contain', '7 Days')
      .and('contain', 'LAST');
    applyChangesInMenu();
    cy.wait('@getWebapiData');
    checkFilterMenu('LAST: 7 Days');

    const start = shared.getDateTimeLocalized('28 Nov 2019 12:30:00 UTC');
    const end = shared.getDateTimeLocalized('28 Nov 2019 12:35:00 UTC');
    cy.location().should(loc => {
      expect(loc.search).not.contains('_s='.concat(start));
      expect(loc.search).not.contains('_e='.concat(end));
      expect(loc.search).contains('&_tft=RL7days');
    });
  });

  it('in live mode label should be stable in contextview', () => {
    openMenuPickLast5Minutes();
    checkFilterMenu('LAST: 5 Minutes');

    cy.get('[data-cy=timeSelectorPredefinedLast]').click();
    cy.get('[data-cy=form-group-last]').contains('15 Minutes').click();
    applyChangesInMenu();
    cy.wait('@getWebapiData');
    checkFilterMenu('LAST: 15 Minutes');
  });
});

describe('Contextfilter start with predefined previous time', shared.defaultTestOptions, () => {
  beforeEach(() => {
    cy.intercept({
      method: 'POST',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/datasource/ws/data`
    }).as('getWebapiData');
    cy.bvdLogin();
    const start = shared.getDateTimeLocalized('28 Nov 2019 12:30:00 UTC');
    const end = shared.getDateTimeLocalized('28 Nov 2019 12:35:00 UTC');
    const url = '/uiTestWidgets?_s='.concat(start, '&_e=', end, '&_tft=RPyear');
    cy.visit(url);
    cy.wait('@getWebapiData');
  });

  it('should toggle and pick different dates', () => {
    setContextFilterMenu();
    openMenuPickYesterday();
    cy.get('[data-cy=timeSelectorPredefinedPrevious]').click();
    checkFilterMenu('PREVIOUS: Day (yesterday)');
    cy.get('[data-cy=timeSelectorPredefinedPrevious]').click();

    checkPredefinedLabelActive('[data-cy=RPyesterday]');

    cy.get('[data-cy=timeSelectorPredefinedPrevious]').click();
    checkFilterMenu('PREVIOUS: Day (yesterday)');
    cy.get('[data-cy=timeSelectorPredefinedPrevious]').click();
    checkPredefinedLabelActive('[data-cy=RPyesterday]');

    cy.get('[data-cy=timeSelectorPredefinedPrevious]').click();

    const today = new Date();
    today.setDate(today.getDate() - 1);
    const yesterday = new Date(today);

    let possibleDate = '16';
    if (yesterday.getDate().toLocaleString() === possibleDate) {
      possibleDate = '15';
    }
    cy.get('ux-date-range-picker').first().contains(possibleDate).click();

    applyChangesInMenu();
    const date = `${yesterday.getMonth() + 1}/${possibleDate}/${yesterday.getFullYear()}`;

    cy.get('@contextFilterMenu')
      .should('contain', date.toString())
      .and('contain', '12:00:00 AM')
      .and('contain', '11:59:00 PM');

    cy.reload();

    cy.get('@contextFilterMenu')
      .should('contain', date.toString())
      .and('contain', '12:00:00 AM')
      .and('contain', '11:59:00 PM');
  });

  it('should zoom out time - relative previous open and close', () => {
    setContextFilterMenu();
    openMenuPickYesterday();

    cy.get('[data-cy=timeSelectorPredefinedPrevious]').click();
    zoomOut();
    checkFilterMenu('PREVIOUS: Week');
    zoomOut();
    checkFilterMenu('PREVIOUS: Month');
    zoomOut();
    checkFilterMenu('PREVIOUS: Year');
    cy.get('@contextFilterMenu').find('[data-cy="zoomOut"]').should('be.disabled');
    checkPredefinedLabelActive('[data-cy=RPyear]');

    cy.get('[data-cy=timeSelectorPredefinedPrevious]').click();

    checkFilterMenu('PREVIOUS: Day (yesterday)');
  });

  it('should zoom out time - relative previous open and apply', () => {
    setContextFilterMenu();
    openMenuPickYesterday();
    cy.get('[data-cy=timeSelectorPredefinedPrevious]').click();
    zoomOut();
    checkFilterMenu('PREVIOUS: Week');
    zoomOut();
    checkFilterMenu('PREVIOUS: Month');
    zoomOut();
    checkFilterMenu('PREVIOUS: Year');
    cy.get('@contextFilterMenu').find('[data-cy="zoomOut"]').should('be.disabled');
    checkPredefinedLabelActive('[data-cy=RPyear]');

    applyChangesInMenu();

    checkFilterMenu('PREVIOUS: Year');
  });

  it('should revert changes to predefined time previous', () => {
    openMenuPickYesterday();
    cy.get('[data-cy=timeSelectorPredefinedPrevious]').click();

    const date = new Date();
    date.setDate(date.getDate() - 1);
    const start = new Date(date.getFullYear(), date.getMonth(), 15);
    const end = new Date(date.getFullYear(), date.getMonth(), 16);
    setAbsoluteTime(start, end);

    cancelInMenu();
    cy.wait('@getWebapiData');
    checkFilterMenu('PREVIOUS: Day (yesterday)');
  });
});

describe('Contextfilter start with predefined this time', shared.defaultTestOptions, () => {
  beforeEach(() => {
    cy.intercept({
      method: 'POST',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/datasource/ws/data`
    }).as('getWebapiData');
    cy.bvdLogin();
    const start = shared.getDateTimeLocalized('28 Nov 2019 12:30:00 UTC');
    const end = shared.getDateTimeLocalized('28 Nov 2019 12:35:00 UTC');
    const url = '/uiTestWidgets?_s='.concat(start, '&_e=', end, '&_tft=RTtoday');
    cy.visit(url);
    cy.wait('@getWebapiData');
  });

  it('should toggle on absolute and then on predefined cancel', () => {
    setContextFilterMenu();
    cy.get('[data-cy=timeSelectorPredefinedThis]').click();
    cy.get('[data-cy=form-group-this]').contains('Month').click();
    applyChangesInMenu();
    cy.wait('@getWebapiData');

    checkFilterMenu('THIS: Month');
    cy.get('[data-cy=timeSelectorPredefinedThis]').click();
    cy.get('ux-date-range-picker').first().contains('17').click();
    cy.get('ux-date-range-picker').first().contains('16').click();
    cy.get('ux-date-range-picker').first().contains('10').click();

    cancelInMenu();

    cy.get('[data-cy=timeSelectorPredefinedThis]').click();

    cy.get('ux-date-range-picker').first().contains('17').click();

    cy.get('#RTmonth').should('not.have.class', 'active');
  });

  it('should not change predefined time after cancel', () => {
    setContextFilterMenu();
    openMenuPickThisYear();

    checkFilterMenu('THIS: Year');

    cy.url().should('include', 'RTyear');

    cy.get('[data-cy=timeSelectorPredefinedThis]').click();
    cy.get('[data-cy=form-group-previous]').contains('Year').click();

    checkFilterMenu('PREVIOUS: Year');

    cancelInMenu();
    cy.url().should('include', 'RTyear');

    checkFilterMenu('THIS: Year');
  });

  it('should not change predefined time after cancel and has corresponding labels', () => {
    setContextFilterMenu();
    openMenuPickThisYear();

    checkFilterMenu('THIS: Year');

    cy.url().should('include', 'RTyear');

    cy.get('[data-cy=timeSelectorPredefinedThis]').click();
    cy.get('[data-cy=form-group-previous]').contains('Year').click();

    checkFilterMenu('PREVIOUS: Year');

    cancelInMenu();
    cy.url().should('include', 'RTyear');

    checkFilterMenu('THIS: Year');

    cy.get('[data-cy=timeSelectorPredefinedThis]').click();

    checkPredefinedLabelActive('[data-cy=RTyear]');
  });

  it('should not change predefined time after click somewhere else', () => {
    setContextFilterMenu();
    openMenuPickThisYear();

    checkFilterMenu('THIS: Year');

    cy.url().should('include', 'RTyear');

    cy.get('[data-cy=timeSelectorPredefinedThis]').click();
    cy.get('[data-cy=form-group-previous]').contains('Year').click();

    checkFilterMenu('PREVIOUS: Year');

    cy.get('body').click(0, 0);

    cy.url().should('include', 'RTyear');

    checkFilterMenu('THIS: Year');

    cy.get('[data-cy=timeSelectorPredefinedThis]').click();

    checkPredefinedLabelActive('[data-cy=RTyear]');
  });

  it('should change predefined time', () => {
    setContextFilterMenu();
    openMenuPickThisYear();

    checkFilterMenu('THIS: Year');

    cy.get('[data-cy=timeSelectorPredefinedThis]').click();

    cy.get('[data-cy=form-group-previous]').contains('Year').click();

    checkFilterMenu('PREVIOUS: Year');

    cy.get('[data-cy=form-group-previous]').contains('Month').click();

    checkFilterMenu('PREVIOUS: Month');

    cy.get('[data-cy=form-group-previous]').contains('Week').click();

    checkFilterMenu('PREVIOUS: Week');

    cy.get('[data-cy=form-group-last]').contains('5 Minutes').click();

    checkFilterMenu('LAST: 5 Minutes');

    cy.get('[data-cy=form-group-this]').contains('Day (today)').click();

    const today = new Date().getDate();
    checkEndDate(today.toString());
    applyChangesInMenu();

    checkFilterMenu('THIS: Day (today)');
    cy.url().should('include', 'RTtoday');

    cy.get('@contextFilterMenu').find('[data-cy="zoomIn"]').should('be.disabled');
  });

  it('should change predefined time to absolute time', () => {
    setContextFilterMenu();
    openMenuPickThisYear();

    checkFilterMenu('THIS: Year');

    cy.get('[data-cy=timeSelectorPredefinedThis]').click();

    cy.get('[data-cy=form-group-previous]').contains('Year').click();

    checkFilterMenu('PREVIOUS: Year');

    cy.get('[data-cy=form-group-previous]').contains('Month').click();

    checkFilterMenu('PREVIOUS: Month');

    cy.get('[data-cy=form-group-previous]').contains('Week').click();

    checkFilterMenu('PREVIOUS: Week');

    cy.get('[data-cy=form-group-last]').contains('5 Minutes').click();

    checkFilterMenu('LAST: 5 Minutes');

    const date = new Date();
    const start = new Date(date.getFullYear(), date.getMonth(), 15);
    const end = new Date(date.getFullYear(), date.getMonth(), 16);
    setAbsoluteTime(start, end);

    checkFilterMenu('15');
    checkFilterMenu('16');

    cy.get('[data-cy=form-group-this]').contains('Day (today)').click();

    const today = new Date().getDate();
    checkEndDate(today.toString());
    applyChangesInMenu();

    checkFilterMenu('THIS: Day (today)');
    cy.url().should('include', 'RTtoday');

    cy.get('@contextFilterMenu').find('[data-cy="zoomIn"]').should('be.disabled');
  });

  it('should revert changes to predefined time this', () => {
    cy.get('[data-cy=timeSelectorPredefinedThis]').click();
    const date = new Date();
    const start = new Date(date.getFullYear(), date.getMonth(), 15);
    const end = new Date(date.getFullYear(), date.getMonth(), 16);
    setAbsoluteTime(start, end);
    cancelInMenu();
    cy.wait('@getWebapiData');
    checkFilterMenu('THIS: Day (today)');
  });

  it('should click on same predefined time', () => {
    cy.get('[data-cy=timeSelectorPredefinedThis]').click();
    cy.get('[data-cy=form-group-this]').contains('Day (today)').click();
    checkFilterMenu('THIS: Day (today)');
  });

  it('should click on same predefined time and apply', () => {
    cy.get('[data-cy=timeSelectorPredefinedThis]').click();
    cy.get('[data-cy=form-group-this]').contains('Day (today)').click();
    checkFilterMenu('THIS: Day (today)');
    applyChangesInMenu();
    checkFilterMenu('THIS: Day (today)');
  });
});
