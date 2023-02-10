/* eslint-disable camelcase */
// <reference types="Cypress" />
const shared = require('../../shared/shared');
import 'cypress-iframe';
const role = require('../../../../support/reporting/restUtils/role');
let nonAdminWithDataCollectorRole;
let permissionArray;

describe('Test Roles on UIF', shared.defaultTestOptions, () => {
  beforeEach(() => {
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pages/toc*`
    }).as('getTOC');
    cy.intercept({ method: 'POST', url: `${Cypress.env('BVD_CONTEXT_ROOT')}/rest/${Cypress.env('API_VERSION')}/dataCollector/test?format=json` }).as('runDataQuery');
  });

  after(() => {
    role.roleDeletion(nonAdminWithDataCollectorRole, true);
  });

  it('validate the permissions text for a dataCollector enabled role', () => {
    permissionArray = [{
      operation_key: 'View',
      resource_key: 'default_action<>Group-__bvd_data_collector'
    }];
    cy.bvdLogin();
    cy.visit('/');
    cy.wait(['@getTOC']);
    cy.get('.ux-side-menu-toggle').click();
    role.roleCreationWithPermissionArray('testRoleDefect', 'testRoleDefect', permissionArray, true).then(nonAdminRoleId => {
      nonAdminWithDataCollectorRole = nonAdminRoleId;
      cy.get('[data-cy="firstLevelItem-1_L0_SA_Administration"]').click();
      cy.get('[data-cy="navigation-category-0_L1_SA_AdminDashboards"]').click();
      cy.get('[data-cy="navigation-category-1_L2_SA_StakeHolderAdminPages"').click();
      cy.get('[data-cy="navigation-menuEntry-1_L3_SA_Role"] > .ux-side-menu-item').click();
      cy.frameLoaded('[data-cy="mondrian-iframe-roles"]').iframeCustom().then($iframe => {
        cy.wrap($iframe).find('[label="Manage Roles"]').click();
        cy.wrap($iframe).find('div.opr-list-item div:nth-child(1) [text="testRoleDefect"]').should('be.visible');
        cy.wrap($iframe).find('div.opr-list-item div:nth-child(1) [text="testRoleDefect"]').trigger('mouseover').click();
        cy.wrap($iframe).find('div.oas-resource-row span.data-collector').should('contain', 'Edit predefined queries');
        cy.wrap($iframe).find('[data-cy="data-collector-permission"]').should('contain', 'Enabled');
      });
    });
  });

  it('the name text box and description text box should not be disabled when performing other operations', () => {
    cy.bvdLogin();
    cy.visit('/');
    cy.wait(['@getTOC']);
    cy.get('.ux-side-menu-toggle').click();
    cy.get('[data-cy="firstLevelItem-1_L0_SA_Administration"]').click();
    cy.get('[data-cy="navigation-category-0_L1_SA_AdminDashboards"] > .ux-side-menu-item').click();
    cy.get('[data-cy="navigation-category-1_L2_SA_StakeHolderAdminPages"').click();
    cy.get('[data-cy="navigation-menuEntry-1_L3_SA_Role"] > .ux-side-menu-item').click();
    cy.frameLoaded('[data-cy="mondrian-iframe-roles"]').iframeCustom().then($iframe => {
      cy.wrap($iframe).find('[label="Create New Role"]').should('be.visible');
      cy.wrap($iframe).find('[label="Create New Role"]').click();
      cy.wrap($iframe).find('[name="dataCollectorInput"]').should('be.visible');
      cy.wrap($iframe).find('#data-collector-input').check();
      cy.wrap($iframe).find('input[name="roleName"]').click();
      cy.wrap($iframe).find('input[name="roleName"]').type('testRole');
      cy.wrap($iframe).find('textarea[name="roleDescription"]').click();
      cy.wrap($iframe).find('textarea[name="roleDescription"]').type('testRole');
      cy.wrap($iframe).find('#cancelEditorButton').click();
    });
  });
});
