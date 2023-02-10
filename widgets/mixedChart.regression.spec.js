// <reference types="Cypress" />
const shared = require('../../../shared/shared');

describe('MixedChart widget', shared.defaultTestOptions, () => {
  beforeEach(() => {
    cy.intercept({
      method: 'POST',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/datasource/ws/data`
    }).as('getWebapiData');
    cy.bvdLogin();
    cy.visit('/allChartsPage');
    cy.wait('@getWebapiData');
  });

  it('Mixed chart widget must exist', () => {
    cy.get('#average_cpu_chart_mixed').find('echarts-chart');
  });

  it('Mixed chart widget must have entries', () => {
    cy.get('#average_cpu_chart_mixed').find('svg');
    cy.get('#average_cpu_chart_mixed').find('uis-spinner-overlay').find('.spinner-overlay').should('be.hidden');
  });
});
