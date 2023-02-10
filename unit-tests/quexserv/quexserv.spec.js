/* eslint-disable camelcase */
/* eslint-disable no-empty-function */
'use strict';

const getEnv = require('../../../shared/config/getEnv');
const sinon = require('sinon');
const VerticaNodeHealthChecker = require('../../../shared/verticaNodeHealthChecker');
const VerticaConnector = require('../../../shared/verticaConnector');

describe('vertica adapter tests', () => {
  const getMockConnection = (uniqId, successResponse, errorResponse) => (function() {
    const verticaCallback = {};
    return {
      connection: {
        destroy() {
          verticaCallback.error('destroy');
        },
        bytesRead: 1000
      },
      on() {},
      disconnect() {
        verticaCallback.error('error');
      },
      pid: uniqId,
      query() {
        return {
          on(type, cb) {
            if (successResponse && successResponse.length > 0 && type === 'row') {
              return cb(successResponse);
            }
            if (successResponse && successResponse.length > 0 && type === 'end') {
              return cb();
            }
            if (errorResponse && type === 'error') {
              return cb(errorResponse);
            }

            // need to handle response limit error
            if (successResponse === true && type === 'row') {
              verticaCallback[type] = cb;
            }
            if (successResponse === true && type === 'error') {
              verticaCallback[type] = cb;
              verticaCallback.row(['123', 5]);
            }
          },
          fields: [{
            name: 'id'
          }, {
            name: 'value'
          }]
        };
      }
    };
  })();

  // eslint-disable-next-line node/global-require
  const VerticaAdapter = require('../../../quexserv/server/adapter/vertica');
  let adapter;
  let stubVerticaConnector;

  beforeEach(async () => {
    stubVerticaConnector = sinon.stub(VerticaConnector, 'getVerticaConnection');
    getEnv.vertica_pool_max = 3;
    getEnv.vertica_pool_min = 1;
  });

  afterEach(done => {
    VerticaNodeHealthChecker.stop();
    adapter = undefined;
    stubVerticaConnector.restore();
    if (VerticaAdapter.AdaptersList.size === 0) {
      return done();
    }
    VerticaAdapter.AdaptersList.forEach((adapterItem, key) => adapterItem._poolConnection.drain().then(() => {
      VerticaAdapter.AdaptersList.delete(key);
      if (VerticaAdapter.AdaptersList.size === 0) {
        return done();
      }
      return adapterItem._poolConnection.clear();
    }));
  });

  it('should execute a query', done => {
    stubVerticaConnector.resolves(getMockConnection(1, ['123', 5]));
    adapter = VerticaAdapter.getOrCreate({
      host: 'localhost',
      user: 'dbuser',
      password: 'password',
      database: 'mydatabase'
    });
    const queryResult = [{
      id: '123',
      value: 5
    }];
    adapter.execute('SELECT * FROM MY_DB LIMIT 1')
      .then(
        data => {
          expect(data.items).to.deep.equal(queryResult);
          done();
        }
      );
  });

  it('should report an error', done => {
    stubVerticaConnector.resolves(getMockConnection(1, false, 'my error'));
    adapter = VerticaAdapter.getOrCreate({
      host: 'localhost',
      user: 'dbuser',
      password: 'password',
      database: 'mydatabase'
    });
    adapter.execute('SELECT * FROM MY_DB LIMIT 1')
      .then(
        () => {},
        errorData => {
          expect(errorData.error).to.be.equal('my error');
          expect(errorData.receivedData.items).to.deep.equal([]);
          done();
        }
      );
  });

  it('should return an error with received data if response limit exceeds', done => {
    stubVerticaConnector.resolves(getMockConnection(1, true));
    adapter = VerticaAdapter.getOrCreate({
      host: 'localhost',
      user: 'dbuser',
      password: 'password',
      database: 'mydatabase'
    });
    adapter.execute('SELECT * FROM MY_DB', 2)
      .then(
        data => {
          expect(data.items.length).to.be.equal(0);
          done();
        },
        errorData => {
          expect(errorData.error).to.be.equal('error');
          expect(errorData.receivedData.size).to.be.equal(1000);
          done();
        }
      );
  });

  it('Round-robin test', done => {
    const hostList = ['host1', 'host2', 'host3'];
    expect(VerticaConnector.rotate(hostList)).to.deep.equal(['host1', 'host2', 'host3']);
    expect(VerticaConnector.rotate(hostList)).to.deep.equal(['host2', 'host3', 'host1']);
    expect(VerticaConnector.rotate(hostList)).to.deep.equal(['host3', 'host1', 'host2']);
    expect(VerticaConnector.rotate(hostList)).to.deep.equal(['host1', 'host2', 'host3']);
    const hostList2 = ['host5', 'host6'];
    expect(VerticaConnector.rotate(hostList2)).to.deep.equal(['host5', 'host6']);
    expect(VerticaConnector.rotate(hostList2)).to.deep.equal(['host6', 'host5']);
    VerticaNodeHealthChecker.stop();
    done();
  });

  it('should check if factory returns new or existing adapter on different connections', done => {
    stubVerticaConnector.onCall(0).resolves(getMockConnection(2, ['123', 5]));
    stubVerticaConnector.onCall(1).resolves(getMockConnection(3, ['123', 5]));
    stubVerticaConnector.onCall(2).resolves(getMockConnection(3, ['123', 5]));
    adapter = VerticaAdapter.getOrCreate({
      host: 'localhost',
      user: 'dbuser',
      password: 'password',
      database: 'mydatabase'
    });
    expect(VerticaAdapter.AdaptersList.size).to.equal(1);
    adapter = VerticaAdapter.getOrCreate({
      host: 'localhost',
      user: 'dbuser',
      password: 'password',
      database: 'mydatabase'
    });
    expect(VerticaAdapter.AdaptersList.size).to.equal(1);

    adapter = VerticaAdapter.getOrCreate({
      host: 'localhost',
      user: 'dbuser1',
      password: 'password',
      database: 'mydatabase'
    });
    expect(VerticaAdapter.AdaptersList.size).to.equal(2);
    done();
  });

  it('should Validate min and max pool size', done => {
    stubVerticaConnector.resolves(getMockConnection(1, true));
    adapter = VerticaAdapter.getOrCreate({
      host: 'localhost',
      user: 'dbuser',
      password: 'password',
      database: 'mydatabase'
    });
    expect(adapter._poolConnection.max).to.equal(3);
    expect(adapter._poolConnection.min).to.equal(1);
    done();
  });

  it('should validate working of "_generatekey" method', done => {
    stubVerticaConnector.resolves(getMockConnection(1, true));
    adapter = VerticaAdapter.getOrCreate({
      host: 'localhost',
      user: 'dbuser',
      password: 'password',
      database: 'mydatabase'
    });
    const hashKey = VerticaAdapter._generateKey({
      host: 'localhost',
      user: 'dbuser',
      password: 'password',
      database: 'mydatabase',
      ssl: false
    });
    expect(VerticaAdapter.AdaptersList.has(hashKey)).to.equal(true);
    done();
  });
});

