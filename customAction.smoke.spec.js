const shared = require('../../shared/shared');

describe('Custom action', () => {
  beforeEach(() => {
    cy.intercept({
      method: 'POST',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/datasource/ws/data`
    }).as('getData');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/testCustomActionPage*`
    }).as('getCustomActionPage');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/testCustomActionNonExistingPage*`
    }).as('getCustomActionNonExistingPage');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/invalidCustomActions*`
    }).as('getInvalidCustomActions');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pages/toc*`
    }).as('getTOC');
    cy.bvdLogin();
  });

  it('Error banner should be shown as required custom action plugin is not present', () => {
    cy.visit('/testCustomActionNonExistingPage');
    cy.wait(['@getCustomActionNonExistingPage', '@getData', '@getTOC']);
    cy.get('ux-alert').find('span').contains('Failed to load custom action plugin nonExistingAction');
    // simple list should be loaded as it is
    cy.get('simple-list').contains('BVD');
    // test widget notification while switching page.
    cy.visit('/testCustomActionPage');
    cy.wait(['@getCustomActionPage', '@getData', '@getTOC']);
    cy.go('back');
    cy.wait(['@getCustomActionNonExistingPage', '@getData', '@getTOC']);
    cy.get('ux-alert').find('span').contains('Failed to load custom action plugin nonExistingAction');
    // check if the action menu is not shown
    cy.get('[data-cy="action-button"]').first().click();
    cy.get('[data-cy="action-button-toggleChartBaseline_id"]').should('not.exist');
  });

  it('Should check the functionality of custom action', () => {
    cy.visit('/testCustomActionPage');
    cy.wait(['@getCustomActionPage', '@getData', '@getTOC']);

    cy.location().should(loc => {
      expect(loc.search).to.include('_s');
      expect(loc.search).to.include('_e');
    });

    cy.get('[data-cy="action-button"]').click();
    cy.get('[data-cy="action-button-toggleChartBaseline_id"]').click();
    cy.get('echarts-chart').find('button').click();
    // Only metrics matching CPU* should be shown
    cy.get('[id="CPU Utilization (avg): host_name: vdb.mambo.net"]');
    cy.get('[id="Memory Utilization (avg): host_name: vdb.mambo.net"]').should('not.exist');
    cy.get('body').click();

    cy.get('[data-cy="action-button"]').click();
    cy.get('[data-cy="action-button-toggleChartBaseline_id"]').click();
    cy.get('echarts-chart').find('button').click();
    // All metrics should be shown
    cy.get('[id="CPU Utilization (avg): host_name: vdb.mambo.net"]');
    cy.get('[id="Memory Utilization (avg): host_name: vdb.mambo.net"]');
    cy.get('body').click();
  });

  it('Should show alert for invalid custom action', () => {
    cy.visit('/invalidCustomActions');
    cy.wait(['@getInvalidCustomActions', '@getData', '@getTOC']);
    cy.get('ux-alert').contains('error2');
    cy.get('ux-alert').find('.qtm-icon-caret-right').click();
    cy.get('ux-alert').contains('error1');
  });

  it('Should show the translated name of the custom actions', () => {
    cy.visit('/testCustomActionPage');
    cy.wait(['@getCustomActionPage', '@getData', '@getTOC']);
    cy.get('[data-cy="action-button"]').last().click();
    cy.get('[data-cy="action-button-toggleChartBaseline_id"]').find('.dropdown-menu-text').should('contain', 'Toggle METRICS');
  });
});
