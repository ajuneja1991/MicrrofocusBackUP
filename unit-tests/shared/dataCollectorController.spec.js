/* eslint-disable no-unused-expressions, node/no-sync, node/global-require */

const _ = require('lodash');
const { randomUUID } = require('crypto');

describe('dataCollectorController tests', () => {
  let app;
  let tenantId;
  const dataCollectorId = [];
  const mock = {
    tenantObj: {
      name: randomUUID(),
      description: 'tenant description',
      apiKey: randomUUID().replace(/-/g, ''),
      default: false
    },
    dataCollectorObj: {
      name: 'mock_collector_name',
      connection: null,
      type: 'vertica',
      active: true,
      lastExecution: '2017-10-16 11:26:53.827+02',
      data: {
        description: 'mock_description',
        tags: ['tag1', 'tag2'],
        dims: ['dim1', 'dim2'],
        availableColumns: ['col1', 'col2'],
        resultFormat: ['unchanged', 'groupwidget'],
        retentionValue: 200,
        retentionUnit: ['hours', 'days', 'weeks', 'months'],
        schedulingValue: 400,
        schedulingUnit: ['minutes', 'hours', 'days', 'weeks', 'months']
      }
    },
    updateDataCollectorDataObj: {
      data: {
        description: 'mock_new_description',
        tags: ['tag1', 'tag2'],
        dims: ['dim1', 'dim2'],
        availableColumns: ['col1', 'col2'],
        resultFormat: ['unchanged', 'groupwidget'],
        retentionValue: 200,
        retentionUnit: ['hours', 'days', 'weeks', 'months'],
        schedulingValue: 400,
        schedulingUnit: ['minutes', 'hours', 'days', 'weeks', 'months']
      }
    }
  };

  const prepareMocks = () => {
    mock.dataCollectorObj.tenant = tenantId;
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

      app.controllers.bvdTenant.create(mock.tenantObj,
        (err, tenantDoc) => {
          if (err) {
            return done(err);
          }
          tenantId = tenantDoc._id;

          prepareMocks();
          done();
        }
      );
    });
  }
  );

  after(function(done) {
  /* set the timeout for mocha tests to 10sec */
    this.timeout(100000);
    app.controllers.bvdTenant.remove({
      name: mock.tenantObj.name
    }, err => {
      if (err) {
        return done(err);
      }
      const db = require('../helpers/db');

      db.cleanAll(
        err => {
          if (err) {
            return done(err);
          }
          done(); // tell mocha that the tear down code is finished
        }
      );
    });
  });

  it('dataCollectorController: create dataCollector', done => {
    app.controllers.dataCollectorController.create(
      mock.dataCollectorObj,
      (err, dataCollectorDoc) => {
        if (err) {
          return done(err);
        }

        expect(dataCollectorDoc).to.exist;
        expect(dataCollectorDoc.name).to.equal(mock.dataCollectorObj.name);
        dataCollectorId.push(dataCollectorDoc._id);

        const dataCollectorObj2 = _.cloneDeep(mock.dataCollectorObj);

        dataCollectorObj2.name = 'mock_collector_name_2';

        app.controllers.dataCollectorController.create(
          dataCollectorObj2,
          (err2, dataCollectorDoc2) => {
            if (err2) {
              return done(err2);
            }
            expect(dataCollectorDoc2).to.exist;
            dataCollectorId.push(dataCollectorDoc2._id);

            return done();
          }
        );
      }
    );
  });

  it('dataCollectorController: try to re-create same dataCollector', done => {
    app.controllers.dataCollectorController.create(mock.dataCollectorObj, err => {
      if (err) {
        expect(err.message).to.contain('unique constraint');
        expect(err.message).to.contain('violate');
        return done();
      }

      return done(new Error('Expected error because I\'ve added same dataCollector twice.'));
    });
  });

  it('dataCollectorController: try to create predefined query without name', done => {
    const dataCollectorWithoutName = _.cloneDeep(mock.dataCollectorObj);

    dataCollectorWithoutName.name = '';
    app.controllers.dataCollectorController.create(dataCollectorWithoutName, err => {
      if (err) {
        expect(err.message).to.contain('Name of predefined query is empty.');

        return done();
      }

      return done(new Error('Expected error because no name was specified.'));
    });
  });

  it('dataCollectorController: try to create predefined query without data', done => {
    const dataCollectorWithoutData = _.cloneDeep(mock.dataCollectorObj);

    dataCollectorWithoutData.data = null;
    app.controllers.dataCollectorController.create(dataCollectorWithoutData, err => {
      if (err) {
        expect(err.message).to.contain('Predefined query has no data specified.');

        return done();
      }

      return done(new Error('Expected error because no data was specified.'));
    });
  });

  it('dataCollectorController: update dataCollector name', done => {
    const mockEditName = 'mock_edit_name';

    mock.dataCollectorObj.name = mockEditName;
    app.controllers.dataCollectorController.update(
      dataCollectorId[0],
      mock.dataCollectorObj.tenant,
      mock.dataCollectorObj,
      (err, dataCollectorDoc) => {
        if (err) {
          return done(err);
        }
        expect(dataCollectorDoc.name).to.equal(mockEditName);

        return done();
      }
    );
  });

  it('dataCollectorController: update dataCollector data', done => {
    /* check that we can update only the data (without specifying the name) */
    app.controllers.dataCollectorController.update(
      dataCollectorId[0],
      mock.dataCollectorObj.tenant,
      mock.updateDataCollectorDataObj,
      (err, dataCollectorDoc) => {
        if (err) {
          return done(err);
        }
        expect(dataCollectorDoc.data).to.deep.equal(mock.updateDataCollectorDataObj.data);

        return done();
      }
    );
  });

  it('dataCollectorController: getAllCollectors', done => {
    app.controllers.dataCollectorController.getAll(tenantId, (err, dataCollectorDocs) => {
      if (err) {
        return done(err);
      }
      expect(dataCollectorDocs).to.exist;
      expect(dataCollectorDocs.length).to.equal(2);

      return done();
    });
  });

  it('dataCollectorController: getCollectorById', done => {
    app.controllers.dataCollectorController.getById(
      dataCollectorId[0],
      mock.dataCollectorObj.tenant,
      (err, dataCollectorDocs) => {
        if (err) {
          return done(err);
        }
        expect(dataCollectorDocs).to.exist;
        expect(dataCollectorDocs.length).to.equal(1);
        expect(dataCollectorDocs[0].name).to.equal(mock.dataCollectorObj.name);

        return done();
      }
    );
  });

  it('dataCollectorController: getCollectorById (multiple)', done => {
    app.controllers.dataCollectorController.getById(
      [dataCollectorId[1], dataCollectorId[0]],
      mock.dataCollectorObj.tenant,
      (err, dataCollectorDocs) => {
        if (err) {
          return done(err);
        }
        expect(dataCollectorDocs).to.exist;
        expect(dataCollectorDocs.length).to.equal(2);

        expect(_.find(dataCollectorDocs, { _id: dataCollectorId[0] })).not.equal(undefined);
        expect(_.find(dataCollectorDocs, { _id: dataCollectorId[1] })).not.equal(undefined);
        return done();
      }
    );
  });

  it('dataCollectorController: getByQueryFields', done => {
    const queryObj = {
      name: mock.dataCollectorObj.name,
      type: mock.dataCollectorObj.type
    };

    app.controllers.dataCollectorController.getByQueryFields(
      queryObj,
      mock.dataCollectorObj.tenant,
      (err, dataCollectorDocs) => {
        if (err) {
          return done(err);
        }
        expect(dataCollectorDocs).to.exist;
        expect(dataCollectorDocs.length).to.equal(1);
        expect(dataCollectorDocs[0].name).to.equal(mock.dataCollectorObj.name);
        expect(dataCollectorDocs[0].type).to.equal(mock.dataCollectorObj.type);

        return done();
      }
    );
  });

  it('dataCollectorController: export (all)', done => {
    app.controllers.dataCollectorController.export({
      tenant: mock.dataCollectorObj.tenant
    }, (err, dataCollectorDocs) => {
      if (err) {
        return done(err);
      }
      expect(dataCollectorDocs).to.exist;
      const dcDoc = JSON.parse(dataCollectorDocs);

      expect(dcDoc.length).to.equal(2);

      expect(dcDoc[0]._id).to.be.undefined;
      expect(dcDoc[0].tenant).to.be.undefined;

      expect(dcDoc[1]._id).to.be.undefined;
      expect(dcDoc[1].tenant).to.be.undefined;

      const mockDoc = _.find(dcDoc, { name: mock.dataCollectorObj.name });
      expect(mockDoc).not.equal(undefined);

      return done();
    });
  });

  it('dataCollectorController: export (by ID)', done => {
    app.controllers.dataCollectorController.export({
      tenant: mock.dataCollectorObj.tenant,
      dataCollectorIds: dataCollectorId[0]
    }, (err, dataCollectorDocs) => {
      if (err) {
        return done(err);
      }
      expect(dataCollectorDocs).to.exist;
      const dcDoc = JSON.parse(dataCollectorDocs);

      expect(dcDoc.length).to.equal(1);

      expect(dcDoc[0].name).to.equal(mock.dataCollectorObj.name);
      expect(dcDoc[0]._id).to.be.undefined;
      expect(dcDoc[0].tenant).to.be.undefined;

      return done();
    });
  });

  it('dataCollectorController: export (by name)', done => {
    app.controllers.dataCollectorController.export({
      tenant: mock.dataCollectorObj.tenant,
      dataCollectorNames: mock.dataCollectorObj.name
    }, (err, dataCollectorDocs) => {
      if (err) {
        return done(err);
      }
      expect(dataCollectorDocs).to.exist;
      const dcDoc = JSON.parse(dataCollectorDocs);

      expect(dcDoc.length).to.equal(1);

      expect(dcDoc[0].name).to.equal(mock.dataCollectorObj.name);
      expect(dcDoc[0]._id).to.be.undefined;
      expect(dcDoc[0].tenant).to.be.undefined;

      return done();
    });
  });

  it('dataCollectorController: delete dataCollector', done => {
    app.controllers.dataCollectorController.delete(
      dataCollectorId[0],
      mock.dataCollectorObj.tenant,
      (err, numAffected) => {
        if (err) {
          return done(err);
        }
        expect(numAffected).to.equal(1);

        return done();
      }
    );
  });
});
