const shared = require('../../../shared/shared');

const categoryBody = [
  {
    id: 'CypressDeleteCategoryID',
    parent: 'T2',
    icon: 'qtm-icon-monitor',
    abbreviation: 'O',
    title: 'CypressAutoCategory'
  }
];
function deleteCategory() {
  cy.getCookie('secureModifyToken').then(val => {
    cy.request({
      method: 'DELETE',
      failOnStatusCode: false,
      url: `/rest/${Cypress.env('API_VERSION')}/categories/${categoryBody[0].id}`,
      headers: {
        'X-Secure-Modify-Token': val.value
      }
    });
    cy.log('category deleted');
  });
}

describe('Category - Delete', shared.defaultTestOptions, () => {
  beforeEach(() => {
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/system`
    }).as('getSystemData');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/session/user`
    }).as('getUserData');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pages/toc`
    }).as('getTOC');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/categories/*`
    }).as('deleteCategory');
  });

  it('Admin user: Abort category deletion', () => {
    cy.bvdLogin();
    cy.visit('/');
    cy.wait(['@getUserData']);
    cy.get('[data-cy="side-nav-search-button"] > i').click();
    cy.get('[data-cy="side-nav-more-button"]').click();
    cy.get('[data-cy="open-edit-mode-button"]').click();
    cy.get('[id="firstLevelItem_UI Testing"]').trigger('mouseenter');
    cy.get('[data-cy="side-nav-del-category-T2-button-wrapper"]').click();
    cy.get('modal-container[role="dialog"]').should('be.visible');
    cy.get('#modal-title').should('have.text', 'DELETE CATEGORY');
    cy.get('.modal-body.ng-star-inserted').contains(' There are items under this category. Deleting the category will delete these items as well. Are you sure you want to delete this category including all sub-items? ');
    cy.get('[data-cy=mondrianModalDialogButton]').should('be.visible').and('have.text', ' Delete ');
    cy.get('[data-cy=mondrianModalDialogCancelButton]').should('be.visible').and('have.text', ' Cancel ');
    cy.get('[data-cy=mondrianModalDialogCancelButton]').click();
    cy.get('[data-cy=close-edit-mode-button]').click();
    cy.get('[id="firstLevelItem_UI Testing"]').should('be.visible');
  });

  it('Admin user: Category deletion', () => {
    cy.bvdLogin();
    deleteCategory();
    shared.createNewCategory(categoryBody, cat => {
      expect(cat.status).to.equal(200);
    });
    cy.visit('/');
    shared.createMenuEntryAPI('CypressMenuEntry1', 'CypressDeleteCategoryID', 'uiTestWidgets', () => {
      cy.get('[data-cy="side-nav-search-button"] > i').click();
      cy.get('[data-cy="side-nav-more-button"]').click();
      cy.get('[data-cy="open-edit-mode-button"]').click();
      cy.get('[id="firstLevelItem_UI Testing"]').click();
      // button wrapper should be visible on hover/mouseenter. As this is not working -> click on it
      cy.get('span[data-cy="secondLevelItem-CypressDeleteCategoryID"]').click();
      cy.get('[data-cy=side-nav-del-category-CypressDeleteCategoryID-button-wrapper]').click();
      cy.get('[data-cy=mondrianModalDialogButton]').click();
      cy.bvdCheckToast(' Category and sub-items removed successfully ');
      cy.get('[data-cy=close-edit-mode-button]').click();
      cy.get('span[data-cy=\'secondLevelItem-CypressDeleteCategoryID\']').should('not.exist');
    });
  });
});
afterEach(() => {
  cy.bvdLogout();
});
