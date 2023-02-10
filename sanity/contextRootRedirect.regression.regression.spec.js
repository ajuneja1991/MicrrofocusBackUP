describe('validate context root redirect', () => {
  it('validate invalid url does not point to ui', () => {
    cy.request({
      method: 'GET',
      url: Cypress.env('baseUrlInvalid'),
      failOnStatusCode: false
    }).then(response => {
      expect(response.status).to.equal(404);
    });
    cy.request({
      method: 'GET',
      url: Cypress.env('baseUrlNewInvalid'),
      failOnStatusCode: false
    }).then(response => {
      expect(response.status).to.equal(404);
    });
  });
});
