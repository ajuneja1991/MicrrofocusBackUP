// <reference types="Cypress" />
const shared = require('../../../shared/shared');

describe('Page Layout Retained', () => {
  beforeEach(() => {
    cy.intercept({
      method: 'POST',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/datasource/ws/data`
    }).as('getWebapiData');
    cy.intercept({
      method: 'POST',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pages/metadata`
    }).as('getPagesMetadata');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/uiTestWidgetsPageConfigOverride*`
    }).as('getPagesData');
    cy.intercept({
      method: 'DELETE',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pages/*`
    }).as('deletePage');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pages/toc*`
    }).as('getTOC');
    cy.bvdLogin();
    cy.visit('/uiTestWidgetsPageConfigOverride');
    cy.wait(['@getPagesData', '@getWebapiData', '@getTOC']);
  });

  /**
   * Can be probably moved to new pgmt area
   */
  describe('revert functionality', () => {
    it('revert functionality-- resize 2 widgets', () => {
      let initWidthEl1 = 0;
      let initWidthEl2 = 0;
      cy.get('ux-dashboard-widget').first().invoke('css', 'width').then(width => {
        initWidthEl1 = width;
      });
      cy.get('ux-dashboard-widget').eq(1).invoke('css', 'width').then(width => {
        initWidthEl2 = width;
      });
      // eslint-disable-next-line cypress/no-force
      cy.get('ux-dashboard-widget').first().find('.handle-right').trigger('mousedown', 'left')
        .trigger('mousemove', 200, 300, { force: true }).click();
      // eslint-disable-next-line cypress/no-force
      cy.get('ux-dashboard-widget').eq(1).find('.handle-right').trigger('mousedown', 'left')
        .trigger('mousemove', 200, 300, { force: true }).click();
      cy.get('[data-cy="page-action-button"]').click();
      cy.get('[data-cy="page-action-item-revert"]').click();
      cy.get('[data-cy="mondrianModalDialogButton"]').click();
      cy.bvdCheckToast('Page reverted successfully');
      cy.get('ux-dashboard-widget').first().invoke('css', 'width').then(width => {
        expect(width).to.equal(initWidthEl1);
      });
      cy.get('ux-dashboard-widget').eq(1).invoke('css', 'width').then(width => {
        expect(width).to.equal(initWidthEl2);
      });
    });

    // pgmt: can stay (small update was needed)
    it('Page Layout should be updated as per the config after navigation from a page having different layout', () => {
      // Cypress will automatically determine if an element is animating and wait until it stops.
      cy.get('ux-dashboard-widget').first().invoke('width').should('be.gt', 300);
      cy.get('simple-list [data-cy="loadgen.mambo.net"]').click();
      cy.wait(['@getPagesMetadata', '@getWebapiData']);
      cy.get('#split-button-toggle').click();
      cy.get('[data-cy="drilldown-uiTestWidgetsPageLayout"]').click();
      cy.wait(['@getPagesMetadata', '@getWebapiData']);
      cy.url().should('include', 'uiTestWidgetsPageLayout');
      cy.get('[data-cy="contextLabelType-Host"]').contains('loadgen.mambo.net');
      cy.get('ux-dashboard-widget').first().invoke('width').should('be.gt', 600);
    });
  });

  describe('Page Layout Retained - additional options', () => {
    beforeEach(() => {
      cy.intercept({
        method: 'POST',
        url: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/datasource/ws/data`
      }).as('getData');
      cy.intercept({
        method: 'POST',
        url: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pages`
      }).as('savePage');
      cy.intercept({
        method: 'PUT',
        url: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pages/*`
      }).as('updatePage');
      cy.intercept({
        method: 'DELETE',
        url: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pages/*`
      }).as('deletePage');
      cy.intercept({
        method: 'GET',
        url: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/menuEntries/testPageCrudEntry`
      }).as('getMenuEntry');
      cy.intercept({
        method: 'GET',
        path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pages/toc*`
      }).as('getTOC');
      cy.bvdLogin();
      cy.visit('/uiTestPageCrud?_m=testPageCrudEntry');
      cy.wait(['@getData', '@getData', '@getTOC', '@getTOC']);
    });

    it('should revert the page after duplicating the widgets', () => {
      cy.get('metric-box').then(widgets => {
        const noOfWidgets = Cypress.$(widgets).length;
        cy.get('[data-cy="action-button"]').first().click();
        cy.get('[data-cy="action-button-duplicateWidget"]').click();
        cy.get('metric-box').should('have.length', noOfWidgets + 1);
        cy.get('metric-box').eq(noOfWidgets).find('[data-cy="metric-box-unit-title"]');
        cy.get('[data-cy="page-action-button"]').click();
        cy.get('[data-cy="page-action-item-revert"]').click();
        cy.get('[data-cy="mondrianModalDialog"]');
        cy.get('[data-cy="mondrianModalDialogCancelButton"]');
        cy.get('[data-cy="mondrianModalDialogButton"]').contains('Revert');
        cy.get('[data-cy="mondrianModalDialogButton"]').click();
        cy.bvdCheckToast('Page reverted successfully');
        cy.get('metric-box').eq(noOfWidgets - 1).find('[data-cy="metric-box-unit-title"]');
        cy.get('metric-box').should('have.length', noOfWidgets);
        cy.get('[data-cy="page-action-button"]').click();
        cy.get('[data-cy="page-action-item-revert"]').should('have.class', 'disabled');
      });
    });

    it('Revert should be disabled when there are no changes', () => {
      cy.get('[data-cy="page-action-button"]').click();
      cy.get('[data-cy="page-action-item-revert"]').should('have.class', 'disabled');
    });

    it('should revert the page after removing the widgets', () => {
      cy.get('metric-box').then(widgets => {
        const noOfWidgets = Cypress.$(widgets).length;
        cy.get('[data-cy="action-button"]').eq(1).click();
        cy.get('[data-cy="action-button-removeWidget"]').click();
        cy.get('metric-box').should('have.length', noOfWidgets - 1);
        cy.get('[data-cy="action-button"]').eq(noOfWidgets - 1).should('not.exist');
        cy.get('[data-cy="page-action-button"]').click();
        cy.get('[data-cy="page-action-item-revert"]').click();
        cy.get('[data-cy="mondrianModalDialog"]');
        cy.get('[data-cy="mondrianModalDialogCancelButton"]');
        cy.get('[data-cy="mondrianModalDialogButton"]').contains('Revert');
        cy.get('[data-cy="mondrianModalDialogButton"]').click();
        cy.bvdCheckToast('Page reverted successfully');
        cy.get('metric-box').eq(noOfWidgets - 1).find('[data-cy="metric-box-unit-title"]');
        cy.get('metric-box').should('have.length', noOfWidgets);
        cy.get('[data-cy="page-action-button"]').click();
        cy.get('[data-cy="page-action-item-revert"]').should('have.class', 'disabled');
      });
    });
  });
});
