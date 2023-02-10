// <reference types="Cypress" />
const shared = require('../../../../shared/shared');

describe('Key-Value Widget - Edit', () => {
  before(() => {
    cy.bvdLogin();
  });

  beforeEach(() => {
    cy.preserveSessionCookie();
    cy.intercept({
      method: 'POST',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/datasource/ws/data`
    }).as('getData');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/eventSettingsTest*`
    }).as('getPage');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pages/toc*`
    }).as('getTOC');
    cy.visit('eventSettingsTest?_ctx=~(~(id~%271~name~%27Auto*20Upload*20of*20content*20finished.~type~%27event))');
    cy.wait(['@getData', '@getData', '@getPage', '@getTOC']);
  });

  it('Tooltip test', () => {
    cy.get('[data-cy="Title-edit-button-wrapper"]').trigger('mouseenter')
      .should('have.attr', 'aria-describedby')
      .and('match', /ux-tooltip-/);
    cy.get('[data-cy="Title-edit-button"]').click();
    cy.get('[data-cy="Title-save-inline-editing-button-wrapper"]').trigger('mouseenter')
      .should('have.attr', 'aria-describedby')
      .and('match', /ux-tooltip-/);
  });

  it('Update key-value and apply with button', () => {
    const res = {
      operation: 'update',
      params: { id: '2' },
      requestBody: { key: 'Title', value: 'Auto Upload of content finished - modified.' },
      url: 'http://localhost:4010/mock/settings/:id'
    };
    cy.intercept({ method: 'POST', url: `${shared.exploreContextRoot}/rest/v2/datasource/ws/data`, times: 1 }, res).as('dataUpdate');

    cy.get('[data-cy="Title-edit-button"]').click();
    cy.get('[data-cy="Title-inline-editing-input"]').clear().type('Auto Upload of content finished - modified.');
    cy.get('[data-cy="Title-save-inline-editing-button-wrapper"]').click();
    cy.wait('@dataUpdate');
    cy.contains('Auto Upload of content finished - modified.');
    cy.bvdCheckToast('Updated successfully.');
  });

  it('Double click on link and check escape works', () => {
    // cy.get('[data-cy="Title-edit-button"]').click();
    cy.contains('a', 'Auto Upload of content finished.').dblclick();
    cy.get('[data-cy="Title-inline-editing-input"]').should('have.value', 'Auto Upload of content finished.');
    cy.get('[data-cy="Title-inline-editing-input"]').clear().type('Auto Upload of content finished - modified.');
    cy.get('[data-cy="Title-inline-editing-input"]').type('{esc}');
    cy.get('[data-cy="Title-inline-editing-input"]').should('not.exist');
    cy.contains('Auto Upload of content finished.');
  });

  it('Clicking on text input field should not close', () => {
    cy.get('[data-cy="Title-edit-button"]').click();
    cy.get('[data-cy="Title-inline-editing-input"]').click();
    cy.get('[data-cy="Title-inline-editing-input"]').should('have.value', 'Auto Upload of content finished.');
    cy.get('[data-cy="Title-save-inline-editing-button-wrapper"]');
  });

  it('Save using click away', () => {
    const res = {
      operation: 'update',
      params: { id: '2' },
      requestBody: { key: 'Title', value: 'Auto Upload of content finished - saved.' },
      url: 'http://localhost:4010/mock/settings/:id'
    };
    cy.intercept({ method: 'POST', url: `${shared.exploreContextRoot}/rest/v2/datasource/ws/data`, times: 1 }, res).as('dataUpdate');

    cy.get('[data-cy="Title-edit-button"]').click();
    cy.get('[data-cy="Title-inline-editing-input"]').click();
    cy.get('[data-cy="Title-inline-editing-input"]').should('have.value', 'Auto Upload of content finished.');
    cy.get('[data-cy="Title-inline-editing-input"]').clear().type('Auto Upload of content finished - saved.');
    cy.get('mondrian-widget').first().click();
    cy.wait('@dataUpdate');
    cy.contains('Auto Upload of content finished - saved.');
    cy.bvdCheckToast('Updated successfully.');
  });

  it('should open with double click and check edit mode after update', () => {
    const res = {
      operation: 'update',
      params: { id: '1' },
      requestBody: { key: 'Subcategory', value: 'Content Management - modified.' },
      url: 'http://localhost:4010/mock/settings/:id'
    };
    cy.intercept({ method: 'POST', url: `${shared.exploreContextRoot}/rest/v2/datasource/ws/data`, times: 1 }, res).as('dataUpdate');
    cy.contains('Content Management').dblclick();
    cy.get('[data-cy="Subcategory-inline-editing-input"]').clear().type('Content Management - modified.');
    cy.get('[data-cy="Subcategory-save-inline-editing-button-wrapper"]').click();
    cy.wait('@dataUpdate');
    cy.contains('Content Management - modified.');
    cy.bvdCheckToast('Updated successfully.');
    cy.contains('Content Management - modified.').dblclick();
    cy.get('[data-cy="Subcategory-inline-editing-input"]').should('have.value', 'Content Management - modified.');
  });
});
