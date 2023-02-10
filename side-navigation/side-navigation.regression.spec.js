// <reference types="Cypress" />
const shared = require('../../../shared/shared');
const nonAdminuserName = 'test';
const nonAdminuserPwd = 'control@123D';
let storeMenuEntry;

const data = {
  name: 'testRole',
  description: 'For foundation tester'
};

function openEditMode() {
  cy.get('[data-cy="close-edit-mode-button"]').should('not.exist');
  cy.get('[data-cy="side-nav-more-button"]').click();
  cy.get('[data-cy="open-edit-mode-button"]').should('have.class', 'ux-focus-indicator');
  cy.get('[data-cy="open-edit-mode-button"] > .dropdown-menu-text').click();
  cy.get('[data-cy="close-edit-mode-button"]');
}

function hoverDeleteButton(prefix, identifier) {
  cy.get(`[data-cy="side-nav-delete-${identifier}-button-wrapper"]`).should('not.exist');
  // button wrapper should be visible on hover/mouseenter. As this is not working -> click on it
  cy.get(`[data-cy="navigation-${prefix}-${identifier}"]`).click();
  cy.get(`[data-cy="side-nav-delete-${identifier}-button-wrapper"]`).should('have.length', 1);
}

function checkConfirmationBarNotVisible(identifier) {
  cy.get(`[data-cy="cancel-confirmation-button-${identifier}"]`).should('not.exist');
  cy.get(`[data-cy="approve-confirmation-button-${identifier}"]`).should('not.exist');
}

function triggerDeleteButton(identifier) {
  checkConfirmationBarNotVisible(identifier);
  cy.get(`[data-cy="side-nav-delete-${identifier}-button-wrapper"]`).click();
  cy.get(`[data-cy="cancel-confirmation-button-${identifier}"]`);
  cy.get(`[data-cy="confirm-confirmation-button-${identifier}"]`);
}

describe('Side Navigation', shared.defaultTestOptions, () => {
  beforeEach(() => {
    cy.intercept({
      method: 'POST',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/datasource/ws/data`
    }).as('getData');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/uiTestWidgets*`
    }).as('getTestWidgetsPage');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/uiTestActions*`
    }).as('getTestActionsPage');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pages/toc*`
    }).as('getTOC');
    cy.bvdLogin();
    cy.visit('/uiTestWidgets?_m=testWidgetsEntry');
    cy.wait(['@getTestWidgetsPage', '@getData', '@getData', '@getData', '@getData', '@getData', '@getData', '@getData', '@getTOC', '@getTOC']);
  });

  afterEach(() => {
    cy.bvdLogout();
  });

  it('Open side navigation and display the parent categories', () => {
    cy.get('.ux-side-menu-toggle').click();
    cy.get('[data-cy="navigation-category-T2"] > .ux-side-menu-item').should('have.class', 'ux-focus-indicator');
  });

  it('Should open menu with search button and expand to active page', () => {
    cy.get('[data-cy="side-nav-search-button"]').click();
    cy.get('[data-cy="sideNavigation-search-input"]').should('have.focus');
    cy.get('ux-side-menu .ux-side-menu-drawer-expanded');
    cy.get('ux-side-menu').find('[aria-expanded="true"]');
    cy.get('ux-side-menu .sideNavSearch');
    cy.get('[data-cy="navigation-category-T2"] button').should('have.class', 'ux-side-menu-item-expanded');
    cy.get('[data-cy="navigation-category-T4"] button').first().should('have.class', 'ux-side-menu-item-expanded');
    cy.get('[data-cy="navigation-menuEntry-testWidgetsEntry"]');
  });

  it('opening side menu for the first time should expand menu structure to active page, otherwise retain menu structure - toggle button', () => {
    cy.get('.ux-side-menu-toggle').click();
    cy.get('[data-cy="sideNavigation-search-input"]').should('have.focus');
    cy.get('ux-side-menu .ux-side-menu-drawer-expanded');
    cy.get('ux-side-menu').find('[aria-expanded="true"]');
    cy.get('ux-side-menu .sideNavSearch');
    cy.get('[data-cy="navigation-category-T2"] button').should('have.class', 'ux-side-menu-item-expanded');
    cy.get('[data-cy="navigation-category-T4"] button').first().should('have.class', 'ux-side-menu-item-expanded');
    cy.get('[data-cy="navigation-menuEntry-testWidgetsEntry"]');
    cy.get('[data-cy="navigation-category-T3"] button').click();
    cy.get('.ux-side-menu-toggle').click();
    cy.get('.ux-side-menu-toggle').click();
    cy.get('[data-cy="navigation-category-T3"] button').first().should('have.class', 'ux-side-menu-item-expanded');
    cy.get('[data-cy="navigation-category-T4"] button').first().should('not.have.class', 'ux-side-menu-item-expanded');
  });

  it('opening side menu for the first time should expand menu structure to active page, otherwise retain menu structure - search button', () => {
    cy.get('[data-cy="side-nav-search-button"]').click();
    cy.get('[data-cy="sideNavigation-search-input"]').should('have.focus');
    cy.get('ux-side-menu .ux-side-menu-drawer-expanded');
    cy.get('ux-side-menu').find('[aria-expanded="true"]');
    cy.get('ux-side-menu .sideNavSearch');
    cy.get('[data-cy="navigation-category-T2"] button').should('have.class', 'ux-side-menu-item-expanded');
    cy.get('[data-cy="navigation-category-T4"] button').first().should('have.class', 'ux-side-menu-item-expanded');
    cy.get('[data-cy="navigation-menuEntry-testWidgetsEntry"]');
    cy.get('[data-cy="navigation-category-T3"] button').click();
    cy.get('.ux-side-menu-toggle').click();
    cy.get('[data-cy="side-nav-search-button"]').click();
    cy.get('[data-cy="navigation-category-T3"] button').first().should('have.class', 'ux-side-menu-item-expanded');
    cy.get('[data-cy="navigation-category-T4"] button').first().should('not.have.class', 'ux-side-menu-item-expanded');
  });

  it('opening side menu for the first time should expand menu structure to active page, otherwise retain menu structure - clicking on empty space', () => {
    cy.get('.menu-items').click('bottomRight');
    cy.get('[data-cy="sideNavigation-search-input"]').should('have.focus');
    cy.get('ux-side-menu .ux-side-menu-drawer-expanded');
    cy.get('ux-side-menu').find('[aria-expanded="true"]');
    cy.get('ux-side-menu .sideNavSearch');
    cy.get('[data-cy="navigation-category-T2"] button').should('have.class', 'ux-side-menu-item-expanded');
    cy.get('[data-cy="navigation-category-T4"] button').first().should('have.class', 'ux-side-menu-item-expanded');
    cy.get('[data-cy="navigation-menuEntry-testWidgetsEntry"]');
    cy.get('[data-cy="navigation-category-T3"] button');
    cy.get('[data-cy="navigation-category-T3"] button').click();
    cy.get('[data-cy="navigation-category-T3"] button').first().should('have.class', 'ux-side-menu-item-expanded');
    cy.get('[data-cy="navigation-category-T4"] button').first().should('not.have.class', 'ux-side-menu-item-expanded');
    cy.get('.ux-side-menu-toggle').click();
    cy.get('.menu-items').click('bottomRight');
    cy.get('[data-cy="navigation-category-T3"] button');
    cy.get('[data-cy="navigation-category-T3"] button').first().should('have.class', 'ux-side-menu-item-expanded');
    cy.get('[data-cy="navigation-category-T4"] button').first().should('not.have.class', 'ux-side-menu-item-expanded');
  });

  it('opening side menu for the first time by clicking on the side menu item should expand only selected category', () => {
    cy.get('[data-cy="navigation-category-1_L0_SA_Administration"] button').click();
    cy.get('[data-cy="navigation-category-1_L0_SA_Administration"] button').first().should('have.class', 'ux-side-menu-item-expanded');
    cy.get('[data-cy="sideNavigation-search-input"]').should('have.focus');
    cy.get('ux-side-menu .ux-side-menu-drawer-expanded');
    cy.get('ux-side-menu').find('[aria-expanded="true"]');
    cy.get('ux-side-menu .sideNavSearch');
    cy.get('[data-cy="navigation-category-0_L1_SA_AdminDashboards"]');
    cy.get('[data-cy="navigation-menuEntry-testWidgetsEntry"]').should('not.exist');
    cy.get('.ux-side-menu-toggle').click();
    cy.get('[data-cy="navigation-category-T2"] button').click();
    cy.get('[data-cy="navigation-category-T2"] button').first().should('have.class', 'ux-side-menu-item-expanded');
    cy.get('[data-cy="sideNavigation-search-input"]').should('have.focus');
    cy.get('ux-side-menu .ux-side-menu-drawer-expanded');
    cy.get('ux-side-menu').find('[aria-expanded="true"]');
    cy.get('ux-side-menu .sideNavSearch');
    cy.get('[data-cy="navigation-menuEntry-testWidgetsEntry"]');
    cy.get('[data-cy="navigation-category-0_L1_SA_AdminDashboards"]').should('not.exist');
  });

  it('Should focus search input on search icon click (in not expanded state)', () => {
    cy.get('.sideNavSearchItem').click();
    cy.get('ux-side-menu .ux-side-menu-drawer-expanded');
    cy.get('ux-side-menu').find('[aria-expanded="true"]');
    cy.get('ux-side-menu .sideNavSearch');
    cy.get('.sideNavSearch input#sideNavigationSearchInputID').should('have.focus');
  });

  it('Should indicate active page on side nav navigation', () => {
    cy.url().should('include', '_s');
    cy.bvdSideNavClick('navigation-category-T2', ['navigation-category-T4'], 'navigation-menuEntry-testActionsEntry');
    cy.wait(['@getTestActionsPage', '@getData', '@getData']);
    cy.get('[data-cy="navigation-menuEntry-testActionsEntry"] button').first().should('have.class', 'ux-side-menu-item-active');
    cy.get('[data-cy="navigation-menuEntry-testWidgetsEntry"] button').first().should('not.have.class', 'ux-side-menu-item-active');
  });

  it('Should remove active state from menu entry if navigating to page without menu entry', () => {
    cy.url().should('include', '_s');
    cy.bvdSideNavClick('navigation-category-T2', ['navigation-category-T4'], 'navigation-menuEntry-testActionsEntry');
    cy.wait(['@getTestActionsPage', '@getData', '@getData']);
    cy.get('[data-cy="navigation-menuEntry-testActionsEntry"] button').first().should('have.class', 'ux-side-menu-item-active');
    cy.get('[data-cy="navigation-menuEntry-testWidgetsEntry"] button').first().should('not.have.class', 'ux-side-menu-item-active');
    cy.go('back');
    cy.wait(['@getTestWidgetsPage', '@getData', '@getData', '@getData', '@getData', '@getData', '@getData', '@getData', '@getTOC']);
    cy.bvdSideNavClick('navigation-category-T2', ['navigation-category-T4'], undefined, true);
    cy.get('[data-cy="navigation-menuEntry-testActionsEntry"] button').first().should('not.have.class', 'ux-side-menu-item-active');
  });

  it('By default side navigation should not be expanded and slide in/out works as expected', () => {
    cy.get('ux-side-menu .ux-side-menu-drawer-expanded').should('not.exist');
    cy.bvdSideNavClick('navigation-category-T2', ['navigation-category-T4'], 'navigation-menuEntry-testActionsEntry');
    cy.wait(['@getTestActionsPage', '@getData', '@getData']);
    cy.contains('Server A');
    cy.get('.ux-side-menu-toggle').click();
    cy.get('ux-side-menu .ux-side-menu-drawer-expanded').should('not.exist');
  });

  it('Scroll bar must exist in side navigation panel', () => {
    cy.get('ux-side-menu .ux-side-menu-drawer-expanded').should('not.exist');
    cy.get('.ux-side-menu-toggle').click();
    cy.get('[data-cy="navigation-category-T2"] > .ux-side-menu-item').click();
    cy.get('.ux-side-menu-drawer').should('have.attr', 'aria-expanded').and('eq', 'true');
    cy.get('side-navigation').find('.menu-items').then(e1 => {
      Cypress.dom.isScrollable(e1);
    });
  });

  it('Should not show the top level category having no children inside', () => {
    cy.get('ux-side-menu .ux-side-menu-drawer-expanded').should('not.exist');
    cy.get('.ux-side-menu-toggle').click();
    cy.get('ux-side-menu .ux-side-menu-drawer-expanded');
    cy.get('ux-side-menu').find('[aria-expanded="true"]');
    cy.get('[data-cy="navigation-category-T9"]').should('not.be.visible');
  });

  it('Should expand to up to 4 levels', () => {
    cy.get('.ux-side-menu-toggle').click();
    cy.get('ux-side-menu .ux-side-menu-drawer-expanded');
    cy.get('ux-side-menu').find('[aria-expanded="true"]');
    cy.get('[data-cy="navigation-category-T2"]').find('[aria-expanded="true"]');
    cy.get('[data-cy="navigation-category-T4"]').find('[aria-expanded="true"]');
    cy.get('[data-cy="navigation-menuEntry-testPluginsEntry"]').should('not.exist');
    cy.get('[data-cy="navigation-category-T41"]').click();
    cy.get('[data-cy="navigation-menuEntry-testPluginsEntry"]').should('be.visible');
  });

  it('Clicking on a menu entry should unhighlight the previously selected category and menu entry', () => {
    cy.get('.ux-side-menu-toggle').click();
    cy.get('ux-side-menu .ux-side-menu-drawer-expanded');
    cy.get('ux-side-menu').find('[aria-expanded="true"]');
    cy.get('[data-cy="navigation-category-T2"]').find('[aria-expanded="true"]');
    cy.get('[data-cy="navigation-category-T4"] > button').click();
    cy.get('[data-cy="navigation-menuEntry-gaugeViewEntry"]').click();
    cy.get('[data-cy="navigation-menuEntry-gaugeViewEntry"]').find('button').should('have.class', 'ux-side-menu-item-active');
    cy.get('[data-cy="navigation-category-T2"] > button > .ux-side-menu-expander-icon').click();
    cy.get('[data-cy="navigation-category-T2"]').find('button').should('have.class', 'ux-side-menu-item-active');
    cy.get('[data-cy="navigation-category-T6"] > button > .ux-side-menu-expander-icon').click();
    cy.get('[data-cy="navigation-category-T6"]').find('button').should('not.have.class', 'ux-side-menu-item-active');
    cy.get('[data-cy="navigation-menuEntry-testTopLevelCategory"]').click();
    cy.get('[data-cy="navigation-menuEntry-testTopLevelCategory"]').find('button').should('have.class', 'ux-side-menu-item-active');
    cy.get('[data-cy="navigation-category-T2"]').find('button').should('not.have.class', 'ux-side-menu-item-active');
    cy.get('[data-cy="navigation-category-T6"]').find('button').should('have.class', 'ux-side-menu-item-active');
  });

  it('Search results should not be shown when side nav is collapsed', () => {
    cy.get('[data-cy="side-nav-search-button"]').click();
    cy.get('ux-side-menu .ux-side-menu-drawer-expanded');
    cy.get('[data-cy="sideNavigation-search-input"]').type('jdkdkdkffdk');
    cy.get('[data-cy="no-entries-found-message"]');
    cy.get('button.ux-side-menu-toggle').click();
    cy.get('[data-cy="no-entries-found-message"]').should('not.exist');
  });
});

describe('Side Navigation - check masthead', () => {
  beforeEach(() => {
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/pageBreadcrumb*`
    }).as('getPage');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pages/toc?onlyFullControl*`
    }).as('getTocOnlyFullControl');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pages/toc*`
    }).as('getTOC');
    cy.bvdLogin();
    cy.visit('/pageBreadcrumb?_m=pageBreadcrumbMenuEntry1');
    cy.wait(['@getPage', '@getTOC', '@getTocOnlyFullControl']);
  });

  it('Open new menu entry with side nav and check breadcrumb title', () => {
    cy.get('[data-cy="breadcrumb-title-First breadcrumb validation"]');
    cy.bvdSideNavClick('navigation-category-T2', ['navigation-category-T7'], 'navigation-menuEntry-pageBreadcrumbMenuEntry2');
    cy.wait(['@getPage', '@getTocOnlyFullControl']);
    cy.get('[data-cy="breadcrumb-title-Second breadcrumb title"]');
    cy.title().should('include', 'Second breadcrumb title');
  });

  afterEach(() => {
    cy.bvdLogout();
  });
});

describe('Side Navigation XSS', shared.defaultTestOptions, () => {
  beforeEach(() => {
    cy.intercept({
      method: 'POST',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/datasource/ws/data`
    }).as('getData');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/uiTestNotification*`
    }).as('getNotificationPage');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/uiTestWidgets*`
    }).as('getWidgetsPage');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pages/toc*`
    }).as('getTOC');
    cy.bvdLogin();
    cy.visit('/uiTestNotification?_m=testNotificationEntry');
    cy.wait(['@getNotificationPage', '@getData', '@getTOC']);
  });

  it('Should not trigger the XSS which was provided in the menu entry title', () => {
    cy.get('[data-cy="side-nav-search-button"]').click();
    cy.get('ux-side-menu .ux-side-menu-drawer-expanded');
    cy.get('[data-cy="navigation-category-T6"] button').click();
    cy.get('[data-cy="navigation-menuEntry-testXssInMenuEntry"]').contains('<base href="javascript:/a/-alert(1)///////"><a href=https://14.rs>tes1t</a>').click();
    cy.wait(['@getWidgetsPage', '@getData']);
    cy.url().should('contain', 'uiTestWidgets?_m=testXssInMenuEntry');
  });
});

describe('Side Navigation scroll validation', shared.defaultTestOptions, () => {
  beforeEach(() => {
    cy.intercept({
      method: 'POST',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/datasource/ws/data`
    }).as('getData');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/uiTestWidgetsTextWidget*`
    }).as('getPage');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pages/toc*`
    }).as('getTOC');
    cy.bvdLogin();
    cy.visit('/uiTestWidgetsTextWidget?_m=uiTextWidgets');
    cy.wait(['@getPage', '@getData', '@getTOC']);
  });

  it('Should scroll to menu entry', { scrollBehavior: false }, () => {
    cy.get('.ux-side-menu-toggle').click();
    cy.get('ux-side-menu .ux-side-menu-drawer-expanded');
    cy.get('ux-side-menu .sideNavSearch');
    cy.get('[data-cy="navigation-category-T2"] > .ux-side-menu-item').then(element => {
      if (!element.hasClass('ux-side-menu-item-expanded')) {
        element.click();
      }
    });
    cy.get('[data-cy="navigation-category-T2"] > .ux-side-menu-item-expanded');
    cy.get('[data-cy="navigation-category-T4"] > button').then(element => {
      if (!element.hasClass('ux-side-menu-item-expanded')) {
        element.click();
      }
    });
    cy.get('[data-cy="navigation-category-T4"] > .ux-side-menu-item-expanded');
    cy.get('[data-cy="navigation-menuEntry-uiTextWidgets"]').should('be.visible');
  });

  it('Should scroll to menu entry after search', { scrollBehavior: false }, () => {
    cy.get('[data-cy="side-nav-search-button"]').click();
    cy.get('[data-cy="sideNavigation-search-input"]').type('WidgetsComplex');
    cy.get('[data-cy="thirdLevelItem-testWidgetsComplexChartEntry"] > span')
      .should('have.class', 'highlight')
      .click();
    cy.get('[data-cy="navigation-menuEntry-testWidgetsComplexChartEntry"]').should('be.visible');
  });
});

describe('Side Navigation not scroll validation', shared.defaultTestOptions, () => {
  /**
   * Within each test a waiting time is necessary
   * The test should check that the page navigation does not scroll if the selected element is already in the viewport.
   * So if the page navigation is open, it is important that the test waits a few seconds in case it scrolls by mistake.
   * Because when it scrolls, the first category (UI Testing) should not be visible anymore.
   * If there was no wait time, it could immediately check if the category is visible and then scroll by mistake.
   * So without a waiting time before the test makes no sense.
   */

  it('Should not scroll to menu entry (First page in viewport)', { scrollBehavior: false }, () => {
    cy.intercept({
      method: 'POST',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/datasource/ws/data`
    }).as('getData');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/uiTestActions*`
    }).as('getPage');
    cy.bvdLogin();
    cy.visit('/uiTestActions?_m=testActionsEntry');
    cy.wait(['@getPage', '@getData']);
    cy.get('.ux-side-menu-toggle').click();
    // wait is important and should not be removed. It is explained under the describe
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(2000);
    // check if UI testing Category is still visible
    cy.get('[data-cy="firstLevelItem-T2"]').should('be.visible');
  });

  it('Should not scroll to menu entry (Last page in viewport)', { scrollBehavior: false }, () => {
    cy.intercept({
      method: 'POST',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/datasource/ws/data`
    }).as('getData');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/uiTestSplitterSimple*`
    }).as('getPage');
    cy.bvdLogin();
    cy.visit('uiTestSplitterSimple?_m=uiSplitterLayout');
    cy.wait(['@getPage', '@getData']);
    cy.get('[data-cy="navigation-category-T6"]').click();
    // wait is important and should not be removed. It is explained under the describe
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(2000);
    // check if UI testing Category is still visible
    cy.get('[data-cy="navigation-category-T6"]').should('be.visible');
  });
});

describe('Side Navigation - Edit Mode (Super admin)', shared.defaultTestOptions, () => {
  beforeEach(() => {
    cy.intercept({
      method: 'POST',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/datasource/ws/data`
    }).as('getData');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/uiTestWidgets*`
    }).as('getPage');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pages/toc*`
    }).as('getTOC');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/uiTestPageProperty*`
    }).as('getTestPage');
    cy.bvdLogin();
    cy.visit('/uiTestWidgets?_m=testWidgetsEntry');
    cy.wait(['@getPage', '@getData', '@getData', '@getData', '@getData', '@getData', '@getData', '@getData', '@getTOC', '@getTOC']);
  });

  afterEach(() => {
    cy.bvdLogout();
  });

  it('Add menu entry to ui testing category', () => {
    shared.createMenuEntryAPI('TestMenu', 'T2', 'uiTestWidgets', newMenuEntry => {
      storeMenuEntry = newMenuEntry;
      cy.visit(`/uiTestWidgets?_m=${newMenuEntry.id}`);
      cy.wait(['@getPage', '@getData', '@getData', '@getData', '@getData', '@getData', '@getData', '@getData', '@getTOC']);
    });
  });

  it('Open edit mode, exit edit mode on exit button click & exit edit mode on outside click', () => {
    cy.get('.ux-side-menu-toggle').click();
    openEditMode();

    cy.log('exit edit mode on exit button click');
    cy.get('[data-cy="close-edit-mode-button"]').click();
    cy.get('[data-cy="close-edit-mode-button"]').should('not.exist');

    cy.log('Exit edit mode on outside click');
    openEditMode();
    cy.get('[data-cy=overlay-edit-mode]').click();
    cy.get('[data-cy="close-edit-mode-button"]').should('not.exist');
  });

  it('Should show empty categories in edit mode only', () => {
    cy.get('.ux-side-menu-toggle').click();
    cy.get('[data-cy="navigation-category-T22_Empty"]').should('have.class', 'hideEmptyCategory').and('not.be.visible');
    cy.get('[data-cy="navigation-category-T9"]').should('have.class', 'hideEmptyCategory').and('not.be.visible');
    openEditMode();
    cy.get('[data-cy="navigation-category-T9"]').scrollIntoView().should('be.visible');
    cy.get('[data-cy="navigation-category-T22_Empty"]').scrollIntoView().should('be.visible');
  });

  it('Should show delete buttons on hover menu entry item and enter delete button ', () => {
    cy.get('.ux-side-menu-toggle').click();
    openEditMode();
    hoverDeleteButton('menuEntry', 'testWidgetsEntry');

    cy.log('Should show confirmation bar on delete button click');
    triggerDeleteButton('testWidgetsEntry');
  });

  it('Should cancel deletion on confirmation bar cancel click', () => {
    cy.get('.ux-side-menu-toggle').click();
    openEditMode();
    hoverDeleteButton('menuEntry', 'testActionsEntry');
    triggerDeleteButton('testActionsEntry');
    cy.get('[data-cy="cancel-confirmation-button-testActionsEntry"]').click();
    checkConfirmationBarNotVisible('testActionsEntry');
  });

  it('Should cancel deletion on click outside of element', () => {
    cy.get('.ux-side-menu-toggle').click();
    openEditMode();
    hoverDeleteButton('menuEntry', 'testActionsEntry');
    triggerDeleteButton('testActionsEntry');
    cy.get('[data-cy=overlay-edit-mode]').click();
    cy.get('[data-cy="close-edit-mode-button"]').should('not.exist');
    openEditMode();
    checkConfirmationBarNotVisible('testActionsEntry');
  });

  it('Should cancel deletion on expand menu', () => {
    cy.get('.ux-side-menu-toggle').click();
    openEditMode();
    hoverDeleteButton('menuEntry', 'testActionsEntry');
    triggerDeleteButton('testActionsEntry');
    cy.get('[data-cy="navigation-menuEntry-testWidgetsEntry"]').click();
    checkConfirmationBarNotVisible('testActionsEntry');
  });

  it('Should cancel deletion on click on another menuEntry', () => {
    cy.get('.ux-side-menu-toggle').click();
    openEditMode();
    hoverDeleteButton('menuEntry', 'testActionsEntry');
    triggerDeleteButton('testActionsEntry');
    cy.get('[data-cy="navigation-menuEntry-testWidgetDataExplorerEntry"]').click();
    checkConfirmationBarNotVisible('testActionsEntry');
  });

  it('Should open edit category on doubleClick on category', () => {
    cy.get('.ux-side-menu-toggle').click();
    openEditMode();
    cy.get('[data-cy="navigation-category-T3"]').dblclick();
    cy.get('right-side-panel > ux-side-panel').should('exist');
    cy.get('right-side-panel > ux-side-panel').should('have.class', 'open');
    cy.get('h2').contains('Edit Category');
    cy.get('[data-cy="cancel-button"]').click();
    cy.get('[data-cy="secondLevelItem-gaugeViewEntry"]').dblclick();
    cy.get('right-side-panel > ux-side-panel').should('not.exist');
  });

  it('Should delete menu entry on confirm deletion in confirmation bar', () => {
    shared.createMenuEntryAPI('TestDelete', 'T5', 'uiTestWidgets', newMenuEntry => {
      storeMenuEntry = newMenuEntry;
      cy.visit(`/uiTestWidgets?_m=${newMenuEntry.id}`);
      cy.wait(['@getPage', '@getData', '@getData', '@getData', '@getData', '@getData', '@getData', '@getData', '@getTOC']);
      cy.get('.ux-side-menu-toggle').click();
      openEditMode();
      hoverDeleteButton('menuEntry', newMenuEntry.id);
      triggerDeleteButton(newMenuEntry.id);
      cy.intercept({
        method: 'DELETE',
        path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/menuEntries/*`
      }).as('DeleteMenuEntry');
      cy.get(`[data-cy="confirm-confirmation-button-${newMenuEntry.id}"]`).click();
      cy.wait('@DeleteMenuEntry');
      cy.bvdCheckToast('Instance removed successfully');
      cy.get(`[data-cy="navigation-menuEntry-${newMenuEntry.id}"]`).should('not.exist');
    });
  });

  it('Should test hover after deletion', () => {
    shared.createMenuEntryAPI('TestHover', 'T5', 'uiTestWidgets', newMenuEntry => {
      storeMenuEntry = newMenuEntry;
      cy.visit(`/uiTestWidgets?_m=${newMenuEntry.id}`);
      cy.wait(['@getPage', '@getData', '@getData', '@getData', '@getData', '@getData', '@getData', '@getData', '@getTOC']);
      cy.get('.ux-side-menu-toggle').click();
      openEditMode();
      hoverDeleteButton('menuEntry', newMenuEntry.id);
      triggerDeleteButton(newMenuEntry.id);
      cy.intercept({
        method: 'DELETE',
        path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/menuEntries/*`
      }).as('DeleteMenuEntryTestHover');
      cy.get(`[data-cy="confirm-confirmation-button-${newMenuEntry.id}"]`).click();
      cy.bvdCheckToast('Instance removed successfully');
      cy.wait('@DeleteMenuEntryTestHover');
      cy.get(`[data-cy="confirm-confirmation-button-${newMenuEntry.id}"]`).should('not.exist');
      cy.get('[data-cy="navigation-category-T2"] button').should('have.class', 'ux-side-menu-item-expanded');
      hoverDeleteButton('menuEntry', 'gaugeViewEntry');
    });
  });

  it('No edit and exit button on page load or on reload', () => {
    cy.get('[data-cy="close-edit-mode-button"]').should('not.exist');
    cy.get('[data-cy="side-nav-more-button"]').should('not.exist');
    cy.get('[data-cy="open-edit-mode-button"]').should('not.exist');
    cy.reload();
    cy.wait(['@getPage', '@getData']);
    cy.get('[data-cy="close-edit-mode-button"]').should('not.exist');
    cy.get('[data-cy="side-nav-more-button"]').should('not.exist');
    cy.get('[data-cy="open-edit-mode-button"]').should('not.exist');
  });

  it('Should cancel deletion on page reload', () => {
    cy.get('.ux-side-menu-toggle').click();
    openEditMode();
    hoverDeleteButton('menuEntry', 'testWidgetsEntry');
    triggerDeleteButton('testWidgetsEntry');
    cy.reload();
    cy.wait(['@getPage', '@getData']);
    checkConfirmationBarNotVisible('testWidgetsEntry');
  });

  it('Sanity check on confirmation content and tooltip', () => {
    cy.get('.ux-side-menu-toggle').click();
    openEditMode();
    hoverDeleteButton('menuEntry', 'testWidgetsEntry');
    triggerDeleteButton('testWidgetsEntry');
    cy.get('[data-cy="confirm-confirmation-button-testWidgetsEntry"]').contains('Yes');
    cy.get('[data-cy="cancel-confirmation-button-testWidgetsEntry"]').contains('No');
    cy.get('[data-cy="delete-confirmation-bar-text"]').contains('Are you sure you want to delete this menu entry? Deleting a menu entry will only remove the entry in the navigation. The page that is referenced by this menu entry will not be deleted and other menu entries will not be impacted.');
    hoverDeleteButton('menuEntry', 'externalWidgetOnPageLevelEntry');
    triggerDeleteButton('externalWidgetOnPageLevelEntry');
    cy.get('[data-cy="delete-confirmation-bar-text"]').contains('Are you sure you want to delete this menu entry? Deleting a menu entry will only remove the entry in the navigation. The page that is referenced by this menu entry will not be deleted and other menu entries will not be impacted.');
    cy.get('[data-cy="delete-confirmation-bar-text"]').should('have.css', 'text-overflow', 'ellipsis');
  });

  it('Category should remain expanded after it\'s menu item is deleted', () => {
    shared.createMenuEntryAPI('Test', 'T5', 'uiTestWidgets', newMenuEntry => {
      storeMenuEntry = newMenuEntry;
      cy.visit(`/uiTestWidgets?_m=${newMenuEntry.id}`);
      cy.wait(['@getPage', '@getData', '@getData', '@getData', '@getData', '@getData', '@getData', '@getData', '@getTOC']);
      cy.get('.ux-side-menu-toggle').click();
      openEditMode();
      hoverDeleteButton('menuEntry', newMenuEntry.id);
      triggerDeleteButton(newMenuEntry.id);
      cy.intercept({
        method: 'DELETE',
        path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/menuEntries/*`
      }).as('DeleteMenuEntry');
      cy.get(`[data-cy="confirm-confirmation-button-${newMenuEntry.id}"]`).click();
      cy.wait('@DeleteMenuEntry');
      cy.bvdCheckToast('Instance removed successfully');
      cy.get('[data-cy="navigation-category-T5"] button.ux-side-menu-item-expanded');
    });
  });

  after(() => {
    cy.bvdLogout();
    cy.bvdLogin();
    cy.request('GET', `/rest/${Cypress.env('API_VERSION')}/menuEntries`).then(() => {
      cy.getCookie('secureModifyToken').then(val => {
        cy.request({
          method: 'GET',
          url: `rest/${Cypress.env('API_VERSION')}/menuEntries`,
          headers: {
            'X-Secure-Modify-Token': val.value
          }
        }).then(response => {
          const menuEntries = response.body.data;
          const deleteMenuEntries = ['TestMenu', 'TestHover'];
          deleteMenuEntries.forEach(menuEntry => {
            const menuEntryObject = menuEntries.find(item => item.title === menuEntry);
            if (menuEntryObject) {
              cy.request({
                method: 'DELETE',
                url: `/rest/${Cypress.env('API_VERSION')}/menuEntries/${menuEntryObject.id}`,
                headers: {
                  'X-Secure-Modify-Token': val.value
                }
              });
            } else {
              cy.log(menuEntry, ' already removed');
            }
          });
        });
      });
    });
  });
});

describe('Side Navigation - Edit Mode (Super admin) Continued...', shared.defaultTestOptions, () => {
  beforeEach(() => {
    cy.intercept({
      method: 'POST',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/datasource/ws/data`
    }).as('getData');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pages/toc*`
    }).as('getTOC');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/uiTestPageProperty*`
    }).as('getTestPage');
  });

  it('Try deleting deleted menu', () => {
    cy.bvdLogin();
    shared.createMenuEntryAPI('NonExist', 'T5', 'uiTestPageProperty', newMenuEntry => {
      // will be stored if delete fails
      storeMenuEntry = newMenuEntry;
      cy.visit(`/uiTestPageProperty?_m=${newMenuEntry.id}`);
      cy.wait(['@getTestPage', '@getData', '@getData', '@getTOC']);
      cy.get('.ux-side-menu-toggle').click();
      openEditMode();
      hoverDeleteButton('menuEntry', newMenuEntry.id);
      triggerDeleteButton(newMenuEntry.id);
      cy.intercept({
        method: 'DELETE',
        path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/menuEntries/*`
      }).as('DeleteMenuEntryNonExist');
      // eslint-disable-next-line no-unused-vars
      cy.request('GET', `/rest/${Cypress.env('API_VERSION')}/appConfig/MyApp`).then(result => {
        cy.getCookie('secureModifyToken').then(val => {
          cy.request({
            method: 'GET',
            url: `/rest/${Cypress.env('API_VERSION')}/menuEntries/`,
            headers: {
              'X-Secure-Modify-Token': val.value
            }
          }).then(response => {
            const menuEntries = response.body.data;
            const menu = menuEntries.filter(menuEntry => menuEntry.title === 'NonExist');
            expect(menu[0].title).to.equal('NonExist');
            cy.request({
              method: 'DELETE',
              url: `/rest/${Cypress.env('API_VERSION')}/menuEntries/${menu[0].id}`,
              headers: {
                'X-Secure-Modify-Token': val.value
              }
            }).then(deletedMenu => {
              expect(deletedMenu.status).to.equal(200);
              cy.get(`[data-cy="confirm-confirmation-button-${newMenuEntry.id}"]`).click();
              cy.wait('@DeleteMenuEntryNonExist');
              cy.get('[data-cy="mondrianModalDialog"]').contains('Failed to delete menu item');
              cy.intercept({
                method: 'GET',
                path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pages/toc*`
              }).as('tocUpdate');
              cy.get('[data-cy="mondrianModalDialogButton"]').click();
              cy.wait('@tocUpdate');
            });
          });
        });
      });
    });
  });

  afterEach(() => {
    cy.bvdLogout();
  });
});

describe('Side Navigation - Edit Mode (Permissions)', shared.defaultTestOptions, () => {
  beforeEach(() => {
    cy.intercept({
      method: 'POST',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/datasource/ws/data`
    }).as('getData');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/uiTestWidgets*`
    }).as('getPage');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pages/toc*`
    }).as('getTOC');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/uiTestPageProperty*`
    }).as('getTestPage');
    cy.bvdLogin();
  });

  it('Should not show edit mode if user has no fullControl permission on any menu item', () => {
    const roleWithPartlyControlMenuEntryPermissions = { ...data,
      permission: [
        // eslint-disable-next-line camelcase
        { operation_key: 'View', resource_key: 'menu<>Category-T2' },
        // eslint-disable-next-line camelcase
        { operation_key: 'View', resource_key: 'default_action<>All' }
      ]};
    cy.request('GET', `/rest/${Cypress.env('API_VERSION')}/appConfig/MyApp`).then(() => {
      cy.getCookie('secureModifyToken').then(val => {
        cy.request({
          method: 'POST',
          url: `/rest/${Cypress.env('API_VERSION')}/role`,
          body: roleWithPartlyControlMenuEntryPermissions,
          headers: {
            'X-Secure-Modify-Token': val.value
          }
        }).then(response => {
          expect(response.body.role.name).to.equal('testRole');
          expect(response.body.role.description).to.equal('For foundation tester');
          cy.bvdLogout();
          cy.bvdLogin(nonAdminuserName, nonAdminuserPwd);
          cy.visit('/uiTestWidgets');
          cy.wait(['@getPage', '@getData', '@getTOC']);
          cy.get('.ux-side-menu-toggle').click();
          cy.get('[data-cy="navigation-category-T2"]').click();
          cy.get('[data-cy="side-nav-more-button"]').should('exist');
          cy.get('[data-cy="open-edit-mode-button"]').should('not.exist');
        });
      });
    });
  });

  it('Should not show hover delete buttons on no permission', () => {
    const roleWithPartlyControlMenuEntryPermissions = { ...data,
      permission: [
        // eslint-disable-next-line camelcase
        { operation_key: 'FullControl', resource_key: 'menu<>Category-T3' },
        // eslint-disable-next-line camelcase
        { operation_key: 'View', resource_key: 'menu<>Category-T8' },
        // eslint-disable-next-line camelcase
        { operation_key: 'FullControl', resource_key: 'default_action<>All' }
      ]};
    cy.request('GET', `/rest/${Cypress.env('API_VERSION')}/appConfig/MyApp`).then(() => {
      cy.getCookie('secureModifyToken').then(val => {
        cy.request({
          method: 'POST',
          url: `/rest/${Cypress.env('API_VERSION')}/role`,
          body: roleWithPartlyControlMenuEntryPermissions,
          headers: {
            'X-Secure-Modify-Token': val.value
          }
        }).then(response => {
          expect(response.body.role.name).to.equal('testRole');
          expect(response.body.role.description).to.equal('For foundation tester');
          cy.bvdLogout();
          cy.bvdLogin(nonAdminuserName, nonAdminuserPwd);
          cy.visit('/uiTestWidgets');
          cy.wait(['@getPage', '@getData', '@getTOC']);
          cy.get('.ux-side-menu-toggle').click();
          cy.get('[data-cy="navigation-category-T2"]').click();
          openEditMode();
          cy.get('[data-cy="navigation-category-T3"]').click();
          // button wrapper should be visible on hover/mouseenter. As this is not working -> click on it
          cy.get('[data-cy="navigation-menuEntry-testChartErrorsEntry"]').click();
          cy.get('[data-cy="side-nav-delete-testChartErrorsEntry-button-wrapper"]');
          cy.get('[data-cy="navigation-category-T8"]').click();
          cy.get('[data-cy="navigation-menuEntry-fullPageWidgetEntry"]').click();
          cy.get('[data-cy="side-nav-delete-fullPageWidgetEntry-button-wrapper"]').should('not.exist');
        });
      });
    });
  });

  it('delete menu item with "view only" permission', () => {
    shared.createMenuEntryAPI('onlyItem', 'T5', 'uiTestPageProperty', newMenuEntry => {
      storeMenuEntry = newMenuEntry;
      cy.visit(`/uiTestPageProperty?_m=${newMenuEntry.id}`);
      cy.wait(['@getTestPage', '@getData', '@getData', '@getTOC']);
      // eslint-disable-next-line no-unused-vars
      cy.request('GET', `/rest/${Cypress.env('API_VERSION')}/appConfig/MyApp`).then(result => {
        cy.getCookie('secureModifyToken').then(val => {
          cy.request({
            method: 'GET',
            url: `/rest/${Cypress.env('API_VERSION')}/menuEntries/`,
            headers: {
              'X-Secure-Modify-Token': val.value
            }
          }).then(response => {
            const menuEntries = response.body.data;
            const menu = menuEntries.filter(menuEntry => menuEntry.title === 'onlyItem');
            expect(menu[0].title).to.equal('onlyItem');
            const role = { ...data,
              permission: [
                // eslint-disable-next-line camelcase
                { operation_key: 'View', resource_key: `menu<>Item-${menu[0].id}` },
                // eslint-disable-next-line camelcase
                { operation_key: 'View', resource_key: 'default_action<>All' }
              ]};
            cy.request({
              method: 'POST',
              url: `/rest/${Cypress.env('API_VERSION')}/role`,
              body: role,
              headers: {
                'X-Secure-Modify-Token': val.value
              }
            }).then(resRole => {
              expect(resRole.body.role.name).to.equal('testRole');
              expect(resRole.body.role.description).to.equal('For foundation tester');
              cy.bvdLogout();
              cy.bvdLogin(nonAdminuserName, nonAdminuserPwd);
              cy.intercept({
                method: 'GET',
                path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/uiTestPageProperty*`
              }).as('getTestPage');
              cy.visit('/uiTestPageProperty');
              cy.wait(['@getTestPage', '@getData', '@getTOC']);
              cy.get('.ux-side-menu-toggle').click();
              cy.get('[data-cy="navigation-category-T2"]').click();
              cy.get('[data-cy="navigation-category-T5"]').click();
              cy.get(`[data-cy=thirdLevelItem-${newMenuEntry.id}]`);
              cy.get('[data-cy="side-nav-more-button"]').should('exist');
              cy.get('[data-cy="open-edit-mode-button"]').should('not.exist');
            });
          });
        });
      });
    });
  });

  afterEach(() => {
    cy.bvdLogout();
    cy.bvdLogin();
    cy.request('GET', `/rest/${Cypress.env('API_VERSION')}/appConfig/MyApp`).then(() => {
      cy.getCookie('secureModifyToken').then(val => {
        const getData = { ...data, permission: []};
        cy.request({
          method: 'GET',
          url: `/rest/${Cypress.env('API_VERSION')}/role`,
          body: getData,
          headers: {
            'X-Secure-Modify-Token': val.value
          }
        }).then(response => {
          const roles = response.body.role_list.role;
          const tester = roles.find(item => item.name === 'testRole');
          cy.request({
            method: 'DELETE',
            url: `/rest/${Cypress.env('API_VERSION')}/role/${tester.id}`,
            headers: {
              'X-Secure-Modify-Token': val.value
            }
          });
        });
      });
    });
    if (storeMenuEntry) {
      shared.deleteMenuEntry(storeMenuEntry.id);
      storeMenuEntry = {};
    }
  });
});
