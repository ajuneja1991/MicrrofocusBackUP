// <reference types="Cypress" />
const shared = require('../../../shared/shared');

describe('Base-line chart', shared.defaultTestOptions, () => {
  beforeEach(() => {
    cy.intercept({
      method: 'POST',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/datasource/ws/data`
    }).as('getWebapiData');
    cy.bvdLogin();
    cy.visit('/allChartsPage');
    cy.wait('@getWebapiData');
  });

  it('Base-line chart widget must exist', () => {
    cy.get('#avg_cpu_baseline_chart_component_ec').find('echarts-chart');
  });

  it('Base-line chart widget must have entries', () => {
    cy.get('#avg_cpu_baseline_chart_component_ec').find('svg');
    cy.get('#avg_cpu_baseline_chart_component_ec').find('uis-spinner-overlay').find('.spinner-overlay').should('be.hidden');
  });

  it('should display overlays and config by default for a single line chart, only if parent charts are present', () => {
    cy.get('ux-dashboard-widget').eq(1).find('svg').find('g').eq(0).find('g')
      .eq(2)
      .then(gElement => {
        cy.wrap(gElement).invoke('attr', 'clip-path').should('contain', 'url(#zr1-c0)');
        cy.wrap(gElement).find('path').invoke('attr', 'stroke').should('contain', '#3939C6');
        cy.wrap(gElement).find('path').should('not.have.attr', 'stroke-width');
      });
  });

  it('should not display overlays and config by default for a multi line chart', () => {
    cy.get('ux-dashboard-widget').eq(4).find('svg').find('g').eq(0).find('g')
      .eq(2)
      .then(gElement => {
        cy.wrap(gElement).invoke('attr', 'clip-path').should('contain', 'url(#zr4-c2)');
        cy.wrap(gElement).find('path').invoke('attr', 'stroke').should('contain', '#3939C6');
        cy.wrap(gElement).find('path').should('not.have.attr', 'stroke-width');
      });
  });
});
