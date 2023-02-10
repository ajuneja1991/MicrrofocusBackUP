// <reference types="Cypress" />
const shared = require('../../../shared/shared');

describe('PieChart', shared.defaultTestOptions, () => {
  beforeEach(() => {
    cy.intercept({
      method: 'POST',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/datasource/ws/data`
    }).as('getWebapiData');
    cy.bvdLogin();
    cy.visit('/allChartsPage');
    cy.wait('@getWebapiData');
  });

  it('Pie chart widget exist', () => {
    cy.get('#Pie_Chart').find('echarts-chart');
  });

  it('Pie chart widget has entries', () => {
    cy.get('#Pie_Chart').find('svg');
    cy.get('#Pie_Chart').find('uis-spinner-overlay').find('.spinner-overlay').should('be.hidden');
  });
});
