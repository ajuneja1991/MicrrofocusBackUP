const shared = require('../../shared/shared');

describe('Print UIF Page', () => {
  beforeEach(() => {
    cy.intercept({
      method: 'POST',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/datasource/ws/data`
    }).as('getData');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/chartLegendsPage*`
    }).as('getChartLegendsPage');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/notification`
    }).as('getNotification');
    cy.intercept({
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/widgets/*`
    }).as('getWidget');
    cy.intercept({
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/session/user`
    }).as('getUser');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/notification/count`
    }).as('getCount');
    cy.bvdLogin();
    cy.visit('/chartLegendsPage');
    cy.wait(['@getChartLegendsPage', '@getData']);
    cy.setCssMedia('screen');
  });

  it('Should check for side panel, mast head, context view, page actions and dashboard widget toolbar should not be visible when printing the page', () => {
    cy.setCssMedia('print');
    cy.get('div.ux-side-menu-panel').should('not.be.visible');
    cy.get('div.ux-page-header').should('not.be.visible');
    cy.get('div.page-actions').should('not.be.visible');
    cy.get('div.dashboard-widget-toolbar').should('not.be.visible');
    cy.setCssMedia('screen');
    cy.get('div.ux-side-menu-panel').should('be.visible');
    cy.get('div.ux-page-header').should('be.visible');
    cy.get('div.context-filter-menu').should('be.visible');
    cy.get('div.page-actions').should('be.visible');
    cy.get('div.dashboard-widget-toolbar').should('be.visible');
  });

  it('Should not show the tooltip in print mode', () => {
    cy.wait(['@getCount', '@getCount']);
    // eslint-disable-next-line cypress/no-force
    cy.get('#ui-test-complex-chart').find('echarts-chart').find('svg').find('g').eq(1).trigger('mousedown', { force: true })
      .trigger('mousemove', 400, 200, { force: true })
      .trigger('mouseup', { force: true });
    cy.get('[data-cy="echartTooltip"]');
    cy.setCssMedia('print');
    cy.get('.echartTooltip').should('not.be.visible');
  });

  it('Should not show the div menu in print mode', () => {
    cy.get('[data-cy="page-action-button"]').click();
    cy.get('div.ux-menu').should('be.visible');
    cy.setCssMedia('print');
    cy.get('div.ux-menu').should('not.be.visible');
  });

  it('Should click on notification bell and should check notification banner not shown in print mode', () => {
    cy.get('[data-cy="bell-button"]').click();
    cy.wait('@getNotification');
    cy.get('div.notification').should('be.visible');
    cy.setCssMedia('print');
    cy.get('div.notification').should('not.be.visible');
  });

  it('Should check if side panel are not show in print mode', () => {
    cy.get('[data-cy="page-action-button"]').click();
    cy.get('[data-cy="page-action-item-export"]').click();
    cy.wait(['@getWidget', '@getUser']);
    cy.get('ux-side-panel').should('be.visible');
    cy.setCssMedia('print');
    cy.get('ux-side-panel').should('not.be.visible');
  });
});
