// <reference types="Cypress" />
/* eslint-disable camelcase */
const shared = require('../../../shared/shared');
const role = require('../../../../../support/reporting/restUtils/role');
const nonAdminuserName = 'nonAdminTestDefinitionUser';
const nonAdminuserPwd = 'control@123D';
let permissionArrayForUIF;
let uifRole;

describe('Page mgmt- List Definitions', shared.defaultTestOptions, () => {
  beforeEach(() => {
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pages`
    }).as('getDefinitions');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/*`
    }).as('getPageComponents');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/menuEntries*`
    }).as('getMenuEntries');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pages/toc*`
    }).as('getTOC');
    cy.intercept({
      method: 'POST',
      url: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/datasource/ws/data`
    }).as('getData');
    cy.bvdLogin();
    cy.visit('/');
    cy.wait(['@getTOC', '@getTOC', '@getMenuEntries']);
  });

  it('Verify the definition list search with special characters and normal text', () => {
    cy.get('.ux-side-menu-toggle').click();
    cy.get('ux-side-menu').find('[aria-expanded="true"]');
    cy.get('[data-cy="side-nav-more-button-wrapper"]').click();
    cy.get('[data-cy="show-definition-button"]').click();
    cy.wait('@getDefinitions');
    cy.get('[data-cy="uifToolbar-search-input"]').should('be.visible').type('...');
    cy.get('[data-cy="definition-label"] > span').eq(0).should('contain.text', '...').and('have.class', 'highlight');
    cy.get('[data-cy="definition-label"] > span').eq(0).click();
    cy.get('[data-cy="mondrianBreadcrumbData"] span').contains('...');
    cy.get('[data-cy="uifToolbar-search-input"]').clear().type('All Charts Page');
    cy.get('[data-cy="definition-label"] > span').should('contain.text', 'AllChartsPage').and('have.class', 'highlight');
  });

  it('Navigate to the definition and verify for the default context to be present', () => {
    cy.get('.ux-side-menu-toggle').click();
    cy.get('ux-side-menu').find('[aria-expanded="true"]');
    cy.get('[data-cy="side-nav-more-button-wrapper"]').click();
    cy.get('[data-cy="show-definition-button"]').click();
    cy.wait('@getDefinitions');
    cy.get('[data-cy="uifToolbar-search-input"]').type('Has Time Ctx');
    cy.get('[data-cy="definition-label"] > span').should('contain.text', 'HasTimeCtx').and('have.class', 'highlight');
    cy.get('[data-cy="list-item-0"]').click();
    cy.wait(['@getTOC', '@getTOC', '@getPageComponents', '@getData', '@getData']);
    cy.get('[data-cy="mondrianBreadcrumbData"] span').contains('Has Time Ctx');
    cy.url().should('include', 'RL2hours');
    cy.get('[data-cy="context-filter-menu"]').find('span').should('contain.text', '2 Hours');
  });

  afterEach(() => {
    shared.deletePages(['...']);
  });
});

describe('List Definitions : Keyboard Navigation', shared.defaultTestOptions, () => {
  beforeEach(() => {
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/menuEntries*`
    }).as('getMenuEntries');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pages/toc*`
    }).as('getTOC');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pages`
    }).as('getDefinitions');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/*`
    }).as('getPageComponents');
    cy.intercept({
      method: 'POST',
      url: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/datasource/ws/data`
    }).as('getData');
    cy.bvdLogin();
  });

  it('Verifying the tab and Enter keys to navigate to List definitions Panel and Click on Back button', () => {
    cy.visit('/');
    cy.wait(['@getTOC', '@getTOC', '@getMenuEntries']);
    cy.get('.ux-side-menu-toggle').click();
    cy.get('ux-side-menu').find('[aria-expanded="true"]');
    cy.get('[data-cy=sideNavigation-search-input]').tab().tab().type('{enter}');
    cy.get('[data-cy="show-definition-button"]').trigger('keydown', {
      key: 'Enter'
    });
    cy.wait('@getDefinitions');
    cy.get('[data-cy="pgmt-definition-list-header-title"]').should('contain.text', 'Definition');
    cy.get('[data-cy="list-item-0"]').trigger('keydown', { key: 'Enter' }).tab();
    cy.wait(['@getTOC', '@getTOC', '@getData']);
    // The Enter key action and trigger with Enter is not working on the Back button and hence using the click() method
    cy.get('[data-cy="pgmt-definition-list-back-button"]').should('contain.text', 'Back').click();
    cy.get('[data-cy=sideNavigation-search-input]').should('be.visible');
  });

  it('Selecting the definition in List Definitions Panel and tab on Back button', () => {
    cy.get('[data-cy="side-nav-more-button-wrapper"]').click();
    cy.get('[data-cy="show-definition-button"]').click();
    cy.wait('@getDefinitions');
    cy.get('[data-cy="pgmt-definition-list-header-title"]').should('contain.text', 'Definition');
    cy.get('[data-cy="list-item-0"]').trigger('keydown', { key: 'Enter' }).type('{downArrow}{downArrow}{downArrow}').tab();
    // The Enter key action and trigger with Enter is not working on the Back button and hence using the click() method
    cy.get('[data-cy="pgmt-definition-list-back-button"]').should('contain.text', 'Back').click();
    cy.get('[data-cy=sideNavigation-search-input]').should('be.visible');
  });
});

describe('Non Admin : List Definitions', shared.defaultTestOptions, () => {
  beforeEach(() => {
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/menuEntries*`
    }).as('getMenuEntries');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pages/toc*`
    }).as('getTOC');
  });

  it('Definitions should not be displayed', () => {
    permissionArrayForUIF = [];

    cy.wrap(role.roleCreationWithPermissionArray('NonAdminPage', 'NonAdminPage', permissionArrayForUIF, false)).then(uifRoleId => {
      uifRole = uifRoleId;
      cy.bvdLogout();
    });
    cy.bvdLogin(nonAdminuserName, nonAdminuserPwd);
    cy.visit('/');
    cy.wait(['@getTOC', '@getTOC', '@getMenuEntries']);
    cy.get('.ux-side-menu-toggle').click();
    cy.get('ux-side-menu').find('[aria-expanded="true"]');
    cy.get('[data-cy="side-nav-more-button-wrapper"]').click();
    cy.get('[data-cy="show-definition-button"]').click();
    cy.get('.definition-list-container > span').should('contain.text', 'No definitions available');
  });

  after(() => {
    cy.bvdLogout();
    role.roleDeletion(uifRole, false);
  });
});

