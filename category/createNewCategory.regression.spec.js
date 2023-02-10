// <reference types="Cypress" />
const shared = require('../../../shared/shared');
let categoryID;

function createCategory() {
  cy.wait('@addCategory').then(intercept => {
    const { statusCode, body } = intercept.response;
    expect(statusCode).to.eq(200);
    categoryID = body.data[0].id;
    cy.log(categoryID);
  });
}

function deleteCategory() {
  cy.getCookie('secureModifyToken').then(val => {
    cy.request({
      method: 'DELETE',
      url: `/rest/${Cypress.env('API_VERSION')}/categories/${categoryID}`,
      headers: {
        'X-Secure-Modify-Token': val.value
      }
    });
    cy.log('category entry deleted');
  });
}

const clickOutside = function() {
  cy.get('.cdk-overlay-connected-position-bounding-box');
  cy.get('body').click(0, 0);
};

describe('Create new category', shared.defaultTestOptions, () => {
  beforeEach(() => {
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/menuEntries?filter*`
    }).as('getMenuEntry');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pages/toc?onlyFullControl*`
    }).as('getTocOnlyFullControl');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pages/toc*`
    }).as('getToc');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/widgets/widgets/add_category`
    }).as('getaddCategory');
    cy.intercept('POST', `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/categories`).as('addCategory');
    cy.bvdLogin();
    cy.visit('/');
    cy.wait(['@getMenuEntry', '@getTocOnlyFullControl']);
    cy.get('[data-cy="side-nav-search-button"] > i').click();
  });

  it('Verify from Root level of side navigation panel', () => {
    cy.get('[data-cy="side-nav-more-button"]').click();
    cy.get('[data-cy="open-edit-mode-button"]').click();
    cy.get('[data-cy="side-nav-add-category-root-button"]').should('be.visible').click();
    cy.get('#override-header > h2').should('have.text', 'Add Category');
    cy.get('[data-cy="submit-button"]').should('be.disabled');
    cy.get('[data-cy="cancel-button"]').should('be.enabled');
    cy.get('[data-cy="category-title-label"]').should('be.visible');
    cy.get('[data-cy="category-title"]').should('have.value', '');
    cy.get('[data-cy="category-title"]').clear().type('Root Category');
    cy.get('[data-cy="iconicon-label"]').should('be.visible');
    cy.get('#icon-icon').click();
    cy.get(':nth-child(3) > .dropdown-menu-text > .qtm-font-icon').click();
    cy.get('[data-cy="categoryDropdownLabel"]').should('be.visible');
    cy.get('[data-cy="categoryDropdownButton"]').should('have.value', '').click();
    cy.get('[data-cy="category-UIF_ROOT"]').click();
    cy.get('[data-cy="category-order-number-label"]').should('be.visible').and('contain.text', 'Order number');
    cy.get('[data-cy="category-order-number"]').should('be.visible');
    cy.get('[data-cy="category-description"]').type('New Category creation');
    cy.get('[data-cy="submit-button"]').should('be.enabled');
    cy.get('[data-cy="cancel-button"]').should('be.enabled');
    cy.get('[data-cy="submit-button"]').click();
    createCategory();
    cy.bvdCheckToast('Successfully created the category');
    cy.wait('@getToc');
    cy.get('[data-cy="sideNavigation-search-input"]').type('Root Category');
    cy.get('.highlight').should('contain.text', 'RootCategory');
    deleteCategory();
  });

  it('Verify from Category level of side navigation panel', () => {
    cy.get('[data-cy="side-nav-more-button"]').click();
    cy.get('[data-cy="open-edit-mode-button"]').click();
    cy.get('[data-cy="firstLevelItem-0_L0_SA_Operations"]').trigger('mouseenter');
    cy.get('[data-cy="side-nav-add-category-0_L0_SA_Operations-button-wrapper"]').should('be.visible').click();
    cy.wait('@getTocOnlyFullControl');
    cy.get('[data-cy="category-title"]').clear().type('Nested category');
    clickOutside();
    cy.get('[data-cy="categoryDropdownButton"]').should('contain.text', 'Operations');
    cy.get('[data-cy="category-order-number"]').should('be.visible');
    cy.get('[data-cy="category-description"]').type('New Category creation');
    cy.get('[data-cy="submit-button"]').should('be.enabled');
    cy.get('[data-cy="cancel-button"]').should('be.enabled');
    cy.get('[data-cy="submit-button"]').click();
    createCategory();
    cy.bvdCheckToast('Successfully created the category');
    cy.wait('@getToc');
    cy.get('[data-cy="navigation-category-0_L0_SA_Operations"]').should('be.visible').click();
    cy.get('[aria-expanded="true"]').should('be.visible');
    cy.get('[data-cy^="secondLevelItem"]').should('contain.text', 'Nested category');
    deleteCategory();
  });

  it('Verify that user is able to create only upto 4 nested categories', () => {
    cy.get('[data-cy="side-nav-more-button"]').click();
    cy.get('[data-cy="open-edit-mode-button"]').click();
    cy.get('[data-cy="navigation-category-Level1"]').click();
    // button wrapper should be visible on hover/mouseenter. As this is not working -> click on it
    cy.get('[data-cy="side-nav-add-category-Level1-button-wrapper"]').should('be.visible');
    cy.get('[data-cy="navigation-category-Level2"]').click();
    cy.get('[data-cy="side-nav-add-category-Level2-button-wrapper"]').should('be.visible');
    cy.get('[data-cy="navigation-category-Level3"]').click();
    cy.get('[data-cy="side-nav-add-category-Level3-button-wrapper"]').should('be.visible');
    cy.get('[data-cy="navigation-category-Level4"]').click().should('not.have.attr', '[data-cy="fifthLevelItem-Level5"]');
    cy.get('[data-cy="navigation-category-Level4"]').should('not.have.attr', '[data-cy="side-nav-add-category-Level4-button-wrapper"]');
  });

  it('Abort creating new category', () => {
    cy.get('[data-cy="side-nav-more-button"]').click();
    cy.get('[data-cy="open-edit-mode-button"]').click();
    cy.get('[data-cy="side-nav-add-category-root-button"]').should('be.visible').click();
    cy.get('[data-cy="category-title"]').clear().type('Test Category');
    cy.get('[data-cy="categoryDropdownButton"]').should('have.value', '').click();
    cy.get('[data-cy="category-UIF_ROOT"]').click();
    cy.get('[data-cy="category-order-number"]').should('be.visible');
    cy.get('[data-cy="category-description"]').type('New Category creation');
    cy.get('[data-cy="cancel-button"]').click();
    cy.get('[data-cy="sideNavigation-search-input"]').type('Test Category');
    cy.get('[data-cy="no-entries-found-message"]').should('be.visible');
  });
});
