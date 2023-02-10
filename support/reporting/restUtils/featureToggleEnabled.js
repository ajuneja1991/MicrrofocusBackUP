/**
 * login is required before you call the function
 */
const featureToggleEnabled = function(ft) {
  return new Promise((resolve, reject) => {
    try {
      cy.getCookie('secureModifyToken').then(secureModifyToken => {
        console.log(secureModifyToken);
        cy.request({
          method: 'GET',
          url: `/rest/${Cypress.env('API_VERSION')}/system`,
          headers: {
            'X-Secure-Modify-Token': secureModifyToken.value
          }
        }).then(result => {
          resolve(result.body?.data?.featureToggles[ft]);
        });
      });
    } catch (err) {
      reject(err);
    }
  });
};

module.exports = {
  featureToggleEnabled
};
