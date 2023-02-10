// <reference types="Cypress" />

const shared = require('../../shared/shared');

const visitPage = (pageId = '', pageToWaitFor = '') => {
  cy.visit(`/${pageId}`);
  cy.wait([`@${pageToWaitFor}`, '@getData', '@getTOC']);
};

/**
 * next describe works also in new pgmt mode.
 * Can be probably moved to new pgmt area
 */
describe('General scenarios', () => {
  beforeEach(() => {
    cy.intercept({
      method: 'POST',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/datasource/ws/data`
    }).as('getData');
    cy.intercept(`${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/uiTestPageReadOnly*`).as('getReadOnlyPage');
    cy.intercept(`${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/notificationsTest*`).as('getNotificationTest');
    cy.intercept(`${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/uiTestWidgetsPageConfigOverride*`).as('getUiTestWidgetsPageConfigOverride');
    cy.intercept(`${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/uiTestPlugins*`).as('getUITestPlugins');
    cy.intercept(`${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/newContextPage*`).as('getSavePageData');
    cy.intercept(`${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/uiInvalidPage*`).as('getUIInvalidPage');
    cy.intercept(`${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/uiTestWidgets*`).as('getUITestWidgets');
    cy.intercept(`${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/uiTestPageCrud*`).as('getUITestPageCrud');
    cy.intercept(`${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/new_page*`).as('getNewPage');
    cy.intercept(`${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/*`).as('getOtherPages');
    cy.intercept(`${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pages/toc*`).as('getTOC');
    cy.bvdLogin();
  });

  it('Check that the page default actions are not available', () => {
    visitPage('uiTestPageReadOnly', 'getReadOnlyPage');
    cy.get('[data-cy="page-action-button"]').should('not.exist');
    // Modify the page and validate whether 'Save' and 'Revert' actions are enabled
    cy.get('[data-cy="action-button"]').first().click();
    cy.get('[data-cy="action-button-duplicateWidget"]').click();
    cy.get('[data-cy="page-action-button"]').should('not.exist');
  });

  it('should check for tooltip', () => {
    visitPage('uiTestPageReadOnly', 'getReadOnlyPage');
    cy.get('.tooltip-inner').should('not.exist');
    cy.get('#ui-test-metric-box')
      .siblings('.widget-header')
      .find('.dashboard-widget-title')
      .trigger('mouseenter')
      .should('have.attr', 'aria-describedby')
      .and('match', /ux-tooltip-/);
    cy.get('.tooltip-inner').contains('Workstation');
  });

  it('should contain custom action add metrics', () => {
    visitPage('uiTestPageReadOnly', 'getReadOnlyPage');
    cy.get('#ui-test-metric-box').siblings('.widget-header').find('#actions-dropdown-button').click();
    cy.get('.ux-menu').contains('Add Metrics');
  });

  it('should fail the click() on open edit mode because widget is covered by overlay', done => {
    visitPage('notificationsTest', 'getNotificationTest');
    cy.get('ux-dashboard-widget').first().find('.handle-bottom').trigger('mousedown', { which: 1 }, 'right').trigger('mousemove', 200, 200).click();
    cy.get('button.ux-side-menu-toggle').click();
    cy.get('[data-cy="side-nav-more-button"]').click();
    cy.get('[data-cy="open-edit-mode-button"]').click();
    cy.get('ux-dashboard-widget').first().find('.handle-bottom').click();

    // Use once() binding for just this fail
    cy.once('fail', err => {
      // Capturing the fail event swallows it and lets the test succeed

      // Now look for the expected messages
      expect(err.message).to.include('is being covered by another element');

      done();
    });
    cy.get('ux-dashboard-widget').first().find('.handle-bottom').click().then(x => {
      // Only here if click succeeds (so test fails)
      done(new Error('Expected button NOT to be clickable, but click() succeeded', x));
    });
  });

  it('should contain the error message for invalid context name', () => {
    visitPage('uiTestWidgetsPageConfigOverride/?_s=1588750080000&_e=1588752120000&_tft=A&_ctx=~(~(type~%27host~id~%27obac.mambo.net~name~%27obac.()mambo.net)', 'getUiTestWidgetsPageConfigOverride');
    cy.wait('@getData');
    cy.get('.alert-content').find('.notification-text');
    cy.contains('Cannot apply the context passed in the URL to this page as it is invalid');
  });
});
