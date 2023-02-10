const shared = require('../../shared/shared');
import MainPage from '../../../../support/reporting/pageObjects/MainPage';
import DataCollectorPage from '../../../../support/reporting/pageObjects/DataCollectorPage';

describe('Param query default value tests', shared.defaultTestOptions, () => {
  it('Check default value is cleared upon param query type change', () => {
    cy.intercept(`${Cypress.env('BVD_CONTEXT_ROOT')}/rest/${Cypress.env('API_VERSION')}/system`).as('pageloadSystem');
    cy.intercept(`${Cypress.env('BVD_CONTEXT_ROOT')}/rest/${Cypress.env('API_VERSION')}/session/user`).as('pageloadUser');
    cy.intercept(`${Cypress.env('BVD_CONTEXT_ROOT')}/rest/${Cypress.env('API_VERSION')}/dataCollector*`).as('dataCollectorGet');
    cy.bvdLogin();
    cy.visit('/#/dataCollector');
    cy.wait(['@pageloadSystem', '@pageloadUser', '@dataCollectorGet']);
    DataCollectorPage.clickNewQuery('Param Query');
    cy.enter('#contentFrame').then(getBody => {
      getBody().find('#dateSelector').click();
      getBody().find(`input[value='customvalue']`).click();
      getBody().find('[data-cy="date-string"]').click();
      // this below code types escape on the input control of the time range selector
      // as the time range selector is at the top level compared to other elements
      getBody().find('ux-spin-button > .form-control').eq(0).type('{esc}');
      getBody().find('#nonsqlparam').click();
      getBody().find('[data-cy="value-input-field"]').should('have.value', '');
      getBody().find('[data-cy="value-empty-validator"]').contains('Default value field cannot be empty');
      MainPage.logOutOfBVD();
    });
  });
});
