const shared = require('../../shared/shared');

describe('Edit ROLE  Page', () => {
  beforeEach(() => {
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/__uif_roles*`
    }).as('getUiEditRole');
    cy.intercept({
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/session/user`
    }).as('getUser');
    cy.bvdLogin();
    cy.visit('/__uif_roles');
    cy.wait(['@getUiEditRole', '@getUser']);
    cy.get('[data-cy="role-list"]').find('[data-cy="search-btn"]').click();
    cy.get('[data-cy="role-list"]').find('[data-cy="uifToolbar-toggle-search-button"]').click();
    cy.get('[data-cy="role-list"]').find('ux-toolbar-search').find('[data-cy="uifToolbar-toggle-search-input"]').clear().type('DefaultUISRole');
    cy.get('[data-cy="list-item-0"]').click();
    cy.get('[data-cy="role-list"]').find('[data-cy="toolbar-action-qtm-icon-edit"]').click();
  });

  it('role input field validation with error message test ', () => {
    cy.get('.general_section').find('h3').contains('GENERAL');
    cy.get('.heading-section').find('h3').contains('PERMISSIONS');
    cy.get('[data-cy="edit-role-label"]').contains('Display name');
    cy.get('[data-cy="edit-role-label-description"]').contains('Description');
    cy.get('[data-cy="edit-role-name"]').clear();
    cy.get('.help-block').contains('Display name is required');
    cy.get('[data-cy="edit-role-name"]').clear();
    cy.get('[data-cy="edit-role-name"]').type('test*?<>');
    cy.get('.help-block').contains('Invalid role name special character are not allowed');
    cy.get('[data-cy="edit-role-search-input"]').should('have.value', '');
    cy.get('[data-cy="edit-role-search-input"]').clear().type('Menu items');
    cy.get('.highlight').should('contain.text', 'Menuitems');
    cy.get('[data-cy="edit-role-search-input"]').clear().type('xyz');
    cy.get('.help-block').should('contain', 'No permission found that contain');
  });

  it('search input validation with with error message  & placeholder validation', () => {
    cy.get('[data-cy="edit-role-search-input"]').clear().type('Menu items');
    cy.get('[data-cy="edit-role-reset-search-button"]').click();
    cy.get('[data-cy="edit-role-search-input"]').clear();
    cy.get('[data-cy="edit-role-name"]').type('xyz');
    cy.get('[data-cy="edit-role-description"]').type('xyz');
    cy.get('[data-cy=submit-button]').should('be.enabled');
    cy.get('[data-cy=submit-button]').should('contain.text', 'SAVE');
    cy.get('[data-cy="edit-role-name"]').clear();
    cy.get('[data-cy="edit-role-name"]').should('have.attr', 'placeholder', 'Role name');
    cy.get('.help-block').contains('Display name is required');
    cy.get('[data-cy="edit-role-description"]').clear();
    cy.get('[data-cy="edit-role-description"]').should('have.attr', 'placeholder', 'Role description');
    cy.get('[data-cy=edit-role-search-input]').clear();
    cy.get('[data-cy=edit-role-search-input]').should('have.attr', 'placeholder', 'Search');
  });

  it('search for roles with read only permissions', () => {
    cy.get('[data-cy=cancel-button]').click();
    cy.get('[data-cy="role-list"]').find('[data-cy="uifToolbar-toggle-search-input"]').clear().type('Read');
    cy.get('[data-cy=search-checkbox]').click();
    cy.get('[data-cy=list-item-1]').click();
    cy.get('[data-cy=tree-menuItem] > .item3').should('contain.text', 'Read Only');
  });

  it('Should table contains all permission related data', () => {
    cy.get('.treegrid-row-expanded > .group-section').find('.treegrid-expander-icon').click();
    cy.get('tbody').find('tr').eq(0).should('have.attr', 'aria-expanded', 'false');
    cy.get('.treegrid-expander').find('.treegrid-expander-icon').click();
    cy.get('tbody').find('tr').eq(0).should('have.attr', 'aria-expanded', 'true');
    cy.get('[data-cy=tree-node-container]').find('.treeNodeAlign').find('table').find('tr').eq(0).find('td')
      .eq(2)
      .click();
    cy.get('.dropdown-menu-text').contains('All').click();
    cy.get('[data-cy=tree-node-container]').find('.treeNodeAlign').find('table').find('tr')
      .then(rows => {
        cy.log(rows.length);
        const permission = ['General', 'Definitions', 'Definition groups', 'Menu items'];

        rows.toArray().forEach(element => {
          cy.get('[data-cy=tree-node-container]').find('.treeNodeAlign').find('table').find('tr').eq(rows.index(element)).find('td')
            .eq(0)
            .find('span')
            .contains(permission[rows.index(element)]);
          cy.get('[data-cy=tree-node-container]').find('.treeNodeAlign').find('table').find('tr').eq(rows.index(element)).find('td')
            .eq(2)
            .contains('All');
        });
      });
  });

  it('Edit role with success message & check existing role cant be modified', () => {
    cy.get('[data-cy=cancel-button]').click();
    cy.get('[data-cy=search-btn]').click();
    cy.get('[data-cy=uifToolbar-toggle-search-input]').clear().type('DefaultUISRole');
    cy.get('[data-cy=list-item-0]').click();
    cy.get('[data-cy=edit-btn]').click();
    cy.get('[data-cy=edit-role-name]').clear().type('DefaultUISRole');
    cy.get('[data-cy=submit-button]').click();
    cy.get('.toast-message').contains('Role updated successfully');
    cy.get('[data-cy=search-btn]').click();
    cy.get('[data-cy="uifToolbar-toggle-search-input"]').clear().type('DefaultUISRole');
    cy.get('[data-cy=list-item-0]').click();
    cy.get('[data-cy=edit-btn]').click();
    cy.get('[data-cy=edit-role-name]').clear();
    cy.get('[data-cy=edit-role-name]').type('DefaultBvdRole');
    cy.get('[data-cy=submit-button]').click();
    cy.get('.toast-message').contains('Role name already exists');
  });

  it('Should top level permission changes that reflect to respective all permission all/none/partial ', () => {
    cy.get('[data-cy=action-btn-dropdown]').click();
    cy.get('.dropdown-menu-text').contains('All').click();
    cy.get('[data-cy=tree-node-container]').find('.treeNodeAlign').find('table').find('tr')
      .then(rows => {
        cy.log(rows.length);
        cy.get('.dropdown-menu-text').contains('All');
      });

    cy.get('[data-cy=tree-node-container]').find('.treeNodeAlign').find('table').find('tr').eq(1).find('td')
      .eq(2)
      .click();
    cy.get('.dropdown-menu-text').contains('None').click();
    cy.get('[data-cy=tree-node-container]').find('.treeNodeAlign').find('table').find('tr')
      .then(rows => {
        cy.log(rows.length);
        cy.get('.dropdown-menu-text').contains('None');
      });

    cy.get('[data-cy=tree-node-container]').find('.treeNodeAlign').find('table').find('tr').eq(3).find('td')
      .eq(2)
      .click();
    cy.get('.dropdown-menu-text').contains('All').click();
    cy.get('[data-cy=tree-node-container]').find('.treeNodeAlign').find('table').find('tr').eq(0).find('td')
      .eq(2)
      .should('contain.text', 'Partial');
  });

  it('Definitions with full control and not a full control when update role with top label permission', () => {
    cy.get('[data-cy=action-btn-dropdown]').click();
    cy.get('.dropdown-menu-text').contains('None').click();
    cy.get('[data-cy=tree-node-container]').find('.treeNodeAlign').find('table').find('tr').eq(1).find('td')
      .eq(2)
      .click();
    cy.get('.dropdown-menu-text').contains('All').click();
    cy.get('[data-cy=tree-node-container]').find('.treeNodeAlign').find('table').find('tr').eq(0).find('td')
      .eq(2)
      .should('contain.text', 'Partial');
    cy.get('[data-cy=submit-button]').click();
    cy.get('.toast-message').contains('Role updated successfully');

    cy.get('[data-cy=tree-menuItem] > .item3').should('contain.text', 'AssignPages');
    cy.get('[data-cy=edit-btn]').click();

    cy.get('[aria-posinset="1"] > .edit-row > [data-cy=edit-btn]').click();
    cy.get('[data-cy=all]').find('input[type="checkbox"]').should('have.attr', 'aria-checked', 'true').should('not.be.disabled');
    cy.get('[data-cy=stacked-side-panel-1] > #ux-side-panel > .ux-side-panel-host > #override-alignment > [data-cy=cancel-button]').click();
    cy.get('[data-cy=tree-node-container]').find('.treeNodeAlign').find('table').find('tr').eq(1).find('td')
      .eq(2)
      .click();
    cy.get('.dropdown-menu-text').contains('None').click();
    cy.get('[data-cy=submit-button]').click();
    cy.get('.toast-message').contains('Role updated successfully');
    cy.get('[data-cy=edit-btn]').click();
    cy.get('[aria-posinset="1"] > .edit-row > [data-cy=edit-btn]').click();
    cy.get('[data-cy=all]').find('input[type="checkbox"]').should('have.attr', 'aria-checked', 'false');
  });
});

