import getToken from '../restUtils/getXAuthToken';
const getSecureModifyToken = require('../restUtils/getSecureModifyToken');
const idmFullUrl = `${Cypress.env('IDM_BASE_URL')}/idm-service/v3.0/tokens`;
const shared = require('../../../integration/bvd/shared/shared');

const roleCreation = function(roleName, roleDesc, categoryName, accessType, resourceKey, creatingRoleForEmbeddedBVD) {
  return new Promise(resolve => {
    let assignment = '';
    if (categoryName) {
      switch (categoryName) {
        case 'All': assignment = '';
          break;
        case 'assigned': assignment = '<>assigned';
          break;
        case 'not-assigned': assignment = '<>not-assigned';
          break;
        default: assignment = `<>assigned<>${categoryName}`;
      }
    }
    let baseUrl = Cypress.config().baseUrl;
    // eslint-disable-next-line camelcase
    const permission = { operation_key: accessType, resource_key: `omi-event${assignment}` };
    if (resourceKey) {
      // eslint-disable-next-line camelcase
      permission.resource_key = resourceKey;
    }
    if (creatingRoleForEmbeddedBVD && !baseUrl.includes(Cypress.env('BVD_CONTEXT_ROOT'))) {
      baseUrl = shared.getBaseUrlForRequest(baseUrl);
    }

    cy.wrap(getToken(idmFullUrl)).then(token => {
      cy.request({
        method: 'GET',
        url: `${baseUrl}/rest/${Cypress.env('API_VERSION')}/channel`,
        headers: {
          'x-auth-token': token
        }
      }).then(result => {
        const secureModifyToken = getSecureModifyToken(result);
        cy.request({
          method: 'POST',
          url: `${baseUrl}/rest/${Cypress.env('API_VERSION')}/role`,
          body: {
            role: {
              name: roleName,
              description: roleDesc,
              permission: [permission]
            }
          },
          headers: {
            'X-Secure-Modify-Token': secureModifyToken
          }
        }).then(response => {
          expect(response.status).to.eq(200);
          resolve(response.body.role.id);
        });
      });
    });
  }).catch(error => Promise.reject(error));
};

const roleCreationWithPermissionArray = function(roleName, roleDesc, permissionArray, creatingRoleForEmbeddedBVD, adminUser = Cypress.env('username'), adminPasswd = Cypress.env('password'), tenantName = Cypress.env('tenant')) {
  return new Promise(resolve => {
    let baseUrl = Cypress.config().baseUrl;
    // eslint-disable-next-line camelcase
    if (creatingRoleForEmbeddedBVD && !baseUrl.includes(Cypress.env('BVD_CONTEXT_ROOT'))) {
      baseUrl = shared.getBaseUrlForRequest(baseUrl);
    }
    cy.wrap(getToken(idmFullUrl, adminUser, adminPasswd, tenantName)).then(token => {
      cy.request({
        method: 'GET',
        url: `${baseUrl}/rest/${Cypress.env('API_VERSION')}/role`,
        headers: {
          'x-auth-token': token
        }
      }).then(result => {
        const currentRole = result.body.role_list.role.find(role => role.name === roleName);
        const secureModifyToken = getSecureModifyToken(result);
        cy.request({
          method: currentRole ? 'PUT' : 'POST',
          url: currentRole ? `${baseUrl}/rest/${Cypress.env('API_VERSION')}/role/${currentRole.id}` : `${baseUrl}/rest/${Cypress.env('API_VERSION')}/role`,
          body: {
            role: {
              name: roleName,
              description: roleDesc,
              permission: permissionArray
            }
          },
          headers: {
            'X-Secure-Modify-Token': secureModifyToken
          }
        }).then(response => {
          expect(response.status).to.eq(200);
          resolve(response.body.role.id);
        });
      });
    });
  }).catch(error => Promise.reject(error));
};

const roleDeletion = function(roleID, creatingRoleForEmbeddedBVD, adminUser = Cypress.env('username'), adminPasswd = Cypress.env('password'), tenantName = Cypress.env('tenant')) {
  if (!roleID) {
    return; // Return if role id is not being sent by the caller
  }
  let baseUrl = Cypress.config().baseUrl;
  if (creatingRoleForEmbeddedBVD && !baseUrl.includes(Cypress.env('BVD_CONTEXT_ROOT'))) {
    baseUrl = shared.getBaseUrlForRequest(baseUrl);
  }

  cy.wrap(getToken(idmFullUrl, adminUser, adminPasswd, tenantName)).then(token => {
    cy.request({
      method: 'GET',
      url: `${baseUrl}/rest/${Cypress.env('API_VERSION')}/channel`,
      headers: {
        'x-auth-token': token
      }
    }).then(result => {
      const secureModifyToken = getSecureModifyToken(result);
      cy.request({
        method: creatingRoleForEmbeddedBVD ? 'POST' : 'DELETE',
        url: creatingRoleForEmbeddedBVD ? `${baseUrl}/rest/${Cypress.env('API_VERSION')}/role?_method=DELETE&format=json&multiMode=true` : `${baseUrl}/rest/${Cypress.env('API_VERSION')}/role/${roleID}`,
        // eslint-disable-next-line camelcase
        body: creatingRoleForEmbeddedBVD ? { role_list: { role: [{ id: roleID }]}} : {},
        headers: {
          'X-Secure-Modify-Token': secureModifyToken
        }
      }).then(response => {
        // 401 response is required incase the role is not existing in bvd
        expect(response.status).to.eq(200, 401);
      });
    });
  });
};

const getIDMroles = xAuthToken => new Promise((resolve, reject) => {
  const tenant = Cypress.env('tenant');
  try {
    cy.request({
      method: 'GET',
      url: `/idm-service/api/scim/organizations/${tenant}/roles`,
      headers: {
        'X-Auth-Token': xAuthToken,
        Accept: 'application/json'
      }
    }).then(result => {
      resolve(result);
    });
  } catch (err) {
    reject(err);
  }
});

const deleteIDMRole = (roleId, xAuthToken) => {
  const tenant = Cypress.env('tenant');
  return new Promise((resolve, reject) => {
    try {
      cy.request({
        method: 'DELETE',
        url: `/idm-service/api/scim/organizations/${tenant}/roles/${roleId}`,
        headers: {
          'X-Auth-Token': xAuthToken,
          Accept: 'application/json'
        }
      }).then(result => {
        expect(result.status).to.eq(200, 200);
        resolve(result);
      });
    } catch (err) {
      cy.log(err);
      reject(err);
    }
  });
};

module.exports = {
  roleCreation,
  roleCreationWithPermissionArray,
  roleDeletion,
  getIDMroles,
  deleteIDMRole
};
