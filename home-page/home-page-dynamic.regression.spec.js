// <reference types="Cypress" />
const shared = require('../../../shared/shared');
const { featureToggleEnabled } = require('../../../../../support/reporting/restUtils/featureToggleEnabled');

const nonAdminuserName = 'test';
const nonAdminuserPwd = 'control@123D';

/**
 * This test is dependent to the feature toggle DYNAMIC_HOME_PAGE
 * If the feature toggle  is false/not defined, the test will be skipped.
 */

describe('Home Page dynamic', shared.defaultTestOptions, () => {
  before(async function() {
    cy.bvdLogin();
    const ft = await featureToggleEnabled('DYNAMIC_HOME_PAGE');
    console.log('DYNAMIC_HOME_PAGE feature toggle:', ft);
    if (!ft) {
      this.skip();
    }
  });

  beforeEach(() => {
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pages/toc*`
    }).as('getTOC');
    cy.intercept({
      method: 'POST',
      url: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/datasource/ws/data`
    }).as('getData');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/menuEntries?filter=pages`
    }).as('getMenuEntries');
  });

  it('should load new landing page and drill down by clicking on card ', () => {
    cy.visit('/');
    cy.wait(['@getTOC', '@getMenuEntries']);
    cy.url().should('eq', `${Cypress.config().baseUrl}/?tenant=Provider`);
    cy.get('[data-cy="spinnerOverlay"]').should('not.be.visible');
    cy.get('[data-cy="basic-home-page-group-MCC"]');
    cy.get('[data-cy="basic-home-page-card-MCC-metricBoxRenderer"]').trigger('mouseover').click();
    cy.wait(['@getData', '@getData', '@getData', '@getData', '@getData', '@getData', '@getData', '@getData', '@getData']);
    cy.url().should('include', '/uiTestMetricBox?_m=metricBoxRenderer');
  });

  it('should load new landing page no permissions', () => {
    cy.bvdLogout();
    cy.bvdLogin(nonAdminuserName, nonAdminuserPwd);
    cy.visit('/');
    cy.wait(['@getTOC', '@getMenuEntries']);
    cy.url().should('eq', `${Cypress.config().baseUrl}/?tenant=Provider`);
    cy.get('[data-cy="spinnerOverlay"]').should('not.be.visible');
    cy.get('[data-cy="basic-home-page-group-MCC"]').should('not.exist');
    cy.get('[data-cy="basic-home-page-card-MCC-metricBoxRenderer"]').should('not.exist');
    cy.get('[data-cy="basic-home-page-no-group"]');
  });
});
