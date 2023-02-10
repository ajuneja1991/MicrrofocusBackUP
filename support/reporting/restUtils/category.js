import getToken from '../restUtils/getXAuthToken';
const getSecureModifyToken = require('../restUtils/getSecureModifyToken');
const idmFullUrl = `${Cypress.env('IDM_BASE_URL')}/idm-service/v3.0/tokens`;

const createDashboardMenuCategory = function(categoryName, scope) {
  cy.wrap(getToken(idmFullUrl)).then(token => {
    cy.request({
      method: 'GET',
      url: `/rest/${Cypress.env('API_VERSION')}/channel`,
      headers: {
        'x-auth-token': token
      }
    }).then(result => {
      const secureModifyToken = getSecureModifyToken(result);
      cy.request({
        method: 'POST',
        url: `/rest/${Cypress.env('API_VERSION')}/categories/`,
        headers: {
          'X-Secure-Modify-Token': secureModifyToken
        },
        body: {
          name: categoryName,
          scope
        }
      }).then(response => {
        expect(response.status).to.eq(200, 401);
      });
    });
  });
};
module.exports = {
  createDashboardMenuCategory
};
