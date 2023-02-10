import getToken from '../restUtils/getXAuthToken';
const getSecureModifyToken = require('../restUtils/getSecureModifyToken');
const idmFullUrl = `${Cypress.env('IDM_BASE_URL')}/idm-service/v3.0/tokens`;

const updateSystemTimeZone = function(timezone) {
  cy.wrap(getToken(idmFullUrl)).then(token => {
    cy.request({
      method: 'GET',
      url: `/rest/${Cypress.env('API_VERSION')}/tenant/systemsettings`,
      headers: {
        'x-auth-token': token
      }
    }).then(result => {
      const secureModifyToken = getSecureModifyToken(result);
      const tenantSettings = result.body.data;
      tenantSettings.settings.timezone = timezone;
      expect(result.status).to.eq(200);
      cy.request({
        method: 'POST',
        url: `/rest/${Cypress.env('API_VERSION')}/tenant/systemsettings`,
        headers: {
          'X-Secure-Modify-Token': secureModifyToken
        },
        body: tenantSettings
      }).then(res => {
        expect(res.status).to.eq(200);
      });
    });
  });
};

const updateUserTimeZone = function(timezone, useSystemTimeZone = false) {
  cy.wrap(getToken(idmFullUrl)).then(token => {
    cy.request({
      method: 'GET',
      url: `/rest/${Cypress.env('API_VERSION')}/session/user`,
      headers: {
        'x-auth-token': token
      }
    }).then(result => {
      const secureModifyToken = getSecureModifyToken(result);
      const currentUserSettings = result.body.data;
      const userSettings = {
        name: currentUserSettings.userDetails.name,
        settings: currentUserSettings.userDetails.settings
      };
      userSettings.settings.timezone = timezone;
      userSettings.settings.useSystemTimeZone = useSystemTimeZone;
      expect(result.status).to.eq(200);
      cy.request({
        method: 'PUT',
        url: `/rest/${Cypress.env('API_VERSION')}/session/user`,
        headers: {
          'X-Secure-Modify-Token': secureModifyToken
        },
        body: { userDetails: userSettings }
      }).then(res => {
        expect(res.status).to.eq(200);
      });
    });
  });
};

module.exports = {
  updateSystemTimeZone,
  updateUserTimeZone
};
