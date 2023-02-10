// <reference types="Cypress" />
const shared = require('../../../shared/shared');

describe('ChangeMakerChart', shared.defaultTestOptions, () => {
  beforeEach(() => {
    cy.intercept({
      method: 'POST',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/datasource/ws/data`
    }).as('getWebapiData');
    cy.bvdLogin();
    cy.visit('/allChartsPage');
    cy.wait('@getWebapiData');
  });

  it('component with Change Marker chart widget must exist', () => {
    cy.get('#average_cpu_chart_component_with_Change_Marker').find('echarts-chart');
  });

  it('Change Marker chart chart widget must have entries', () => {
    cy.get('#average_cpu_chart_component_with_Change_Marker').find('svg');
    cy.get('#average_cpu_chart_component_with_Change_Marker').find('uis-spinner-overlay').find('.spinner-overlay').should('be.hidden');
  });
});
