const shared = require('../../shared/shared');

describe('Visible property', () => {
  beforeEach(() => {
    cy.intercept({
      method: 'POST',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/datasource/ws/data`
    }).as('getData');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/testVisiblePage*`
    }).as('getPage');
    cy.bvdLogin();
    cy.visit('/testVisiblePage');
    cy.wait(['@getData', '@getPage']);
  });

  it('Test visible property', () => {
    // Only specified series name should be present
    cy.get('#ui-test-complex-chart-visible1').find('echarts-chart').find('button').click();
    cy.get('[id="CPU Utilization (avg): host_name: vdb.mambo.net"]');
    cy.get('[id="Memory Utilization (avg): host_name: vdb.mambo.net"]').should('not.exist');
    cy.get('body').click();

    // All series should be present
    cy.get('#bar-chart-visible-true').find('echarts-chart').find('button').click();
    cy.get('[id="CPU Utilization (avg): host_name: vdb.mambo.net"]');
    cy.get('body').click();

    // Series name with pattern mem.* should be present
    cy.get('#ui-test-complex-chart-visible2').find('echarts-chart').find('button').click();
    cy.get('[id="Memory Utilization (avg): host_name: vdb.mambo.net"]');
    cy.get('[id="CPU Utilization (avg): host_name: vdb.mambo.net"]').should('not.exist');
    cy.get('body').click();

    // Visible property not specified, all series should be present
    cy.get('#avg_cpu_baseline_chart_component_ec').find('echarts-chart').find('button').click();
    cy.get('[id="CPU Utilization (avg): host_name: vdb.mambo.net"]');
    cy.get('body').click();

    // Visible chart set to false
    cy.get('#bar-chart-visible-false').find('echarts-chart').find('button').should('not.exist');
  });
});
