// <reference types="Cypress" />
import 'cypress-iframe';
const shared = require('../../shared/shared');

describe('PDF Box Settings', () => {
  beforeEach(() => {
    cy.intercept(`${shared.reportingContextRoot}/rest/${Cypress.env('API_VERSION')}/system`).as('reportingPageloadSystem');
    cy.intercept(`${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/system`).as('foundationPageloadSystem');
    cy.intercept(`${shared.reportingContextRoot}/rest/${Cypress.env('API_VERSION')}/session/user`).as('pageloadUser');
    cy.intercept(`${shared.reportingContextRoot}/rest/${Cypress.env('API_VERSION')}/dashboard/*`).as('dashboardLoad');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pages/toc*`
    }).as('getTOC');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/BVDREPPAGE*`
    }).as('getPage');
    cy.intercept({
      method: 'PUT',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/session/user`
    }).as('updateUser');
    cy.intercept({
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/widgets/*`
    }).as('getWidget');
    cy.intercept({
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/session/user`
    }).as('getUser');
    cy.intercept({
      method: 'POST',
      path: `${shared.webtopdfContextRoot}/${Cypress.env('API_VERSION')}/jobs`
    }).as('createJob');
    cy.intercept({
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/authtoken`
    }).as('getXAuthToken');
    cy.intercept(`${Cypress.env('BVD_CONTEXT_ROOT')}/ui/dashboard/?*`).as('svgDashboardLoad');
    cy.bvdLogin();
    cy.visit('/BVDREPPAGE?_m=Welcome_0_L2_SA_StakeHolderDashboards&menuTitle=Welcome');
    cy.wait(['@foundationPageloadSystem', '@getUser', '@getUser', '@getUser', '@getTOC', '@getPage']);
    cy.frameLoaded('[data-cy="mondrian-iframe-bvdReporting"]');
    cy.wait(['@reportingPageloadSystem', '@pageloadUser', '@pageloadUser', '@pageloadUser', '@svgDashboardLoad', '@dashboardLoad']);
  });

  it('should check for default values of side panel for the first time', () => {
    cy.get('[data-cy="action-button"]').click();
    cy.get('[data-cy="action-button-export_pdf"]').click();
    cy.wait(['@getWidget', '@getUser']);
    cy.get('[data-cy="pdf-format-radio-button"]').click();
    cy.get('[data-cy="paper-list-dropdown"] input').should('have.value', 'Letter');
    cy.get('[data-cy="portrait-radio-button"] input').should('have.attr', 'aria-checked', 'true');
    cy.get('[data-cy="show-advanced-options"]').click();
    cy.get('[data-cy="pdf-header"] input').should('have.attr', 'aria-checked', 'true');
  });

  it('should change the initial PDF settings and click cancel to check the side panel again to check for the initial PDF settings', () => {
    cy.get('[data-cy="action-button"]').click();
    cy.get('[data-cy="action-button-export_pdf"]').click();
    cy.wait(['@getWidget', '@getUser']);
    cy.get('[data-cy="pdf-format-radio-button"]').click();
    cy.get('[data-cy="paper-list-dropdown"]').click();
    cy.get('span').contains('A4').click();
    cy.get('[data-cy="show-advanced-options"]').click();
    cy.get('[data-cy="select-specific-pages"]').click();
    cy.get('[data-cy="pdf-background"]').click();
    cy.get('[data-cy="cancel-button"]').click();
    cy.get('[data-cy="action-button"]').click();
    cy.get('[data-cy="action-button-export_pdf"]').click();
    cy.wait(['@getWidget', '@getUser']);
    cy.get('[data-cy="paper-list-dropdown"] input').should('have.value', 'Letter');
    cy.get('[data-cy="portrait-radio-button"] input').should('have.attr', 'aria-checked', 'true');
    cy.get('[data-cy="show-advanced-options"]').click();
    cy.get('[data-cy="select-all-pages"] input').should('have.attr', 'aria-checked', 'true');
    cy.get('[data-cy="pdf-background"] input').should('have.attr', 'aria-checked', 'false');
  });

  it('should check if settings are retained when user make some changes and export the PDF', () => {
    cy.get('[data-cy="action-button"]').click();
    cy.get('[data-cy="action-button-export_pdf"]').click();
    cy.wait(['@getWidget', '@getUser']);
    cy.get('[data-cy="pdf-format-radio-button"]').click();
    cy.get('[data-cy="paper-list-dropdown"]').click();
    cy.get('span').contains('Tabloid').click();
    cy.get('[data-cy="landscape-radio-button"]').click();
    cy.get('[data-cy="show-advanced-options"]').click();
    cy.get('[data-cy="select-specific-pages"]').click();
    cy.get('ux-number-picker-inline ux-icon[name=up]').dblclick();
    cy.get('ux-number-picker-inline input[type="number"]').invoke('attr', 'aria-valuenow').then(val => {
      cy.get('[data-cy="submit-button"]').trigger('mouseenter').should('have.attr', 'aria-describedby').and('match', /ux-tooltip-/);
      cy.get('[data-cy="submit-button"]').click();
      cy.wait(['@getXAuthToken', '@updateUser', '@createJob']);
      cy.bvdCheckToast('PDF generation started. You will be notified.');
      cy.get('[data-cy="action-button"]').click();
      cy.get('[data-cy="action-button-export_pdf"]').click();
      cy.wait(['@getWidget', '@getUser']);
      cy.get('[data-cy="paper-list-dropdown"] input').should('have.value', 'Tabloid');
      cy.get('[data-cy="landscape-radio-button"] input').should('have.attr', 'aria-checked', 'true');
      cy.get('[data-cy="show-advanced-options"]').click();
      cy.get('ux-number-picker-inline input[type="number"]').should('have.attr', 'aria-valuenow', val);
    });
  });
});
