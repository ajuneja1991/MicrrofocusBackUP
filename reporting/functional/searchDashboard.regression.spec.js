const shared = require('../../shared/shared');
const dashboard = require('../../../../support/reporting/restUtils/dashboard');
const role = require('../../../../support/reporting/restUtils/role');

import { uploadFileRequest } from '../../../../support/reporting/restUtils/uploadFile';
describe('Search dashboard test', shared.defaultTestOptions, () => {
  before(() => {
    uploadFileRequest(`reporting/documentation4.bvd`, `${Cypress.env('BVD_CONTEXT_ROOT')}/urest/${Cypress.env('API_VERSION')}/dashboard`);
    uploadFileRequest(`reporting/documentation5.bvd`, `${Cypress.env('BVD_CONTEXT_ROOT')}/urest/${Cypress.env('API_VERSION')}/dashboard`);
    uploadFileRequest(`reporting/NOM_NA_Devices_Scaned_Status.bvd`, `${Cypress.env('BVD_CONTEXT_ROOT')}/urest/${Cypress.env('API_VERSION')}/dashboard`);
    uploadFileRequest(`reporting/documentation9.bvd`, `${Cypress.env('BVD_CONTEXT_ROOT')}/urest/${Cypress.env('API_VERSION')}/dashboard`);
  });
  beforeEach(() => {
    cy.intercept(`${Cypress.env('BVD_CONTEXT_ROOT')}/rest/${Cypress.env('API_VERSION')}/system`).as('pageloadSystem');
    cy.intercept(`${Cypress.env('BVD_CONTEXT_ROOT')}/rest/${Cypress.env('API_VERSION')}/session/user`).as('pageloadUser');
    cy.intercept({ method: 'POST', path: `${Cypress.env('BVD_CONTEXT_ROOT')}/rest/${Cypress.env('API_VERSION')}/channel/state` }).as('channelState');
    cy.intercept(`${Cypress.env('BVD_CONTEXT_ROOT')}/rest/${Cypress.env('API_VERSION')}/dashboard/documentation9`).as('dashboardWait');
    cy.bvdLogin();
  });
  let roleId;
  it('Search dashboard and clear search test', () => {
    cy.visit('#/show/Welcome');
    cy.wait(['@pageloadSystem', '@pageloadUser']);
    cy.get('#nav_dashboards_menu').click();
    cy.get('#searchDashboard').type('n5');
    cy.get('[href="#/show/documentation5?params=none"]');
    cy.get('a > span[class="highlight"]').should('have.text', 'n5');
    cy.get('#searchDashboard').clear();
    cy.get('[href="#/show/documentation5?params=none"]');
    cy.get('[href="#/show/documentation4?params=none"]');
    cy.get('#searchDashboard').type('n4');
    cy.get('[href="#/show/documentation4?params=none"]');
    cy.get('a > span[class="highlight"]').should('have.text', 'n4');
    cy.get('a > ux-icon[name="link-previous"]').click();
    cy.get('#nav_dashboards_menu').click();
    cy.get('#searchDashboard').should('have.text', '');
    cy.get('[href="#/show/documentation5?params=none"]');
    cy.get('[href="#/show/documentation4?params=none"]');
  });

  it('Users with view permission should not be able to edit dashboards', () => {
    const permissionArray = [
      // eslint-disable-next-line camelcase
      { operation_key: 'full-control', resource_key: 'omi-event<>assigned<>c1' },
      // eslint-disable-next-line camelcase
      { operation_key: 'full-control', resource_key: 'omi-event<>assigned<>c2' },
      // eslint-disable-next-line camelcase
      { operation_key: 'view', resource_key: 'omi-event<>assigned<>c3' }
    ];
    cy.wrap(role.roleCreationWithPermissionArray('PartialPermissionRole', 'Role with partial permission against categories', permissionArray, true)).then(newRoleId => {
      roleId = newRoleId;
      cy.bvdLogout();
      cy.bvdLogin('PartialPermissionUser', 'control@123D');
      cy.visit('/#/show/documentation4');
      cy.wait(['@pageloadUser', '@pageloadSystem', '@channelState']);
      cy.get('#load-spinner').should('not.be.visible');
      cy.get('[data-cy="edit-dashboard-button"]').should('not.exist');
      cy.visit('/#/show/NOM_NA_Devices_Scaned_Status');
      cy.wait(['@pageloadUser']);
      cy.get('#load-spinner').should('not.be.visible');
      cy.get('[data-cy="edit-dashboard-button"]');
      cy.visit('/#/show/documentation5');
      cy.wait(['@pageloadUser', '@channelState']);
      cy.get('#load-spinner').should('not.be.visible');
      cy.get('[data-cy="edit-dashboard-button"]').should('not.exist');
      cy.visit('/#/show/documentation9');
      cy.wait(['@pageloadUser', '@dashboardWait']);
      cy.get('#load-spinner').should('not.be.visible');
      cy.get('[data-cy="edit-dashboard-button"]');
      cy.bvdLogout();
    });
  });

  after(() => {
    // LogOut of session if test fails during execution and logout does not occur through UI
    cy.bvdLogout();
    dashboard.dashboardDelete('documentation4');
    dashboard.dashboardDelete('documentation5');
    dashboard.dashboardDelete('NOM_NA_Devices_Scaned_Status');
    dashboard.dashboardDelete('documentation9');
    role.roleDeletion(roleId);
  });
});
