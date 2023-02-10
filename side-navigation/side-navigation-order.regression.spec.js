// <reference types="Cypress" />
const shared = require('../../../shared/shared');

describe('Side Navigation - order of items', shared.defaultTestOptions, () => {
  beforeEach(() => {
    cy.intercept({
      method: 'POST',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/datasource/ws/data`
    }).as('getData');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/uiTestWidgets*`
    }).as('getPage');
    cy.bvdLogin();
    cy.visit('/uiTestWidgets');
    cy.wait(['@getPage', '@getData']);
    cy.url().should('include', '_s');
  });

  it('Order items by order number first', () => {
    cy.get('.ux-side-menu-toggle').click();
    cy.get('ux-side-menu').find('[aria-expanded="true"]');
    cy.get('[data-cy="navigation-category-T2"]').find('[aria-expanded="false"]').click();
    cy.get('[data-cy="navigation-category-T2"] .ux-side-menu-children > ux-side-menu-item').eq(0)
      .should('have.attr', 'data-cy', 'navigation-category-T3');
    cy.get('[data-cy="navigation-category-T2"] .ux-side-menu-children > ux-side-menu-item').eq(1)
      .should('have.attr', 'data-cy', 'navigation-category-T4');
    cy.get('[data-cy="navigation-category-T2"] .ux-side-menu-children > ux-side-menu-item').eq(2)
      .should('have.attr', 'data-cy', 'navigation-category-T7');
    cy.get('[data-cy="navigation-category-T4"]').find('[aria-expanded="false"]').click();
    cy.get('[data-cy="navigation-category-T4"] .ux-side-menu-children > ux-side-menu-item').eq(0)
      .should('have.attr', 'data-cy', 'navigation-menuEntry-testWidgetsEntry');
  });

  it('Order items with same order number alphabetical', () => {
    cy.get('.ux-side-menu-toggle').click();
    cy.get('ux-side-menu').find('[aria-expanded="true"]');
    cy.get('[data-cy="navigation-category-T2"]').find('[aria-expanded="false"]').click();
    cy.get('[data-cy="navigation-category-T2"] .ux-side-menu-children > ux-side-menu-item').eq(3)
      .should('have.attr', 'data-cy', 'navigation-category-T22');
    cy.get('[data-cy="navigation-category-T2"] .ux-side-menu-children > ux-side-menu-item').eq(4)
      .should('have.attr', 'data-cy', 'navigation-category-T5');
  });

  it('Order items with no order number alphabetical and list after items with order number', () => {
    cy.get('.ux-side-menu-toggle').click();
    cy.get('ux-side-menu').find('[aria-expanded="true"]');
    cy.get('[data-cy="navigation-category-T2"]').find('[aria-expanded="false"]').click();
    cy.get('[data-cy="navigation-category-T4"]').find('[aria-expanded="false"]').click();
    cy.get('[data-cy="navigation-category-T4"] .ux-side-menu-children > ux-side-menu-item').eq(0)
      .should('have.attr', 'data-cy', 'navigation-menuEntry-testWidgetsEntry');
    cy.get('[data-cy="navigation-category-T4"] .ux-side-menu-children > ux-side-menu-item').eq(1)
      .should('have.attr', 'data-cy', 'navigation-menuEntry-testActionsEntry');
    cy.get('[data-cy="navigation-category-T4"] .ux-side-menu-children > ux-side-menu-item').eq(2)
      .should('have.attr', 'data-cy', 'navigation-menuEntry-testWidgetDataExplorerEntry');
  });
});
