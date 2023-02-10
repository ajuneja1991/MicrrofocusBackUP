// <reference types="Cypress" />
const shared = require('../../../shared/shared');
let tempInstance;

const saveAs = function() {
  cy.visit('/pgmtDefinition?_m=pgmtInstance');
  cy.wait(['@getTOC', '@getTocOnlyFullControl', '@getPage']);
  cy.get('[data-cy="page-action-button"]').click();
  cy.get('[data-cy=page-action-item-saveAs]').click();
  cy.wait(['@getPgmtInstance', '@getPgmtSaveAs', '@getTocOnlyFullControl']);
};

const saveAsDef = function() {
  cy.visit('/pgmtDefinition');
  cy.wait(['@getTOC', '@getTocOnlyFullControl', '@getPage']);
  cy.get('[data-cy="page-action-button"]').click();
  cy.get('[data-cy=page-action-item-saveAs]').click();
};

const deleteInstance = function() {
  cy.url().then(urlString => {
    const urlObject = new URL(urlString);
    tempInstance = urlObject.searchParams.get('_m').toString();
    shared.deleteMenuEntry(tempInstance);
  });
};

const pageIDs = [];
function addToPageIDs() {
  cy.url().then(url => {
    const urlObject = new URL(url);
    pageIDs.push(urlObject.pathname.split('/')[2]);
  });
}

describe('Page Mgmt - Save As a new instance', shared.defaultTestOptions, () => {
  beforeEach(() => {
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/pgmtDefinition*`
    }).as('getPage');
    cy.intercept({
      method: 'POST',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/menuEntries`
    }).as('menuEntry');
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
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/widgets/*`
    }).as('getPgmtSaveAs');
    cy.intercept({
      method: 'POST',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pages*`
    }).as('getUpdatePage');
    cy.intercept({
      method: 'POST',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/datasource/ws/data`
    }).as('getData');
    cy.bvdLogin();
  });
  describe('Pages with Menu Entry and having definition (URL with _m)', shared.defaultTestOptions, () => {
    it('Abort new instance', () => {
      saveAs();
      cy.get('#pgmt-radio-button-instance > .ux-radio-button > .ux-radio-button-container').click();
      cy.get('#icon-instance > .uif-icon-dropdown > .qtm-font-icon').click();
      cy.get('.dropdown-menu-text > i').last().click();
      cy.get('[data-cy="pgmt-properties-instance-title"]').clear().type('New Instance Test');
      cy.get('[data-cy="categoryDropdownButton"]').click();
      cy.get('.filter-container input[type="text"]').type('pages');
      cy.get('tree-node-children tree-node-collection').find('tree-node').its('length').should('be.eq', 2);
      cy.get('.highlight').first().click();
      cy.get('[data-cy="pgmt-properties-instance-description"]').clear().type('demo test');
      cy.get('[data-cy="cancel-button"]').click();
      cy.get('.mondrianBreadcrumbData > span').then($data => {
        expect($data).not.contain.text('New Instance Test');
      });
    });

    it('validate new instance', () => {
      saveAs();
      // validate Save As Dialog
      cy.get('#override-header > h2').should('have.text', 'Save As');
      cy.get('#pgmt-radio-button-instance > label > span').should('contain.text', 'Save as a new instance');
      cy.get('#pgmt-radio-button-instance > .ux-radio-button > .ux-radio-button-container').click();
      cy.get('[data-cy="pgmt-properties-instance-title-label"]').should('be.visible');
      cy.get('.page-icon-label-container > .control-label').should('be.visible');
      cy.get('[data-cy="categoryDropdownLabel"]').should('be.visible');
      cy.get('[for="pgmt-description-instance"]').should('be.visible');
      cy.get('[data-cy="pgmt-properties-instance-title"]').should('have.value', 'Copy of Instance for new pgmt');
      cy.get('[data-cy="submit-button"]').should('be.enabled');
      cy.get('[data-cy="cancel-button"]').should('be.enabled');
      cy.get('#icon-instance > .uif-icon-dropdown > .qtm-font-icon').click();
      cy.get('.dropdown-menu-text > i').last().click();
      cy.get('[data-cy="pgmt-properties-instance-title"]').clear().type('Demo Instance Test');
      cy.get('[data-cy="categoryDropdownButton"]').click();
      cy.get('.filter-container input[type="text"]').type('pages');
      cy.get('tree-node-children tree-node-collection').find('tree-node').its('length').should('be.eq', 2);
      cy.get('.highlight').first().click();
      cy.get('[data-cy="submit-button"]').should('be.enabled');
      cy.get('[data-cy="cancel-button"]').should('be.enabled');
      cy.get('[data-cy="pgmt-properties-instance-description"]').clear().type('demo test');
      // validate the new instance
      cy.get('[data-cy="submit-button"]').click();
      cy.wait(['@menuEntry', '@getTOC']);
      cy.bvdCheckToast('Instance "Demo Instance Test" saved successfully');
      cy.get('[data-cy="side-nav-search-button"] > i').click();
      cy.wait('@getTocOnlyFullControl');
      cy.get('[data-cy="sideNavigation-search-input"]').type('Demo Instance Test');
      cy.get('.highlight').should('contain.text', 'DemoInstanceTest');
      cy.get('.mondrianBreadcrumbData > span').then($data => {
        expect($data).contain.text('Demo Instance Test');
      });
      cy.get('[data-cy="breadcrumb-icon-pgmtDefinition"]').should('be.visible');
      cy.url().should('include', '_m').and('include', 'pgmtDefinition');
      cy.url().then(urlString => {
        shared.checkTenantInUrl(urlString);
      });
      deleteInstance();
    });

    it('Validate the Context change - time range selection', () => {
      cy.visit('/uiTestWidgets?_m=widgetWithContext');
      cy.wait(['@getTocOnlyFullControl', '@getData', '@getData', '@getData', '@getData', '@getData', '@getData']);
      cy.get('[data-cy=context-filter-menu]').click();
      cy.get('[data-cy="RL12hours"]').click();
      cy.get('[data-cy="contextFilterApplyButton"]').click();
      cy.wait(['@getData', '@getData', '@getData', '@getData', '@getData', '@getData']);
      cy.get('[data-cy="page-action-button"]').click();
      cy.get('[data-cy="page-action-item-saveAs"]').click();
      cy.get('#pgmt-radio-button-instance').find('[data-cy="unsaved-changes"]').should('have.text', 'Unsaved changes');
      cy.get('#pgmt-radio-button-instance > .ux-radio-button > .ux-radio-button-container').click();
      cy.get('[data-cy="pgmt-properties-instance-title"]').should('have.value', 'Copy of Widget with Context');
      cy.get('#icon-instance > .uif-icon-dropdown > .qtm-font-icon').click();
      cy.get('.dropdown-menu-text > i').last().click();
      cy.get('[data-cy="pgmt-properties-instance-title"]').clear().type('time modified');
      cy.get('[data-cy="categoryDropdownButton"]').click();
      cy.get('.filter-container input[type="text"]').type('context');
      cy.get('tree-node-children tree-node-collection').find('tree-node').its('length').should('be.eq', 1);
      cy.get('.highlight').first().click();
      cy.get('[data-cy="pgmt-properties-instance-description"]').clear().type('context test');
      cy.get('[data-cy="submit-button"]').click();
      cy.wait(['@menuEntry', '@getTOC']);
      cy.bvdCheckToast('Instance "time modified" saved successfully');
      cy.wait(['@getData', '@getData', '@getData', '@getData']);
      cy.get('[data-cy="side-nav-search-button"] > i').click();
      cy.wait(['@getTocOnlyFullControl', '@getData', '@getData', '@getData', '@getData']);
      cy.get('[data-cy="sideNavigation-search-input"]').type('time modified');
      cy.get('.highlight').should('contain.text', 'timemodified');
      cy.get('.mondrianBreadcrumbData > span').then($data => {
        expect($data).contain.text('time modified');
      });
      cy.url().should('include', 'uiTestWidgets').and('include', '_m').and('include', 'loadgen.mambo.net').and('include', '12hours');
      deleteInstance();
    });
  });

  describe('Pages with definition only (URL without _m)', shared.defaultTestOptions, () => {
    it('validate new instance', () => {
      saveAsDef();
      // validate Save As Dialog
      cy.get('#override-header > h2').should('have.text', 'Save As');
      cy.get('[for="pgmt-radio-button-definition-input"] > div').find('[aria-checked="true"]');
      cy.get('#pgmt-radio-button-instance > .ux-radio-button > .ux-radio-button-label').should('contain.text', 'Save as a new instance');
      cy.get('#pgmt-radio-button-instance > .ux-radio-button > .ux-radio-button-container').click();
      cy.get('[data-cy="pgmt-properties-instance-title-label"]').should('be.visible');
      cy.get('.page-icon-label-container > .control-label').should('be.visible');
      cy.get('[data-cy="categoryDropdownLabel"]').should('be.visible');
      cy.get('[for="pgmt-description-instance"]').should('be.visible');
      cy.get('[data-cy="submit-button"]').should('be.disabled');
      cy.get('[data-cy="cancel-button"]').should('be.enabled');
      cy.get('#icon-instance > .uif-icon-dropdown > .qtm-font-icon').click();
      cy.get('.dropdown-menu-text > i').last().click();
      cy.get('[data-cy="pgmt-properties-instance-title"]').should('have.value', '');
      cy.get('[data-cy="pgmt-properties-instance-title"]').type('Definition-instance');
      cy.get('[data-cy="categoryDropdownButton"]').should('have.value', '').click();
      cy.get('.filter-container input[type="text"]').type('pages');
      cy.get('tree-node-children tree-node-collection').find('tree-node').its('length').should('be.eq', 2);
      cy.get('.highlight').first().click();
      cy.get('[data-cy="submit-button"]').should('be.enabled');
      cy.get('[data-cy="cancel-button"]').should('be.enabled');
      cy.get('[data-cy="pgmt-properties-instance-description"]').clear().type('demo test');
      // validate the new instance
      cy.get('[data-cy="submit-button"]').click();
      cy.bvdCheckToast('Instance "Definition-instance" saved successfully');
      cy.get('[data-cy="side-nav-search-button"] > i').click();
      cy.wait(['@getTocOnlyFullControl', '@getTocOnlyFullControl']);
      cy.get('[data-cy="sideNavigation-search-input"]').type('Definition-instance');
      cy.get('.highlight').should('contain.text', 'Definition-instance');
      cy.get('.mondrianBreadcrumbData > span').then($data => {
        expect($data).contain.text('Definition-instance');
      });
      cy.get('[data-cy="breadcrumb-icon-pgmtDefinition"]').should('be.visible');
      cy.url().should('include', '_m').and('include', 'pgmtDefinition');
      cy.url().then(urlString => {
        shared.checkTenantInUrl(urlString);
      });
      deleteInstance();
    });

    it('Warning message "Unsaved changes" not to be displayed when there is Context change in page', () => {
      cy.visit('/uiTestWidgets');
      cy.wait(['@getTocOnlyFullControl', '@getTOC', '@getData', '@getData', '@getData', '@getData', '@getData', '@getData']);
      cy.get('[data-cy=context-filter-menu]').click();
      cy.get('[data-cy="RL12hours"]').click();
      cy.get('[data-cy="contextFilterApplyButton"]').click();
      cy.wait(['@getData', '@getData', '@getData', '@getData', '@getData', '@getData']);
      cy.get('[data-cy="page-action-button"]').click();
      cy.get('[data-cy=page-action-item-saveAs]').click();
      cy.get('#pgmt-radio-button-instance').should('not.have.text', 'Unsaved changes');
      cy.wait('@getTocOnlyFullControl');
      cy.get('[for="pgmt-radio-button-definition-input"] > div').find('[aria-checked="true"]');
      cy.get('[data-cy="pgmt-properties-definition-title"]').should('have.value', 'Copy of Widgets');
      cy.get('[data-cy="submit-button"]').should('be.enabled');
      cy.get('[data-cy="cancel-button"]').should('be.enabled');
    });

    it('Abort new instance', () => {
      saveAsDef();
      cy.get('[for="pgmt-radio-button-definition-input"] > div').find('[aria-checked="true"]');
      cy.get('#pgmt-radio-button-instance > .ux-radio-button > .ux-radio-button-container').click();
      cy.get('[data-cy="pgmt-properties-instance-title"]').should('have.value', '');
      cy.get('[data-cy="submit-button"]').should('be.disabled');
      cy.get('[data-cy="cancel-button"]').should('be.enabled');
      cy.get('#icon-instance > .uif-icon-dropdown > .qtm-font-icon').click();
      cy.get('.dropdown-menu-text > i').last().click();
      cy.get('[data-cy="pgmt-properties-instance-title"]').clear().type('Instance Test');
      cy.get('[data-cy="categoryDropdownButton"]').click();
      cy.get('.filter-container input[type="text"]').type('pages');
      cy.get('tree-node-children tree-node-collection').find('tree-node').its('length').should('be.eq', 2);
      cy.get('.highlight').last().click();
      cy.get('[data-cy="pgmt-properties-instance-description"]').clear().type('demo test');
      cy.get('[data-cy="cancel-button"]').click();
      cy.get('.mondrianBreadcrumbData > span').then($data => {
        expect($data).not.contain.text('Instance Test');
        expect($data).contain.text('Definition for new pgmt');
      });
    });
  });
});

describe('Page Mgmt - Save As a new definition', shared.defaultTestOptions, () => {
  beforeEach(() => {
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/pgmtDefinition*`
    }).as('getPage');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/widgets/*`
    }).as('getPgmtSaveAs');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/*`
    }).as('getPageComponents');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pages*`
    }).as('page');
    cy.intercept({
      method: 'DELETE',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pages/*`
    }).as('deletePage');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/menuEntries/pgmtInstance`
    }).as('getPgmtInstance');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/menuEntries*`
    }).as('getMenuEntries');
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
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/datasource/ws/data`
    }).as('getData');
    cy.bvdLogin();
  });

  describe('Pages having Menu Entry and definition (URL with _m)', shared.defaultTestOptions, () => {
    it('Validate new definition', () => {
      saveAs();
      cy.get('#override-header > h2').should('have.text', 'Save As');
      // validate save as definition dialog
      cy.get('#pgmt-radio-button-definition > label > span').should('contain.text', 'Save as a new definition');
      cy.get('#pgmt-radio-button-definition > .ux-radio-button > .ux-radio-button-container').click();
      cy.get('[data-cy="pgmt-properties-definition-title-label"]').should('be.visible');
      cy.get('[data-cy="pgmt-properties-definition-title"]').should('have.value', 'Copy of Definition for new pgmt');
      cy.get('.page-icon-label-container > .control-label').should('be.visible');
      cy.get('[data-cy="pgmt-properties-definition-description"]').should('be.visible');
      cy.get('[data-cy="submit-button"]').should('be.enabled');
      cy.get('[data-cy="cancel-button"]').should('be.enabled');
      cy.get('[data-cy="pgmt-properties-definition-title"]').clear().type('save definition test');
      cy.get('[data-cy="submit-button"]').should('be.enabled');
      cy.get('[data-cy="cancel-button"]').should('be.enabled');
      cy.get('[data-cy="pgmt-properties-definition-description"]').clear().type('definition test demo');
      // update save definition
      cy.get('[data-cy="submit-button"]').click();
      cy.bvdCheckToast('Definition "save definition test" saved successfully');
      let definitionIdSaveAs;
      cy.location('pathname').then(pathName => {
        definitionIdSaveAs = pathName.split('/')[2];
        cy.log(`definitionIdSaveAs: ${definitionIdSaveAs}`);
      });
      cy.get('.mondrianBreadcrumbData > span').then($data => {
        expect($data).contain.text('save definition test');
      });
      cy.url().should('not.include', 'pgmtDefinition').and('not.include', 'pgmtInstance')
        .and('not.include', 'savedefinitiontest').and('not.include', '_m');
      addToPageIDs();
    });

    it('Abort new definition', () => {
      saveAs();
      cy.get('#pgmt-radio-button-definition > .ux-radio-button > .ux-radio-button-container').click();
      cy.get('[data-cy="pgmt-properties-definition-title"]').clear();
      cy.get('[data-cy="pgmt-properties-definition-title"]').type('definition test');
      cy.get('[data-cy="pgmt-properties-definition-description"]').clear().type('definition test demo');
      cy.get('[data-cy="cancel-button"]').click();
      cy.url().should('include', 'pgmtDefinition').and('include', 'pgmtInstance').and('not.include', 'definitiontest').and('include', '_m');
      cy.get('.mondrianBreadcrumbData > span').then($data => {
        expect($data).not.contain.text('definition test');
      });
    });

    it('Validate the layout change - widget title change', () => {
      cy.visit('/uiTestSaveAs?_m=uiTestSaveAsInstance');
      cy.get('[data-cy="action-button"]').click();
      cy.get('[data-cy="action-button-edit"]').click();
      cy.get('[data-cy="widgetNameInput"]').clear().type('title changed');
      cy.get('[data-cy="btn-side-panel-close"]').click();
      cy.get('.dashboard-widget-title > span').should('have.text', 'title changed');
      cy.get('[data-cy="page-action-button"]').click();
      cy.get('[data-cy="page-action-item-saveAs"]').click();
      cy.get('#pgmt-radio-button-definition').find('[data-cy="unsaved-changes"]').should('have.text', 'Unsaved changes');
      cy.get('#pgmt-radio-button-definition > .ux-radio-button > .ux-radio-button-container').click();
      cy.get('[data-cy="pgmt-properties-definition-title"]').should('have.value', 'Copy of Test Page SaveAs');
      cy.get('[data-cy="pgmt-properties-definition-title"]').clear().type('Definition widget title');
      cy.get('#icon-definition > .uif-icon-dropdown > .qtm-font-icon').click();
      cy.get('.dropdown-menu-text > i').last().click();
      cy.get('[data-cy="submit-button"]').should('be.enabled');
      cy.get('[data-cy="cancel-button"]').should('be.enabled');
      cy.get('[data-cy="submit-button"]').click();
      cy.bvdCheckToast('Definition "Definition widget title" saved successfully');
      cy.get('.mondrianBreadcrumbData > span').then($data => {
        expect($data).contain.text('Definition widget title');
      });
      cy.url().should('not.include', 'uiTestSaveAs').and('not.include', 'Definitionwidgettitle').and('not.include', '_m');
      addToPageIDs();
    });

    it('Check the 2 definitions with the same name', () => {
      saveAs();
      cy.get('#pgmt-radio-button-definition > .ux-radio-button > .ux-radio-button-container').click();
      cy.get('[data-cy="pgmt-properties-definition-title"]').should('have.value', 'Copy of Definition for new pgmt');
      cy.get('[data-cy="pgmt-properties-definition-title"]').clear().type('A');
      cy.get('[data-cy="submit-button"]').should('be.enabled');
      cy.get('[data-cy="submit-button"]').click();
      cy.wait(['@getTOC', '@getPageComponents']);
      cy.bvdCheckToast('Definition "A" saved successfully');
      cy.get('.mondrianBreadcrumbData').contains('A');
      let definitionIdFirstSaveAs;
      cy.location('pathname').then(pathName => {
        definitionIdFirstSaveAs = pathName.split('/')[2];
        cy.log(`definitionIdFirstSaveAs: ${definitionIdFirstSaveAs}`);
        cy.wait('@getTOC');
        // SaveAs 'A' again
        saveAs();
        cy.get('#pgmt-radio-button-definition > .ux-radio-button > .ux-radio-button-container').click();
        cy.get('[data-cy="pgmt-properties-definition-title"]').should('have.value', 'Copy of Definition for new pgmt');
        cy.get('[data-cy="pgmt-properties-definition-title"]').clear().type('A');
        cy.get('[data-cy="submit-button"]').should('be.enabled');
        cy.get('[data-cy="submit-button"]').click();
        cy.wait(['@getTOC', '@getPageComponents']);
        cy.bvdCheckToast('Definition "A" saved successfully');
        cy.get('.mondrianBreadcrumbData').contains('A');
        cy.get('[data-cy="page-action-button"]').click();
        cy.get('.ux-menu').should('be.visible').contains('Delete');
        cy.get('[data-cy="page-action-item-delete"]').click();
        cy.get('[data-cy="mondrianModalDialogButton"]').click();
        cy.wait(['@deletePage', '@getMenuEntries', '@getTOC', '@getTOC']);
        // cleanup of the first page
        cy.visit(`/${definitionIdFirstSaveAs}`);
        cy.wait(['@getTOC', '@getTocOnlyFullControl']);
        cy.get('[data-cy="page-action-button"]').click();
        cy.get('.ux-menu').should('be.visible').contains('Delete');
        cy.get('[data-cy="page-action-item-delete"]').click();
        cy.get('[data-cy="mondrianModalDialogButton"]').click();
        cy.wait(['@deletePage', '@getMenuEntries', '@getTOC', '@getTOC']);
      });
    });
  });

  describe('Pages having definition only (URL without _m)', shared.defaultTestOptions, () => {
    it('Validate new definition', () => {
      saveAsDef();
      cy.get('#override-header > h2').should('have.text', 'Save As');
      // validate save as definition dialog
      cy.get('[for="pgmt-radio-button-definition-input"] > div').find('[aria-checked="true"]');
      cy.get('#pgmt-radio-button-definition > label > span').should('contain.text', 'Save as a new definition');
      cy.get('[data-cy="pgmt-properties-definition-title-label"]').should('be.visible');
      cy.get('[data-cy="pgmt-properties-definition-title"]').should('have.value', 'Copy of Definition for new pgmt');
      cy.get('.page-icon-label-container > .control-label').should('be.visible');
      cy.get('[for="pgmt-description-definition"]').should('be.visible');
      cy.get('[data-cy="submit-button"]').should('be.enabled');
      cy.get('[data-cy="cancel-button"]').should('be.enabled');
      cy.get('[data-cy="pgmt-properties-definition-title"]').clear().type('save definition');
      cy.get('[data-cy="submit-button"]').should('be.enabled');
      cy.get('[data-cy="cancel-button"]').should('be.enabled');
      cy.get('[data-cy="pgmt-properties-definition-description"]').clear().type('definition test demo');
      // update save definition
      cy.get('[data-cy="submit-button"]').click();
      cy.bvdCheckToast('Definition "save definition" saved successfully');
      let definitionIdSaveAs;
      cy.location('pathname').then(pathName => {
        definitionIdSaveAs = pathName.split('/')[2];
        cy.log(`definitionIdSaveAs: ${definitionIdSaveAs}`);
      });
      cy.get('.mondrianBreadcrumbData > span').then($data => {
        expect($data).contain.text('save definition');
      });
      cy.url().should('not.include', 'pgmtDefinition').and('not.include', 'pgmtInstance').and('not.include', 'savedefinition').and('not.include', '_m');
      addToPageIDs();
    });

    it('Abort new definition', () => {
      saveAsDef();
      cy.get('[for="pgmt-radio-button-definition-input"] > div').find('[aria-checked="true"]');
      cy.get('[data-cy="pgmt-properties-definition-title"]').should('have.value', 'Copy of Definition for new pgmt');
      cy.get('[data-cy="submit-button"]').should('be.enabled');
      cy.get('[data-cy="cancel-button"]').should('be.enabled');
      cy.get('[data-cy="pgmt-properties-definition-title"]').clear();
      cy.get('[data-cy="pgmt-properties-definition-title"]').type('definition cancel test');
      cy.get('[data-cy="submit-button"]').should('be.enabled');
      cy.get('[data-cy="cancel-button"]').should('be.enabled');
      cy.get('[data-cy="pgmt-properties-definition-description"]').clear().type('definition test demo');
      cy.get('[data-cy="cancel-button"]').click();
      cy.url().should('include', 'pgmtDefinition').and('not.include', 'definitioncanceltest').and('not.include', '_m');
      cy.get('.mondrianBreadcrumbData > span').then($data => {
        expect($data).not.contain.text('definition cancel test');
      });
    });

    it('Validate the layout change - Duplicate Widget', () => {
      cy.visit('/uiTestSaveAs');
      cy.get('[data-cy="action-button"]').click();
      cy.get('[data-cy="action-button-duplicateWidget"]').click();
      cy.get('[data-cy="action-button"]').should('have.length', 2);
      cy.get('[data-cy="page-action-button"]').click();
      // Validate Save As dialog
      cy.get('[data-cy="page-action-item-saveAs"]').click();
      cy.wait('@getTocOnlyFullControl');
      cy.get('#pgmt-radio-button-instanceDefinition').find('[data-cy="unsaved-changes"]').should('have.text', 'Unsaved changes');
      cy.get('#pgmt-radio-button-definition').find('[data-cy="unsaved-changes"]').should('have.text', 'Unsaved changes');
      cy.get('[for="pgmt-radio-button-definition-input"] > div').find('[aria-checked="true"]');
      cy.get('[data-cy="pgmt-properties-definition-title"]').should('have.value', 'Copy of Test Page SaveAs');
      cy.get('[data-cy="submit-button"]').should('be.enabled');
      cy.get('[data-cy="cancel-button"]').should('be.enabled');
      cy.get('[data-cy="pgmt-properties-definition-title"]').clear().type('duplicate widget');
      cy.get('#icon-definition > .uif-icon-dropdown > .qtm-font-icon').click();
      cy.get('.dropdown-menu-text > i').last().click();
      cy.get('[data-cy="submit-button"]').should('be.enabled');
      cy.get('[data-cy="cancel-button"]').should('be.enabled');
      cy.get('[data-cy="submit-button"]').click();
      cy.bvdCheckToast('Definition "duplicate widget" saved successfully');
      cy.wait('@getTocOnlyFullControl');
      cy.get('.mondrianBreadcrumbData > span').then($data => {
        expect($data).contain.text('duplicate widget');
      });
      cy.url().should('not.include', 'uiTestSaveAs').and('not.include', '_m');
      addToPageIDs();
    });
  });
  afterEach(() => {
    shared.deletePages(pageIDs);
  });
});

describe('Page Mgmt - Save As a new instance-definition', shared.defaultTestOptions, () => {
  beforeEach(() => {
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/pgmtDefinition*`
    }).as('getPage');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/widgets/*`
    }).as('getPgmtSaveAs');
    cy.intercept({
      method: 'POST',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/menuEntries`
    }).as('menuEntry');
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
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pages*`
    }).as('getUpdatePage');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/widgets/pgmt_save_as`
    }).as('getSaveas');
    cy.bvdLogin();
  });

  describe('Pages with Menu Entry and definition (with _m in URL)', shared.defaultTestOptions, () => {
    it('Validate new instance-definition', () => {
      saveAs();
      // validate instance-definition dialog
      cy.get('#override-header > h2').should('have.text', 'Save As');
      cy.get('#pgmt-radio-button-instanceDefinition > label > span').should('contain.text', ' Save as a new instance and a new definition');
      cy.get('#pgmt-radio-button-instanceDefinition > .ux-radio-button > .ux-radio-button-container').click();
      cy.get('[data-cy="pgmt-properties-instanceDefinition-instance-title-label"]').should('be.visible');
      cy.get('.page-icon-label-container > .control-label').should('be.visible');
      cy.get('[data-cy="categoryDropdownLabel"]').should('be.visible');
      cy.get('[for="pgmt-description-instanceDefinition-instance"]').should('be.visible');
      cy.get('[data-cy="pgmt-properties-instanceDefinition-definition-title-label"]').scrollIntoView().should('be.visible');
      cy.get('[for="icon-instanceDefinition-definition"]').should('be.visible');
      cy.get('[for="pgmt-description-instanceDefinition-definition"]').should('be.visible');
      cy.get('[data-cy="submit-button"]').should('be.enabled');
      cy.get('[data-cy="cancel-button"]').should('be.enabled');
      // update instance and definition
      cy.get('[data-cy="pgmt-properties-instanceDefinition-instance-title"]').should('have.value', 'Copy of Instance for new pgmt');
      cy.get('[data-cy="pgmt-properties-instanceDefinition-definition-title"]').scrollIntoView().should('have.value', 'Copy of Definition for new pgmt-definition');
      cy.get('[data-cy="pgmt-properties-instanceDefinition-instance-title"]').clear().type('new instance');
      cy.get('[data-cy="pgmt-properties-instanceDefinition-definition-title"]').should('have.value', 'new instance-definition');
      cy.get('#icon-instanceDefinition-instance > .uif-icon-dropdown > .qtm-font-icon').click();
      cy.get('.dropdown-menu-text > i').last().click();
      cy.get('[data-cy="categoryDropdownButton"]').click();
      cy.get('.filter-container input[type="text"]').type('full');
      cy.get('tree-node-children tree-node-collection').find('tree-node').its('length').should('be.eq', 1);
      cy.get('.highlight').first().click();
      cy.get('#icon-instanceDefinition-definition > .uif-icon-dropdown > .qtm-font-icon').click();
      cy.get('.dropdown-menu-text > i').last().click();
      cy.get('[data-cy="pgmt-properties-instanceDefinition-definition-description"]').clear().type('instance-definition test demo');
      cy.get('[data-cy="submit-button"]').should('be.enabled');
      cy.get('[data-cy="cancel-button"]').should('be.enabled');
      cy.get('[data-cy="submit-button"]').click();
      cy.wait(['@menuEntry', '@getTOC']);
      cy.bvdCheckToast('Definition "new instance-definition" and instance "new instance" saved successfully');
      cy.get('[data-cy="side-nav-search-button"] > i').click();
      cy.wait('@getTocOnlyFullControl');
      cy.get('[data-cy="sideNavigation-search-input"]').type('new instance');
      cy.get('.highlight').should('contain.text', 'newinstance');
      cy.get('.mondrianBreadcrumbData > span').then($data => {
        expect($data).contain.text('new instance');
      });
      cy.url().should('not.include', 'pgmtDefinition').and('not.include', 'pgmtInstance')
        .and('not.include', 'newinstance-definition').and('include', '_m');
      deleteInstance();
    });

    it('Abort new instance-definition', () => {
      saveAs();
      cy.get('#pgmt-radio-button-instanceDefinition > .ux-radio-button > .ux-radio-button-container').click();
      cy.get('[data-cy="pgmt-properties-instanceDefinition-instance-title"]').clear().type('new instance-definition');
      cy.get('[data-cy="pgmt-properties-instanceDefinition-definition-title"]').scrollIntoView().should('have.value', 'new instance-definition-definition');
      cy.get('[data-cy="pgmt-properties-instanceDefinition-definition-description"]').scrollIntoView().clear().type('instance-definition test demo');
      cy.get('[data-cy="cancel-button"]').click();
      cy.url().should('include', 'pgmtDefinition').and('not.include', 'newinstance-definition');
      cy.get('.mondrianBreadcrumbData > span').then($data => {
        expect($data).not.contain.text('new instance-definition');
      });
    });

    it('Validate the Context change', () => {
      cy.visit('/uiTestHasTimeCtx?_m=hasTimeContextEntry');
      cy.wait(['@getTocOnlyFullControl', '@getTOC']);
      cy.get('simple-list').contains('oba.mambo.net');
      cy.get('[data-cy="oba.mambo.net"]').click();
      cy.get('[data-cy="page-action-button"]').click();
      cy.get('[data-cy="page-action-item-saveAs"]').click();
      cy.get('#pgmt-radio-button-instanceDefinition').find('[data-cy="unsaved-changes"]').should('have.text', 'Unsaved changes');
      cy.get('#pgmt-radio-button-instanceDefinition > .ux-radio-button > .ux-radio-button-container').click();
      cy.get('[data-cy="pgmt-properties-instanceDefinition-instance-title"]').should('have.value', 'Copy of Has Time Ctx');
      cy.get('[data-cy="pgmt-properties-instanceDefinition-definition-title"]').scrollIntoView().should('have.value', 'Copy of Has Time Ctx-definition');
      cy.get('#icon-instanceDefinition-instance > .uif-icon-dropdown > .qtm-font-icon').click();
      cy.get('.dropdown-menu-text > i').last().click();
      cy.get('[data-cy="pgmt-properties-instanceDefinition-instance-title"]').clear().type('context modified');
      cy.get('[data-cy="pgmt-properties-instanceDefinition-definition-title"]').scrollIntoView().should('have.value', 'context modified-definition');
      cy.get('[data-cy="categoryDropdownButton"]').click();
      cy.get('.filter-container input[type="text"]').type('context');
      cy.get('tree-node-children tree-node-collection').find('tree-node').its('length').should('be.eq', 1);
      cy.get('.highlight').first().click();
      cy.get('[data-cy="pgmt-properties-instanceDefinition-instance-description"]').clear().type('context test');
      cy.get('[data-cy="submit-button"]').click();
      cy.wait(['@menuEntry', '@getTOC']);
      cy.bvdCheckToast('Definition "context modified-definition" and instance "context modified" saved successfully');
      cy.get('[data-cy="side-nav-search-button"] > i').click();
      cy.wait(['@getTocOnlyFullControl', '@getTocOnlyFullControl']);
      cy.get('[data-cy="sideNavigation-search-input"]').type('context modified');
      cy.get('.highlight').should('contain.text', 'contextmodified');
      cy.get('.mondrianBreadcrumbData > span').then($data => {
        expect($data).contain.text('context modified');
      });
      cy.url().should('not.include', 'uiTestHasTimeCtx').and('include', '_m')
        .and('not.include', 'contextmodified-definition');
      deleteInstance();
    });

    it('Validate the layout change - Duplicate Widget', () => {
      cy.visit('uiTestSaveAs');
      cy.wait(['@getTocOnlyFullControl', '@getTOC']);
      cy.get('[data-cy="action-button"]').its('length').should('be.eq', 1);
      cy.get('[data-cy="action-button"]').click();
      cy.get('[data-cy="action-button-duplicateWidget"]').click();
      cy.get('[data-cy="action-button"]').should('have.length', 2);
      cy.get('[data-cy="page-action-button"]').click();
      cy.get('[data-cy="page-action-item-saveAs"]').click();
      cy.wait('@getSaveas');
      cy.get('#pgmt-radio-button-instanceDefinition').find('[data-cy="unsaved-changes"]').should('have.text', 'Unsaved changes');
      cy.get('#pgmt-radio-button-definition').find('[data-cy="unsaved-changes"]').should('have.text', 'Unsaved changes');
      cy.get('#pgmt-radio-button-instanceDefinition > .ux-radio-button > .ux-radio-button-container').click();
      cy.get('[data-cy="pgmt-properties-instanceDefinition-instance-title"]').should('have.value', '');
      cy.get('[data-cy="pgmt-properties-instanceDefinition-definition-title"]').scrollIntoView().should('have.value', 'Copy of Test Page SaveAs-definition');
      cy.get('#icon-instanceDefinition-instance > .uif-icon-dropdown > .qtm-font-icon').click();
      cy.get('.dropdown-menu-text > i').last().click();
      cy.get('[data-cy="pgmt-properties-instanceDefinition-instance-title"]').clear().type('Layout modified');
      cy.get('[data-cy="pgmt-properties-instanceDefinition-definition-title"]').scrollIntoView().should('have.value', 'Layout modified-definition');
      cy.get('[data-cy="categoryDropdownButton"]').click();
      cy.get('.filter-container input[type="text"]').type('context');
      cy.get('tree-node-children tree-node-collection').find('tree-node').its('length').should('be.eq', 1);
      cy.get('.highlight').first().click();
      cy.get('#icon-instanceDefinition-definition > .uif-icon-dropdown > .qtm-font-icon').click();
      cy.get('.dropdown-menu-text > i').last().click();
      cy.get('[data-cy="submit-button"]').click();
      cy.wait(['@menuEntry', '@getTOC']);
      cy.bvdCheckToast('Definition "Layout modified-definition" and instance "Layout modified" saved successfully');
      cy.get('[data-cy="side-nav-search-button"] > i').click();
      cy.wait(['@getTocOnlyFullControl', '@getTocOnlyFullControl']);
      cy.get('[data-cy="sideNavigation-search-input"]').type('Layout modified');
      cy.get('.highlight').should('contain.text', 'Layoutmodified');
      cy.get('.mondrianBreadcrumbData > span').then($data => {
        expect($data).contain.text('Layout modified');
      });
      cy.url().should('not.include', 'uiTestSaveAs').and('not.include', 'Layoutmodified-definition')
        .and('include', '_m');
      deleteInstance();
      addToPageIDs();
    });
  });

  describe('Pages definition only(without _m in URL)', shared.defaultTestOptions, () => {
    it('Validate new instance-definition', () => {
      saveAsDef();
      // validate instance-definition dialog
      cy.get('#override-header > h2').should('have.text', 'Save As');
      cy.get('[for="pgmt-radio-button-definition-input"] > div').find('[aria-checked="true"]');
      cy.get('[data-cy="pgmt-properties-definition-title"]').should('have.value', 'Copy of Definition for new pgmt');
      cy.get('[data-cy="submit-button"]').should('be.enabled');
      cy.get('[data-cy="cancel-button"]').should('be.enabled');
      cy.get('#pgmt-radio-button-instanceDefinition > label > span').should('contain.text', ' Save as a new instance and a new definition');
      cy.get('#pgmt-radio-button-instanceDefinition > .ux-radio-button > .ux-radio-button-container').click();
      cy.get('[data-cy="pgmt-properties-instanceDefinition-instance-title-label"]').should('be.visible');
      cy.get('.page-icon-label-container > .control-label').should('be.visible');
      cy.get('[data-cy="categoryDropdownLabel"]').should('be.visible');
      cy.get('[for="pgmt-description-instanceDefinition-instance"]').should('be.visible');
      cy.get('[data-cy="pgmt-properties-instanceDefinition-definition-title-label"]').scrollIntoView().should('be.visible');
      cy.get('[for="icon-instanceDefinition-definition"]').should('be.visible');
      cy.get('[for="pgmt-description-instanceDefinition-definition"]').should('be.visible');
      cy.get('[data-cy="submit-button"]').should('be.disabled');
      cy.get('[data-cy="cancel-button"]').should('be.enabled');
      // update instance and definition
      cy.get('[data-cy="pgmt-properties-instanceDefinition-instance-title"]').should('have.value', '');
      cy.get('[data-cy="pgmt-properties-instanceDefinition-definition-title"]').scrollIntoView().should('have.value', 'Copy of Definition for new pgmt-definition');
      cy.get('[data-cy="pgmt-properties-instanceDefinition-instance-title"]').type('new def instance');
      cy.get('[data-cy="pgmt-properties-instanceDefinition-definition-title"]').should('have.value', 'new def instance-definition');
      cy.get('#icon-instanceDefinition-instance > .uif-icon-dropdown > .qtm-font-icon').click();
      cy.get('.dropdown-menu-text > i').last().click();
      cy.get('[data-cy="categoryDropdownButton"]').should('have.value', '').click();
      cy.get('.filter-container input[type="text"]').type('full');
      cy.get('tree-node-children tree-node-collection').find('tree-node').its('length').should('be.eq', 1);
      cy.get('.highlight').first().click();
      cy.get('#icon-instanceDefinition-definition > .uif-icon-dropdown > .qtm-font-icon').click();
      cy.get('.dropdown-menu-text > i').last().click();
      cy.get('[data-cy="pgmt-properties-instanceDefinition-definition-description"]').clear().type('instance-definition test demo');
      cy.get('[data-cy="submit-button"]').should('be.enabled');
      cy.get('[data-cy="cancel-button"]').should('be.enabled');
      cy.get('[data-cy="submit-button"]').click();
      cy.wait(['@menuEntry', '@getTOC']);
      cy.bvdCheckToast('Definition "new def instance-definition" and instance "new def instance" saved successfully');
      cy.get('[data-cy="side-nav-search-button"] > i').click();
      cy.wait(['@getTocOnlyFullControl', '@getTocOnlyFullControl']);
      cy.get('[data-cy="sideNavigation-search-input"]').type('new def instance');
      cy.get('.highlight').should('contain.text', 'newdefinstance');
      cy.get('.mondrianBreadcrumbData > span').then($data => {
        expect($data).contain.text('new def instance');
      });
      cy.url().should('not.include', 'pgmtDefinition').and('not.include', 'pgmtInstance')
        .and('not.include', 'newdefinstance-definition').and('include', '_m');
      deleteInstance();
    });

    it('Abort new instance-definition', () => {
      saveAsDef();
      cy.get('[for="pgmt-radio-button-definition-input"] > div').find('[aria-checked="true"]');
      cy.get('[data-cy="pgmt-properties-definition-title"]').should('have.value', 'Copy of Definition for new pgmt');
      cy.get('[data-cy="submit-button"]').should('be.enabled');
      cy.get('[data-cy="cancel-button"]').should('be.enabled');
      cy.get('#pgmt-radio-button-instanceDefinition > .ux-radio-button > .ux-radio-button-container').click();
      cy.get('[data-cy="pgmt-properties-instanceDefinition-instance-title"]').type('cancel instance-definition');
      cy.get('[data-cy="pgmt-properties-instanceDefinition-definition-title"]').scrollIntoView().should('have.value', 'cancel instance-definition-definition');
      cy.get('[data-cy="categoryDropdownButton"]').should('have.value', '').click();
      cy.get('.filter-container input[type="text"]').type('full');
      cy.get('tree-node-children tree-node-collection').find('tree-node').its('length').should('be.eq', 1);
      cy.get('.highlight').first().click();
      cy.get('[data-cy="pgmt-properties-instanceDefinition-definition-description"]').clear().type('instance-definition test demo');
      cy.get('[data-cy="submit-button"]').should('be.enabled');
      cy.get('[data-cy="cancel-button"]').should('be.enabled');
      cy.get('[data-cy="cancel-button"]').click();
      cy.url().should('include', 'pgmtDefinition').and('not.include', 'cancelinstance-definition-definition').and('not.include', '_m');
      cy.get('.mondrianBreadcrumbData > span').then($data => {
        expect($data).not.contain.text('cancel instance-definition');
      });
    });

    it('Validate the layout change - widget title', () => {
      cy.visit('/uiTestSaveAs');
      cy.get('[data-cy="action-button"]').click();
      cy.get('[data-cy="action-button-edit"]').click();
      cy.get('[data-cy="widgetNameInput"]').clear().type('change title');
      cy.get('[data-cy="btn-side-panel-close"]').click();
      cy.get('.dashboard-widget-title > span').should('have.text', 'change title');
      cy.get('[data-cy="page-action-button"]').click();
      cy.get('[data-cy="page-action-item-saveAs"]').click();
      cy.get('[for="pgmt-radio-button-definition-input"] > div').find('[aria-checked="true"]');
      cy.get('#pgmt-radio-button-instanceDefinition').find('[data-cy="unsaved-changes"]').should('have.text', 'Unsaved changes');
      cy.get('#pgmt-radio-button-definition').find('[data-cy="unsaved-changes"]').should('have.text', 'Unsaved changes');
      cy.get('[data-cy="submit-button"]').should('be.enabled');
      cy.get('[data-cy="cancel-button"]').should('be.enabled');
      cy.get('#pgmt-radio-button-instanceDefinition > .ux-radio-button > .ux-radio-button-container').click();
      cy.get('[data-cy=pgmt-properties-instanceDefinition-instance-title]').should('have.value', '');
      cy.get('[data-cy="pgmt-properties-instanceDefinition-definition-title"]').scrollIntoView().should('have.value', 'Copy of Test Page SaveAs-definition');
      cy.get('[data-cy="submit-button"]').should('be.disabled');
      cy.get('[data-cy="cancel-button"]').should('be.enabled');
      cy.get('#icon-instanceDefinition-instance > .uif-icon-dropdown > .qtm-font-icon').click();
      cy.get('.dropdown-menu-text > i').last().click();
      cy.get('[data-cy="pgmt-properties-instanceDefinition-instance-title"]').type('Change Widget Title');
      cy.get('[data-cy="pgmt-properties-instanceDefinition-definition-title"]').scrollIntoView().should('have.value', 'Change Widget Title-definition');
      cy.get('[data-cy="categoryDropdownButton"]').click();
      cy.get('.filter-container input[type="text"]').type('context');
      cy.get('tree-node-children tree-node-collection').find('tree-node').its('length').should('be.eq', 1);
      cy.get('.highlight').first().click();
      cy.get('#icon-instanceDefinition-definition > .uif-icon-dropdown > .qtm-font-icon').click();
      cy.get('.dropdown-menu-text > i').last().click();
      cy.get('[data-cy="submit-button"]').click();
      cy.wait(['@menuEntry', '@getUpdatePage']);
      cy.bvdCheckToast('Definition "Change Widget Title-definition" and instance "Change Widget Title" saved successfully');
      cy.get('[data-cy="side-nav-search-button"] > i').click();
      cy.wait(['@getTocOnlyFullControl', '@getTocOnlyFullControl']);
      cy.get('[data-cy="sideNavigation-search-input"]').type('Change Widget Title');
      cy.get('.highlight').should('contain.text', 'ChangeWidgetTitle');
      cy.get('.mondrianBreadcrumbData > span').then($data => {
        expect($data).contain.text('Change Widget Title');
      });
      cy.url().should('not.include', 'uiTestSaveAs').and('not.include', 'ChangeWidgetTitle-definition')
        .and('include', '_m');
      deleteInstance();
      addToPageIDs();
    });

    it('Pages with dots as name', () => {
      cy.visit('/uiTestSaveAs');
      // SaveAs '.'
      cy.get('[data-cy="page-action-button"]').click();
      cy.get('[data-cy="page-action-item-saveAs"]').click();
      cy.wait('@getSaveas');
      cy.get('#pgmt-radio-button-instanceDefinition > .ux-radio-button > .ux-radio-button-container').click();
      cy.get('[data-cy="pgmt-properties-instanceDefinition-instance-title"]').should('have.value', '');
      cy.get('[data-cy="pgmt-properties-instanceDefinition-definition-title"]').scrollIntoView().should('have.value', 'Copy of Test Page SaveAs-definition');
      cy.get('[data-cy="pgmt-properties-instanceDefinition-instance-title"]').clear().type('.');
      cy.get('[data-cy="pgmt-properties-instanceDefinition-definition-title"]').should('have.value', '.-definition');
      cy.get('[data-cy="categoryDropdownButton"]').click();
      cy.get('.filter-container input[type="text"]').type('Pages');
      cy.get('tree-node-children tree-node-collection').find('tree-node').its('length').should('be.eq', 2);
      cy.get('.highlight').first().click();
      cy.get('[data-cy="submit-button"]').should('be.enabled');
      cy.get('[data-cy="submit-button"]').click();
      cy.wait(['@menuEntry', '@getUpdatePage']);
      cy.bvdCheckToast('Definition ".-definition" and instance "." saved successfully');
      cy.get('[data-cy="side-nav-search-button"] > i').click();
      cy.wait(['@getTocOnlyFullControl', '@getTocOnlyFullControl']);
      cy.get('.mondrianBreadcrumbData > span').then($data => {
        expect($data).contain.text('.');
      });
      cy.url().should('not.include', '.-definition__').and('not.include', 'uiTestSaveAs');
      deleteInstance();
      // SaveAs '..'
      cy.visit('/uiTestSaveAs');
      cy.get('[data-cy="page-action-button"]').click();
      cy.get('[data-cy="page-action-item-saveAs"]').click();
      cy.wait('@getSaveas');
      cy.get('#pgmt-radio-button-instanceDefinition > .ux-radio-button > .ux-radio-button-container').click();
      cy.get('[data-cy="pgmt-properties-instanceDefinition-instance-title"]').should('have.value', '');
      cy.get('[data-cy="pgmt-properties-instanceDefinition-definition-title"]').scrollIntoView().should('have.value', 'Copy of Test Page SaveAs-definition');
      cy.get('[data-cy="pgmt-properties-instanceDefinition-instance-title"]').clear().type('..');
      cy.get('[data-cy="pgmt-properties-instanceDefinition-definition-title"]').should('have.value', '..-definition');
      cy.get('[data-cy="categoryDropdownButton"]').click();
      cy.get('.filter-container input[type="text"]').type('Pages');
      cy.get('tree-node-children tree-node-collection').find('tree-node').its('length').should('be.eq', 2);
      cy.get('.highlight').first().click();
      cy.get('[data-cy="submit-button"]').should('be.enabled');
      cy.get('[data-cy="submit-button"]').click();
      cy.wait(['@menuEntry', '@getUpdatePage']);
      cy.bvdCheckToast('Definition "..-definition" and instance ".." saved successfully');
      cy.get('[data-cy="side-nav-search-button"] > i').click();
      cy.wait(['@getTocOnlyFullControl', '@getTocOnlyFullControl']);
      cy.get('.mondrianBreadcrumbData > span').then($data => {
        expect($data).contain.text('..');
      });
      cy.url().should('not.include', '..-definition__').and('not.include', 'uiTestSaveAs').and('include', '_m');
      deleteInstance();
      // SaveAs '...'
      cy.visit('/uiTestSaveAs');
      cy.get('[data-cy="page-action-button"]').click();
      cy.get('[data-cy="page-action-item-saveAs"]').click();
      cy.wait('@getSaveas');
      cy.get('#pgmt-radio-button-instanceDefinition > .ux-radio-button > .ux-radio-button-container').click();
      cy.get('[data-cy="pgmt-properties-instanceDefinition-instance-title"]').should('have.value', '');
      cy.get('[data-cy="pgmt-properties-instanceDefinition-definition-title"]').scrollIntoView().should('have.value', 'Copy of Test Page SaveAs-definition');
      cy.get('[data-cy="pgmt-properties-instanceDefinition-instance-title"]').clear().type('...');
      cy.get('[data-cy="pgmt-properties-instanceDefinition-definition-title"]').should('have.value', '...-definition');
      cy.get('[data-cy="categoryDropdownButton"]').click();
      cy.get('.filter-container input[type="text"]').type('Pages');
      cy.get('tree-node-children tree-node-collection').find('tree-node').its('length').should('be.eq', 2);
      cy.get('.highlight').first().click();
      cy.get('[data-cy="submit-button"]').should('be.enabled');
      cy.get('[data-cy="submit-button"]').click();
      cy.wait(['@menuEntry', '@getUpdatePage']);
      cy.bvdCheckToast('Definition "...-definition" and instance "..." saved successfully');
      cy.get('[data-cy="side-nav-search-button"] > i').click();
      cy.wait(['@getTocOnlyFullControl', '@getTocOnlyFullControl']);
      cy.get('.mondrianBreadcrumbData > span').then($data => {
        expect($data).contain.text('...');
      });
      deleteInstance();
      cy.url().should('not.include', '...-definition__').and('not.include', 'uiTestSaveAs').and('include', '_m');
      addToPageIDs();
    });
  });
  afterEach(() => {
    shared.deletePages(pageIDs);
  });
});
