import getToken from '../restUtils/getXAuthToken';
const getSecureModifyToken = require('../restUtils/getSecureModifyToken');
const idmFullUrl = `${Cypress.env('IDM_BASE_URL')}/idm-service/v3.0/tokens`;

const dashboardDelete = function(dashboardName) {
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
        method: 'DELETE',
        url: `/rest/${Cypress.env('API_VERSION')}/dashboard/${dashboardName}`,
        headers: {
          'X-Secure-Modify-Token': secureModifyToken
        }
      }).then(response => {
      // 401 response is required incase the dashboard does not exist in bvd
        expect(response.status).to.eq(200, 401);
      });
    });
  });
};
module.exports = {
  dashboardDelete
};
