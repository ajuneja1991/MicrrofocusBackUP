// <reference types="Cypress" />
const shared = require('../../shared/shared');

describe('Full page widget initial setup', shared.defaultTestOptions, () => {
  beforeEach(() => {
    cy.intercept({
      method: 'POST',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/datasource/ws/data`
    }).as('getWebapiData');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/uiFullPage*`
    }).as('getPage');
    cy.bvdLogin();
  });

  it('Should page display all UI elements, having all hidden attributes as false', () => {
    cy.visit('/uiFullPageWidgetAllUIs');
    cy.wait('@getPage');
    cy.get('[data-cy="mondrian-breadcrumbs"]').should('be.visible');
    cy.get('[data-cy="page-actions"]').should('be.visible');
    cy.get('.context-filter-menu').should('be.visible');
    cy.get('[data-cy="context-filter-content"]').should('be.visible');
    cy.get('.widget-header.ng-star-inserted').should('be.visible').contains('Simple List');
    cy.get('[data-cy="loadgen.mambo.net"]').should('be.visible').click();
    cy.get('[data-cy="contextLabelType-Host"]').contains('loadgen.mambo.net');
  });

  it('Should page display none of UI elements, having all hidden attributes as true', () => {
    cy.visit('/uiFullPageWidget');
    cy.wait('@getPage');
    cy.get('[data-cy="mondrian-breadcrumbs"]').should('be.visible');
    cy.get('[data-cy="page-actions"]').should('not.exist');
    cy.get('.context-filter-menu').should('not.exist');
    cy.get('[data-cy="context-filter-content"]').should('not.exist');
    cy.get('.widget-header').should('not.exist');
    cy.get('[data-cy="contextItem-loadgen.mambo.net"]').should('not.exist');
    cy.get('.context-view-filter').should('not.exist');
  });

  it('Should page have time context when hideTimeRangeSelector is not set', () => {
    cy.visit('/uiFullPageWidgetNoTimeSelector');
    cy.wait('@getPage');
    cy.get('.context-filter-menu').should('be.visible');
  });

  it('Should have time context when hideTimeRangeSelector is false and hasTimeContext is false', () => {
    cy.visit('/uiFullPageWidgetTimeSelectorFalse');
    cy.wait('@getPage');
    cy.get('.time-selection-trigger').should('be.visible');
  });

  it('Should not have margin for the mashup layout in fullPageWidget', () => {
    cy.visit('/uiFullPageWidget_mashupLayout');
    cy.wait('@getPage');
    cy.get('mondrian-mashup').should('have.css', 'padding', '0px');
  });
});
