/* eslint-disable no-unused-expressions, node/no-sync */

const _ = require('lodash');
const { randomUUID } = require('crypto');
const supertest = require('supertest');
const fs = require('fs'),
  path = require('path');

const shared = require('./../helpers/shared');
const request = supertest.agent(shared.testURL + shared.rootContext);

describe('DataCollector API Test', () => {
  const createdDataCollectorObj = [];
  const adminLogin = shared.tenant.email,
    adminPasswd = shared.tenant.password,
    apiBase = '/rest/v2/dataCollector',
    channelBase = '/rest/v2/dataCollector/channel',
    mock = {
      dataCollector: {
        name: 'mock_collector_name',
        connection: null,
        type: 'vertica',
        active: true,
        lastExecution: '2017-10-16 11:26:53.827+02',
        data: {
          description: 'mock_description',
          tags: ['tag1', 'tag2'],
          dims: ['dim1', 'dim2'],
          queryText: 'select * from my_table',
          availableColumns: ['col1', 'col2'],
          resultFormat: 'unchanged', // ['unchanged', 'groupwidget']
          retentionValue: 200,
          retentionUnit: 'days', // ['hours', 'days', 'weeks', 'months']
          schedulingValue: 400,
          schedulingUnit: 'minutes', // ['minutes', 'hours', 'days', 'weeks', 'months'],
          sampleQueryResult: {
            data: 'hello world'
          }
        }
      },
      parameterWithAnotherParameterObj: {
        name: 'ID Param (id)',
        connection: null,
        type: 'param',
        active: true,
        lastExecution: '2021-06-02T05:38:58.868Z',
        data: {
          tags: [],
          dims: [],
          paramQueryType: 'sql',
          // eslint-disable-next-line no-template-curly-in-string
          queryText: 'select distinct id from bvd_lwr_demo where ${location = ${location}} order by id',
          selectedColumn: {
            id: 'id',
            label: 'id',
            icon: ''
          },
          selectedColumnValue: {
            id: 'id',
            label: 'id',
            icon: ''
          },
          selectedoption: 'novalue',
          selectedDate: 'specificDate',
          value: '',
          displayName: 'ID Param',
          variableName: 'id',
          resultFormat: 'unchanged',
          labelValueList: [],
          availableColumns: ['id'],
          sampleQueryResult: { id: 1 }
        }
      },
      parameterWithCyclicReference: {
        name: 'Location Param (location)',
        connection: null,
        type: 'param',
        active: true,
        lastExecution: '2021-06-02T05:38:58.868Z',
        data: {
          tags: [],
          dims: [],
          paramQueryType: 'sql',
          // eslint-disable-next-line no-template-curly-in-string
          queryText: 'select distinct location from bvd_lwr_demo where ${id = ${id}} order by location',
          selectedColumn: {
            id: 'location',
            label: 'location',
            icon: ''
          },
          selectedColumnValue: {
            id: 'location',
            label: 'location',
            icon: ''
          },
          selectedoption: 'novalue',
          selectedDate: 'specificDate',
          value: '',
          displayName: 'Location Param',
          variableName: 'location',
          resultFormat: 'unchanged',
          labelValueList: [],
          availableColumns: ['location'],
          sampleQueryResult: { location: 1 }
        }
      },
      parameterWithMultipleParameterObj: {
        name: 'ID Param (id)',
        connection: null,
        type: 'param',
        active: true,
        lastExecution: '2021-06-02T05:38:58.868Z',
        data: {
          tags: [],
          dims: [],
          paramQueryType: 'sql',
          // eslint-disable-next-line no-template-curly-in-string
          queryText: 'select distinct id from bvd_lwr_demo where ${location = ${location}} and ${sold_item = ${sold_item}} order by id',
          selectedColumn: {
            id: 'id',
            label: 'id',
            icon: ''
          },
          selectedColumnValue: {
            id: 'id',
            label: 'id',
            icon: ''
          },
          selectedoption: 'novalue',
          selectedDate: 'specificDate',
          value: '',
          displayName: 'ID Param',
          variableName: 'id',
          resultFormat: 'unchanged',
          labelValueList: [],
          availableColumns: ['id'],
          sampleQueryResult: { id: 1 }
        }
      }
    };
  const dataCollectorIds = [];

  const nonAdminUser = {
    login: `${randomUUID()}@example.com`,
    passwd: 'Abc1234$'
  };

  it('Login Admin', done => {
    shared.login(request, apiBase, adminLogin, adminPasswd, done);
  });

  it('Create Vertica Connection', done => {
    request
      .put('/rest/v2/connection')
      .set('Content-Type', 'multipart/form-data')
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .field('connection', JSON.stringify({
        host: '10.168.179.57',
        port: 5433,
        username: 'dbadmin',
        password: 'installed',
        database: 'opsadb'
      }))
      .expect(200)
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res.body.data).to.not.equal(undefined);
        expect(res.body.data.name).to.equal('default');
        expect(res.body.data.type).to.equal('vertica');
        return done();
      });
  });

  it('Handle empty request correctly', done => {
    request
      .post(apiBase)
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .send({})
      .expect(400)
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res.body.error).to.equal(true);
        expect(res.body.message).to.equal('dataCollector.editor.rest.emptyRequest');

        return done();
      });
  });

  it('Create predefined query (1)', done => {
    const postParams = {
      dataCollector: mock.dataCollector
    };

    postParams.dataCollector.name = 'mock_collector_name_1';
    request
      .post(apiBase)
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .send(postParams)
      .expect(200)
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res.body.data).to.not.equal(undefined);
        expect(res.body.data).to.not.equal(null);
        expect(res.body.data.name).to.equal(postParams.dataCollector.name);
        createdDataCollectorObj.push(res.body.data);

        return done();
      });
  });

  it('Create predefined query (2)', done => {
    const postParams = {
      dataCollector: mock.dataCollector
    };

    postParams.dataCollector.name = 'mock_collector_name_2';
    request
      .post(apiBase)
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .send(postParams)
      .expect(200)
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res.body.data).to.not.equal(undefined);
        expect(res.body.data).to.not.equal(null);
        expect(res.body.data.name).to.equal(mock.dataCollector.name);
        createdDataCollectorObj.push(res.body.data);

        return done();
      });
  });

  it('Create predefined query, invalid object', done => {
    const postParams = {
      dataCollector: {}
    };

    postParams.dataCollector.name = 'mock_collector_name_2';
    request
      .post(apiBase)
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .send(postParams)
      .expect(400)
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res.body.data).to.equal(undefined);

        return done();
      });
  });

  it('Testing reserved variables', done => {
    const payload = {
      query: 'SELECT ${${sys.user}} as loginuser' // eslint-disable-line no-template-curly-in-string
    };

    request
      .post(`${apiBase}/test`)
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .set('Content-Type', 'application/json')
      .send(payload)
      .expect(200)
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res.body.data).to.be.not.undefined;
        expect(res.body.data.length).to.equal(1);
        expect(res.body.data[0].loginuser).to.equal(shared.tenant.email);
        return done();
      });
  });

  it('Create predefined query, with missing params', done => {
    const postParams = {};

    request
      .post(apiBase)
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .send(postParams)
      .expect(400)
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res.body.data).to.equal(undefined);

        return done();
      });
  });

  it('Update predefined query', done => {
    const postParams = {
      dataCollector: _.cloneDeep(createdDataCollectorObj[0])
    };

    postParams.dataCollector.name = 'mock_collector_name_new';
    request
      .put(`${apiBase}/${createdDataCollectorObj[0]._id}`)
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .send(postParams)
      .expect(200)
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res.body.data).to.not.equal(undefined);
        expect(res.body.data).to.not.equal(null);
        expect(res.body.data.name).to.not.equal(createdDataCollectorObj[0].name);
        expect(res.body.data.name).to.equal(postParams.dataCollector.name);

        return done();
      });
  });

  it('should update the predefined query with wrong id and tenant in payload', done => {
    const postParams = {
      dataCollector: _.cloneDeep(createdDataCollectorObj[0])
    };

    postParams.dataCollector._id = 'Test%%%%%!@@@!@!';
    postParams.dataCollector.tenant = 'Tenant123';
    request
      .put(`${apiBase}/${createdDataCollectorObj[0]._id}`)
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .send(postParams)
      .expect(200)
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res.body.data).to.not.equal(undefined);
        expect(res.body.data).to.not.equal(null);
        expect(res.body.data._id).to.equal(createdDataCollectorObj[0]._id);
        expect(res.body.data.tenant).to.equal(createdDataCollectorObj[0].tenant);

        return done();
      });
  });

  it('Perform updation of predefined query with invalid csrf token', done => {
    const postParams = {
      dataCollector: _.cloneDeep(createdDataCollectorObj[0])
    };

    postParams.dataCollector.name = 'mock_collector_name_new';
    request
      .put(`${apiBase}/${createdDataCollectorObj[0]._id}`)
      .set('X-Secure-Modify-Token', 'm6WBppef-xdWYLmZmOAtxDECtv62gaRaxNi')
      .send(postParams)
      .expect(403)
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res.status).to.equal(403);
        expect(res.body.message).to.equal('Forbidden');

        return done();
      });
  });

  it('Export all predefined queries', done => {
    request
      .get(apiBase)
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .query({
        format: 'export'
      })
      .expect(200)
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res.type).to.equal('application/binary');
        expect(res.text).to.be.not.undefined;
        const data = JSON.parse(res.text);

        expect(Array.isArray(data)).to.equal(true);
        expect(data.length).to.equal(2);
        expect(data[0]._id).to.be.undefined;
        expect(data[1].tenant).to.be.undefined;

        return done();
      });
  });

  it('Export selected predefined queries', done => {
    request
      .get(`${apiBase}/${createdDataCollectorObj[1]._id},${createdDataCollectorObj[0]._id}`)
      .query({
        format: 'export'
      })
      .expect(200)
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res.type).to.equal('application/binary');
        expect(res.text).to.be.not.undefined;
        const data = JSON.parse(res.text);

        expect(Array.isArray(data)).to.equal(true);
        expect(data.length).to.equal(2);
        expect(data[0]._id).to.be.undefined;
        expect(data[1].tenant).to.be.undefined;

        return done();
      });
  });

  it('Export single predefined query', done => {
    request
      .get(`${apiBase}/${createdDataCollectorObj[1]._id}`)
      .query({
        format: 'export'
      })
      .expect(200)
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res.type).to.equal('application/binary');
        expect(res.text).to.be.not.undefined;
        const data = JSON.parse(res.text);

        expect(Array.isArray(data)).to.equal(true);
        expect(data.length).to.equal(1);
        expect(data[0]._id).to.be.undefined;
        expect(data[0].name).to.equal(createdDataCollectorObj[1].name);

        return done();
      });
  });

  it('Get predefined query by ID', done => {
    request
      .get(`${apiBase}/${createdDataCollectorObj[0]._id}`)
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .expect('Content-Type', 'application/json; charset=utf-8')
      .expect(200)
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res.body.data).to.be.not.undefined;
        expect(Array.isArray(res.body.data)).to.equal(true);
        expect(res.body.data.length).to.equal(1);
        expect(res.body.data[0]._id).to.equal(createdDataCollectorObj[0]._id);

        return done();
      });
  });

  it('Get not existing predefined query', done => {
    request
      .get(`${apiBase}/IdoNotExist`)
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .expect('Content-Type', 'application/json; charset=utf-8')
      .expect(200)
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res.body.data).to.be.not.undefined;
        expect(Array.isArray(res.body.data)).to.equal(true);
        expect(res.body.data.length).to.equal(0);
        return done();
      });
  });

  it('Get all predefined queries (1)', done => {
    request
      .get(apiBase)
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .expect('Content-Type', 'application/json; charset=utf-8')
      .expect(200)
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res.body.data).to.be.not.undefined;
        expect(Array.isArray(res.body.data)).to.equal(true);
        expect(res.body.data.length).to.equal(2);

        return done();
      });
  });

  it('Delete predefined query by ID', done => {
    request
      .delete(`${apiBase}/${createdDataCollectorObj[0]._id}`)
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .expect('Content-Type', 'application/json; charset=utf-8')
      .expect(200)
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res.body.data.numAffected).to.equal(1);

        return done();
      });
  });

  it('Delete not existing predefined query', done => {
    request
      .delete(`${apiBase}/IdoNotExist`)
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .expect('Content-Type', 'application/json; charset=utf-8')
      .expect(400)
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res.body.data).to.be.undefined;

        return done();
      });
  });

  it('Get all predefined queries (2)', done => {
    request
      .get(apiBase)
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .expect('Content-Type', 'application/json; charset=utf-8')
      .expect(200)
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res.body.data).to.be.not.undefined;
        expect(Array.isArray(res.body.data)).to.equal(true);
        expect(res.body.data.length).to.equal(1);

        return done();
      });
  });

  it('Test a predefined query', done => {
    const payload = {
      query: 'SELECT * FROM bvd_lwr_test LIMIT 1'
    };

    request
      .post(`${apiBase}/test`)
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .set('Content-Type', 'application/json')
      .send(payload)
      .expect(200)
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res.body.data).to.be.not.undefined;
        expect(Array.isArray(res.body.data)).to.equal(true);
        expect(res.body.data.length).to.equal(1);
        expect(res.body.data[0].host).to.equal('omidock');

        return done();
      });
  });

  it('Test a predefined query with params', done => {
    const payload = {
      // eslint-disable-next-line no-template-curly-in-string
      query: 'SELECT * FROM bvd_lwr_test where ${host=${host}}'
    };

    request
      .post(`${apiBase}/test`)
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .set('Content-Type', 'application/json')
      .send(payload)
      .expect(200)
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res.body.data).to.be.not.undefined;
        expect(Array.isArray(res.body.data)).to.equal(true);
        expect(res.body.data.length).to.equal(1);
        expect(res.body.data[0].host).to.equal('omidock');

        return done();
      });
  });

  it('Test a predefined query with params with Negation', done => {
    const payload = {
      // eslint-disable-next-line no-template-curly-in-string
      query: 'SELECT * FROM bvd_lwr_test where $!{host=${host}}'
    };

    request
      .post(`${apiBase}/test`)
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .set('Content-Type', 'application/json')
      .send(payload)
      .expect(200)
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res.body.data).to.be.not.undefined;
        expect(Array.isArray(res.body.data)).to.equal(true);
        expect(res.body.data.length).to.equal(0);

        return done();
      });
  });

  it('Test a predefined query with multiple params with Negation', done => {
    const payload = {
      // eslint-disable-next-line no-template-curly-in-string
      query: 'SELECT * FROM bvd_lwr_test where ${host=${host}} OR $!{status = ${status}}'
    };

    request
      .post(`${apiBase}/test`)
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .set('Content-Type', 'application/json')
      .send(payload)
      .expect(200)
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res.body.data).to.be.not.undefined;
        expect(Array.isArray(res.body.data)).to.equal(true);
        expect(res.body.data.length).to.equal(1);
        expect(res.body.data[0].host).to.equal('omidock');

        return done();
      });
  });

  it('Test a predefined query with multiple params with multiple Negation', done => {
    const payload = {
      // eslint-disable-next-line no-template-curly-in-string
      query: 'SELECT * FROM bvd_lwr_test where $!{host=${host}} OR $!{status = ${status}}'
    };

    request
      .post(`${apiBase}/test`)
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .set('Content-Type', 'application/json')
      .send(payload)
      .expect(200)
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res.body.data).to.be.not.undefined;
        expect(Array.isArray(res.body.data)).to.equal(true);
        expect(res.body.data.length).to.equal(0);

        return done();
      });
  });

  it('Test a predefined query with multiple params with Negation plus OR', done => {
    const payload = {
      // eslint-disable-next-line no-template-curly-in-string
      query: 'SELECT * FROM bvd_lwr_test where $!{host=${host}} OR ${status = ${status}}'
    };

    request
      .post(`${apiBase}/test`)
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .set('Content-Type', 'application/json')
      .send(payload)
      .expect(200)
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res.body.data).to.be.not.undefined;
        expect(Array.isArray(res.body.data)).to.equal(true);
        expect(res.body.data.length).to.equal(1);
        expect(res.body.data[0].host).to.equal('omidock');

        return done();
      });
  });

  it('Test a predefined query for multi-select template', done => {
    const payload = {
      // eslint-disable-next-line no-template-curly-in-string
      query: 'SELECT * FROM bvd_lwr_test where ${host IN (${host})}'
    };

    request
      .post(`${apiBase}/test`)
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .set('Content-Type', 'application/json')
      .send(payload)
      .expect(200)
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res.body.data).to.be.not.undefined;
        expect(Array.isArray(res.body.data)).to.equal(true);
        expect(res.body.data.length).to.equal(1);
        expect(res.body.data[0].host).to.equal('omidock');

        return done();
      });
  });

  it('Test a predefined query with LValue syntax', done => {
    const payload = {
      // eslint-disable-next-line no-template-curly-in-string
      query: 'SELECT * FROM bvd_lwr_test where ${(${host}) IN host}'
    };

    request
      .post(`${apiBase}/test`)
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .set('Content-Type', 'application/json')
      .send(payload)
      .expect(200)
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res.body.data).to.be.not.undefined;
        expect(Array.isArray(res.body.data)).to.equal(true);
        expect(res.body.data.length).to.equal(1);
        expect(res.body.data[0].host).to.equal('omidock');

        return done();
      });
  });

  it('Test a predefined query with  multiple params', done => {
    const payload = {
      // eslint-disable-next-line no-template-curly-in-string
      query: 'SELECT * FROM bvd_lwr_test where ${host=${host}} and ${status=${status}}'
    };

    request
      .post(`${apiBase}/test`)
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .set('Content-Type', 'application/json')
      .send(payload)
      .expect(200)
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res.body.data).to.be.not.undefined;
        expect(Array.isArray(res.body.data)).to.equal(true);
        expect(res.body.data.length).to.equal(1);
        expect(res.body.data[0].host).to.equal('omidock');

        return done();
      });
  });

  it('Test a predefined query with invalid param query', done => {
    const payload = {
      // eslint-disable-next-line no-template-curly-in-string
      query: 'INSERT * FROM bvd_lwr_test where ${host IN ${{host}'
    };

    request
      .post(`${apiBase}/test`)
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .set('Content-Type', 'application/json')
      .send(payload)
      .expect(400)
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res.body.message).to.equal('quexserv.query.invalid');

        return done();
      });
  });

  it('Test a predefined query with invalid connection', done => {
    const payload = {
      query: 'SELECT * FROM bvd_lwr_test LIMIT 1',
      connection: 'IamInvalid'
    };

    request
      .post(`${apiBase}/test`)
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .set('Content-Type', 'application/json')
      .send(payload)
      .expect(400)
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res.body.message).to.equal('dataCollector.error.connection.testQuery.loadConnection');

        return done();
      });
  });

  it('Test a predefined query with empty query', done => {
    const payload = {
      query: ''
    };

    request
      .post(`${apiBase}/test`)
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .set('Content-Type', 'application/json')
      .send(payload)
      .expect(400)
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res.body.message).to.equal('dataCollector.error.testQuery.missingQuery');

        return done();
      });
  });

  it('Test a predefined query with invalid query', done => {
    const payload = {
      query: 'INSERT * FROM bvd_lwr_test LIMIT 1'
    };

    request
      .post(`${apiBase}/test`)
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .set('Content-Type', 'application/json')
      .send(payload)
      .expect(400)
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res.body.message).to.equal('quexserv.query.invalid');

        return done();
      });
  });

  it('Upload dataCollector file, no onCollision, 2 import', done => {
    request
      .post(apiBase)
      .set('Content-Type', 'multipart/form-data')
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .field('import', JSON.stringify({}))
      .attach('dataCollectorsFile', './test/rest-api-tests/test-files/dataCollectors.bvddc')
      .expect(200)
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res.body.message).to.be.equal('OK');
        expect(res.body.data.created.length).to.be.equal(2);
        expect(res.body.data.skipped.length).to.be.equal(0);

        const createdDataCollectors = res.body.data.created;

        request
          .get(`${apiBase}/${createdDataCollectors[0]._id}`)
          .expect('Content-Type', 'application/json; charset=utf-8')
          .expect(200)
          .end((err, response) => {
            expect(err).to.be.null;
            expect(response.body.data.length).to.equal(1);
            expect(response.body.data[0]._id).to.equal(createdDataCollectors[0]._id);

            request
              .delete(`${apiBase}/${createdDataCollectors[0]._id}`)
              .set('X-Secure-Modify-Token', shared.secureModifyToken())
              .expect('Content-Type', 'application/json; charset=utf-8')
              .expect(200)
              .end((err, result) => {
                expect(err).to.be.null;
                expect(result.body.data.numAffected).to.equal(1);

                return done();
              });
          });
      });
  });

  it('Get result of parameter query', done => {
    request
      .post(apiBase)
      .set('Content-Type', 'multipart/form-data')
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .field('import', JSON.stringify({}))
      .attach('dataCollectorsFile', './test/rest-api-tests/test-files/ParamQuery.bvddc')
      .expect(200)
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res.body.message).to.be.equal('OK');
        expect(res.body.data.created.length).to.be.equal(1);
        expect(res.body.data.skipped.length).to.be.equal(0);

        const createdDataCollectors = res.body.data.created;

        expect(createdDataCollectors[0].type).to.equal('param');

        request
          .get(`${apiBase}/parameter/${createdDataCollectors[0]._id}`)
          .expect('Content-Type', 'application/json; charset=utf-8')
          .expect(200)
          .end((err, response) => {
            expect(err).to.be.null;
            expect(response.body.data.length).not.equal(0);
            expect(response.body.data[0].Region).not.equal(undefined);
            expect(response.body.data[0].CPU).not.equal(undefined);

            request
              .delete(`${apiBase}/${createdDataCollectors[0]._id}`)
              .set('X-Secure-Modify-Token', shared.secureModifyToken())
              .expect('Content-Type', 'application/json; charset=utf-8')
              .expect(200)
              .end((err, result) => {
                expect(err).to.be.null;
                expect(result.body.data.numAffected).to.equal(1);

                return done();
              });
          });
      });
  });

  it('Upload and retrieve Param query and examine response', done => {
    request
      .post(apiBase)
      .set('Content-Type', 'multipart/form-data')
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .field('import', JSON.stringify({}))
      .attach('dataCollectorsFile', './test/rest-api-tests/test-files/ParamQuery.bvddc')
      .expect(200)
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res.body.message).to.be.equal('OK');
        expect(res.body.data.created.length).to.be.equal(1);
        expect(res.body.data.skipped.length).to.be.equal(0);

        const createdDataCollectors = res.body.data.created;

        expect(createdDataCollectors[0].type).to.equal('param');

        request
          .get(`${apiBase}/${createdDataCollectors[0]._id}`)
          .expect('Content-Type', 'application/json; charset=utf-8')
          .expect(200)
          .end((err, response) => {
            expect(err).to.be.null;
            expect(response.body.data.length).to.equal(1);
            expect(response.body.data[0]._id).to.equal(createdDataCollectors[0]._id);
            expect(response.body.data[0].type).to.equal('param');
            expect(response.body.data[0].data.selectedColumn.label).to.equal('hostname');
            expect(response.body.data[0].data.selectedColumnValue.label).to.equal('mid');
            expect(response.body.data[0].data.value).to.equal('5');

            request
              .delete(`${apiBase}/${createdDataCollectors[0]._id}`)
              .set('X-Secure-Modify-Token', shared.secureModifyToken())
              .expect('Content-Type', 'application/json; charset=utf-8')
              .expect(200)
              .end((err, result) => {
                expect(err).to.be.null;
                expect(result.body.data.numAffected).to.equal(1);

                return done();
              });
          });
      });
  });

  it('Testing for Parameterization using channels', done => {
    request
      .post('/rest/v2/dataCollector')
      .set('Content-Type', 'multipart/form-data')
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .field('import', JSON.stringify({}))
      .attach('dataCollectorsFile', './test/rest-api-tests/test-files/DCandParamQuery.bvddc')
      .expect(200)
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res.body.message).to.be.equal('OK');
        expect(res.body.data.created.length).to.be.equal(2);
        expect(res.body.data.skipped.length).to.be.equal(0);

        request.post('/rest/v2/channel/state')
          .send({
            requestedChannels: [{ id: 'bvd_param_query_test_machines', count: '1' }],
            parameters: { hosts: 'host1' }
          }).set('X-Secure-Modify-Token', shared.secureModifyToken()).expect(200)
          .end((err, result) => {
            expect(err).to.be.null;
            expect(result.body.error).to.be.false;
            expect(result.body.data[0].data[0].data.hostname).to.equal('host1');
            expect(result.body.data[0].data[0].data.cpu).to.equal(75);
            expect(result.body.data[0].data[0].data.ram).to.equal(80);
            return done();
          });
      });
  });

  it('Fetch predefined queries using channels', done => {
    request
      .post(apiBase)
      .set('Content-Type', 'multipart/form-data')
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .field('import', JSON.stringify({
        onCollision: 'overwrite'
      }))
      .attach('dataCollectorsFile', './test/rest-api-tests/test-files/dataCollectorsChannels.bvddc')
      .expect(200)
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res.body.message).to.be.equal('OK');
        expect(res.body.data.created.length).to.be.equal(4);

        const createdDataCollectors = res.body.data.created.filter(collector => collector.type !== 'param');

        request.post(`${channelBase}`)
          .send({
            channelNames: [createdDataCollectors[0].name]
          })
          .set('X-Secure-Modify-Token', shared.secureModifyToken()).expect(200)
          .end((err, result) => {
            expect(err).to.be.null;
            expect(result.body.error).to.be.false;
            expect(result.body.message).to.be.equal('OK');
            expect(result.body.data.length).to.be.equal(4);
            return done();
          });
      });
  });

  it('Testing for Parameterization using channels and default values', done => {
    request.post('/rest/v2/channel/state')
      .send({
        requestedChannels: [{ id: 'bvd_param_query_test_machines', count: '2' }],
        parameters: {}
      }).set('X-Secure-Modify-Token', shared.secureModifyToken()).expect(200)
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res.body.error).to.be.false;
        expect(res.body.data[0].data[0].data.hostname).to.equal('host1');
        expect(res.body.data[0].data[0].data.cpu).to.equal(75);
        expect(res.body.data[0].data[0].data.ram).to.equal(80);
        return done();
      });
  });

  it('Upload invalid dataCollector file (not JSON)', done => {
    request
      .post(apiBase)
      .set('Content-Type', 'multipart/form-data')
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .field('import', JSON.stringify({}))
      .attach('dataCollectorsFile', './test/rest-api-tests/test-files/dataCollectors-invalid-JSON.bvddc')
      .expect(400)
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res.body.message).to.be.equal('dashboard.server.api.dataCollector.import.invalidFile');
        return done();
      });
  });

  it('Upload missing dataCollector file', done => {
    request
      .post(apiBase)
      .set('Content-Type', 'multipart/form-data')
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .field('import', JSON.stringify({}))
      .expect(400)
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res.body.message).to.be.equal('dataCollector.editor.rest.emptyRequest');
        return done();
      });
  });

  it('Upload invalid dataCollector file (invalid JSON)', done => {
    request
      .post(apiBase)
      .set('Content-Type', 'multipart/form-data')
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .field('import', JSON.stringify({}))
      .attach('dataCollectorsFile', './test/rest-api-tests/test-files/dataCollectors-invalid-JSON-format.bvddc')
      .expect(400)
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res.body.message).to.be.equal('dashboard.server.api.dataCollector.import.invalidFile');
        return done();
      });
  });

  it('Upload invalid dataCollector file (invalid Query)', done => {
    request
      .post(apiBase)
      .set('Content-Type', 'multipart/form-data')
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .field('import', JSON.stringify({}))
      .attach('dataCollectorsFile', './test/rest-api-tests/test-files/dataCollectors-invalid-Query.bvddc')
      .expect(400)
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res.body.message).to.be.equal('dashboard.server.api.dataCollector.import.invalidFile');
        return done();
      });
  });

  it('Upload dataCollector file, no onCollision, 1 collision', done => {
    request
      .post(apiBase)
      .set('Content-Type', 'multipart/form-data')
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .field('import', JSON.stringify({}))
      .attach('dataCollectorsFile', './test/rest-api-tests/test-files/dataCollectors.bvddc')
      .expect(400)
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res.body.message).to.be.equal('dashboard.server.api.dataCollector.import.aborted');
        expect(res.body.additionalInfo.length).to.be.equal(1);
        return done();
      });
  });

  it('Upload dataCollector file, onCollision skip, 1 collision, 1 import', done => {
    request
      .post(apiBase)
      .set('Content-Type', 'multipart/form-data')
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .field('import', JSON.stringify({
        onCollision: 'skip'
      }))
      .attach('dataCollectorsFile', './test/rest-api-tests/test-files/dataCollectors.bvddc')
      .expect(200)
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res.body.message).to.be.equal('OK');
        expect(res.body.data.created.length).to.be.equal(1);
        expect(res.body.data.skipped.length).to.be.equal(1);

        const createdDataCollectors = res.body.data.created;

        request
          .get(`${apiBase}/${createdDataCollectors[0]._id}`)
          .expect('Content-Type', 'application/json; charset=utf-8')
          .expect(200)
          .end((err, response) => {
            expect(err).to.be.null;
            expect(response.body.data.length).to.equal(1);
            expect(response.body.data[0]._id).to.equal(createdDataCollectors[0]._id);

            request
              .delete(`${apiBase}/${createdDataCollectors[0]._id}`)
              .set('X-Secure-Modify-Token', shared.secureModifyToken())
              .expect('Content-Type', 'application/json; charset=utf-8')
              .expect(200)
              .end((err, result) => {
                expect(err).to.be.null;
                expect(result.body.data.numAffected).to.equal(1);

                return done();
              });
          });
      });
  });

  it('Upload dataCollector file, onCollision overwrite, 1 overwrite, 1 import', done => {
    request
      .post(apiBase)
      .set('Content-Type', 'multipart/form-data')
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .field('import', JSON.stringify({
        onCollision: 'overwrite'
      }))
      .attach('dataCollectorsFile', './test/rest-api-tests/test-files/dataCollectors.bvddc')
      .expect(200)
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res.body.message).to.be.equal('OK');
        expect(res.body.data.created.length).to.be.equal(1);
        expect(res.body.data.overwritten.length).to.be.equal(1);

        return done();
      });
  });

  it('Upload dataCollector file, invalid onCollision', done => {
    request
      .post(apiBase)
      .set('Content-Type', 'multipart/form-data')
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .field('import', JSON.stringify({
        onCollision: 'invalidValue'
      }))
      .attach('dataCollectorsFile', './test/rest-api-tests/test-files/dataCollectors.bvddc')
      .expect(400)
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res.body.message).to.be.equal('dataCollector.editor.rest.emptyRequest');

        return done();
      });
  });

  it('Upload dataCollector file, onCollision skip, 2 collision', done => {
    request
      .post(apiBase)
      .set('Content-Type', 'multipart/form-data')
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .field('import', JSON.stringify({
        onCollision: 'skip'
      }))
      .attach('dataCollectorsFile', './test/rest-api-tests/test-files/dataCollectors.bvddc')
      .expect(200)
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res.body.message).to.be.equal('OK');
        expect(res.body.data.created.length).to.be.equal(0);
        expect(res.body.data.skipped.length).to.be.equal(2);

        return done();
      });
  });

  it('Export check for date type param queries', done => {
    request
      .post('/rest/v2/dataCollector')
      .set('Content-Type', 'multipart/form-data')
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .field('import', JSON.stringify({
        onCollision: 'overwrite'
      }))
      .attach('dataCollectorsFile', './test/rest-api-tests/test-files/dataCollectorsDateTypeParam.bvddc')
      .expect(200)
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res.body.message).to.be.equal('OK');
        expect(res.body.data.created.length).to.be.equal(2);

        const createdDataCollector = res.body.data.created.filter(collector => collector.type !== 'param');
        // sometimes we see a timing issue with this test. Give the server some more time.
        setTimeout(() => {
          // Exporting only data Query, expected to export param query
          request
            .get(`${apiBase}/${createdDataCollector[0]._id}`)
            .query({
              format: 'export'
            })
            .expect(200)
            .end((err, result) => {
              expect(err).to.be.null;
              expect(result.type).to.equal('application/binary');
              expect(result.text).to.be.not.undefined;
              const data = JSON.parse(result.text);

              expect(Array.isArray(data)).to.equal(true);
              expect(data.length).to.equal(2);
              expect(data[0]._id).to.be.undefined;
              expect(data[1].tenant).to.be.undefined;
              expect(data[1].data.selectedDate).to.equal('specificDate');
              expect(data[1].data.paramQueryType).to.equal('date');
              return done();
            });
        }, 1000);
      });
  });

  it('Export check for non-duplicate params', done => {
    request
      .post('/rest/v2/dataCollector')
      .set('Content-Type', 'multipart/form-data')
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .field('import', JSON.stringify({
        onCollision: 'overwrite'
      }))
      .attach('dataCollectorsFile', './test/rest-api-tests/test-files/nonduplicateExportTest.bvddc')
      .expect(200)
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res.body.message).to.be.equal('OK');
        expect(res.body.data.created.length).to.be.equal(2);

        const createdDataCollector = res.body.data.created.filter(collector => collector.type !== 'param');
        // Exporting only data Query, expected to export param query
        request
          .get(`${apiBase}/${createdDataCollector[0]._id}`)
          .query({
            format: 'export'
          })
          .expect(200)
          .end((err, result) => {
            expect(err).to.be.null;
            expect(result.type).to.equal('application/binary');
            expect(result.text).to.be.not.undefined;
            const data = JSON.parse(result.text);
            expect(Array.isArray(data)).to.equal(true);
            expect(data.length).to.equal(2);
            expect(data[0]._id).to.be.undefined;
            expect(data[1].tenant).to.be.undefined;
            expect(data[1].name).to.equal('testpq (testpq)');
            expect(data[0].name).to.not.equal('testpq (testpq)');
            return done();
          });
      });
  });

  it('Testing for Parameterization using nonSQLDefaultPQ', done => {
    request
      .post('/rest/v2/dataCollector')
      .set('Content-Type', 'multipart/form-data')
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .field('import', JSON.stringify({
        onCollision: 'overwrite'
      }))
      .attach('dataCollectorsFile', './test/rest-api-tests/test-files/NonSQLDefaultParamTest.bvddc')
      .expect(200)
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res.body.message).to.be.equal('OK');
        expect(res.body.data.created.length).to.be.equal(2);

        const createdDataCollectors = res.body.data.created.filter(collector => collector.type === 'param');
        request
          .get(`${apiBase}/${createdDataCollectors[0]._id}`)
          .expect('Content-Type', 'application/json; charset=utf-8')
          .expect(200)
          .end((err, response) => {
            expect(err).to.be.null;
            expect(response.body.data.length).to.equal(1);
            expect(response.body.data[0]._id).to.equal(createdDataCollectors[0]._id);
            // Verify value list is stored
            expect(response.body.data[0].data.labelValueList).not.equal(null);
            // // Verify value list has correct value
            expect(response.body.data[0].data.labelValueList[0].label).to.equal('AverageLoad');
            // Verify default value is stored
            expect(response.body.data[0].data.value).to.equal('30');

            request.post('/rest/v2/channel/state')
              .send({
                requestedChannels: [{
                  id: 'NonSQLTestDQ',
                  count: '1'
                }],
                parameters: {}
              }).set('X-Secure-Modify-Token', shared.secureModifyToken()).expect(200)
              .end((err, result) => {
                expect(err).to.be.null;
                expect(result.body.error).to.be.false;

                expect(result.body.data[0].data[0].data.hostname).to.equal('host4');
                expect(result.body.data[0].data[0].data.cpu).to.equal(30);
                expect(result.body.data[0].data[0].data.ram).to.equal(30);
                return done();
              });
          });
      });
  });

  it('Upload dataCollector file, onCollision overwrite, 2 overwrite', done => {
    request
      .post(apiBase)
      .set('Content-Type', 'multipart/form-data')
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .field('import', JSON.stringify({
        onCollision: 'overwrite'
      }))
      .attach('dataCollectorsFile', './test/rest-api-tests/test-files/dataCollectorsModified.bvddc')
      .expect(200)
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res.body.message).to.be.equal('OK');
        expect(res.body.data.created.length).to.be.equal(0);
        expect(res.body.data.overwritten.length).to.be.equal(2);

        const overwrittenDataCollectors = res.body.data.overwritten;

        request
          .get(`${apiBase}/${overwrittenDataCollectors[0]._id}`)
          .expect('Content-Type', 'application/json; charset=utf-8')
          .expect(200)
          .end((err, response) => {
            expect(err).to.be.null;
            expect(response.body.data.length).to.equal(1);
            expect(response.body.data[0]._id).to.equal(overwrittenDataCollectors[0]._id);
            expect(response.body.data[0].data.queryText).to.equal('SELECT 1');

            return done();
          });
      });
  });

  it('Upload dataCollector file, with nested parameters', done => {
    request
      .post(apiBase)
      .set('Content-Type', 'multipart/form-data')
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .field('import', JSON.stringify({
        onCollision: 'overwrite'
      }))
      .attach('dataCollectorsFile', './test/rest-api-tests/test-files/nestedParameters.bvddc')
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res.statusCode).to.equal(200);
        expect(res.body.error).to.equal(false);
        expect(res.body.data.created.length).to.equal(4);
        expect(res.body.data.overwritten.length).to.equal(0);

        const createdDataCollectors = res.body.data.created.filter(collector => collector.type !== 'param');

        request.post(`${channelBase}`)
          .send({
            channelNames: [createdDataCollectors[0].name]
          })
          .set('X-Secure-Modify-Token', shared.secureModifyToken()).expect(200)
          .end((err, result) => {
            expect(err).to.be.null;
            expect(result.statusCode).to.equal(200);
            expect(result.body.data.length).to.be.equal(4);
            expect(result.body.parameterPath).to.not.be.undefined;
            expect(result.body.parameterPath[createdDataCollectors[0].name][0].length).to.equal(3);
            return done();
          });
      });
  });

  it('Upload dataCollector file, with cyclic reference', done => {
    request
      .post(apiBase)
      .set('Content-Type', 'multipart/form-data')
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .field('import', JSON.stringify({
        onCollision: 'overwrite'
      }))
      .attach('dataCollectorsFile', './test/rest-api-tests/test-files/cyclicDependency.bvddc')
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res.statusCode).to.equal(400);
        expect(res.body.message).to.equal('dashboard.server.api.dataCollector.import.error');
        expect(res.body.additionalInfo).contains('Cyclic dependency detected');

        return done();
      });
  });

  it('Upload dataCollector file, with parameter query having multiple dependencies', done => {
    request
      .post(apiBase)
      .set('Content-Type', 'multipart/form-data')
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .field('import', JSON.stringify({
        onCollision: 'overwrite'
      }))
      .attach('dataCollectorsFile', './test/rest-api-tests/test-files/parameterQueryWithMultipleDependency.bvddc')
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res.statusCode).to.equal(200);
        expect(res.body.message).to.equal('OK');

        return done();
      });
  });

  it('Upload too big dataCollector file', done => {
    const buffer = Buffer.alloc((5 * 1024 * 1024) + 1);

    fs.writeFileSync(path.resolve(__dirname, 'test.file'), buffer);

    request
      .post(apiBase)
      .set('Content-Type', 'multipart/form-data')
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .field('import', JSON.stringify({
        onCollision: 'overwrite'
      }))
      .attach('dataCollectorsFile', path.resolve(__dirname, 'test.file'))
      .expect(500)
      .end(err => {
        if (err) {
          return done(err);
        }

        return done();
      });
  });

  it('Export datacollectors using id in body', done => {
    const postParams = {
      dataCollector: mock.dataCollector
    };

    const names = ['mock_collector_bulk_export_1', 'mock_collector_bulk_export_2'];
    postParams.dataCollector.name = names[0];
    const ids = [];
    request
      .post(apiBase)
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .send(postParams)
      .expect(200)
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res.body.data).to.not.equal(undefined);
        expect(res.body.data).to.not.equal(null);
        expect(res.body.data.name).to.equal(names[0]);
        ids.push(res.body.data._id);
        postParams.dataCollector.name = names[1];
        request
          .post(apiBase)
          .set('X-Secure-Modify-Token', shared.secureModifyToken())
          .send(postParams)
          .expect(200)
          .end((err, innerResult) => {
            expect(err).to.be.null;
            expect(innerResult.body.data).to.not.equal(undefined);
            expect(innerResult.body.data).to.not.equal(null);
            expect(innerResult.body.data.name).to.equal(names[1]);
            ids.push(innerResult.body.data._id);
            request
              .post(apiBase)
              .set('X-Secure-Modify-Token', shared.secureModifyToken())
              .field('Content-Type', 'multipart/form-data')
              .field('export', ids)
              .expect(200)
              .end((err, exportResult) => {
                expect(err).to.be.null;
                const fileContent = exportResult.text;
                expect(fileContent).not.to.be.null;
                const fileData = JSON.parse(fileContent);
                expect(names).to.have.members([fileData[0].name, fileData[1].name]);
                return done();
              });
          });
      });
  });

  it('Export datacollectors using correct and incorrect id in body', done => {
    const postParams = {
      dataCollector: mock.dataCollector
    };

    const names = ['mock_collector_bulk_export_3', 'mock_collector_bulk_export_4'];
    postParams.dataCollector.name = names[0];
    const ids = [];
    request
      .post(apiBase)
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .send(postParams)
      .expect(200)
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res.body.data).to.not.equal(undefined);
        expect(res.body.data).to.not.equal(null);
        expect(res.body.data.name).to.equal(names[0]);
        ids.push(res.body.data._id);
        postParams.dataCollector.name = names[1];
        request
          .post(apiBase)
          .set('X-Secure-Modify-Token', shared.secureModifyToken())
          .send(postParams)
          .expect(200)
          .end((err, innerResult) => {
            expect(err).to.be.null;
            expect(innerResult.body.data).to.not.equal(undefined);
            expect(innerResult.body.data).to.not.equal(null);
            expect(innerResult.body.data.name).to.equal(names[1]);
            ids.push(innerResult.body.data._id);
            ids.push('dummy1');
            ids.push('dummy2');
            request
              .post(apiBase)
              .set('X-Secure-Modify-Token', shared.secureModifyToken())
              .field('Content-Type', 'multipart/form-data')
              .field('export', ids)
              .expect(200)
              .end((err, exportResult) => {
                expect(err).to.be.null;
                const fileContent = exportResult.text;
                expect(fileContent).not.to.be.null;
                const fileData = JSON.parse(fileContent);
                expect(fileData.length).to.equal(2);
                expect(names).to.have.members([fileData[0].name, fileData[1].name]);
                return done();
              });
          });
      });
  });

  it('Export non existing ids', done => {
    const ids = [1, 2, 3];
    request
      .post(apiBase)
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .field('Content-Type', 'multipart/form-data')
      .field('export', ids)
      .expect(200)
      .end((err, exportResult) => {
        expect(err).to.be.null;
        expect(exportResult.text).to.equal('');
        return done();
      });
  });

  it('Export using incorrect form data ', done => {
    const ids = [1, 2, 3];
    request
      .post(apiBase)
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .field('Content-Type', 'multipart/form-data')
      .field('wontWork', ids)
      .expect(400)
      .end((err, exportResult) => {
        expect(err).to.be.null;
        expect(exportResult.body.message).to.equal('dataCollector.editor.rest.emptyRequest');
        request
          .post(apiBase)
          .set('X-Secure-Modify-Token', shared.secureModifyToken())
          .field('Content-Type', 'multipart/form-data')
          .expect(400)
          .end((err, result) => {
            expect(err).to.be.null;
            expect(result.body.message).to.equal('dataCollector.editor.rest.emptyRequest');
            request
              .post(apiBase)
              .set('X-Secure-Modify-Token', shared.secureModifyToken())
              .expect(400)
              .end((err, failureResult) => {
                expect(err).to.be.null;
                expect(failureResult.body.message).to.equal('dataCollector.editor.rest.emptyRequest');
                return done();
              });
          });
      });
  });

  it('Delete using dataCollector in body', done => {
    const postParams = {
      dataCollector: mock.dataCollector
    };

    const names = ['mock_collector_bulk_1', 'mock_collector_bulk_2'];
    postParams.dataCollector.name = names[0];
    const ids = [];
    request
      .post(apiBase)
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .send(postParams)
      .expect(200)
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res.body.data).to.not.equal(undefined);
        expect(res.body.data).to.not.equal(null);
        expect(res.body.data.name).to.equal(names[0]);
        ids.push(res.body.data._id);
        postParams.dataCollector.name = names[1];
        request
          .post(apiBase)
          .set('X-Secure-Modify-Token', shared.secureModifyToken())
          .send(postParams)
          .expect(200)
          .end((err, innerResult) => {
            expect(err).to.be.null;
            expect(innerResult.body.data).to.not.equal(undefined);
            expect(innerResult.body.data).to.not.equal(null);
            expect(innerResult.body.data.name).to.equal(names[1]);
            ids.push(innerResult.body.data._id);
            request
              .delete(apiBase)
              .set('X-Secure-Modify-Token', shared.secureModifyToken())
              .send(ids)
              .expect('Content-Type', 'application/json; charset=utf-8')
              .expect(200)
              .end((err, deletedResult) => {
                expect(err).to.be.null;
                expect(deletedResult.body.data.numAffected).to.equal(2);
                return done();
              });
          });
      });
  });

  it('Delete partial dataCollectors using id in body', done => {
    const postParams = {
      dataCollector: mock.dataCollector
    };

    const names = ['mock_collector_bulk_1', 'mock_collector_bulk_2'];
    postParams.dataCollector.name = names[0];
    const ids = [];
    request
      .post(apiBase)
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .send(postParams)
      .expect(200)
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res.body.data).to.not.equal(undefined);
        expect(res.body.data).to.not.equal(null);
        expect(res.body.data.name).to.equal(names[0]);
        ids.push(res.body.data._id);
        postParams.dataCollector.name = names[1];
        request
          .post(apiBase)
          .set('X-Secure-Modify-Token', shared.secureModifyToken())
          .send(postParams)
          .expect(200)
          .end((err, innerResult) => {
            expect(err).to.be.null;
            expect(innerResult.body.data).to.not.equal(undefined);
            expect(innerResult.body.data).to.not.equal(null);
            expect(innerResult.body.data.name).to.equal(names[1]);
            ids.push(innerResult.body.data._id);
            ids.push('test');
            request
              .delete(apiBase)
              .set('X-Secure-Modify-Token', shared.secureModifyToken())
              .send(ids)
              .end((err, deletedResult) => {
                expect(err).to.be.null;
                expect(deletedResult.statusCode).to.equal(200);
                expect(deletedResult.body.data.numAffected).to.equal(2);
                return done();
              });
          });
      });
  });

  it('Delete incorrect ids in body', done => {
    const ids = [1, 2, 3];
    request
      .delete(apiBase)
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .send(ids)
      .end((err, deletedResult) => {
        if (err) {
          return done;
        }
        expect(deletedResult.statusCode).to.equal(400);
        expect(deletedResult.body.message).to.equal('Predefined query(s) "[ 1, 2, 3 ]" did not get deleted.');
        return done();
      });
  });

  it('Delete using empty body', done => {
    const ids = [];
    request
      .delete(apiBase)
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .send(ids)
      .end((err, deletedResult) => {
        if (err) {
          return done;
        }
        expect(deletedResult.statusCode).to.equal(400);
        expect(deletedResult.body.message).to.equal('Predefined query(s) "[]" did not get deleted.');
        return done();
      });
  });

  it('Delete using neither body nor no query id', done => {
    request
      .delete(apiBase)
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .end((err, deletedResult) => {
        if (err) {
          return done;
        }
        expect(deletedResult.statusCode).to.equal(400);
        expect(deletedResult.body.message).to.equal('Predefined query(s) "[]" did not get deleted.');
        return done();
      });
  });

  it('Create parameter query with dependent parameter, cyclic reference', done => {
    let postParams = {
      dataCollector: mock.parameterWithAnotherParameterObj
    };

    postParams.dataCollector.name = 'mock_collector_nested_param';
    request
      .post(apiBase)
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .send(postParams)
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res.statusCode).to.equal(200);
        expect(res.body.data.data.dependentParam).contains('location');
        createdDataCollectorObj.push(res.body.data);
        postParams = {
          dataCollector: mock.parameterWithCyclicReference
        };
        postParams.dataCollector.name = 'mock_collector_cyclic_reference';
        request
          .post(apiBase)
          .set('X-Secure-Modify-Token', shared.secureModifyToken())
          .send(postParams)
          .end((_err, response) => {
            expect(_err).to.be.null;
            expect(response.body.error).to.equal(true);
            expect(response.body.message).to.equal('Cyclic dependency detected');
            return done();
          });
      });
  });

  it('Update nested parameter query', done => {
    request
      .get(`${apiBase}/${createdDataCollectorObj[2]._id}`)
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .expect('Content-Type', 'application/json; charset=utf-8')
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res.body.data).to.be.not.undefined;

        const dataCollectorObj = res.body.data[0];
        // eslint-disable-next-line no-template-curly-in-string
        const updatedQuery = 'select distinct id from bvd_lwr_demo where ${sold_item = ${sold_item}} order by id';
        dataCollectorObj.data.queryText = updatedQuery;
        const postParams = {
          dataCollector: _.cloneDeep(dataCollectorObj)
        };
        request
          .put(`${apiBase}/${createdDataCollectorObj[2]._id}`)
          .set('X-Secure-Modify-Token', shared.secureModifyToken())
          .send(postParams)
          .end((_err, response) => {
            expect(_err).to.be.null;
            expect(response.statusCode).to.equal(400);
            expect(response.body.error).to.eq(true);
            expect(response.body.message).contains('Cyclic dependency detected');
            return done();
          });
      });
  });

  it('Update nested parameter query with multiple dependencies', done => {
    request
      .get(`${apiBase}/${createdDataCollectorObj[2]._id}`)
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .expect('Content-Type', 'application/json; charset=utf-8')
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res.body.data).to.be.not.undefined;

        const dataCollectorObj = res.body.data[0];
        // eslint-disable-next-line no-template-curly-in-string
        const updatedQuery = 'select distinct id from bvd_lwr_demo where ${location= ${location}} and ${sold_item = ${sold_item}} order by id';
        dataCollectorObj.data.queryText = updatedQuery;
        const postParams = {
          dataCollector: _.cloneDeep(dataCollectorObj)
        };
        request
          .put(`${apiBase}/${createdDataCollectorObj[2]._id}`)
          .set('X-Secure-Modify-Token', shared.secureModifyToken())
          .send(postParams)
          .end((_err, response) => {
            expect(_err).to.be.null;
            expect(response.statusCode).to.equal(400);
            expect(response.body.error).to.equal(true);
            expect(response.body.message).to.equal('Cyclic dependency detected');
            return done();
          });
      });
  });

  it('Update nested parameter query with cyclic reference', done => {
    request
      .get(`${apiBase}/${createdDataCollectorObj[2]._id}`)
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .expect('Content-Type', 'application/json; charset=utf-8')
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res.body.data).to.be.not.undefined;

        const dataCollectorObj = res.body.data[0];
        // eslint-disable-next-line no-template-curly-in-string
        const updatedQuery = 'select distinct id from bvd_lwr_demo where ${id=${id}} order by id';
        dataCollectorObj.data.queryText = updatedQuery;
        const postParams = {
          dataCollector: _.cloneDeep(dataCollectorObj)
        };
        request
          .put(`${apiBase}/${createdDataCollectorObj[2]._id}`)
          .set('X-Secure-Modify-Token', shared.secureModifyToken())
          .send(postParams)
          .end((_err, response) => {
            expect(_err).to.be.null;
            expect(response.statusCode).to.equal(400);
            expect(response.body.error).to.equal(true);
            expect(response.body.message).to.equal('Cyclic dependency detected');
            return done();
          });
      });
  });

  it('Parameter query with multiple dependent dependencies', done => {
    const postParams = {
      dataCollector: mock.parameterWithMultipleParameterObj
    };

    postParams.dataCollector.name = 'mock_collector_nested_multiple_param';
    request
      .post(apiBase)
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .send(postParams)
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res.statusCode).to.equal(400);
        expect(res.body.error).to.equal(true);
        expect(res.body.message).to.equal('Cyclic dependency detected');
        return done();
      });
  });

  it('Log out', done => {
    shared.logout(request, done);
  });

  it('Login non admin user', done => {
    shared.login(request, '/rest/v2/tenant/systemsettings', nonAdminUser.login, nonAdminUser.passwd, done);
  });

  it('post access not authorized', done => {
    request
      .post(apiBase)
      .expect(401)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.text).not.equal(undefined);
        expect(res.text).not.equal(null);

        const result = JSON.parse(res.text);

        expect(result.error).equal(true);
        expect(result.message).equal('dashboard.accessdenied');

        return done();
      });
  });

  it('get data collectors, not authorized to see query text', done => {
    request
      .get(apiBase)
      .expect(200)
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res.body.data).to.be.not.undefined;
        res.body.data.forEach(dataCollector => {
          expect(dataCollector?.data?.queryText).to.be.undefined;
        });
        expect(Array.isArray(res.body.data)).to.equal(true);
        expect(res.body.data.length).to.equal(27);
        request
          .get(`${apiBase}/${res.body.data[0]._id}`)
          .expect(200)
          .end((err, result) => {
            expect(err).to.be.null;
            expect(result.body.data).to.be.not.undefined;
            expect(result.body.data[0]._id).to.equal(res.body.data[0]._id);
            result.body.data.forEach(dataCollector => {
              expect(dataCollector?.data?.queryText).to.be.undefined;
            });
            expect(Array.isArray(result.body.data)).to.equal(true);
            expect(result.body.data.length).to.equal(1);
            return done();
          });
      });
  });

  it('Log out non admin user', done => {
    shared.logout(request, done);
  });

  it('access not authenticated', done => {
    request
      .post(apiBase)
      .expect(401)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.text).not.equal(undefined);
        expect(res.text).not.equal(null);

        const result = JSON.parse(res.text);

        expect(result.message).equal('Unauthorized');

        return done();
      });
  });

  it('Login Admin for clean up', done => {
    shared.login(request, apiBase, adminLogin, adminPasswd, done);
  });

  it('Check values of parameter based on multiple params by sending empty body', done => {
    request
      .post(apiBase)
      .set('Content-Type', 'multipart/form-data')
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .field('import', JSON.stringify({
        onCollision: 'overwrite'
      }))
      .attach('dataCollectorsFile', './test/rest-api-tests/test-files/PerformanceParam.bvddc')
      .expect(200)
      .end((err, res) => {
        if (err) {
          return done();
        }
        expect(err).to.be.null;
        expect(res.body.message).to.be.equal('OK');
        expect(res.body.data.created.length).to.be.equal(3);
        res.body.data.created.forEach(dc => dataCollectorIds.push(dc._id));

        request
          .post(`${apiBase}/performance/values`)
          .set('X-Secure-Modify-Token', shared.secureModifyToken())
          .send({})
          .end((err, response) => {
            if (err) {
              return done();
            }
            expect(err).to.be.null;
            expect(response.body.data.length).to.be.equal(11);
            return done();
          });
      });
  });

  it('Check values of parameter by sending values of single dependent params', done => {
    request
      .post(`${apiBase}/performance/values`)
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .send({
        // eslint-disable-next-line camelcase
        cpu_usage: '20'
      })
      .end((err, res) => {
        if (err) {
          return done();
        }
        expect(err).to.be.null;
        expect(res.body.data.length).to.be.equal(1);
        expect(res.body.data[0].performance).to.be.equal(30);
        return done();
      });
  });

  it('Check values of parameter by sending values of multiple dependent params', done => {
    request
      .post(`${apiBase}/performance/values`)
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .send({
        // eslint-disable-next-line camelcase
        cpu_usage: '20',
        os: 'Windows'
      })
      .end((err, res) => {
        if (err) {
          return done();
        }
        expect(err).to.be.null;
        expect(res.body.data.length).to.be.equal(0);
        request
          .delete(`${apiBase}/${dataCollectorIds.join(',')}?format=json`)
          .set('X-Secure-Modify-Token', shared.secureModifyToken())
          .expect('Content-Type', 'application/json; charset=utf-8')
          .expect(200)
          .end((err, deleteRes) => {
            expect(err).to.be.null;
            expect(deleteRes.body.data.numAffected).to.equal(3);

            return done();
          });
      });
  });

  it('Delete all predefined queries (cleanup)', done => {
    request
      .get(apiBase)
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .expect('Content-Type', 'application/json; charset=utf-8')
      .expect(200)
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res.body.data).to.be.not.undefined;
        expect(Array.isArray(res.body.data)).to.equal(true);
        expect(res.body.data.length).to.equal(27);

        const ids = res.body.data.reduce((acc, dataCollector) => {
          acc.push(dataCollector._id);
          return acc;
        }, []);

        request
          .delete(apiBase)
          .set('X-Secure-Modify-Token', shared.secureModifyToken())
          .send(ids)
          .expect('Content-Type', 'application/json; charset=utf-8')
          .expect(200)
          .end((err, resDel) => {
            expect(err).to.be.null;
            expect(resDel.body.data.numAffected).to.equal(27);

            request
              .get(apiBase)
              .set('X-Secure-Modify-Token', shared.secureModifyToken())
              .expect('Content-Type', 'application/json; charset=utf-8')
              .expect(200)
              .end((err, resGet) => {
                expect(err).to.be.null;
                expect(resGet.body.data).to.be.not.undefined;
                expect(Array.isArray(resGet.body.data)).to.equal(true);
                expect(resGet.body.data.length).to.equal(0);

                return done();
              });
          });
      });
  });

  it('Log out admin after clean up', done => {
    shared.logout(request, done);
  });
});
