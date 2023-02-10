// <reference types="Cypress" />

const shared = require('../../shared/shared');

/**
 * If wait "@count" is flaky, use timeout with 10 seconds. Normally wait timeout is 6 seconds.
 * The interval with count will be triggered every 10 seconds in the notificationService.
 */
const DEFAULT_TIMEOUT_COUNT = 10000;

describe('Empty List Notification', shared.defaultTestOptions, () => {
  beforeEach(() => {
    cy.intercept({
      method: 'POST',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/datasource/ws/data`
    }).as('getWebapiData');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/uiTestNotification*`
    }).as('getPagesData');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pages/toc*`
    }).as('getTOC');
    cy.bvdLogin();
    cy.visit('/uiTestNotification?_m=testNotificationEntry');
    cy.wait(['@getPagesData', '@getWebapiData', '@getTOC']);
  });

  it('Click on bell button should open notification list, and then close it', () => {
    shared.deleteNotifications();
    cy.get('[data-cy="bell-button"]').click();
    cy.get('[data-cy="ux-notification-list"]');
    cy.get('[data-cy="notification-header"]').should('have.css', 'height', '49px');
    cy.get('[data-cy="no-notification"]').contains('Have a great day!');
    cy.get('[data-cy="no-notification"] > div > .qtm-font-icon').should('have.class', 'qtm-icon-smiley-positive');
    cy.get('[data-cy="header-bell-button"]').click();
    cy.get('.uif-list-notifications [data-cy=ux-notification-list]').should('have.css', 'display', 'none');
  });

  it('Click on context button should display context-menu', () => {
    cy.get('[data-cy="bell-button"]').click();
    cy.get('[data-cy="ux-notification-list"]');
    cy.get('[data-cy="list-context-button-menu"]').click();
    cy.get('[data-cy="showPopups"]').get('[type="checkbox"]').should('be.checked');
    cy.get('[data-cy="delete-all-notifications"]').find('[data-cy="delete-icon"]');
  });
});

describe('Notifications in List Notifications', shared.defaultTestOptions, () => {
  beforeEach(() => {
    cy.intercept({
      method: 'POST',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/datasource/ws/data`
    }).as('getWebapiData');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/uiTestNotification*`
    }).as('getPagesData');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pages/toc*`
    }).as('getTOC');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/notification/count`
    }).as('getCount');
    cy.bvdLogin();
    cy.visit('/uiTestNotification?_m=testNotificationEntry');
    cy.wait(['@getPagesData', '@getWebapiData', '@getTOC']);
  });

  it('Test Double Notifications are not generated', () => {
    shared.deleteNotifications();
    shared.createSingleNotification(shared.getNotification());
    cy.wait(['@getCount']);
    cy.get('[data-cy="bell-button"]').click();
    cy.get('[data-cy="ux-notification-list"]');
    cy.get('[data-cy=item-0]').contains('PDF EXPORT-- WAIT');
    cy.get('[data-cy=item-0]').find('.qtm-icon-warning');
    cy.get('[data-cy=item-1]').should('not.exist');
    cy.get('[data-cy=remove-button-0]').find('uif-icon-button>div').trigger('mouseover')
      .should('have.class', 'negative-button-wrapper-color');
  });

  it('Create notifications with correct elements', () => {
    shared.createSingleNotification(shared.getNotification());
    cy.wait(['@getCount']);
    cy.get('[data-cy="bell-button"]').click();
    cy.get('[data-cy="ux-notification-list"]');
    cy.get('[data-cy=item-0]').contains('PDF EXPORT-- WAIT');
    cy.get('[data-cy=item-0]').find('.qtm-icon-warning');
    cy.get('[data-cy=remove-button-0]').find('uif-icon-button>div').trigger('mouseover')
      .should('have.class', 'negative-button-wrapper-color');
  });

  it('Delete notifications by clicking on the remove button', () => {
    shared.createSingleNotification(shared.getNotification());
    cy.get('[data-cy="bell-button"]').click();
    cy.get('[data-cy="ux-notification-list"]');
    cy.get('[data-cy=item-0]').contains('PDF EXPORT-- WAIT');
    cy.get('[data-cy=remove-button-0]').click();
    cy.get('[data-cy="notification-header"]').should('have.css', 'height', '49px');
    cy.get('[data-cy="no-notification"]').contains('Have a great day!');
    cy.get('[data-cy="header-bell-button"]').click();
    cy.wait(['@getCount']);
    cy.get('[data-cy="bell-button"]').find('[data-cy="ux-badge-icon"]>span')
      .should('have.css', 'display', 'none');
  });

  it('Delete all notifications by clicking on the deleteAll', () => {
    shared.createSingleNotification(shared.getNotification());
    cy.wait(['@getCount']);
    shared.createSingleNotification(shared.getNotification(
      'error', 'Corrupted', 'PDF EXPORT', 'qtm-icon-error'));
    cy.wait(['@getCount']);
    cy.get('[data-cy="bell-button"]').click();
    cy.get('[data-cy="ux-notification-list"]');
    cy.get('[data-cy=item-0]').contains('PDF EXPORT');
    cy.get('[data-cy="list-context-button-menu"]').click();
    cy.get('[data-cy="delete-all-notifications"]').contains('Delete All Notifications');
    cy.get('[data-cy="delete-all-notifications"]').click();
    cy.wait(['@getCount']);
    cy.get('[data-cy="bell-button"]').click();
    cy.get('[data-cy="ux-notification-list"]');
    cy.get('[data-cy="no-notification"]').contains('Have a great day!');
    cy.get('[data-cy="header-bell-button"]').click();
  });

  it('Display a correct number of notifications on badge', () => {
    cy.wait(['@getCount'], { timeout: DEFAULT_TIMEOUT_COUNT });
    shared.createSingleNotification(shared.getNotification());
    shared.createSingleNotification(shared.getNotification(
      'error', 'Corrupted', 'PDF EXPORT', 'qtm-icon-error'));
    cy.wait(['@getCount'], { timeout: DEFAULT_TIMEOUT_COUNT });
    cy.get('[data-cy="bell-button"]').find('[data-cy="ux-badge-icon"]>span').contains(2);
  });

  it('Uncheck showPopups should not display transient messages', () => {
    cy.get('[data-cy="bell-button"]').click();
    cy.get('[data-cy="ux-notification-list"]');
    cy.get('[data-cy="list-context-button-menu"]').click();
    cy.get('[data-cy="showPopups"]').click();
    cy.get('[data-cy="header-bell-button"]').click();
    cy.reload();
    cy.wait(['@getPagesData', '@getWebapiData', '@getTOC']);
    cy.wait(['@getCount'], { timeout: DEFAULT_TIMEOUT_COUNT });
    shared.createSingleNotification(shared.getNotification(
      'error', 'Corrupted', 'PDF EXPORT', 'qtm-icon-error'));
    cy.wait(['@getCount', '@getCount'], { timeout: DEFAULT_TIMEOUT_COUNT });
    cy.get('[data-cy="bell-button"]').find('[data-cy="ux-badge-icon"]>span').contains(1);
    cy.get('[data-cy="ux-notification-list-global"]>.notification').should('not.exist');
  });

  afterEach(() => {
    shared.deleteNotifications();
  });
});

describe('Toast Notifications', shared.defaultTestOptions, () => {
  beforeEach(() => {
    cy.intercept({
      method: 'POST',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/datasource/ws/data`
    }).as('getWebapiData');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/uiTestNotification*`
    }).as('getPagesData');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pages/toc*`
    }).as('getTOC');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/notification?intervalTime=10500`
    }).as('getNotifications');
    cy.bvdLogin();
    cy.visit('/uiTestNotification?_m=testNotificationEntry');
    cy.wait(['@getPagesData', '@getWebapiData', '@getTOC']);
  });

  it('Create toast notifications with correct elements', () => {
    shared.createSingleNotification(shared.getNotification());
    cy.wait(['@getNotifications']).its('response.statusCode').should('equal', 200);
    cy.get('[data-cy="ux-notification-list-global"]>.notification').should('have.css', 'top', '0px');
    const globalDuration = 6 * 1000; // the transient behaviour of the global message
    cy.wait(globalDuration).then(() => {
      cy.get('[data-cy="ux-notification-list-global"]>.notification').should('not.exist');
    });
  });
  it('Long notifications must also be displayed in transient toast message', () => {
    const notificationMessage = 'Contains a very long Text. Contains a very long Text. Contains a very long Text. ' +
        'Contains a very long Text. Contains a very long Text.' +
        'Contains a very long Text. Contains a very long Text. Contains a very long Text. Contains a very long Text.';
    shared.createSingleNotification(shared.getNotification('warning', notificationMessage));
    cy.wait(['@getNotifications']).its('response.statusCode').should('equal', 200);
    cy.get('[data-cy="notification-toast-description"]').should('contain', notificationMessage);
  });

  it('Display multiple toasts in a list', () => {
    shared.createSingleNotification(shared.getNotification());
    shared.createSingleNotification(shared.getNotification());
    cy.wait(['@getNotifications']).its('response.statusCode').should('equal', 200);
    cy.get('[data-cy="ux-notification-list-global"]>.notification').eq(0)
      .should('have.css', 'top', '0px');
    cy.get('[data-cy="ux-notification-list-global"]>.notification').eq(1);
  });

  afterEach(() => {
    shared.deleteNotifications();
  });
});
