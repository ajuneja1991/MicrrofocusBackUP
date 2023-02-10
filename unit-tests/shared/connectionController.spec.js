/* eslint-disable node/no-sync, node/no-process-env, node/global-require, no-unused-expressions */
const _ = require('lodash');
const { randomUUID } = require('crypto');
const fs = require('fs');
const path = require('path');

describe('connectionController tests', () => {
  const DUMMYSECRETVALUE = '**dummySecretValue**1234**';
  const secretsFile = path.join(__dirname, '..', '..', '..', '..', 'tools', 'SecretTool', 'secrets.json');

  let app,
    tenant;

  const tenantData = {
    name: randomUUID(),
    description: 'tenant description',
    apiKey: randomUUID().replace(/-/g, ''),
    default: false
  };

  before(function(done) {
  /* set the timeout for mocha tests to 10sec */
    this.timeout(100000);
    const db = require('../helpers/db');

    db.cleanAll(err => {
      if (err) {
        return done(err);
      }
      app = require('../../../shared/app');

      app.controllers.bvdTenant.create(tenantData, (err, doc) => {
        if (err) {
          return done(err);
        }
        tenant = doc;
        done();
      });
    });
  });

  after(function(done) {
  /* set the timeout for mocha tests to 10sec */
    this.timeout(100000);
    app.controllers.bvdTenant.remove({
      name: tenantData.name
    }, err => {
      if (err) {
        return done(err);
      }

      const db = require('../helpers/db');

      db.cleanAll(err => {
        if (err) {
          return done(err);
        }

        return done(); // tell mocha that the tear down code is finished
      });
    });
  });

  const create = function(connection, done) {
    app.controllers.connectionController.create(connection, (err, result) => {
      expect(err).to.be.null;
      expect(result.data).to.not.be.empty;

      let data;
      if (typeof result.data === 'string') {
        data = JSON.parse(result.data);
      } else {
        data = result.data;
      }

      expect(result.secret).to.be.undefined;
      expect(result._id).to.not.be.empty;
      expect(result.tenant).to.equal(tenant._id);
      expect(result.name).to.equal(connection.name);
      expect(data).to.deep.equal(connection.data);

      const vaultContent = JSON.parse(fs.readFileSync(secretsFile));
      expect(vaultContent[`connection_${result._id}`]).to.equal(JSON.stringify(connection.secret));

      done(result);
    });
  };

  const getByName = function(name, options, connection, done) {
    if (options) {
      return app.controllers.connectionController.getByName(name, tenant._id, options, (err, result) => {
        expect(err).to.be.null;
        expect(result).to.deep.equal(connection);

        done();
      });
    }

    app.controllers.connectionController.getByName(name, tenant._id, (err, result) => {
      expect(err).to.be.null;
      expect(result).to.deep.equal(connection);

      done();
    });
  };

  it('create and get connection', done => {
    const connection = {
      name: 'ABC Connection',
      secret: {
        password: 'Hello World!'
      },
      data: {
        value1: '1',
        value2: '2'
      },
      tenant: tenant._id
    };

    create(connection, result => {
      connection.type = 'vertica';
      connection._id = result._id;
      delete connection.tenant;

      getByName(connection.name, {
        withSecrets: true
      }, connection, () => {
        done();
      });
    });
  });

  it('get connection without secrets', done => {
    const connection = {
      name: 'ABC Connection 2',
      secret: {
        password: 'Hello World too!'
      },
      data: {
        value3: '3',
        value4: '4'
      },
      tenant: tenant._id
    };

    create(connection, result => {
      connection.type = 'vertica';
      connection._id = result._id;
      connection.secret.password = DUMMYSECRETVALUE;
      delete connection.tenant;

      getByName(connection.name, null, connection, () => {
        done();
      });
    });
  });

  it('create duplicate connection', done => {
    const connection = {
      name: 'duplicate',
      secret: {
        password: 'Hello World!'
      },
      data: {
        value1: '1',
        value2: '2'
      },
      tenant: tenant._id
    };

    create(connection, () => {
      app.controllers.connectionController.create(connection, (err, result) => {
        expect(err).to.be.not.null;
        expect(result).to.be.undefined;

        done();
      });
    });
  });

  it('get not existing connection', done => {
    app.controllers.connectionController.getByName('name', tenant._id, (err, result) => {
      expect(err.toString()).to.equal('Error: Connection "name" does not exist.');
      expect(result).to.be.undefined;

      done();
    });
  });

  it('update and get connection', done => {
    const connection = {
      name: 'Update Connection',
      secret: {
        password: 'Hello World!',
        moreSecret: 'More and More!',
        anotherSecret: 'Secret!'
      },
      data: {
        value1: '1',
        value2: '2'
      },
      tenant: tenant._id
    };

    create(connection, createdConnection => {
      connection._id = createdConnection._id;
      const changedConnection = _.cloneDeep(connection);

      delete changedConnection.secret.password;
      changedConnection.secret.moreSecret = 'Less and Less!';
      changedConnection.secret.anotherSecret = DUMMYSECRETVALUE;
      changedConnection.data.value1 = '10';

      app.controllers.connectionController.update(connection.name, tenant._id, changedConnection, (err, result) => {
        expect(result).to.not.be.undefined;
        let data;
        if (typeof result.data === 'string') {
          data = JSON.parse(result.data);
        } else {
          data = result.data;
        }

        changedConnection.type = 'vertica';
        delete changedConnection.tenant;
        changedConnection.secret.anotherSecret = connection.secret.anotherSecret;

        expect(err).to.be.null;
        expect(result.secret).to.be.undefined;
        expect(result._id).to.not.be.empty;
        expect(result.tenant).to.equal(tenant._id);
        expect(result.name).to.equal(changedConnection.name);
        expect(data).to.deep.equal(changedConnection.data);

        const vaultContent = JSON.parse(fs.readFileSync(secretsFile));
        expect(vaultContent[`connection_${result._id}`]).to.equal(JSON.stringify(changedConnection.secret));

        getByName(changedConnection.name, {
          withSecrets: true
        }, changedConnection, () => {
          done();
        });
      });
    });
  });
});
