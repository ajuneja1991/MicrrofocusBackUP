// <reference types="Cypress" />
const shared = require('../../../shared/shared');
const createDefinition = function() {
  shared.createNewPage('pgmtDefDelete', 'pgmtDefDelete', null, null, pageCreatedRes => {
    cy.visit('/pgmtDefDelete');
    cy.wait(['@getDeletePage', '@getTOC', '@getTOC']);
    expect(pageCreatedRes.status).to.equal(200);
  });
};

const createInstance = function() {
  shared.createMenuEntryAPI('Delete for new pgmt', 'T7', 'pgmtDefDelete', newMenuEntry => {
    cy.visit(`/pgmtDefDelete?_m=${newMenuEntry.id}`);
    cy.wait(['@getTOC', '@getTocOnlyFullControl']);
    cy.get('.mondrianBreadcrumbData > span').then($data => {
      expect($data).contain.text('Delete for new pgmt');
    });
  });
};

describe('Pgmt Delete - Current Instance only', shared.defaultTestOptions, () => {
  beforeEach(() => {
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/pgmtDefDelete*`
    }).as('getDeletePage');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/pgmtDefinition*`
    }).as('getPage');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/menuEntries/*`
    }).as('getPgmtInstance');
    cy.intercept({
      method: 'POST',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/menuEntries`
    }).as('createPgmtInstance');
    cy.intercept({
      method: 'PUT',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/menuEntries/*`
    }).as('updatePgmtInstance');
    cy.intercept({
      method: 'DELETE',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/menuEntries/*`
    }).as('deletePgmtInstance');
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
    }).as('getSaveAs');
    cy.bvdLogin();
  });

  it('Validate with Save As - new instance ', () => {
    cy.visit('/pgmtDefinition?_m=pgmtInstance');
    cy.wait(['@getTOC', '@getPage', '@getTocOnlyFullControl']);
    cy.get('[data-cy="page-action-button"]').click();
    cy.get('[data-cy="page-action-item-saveAs"]').click();
    cy.get('#pgmt-radio-button-instance > .ux-radio-button > .ux-radio-button-container').click();
    cy.get('[data-cy="pgmt-properties-instance-title"]').clear().type('Demo Instance Delete');
    cy.get('[data-cy="submit-button"]').click();
    cy.wait(['@createPgmtInstance', '@getTOC']);
    cy.bvdCheckToast('Instance "Demo Instance Delete" saved successfully');
    cy.wait('@getPage');
    cy.get('[data-cy="side-nav-search-button"] > i').click();
    cy.wait('@getTocOnlyFullControl');
    cy.get('[data-cy="sideNavigation-search-input"]').type('Demo Instance Delete');
    cy.get('.highlight').should('contain.text', 'DemoInstanceDelete');
    cy.get('.ux-side-menu-toggle').click();
    cy.get('.mondrianBreadcrumbData > span').then($data => {
      expect($data).contain.text('Demo Instance Delete');
    });
    cy.get('[data-cy="page-action-button"]').click();
    cy.get('.ux-menu').should('be.visible').contains('Delete');
    cy.get('[data-cy="page-action-item-delete"]').click();
    cy.get('#modal-title').should('have.text', 'DELETE INSTANCE OR DEFINITION');
    cy.get('[data-cy="radiobutton-delete-instance"] > label > div > input').should('be.checked');
    cy.get('[data-cy="radiobutton-delete-definition"] > label > div > input').should('not.be.checked');
    cy.get('[data-cy="radiobutton-delete-instance"] > .ux-radio-button > .ux-radio-button-label').should('contain.text', 'Delete the current instance only');
    cy.get('[data-cy="radiobutton-delete-definition"] > .ux-radio-button > .ux-radio-button-label').then($data => {
      expect($data.text()).to.contain('Delete this definition and all the instances that reference it');
    });
    cy.get('[data-cy="mondrianModalDialogButton"]').should('be.visible').and('be.enabled');
    cy.get('[data-cy="mondrianModalDialogCancelButton"]').should('be.visible').and('be.enabled');
    cy.get('[data-cy="mondrianModalDialogButton"]').click();
    cy.wait(['@getPgmtInstance', '@deletePgmtInstance', '@getTOC']);
    cy.bvdCheckToast('Instance removed successfully');
    cy.wait('@getPage');
    cy.get('[data-cy="side-nav-search-button"] > i').click();
    cy.wait('@getTocOnlyFullControl');
    cy.get('[data-cy="sideNavigation-search-input"]').type('Demo Instance Delete');
    cy.get('[data-cy="no-entries-found-message"]').should('be.visible');
    cy.url().should('include', 'pgmtDefinition').and('not.include', 'pgmtInstance').and('not.include', '_m');
  });

  it('Validate when multiple instances are present with same name', () => {
    createDefinition();
    createInstance();
    cy.get('[data-cy="page-action-button"]').click();
    cy.get('[data-cy=page-action-item-saveAs]').click();
    cy.wait(['@getSaveAs', '@getPgmtInstance', '@getTOC']);
    cy.get('#pgmt-radio-button-instance > .ux-radio-button > .ux-radio-button-container').click();
    cy.get('@getPgmtInstance');
    cy.get('[data-cy="submit-button"]').click();
    cy.wait(['@createPgmtInstance', '@getTOC']);
    cy.bvdCheckToast('Instance "Copy of Delete for new pgmt" saved successfully');
    cy.wait(['@getTOC', '@getDeletePage']);
    cy.get('[data-cy="side-nav-search-button"] > i').click();
    cy.wait('@getTocOnlyFullControl');
    cy.get('[data-cy="sideNavigation-search-input"]').type('Delete for new pgmt');
    cy.get('[id^=thirdLevelItem_]').should('have.length', 2);
    cy.get('[id^="thirdLevelItem_"]').eq(0).click();
    cy.wait(['@getTOC', '@getDeletePage']);
    cy.get('.ux-side-menu-toggle').click();
    cy.url().should('include', 'pgmtDefDelete').and('include', '_m');
    cy.get('[data-cy="page-action-button"]').click();
    cy.get('.ux-menu').should('be.visible').contains('Delete');
    cy.get('[data-cy="page-action-item-delete"]').click();
    cy.get('#modal-title').should('have.text', 'DELETE INSTANCE OR DEFINITION');
    cy.get('[data-cy="radiobutton-delete-instance"] > label > span').should('contain.text', 'Delete the current instance only');
    cy.get('[data-cy="radiobutton-delete-definition"] >  label > span').then($data => {
      expect($data.text()).to.contain('Delete this definition and all the instances that reference it');
    });
    cy.get('[data-cy="mondrianModalDialogButton"]').click();
    cy.wait(['@getPgmtInstance', '@deletePgmtInstance', '@getTOC', '@getDeletePage', '@getTOC']);
    cy.bvdCheckToast('Instance removed successfully');
    cy.get('[data-cy="sideNavigation-search-input"]').type('Delete for new pgmt');
    cy.get('[id^=thirdLevelItem_]').should('have.length', 1);
    cy.url().should('include', 'pgmtDefDelete').and('not.include', 'pgmtInstance').and('not.include', '_m');
  });

  afterEach(() => {
    shared.deletePages(['pgmtDefDelete']);
  });
});

describe('Pgmt Delete - Delete the definition and all instances that reference it', shared.defaultTestOptions, () => {
  beforeEach(() => {
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/pgmtDefDelete*`
    }).as('getDeletePage');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/menuEntries/*`
    }).as('getPgmtInstance');
    cy.intercept({
      method: 'POST',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/menuEntries`
    }).as('createPgmtInstance');
    cy.intercept({
      method: 'PUT',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/menuEntries/*`
    }).as('updatePgmtInstance');
    cy.intercept({
      method: 'DELETE',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/menuEntries/*`
    }).as('deletePgmtInstance');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pages/toc?onlyFullControl*`
    }).as('getTocOnlyFullControl');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pages/toc*`
    }).as('getTOC');
    cy.bvdLogin();
  });

  it('Validate with Save As-new instance', () => {
    createDefinition();
    cy.get('[data-cy="page-action-button"]').click();
    cy.get('[data-cy="page-action-item-saveAs"]').click();
    cy.get('#pgmt-radio-button-instance > .ux-radio-button > .ux-radio-button-container').click();
    cy.get('[data-cy="pgmt-properties-instance-title"]').clear().type('Demo All Instance Delete');
    cy.get('[data-cy="categoryDropdownButton"]').click();
    cy.get('.filter-container input[type="text"]').type('pages');
    cy.get('tree-node-children tree-node-collection').find('tree-node').its('length').should('be.eq', 2);
    cy.get('.highlight').first().click();
    cy.get('[data-cy="submit-button"]').click();
    cy.wait(['@createPgmtInstance', '@getTOC']);
    cy.bvdCheckToast('Instance "Demo All Instance Delete" saved successfully');
    cy.wait('@getDeletePage');
    cy.get('[data-cy="side-nav-search-button"] > i').click();
    cy.wait('@getTocOnlyFullControl');
    cy.get('[data-cy="sideNavigation-search-input"]').type('Demo All Instance Delete');
    cy.get('.highlight').should('contain.text', 'DemoAllInstanceDelete');
    cy.get('.mondrianBreadcrumbData > span').then($data => {
      expect($data).contain.text('Demo All Instance Delete');
    });
    cy.get('[data-cy="page-action-button"]').click();
    cy.get('.ux-menu').should('be.visible').contains('Delete');
    cy.get('[data-cy="page-action-item-delete"]').click();
    cy.get('#modal-title').should('have.text', 'DELETE INSTANCE OR DEFINITION');
    cy.get('[data-cy="radiobutton-delete-instance"] > label > span').should('contain.text', 'Delete the current instance only');
    cy.get('[data-cy="radiobutton-delete-definition"] > label > span').then($data => {
      expect($data.text()).to.contain('Delete this definition and all the instances that reference it');
    });
    cy.get('[data-cy="radiobutton-delete-definition"] > label > div > input').should('not.be.checked');
    cy.get('[data-cy="radiobutton-delete-definition"] > label > div').click();
    cy.get('[data-cy="mondrianModalDialogButton"]').should('be.visible').and('be.enabled');
    cy.get('[data-cy="mondrianModalDialogCancelButton"]').should('be.visible').and('be.enabled');
    cy.get('[data-cy="mondrianModalDialogButton"]').click();
    cy.wait('@getTOC');
    cy.bvdCheckToast('Deleted page successfully');
    cy.get('[data-cy="sideNavigation-search-input"]').type('Demo All Instance Delete');
    cy.get('[data-cy="no-entries-found-message"]').should('be.visible');
    cy.url().should('include', 'tenant=Provider').and('not.include', 'pgmtDefDelete');
  });

  it('Validate the page having definition and instance(url with _m)', () => {
    createDefinition();
    createInstance();
    cy.get('[data-cy="page-action-button"]').click();
    cy.get('.ux-menu').should('be.visible').contains('Delete');
    cy.get('[data-cy="page-action-item-delete"]').click();
    cy.get('#modal-title').should('have.text', 'DELETE INSTANCE OR DEFINITION');
    cy.get('[data-cy="radiobutton-delete-instance"] > label > span').should('contain.text', 'Delete the current instance only');
    cy.get('[data-cy="radiobutton-delete-definition"] > label > span').then($data => {
      expect($data.text()).to.contain('Delete this definition and all the instances that reference it');
    });
    cy.get('[data-cy="radiobutton-delete-definition"] > label > div').click();
    cy.get('[data-cy="mondrianModalDialogButton"]').click();
    cy.wait(['@getTOC', '@getTOC']);
    cy.bvdCheckToast('Deleted page successfully');
    cy.wait('@getDeletePage');
    cy.get('[data-cy="sideNavigation-search-input"]').type('Delete for new pgmt');
    cy.get('[data-cy="no-entries-found-message"]').should('be.visible');
    cy.url().should('include', 'tenant=Provider').and('not.include', 'pgmtDefDelete');
  });

  it('Validate when multiple instances are present with same name', () => {
    createDefinition();
    createInstance();
    cy.get('[data-cy="page-action-button"]').click();
    cy.get('[data-cy=page-action-item-saveAs]').click();
    cy.get('#pgmt-radio-button-instance > .ux-radio-button > .ux-radio-button-container').click();
    cy.wait('@getDeletePage');
    cy.get('[data-cy="submit-button"]').click();
    cy.wait(['@createPgmtInstance', '@getTOC']);
    cy.bvdCheckToast('Instance "Copy of Delete for new pgmt" saved successfully');
    cy.wait('@getDeletePage');
    cy.get('[data-cy="side-nav-search-button"] > i').click();
    cy.wait(['@getTocOnlyFullControl', '@getPgmtInstance']);
    cy.get('[data-cy="sideNavigation-search-input"]').type('Delete for new pgmt');
    cy.get('[id^=thirdLevelItem_]').should('have.length', 2);
    cy.get('[id^="thirdLevelItem_"]').eq(1).click();
    cy.url().should('include', 'pgmtDefDelete').and('include', '_m');
    cy.get('[data-cy="page-action-button"]').click();
    cy.get('.ux-menu').should('be.visible').contains('Delete');
    cy.get('[data-cy="page-action-item-delete"]').click();
    cy.wait('@getTOC');
    cy.get('#modal-title').should('have.text', 'DELETE INSTANCE OR DEFINITION');
    cy.get('[data-cy="radiobutton-delete-instance"] > label > span').should('contain.text', 'Delete the current instance only');
    cy.get('[data-cy="radiobutton-delete-definition"] > .ux-radio-button > .ux-radio-button-label').then($data => {
      expect($data.text()).to.include('Delete this definition and all the instances that reference it');
    });
    cy.get('[data-cy="radiobutton-delete-definition"] > label > div').click();
    cy.get('[data-cy="mondrianModalDialogButton"]').click();
    cy.wait('@getTOC');
    cy.bvdCheckToast('Deleted page successfully');
    cy.get('[data-cy="sideNavigation-search-input"]').type('Delete for new pgmt');
    cy.get('[id^=thirdLevelItem_]').should('have.length', 0);
    cy.url().should('include', 'tenant=Provider').and('not.include', 'pgmtDefDelete');
  });

  it('Validate with no _m in URL', () => {
    createDefinition();
    cy.get('[data-cy="page-action-button"]').click();
    cy.get('.ux-menu').should('be.visible').contains('Delete');
    cy.get('[data-cy="page-action-item-delete"]').click();
    cy.get('#modal-title').should('have.text', 'DELETE DEFINITION');
    cy.get('[data-cy="mondrianModalDialogButton"]').should('be.visible').and('be.enabled');
    cy.get('[data-cy="mondrianModalDialogCancelButton"]').should('be.visible').and('be.enabled');
    cy.get('[data-cy="mondrianModalDialogButton"]').click();
    cy.wait('@getTOC');
    cy.bvdCheckToast('Deleted page successfully');
    cy.get('.mondrianBreadcrumbData > span').then($data => {
      expect($data).contain.text('Home');
    });
    cy.url().should('include', 'tenant=Provider').and('not.include', 'pgmtDefDelete').and('not.include', '_m');
  });

  it('Abort delete', () => {
    createDefinition();
    createInstance();
    cy.get('[data-cy="page-action-button"]').click();
    cy.get('[data-cy="page-action-item-delete"]').click();
    cy.get('#modal-title').should('have.text', 'DELETE INSTANCE OR DEFINITION');
    cy.get('[data-cy="radiobutton-delete-instance"] > label > div > input').should('be.checked');
    cy.get('[data-cy="radiobutton-delete-definition"] > label > div > input').should('not.be.checked');
    cy.get('[data-cy="mondrianModalDialogCancelButton"]').click();
    cy.wait('@getTOC');
    cy.get('[data-cy="side-nav-search-button"] > i').click();
    cy.get('[data-cy="sideNavigation-search-input"]').type('Delete for new pgmt');
    cy.get('[id^=thirdLevelItem_]').should('have.length', 1);
    cy.get('.mondrianBreadcrumbData > span').then($data => {
      expect($data).contain.text('Delete for new pgmt');
    });
    cy.url().should('include', 'pgmtDefDelete').and('include', '_m');
  });
  afterEach(() => {
    shared.deletePages(['pgmtDefDelete']);
  });
});
