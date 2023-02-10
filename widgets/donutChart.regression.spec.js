// <reference types="Cypress" />
const shared = require('../../../shared/shared');

describe('DonutChart', shared.defaultTestOptions, () => {
  beforeEach(() => {
    cy.intercept({
      method: 'POST',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/datasource/ws/data`
    }).as('getWebapiData');
    cy.bvdLogin();
    cy.visit('/allChartsPage');
    cy.wait('@getWebapiData');
  });

  it('Donut chart widget must exist', () => {
    cy.get('#donut_chart').find('echarts-chart');
  });

  it('Donut chart widget must have entries', () => {
    cy.get('#donut_chart').find('svg');
    cy.get('#donut_chart').find('uis-spinner-overlay').find('.spinner-overlay').should('be.hidden');
  });
});
