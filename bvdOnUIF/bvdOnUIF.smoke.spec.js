// <reference types="Cypress" />
/* eslint-disable camelcase */
const shared = require('../../shared/shared');
import 'cypress-iframe';

describe('BVD on UIF', shared.defaultTestOptions, () => {
  beforeEach(() => {
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pages/toc*`
    }).as('getTOC');
    cy.intercept({ method: 'POST', url: `${Cypress.env('BVD_CONTEXT_ROOT')}/rest/${Cypress.env('API_VERSION')}/dataCollector/test?format=json` }).as('runDataQuery');
    cy.intercept(`${shared.reportingContextRoot}/rest/${Cypress.env('API_VERSION')}/system`).as('reportingPageloadSystem');
    cy.intercept(`${shared.reportingContextRoot}/rest/${Cypress.env('API_VERSION')}/session/user`).as('reportingPageloadUser');
    cy.intercept(`${shared.reportingContextRoot}/rest/${Cypress.env('API_VERSION')}/dashboard/?type=dashboards,templates`).as('dashboardListLoad');
    cy.bvdLogin();
    cy.visit('/');
    cy.wait(['@getTOC']);
  });

  afterEach(() => {
    cy.bvdLogout();
  });

  it('Parent categories of bvd in uif should exist in the side navigation', () => {
    cy.get('.ux-side-menu-toggle').click();
    cy.get('[data-cy="firstLevelItem-1_L0_SA_Administration"]').click();
    cy.get('[data-cy="navigation-category-0_L1_SA_AdminDashboards"] > .ux-side-menu-item').click();
    cy.get('[data-cy="navigation-category-__base_setup_config"] > .ux-side-menu-item').click();
    cy.get('[data-cy="navigation-menuEntry-__base_roles"] > .ux-side-menu-item');
    cy.get('[data-cy="navigation-menuEntry-0_L3_SA_User_setting"] > .ux-side-menu-item');
    cy.get('[data-cy="navigation-menuEntry-4_L3_SA_Setting"] > .ux-side-menu-item');

    cy.get('[data-cy="navigation-category-0_L1_SA_AdminDashboards"] > .ux-side-menu-item').click();
    cy.get('[data-cy="navigation-menuEntry-2_L2_SA_Schedules"] > .ux-side-menu-item');
    cy.get('[data-cy="navigation-menuEntry-2_L3_SA_DataCollector"] > .ux-side-menu-item');
    cy.get('[data-cy="navigation-category-1_L2_SA_StakeHolderAdminPages"').click();
    cy.get('[data-cy="navigation-menuEntry-0_L3_SA_Dashboard"] > .ux-side-menu-item');
    cy.get('[data-cy="navigation-menuEntry-3_L3_SA_Resources"] > .ux-side-menu-item');
    cy.get('[data-cy="navigation-menuEntry-1_L3_SA_Role"] > .ux-side-menu-item');
    cy.get('.ux-side-menu-toggle').click();
  });

  it('Dashboards should be loaded inside UIF as a reporting admin page', () => {
    cy.get('.ux-side-menu-toggle').click();
    cy.wait(['@getTOC']);
    cy.get('[data-cy="firstLevelItem-1_L0_SA_Administration"]').click();
    cy.get('[data-cy="navigation-category-0_L1_SA_AdminDashboards"] > .ux-side-menu-item').click();
    cy.get('[data-cy="navigation-menuEntry-2_L2_SA_Schedules"] > .ux-side-menu-item');
    cy.get('[data-cy="navigation-menuEntry-2_L3_SA_DataCollector"] > .ux-side-menu-item');
    cy.get('[data-cy="navigation-category-1_L2_SA_StakeHolderAdminPages"').click();
    cy.get('[data-cy="navigation-menuEntry-0_L3_SA_Dashboard"] > .ux-side-menu-item').click();

    cy.get('.mondrian-layout > mondrian-view').should('have.css', 'padding', '24px');
    cy.get('[data-cy="context-filter-content"]').should('not.exist');
    cy.frameLoaded('[data-cy="mondrian-iframe-Dashboards"]').iframeCustom().then(() => {
      cy.wait(['@getTOC']);
      shared.waitForDataCalls({ name: '@reportingPageloadUser', count: 3 });
      cy.wait(['@reportingPageloadSystem', '@dashboardListLoad']);
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

  it('Predefined queries should be loaded inside UIF as a reporting admin page', () => {
    cy.get('.ux-side-menu-toggle').click();
    cy.get('[data-cy="firstLevelItem-1_L0_SA_Administration"]').click();
    cy.get('[data-cy="navigation-category-0_L1_SA_AdminDashboards"] > .ux-side-menu-item').click();
    cy.get('[data-cy="navigation-menuEntry-2_L3_SA_DataCollector"] > .ux-side-menu-item').click();
    cy.get('.mondrian-layout > mondrian-view').should('have.css', 'padding', '24px');
    cy.get('[data-cy="context-filter-content"]').should('not.exist');
    cy.frameLoaded('[data-cy="mondrian-iframe-dataCollector"]').iframeCustom().then($contentFrame => {
      cy.get('[data-cy="page-action-button"]').should('not.exist');
      cy.get('[data-cy="action-button"]').should('not.exist');
      cy.wrap($contentFrame).find('#dropdownNew1').click();
      cy.wrap($contentFrame).find('[data-cy="newDataQuery"]').click();
      cy.wrap($contentFrame).find('h2').should('contain', 'Query');
      cy.wrap($contentFrame).scrollIntoView();
      cy.wrap($contentFrame).find('#query-text').click();
      cy.wrap($contentFrame).find('#query-text').find('textarea').type('select 1');
      cy.wrap($contentFrame).find('#buttonExecuteQuery').click();
      cy.wait('@runDataQuery');
      cy.wrap($contentFrame).find('.spinner').should('not.exist');
    });
  });

  it('Resources should be loaded inside UIF as a reporting admin page', () => {
    cy.get('.ux-side-menu-toggle').click();
    cy.get('[data-cy="firstLevelItem-1_L0_SA_Administration"]').click();
    cy.get('[data-cy="navigation-category-0_L1_SA_AdminDashboards"] > .ux-side-menu-item').click();
    cy.get('[data-cy="navigation-category-1_L2_SA_StakeHolderAdminPages"] > .ux-side-menu-item').click();
    cy.get('[data-cy="navigation-menuEntry-3_L3_SA_Resources"] > .ux-side-menu-item').click();
    cy.get('.mondrian-layout > mondrian-view').should('have.css', 'padding', '24px');
    cy.get('[data-cy="context-filter-content"]').should('not.exist');
    cy.frameLoaded('[data-cy="mondrian-iframe-resources"]').iframeCustom().iframeCustom().then(() => {
      cy.get('[data-cy="page-action-button"]').should('not.exist');
      cy.get('[data-cy="action-button"]').should('not.exist');
      cy.iframe('[data-cy="mondrian-iframe-resources"]').should('contain', 'Visio Stencil and Tools');
    });
  });

  it('Roles should be loaded inside UIF as a reporting admin page', () => {
    cy.get('.ux-side-menu-toggle').click();
    cy.get('[data-cy="firstLevelItem-1_L0_SA_Administration"]').click();
    cy.get('[data-cy="navigation-category-0_L1_SA_AdminDashboards"] > .ux-side-menu-item').click();
    cy.get('[data-cy="navigation-category-1_L2_SA_StakeHolderAdminPages"] > .ux-side-menu-item').click();
    cy.get('[data-cy="navigation-menuEntry-1_L3_SA_Role"] > .ux-side-menu-item').click();
    cy.get('.mondrian-layout > mondrian-view').should('have.css', 'padding', '24px');
    cy.get('[data-cy="context-filter-content"]').should('not.exist');
    cy.frameLoaded('[data-cy="mondrian-iframe-roles"]').iframeCustom().then($contentFrame => {
      cy.get('[data-cy="page-action-button"]').should('not.exist');
      cy.get('[data-cy="action-button"]').should('not.exist');
      cy.wrap($contentFrame).should('contain', 'Roles');
      cy.wrap($contentFrame).should('contain', 'Roles define what users or groups are allowed to do by setting permissions relevant to their work role.');
    });
  });

  it('Settings should be loaded inside UIF as a reporting admin page', () => {
    cy.get('.ux-side-menu-toggle').click();
    cy.get('[data-cy="firstLevelItem-1_L0_SA_Administration"]').click();
    cy.get('[data-cy="navigation-category-__base_setup_config"] > .ux-side-menu-item').click();
    cy.get('[data-cy="navigation-menuEntry-4_L3_SA_Setting"] > .ux-side-menu-item').click();
    cy.get('mondrian-widget').should('have.length', 2);
    cy.get('#splitter-dashboard').should('have.css', 'padding', '24px');
    cy.get('[data-cy="context-filter-content"]').should('not.exist');
    cy.frameLoaded('[data-cy="mondrian-iframe-SystemSettings"]').iframeCustom().then($iframe => {
      cy.wrap($iframe).find('[data-cy="region-dropdown"]');
      cy.wrap($iframe).should('contain', 'Time zone');
    });
    cy.frameLoaded('[data-cy="mondrian-iframe-apiKey"]').iframeCustom().then($iframe => {
      cy.wrap($iframe).should('contain', 'Generating a new API key will invalidate your existing one. Therefore you have to adjust all your data senders to use this new API key instead of the old one.');
      cy.wrap($iframe).find('[data-cy="new_api_key"]').click();
      cy.wrap($iframe).find('.modal-title').contains('Generate New');
      cy.wrap($iframe).click();
    });
  });

  it('User settings should be loaded inside UIF as a reporting admin page', () => {
    cy.get('.ux-side-menu-toggle').click();
    cy.get('[data-cy="firstLevelItem-1_L0_SA_Administration"]').click();
    cy.get('[data-cy="navigation-category-__base_setup_config"] > .ux-side-menu-item').click();
    cy.get('[data-cy="navigation-menuEntry-0_L3_SA_User_setting"] > .ux-side-menu-item').click();
    cy.get('[data-cy="context-filter-content"]').should('not.exist');
    cy.frameLoaded('[data-cy="mondrian-iframe-userSetting"]').iframeCustom().then($iframe => {
      cy.wrap($iframe).should('contain', 'Account');
      cy.wrap($iframe).find('[data-cy="label-timezone"]').should('contain', 'Time zone');
    });
  });

  it('Bvd reports should get populated as menu entries in the side navigation', () => {
    cy.get('.ux-side-menu-toggle').click();
    cy.wait(['@getTOC']);
    cy.get('[data-cy="navigation-category-0_L2_SA_StakeHolderDashboards"] > .ux-side-menu-item').click();
    cy.url().then(urlString => {
      const urlObject = new URL(urlString);
      if (urlObject.hostname === 'localhost') {
        cy.get('[data-cy="navigation-menuEntry-documentation_0_L2_SA_StakeHolderDashboards"]');
        cy.get('[data-cy="navigation-menuEntry-documentation1_0_L2_SA_StakeHolderDashboards"]').click();
        cy.frameLoaded('[data-cy="mondrian-iframe-bvdReporting"]').iframeCustom().then(() => {
          cy.get('[data-cy="page-action-button"]').should('not.exist');
          cy.get('[data-cy="breadcrumb-title-documentation1"');
          cy.get('span[class="mondrianBreadcrumbData"] > [class="qtm-font-icon qtm-icon-app-business-value-dashboard"]');
          cy.get('[data-cy="side-nav-more-button"]');
          cy.get('[data-cy="action-button"]').click();
          cy.get('[data-cy="action-button-edit"]').should('not.exist');
          cy.get('[data-cy="action-button-duplicateWidget"]').should('not.exist');
          cy.get('[data-cy="action-button-removeWidget"]').should('not.exist');
        });
      } else {
        cy.get('[data-cy="navigation-menuEntry-Welcome_0_L2_SA_StakeHolderDashboards"]').click();
        cy.frameLoaded('[data-cy="mondrian-iframe-bvdReporting"]').iframeCustom().then(() => {
          cy.wait(['@getTOC', '@reportingPageloadSystem']);
          shared.waitForDataCalls({ name: '@reportingPageloadUser', count: 3 });
          cy.get('[data-cy="page-action-button"]').should('not.exist');
          cy.get('[data-cy="breadcrumb-title-Welcome"');
          cy.get('span[class="mondrianBreadcrumbData"] > [class="qtm-font-icon qtm-icon-app-business-value-dashboard"]');
          cy.get('[data-cy="side-nav-more-button"]');
          cy.get('[data-cy="action-button"]').click();
          cy.get('[data-cy="action-button-edit"]').should('not.exist');
          cy.get('[data-cy="action-button-duplicateWidget"]').should('not.exist');
          cy.get('[data-cy="action-button-removeWidget"]').should('not.exist');
        });
      }
    });
  });

  it('Bvd reports should have export pdf and new schedule as widgets actions', () => {
    cy.get('.ux-side-menu-toggle').click();
    cy.wait(['@getTOC']);
    cy.get('[data-cy="navigation-category-0_L2_SA_StakeHolderDashboards"] > .ux-side-menu-item').click();
    cy.url().then(urlString => {
      const urlObject = new URL(urlString);
      if (urlObject.hostname === 'localhost') {
        cy.get('[data-cy="navigation-menuEntry-documentation_0_L2_SA_StakeHolderDashboards"]').click();
      } else {
        cy.get('[data-cy="navigation-menuEntry-Welcome_0_L2_SA_StakeHolderDashboards"]').click();
      }
    });

    cy.get('[data-cy="context-filter-content"]').should('not.exist');
    cy.frameLoaded('[data-cy="mondrian-iframe-bvdReporting"]');
    cy.wait(['@getTOC']);
    cy.get('mondrian-widget').last().find('#actions-dropdown-button').click();
    cy.get('[data-cy="action-button-export_pdf"]').click();
    cy.wait(['@reportingPageloadSystem']);
    shared.waitForDataCalls({ name: '@reportingPageloadUser', count: 3 });
    cy.get('pdf-settings-box');
    cy.get('[data-cy="paper-list-dropdown"]');
    cy.get('[data-cy="portrait-radio-button"] label').should('have.class', 'ux-radio-button-checked');
    cy.get('[data-cy="show-advanced-options"]').click();
    cy.get('[data-cy="pdf-header"]');
    cy.get('[data-cy="submit-button"]').should('be.enabled');
    cy.get('[data-cy="cancel-button"]').should('be.enabled').click();
    cy.get('mondrian-widget').last().find('#actions-dropdown-button').click();
    cy.get('[data-cy="action-button-new_schedule"]').click();
    cy.get('[data-cy="panel-widget-pdf_schedule_panel"]');
    cy.get('section#GENERAL');
    cy.get('section#SCHEDULE');
    cy.get('section#FORMAT');
    cy.get('section#EMAIL');
  });
});
