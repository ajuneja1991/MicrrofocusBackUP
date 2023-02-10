// <reference types="Cypress" />

const shared = require('../../../shared/shared');

function getDate(subtractDays) {
  const date = new Date();
  date.setDate(date.getDate() - subtractDays);
  const month = date.getMonth() + 1;
  return `${month}/${date.getDate()}/${date.getFullYear()}`;
}

function getCurrentTime() {
  const d1 = new Date().setSeconds(0);
  return new Date(d1).toLocaleTimeString();
}

function setContextFilterMenu() {
  cy.get('[data-cy=contextView]')
    .find('[data-cy="context-filter-menu"]').as('contextFilterMenu');
}

function leftClick() {
  cy.get('@contextFilterMenu').find('[data-cy="leftCaret"]').click();
}

function rightClick() {
  cy.get('@contextFilterMenu').find('[data-cy="rightCaret"]').click();
}

function checkFilterMenu(expectedValue) {
  cy.get('[data-cy="contextView"]').find('[data-cy="context-filter-menu"]')
    .contains(expectedValue);
}

function zoomOut() {
  cy.get('@contextFilterMenu').find('[data-cy="zoomOut"]').click();
}

function zoomOutDisabled() {
  cy.get('@contextFilterMenu').find('[data-cy="zoomOut"]').should('be.disabled');
}

function zoomIn() {
  cy.get('@contextFilterMenu').find('[data-cy="zoomIn"]').click();
}

function zoomInDisabled() {
  cy.get('@contextFilterMenu').find('[data-cy="zoomIn"]').should('be.disabled');
}

function startURL(tft) {
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
  const url = '/uiTestWidgets?_s='.concat(start, '&_e=', end, '&_tft=', tft);
  cy.visit(url);
  cy.wait(['@getPagesData', '@getWebapiData', '@getWebapiData', '@getTOC']);
}

function checkContextFilterMenu(date, start, end) {
  cy.get('@contextFilterMenu')
    .should('contain', date)
    .and('contain', start)
    .and('contain', end);
}

const ONE_SECOND = 1000;
const ONE_MINUTE = 60 * ONE_SECOND;
const FIVE_MINUTES = 5 * ONE_MINUTE;
const STARTTIMEDAY = '12:00:00 AM';
const ENDTIMEDAY = '11:59:00 PM';

describe('Context view initial setup', shared.defaultTestOptions, () => {
  beforeEach(() => {
    cy.intercept({
      method: 'POST',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/datasource/ws/data`
    }).as('getWebapiData');
    cy.bvdLogin();
    cy.visit('/uiTestWidgets');
    cy.wait('@getWebapiData');
  });

  it('shows time context on no current time context set', () => {
    setContextFilterMenu();
    cy.get('.time-trigger').first().invoke('text').then(startDate => {
      startDate = startDate.replace(/\s/g, '');
      expect(startDate).to.not.equal('');
    });
  });
});

describe('Context view labels', shared.defaultTestOptions, () => {
  beforeEach(() => {
    cy.bvdLogin();
    cy.visit('/uiTestDefaultCtx');
  });

  it('shows all default context items', () => {
    cy.get('[data-cy="contextLabelType-Host"]').contains('obac.mambo.net');
    cy.get('[data-cy="contextLabelType-labelWithoutType"]').contains(' test-default-item, test-default-item1 ');
  });

  it('A context which cannot be deleted will not have X button', () => {
    cy.get('[data-cy="contextLabelType-Host"]').contains('obac.mambo.net');
    cy.get('[data-cy="context-tag-Host"] button.tag-remove').should('not.exist');
  });
});

describe('No time context', shared.defaultTestOptions, () => {
  beforeEach(() => {
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/uiTestPage*`
    }).as('getPagesDataTestPage');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/uiTestNoTimeContext*`
    }).as('getPagesDataNoTimeContext');
    cy.intercept({
      method: 'POST',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/datasource/ws/data`
    }).as('getWebApiData');
    cy.bvdLogin();
  });

  it('No time context (Defined on widget level)', () => {
    cy.visit('/uiTestPage');
    cy.wait(['@getPagesDataTestPage', '@getWebApiData']);
    setContextFilterMenu();
    cy.get('@contextFilterMenu').then(element => {
      Cypress.dom.isHidden(element);
    });
  });

  it('No time context (Defined on page level)', () => {
    cy.visit('/uiTestNoTimeContext');
    cy.wait(['@getPagesDataNoTimeContext', '@getWebApiData']);
    setContextFilterMenu();
    cy.get('@contextFilterMenu').then(element => {
      Cypress.dom.isHidden(element);
    });
  });
});

describe('Context view start with Absolute time', shared.defaultTestOptions, () => {
  beforeEach(() => {
    startURL('A');
  });

  it('shows context items', () => {
    cy.get('context-view');
    cy.get('simple-list').contains('loadgen.mambo.net').click();
    cy.get('[data-cy="contextLabelType-Host"]').contains('loadgen.mambo.net');
  });

  it('shows time context', () => {
    setContextFilterMenu();
    checkContextFilterMenu('11/28/2019', '12:05:00 PM', '12:35:00 PM');
  });

  it('should zoom in time - absolute', () => {
    setContextFilterMenu();
    zoomIn();
    checkContextFilterMenu('11/28/2019', '12:12:00 PM', '12:27:00 PM');
    zoomIn();
    cy.get('@contextFilterMenu')
      .should('contain', '11/28/2019')
      .and('not.contain', '12:12:00 PM')
      .and('not.contain', '12:27:00 PM');
    zoomIn();
    zoomInDisabled();
  });

  it('should zoom out time - absolute', () => {
    setContextFilterMenu();
    zoomOut();
    checkContextFilterMenu('11/28/2019', '11:50:00 AM', '12:50:00 PM');
    zoomOut();
    checkContextFilterMenu('11/28/2019', '11:20:00 AM', '1:20:00 PM');
  });

  it('should move to earlier time range - absolute', () => {
    setContextFilterMenu();
    leftClick();
    checkContextFilterMenu('11/28/2019', '11:35:00 AM', '12:05:00 PM');
  });

  it('should move to later time range - absolute', () => {
    setContextFilterMenu();
    rightClick();
    checkContextFilterMenu('11/28/2019', '12:35:00 PM', '1:05:00 PM');
  });

  it('should detect old url value tft=R', () => {
    cy.bvdLogin();
    const start = shared.getDateTimeLocalized(new Date(Date.now() - FIVE_MINUTES));
    const end = shared.getDateTimeLocalized(new Date());
    cy.log('Localized  timeframe: '.concat(start, '-', end));
    const url = '/uiTestWidgets?_s='.concat(start, '&_e=', end, '&_tft=R');
    cy.visit(url);
    cy.wait(['@getPagesData', '@getWebapiData']);

    checkFilterMenu('LAST: 5 Minutes');

    cy.url().should('include', 'RL5minutes');
  });

  it('should detect new url value and time is not important', () => {
    cy.bvdLogin();
    const start = shared.getDateTimeLocalized(new Date(Date.now() - FIVE_MINUTES));
    const end = shared.getDateTimeLocalized(new Date());
    cy.log('Localized  timeframe: '.concat(start, '-', end));
    const url = '/uiTestWidgets?_s='.concat(start, '&_e=', end, '&_tft=RTtoday');
    cy.visit(url);
    cy.wait(['@getPagesData', '@getWebapiData']);

    checkFilterMenu('THIS: Day (today)');

    cy.url().should('include', 'RTtoday');

    const date = new Date();
    const dateFrom = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const dateTo = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59);

    cy.location().should(loc => {
      expect(loc.search).contains('_s='.concat(dateFrom.getTime()));
      expect(loc.search).contains('_e='.concat(dateTo.getTime()
      ));
      expect(loc.search).contains('&_tft=RTtoday');
    });
  });
});

describe('Context view start with different times', shared.defaultTestOptions, () => {
  it('should zoom in time - relative last', () => {
    startURL('RL3hours');
    setContextFilterMenu();
    zoomIn();
    checkFilterMenu('LAST: 2 Hours');
    zoomIn();
    checkFilterMenu('LAST: 1 Hour');
    zoomIn();
    checkFilterMenu('LAST: 30 Minutes');
    zoomIn();
    checkFilterMenu('LAST: 15 Minutes');
    zoomIn();
    checkFilterMenu('LAST: 5 Minutes');
    zoomInDisabled();
  });

  it('should zoom in time - relative this', () => {
    startURL('RTyear');
    setContextFilterMenu();
    zoomIn();
    checkFilterMenu('THIS: Month');
    zoomIn();
    checkFilterMenu('THIS: Week');
    zoomIn();
    checkFilterMenu('THIS: Day (today)');
    zoomInDisabled();
  });

  it('should zoom in time - relative previous', () => {
    startURL('RPyear');
    setContextFilterMenu();
    zoomIn();
    checkFilterMenu('PREVIOUS: Month');
    zoomIn();
    checkFilterMenu('PREVIOUS: Week');
    zoomIn();
    checkFilterMenu('PREVIOUS: Day (yesterday)');
    zoomInDisabled();
  });

  it('should zoom out time - relative last', () => {
    startURL('RL7days');
    setContextFilterMenu();
    zoomOut();
    checkFilterMenu('LAST: 30 Days');
    zoomOut();
    checkFilterMenu('LAST: 12 Months');
    zoomOutDisabled();
  });

  it('should zoom out time - relative this', () => {
    startURL('RTtoday');
    setContextFilterMenu();
    zoomOut();
    checkFilterMenu('THIS: Week');
    zoomOut();
    checkFilterMenu('THIS: Month');
    zoomOut();
    checkFilterMenu('THIS: Year');
    zoomOutDisabled();

    cy.get('[data-cy=timeSelectorPredefinedThis]').click();
    cy.get('#RTyear').should('have.class', 'active');
  });

  it('should zoom out time - relative previous', () => {
    startURL('RPyesterday');
    setContextFilterMenu();
    zoomOut();
    checkFilterMenu('PREVIOUS: Week');
    zoomOut();
    checkFilterMenu('PREVIOUS: Month');
    zoomOut();
    checkFilterMenu('PREVIOUS: Year');
    zoomOutDisabled();

    cy.get('[data-cy=timeSelectorPredefinedPrevious]').click();
    cy.get('#RPyear').should('have.class', 'active');
  });

  it('should store the previous time after a reload', () => {
    startURL('RPyesterday');
    setContextFilterMenu();
    cy.get('[data-cy=timeSelectorPredefinedPrevious]').click();
    cy.reload();
    checkFilterMenu('PREVIOUS: Day (yesterday)');
    cy.get('[data-cy=timeSelectorPredefinedPrevious]').click();
    cy.get('#RPyesterday').should('have.class', 'active');
  });

  it('should move to earlier and to later time range - relative this', () => {
    startURL('RTtoday');
    setContextFilterMenu();
    leftClick();
    const date = getDate(1);
    checkContextFilterMenu(date, STARTTIMEDAY, ENDTIMEDAY);
    rightClick();
    const today = getDate(0);
    const timeNow = getCurrentTime();
    checkContextFilterMenu(today, STARTTIMEDAY, timeNow);
    cy.get('@contextFilterMenu').find('[data-cy="rightCaret"]').should('be.disabled');
  });

  it('should disable right caret - relative this', () => {
    startURL('RTtoday');
    setContextFilterMenu();
    cy.get('@contextFilterMenu').find('[data-cy="rightCaret"]').should('be.disabled');
  });

  it('should move to earlier and to later time range - relative previous', () => {
    startURL('RPyesterday');
    setContextFilterMenu();
    leftClick();
    const date = getDate(2);
    checkContextFilterMenu(date, STARTTIMEDAY, ENDTIMEDAY);
    rightClick();
    const yesterday = getDate(1);
    checkContextFilterMenu(yesterday, STARTTIMEDAY, ENDTIMEDAY);
    rightClick();
    const today = getDate(0);
    const timeNow = getCurrentTime();
    checkContextFilterMenu(today, STARTTIMEDAY, timeNow);
  });
});
