// <reference types="Cypress" />
const shared = require('../../../shared/shared');
const pgmtDefinition = require('../../../../../fixtures/foundation/pages/pgmtDefinition.json');
const pgmtInstance = require('../../../../../fixtures/foundation/menuEntries/pgmtInstance.json');

describe('Pgmt save - Instance/Definition', shared.defaultTestOptions, () => {
  beforeEach(() => {
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/pgmtDefinition*`
    }).as('getPage');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/uiTestEditWidgets*`
    }).as('getPageEditWidgets');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/menuEntries/editPage`
    }).as('getEditInstance');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/widgets/pgmt_save`
    }).as('pgmtAction');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/menuEntries/pgmtInstance`
    }).as('getPgmtInstance');
    cy.intercept({
      method: 'PUT',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/menuEntries/pgmtInstance`
    }).as('updatePgmtInstance');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pages/toc?onlyFullControl*`
    }).as('getTocOnlyFullControl');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pages/toc*`
    }).as('getTOC');
    cy.intercept({
      method: 'POST',
      url: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/datasource/ws/data`
    }).as('getData');
    cy.bvdLogin();

    shared.updateMenuEntry(pgmtInstance);
    shared.updatePage(pgmtDefinition);
  });

  it('Update Instance', () => {
    cy.visit('/pgmtDefinition?_m=pgmtInstance');
    // open and Validate Save
    cy.wait(['@getTOC', '@getPage', '@getTocOnlyFullControl']);
    cy.get('[data-cy="page-action-button"]').click();
    cy.get('[data-cy="page-action-item-save"]').click();
    cy.wait(['@pgmtAction', '@getPgmtInstance']);
    cy.get('#override-header > h2').should('have.text', 'Save');
    cy.get('[data-cy="pgmt-checkbox-instance"]').should('be.visible');
    cy.get('[data-cy="pgmt-checkbox-definition"]').should('be.visible');
    cy.get('[data-cy="submit-button"]').should('be.disabled');
    cy.get('[data-cy="cancel-button"]').should('be.enabled');
    cy.get('[data-cy=pgmt-checkbox-instance] > .ux-checkbox > .ux-checkbox-container').click();
    cy.wait('@getTocOnlyFullControl');
    // check for update instance
    cy.get('[data-cy="pgmt-properties-instance-title-label"]').should('be.visible');
    cy.get('.page-icon-label-container > .control-label').should('be.visible');
    cy.get('[data-cy="categoryDropdownLabel"]').should('be.visible');
    cy.get('[for="pgmt-description-instance"]').should('be.visible');
    cy.get('[data-cy="submit-button"]').should('be.disabled');
    cy.get('[data-cy="cancel-button"]').should('be.enabled');
    cy.get('.uif-icon-dropdown > .qtm-font-icon').click();
    cy.get('.dropdown-menu-text > i').last().click();
    cy.get('[data-cy="pgmt-properties-instance-title"]')
      .should('have.value', 'Instance for new pgmt')
      .clear()
      .type('Demo Test1');
    cy.get('[data-cy="submit-button"]').should('be.enabled');
    cy.get('[data-cy="cancel-button"]').should('be.enabled');
    cy.get('[data-cy="categoryDropdownButton"]').click();
    cy.get('.filter-container input[type="text"]').type('pages');
    cy.get('tree-node-children tree-node-collection').find('tree-node').its('length').should('be.eq', 2);
    cy.get('.highlight').first().click();
    cy.get('[data-cy="pgmt-properties-instance-description"]').clear().type('demo test');
    cy.get('[data-cy="submit-button"]').click();
    cy.wait(['@updatePgmtInstance', '@getTOC']);
    cy.bvdCheckToast('Update of the instance was successful');
    cy.get('[data-cy="side-nav-search-button"] > i').click();
    cy.get('[data-cy="sideNavigation-search-input"]').type('Demo Test1');
    cy.get('[data-cy="navigation-menuEntry-pgmtInstance"]').should('be.visible');
    cy.get('.mondrianBreadcrumbData > span').then($data => {
      expect($data).contain.text('Demo Test1');
    });
    cy.get('[data-cy="breadcrumb-icon-pgmtDefinition"]').should('be.visible');
  });

  it('Update Definition', () => {
    cy.visit('/pgmtDefinition?_m=pgmtInstance');
    cy.wait(['@getTOC', '@getTocOnlyFullControl']);
    cy.get('[data-cy="page-action-button"]').click();
    cy.get('[data-cy="page-action-item-save"]').click();
    cy.wait('@pgmtAction');
    cy.get('[data-cy="pgmt-checkbox-definition"] > .ux-checkbox > .ux-checkbox-container').click();
    cy.get('[data-cy="pgmt-properties-definition-title-label"]').should('be.visible');
    cy.get('.page-icon-label-container > .control-label').should('be.visible');
    cy.get('[for="pgmt-description-definition"]').should('be.visible');
    cy.get('[data-cy="submit-button"]').should('be.disabled');
    cy.get('[data-cy="cancel-button"]').should('be.enabled');
    cy.get('[data-cy="pgmt-properties-definition-title"]').clear();
    cy.get('[data-cy="pgmt-properties-definition-title"]').type('save definition test');
    cy.get('[data-cy="submit-button"]').should('be.enabled');
    cy.get('[data-cy="cancel-button"]').should('be.enabled');
    cy.get('[data-cy="pgmt-properties-definition-description"]').clear().type('definition test demo');
    cy.get('[data-cy="submit-button"]').click();
    cy.bvdCheckToast('Update of the definition was successful');
    cy.visit('/pgmtDefinition');
    cy.get('.mondrianBreadcrumbData > span').then($data => {
      expect($data).contain.text('save definition test');
    });
    cy.get('[data-cy="page-action-button"]').click();
    cy.get('[data-cy="page-action-item-save"]').click();
    cy.wait('@pgmtAction');
    cy.get('[componentnamelabeltext="pgmt.definition.label.name"] > h3').then($text => {
      expect($text).contain.text('Definition');
    });
    cy.get('[data-cy="pgmt-properties-definition-title"]').should('have.value', 'save definition test');
    cy.get('[data-cy="pgmt-properties-definition-description"]').should('have.value', 'definition test demo');
    cy.get('.uif-icon-dropdown > .qtm-font-icon').should('be.visible');
  });

  it('Abort definition update', () => {
    cy.visit('/pgmtDefinition?_m=pgmtInstance');
    cy.wait(['@getTOC', '@getTocOnlyFullControl']);
    cy.get('[data-cy="page-action-button"]').click();
    cy.get('[data-cy="page-action-item-save"]').click();
    cy.wait('@pgmtAction');
    cy.get('[data-cy="pgmt-checkbox-definition"] > .ux-checkbox > .ux-checkbox-container').click();
    cy.get('[data-cy="pgmt-properties-definition-title"]').clear();
    cy.get('[data-cy="pgmt-properties-definition-title"]').type('definition test');
    cy.get('[data-cy="pgmt-properties-definition-description"]').clear().type('definition test demo');
    cy.get('[data-cy="cancel-button"]').click();
    cy.url().should('include', 'pgmtDefinition').and('include', 'pgmtInstance');
    cy.get('.mondrianBreadcrumbData > span').then($data => {
      expect($data).not.contain.text('definition test');
    });
  });

  it('Abort instance update', () => {
    cy.visit('/pgmtDefinition?_m=pgmtInstance');
    cy.wait(['@getTOC', '@getTocOnlyFullControl']);
    cy.get('[data-cy="page-action-button"]').click();
    cy.get('[data-cy="page-action-item-save"]').click();
    cy.wait('@pgmtAction');
    cy.get('[data-cy=pgmt-checkbox-instance] > .ux-checkbox > .ux-checkbox-container').click();
    cy.wait('@getTocOnlyFullControl');
    cy.get('.uif-icon-dropdown > .qtm-font-icon').click();
    cy.get('.dropdown-menu-text > i').last().click();
    cy.get('[data-cy="pgmt-properties-instance-title"]').clear();
    cy.get('[data-cy="pgmt-properties-instance-title"]').type('New Instance Test');
    cy.get('[data-cy="categoryDropdownButton"]').click();
    cy.get('.filter-container input[type="text"]').type('pages');
    cy.get('tree-node-children tree-node-collection').find('tree-node').its('length').should('be.eq', 2);
    cy.get('.highlight').first().click();
    cy.get('[data-cy="pgmt-properties-instance-description"]').clear().type('New Instance');
    cy.get('[data-cy="cancel-button"]').click();
    cy.get('[data-cy="side-nav-search-button"] > i').click();
    cy.get('[data-cy="sideNavigation-search-input"]').type('New Instance Test');
    cy.get('[data-cy="navigation-category-T7"]').should('not.exist');
    cy.get('.mondrianBreadcrumbData > span').then($data => {
      expect($data).not.contain.text('New Instance Test');
    });
  });

  it('The Definition should be updated when change in Page Layout', () => {
    cy.visit('/pgmtDefinition?_m=pgmtInstance');
    cy.wait(['@getTOC', '@getPage', '@getTocOnlyFullControl']);
    cy.get('[data-cy="action-button"]').its('length').should('be.eq', 1);
    cy.get('[data-cy="page-action-button"]').click();
    cy.get('[data-cy="page-action-item-save"]').click();
    cy.wait('@pgmtAction');
    cy.get('[data-cy="submit-button"]').should('be.disabled');
    cy.get('[data-cy="cancel-button"]').click();
    cy.get('[data-cy="action-button"]').click();
    cy.get('[data-cy="action-button-duplicateWidget"]').click();
    cy.get('[data-cy="action-button"]').should('have.length', 2);
    cy.get('[data-cy="page-action-button"]').click();
    cy.get('[data-cy="page-action-item-save"]').click();
    cy.wait('@pgmtAction');
    cy.get('#pgmt-checkbox-definition-input').should('be.checked');
    cy.get('[data-cy="pgmt-checkbox-definition"]').within(() => {
      cy.get('[data-cy="unsaved-changes"]').should('contain.text', 'Unsaved changes');
    });
    cy.get('[data-cy="submit-button"]').should('be.enabled').click();
    cy.bvdCheckToast('Update of the definition was successful');
    cy.reload();
    cy.wait(['@getTOC', '@getTocOnlyFullControl']);
    cy.get('[data-cy="action-button"]').its('length').should('be.eq', 2);
  });

  it('Verify correct category data retrieval for multiple instances', () => {
    cy.visit('/pgmtDefinition?_m=pgmtInstance');
    cy.wait(['@getTOC', '@getPage', '@getTocOnlyFullControl']);
    cy.get('[data-cy="page-action-button"]').click();
    cy.get('[data-cy="page-action-item-save"]').click();
    cy.wait(['@pgmtAction', '@getPgmtInstance']);
    cy.get('[data-cy=pgmt-checkbox-instance] > .ux-checkbox > .ux-checkbox-container').click();
    cy.wait('@getTocOnlyFullControl');
    cy.get('[data-cy="categoryDropdownButton"]').should('be.visible').contains('Pages');
    cy.get('[data-cy="cancel-button"]').click();

    // select a different instance with another category
    cy.get('[data-cy="side-nav-search-button"]').click();
    cy.get('[data-cy="sideNavigation-search-input"]').type('How to edit page');
    cy.get('[data-cy="navigation-menuEntry-editPage"]').click();
    cy.wait(['@getTOC', '@getPageEditWidgets', '@getTocOnlyFullControl', '@getData']);

    cy.get('[data-cy="page-action-button"]').click();
    cy.get('[data-cy="page-action-item-save"]').click();
    cy.wait(['@pgmtAction', '@getEditInstance']);
    cy.get('[data-cy=pgmt-checkbox-instance] > .ux-checkbox > .ux-checkbox-container').click();
    cy.wait('@getTocOnlyFullControl');
    cy.get('[data-cy="categoryDropdownButton"]').should('be.visible').contains('Widgets');
    cy.get('[data-cy="cancel-button"]').click();
  });
});

describe('Pgmt save - Definition', shared.defaultTestOptions, () => {
  beforeEach(() => {
    cy.intercept({
      method: 'POST',
      url: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/datasource/ws/data`
    }).as('getData');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pages/toc*`
    }).as('getTOC');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/widgets/pgmt_save`
    }).as('pgmtAction');
    cy.bvdLogin();
  });

  it('Check when there is no _m to the URL', () => {
    cy.visit('/uiTestPageCrud');
    cy.wait(['@getData', '@getData', '@getTOC', '@getTOC']);
    cy.get('[data-cy="page-action-button"]').click();
    cy.get('[data-cy="page-action-item-save"]').click();
    cy.wait('@pgmtAction');
    cy.get('[componentnamelabeltext="pgmt.definition.label.name"] > h3').then($text => {
      expect($text).contain.text('Definition');
    });
    cy.get('[data-cy="pgmt-properties-definition-title"]').should('have.value', 'page.crud.title');
    cy.get('.uif-icon-dropdown > .qtm-font-icon').should('be.visible');
    cy.get('[data-cy="pgmt-properties-instance-title"]').should('not.exist');
  });
});

