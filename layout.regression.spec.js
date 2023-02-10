// <reference types="Cypress" />
const shared = require('../../shared/shared');

describe('Layout', shared.defaultTestOptions, () => {
  beforeEach(() => {
    cy.intercept({
      method: 'POST',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/datasource/ws/data`
    }).as('getData');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/emptyRow*`
    }).as('getPage');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pages/toc*`
    }).as('getTOC');
    cy.bvdLogin();
  });

  it('should NOT have an empty row as default', () => {
    cy.visit('/emptyRowDefault');
    cy.wait(['@getPage', '@getData', '@getTOC']);
    cy.get('#mashup-dashboard').then(element => {
      expect(Cypress.dom.isScrollable(element)).to.eq(false);
    });
  });

  it('should have an empty row when specified in the page config', () => {
    cy.visit('/emptyRowTrue');
    cy.wait(['@getPage', '@getData', '@getTOC']);
    cy.get('#mashup-dashboard').scrollTo('bottom');
    cy.get('#mashup-dashboard').then(element => {
      expect(Cypress.dom.isScrollable(element)).to.eq(true);
    });
  });

  it('should NOT have an empty row when specified in the page config', () => {
    cy.visit('/emptyRowFalse');
    cy.wait(['@getPage', '@getData', '@getTOC']);
    cy.get('#mashup-dashboard').then(element => {
      expect(Cypress.dom.isScrollable(element)).to.eq(false);
    });
  });
});
