const shared = require('../../shared/shared');

describe('New Page action', shared.defaultTestOptions, () => {
  beforeEach(() => {
    cy.intercept({
      method: 'POST',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/datasource/ws/data`
    }).as('getWebapiData');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/licenseBasedPage*`
    }).as('getPage');
    cy.bvdLogin();
    cy.visit('/licenseBasedPage');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/uiTestActions*`
    }).as('getTestActionsPage');
    cy.wait(['@getPage', '@getWebapiData']);
  });

  beforeEach(() => {
    cy.preserveSessionCookie();
  });

  it('should open new page on new page action click', () => {
    cy.get('[data-cy="page-action-button"]').click();
    cy.get('[data-cy="page-action-item-newPage"]').click();
    cy.url().then(url => {
      const params = url.split('?')[1];
      const paramItems = params.split('&');
      expect(paramItems.length).equal(4);
    });
    cy.get('[data-cy="widget-types"]');
    cy.get('[data-cy="widget-type-dataVisualization"]').click();
    cy.get('ux-dashboard-widget').should('have.length', 1);
    cy.get('ux-dashboard-widget').contains('<New Chart>');
    cy.get('[data-cy="side-panel-header"]');
    cy.get('[data-cy="breadcrumb-title-<New>"]');
    cy.get('[data-cy="mondrian-breadcrumbs"] .mondrianBreadcrumbItem').should('have.length', 1);
  });

  it('should close edit side panel when navigated to different page', () => {
    cy.bvdSideNavClick('navigation-category-T2', ['navigation-category-T4'], 'navigation-menuEntry-testActionsEntry');
    cy.wait(['@getTestActionsPage', '@getWebapiData', '@getWebapiData']);
    cy.get('[data-cy="side-panel-header"]').should('not.exist');
  });
});
