/* eslint-disable camelcase */
// <reference types="Cypress" />
const shared = require('../../../shared/shared');

const role = require('../../../../../support/reporting/restUtils/role');
const nonAdminuserName = 'nonAdminTestUser';
const nonAdminuserPwd = 'control@123D';
let nonAdminWithDataCollectorRole;
let uifRole;

const permissionArray = [{
  operation_key: 'full-control',
  resource_key: 'omi-event'
},
{
  operation_key: 'View',
  resource_key: 'default_action<>Group-__bvd_data_collector'
}];
const permissionArrayForUIF = [{ operation_key: 'View',
  resource_key: 'default_action<>MemberOfNoGroup' }, {
  operation_key: 'View', resource_key: 'menu<>Item-testMultipleWidgetsWithDataCollectors'
}];

function createRoleForNonAdmin() {
  cy.wrap(role.roleCreationWithPermissionArray('NonAdminPage', 'NonAdminPage', permissionArrayForUIF, false)).then(uifRoleId => {
    cy.wrap(role.roleCreationWithPermissionArray('DefaultBvdRole', 'DefaultBvdRole', permissionArray, true)).then(nonAdminRoleId => {
      nonAdminWithDataCollectorRole = nonAdminRoleId;
      uifRole = uifRoleId;
    });
  });
}

const selectTimeFromContext = (relativeTimeString = '') => {
  cy.get('[data-cy="context-filter-menu"]').click();
  cy.get('div.filter-menu-container');
  cy.get(`[data-cy="${relativeTimeString}"]`).click();
  cy.get('[data-cy="contextFilterApplyButton"]').click();
  shared.waitForDataCalls({ name: '@getChannelStateResponse', count: 3 });
};

const getDateString = (startDate, endDate) => `Calendar Start Date - ${startDate} , Calendar End Date - ${endDate}`;

function verifyDateRangeDataOnCharts() {
  // Check today
  const todayDateString = new Date().toLocaleDateString();
  selectTimeFromContext('RTtoday');
  cy.get('#ui-test-text-widget-time-range-selector').find('text-widget')
    .should('contain', getDateString(`${todayDateString}, 12:00:00 AM`, `${todayDateString}, 11:59:00 PM`));

  // Check yesterday
  let currentDate = new Date();
  selectTimeFromContext('RPyesterday');
  const previousDateString = new Date(currentDate.setDate(currentDate.getDate() - 1)).toLocaleDateString();
  cy.get('#ui-test-text-widget-time-range-selector').find('text-widget')
    .should('contain', getDateString(`${previousDateString}, 12:00:00 AM`, `${previousDateString}, 11:59:00 PM`));

  // Check last 30 days
  currentDate = new Date();
  const last30DaysDateString = new Date(currentDate.setDate(currentDate.getDate() - 30));
  selectTimeFromContext('RL30days');
  let tempArray = last30DaysDateString.toLocaleTimeString().split(':', 2);
  const last30DaysTimeString = `${tempArray[0]}:${tempArray[1]}`;
  tempArray = new Date().toLocaleTimeString().split(':', 2);
  const currentTimeString = `${tempArray[0]}:${tempArray[1]}`;
  cy.get('#ui-test-text-widget-time-range-selector').find('text-widget').then(textValue => {
    expect(textValue.text()).to.includes(`Calendar Start Date - ${last30DaysDateString.toLocaleDateString()}, ${last30DaysTimeString}`);
    expect(textValue.text()).to.includes(`Calendar End Date - ${new Date().toLocaleDateString()}, ${currentTimeString}`);
  });

  // check this year
  const currentYear = new Date().getFullYear();
  selectTimeFromContext('RTyear');
  cy.get('#ui-test-text-widget-time-range-selector').find('text-widget')
    .should('contain', getDateString(`1/1/${currentYear}, 12:00:00 AM`, `12/31/${currentYear}, 11:59:00 PM`));
}

describe('DS Proxy predefined query with parameters for time range', shared.defaultTestOptions, () => {
  beforeEach(() => {
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pages/toc*`
    }).as('getTOC');
    cy.intercept({
      method: 'POST',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/dataCollector/channel`
    }).as('getChannelInfo');
    cy.intercept({
      method: 'POST',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/channel/state`
    }).as('getChannelStateResponse');
    cy.intercept(`${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/testMultipleWidgetsWithDataCollectors*`).as('waitForWidgetsWithDataCollectorsPage');
  });

  it('Should show start and end date as per user locale when selecting dates from time context filter', () => {
    cy.bvdLogin();
    shared.visitPage('/testMultipleWidgetsWithDataCollectors', 3, 'waitForWidgetsWithDataCollectorsPage');
    verifyDateRangeDataOnCharts();
    cy.bvdUiLogout();
  });

  it('Non Admin - Should show start and end date as per user locale when selecting dates from time context filter', () => {
    cy.wrap(createRoleForNonAdmin()).then(() => {
      cy.bvdLogout();
      cy.bvdLogin(nonAdminuserName, nonAdminuserPwd);
      shared.visitPage('/testMultipleWidgetsWithDataCollectors', 3, 'waitForWidgetsWithDataCollectorsPage');
      verifyDateRangeDataOnCharts();
      cy.bvdUiLogout();
      role.roleDeletion(uifRole, false);
      role.roleDeletion(nonAdminWithDataCollectorRole, true);
    });
  });
});
