// <reference types="Cypress" />
const shared = require('../../shared/shared');

describe('Time Interval', shared.defaultTestOptions, () => {
  beforeEach(() => {
    cy.intercept({
      method: 'POST',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/datasource/ws/data`
    }).as('getWebServiceData');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/uiTestTimeInterval*`
    }).as('getPagesData');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pages/toc*`
    }).as('getTOC');
    cy.bvdLogin();
    cy.visit('/uiTestTimeInterval?_s=1580368680000&_e=1580375880000&_tft=A');
    cy.wait(['@getPagesData', '@getWebServiceData', '@getTOC']);
  });

  it('Time interval auto refresh test for Last 5min', () => {
    let previousTime;
    let currentTime;
    cy.get('.time-trigger').first().click();
    cy.get('.time-picker-section').contains('5 Minutes').click();
    cy.get('.context-filter-apply').contains('Apply').click();
    cy.get('context-view').find('.time-trigger').contains('5 Minutes');
    cy.wait('@getWebServiceData');
    cy.get('#ui-test-metricBox-TimeQuery').find('h1').invoke('text').then(e1 => {
      previousTime = Number(e1);
    });
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(5500); // this wait is needed to test the auto refresh
    cy.get('#ui-test-metricBox-TimeQuery').find('h1').invoke('text').then(e2 => {
      currentTime = Number(e2);
      if (previousTime < 55) {
        expect(currentTime).to.be.within(previousTime + 4, previousTime + 6, 'Current time is equal to previous value + 5 sec');
      } else {
        expect(currentTime).to.be.within(previousTime + 4 - 60, previousTime + 6 - 60, 'Current time is equal to previous value + 5 sec');
      }
    });
    cy.get('.time-trigger').first().click();
  });

  it('Time interval auto refresh test for Last 15min', () => {
    let previousTime;
    let currentTime;
    cy.get('.time-trigger').first().click();
    cy.get('.time-picker-section').contains('15 Minutes').click();
    cy.get('.context-filter-apply').contains('Apply').click();
    cy.get('context-view').find('.time-trigger').contains('15 Minutes');

    cy.wait('@getWebServiceData').then(interception => {
      previousTime = Number(interception.response.body[0]);
    });
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(11000); // this wait is needed to test the auto refresh
    cy.wait('@getWebServiceData');
    cy.get('#ui-test-metricBox-TimeQuery').find('h1').invoke('text').then(e2 => {
      currentTime = Number(e2);
      if (previousTime < 50) {
        expect(currentTime).to.be.within(previousTime + 9, previousTime + 11, 'Current time is equal to previous value + 10 sec');
      } else {
        expect(currentTime).to.be.within(previousTime + 9 - 60, previousTime + 11 - 60, 'Current time is equal to previous value + 10 sec');
      }
    });
    cy.get('.time-trigger').first().click();
  });
});

describe('Invalid time interval in the URL', shared.defaultTestOptions, () => {
  beforeEach(() => {
    cy.intercept({
      method: 'POST',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/datasource/ws/data`
    }).as('getWebapiData');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/uiTestWidgets*`
    }).as('getPagesData');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pages/toc*`
    }).as('getTOC');
    cy.bvdLogin();
    const start = shared.getDateTimeLocalized('28 Nov 2019 12:05:00 UTC');
    const end = shared.getDateTimeLocalized('28 Nov 2019 12:35:00 UTC');
    cy.log('Localized  timeframe: '.concat(start, '-', end));
    const url = '/uiTestWidgets?_s='.concat(start, '&_e=', end, '&_tft=A');
    cy.visit(url);
    cy.wait(['@getPagesData', '@getWebapiData', '@getTOC']);
  });

  it('Update to current time in case of invalid time in the URL', () => {
    const start = shared.getDateTimeLocalized('28 Nov 2019 12:05:00 UTC');
    const end = shared.getDateTimeLocalized('28 Nov 2019 12:35:00 UTC');
    cy.get('context-view').find('.context-filter-menu').as('contextFilterMenu');
    cy.get('@contextFilterMenu')
      .should('exist')
      .and('contain', '11/28/2019')
      .and('contain', '12:05:00 PM')
      .and('contain', '12:35:00 PM');
    cy.visit('/uiTestWidgets?_s=invalid&_e=invalid&_tft=A');
    cy.get('context-view').find('.context-filter-menu').as('contextFilterMenu');
    const currentDate = new Date(),
      dd = currentDate.getDate(),
      mm = currentDate.getMonth() + 1,
      yyyy = currentDate.getFullYear();
    const today = `${mm}/${dd}/${yyyy}`;
    cy.get('@contextFilterMenu')
      .should('exist')
      .and('contain', today);
    cy.visit('/uiTestWidgets?_s'.concat(start, '&_e=invalid&_tft=A'));
    cy.get('context-view').find('.context-filter-menu').as('contextFilterMenu');
    cy.get('@contextFilterMenu')
      .should('exist')
      .and('contain', today);
    cy.visit('/uiTestWidgets?_s='.concat('invalid&_e=', end, '&_tft=A'));
    cy.get('context-view').find('.context-filter-menu').as('contextFilterMenu');
    cy.get('@contextFilterMenu')
      .should('exist')
      .and('contain', today);
  });

  it('Verify tool tips for zoom in and zoom out', () => {
    cy.get('context-view').find('.context-filter-menu').as('contextFilterMenu');
    cy.get('@contextFilterMenu');
    cy.get('.tooltip-inner').should('not.exist');
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.get('@contextFilterMenu').find('[id="zoomIn"]').invoke('show').trigger('mouseenter').wait(100);
    cy.get('.tooltip-inner').contains('Time range zoom in');
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.get('@contextFilterMenu').find('[id="zoomOut"]').invoke('show').trigger('mouseenter').wait(100);
    cy.get('.tooltip-inner').contains('Time range zoom out');
  });

  it('Calender should close on any click outside its circumference', () => {
    cy.get('.time-trigger').first().click();
    cy.get('body').click(0, 0);
    cy.get('[data-cy="RL5minutes"]').should('not.visible');
  });

  it('Calender should not close on any click inside its circumference', () => {
    cy.get('.time-trigger').first().click();
    cy.get('[data-cy="RL5minutes"]').click();
    cy.get('[data-cy="RL5minutes"]');
  });
});

