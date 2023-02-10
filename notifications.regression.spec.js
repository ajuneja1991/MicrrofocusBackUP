// <reference types="Cypress" />
const shared = require('../../shared/shared');

describe('Notification', shared.defaultTestOptions, () => {
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

  it('clears notifications on navigating to another page', () => {
    cy.url().should('contain', 'uiTestNotification');
    cy.get('[data-cy="navigation-category-T2"] > .ux-side-menu-item').first().click();
    cy.get('[data-cy="navigation-category-T3"] > .ux-side-menu-item').click();
    cy.get('[data-cy="navigation-category-T3"] > .ux-side-menu-item-expanded');
    cy.get('[data-cy="navigation-menuEntry-testChartErrorsEntry"] button').click();
    cy.get('ux-alert .alert-content');
    cy.get('[data-cy="navigation-category-T4"] button').click();
    cy.get('[data-cy="navigation-menuEntry-testWidgetsEntry"] button').click();
    cy.get('ux-alert .alert-content').should('not.exist');
  });
});

describe('Alert Notification', () => {
  beforeEach(() => {
    cy.intercept({
      method: 'POST',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/datasource/ws/data`
    }).as('getWebapiData');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/testAlertStack*`
    }).as('getPagesData');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pages/toc*`
    }).as('getTOC');
    cy.bvdLogin();
    cy.visit('/testAlertStack');
    cy.wait(['@getPagesData', '@getWebapiData', '@getTOC']);
    cy.url().should('include', '_s');
  });

  it('should show page notification on page and widget notification on widget', () => {
    cy.get('[data-cy="notification-error-text"]').contains('wrong-page-action');
    cy.get('#ui-test-complex-chart').find('notification').find('[data-cy="notification-error-text"]').contains('wrong-widget-action');
  });

  it('should show all the default page actions', () => {
    cy.get('[data-cy="page-action-button"]').click();
    cy.get('[data-cy="page-action-item-save"]').should('be.enabled');
    cy.get('[data-cy="page-action-item-saveAs"]').should('be.enabled');
    cy.get('[data-cy="page-action-item-delete"]').should('be.enabled');
    cy.get('[data-cy="page-action-item-addWidget"]').should('be.enabled');
    cy.get('[data-cy="page-action-item-revert"]').should('be.disabled');
    cy.get('[data-cy="page-action-item-export"]').should('be.enabled');
    cy.get('[data-cy="page-action-item-schedule"]').should('be.enabled');
  });
});

describe('Dismissible and Non-dismissible Widget Notification', () => {
  beforeEach(() => {
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pages/toc*`
    }).as('getTOC');
    cy.intercept({
      method: 'POST',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/datasource/ws/data`
    }).as('getWebapiData');
    cy.bvdLogin();
    cy.visit('/notificationsTest');
    cy.wait(['@getTOC', '@getWebapiData', '@getWebapiData', '@getWebapiData']);
  });

  it('should not close datasource proxy error notification from the widget', () => {
    cy.get('#ui-test-avg-cpu-baseline-chart').within(() => {
      cy.get('notification').find('[data-cy="notification-error-text"]').contains('Failed to load data');
      cy.get('notification').find('.alert-close').should('not.exist');
    });
  });

  it('should close dismissible notifications from the widget on dismiss button click', () => {
    cy.get('#ui-test-avg-cpu-baseline-chart').within(() => {
      cy.get('notification').find('ux-alert').find('[data-cy="rightCaret"]').click();
      cy.get('notification').find('[data-cy="notification-error-text"]').contains('Failed to load custom action plugin');
      cy.get('notification').find('.alert-close').click();
      cy.get('Failed to load custom action plugin').should('not.exist');
    });
  });

  it('left caret should be disabled by default and when reaching end of the pagination, right caret should get disabled', () => {
    cy.get('#ui-test-avg-cpu-baseline-chart').within(() => {
      cy.get('notification').find('[data-cy="leftCaret"]').should('have.attr', 'disabled');
      cy.get('notification').find('ux-alert').find('[data-cy="rightCaret"]').click();
      cy.get('notification').find('ux-alert').find('[data-cy="rightCaret"]').click();
      cy.get('notification').find('ux-alert').find('[data-cy="rightCaret"]').should('have.attr', 'disabled');
    });
  });

  it('page error notification should not come under widget notifications', () => {
    cy.get('#ui-test-avg-cpu-baseline-chart').within(() => {
      cy.get('notification').find('[data-cy="notification-error-text"]').should('not.contain', 'Failed to load custom action plugin sidepanelTest');
      cy.get('notification').find('[data-cy="rightCaret"]').click();
      cy.get('notification').find('[data-cy="notification-error-text"]').should('not.contain', 'Failed to load custom action plugin sidepanelTest');
      cy.get('notification').find('[data-cy="rightCaret"]').click();
      cy.get('notification').find('[data-cy="notification-info-text"]').should('not.contain', 'Failed to load custom action plugin sidepanelTest');
      cy.get('notification').find('[data-cy="rightCaret"]').should('have.attr', 'disabled');
    });
  });
});

describe('Side Panel Widget Notification', () => {
  beforeEach(() => {
    cy.bvdLogin();
    cy.visit('/notificationsTest');
  });

  it('should display error notification on side panel widget', () => {
    cy.get('[data-cy="page-action-button"]').click();
    cy.get('[data-cy="page-action-item-open_metric_browser"]').click();
    cy.get('right-side-panel').find('notification').find('[data-cy="notification-error-text"]').contains('Failed to load data source plugin');
  });

  it('side panel error notification should not be dismissible', () => {
    cy.get('[data-cy="page-action-button"]').click();
    cy.get('[data-cy="page-action-item-open_metric_browser"]').click();
    cy.get('right-side-panel').find('notification').find('[data-cy="notification-error-text"]').contains('Failed to load data source plugin');
    cy.get('right-side-panel').find('notification').find('.alert-close').should('not.exist');
  });
});

describe('remove widget notification when the data is loaded', () => {
  beforeEach(() => {
    cy.bvdLogin();
    cy.visit('/chartLegendsPage');
  });

  it('should show error notifications when the network request is blocked, show data on click of zoom out button, remove error notifications', () => {
    cy.intercept({
      method: 'POST',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/datasource/ws/data`,
      times: 2
    }, {
      body: 'test does not allow it',
      statusCode: 404
    }).as('getWebapiData');
    cy.wait('@getWebapiData');

    cy.get('#ui-test-complex-chart').find('notification').find('[data-cy="notification-error-text"]').contains('Data not found');
    cy.get('#ui-test-complex-chart').find('notification').find('.alert-close').should('not.exist');
    cy.get('#ui-test-complex-chart').find('notification').find('[data-cy="rightCaret"]').click();
    cy.get('#ui-test-complex-chart').find('notification').find('[data-cy="notification-info-text"]').contains('No data');

    cy.get('#context-view').find('[data-cy="context-filter-menu"]').find('[data-cy="zoomOut"]').click();
    cy.wait('@getWebapiData');
    cy.get('#ui-test-complex-chart').find('notification').should('have.text', '');
  });
});

describe('remove omnibar error notification when the data is loaded', () => {
  beforeEach(() => {
    cy.bvdLogin();
    cy.visit('/contextOmnibar');
  });

  it('should show error notifications when the network request is blocked, show data on click of zoom out button, remove error notifications', () => {
    cy.intercept({
      method: 'POST',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/datasource/ws/data`,
      times: 14
    }, {
      body: 'test does not allow it',
      statusCode: 404
    }).as('getWebapiData');
    cy.wait('@getWebapiData');

    cy.get('[data-cy="context-filter-content"]').find('[data-cy=omnibar-input-field]').click();
    cy.get('[data-cy="type-Node Group"]').find('[data-cy="notification-error-text"]').contains('Data not found');
    cy.get('[data-cy="type-Node"]').find('[data-cy="notification-error-text"]').contains('Data not found');
    cy.get('[data-cy="omnibar-footer"]').find('[data-cy="omnibar-close-btn"]').click();

    cy.wait(['@getWebapiData', '@getWebapiData', '@getWebapiData', '@getWebapiData', '@getWebapiData', '@getWebapiData']);
    cy.get('[data-cy="context-filter-content"]').find('[data-cy=omnibar-input-field]').click();
    cy.wait(['@getWebapiData', '@getWebapiData', '@getWebapiData', '@getWebapiData', '@getWebapiData', '@getWebapiData']);

    cy.get('[data-cy="type-Node Group"]').find('notification').should('not.be.visible');
    cy.get('[data-cy="type-Node"]').find('notification').should('not.be.visible');

    cy.get('[data-cy="type-Node Group"]').find('notification').should('have.text', '');
    cy.get('[data-cy="type-Node"]').find('notification').should('have.text', '');
  });
});
