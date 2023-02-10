// <reference types="Cypress" />

import 'cypress-iframe';

const shared = require('../../shared/shared');

const randomName = `DeleteMe_${Math.random()}`;

describe('keep tenant parameter after login for BVD on UIF url', () => {
  beforeEach(() => {
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/*`
    }).as('getBVDPage');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pages/toc*`
    }).as('getTocData');
    cy.intercept({
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/session/user`
    }).as('getUser');
    cy.intercept(`${shared.reportingContextRoot}/rest/${Cypress.env('API_VERSION')}/system`).as('reportingPageloadSystem');
    cy.intercept(`${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/system`).as('foundationPageloadSystem');
    cy.intercept(`${shared.reportingContextRoot}/rest/${Cypress.env('API_VERSION')}/session/user`).as('pageloadUser');
    cy.intercept(`${shared.reportingContextRoot}/rest/${Cypress.env('API_VERSION')}/dashboard/*`).as('dashboardLoad');
    cy.intercept(`${shared.reportingContextRoot}/rest/${Cypress.env('API_VERSION')}/dataCollector/*`).as('dataCollector');
    cy.intercept(`${Cypress.env('BVD_CONTEXT_ROOT')}/ui/dashboard/?*`).as('svgDashboardLoad');
    cy.bvdLogin();
  });

  it('Should check if tenant is retained in the url after navigating to BVD on UIF url', () => {
    cy.visit('/BVDREPPAGE?_m=Welcome_0_L2_SA_StakeHolderDashboards');
    cy.wait(['@foundationPageloadSystem', '@getUser', '@getUser', '@getUser', '@getTocData', '@getBVDPage']);
    cy.frameLoaded('[data-cy="mondrian-iframe-bvdReporting"]');
    cy.wait(['@reportingPageloadSystem', '@pageloadUser', '@pageloadUser', '@pageloadUser', '@svgDashboardLoad', '@dashboardLoad']);
    cy.url().then(urlString => {
      shared.checkTenantInUrl(urlString);
    });
  });

  it('Should check if tenant is retained in the url after creating a new Role', () => {
    cy.visit('/_bvd_roles');
    cy.frameLoaded('[data-cy="mondrian-iframe-roles"]').iframeCustom().then($contentFrame => {
      cy.get('[data-cy="page-action-button"]').should('not.exist');
      cy.get('[data-cy="action-button"]').should('not.exist');
      cy.wrap($contentFrame).should('contain', 'Roles');
      cy.wrap($contentFrame).find('.oas-welcome-box');
      cy.wrap($contentFrame).find('#linkToCreateRolePage').should('be.visible').click();
      cy.wrap($contentFrame).find('#controls').first().click().type(randomName);
      cy.wrap($contentFrame).find('#saveRoleButton').click();
      cy.url().then(urlString => {
        shared.checkTenantInUrl(urlString);
        cy.wrap($contentFrame).find('#btnDeleteRoles').should('be.visible').click();
        cy.wrap($contentFrame).find('#btnDialogSubmit').should('be.visible').click();
      });
    });
  });

  it('Should check if tenant is retained in the url after creating a new query', () => {
    cy.visit('/_bvd_dataCollectors?');
    cy.frameLoaded('[data-cy=mondrian-iframe-dataCollector]').iframeCustom().then($contentFrame => {
      cy.get('[data-cy="page-action-button"]').should('not.exist');
      cy.get('[data-cy="action-button"]').should('not.exist');
      cy.get('[data-cy="breadcrumb-title-Predefined Queries"]').should('contain', 'Predefined Queries');
      cy.wrap($contentFrame).find('#detailView').should('be.visible');
      cy.wrap($contentFrame).find('#dropdownNew1').should('be.visible').click();
      cy.wrap($contentFrame).find('[data-cy="newDataQuery"]').should('be.visible').click();
      cy.wrap($contentFrame).find('#name-input_name').click().type(randomName);
      cy.wrap($contentFrame).find('#query-text').click().type('select 1');
      cy.wrap($contentFrame).find('#buttonExecuteQuery').click();
      cy.wait(['@dataCollector']);
      cy.wrap($contentFrame).find('#buttonConfirm').click();
      cy.url().then(urlString => {
        shared.checkTenantInUrl(urlString);
        cy.wrap($contentFrame).find('.loading-spinner').first().should('not.be.visible');
        cy.wrap($contentFrame).find('.reveal-search').click();
        cy.wrap($contentFrame).find('.filter-input').should('be.visible').type('Delete');
        cy.wrap($contentFrame).find('.list-title').first().contains('DeleteMe').click();
        cy.wrap($contentFrame).find('#oprList_1_item-0_button_1').click();
        cy.wrap($contentFrame).find('.delete-mode-yes').should('be.visible').click();
      });
    });
  });

  it('Should check if tenant is retained in the url after updating the dashboard', () => {
    cy.visit('/_bvd_dashboards');
    cy.frameLoaded('[data-cy=mondrian-iframe-Dashboards]').iframeCustom().then($contentFrame => {
      cy.get('[data-cy="page-action-button"]').should('not.exist');
      cy.get('[data-cy="action-button"]').should('not.exist');
      cy.wrap($contentFrame).find('.image-placeholder').first().should('be.visible');
      cy.wrap($contentFrame).find(`#edit-Welcome`).first().invoke('css', 'visibility', 'visible').trigger('mouseover').click();
      cy.wait(['@getUser', '@dashboardLoad']);
      cy.wrap($contentFrame).find('#title').should('be.visible').click().clear().type(`Welcome`);
      cy.wrap($contentFrame).find('#config_save').click();
      cy.wait(['@dashboardLoad', '@getUser', '@getUser', '@dashboardLoad']);
    });

    cy.url().then(urlString => {
      shared.checkTenantInUrl(urlString);
    });
  });

  afterEach(() => {
    cy.bvdLogout();
  });
});
