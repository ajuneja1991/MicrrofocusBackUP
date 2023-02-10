// <reference types="Cypress" />
const shared = require('../../../shared/shared');

describe('Above threshold component chart', shared.defaultTestOptions, () => {
  beforeEach(() => {
    cy.intercept({
      method: 'POST',
      path: shared.exploreContextRoot.concat(`/rest/${Cypress.env('API_VERSION')}/datasource/ws/data`)
    }).as('getWebapiData');
    cy.bvdLogin();
    cy.visit('/allChartsPage');
    cy.wait('@getWebapiData');
  });

  it('Above threshold component chart widget must exist', () => {
    cy.get('#average_cpu_chart_threshold_component_1').find('echarts-chart');
  });

  it('Above threshold component chart widget must have entries', () => {
    cy.get('#average_cpu_chart_threshold_component_1').find('svg');
    cy.get('#average_cpu_chart_threshold_component_1').find('uis-spinner-overlay').find('.spinner-overlay').should('be.hidden');
  });
});
