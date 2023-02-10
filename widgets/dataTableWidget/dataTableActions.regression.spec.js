const shared = require('../../../../shared/shared');
describe('Data Table Actions - Set Context', shared.defaultTestOptions, () => {
  before(() => {
    const baseAPIUrl = `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}`;
    cy.intercept({ method: 'GET', path: `${baseAPIUrl}/pagesWithComponents/dataTableActions*` }).as('getPage');
    cy.intercept({ method: 'POST', path: `${baseAPIUrl}/datasource/ws/data` }).as('getWebapiData');
    cy.intercept({ method: 'GET', path: `${baseAPIUrl}/pages/toc*` }).as('getTOC');
    cy.bvdLogin();
    cy.visit('/dataTableActions');
    cy.wait(['@getPage', '@getWebapiData', '@getTOC']);
  });

  it('User can set context by click on link in table cell', () => {
    cy.get('#dataTableSetContext ag-grid-angular').should('have.length', 1)
      .contains('APJ').click();
    cy.wait(['@getWebapiData']);
    cy.contains('[data-cy=context-tag-labelWithoutType]', 'APJ');
  });
});
