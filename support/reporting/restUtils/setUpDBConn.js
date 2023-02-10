import getToken from '../restUtils/getXAuthToken';
const getSecureModifyToken = require('../restUtils/getSecureModifyToken');
const idmFullUrl = `${Cypress.env('IDM_BASE_URL')}/idm-service/v3.0/tokens`;

const setUpDbConnection = function(contextRoot, host, port, username, database, password, forceTLS = false, certificate = '', certName = '') {
  cy.wrap(getToken(idmFullUrl)).then(token => {
    cy.request({
      method: 'GET',
      url: `/rest/${Cypress.env('API_VERSION')}/channel`,
      headers: {
        'x-auth-token': token
      }
    }).then(result => {
      const xSecureModifyToken = getSecureModifyToken(result);
      cy.intercept({ method: 'PUT', url: `${contextRoot}/rest/${Cypress.env('API_VERSION')}/connection` })
        .as('putConnection')
        .window()
        .then(win => {
          const formData = new FormData();
          const xhr = new win.XMLHttpRequest();
          formData.append('connection', JSON.stringify({ host, port, username, database, forceTLS, password, certificate, certName }));
          xhr.open('PUT', `${contextRoot}/rest/${Cypress.env('API_VERSION')}/connection`);
          xhr.setRequestHeader('X-Secure-Modify-Token', xSecureModifyToken);
          xhr.send(formData);
        }).wait('@putConnection');
    });
  });
};
module.exports = {
  setUpDbConnection
};
