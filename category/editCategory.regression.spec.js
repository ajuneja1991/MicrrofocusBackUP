/* eslint-disable camelcase */
const shared = require('../../../shared/shared');
const role = require('../../../../../support/reporting/restUtils/role');
const nonAdminuserName = 'nonAdminTestUser';
const nonAdminuserPwd = 'control@123D';
let permissionArrayForUIF;
let uifRole;

const categoryBody = [
  {
    id: 'TestEditCategory',
    icon: 'qtm-icon-monitor',
    abbreviation: 'E',
    title: 'TestEditCategory'
  }
];
function deleteCategory(id) {
  cy.getCookie('secureModifyToken').then(val => {
    cy.request({
      method: 'DELETE',
      failOnStatusCode: false,
      url: `/rest/${Cypress.env('API_VERSION')}/categories/${id}`,
      headers: {
        'X-Secure-Modify-Token': val.value
      }
    });
    cy.log('category deleted');
  });
}

const clickOutside = function() {
  cy.get('.cdk-overlay-connected-position-bounding-box');
  cy.get('body').click(0, 0);
};

describe('Edit Category', shared.defaultTestOptions, () => {
  beforeEach(() => {
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/menuEntries?filter*`
    }).as('getMenuEntry');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pages/toc*`
    }).as('getTOC');
    cy.intercept('PUT', `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/categories/*`).as('putEditCategory');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/categories/*`
    }).as('Category');
    cy.intercept('POST', `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/categories`).as('addCategory');
    cy.intercept('GET', `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/widgets/edit_category`).as('editCategory');
    cy.bvdLogin();
  });

  it('Verify the user is able to edit the category', () => {
    deleteCategory(categoryBody[0].id);
    shared.createNewCategory(categoryBody, cat => {
      expect(cat.status).to.equal(200);
    });
    cy.visit('/');
    cy.wait(['@getMenuEntry', '@getTOC', '@getTOC']);
    cy.get('[data-cy="side-nav-search-button"] > i').click();
    cy.get('[data-cy="side-nav-more-button"]').click();
    cy.get('[data-cy="open-edit-mode-button"]').click();
    cy.get('[data-cy="firstLevelItem-TestEditCategory"]').trigger('mouseenter');
    cy.get('[data-cy="side-nav-edit-category-TestEditCategory-button-wrapper"]').should('be.visible').click();
    cy.wait(['@editCategory', '@getTOC', '@getTOC', '@Category']);
    cy.get('#override-header > h2').should('have.text', 'Edit Category');
    cy.get('[data-cy="submit-button"]').should('be.disabled');
    cy.get('[data-cy="cancel-button"]').should('be.enabled');
    cy.get('[data-cy="category-title-label"]').should('be.visible');
    cy.get('[data-cy="category-title"]').should('be.visible');
    cy.get('[data-cy="category-title"]').clear().type('Edit Test Category');
    clickOutside();
    cy.get('[data-cy="iconicon-label"]').should('be.visible');
    cy.get('[data-cy="categoryDropdownLabel"]').should('be.visible');
    cy.get('[data-cy="categoryDropdownButton"]').should('have.value', '').click();
    cy.get('[data-cy="category-UIF_ROOT"]').click();
    cy.get('[data-cy="category-description"]').type('Edit Category');
    cy.get('[data-cy="submit-button"]').should('be.enabled');
    cy.get('[data-cy="cancel-button"]').should('be.enabled');
    cy.get('[data-cy="submit-button"]').click();
    cy.wait('@putEditCategory').then(intercept => {
      const { statusCode } = intercept.response;
      expect(statusCode).to.eq(200);
    });
    cy.bvdCheckToast('Edit is successful');
    cy.get('[data-cy="sideNavigation-search-input"]').type('Edit Test Category');
    cy.get('.highlight').should('contain.text', 'EditTestCategory');
  });

  it('Verify that user should be able to nest the category until Level 2 only and should not nest under the same category', () => {
    cy.visit('/');
    cy.wait(['@getMenuEntry', '@getTOC', '@getTOC']);
    cy.get('[data-cy="side-nav-search-button"] > i').click();
    cy.get('[data-cy="side-nav-more-button"]').click();
    cy.get('[data-cy="open-edit-mode-button"]').click();
    cy.get('[data-cy="firstLevelItem-0_L0_SA_Operations"]').trigger('mouseenter');
    cy.get('[data-cy="side-nav-edit-category-0_L0_SA_Operations-button-wrapper"]').should('be.visible').click();
    cy.wait(['@editCategory', '@getTOC', '@getTOC', '@Category']);
    cy.get('[data-cy="category-order-number-label"]').should('be.visible').and('contain.text', 'Order number');
    cy.get('[data-cy="category-order-number"]').should('be.visible');
    cy.get('[data-cy="categoryDropdownButton"]').should('be.visible').click();
    // force is used to click on a disabled item and check that nothing is selected.
    // eslint-disable-next-line cypress/no-force
    cy.get('[data-cy="category-0_L0_SA_Operations"]').click({ force: true });
    cy.get('[data-cy="categoryDropdownButton"] >div> button').should('contain.text', '< Top Category >');
    cy.get('[data-cy="category-0_L0_SA_Operations"]').parent().should('have.class', 'display-block parent-display has-permission');
    cy.get('[data-cy="category-__base_infra"]').scrollIntoView().parent().prev().should('have.class', 'tree-node-expander ng-star-inserted').and('be.visible')
      .click();
    cy.get('[data-cy="category-__base_eapps"]').scrollIntoView().parent().prev().should('have.class', 'tree-node-expander ng-star-inserted').and('be.visible')
      .click();
    cy.get('.category-lock-icon').should('be.visible');
  });

  it('Verify category with l10n key', () => {
    cy.visit('/');
    cy.wait(['@getMenuEntry', '@getTOC', '@getTOC']);
    cy.get('[data-cy="side-nav-search-button"] > i').click();
    cy.get('[data-cy="side-nav-more-button"]').click();
    cy.get('[data-cy="open-edit-mode-button"]').click();
    cy.get('[data-cy="side-nav-add-category-root-button"]').should('be.visible').click();
    cy.get('[data-cy="category-title"]').clear().type('editMode.category.edit');
    cy.get('[data-cy="categoryDropdownButton"]').should('be.visible').click();
    cy.get('[data-cy="category-UIF_ROOT"]').click();
    cy.get('[data-cy="submit-button"]').click();
    cy.wait('@addCategory').then(responseCategory => {
      const categoryID = responseCategory.response.body.data[0].id;
      cy.bvdCheckToast('Successfully created the category');
      cy.get('[data-cy="sideNavigation-search-input"]').type('Edit Category');
      cy.get('.highlight').should('contain.text', 'EditCategory');
      cy.get(`[data-cy="firstLevelItem-${categoryID}"]`).trigger('mouseenter');
      cy.get(`[data-cy="side-nav-edit-category-${categoryID}-button-wrapper"]`).should('be.visible').click();
      cy.get('[data-cy="category-title"]').should('have.value', 'editMode.category.edit');
      cy.get('[data-cy="cancel-button"]').click();
      deleteCategory(categoryID);
    });
  });

  it('Abort edit', () => {
    deleteCategory(categoryBody[0].id);
    shared.createNewCategory(categoryBody, cat => {
      expect(cat.status).to.equal(200);
    });
    cy.visit('/');
    cy.wait(['@getMenuEntry', '@getTOC', '@getTOC']);
    cy.get('[data-cy="side-nav-search-button"] > i').click();
    cy.get('[data-cy="side-nav-more-button"]').click();
    cy.get('[data-cy="open-edit-mode-button"]').click();
    cy.get('[data-cy="firstLevelItem-TestEditCategory"]').trigger('mouseenter');
    cy.get('[data-cy="side-nav-edit-category-TestEditCategory-button-wrapper"]').should('be.visible').click();
    cy.wait(['@editCategory', '@getTOC', '@getTOC', '@Category']);
    cy.get('[data-cy="category-title"]').clear().type('Cancel Edit Category');
    clickOutside();
    cy.get('[data-cy="categoryDropdownButton"]').should('be.visible').click();
    cy.get('.filter-container').type('Level1');
    cy.get('[data-cy="category-Level1"]').click();
    cy.get('[data-cy="cancel-button"]').click();
    cy.get('[data-cy="sideNavigation-search-input"]').type('Level1');
    cy.get('.highlight').click();
    cy.get('[data-cy^="secondLevelItem"]').should('not.contain.text', 'Cancel Edit Category');
    deleteCategory(categoryBody[0].id);
  });
});

describe('Non Admin : Edit Category', shared.defaultTestOptions, () => {
  beforeEach(() => {
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/menuEntries?filter*`
    }).as('getMenuEntry');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pages/toc*`
    }).as('getTOC');
  });

  it('Edit mode buttons should not be displayed for Category and should be displayed for instances', () => {
    permissionArrayForUIF = [{
      operation_key: 'FullControl',
      resource_key: 'menu<>Category-1_L0_SA_Administration'
    }, {
      operation_key: 'View',
      resource_key: 'default_action<>All'
    }];

    cy.wrap(role.roleCreationWithPermissionArray('NonAdminPage', 'NonAdminPage', permissionArrayForUIF, false)).then(uifRoleId => {
      uifRole = uifRoleId;
    });
    cy.bvdLogin(nonAdminuserName, nonAdminuserPwd);
    cy.visit('/');
    cy.wait(['@getMenuEntry', '@getTOC', '@getTOC']);
    cy.get('[data-cy="side-nav-search-button"] > i').click();
    cy.get('[data-cy="side-nav-more-button"]').click();
    cy.get('[data-cy="open-edit-mode-button"]').click();
    cy.get('[data-cy="firstLevelItem-1_L0_SA_Administration"]').trigger('mouseenter').should('not.have.class', 'edit-mode-buttons');
    cy.get('[data-cy="navigation-category-1_L0_SA_Administration"] > button > i').click();
    cy.get('[data-cy="secondLevelItem-0_L1_SA_AdminDashboards"]').trigger('mouseenter').should('not.have.class', 'edit-mode-buttons');
    cy.get('[data-cy="navigation-category-0_L1_SA_AdminDashboards"] > button > i').click();
    cy.get('[data-cy="thirdLevelItem-2_L2_SA_Schedules"]').trigger('mouseenter').should('have.class', 'ng-star-inserted');
  });

  after(() => {
    cy.bvdLogout();
    role.roleDeletion(uifRole, false);
  });
});
