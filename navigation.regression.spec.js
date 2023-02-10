// <reference types="Cypress" />
const shared = require('../../shared/shared');

describe('Navigation', shared.defaultTestOptions, () => {
  beforeEach(() => {
    cy.intercept({
      method: 'POST',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/datasource/ws/data`
    }).as('getWebapiData');
    cy.intercept({
      method: 'POST',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pages/metadata`
    }).as('getPagesMetadata');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/uiTestWidgets*`
    }).as('getPage');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/uiTestHasTimeCtx*`
    }).as('getCtxPage');
    cy.bvdLogin();
    cy.visit('/uiTestWidgets?_m=testWidgetsEntry');
    cy.wait(['@getPage', '@getWebapiData', '@getWebapiData', '@getWebapiData']);
    cy.get('[data-cy=spinnerOverlay]').should('not.be.visible');
  });

  it('should create initial time context on initial load', () => {
    cy.location().should(loc => {
      expect(loc.search).contains('&_tft=RL2hours');
    });
  });

  it('should create initial default context on initial load', () => {
    cy.bvdSideNavClick('navigation-category-T2', ['navigation-category-T3'], 'navigation-menuEntry-defaultContextEntry');
    cy.wait('@getWebapiData');

    cy.get('[data-cy="navigation-menuEntry-defaultContextEntry"] button').should('have.class', 'ux-side-menu-item-active');
    cy.location().should(loc => {
      const locSearchParams = loc.search.split('?')[1].split('&');
      expect(locSearchParams.length).to.eq(3);
      expect(loc.search).to.include('_m');
      expect(loc.search).to.include('tenant');
      expect(loc.search).to.include('_ctx');
    });
  });

  it('should create initial time context on side navigation', () => {
    cy.bvdSideNavClick('navigation-category-T2', ['navigation-category-T3'], 'navigation-menuEntry-hasTimeContextEntry');
    cy.get('[data-cy="navigation-menuEntry-hasTimeContextEntry"] button').should('have.class', 'ux-side-menu-item-active');
    cy.location().should(loc => {
      expect(loc.search).to.include('_m');
    });
    cy.get('[data-cy=context-filter-menu]').contains('LAST: 2 Hours');
  });

  it('should create initial time context on reload without query params', () => {
    cy.visit('/uiTestWidgets');
    cy.wait('@getPage');
    cy.wait('@getWebapiData');

    cy.location().should(loc => {
      expect(loc.search).contains('&_tft=RL2hours');
    });
  });

  it('should reload old context state on breadcrumb back', () => {
    cy.get('simple-list').contains('loadgen.mambo.net').click();
    cy.wait(['@getPagesMetadata', '@getWebapiData']);
    cy.get('#split-button-toggle').click();
    cy.get('[data-cy="drilldown-uiTestPage"]').click();
    cy.url().should('include', 'uiTestPage');
    cy.wait(['@getPagesMetadata', '@getWebapiData']);
    cy.get('simple-list').contains('oba.mambo.net').click();

    cy.get('[data-cy=breadcrumb-uiTestWidgets]').click();
    cy.url().should('include', 'uiTestWidgets');
    cy.wait(['@getPagesMetadata', '@getWebapiData']);

    cy.get('[data-cy="contextLabelType-Host"]').contains('loadgen.mambo.net');
    cy.get('[data-cy="contextItem-oba.mambo.net"]').should('not.exist');

    cy.location().should(loc => {
      expect(loc.search).contains('&_tft=RL2hours');
    });
  });

  it('reset breadcrumbs on side nav navigation', () => {
    cy.bvdSideNavClick('navigation-category-T2', ['navigation-category-T3'], 'navigation-menuEntry-defaultContextEntry');
    cy.wait('@getWebapiData');
    cy.get('[data-cy=breadcrumb-uiTestDefaultCtx]');
    cy.get('[data-cy=breadcrumb-uiTestWidgets]').should('not.exist');
  });
});

