const getCookie = require('../../../../../shared/getCookie');
const shared = require('../../../integration/bvd/shared/shared');

import getTokenFromXauth from '../restUtils/getXAuthToken';
const idmFullUrl = `${Cypress.env('IDM_BASE_URL')}/idm-service/v3.0/tokens`;

// Enhancement : depricate direct use of this method in other file.
const getSecureModifyToken = function(result) {
  if (result && result.headers['set-cookie'] && result.headers['set-cookie'].length > 2) {
    const cookie = result.headers['set-cookie'].filter(cookieItem => cookieItem.includes('secureModifyToken'))[0];
    return getCookie(cookie, 'secureModifyToken');
  }
  const cookie = result.requestHeaders.cookie;
  return getCookie(cookie, 'secureModifyToken');
};

const getToken = function(user = Cypress.env('username'), password = Cypress.env('password'), tenant = Cypress.env('tenant')) {
  let bvdURL = Cypress.config().baseUrl;
  if (!Cypress.config().baseUrl.includes(Cypress.env('BVD_CONTEXT_ROOT'))) {
    bvdURL = shared.getBaseUrlForRequest(Cypress.config().baseUrl);
  }

  return new Promise((resolve, reject) => {
    try {
      cy.wrap(getTokenFromXauth(idmFullUrl, user, password, tenant)).then(token => {
        cy.request({
          method: 'GET',
          url: `${bvdURL}/rest/${Cypress.env('API_VERSION')}/channel`,
          headers: {
            'x-auth-token': token
          }
        }).then(result => {
          resolve(getSecureModifyToken(result));
        });
      });
    } catch (err) {
      reject(err);
    }
  });
};

const tokenModule = module.exports = getSecureModifyToken;
tokenModule.getToken = getToken;
