const shared = require('../../../../shared/shared');
describe('Key value widget error and empty data handling', () => {
  const widgetWithoutMetaInConfig = 0;
  const widgetWithMetaInConfig = 1;
  beforeEach(() => {
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/keyValueError*`
    }).as('getPage');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pages/toc*`
    }).as('getToc');
    cy.bvdLogin();
  });

  it('should show error banner if error while retrieving data', () => {
    cy.intercept({
      method: 'POST',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/datasource/ws/data`
    }).as('getData');
    cy.visit('keyValueError');
    cy.wait(['@getData', '@getData', '@getPage', '@getToc', '@getToc']);
    cy.get('mondrian-widget').eq(widgetWithoutMetaInConfig).then(widget => {
      cy.wrap(widget).find('[data-cy="notification-error-text"]').contains('Data not found');
    });
    cy.get('mondrian-widget').eq(widgetWithMetaInConfig).then(widget => {
      cy.wrap(widget).find('[data-cy="notification-error-text"]').contains('Data not found');
    });
  });

  it('should  show no data message in case of empty data response', () => {
    cy.intercept({
      method: 'POST',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/datasource/ws/data`
    }, []).as('getData');
    cy.visit('keyValueError');
    cy.wait(['@getData', '@getData', '@getPage', '@getToc', '@getToc']);
    cy.get('mondrian-widget').eq(widgetWithoutMetaInConfig).then(widget => {
      cy.wrap(widget).find('[data-cy="notification-info-text"]').should('contain.text', 'No data');
    });
    cy.get('mondrian-widget').eq(widgetWithMetaInConfig).then(widget => {
      cy.wrap(widget).find('[data-cy="notification-info-text"]').should('contain.text', 'No data');
    });
  });
});
