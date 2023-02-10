import getToken from '../restUtils/getXAuthToken';
const getSecureModifyToken = require('../restUtils/getSecureModifyToken');
const dataCollectorEndPoint = `/rest/${Cypress.env('API_VERSION')}/dataCollector`;
const idmFullUrl = `${Cypress.env('IDM_BASE_URL')}/idm-service/v3.0/tokens`;

const getAllDataCollectors = (bvdBaseUrl = '') => new Promise(resolve => {
  cy.request({
    method: 'GET',
    url: bvdBaseUrl ? `${bvdBaseUrl}${dataCollectorEndPoint}` : `${dataCollectorEndPoint}`
  }).then(result => {
    resolve({ dataCollectors: result.body.data, secureModifyToken: getSecureModifyToken(result) });
  });
}).catch(error => Promise.reject(error));

const deleteAllQueries = (bvdBaseUrl = '', user = Cypress.env('username'), password = Cypress.env('password'), tenant = Cypress.env('tenant')) => {
  cy.wrap(getToken(idmFullUrl, user, password, tenant)).then(token => {
    cy.request({
      method: 'GET',
      url: bvdBaseUrl ? `${bvdBaseUrl}${dataCollectorEndPoint}` : `${dataCollectorEndPoint}`,
      headers: {
        'x-auth-token': token
      }
    }).then(result => {
      const secureModifyToken = getSecureModifyToken(result);
      const dataCollectorArray = result.body.data;
      dataCollectorArray.forEach(dataCollector => {
        cy.request({
          method: 'DELETE',
          url: `${dataCollectorEndPoint}/${dataCollector._id}`,
          headers: {
            'X-Secure-Modify-Token': secureModifyToken
          }
        }).then(response => {
          // 401 response is required incase no query exists in bvd
          expect(response.status).to.eq(200, 401);
        });
      });
    });
  });
};

const createDataQuery = function(dataQueryType, query, name, description = '', availableColumns = [], sampleQueryResult = {}, tags = [], dims = []) {
  const dataCollector = {
    active: true,
    data: {
      resultFormat: dataQueryType, // for default query dataQueryType='unchanged' and for group widget dataQuerytype='groupwidget'
      tags,
      dims,
      description,
      queryText: query,
      availableColumns,
      sampleQueryResult
    },
    name
  };
  cy.wrap(getToken(idmFullUrl)).then(token => {
    cy.request({
      method: 'GET',
      url: dataCollectorEndPoint,
      headers: {
        'x-auth-token': token
      }
    }).then(result => {
      const secureModifyToken = getSecureModifyToken(result);
      cy.request({
        method: 'POST',
        url: dataCollectorEndPoint,
        body: { dataCollector },
        headers: {
          'X-Secure-Modify-Token': secureModifyToken
        }
      }).then(response => {
        expect(response.status).to.eq(200, 401);
      });
    });
  });
};

const createDateTypeParameterQuery = function(displayName, dateType, variableName, defaultValue) {
  const dataCollectorObj = {
    active: true,
    type: 'param',
    data: {
      tags: [],
      dims: [],
      paramQueryType: 'date',
      queryText: '',
      selectedColumn: '',
      selectedColumnValue: '',
      selectedoption: defaultValue.length ? 'customvalue' : 'novalue',
      selectedDate: dateType,
      value: defaultValue.length ? defaultValue : '',
      displayName,
      variableName,
      resultFormat: 'unchanged',
      labelValueList: [],
      availableColumns: [],
      predefinedValue: ''
    },
    name: `${displayName} (${variableName})`
  };

  cy.wrap(getToken(idmFullUrl)).then(token => {
    cy.request({
      method: 'GET',
      url: dataCollectorEndPoint,
      headers: {
        'x-auth-token': token
      }
    }).then(result => {
      const secureModifyToken = getSecureModifyToken(result);
      cy.request({
        method: 'POST',
        url: `${dataCollectorEndPoint}?format=json`,
        body: { dataCollector: dataCollectorObj },
        headers: {
          'X-Secure-Modify-Token': secureModifyToken
        }
      }).then(response => {
        expect(response.status).to.eq(200, 401);
      });
    });
  });
};

const updateDataCollector = (bvdBaseUrl = '', dataCollectorId, secureModifyToken = '', dataCollector = {}) => {
  const updateDataCollectorEndPoint = `${dataCollectorEndPoint}/${dataCollectorId}?format=json`;
  cy.request({
    method: 'PUT',
    url: bvdBaseUrl ? `${bvdBaseUrl}${updateDataCollectorEndPoint}` : updateDataCollectorEndPoint,
    headers: {
      'X-Secure-Modify-Token': secureModifyToken
    },
    body: { dataCollector }
  }).then(response => {
    // 401 response is required incase no query exists in bvd
    expect(response.status).to.eq(200, 401);
  });
};

const deleteSingleQuery = (bvdBaseUrl = '', dataCollectorId = '', secureModifyToken) => {
  cy.wrap(getToken(idmFullUrl)).then(token => {
    cy.request({
      method: 'DELETE',
      url: bvdBaseUrl ? `${bvdBaseUrl}${dataCollectorEndPoint}/${dataCollectorId}` : `${dataCollectorEndPoint}/${dataCollectorId}?format=json`,
      headers: {
        'X-Secure-Modify-Token': secureModifyToken,
        'x-auth-token': token
      }
    }).then(response => {
      expect(response.status).to.eq(200, 401);
    });
  });
};

module.exports = {
  deleteAllQueries,
  createDataQuery,
  createDateTypeParameterQuery,
  getAllDataCollectors,
  updateDataCollector,
  deleteSingleQuery
};
