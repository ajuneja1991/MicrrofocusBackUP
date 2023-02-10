const user = Cypress.env('username');
const passwd = Cypress.env('password');

const getXAuthToken = data => data?.body?.token?.id;

const getToken = function(url, userId, password, tenant = Cypress.env('tenant')) {
  const payload = {
    passwordCredentials: {
      username: userId || user,
      password: password || passwd
    },
    tenantName: tenant
  };
  return new Promise((resolve, reject) => {
    try {
      cy.request(
        'POST',
        url || `/idm-service/v3.0/tokens`,
        payload
      ).then(result => {
        resolve(getXAuthToken(result));
      });
    } catch (err) {
      reject(err);
    }
  });
};

module.exports = getToken;
