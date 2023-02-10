// <reference types="Cypress" />
const shared = require('../../../shared/shared');

describe('Complex Chart', shared.defaultTestOptions, () => {
  beforeEach(() => {
    cy.intercept({
      method: 'POST',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/datasource/ws/data`
    }).as('getWebapiData');
    cy.bvdLogin();
    cy.visit('/uiTestWidgetsComplexChart');
    cy.wait(['@getWebapiData']);
  });

  it('widget exist', () => {
    cy.contains('Complex Chart');
    cy.get('echarts-chart');
  });

  it('widget has entries', () => {
    cy.get('echarts-chart').find('svg');
    cy.get('echarts-chart').find('uis-spinner-overlay').find('.spinner-overlay').should('be.hidden');
  });
});
