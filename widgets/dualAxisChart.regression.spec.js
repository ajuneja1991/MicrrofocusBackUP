// <reference types="Cypress" />
const shared = require('../../../shared/shared');

describe('Dual axis chart', shared.defaultTestOptions, () => {
  beforeEach(() => {
    cy.intercept({
      method: 'POST',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/datasource/ws/data`
    }).as('getWebapiData');
    cy.bvdLogin();
    cy.visit('/allChartsPage');
    cy.wait('@getWebapiData');
  });

  it('Dual axis chart widget must exist', () => {
    cy.get('#average_cpu_dualaxis').find('echarts-chart');
  });

  it('Dual axis chart widget should have left and right axis labels', () => {
    cy.get('#average_cpu_dualaxis').find('echarts-chart');
    cy.get('#average_cpu_dualaxis').find('echarts-chart').find('.leftAxisLabel').should('exist').should('have.text', 'Count');
    cy.get('#average_cpu_dualaxis').find('echarts-chart').find('.rightAxisLabel').should('exist').should('have.text', 'Percent');
  });

  it('Dual axis chart widget must have entries', () => {
    cy.get('#average_cpu_dualaxis').find('svg');
    cy.get('#average_cpu_dualaxis').find('uis-spinner-overlay').find('.spinner-overlay').should('be.hidden');
  });
});
