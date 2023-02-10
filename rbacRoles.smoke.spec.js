const shared = require('../../shared/shared');

describe('Roles RBAC Page', () => {
  beforeEach(() => {
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/__uif_roles*`
    }).as('getUiRbacRoles');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/role?fetchIdmRoles=true`
    }).as('getFetchIdmRoles');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/role?allRoles=true`
    }).as('getRoles');
    cy.intercept({
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/session/user`
    }).as('getUser');
    cy.bvdLogin();
    cy.visit('/__uif_roles');
    cy.wait(['@getUiRbacRoles', '@getFetchIdmRoles', '@getRoles']);
  });

  it('should check for role list', () => {
    // should search for roles from roles list
    cy.get('[data-cy="role-list"]').find('[data-cy="search-btn"]').click();
    cy.get('[data-cy="role-list"]').find('[data-cy="uifToolbar-toggle-search-button"]').click();
    cy.get('[data-cy="role-list"]').find('ux-toolbar-search').find('[data-cy="uifToolbar-toggle-search-input"]').clear().type('DefaultBvdRole');
    cy.get('[data-cy="uif-list"]').find('[data-cy^="list-item"]').should('have.length', 1);
    cy.get('[data-cy="uif-list"]').find('[data-cy^="list-item"]').find('[data-cy="role-label"]').contains('DefaultBvdRole');
    cy.get('[data-cy="uif-list"]').find('[data-cy="list-item-0"]').click();

    cy.get('.right_section').find('h2').contains('DefaultBvdRole');
    cy.get('.right_section').find('[data-cy="foundation-nodes"]').find('tree-node .item1').contains('General');
    cy.get('.right_section').find('[data-cy="foundation-nodes"]').find('[data-cy="tree-menuItem"] > .item1').contains('Definition groups');
    cy.get('.right_section').find('[data-cy="foundation-nodes"]').find('[data-cy="tree-menuItem"] > .item1').contains('Menu items');
    cy.get('.right_section').find('[data-cy="foundation-nodes"]').find('[data-cy="tree-menuItem"] > .item1').contains('Action');
    cy.get('.right_section').find('[data-cy="foundation-nodes"]').find('[data-cy="tree-menuItem"] > .item1').contains('__bvd_non_admin');

    cy.get('[data-cy="role-list"]').find('ux-toolbar-search').find('[data-cy="uifToolbar-toggle-reset-search-button"]').click();
    cy.get('[data-cy="role-list"]').find('[data-cy="search-btn"]').click();
  });
});
