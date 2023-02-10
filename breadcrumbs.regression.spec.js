// <reference types="Cypress" />
const shared = require('../../shared/shared');

describe('Breadcrumbs', shared.defaultTestOptions, () => {
  beforeEach(() => {
    cy.intercept({
      method: 'POST',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/datasource/ws/data`
    }).as('getWebServiceData');
    cy.intercept({
      method: 'POST',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pages/metadata`
    }).as('getPagesMetadata');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/*`
    }).as('getPagesWithComponents');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pages/toc*`
    }).as('getTOC');
    cy.bvdLogin();
    cy.visit('uiTestWidgets?_ctx=~(~(type~%27host~id~%27loadgen.mambo.net~name~%27loadgen.mambo.net))&_s=1634801280000&_e=1634808480000&_tft=A');
    cy.wait(['@getPagesWithComponents', '@getPagesMetadata', '@getWebServiceData', '@getWebServiceData', '@getWebServiceData', '@getWebServiceData', '@getWebServiceData', '@getWebServiceData', '@getWebServiceData', '@getTOC']);
    cy.get('[data-cy=spinnerOverlay]').should('not.be.visible');
  });

  afterEach(() => {
    cy.bvdLogout();
  });

  it('should check for breadcrumb existence', () => {
    cy.get('breadcrumbs').contains('Widgets');
  });

  it('should create breadcrumb on navigation', () => {
    cy.get('[data-cy="drillDownButton"]').click();
    cy.get('[data-cy="drilldown-uiTestPage"]').click();
    cy.wait(['@getPagesMetadata', '@getWebServiceData', '@getWebServiceData', '@getWebServiceData']);
    cy.get('[data-cy="breadcrumb-uiTestWidgets"]');
    cy.get('[data-cy="breadcrumb-uiTestPage"]');
  });

  it('should navigate back in breadcrumbs', () => {
    cy.get('[data-cy="drillDownButton"]').click();
    cy.get('[data-cy="drilldown-uiTestPage"]').click();
    cy.url().should('include', 'uiTestPage');
    cy.wait(['@getPagesMetadata', '@getWebServiceData', '@getWebServiceData', '@getWebServiceData']);
    cy.get('simple-list').contains('oba.mambo.net').click();
    cy.get('[data-cy="breadcrumb-uiTestWidgets"]').click();
    cy.wait(['@getPagesMetadata', '@getWebServiceData', '@getWebServiceData', '@getWebServiceData']);
    cy.get('[data-cy="contextLabelType-Host"]').contains('loadgen.mambo.net');
    cy.get('[data-cy="contextLabelType-Host"]').should('not.contain', 'oba.mambo.net');
  });

  it('should not do anything when clicking the same page breadcrumb', () => {
    cy.get('[data-cy="breadcrumb-uiTestWidgets"]').click();
    cy.get('[data-cy="contextLabelType-Host"]').contains('loadgen.mambo.net');
  });

  it('Selecting any page from side navigation panel should remove all other pages from breadcrumb except the selected page', () => {
    cy.get('[data-cy="drillDownButton"]').click();
    cy.get('[data-cy="drilldown-uiTestTimeInterval"]').click();
    cy.wait(['@getPagesWithComponents', '@getPagesMetadata', '@getWebServiceData']);
    cy.get('[data-cy="breadcrumb-uiTestWidgets"]');
    cy.get('[data-cy="breadcrumb-uiTestTimeInterval"]');
    cy.get('button.ux-side-menu-toggle').click();
    cy.get('[data-cy="navigation-category-T2"] button').click();
    cy.get('[data-cy="navigation-category-T4"] button').click();
    cy.get('[data-cy="navigation-menuEntry-testActionsEntry"] button').click();
    cy.wait(['@getPagesMetadata', '@getWebServiceData']);
    cy.get('[data-cy="breadcrumb-uiTestActions"]');
    cy.get('[data-cy="breadcrumb-uiTestWidgets"]').should('not.exist');
    cy.get('[data-cy="breadcrumb-uiTestTimeInterval"]').should('not.exist');
  });

  it('should show a tooltip for breadcrumbs having long title', () => {
    cy.get('[data-cy="drillDownButton"]').click();
    cy.get('[data-cy="drilldown-uiTestLongPageName"]').click();
    cy.wait(['@getPagesMetadata', '@getWebServiceData']);
    cy.url().should('include', 'uiTestLongPageName');
    cy.get('[data-cy="breadcrumb-uiTestLongPageName"]').trigger('mouseenter');
    cy.get('[aria-describedby*=ux-tooltip').contains('The title of the page is very long : The title of the page is very long');
  });
});

describe('Breadcrumbs - Responsiveness of breadcrumbs', shared.defaultTestOptions, () => {
  beforeEach(() => {
    cy.intercept({
      method: 'POST',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/datasource/ws/data`
    }).as('getWebServiceData');
    cy.intercept('POST', `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pages/metadata`, {
      body: {
        error: false,
        message: 'OK',
        data: [
          { id: 'bc-test-page-a', title: 'Breadcrumb Test Page A' },
          { id: 'bc-test-page-b', title: 'Breadcrumb Test Page B' },
          { id: 'bc-test-page-c', title: 'Breadcrumb Test Page C' },
          { id: 'bc-test-page-d', title: 'Breadcrumb Test Page D' },
          { id: 'bc-test-page-e', title: 'Breadcrumb Test Page E' },
          { id: 'bc-test-page-f', title: 'Breadcrumb Test Page F' },
          { id: 'bc-test-page-g', title: 'Breadcrumb Test Page G' },
          { id: 'bc-test-page-h', title: 'Breadcrumb Test Page H' }
        ]
      }
    }).as('getPagesMetadata');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/*`
    }).as('getPagesWithComponents');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pages/toc*`
    }).as('getTOC');
    cy.bvdLogin();
    cy.visit('uiTestWidgets?_ctx=~(~(type~%27host~id~%27loadgen.mambo.net~name~%27loadgen.mambo.net))&_s=1634801280000&_e=1634808480000&_tft=A');
    cy.wait(['@getPagesWithComponents', '@getPagesMetadata', '@getWebServiceData', '@getWebServiceData', '@getWebServiceData', '@getWebServiceData', '@getWebServiceData', '@getWebServiceData', '@getWebServiceData', '@getTOC']);
    cy.get('[data-cy=spinnerOverlay]').should('not.be.visible');
  });

  afterEach(() => {
    cy.bvdLogout();
  });

  it('Page flow in the bread crumb must not be overlapped with admin button', () => {
    cy.drillDownToManyPagesTillEllipsisAppear();
    cy.get('[data-cy="user-button"]').should('be.visible');
  });

  it('Validate: after occurrence of ellipsis in breadcrumbs, on visiting the new page via URL,past breadcrumbs must not be shown in the page flow.', () => {
    cy.drillDownToManyPagesTillEllipsisAppear();
    cy.get('.mondrianBreadcrumbItem').eq(2).invoke('text').then(existingPageInBreadCrumb => {
      cy.visit('/allChartsPage');
      cy.wait(['@getPagesWithComponents', '@getTOC', '@getWebServiceData']);
      cy.get('.mondrianBreadcrumbItem').should('not.contain', existingPageInBreadCrumb);
      cy.url().should('not.include', 'loadgen.mambo.net');
      cy.get('[data-cy="breadcrumb-allChartsPage"]');
    });
  });
});

describe('Breadcrumbs title/icon validation', () => {
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
  });

  it('title and icon validation for menu entry and page', () => {
    // check data from the menu entry
    cy.visit('/pageBreadcrumb?_m=pageBreadcrumbMenuEntry1');
    cy.wait(['@getPage', '@getTOC', '@getTocOnlyFullControl']);
    cy.get('[data-cy="breadcrumb-title-First breadcrumb validation"]');
    cy.get('[data-cy="breadcrumb-icon-pageBreadcrumb"]').should('have.class', 'qtm-font-icon qtm-icon-favorite-filled');
    cy.title().should('include', 'First breadcrumb validation');

    // check data from the page when menuEntry is wrong
    cy.visit('/pageBreadcrumb?_m=wrongMenuEntry');
    cy.wait(['@getPage', '@getTOC', '@getTocOnlyFullControl']);
    cy.get('[data-cy="breadcrumb-title-Page for validation of Breadcrumb"]');
    cy.get('[data-cy="breadcrumb-icon-pageBreadcrumb"]').should('have.class', 'qtm-font-icon qtm-icon-dashboard');
    cy.title().should('include', 'Page for validation of Breadcrumb');

    // check data from the page
    cy.visit('/pageBreadcrumb');
    cy.wait(['@getPage', '@getTOC', '@getTocOnlyFullControl']);
    cy.get('[data-cy="breadcrumb-title-Page for validation of Breadcrumb"]');
    cy.get('[data-cy="breadcrumb-icon-pageBreadcrumb"]').should('have.class', 'qtm-font-icon qtm-icon-dashboard');
    cy.title().should('include', 'Page for validation of Breadcrumb');
  });

  afterEach(() => {
    cy.bvdLogout();
  });
});

describe('Retain history', () => {
  beforeEach(() => {
    cy.intercept({
      method: 'POST',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/datasource/ws/data`
    }).as('getWebServiceData');
    cy.intercept({
      method: 'POST',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pages/metadata`
    }).as('getPagesMetadata');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/*`
    }).as('getPagesWithComponents');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pages/toc*`
    }).as('getTOC');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/uiTestWidgetDataExplorer*`
    }).as('getDataExplorerPageData');
    cy.bvdLogin();
  });

  afterEach(() => {
    cy.bvdLogout();
  });

  it('should retain the breadcrumb history when logging out and logging in again', () => {
    cy.visit('/uiTestWidgetsPageLayout');
    cy.wait(['@getPagesWithComponents', '@getWebServiceData', '@getWebServiceData', '@getTOC']);
    cy.get('[data-cy=spinnerOverlay]').should('not.be.visible');
    cy.get('simple-list').contains('loadgen.mambo.net').click();
    cy.wait(['@getPagesMetadata', '@getWebServiceData']);
    cy.get('[data-cy="drillDownButton"]').click();
    cy.get('[data-cy="drilldown-uiTestActions"]').click();
    cy.wait(['@getPagesMetadata', '@getPagesMetadata', '@getPagesWithComponents', '@getWebServiceData', '@getWebServiceData']);
    cy.get('[data-cy="drillDownButton"]').should('have.attr', 'aria-expanded').and('eq', 'false');
    cy.url().should('contain', '_s');
    cy.get('.ux-menu.drilldown-menu').should('not.exist');
    cy.get('[data-cy="drillDownButton"]').click();
    cy.get('[data-cy="drilldown-uiTestTimeInterval"]').click();
    cy.wait(['@getPagesMetadata', '@getPagesMetadata', '@getPagesWithComponents', '@getWebServiceData']);
    cy.get('[data-cy="breadcrumb-uiTestTimeInterval"]');
    cy.bvdUiLogout();
    cy.bvdUiLogin();
    cy.url().should('include', 'uiTestTimeInterval').and('include', 'loadgen.mambo.net');
    cy.wait(['@getPagesMetadata', '@getPagesMetadata', '@getPagesWithComponents', '@getWebServiceData', '@getTOC']);
    // validate that re-login action should not redirect the user default page
    cy.get('[data-cy="breadcrumb-uiTestWidgets"]').should('not.exist');
    // validate for the pre-logout breadcrumb history
    cy.get('[data-cy="breadcrumb-uiTestWidgetsPageLayout"]');
    cy.get('[data-cy="breadcrumb-uiTestTimeInterval"]');
  });

  it('should retain the breadcrumb history when logging out and logging in again when the context has a different order in the URL', () => {
    cy.visit('/uiTestNotification');
    cy.wait(['@getPagesWithComponents', '@getWebServiceData', '@getTOC']);
    cy.get('[data-cy=spinnerOverlay]').should('not.be.visible');
    cy.get('[data-cy="obac.mambo.net"]').click();
    cy.wait(['@getPagesMetadata']);
    cy.get('[data-cy="drillDownButton"]').click();
    cy.get('[data-cy="drilldown-uiTestWidgetDataExplorer"]').click();
    cy.wait(['@getPagesMetadata', '@getPagesMetadata', '@getPagesWithComponents']);
    cy.get('[data-cy="breadcrumb-uiTestWidgetDataExplorer"]');
    cy.bvdUiLogout();
    cy.bvdUiLogin();
    cy.url().should('include', 'uiTestWidgetDataExplorer').and('include', 'obac.mambo.net');
    cy.wait(['@getPagesMetadata', '@getTOC', '@getPagesWithComponents']);
    cy.get('[data-cy="breadcrumb-uiTestNotification"]');
    cy.get('[data-cy="breadcrumb-uiTestWidgetDataExplorer"]');
    cy.get('[data-cy="contextLabelType-Host"]').contains('obac.mambo.net');
  });

  it('should not change anything when reloading the same URL', () => {
    cy.visit('/uiTestNotification');
    cy.wait(['@getPagesWithComponents', '@getWebServiceData']);
    cy.get('[data-cy=spinnerOverlay]').should('not.be.visible');
    cy.get('[data-cy="loadgen.mambo.net"]').click();
    cy.wait(['@getPagesMetadata']);
    cy.get('[data-cy="drillDownButton"]').click();
    cy.get('[data-cy="drilldown-uiTestWidgetDataExplorer"]').click();
    cy.wait(['@getDataExplorerPageData', '@getPagesMetadata']);
    cy.get('[data-cy="breadcrumb-uiTestWidgetDataExplorer"]');
    cy.reload();
    cy.wait(['@getDataExplorerPageData', '@getPagesMetadata']);
    cy.get('[data-cy="breadcrumb-uiTestNotification"]');
    cy.get('[data-cy="breadcrumb-uiTestWidgetDataExplorer"]');
    cy.get('[data-cy="contextLabelType-Host"]').contains('loadgen.mambo.net');
  });

  it('should reset context and breadcrumbs when loading a new page', () => {
    cy.visit('/uiTestNotification');
    cy.wait(['@getPagesWithComponents', '@getWebServiceData']);
    cy.get('[data-cy=spinnerOverlay]').should('not.be.visible');
    cy.get('[data-cy="loadgen.mambo.net"]').click();
    cy.wait(['@getPagesMetadata']);
    cy.get('[data-cy="drillDownButton"]').click();
    cy.get('[data-cy="drilldown-uiTestWidgetDataExplorer"]').click();
    // Loading a different page should clear the history and context
    cy.visit('/uiTestWidgets');
    cy.wait(['@getWebServiceData']);
    cy.url().should('not.include', 'loadgen.mambo.net');
    cy.get('[data-cy="breadcrumb-uiTestWidgets"]');
    cy.get('[data-cy="breadcrumb-uiTestNotification"]').should('not.exist');
    cy.get('[data-cy="breadcrumb-uiTestWidgetDataExplorer"]').should('not.exist');
    cy.get('[data-cy="contextItem-loadgen.mambo.net"]').should('not.exist');
  });

  it('browser back button testing', () => {
    cy.visit('/uiTestNotification');
    cy.wait(['@getPagesWithComponents', '@getWebServiceData', '@getTOC']);
    cy.get('[data-cy=spinnerOverlay]').should('not.be.visible');
    cy.get('[data-cy="obac.mambo.net"]').click();
    cy.wait(['@getPagesMetadata']);
    cy.get('[data-cy="drillDownButton"]').click();
    cy.get('[data-cy="drilldown-uiTestWidgetDataExplorer"]').click();
    cy.wait(['@getDataExplorerPageData', '@getPagesMetadata']);
    cy.get('[data-cy="drillDownButton"]').should('have.attr', 'aria-expanded').and('eq', 'false');
    cy.get('div.ux-menu.drilldown-menu').should('not.exist');
    cy.get('[data-cy="drillDownButton"]').click();
    cy.get('[data-cy="drilldown-metricBrowserDemo"]').click();
    cy.get('[data-cy="breadcrumb-uiTestNotification"]');
    cy.get('[data-cy="breadcrumb-uiTestWidgetDataExplorer"]');
    cy.get('[data-cy="breadcrumb-metricBrowserDemo"]');
    cy.go('back');
    cy.get('[data-cy="breadcrumb-uiTestNotification"]');
    cy.get('[data-cy="breadcrumb-uiTestWidgetDataExplorer"]');
    cy.get('[data-cy="breadcrumb-metricBrowserDemo"]').should('not.exist');
    cy.go('back');
    cy.wait(['@getPagesMetadata', '@getPagesWithComponents', '@getWebServiceData']);
    cy.url().should('not.include', '_s');
    cy.get('[data-cy="breadcrumb-uiTestNotification"]');
    cy.get('[data-cy="breadcrumb-uiTestWidgetDataExplorer"]').should('not.exist');
    cy.get('[data-cy="breadcrumb-metricBrowserDemo"]').should('not.exist');
    cy.get('button.ux-side-menu-toggle').click();
    cy.get('[data-cy="navigation-category-T2"] button').click();
    cy.get('[data-cy="navigation-category-T7"] button').click();
    cy.get('[data-cy="navigation-menuEntry-testPageCrudEntry"] button').click();
    cy.get('[data-cy="breadcrumb-uiTestPageCrud"]');
    cy.go('back');
    cy.get('[data-cy="breadcrumb-uiTestNotification"]');
    cy.get('[data-cy="breadcrumb-uiTestWidgetDataExplorer"]').should('not.exist');
    cy.get('[data-cy="breadcrumb-metricBrowserDemo"]').should('not.exist');
    cy.get('[data-cy="breadcrumb-uiTestPageCrud"]').should('not.exist');
  });

  it('browser back/forward button should retain breadcrumbs', () => {
    cy.visit('/uiTestNotification');
    cy.wait(['@getPagesWithComponents', '@getWebServiceData', '@getTOC']);
    cy.get('[data-cy=spinnerOverlay]').should('not.be.visible');
    cy.get('[data-cy="loadgen.mambo.net"]').click();
    cy.wait(['@getPagesMetadata']);
    cy.get('[data-cy="drillDownButton"]').click();
    cy.get('[data-cy="drilldown-uiTestWidgetDataExplorer"]').click();
    cy.wait(['@getDataExplorerPageData', '@getPagesMetadata']);
    cy.get('[data-cy="drillDownButton"]').should('have.attr', 'aria-expanded').and('eq', 'false');
    cy.get('div.ux-menu.drilldown-menu').should('not.exist');
    cy.get('[data-cy="breadcrumb-uiTestNotification"]');
    cy.get('[data-cy="breadcrumb-uiTestWidgetDataExplorer"]');
    cy.go('back');
    cy.get('[data-cy="breadcrumb-uiTestNotification"]');
    cy.wait(['@getPagesWithComponents', '@getWebServiceData', '@getPagesMetadata']);
    cy.get('[data-cy="breadcrumb-uiTestWidgetDataExplorer"]').should('not.exist');
    cy.get('[data-cy="drillDownButton"]').should('have.attr', 'aria-expanded').and('eq', 'false');
    cy.go('forward');
    cy.wait(['@getPagesMetadata', '@getDataExplorerPageData']);
    cy.get('[data-cy="breadcrumb-uiTestNotification"]');
    cy.get('[data-cy="breadcrumb-uiTestWidgetDataExplorer"]');
  });
});
