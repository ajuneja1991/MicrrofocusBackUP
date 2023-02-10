// <reference types="Cypress" />
const shared = require('../../shared/shared');
import 'cypress-iframe';

describe('Demo Sanity', shared.defaultTestOptions, () => {
  beforeEach(() => {
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pages/toc*`
    }).as('getTOC');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/CHOSystemMonitoring*`
    }).as('getCHOPage');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/allChartsPage*`
    }).as('getAllChartsPage');
    cy.intercept({
      method: 'POST',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/datasource/prometheus/data`
    }).as('getPromData');
    cy.intercept({
      method: 'POST',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/datasource/ws/data`
    }).as('getData');
    cy.bvdLogin();
    cy.visit('/');
    cy.wait(['@getTOC']);
  });

  afterEach(() => {
    cy.bvdLogout();
  });

  it('Static Home Page should be loaded', () => {
    cy.url().should('eq', `${Cypress.config().baseUrl}/?tenant=Provider`);
    cy.get('[data-cy="spinnerOverlay"]').should('not.be.visible');
    cy.get('#cardView > cardview-widget');
    cy.get('[data-cy="basic-home-page-group-Dashboards"]');
  });

  it('Parent categories of bvd in uif should exist in the side navigation', () => {
    cy.get('.ux-side-menu-toggle').click();
    cy.get('[data-cy="navigation-category-__base_self_mon"] > .ux-side-menu-item').click();
    cy.get('[data-cy="navigation-category-__base_self_mon"] > .ux-side-menu-item').should('have.class', 'ux-focus-indicator');
    cy.get('[data-cy="navigation-category-0_L2_SA_StakeHolderDashboards"] > .ux-side-menu-item').should('have.class', 'ux-focus-indicator');
    cy.get('[data-cy="navigation-category-1_L0_SA_Administration"] > .ux-side-menu-item').click();
    cy.get('[data-cy="navigation-category-0_L1_SA_AdminDashboards"] > .ux-side-menu-item').click();
    cy.get('[data-cy="navigation-menuEntry-2_L2_SA_Schedules"]');
    cy.get('[data-cy="navigation-menuEntry-2_L3_SA_DataCollector"]');
    cy.get('[data-cy="navigation-category-1_L2_SA_StakeHolderAdminPages"]').click();
    cy.get('[data-cy="navigation-menuEntry-0_L3_SA_Dashboard"]');
    cy.get('[data-cy="navigation-menuEntry-3_L3_SA_Resources"]');
    cy.get('[data-cy="navigation-menuEntry-1_L3_SA_Role"]');
    cy.get('[data-cy="navigation-category-__base_setup_config"]').click();
    cy.get('[data-cy="navigation-menuEntry-4_L3_SA_Setting"]');
    cy.get('.ux-side-menu-toggle').click();
  });

  it('Dashboards should be loaded inside UIF as a reporting admin page', () => {
    cy.get('.ux-side-menu-toggle').click();
    cy.get('[data-cy="navigation-category-1_L0_SA_Administration"] > .ux-side-menu-item').click();
    cy.get('[data-cy="navigation-category-0_L1_SA_AdminDashboards"] > .ux-side-menu-item').click();
    cy.get('[data-cy="navigation-category-1_L2_SA_StakeHolderAdminPages"]').click();
    cy.get('[data-cy="navigation-menuEntry-0_L3_SA_Dashboard"]').click();
    cy.get('.mondrian-layout > mondrian-view').should('have.css', 'padding', '24px');
    cy.get('[data-cy="context-filter-content"]').should('not.exist');
    cy.frameLoaded('[data-cy="mondrian-iframe-Dashboards"]').iframeCustom().then(() => {
      cy.get('[data-cy="page-action-button"]').should('not.exist');
      cy.get('[data-cy="action-button"]').should('not.exist');
      cy.iframe().find('button[title="Edit"]');
      cy.iframe().find('label').then(labelElement => {
        console.log(labelElement.text());
      });
      cy.iframe().find('.element-item').its('length').should('be.gt', 1);
      cy.iframe().find('i.plusIcon').first().click();
      cy.iframe().find('.modal-title').should('contain', 'Add New Dashboard or Template');
      cy.iframe().find('#cancel').click();
    });
  });

  it('Bvd reports should be loaded in an iframe', () => {
    cy.get('.ux-side-menu-toggle').click();
    cy.get('[data-cy="navigation-category-0_L2_SA_StakeHolderDashboards"] > .ux-side-menu-item').should('have.class', 'ux-focus-indicator').click();
    cy.get('[data-cy="navigation-menuEntry-Welcome_0_L2_SA_StakeHolderDashboards"]').click();
    cy.frameLoaded('[data-cy="mondrian-iframe-bvdReporting"]').iframeCustom().then(() => {
      cy.get('[data-cy="page-action-button"]').should('not.exist');
      cy.get('[data-cy="breadcrumb-title-Welcome"');
      cy.get('span[class="mondrianBreadcrumbData"] > [class="qtm-font-icon qtm-icon-app-business-value-dashboard"]');
      cy.get('[data-cy="action-button"]').click();
      cy.get('[data-cy="action-button-edit"]').should('not.exist');
      cy.get('[data-cy="action-button-duplicateWidget"]').should('not.exist');
      cy.get('[data-cy="action-button-removeWidget"]').should('not.exist');
    });
  });

  it('CHO system monitoring page should be loaded from side navigation', () => {
    cy.get('.ux-side-menu-toggle').click();
    cy.get('[data-cy="navigation-category-__base_self_mon"] > .ux-side-menu-item').click();
    cy.get('[data-cy="navigation-category-__base_self_mon"] > .ux-side-menu-item').should('have.class', 'ux-focus-indicator');
    cy.get('[data-cy="navigation-menuEntry-cHOSystemItem"] > .ux-side-menu-item').should('have.class', 'ux-focus-indicator').click();
    cy.wait(['@getCHOPage', '@getPromData', '@getTOC']);
    cy.get('ux-dashboard').should('have.length', 1);
    cy.get('ux-dashboard-widget').should('have.length', 19);
  });

  it('All Charts page should be loaded', () => {
    cy.visit('/allChartsPage');
    cy.wait(['@getAllChartsPage', '@getData', '@getTOC']);
    cy.get('ux-dashboard-widget').should('have.length', 10);
  });
});
