/* eslint-disable node/no-process-env, node/global-require, no-unused-expressions, node/no-sync, no-console, camelcase */

const _ = require('lodash');
const { randomUUID } = require('crypto');
const Ajv = require('ajv');
const supertest = require('supertest');

const ajv = new Ajv({ allErrors: true });
const schemaCache = {};

const validateDataWithSchema = (data, schema) => {
  let validate = schemaCache[schema.title];
  if (!validate) {
    validate = ajv.compile(schema);
    schemaCache[schema.title] = validate;
  }

  const valid = validate(data);

  if (!valid) {
    console.log('Error validating schema', schema.title, validate.errors);
  }
  return valid;
};

const getTestUrl = () => process.env.BVD_TEST_URL || 'http://localhost:4000';
const getRootContext = () => process.env.BVD_CONTEXT_ROOT || '/bvd';
const getIDMTestUrl = () => process.env.BVD_IDM_URL || 'http://localhost:5555';

let secureModifyToken;
const tenant = {
  name: randomUUID(),
  email: `${randomUUID()}@example.com`,
  password: 'aA!12345'
};

const updateCookie = function(res) {
  _.each(res.header['set-cookie'], cookie => {
    if (cookie.substring(0, 17) === 'secureModifyToken') {
      secureModifyToken = cookie.split(';')[0].split('=')[1];
    }
  });
};

const login = function(request, api, account, passwd, done, tenantName) {
  const idmRequest = supertest.agent(getIDMTestUrl());
  const separator = api.includes('?') ? '&' : '?';
  const idmUrl = '/idm-service/v3.0/tokens';
  idmRequest
    .post(idmUrl)
    .send({
      passwordCredentials: {
        username: account,
        password: passwd
      },
      tenantName: tenantName || tenant.name
    })
    .end((err, response) => {
      if (err) {
        return done(new Error(`Error while login IDM (${idmRequest.app}${api}): ${err}`));
      }
      const token = response.body && response.body.token && response.body.token.id && response.body.token.id;
      request
        .get(`${api}${separator}tenant=${tenantName || tenant.name}`)
        .set('x-auth-token', token)
        .expect(200)
        .end((err, res) => {
          if (err) {
            return done(new Error(`Error while login (${request.app}${api}): ${err}`));
          }
          updateCookie(res);
          expect(secureModifyToken).to.be.not.undefined;
          return done();
        });
    });
};

const logout = function(request, done, api = '/logout') {
  request
    .post(api)
    .send({})
    .set('X-Secure-Modify-Token', secureModifyToken)
    .end((err, res) => {
      if (err) {
        return done(new Error(`Error while logging out (${request.app}${api}): ${err}`));
      }
      secureModifyToken = null;
      if (res.status === 302) {
        expect(res.headers.location).contains('idm-service/idm/v0/login');
      } else {
        expect(res.status).to.eq(200);
      }
      return done();
    });
};

const getSecureModifyToken = function() {
  return secureModifyToken;
};

module.exports = {
  login,
  logout,
  updateCookie,
  secureModifyToken: getSecureModifyToken,
  tenant,
  testURL: getTestUrl(),
  rootContext: getRootContext(),
  validateDataWithSchema,
  getIDMTestUrl
};

