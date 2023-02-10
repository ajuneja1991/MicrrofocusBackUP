const shared = require('../../shared/shared');
import * as TimeCalculations from '../../../../support/reporting/TimeCalculations';

describe('WeekStart', shared.defaultTestOptions, () => {
  beforeEach(() => {
    cy.intercept({
      method: 'POST',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/datasource/ws/data`
    }).as('getWebapiData');
    cy.bvdLogin();
    const start = shared.getDateTimeLocalized('28 Nov 2019 12:30:00 UTC');
    const end = shared.getDateTimeLocalized('28 Nov 2019 12:35:00 UTC');
    cy.log('Localized  timeframe: '.concat(start, '-', end));
    const url = '/uiTestWidgets?_s='.concat(start, '&_e=', end, '&_tft=A');
    cy.visit(url);
    cy.wait('@getWebapiData');
  });

  it('Should have the correct start of the week at the week calculation and in the calendar', () => {
    const calculatedTime = TimeCalculations.calcWeekInformation('RTweek');

    cy.get('[data-cy="contextView"]').find('[data-cy="context-filter-menu"]');
    cy.get('[data-cy=timeSelectorStartDate]').click();
    cy.get('[data-cy=RTweek]').click();

    // Checks the active dates
    cy.get('ux-date-time-picker.start-date-picker').first().find(`[aria-label="${calculatedTime.firstDayString}"]`).should('have.class', 'active');
    // Next necessary because end of the week could be in another month!
    cy.get('ux-date-time-picker.start-date-picker').next().find(`[aria-label="${calculatedTime.lastDayString}"]`).should('have.class', 'active');

    // Get first element to check the calendar week start
    cy.get('.calendar > thead > tr > th').first().contains(calculatedTime.shortName);
  });
});
