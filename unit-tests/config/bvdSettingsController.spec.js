const moment = require('moment');
describe('bvdSettingsController tests', () => {
  // eslint-disable-next-line node/global-require
  const _ = require('lodash');
  let app;
  let bvdSettingsController;

  const mockData = {
    createSettingsOptions: [{
      namespace: 'test-namespace',
      key: 'test-key-1',
      value: 'test-value-1'
    }]
  };

  before(function(done) {
  /* set the timeout for mocha tests to 10sec */
    this.timeout(100000);
    // eslint-disable-next-line node/global-require
    const db = require('../helpers/db');
    db.cleanAll(
      err => {
        if (err) {
          return done(err);
        }
        // eslint-disable-next-line node/global-require
        app = require('../../../shared/app');
        bvdSettingsController = app.controllers.bvdSettingsController;
        return done();
      }
    );
  }
  );

  after(function(done) {
  /* set the timeout for mocha tests to 10sec */
    this.timeout(100000);
    // eslint-disable-next-line node/global-require
    const db = require('../helpers/db');
    db.cleanAll(
      err => {
        if (err) {
          return done(err);
        }
        return done();
      }
    );
  }
  );

  it('bvdSettingsController: set values', done => {
    bvdSettingsController.setValues(
      mockData.createSettingsOptions,
      err => {
        if (err) {
          return done(err);
        }

        bvdSettingsController.getAll(
          (err, result) => {
            if (err) {
              return done(err);
            }

            expect(result).not.to.be.undefined;
            expect(result).not.to.be.null;
            expect(_.isEmpty(result)).to.equal(false);
            expect(result[mockData.createSettingsOptions[0].namespace]).not.to.be.undefined;
            expect(result[mockData.createSettingsOptions[0].namespace]).not.to.be.null;
            expect(
              result[mockData.createSettingsOptions[0].namespace][mockData.createSettingsOptions[0].key]).not.to.be.undefined;
            expect(
              result[mockData.createSettingsOptions[0].namespace][mockData.createSettingsOptions[0].key]).not.to.be.null;
            return done();
          }
        );
      }
    );
  });

  it('bvdSettingsController: get values', done => {
    const options = [{
      namespace: mockData.createSettingsOptions[0].namespace,
      key: mockData.createSettingsOptions[0].key
    }];
    bvdSettingsController.getValues(
      options,
      (err, result) => {
        if (err) {
          return done(err);
        }

        expect(result).not.to.be.undefined;
        expect(result).not.to.be.null;
        expect(_.isEmpty(result)).to.equal(false);
        expect(result[mockData.createSettingsOptions[0].namespace]).not.to.be.undefined;
        expect(result[mockData.createSettingsOptions[0].namespace]).not.to.be.null;
        expect(
          result[mockData.createSettingsOptions[0].namespace][mockData.createSettingsOptions[0].key]).not.to.be.undefined;
        expect(
          result[mockData.createSettingsOptions[0].namespace][mockData.createSettingsOptions[0].key]).not.to.be.null;
        return done();
      }
    );
  });

  it('bvdSettingsController: settings items uniqueness', done => {
    // try to create another settings record with the same composite key
    // and expect update instead of insert
    const settingsObj = mockData.createSettingsOptions;
    settingsObj[0].value = 'test-value-111';

    bvdSettingsController.setValues(
      settingsObj,
      err => {
        if (err) {
          return done(err);
        }

        bvdSettingsController.getAll(
          (err, result) => {
            if (err) {
              return done(err);
            }

            expect(result).not.to.be.undefined;
            expect(result).not.to.be.null;
            expect(result[mockData.createSettingsOptions[0].namespace]).not.to.be.undefined;
            expect(result[mockData.createSettingsOptions[0].namespace]).not.to.be.null;
            expect(
              result[mockData.createSettingsOptions[0].namespace][mockData.createSettingsOptions[0].key]).not.to.be.undefined;
            expect(
              result[mockData.createSettingsOptions[0].namespace][mockData.createSettingsOptions[0].key]).not.to.be.null;
            expect(
              result[mockData.createSettingsOptions[0].namespace][mockData.createSettingsOptions[0].key]).to.equal(
              'test-value-111');
            return done();
          }
        );
      }
    );
  });

  it('bvdSettingsController: settings complex value', done => {
    const complexData = {
      'bvd.bvd_aging_age': 12,
      'bvd.bvd_aging_stats': 4
    };
    const settingsObj = mockData.createSettingsOptions;
    settingsObj[0].value = complexData;

    bvdSettingsController.setValues(
      settingsObj,
      err => {
        if (err) {
          return done(err);
        }

        bvdSettingsController.getAll(
          (err, result) => {
            if (err) {
              return done(err);
            }

            expect(result).not.to.be.undefined;
            expect(result).not.to.be.null;
            expect(result[mockData.createSettingsOptions[0].namespace]).not.to.be.undefined;
            expect(result[mockData.createSettingsOptions[0].namespace]).not.to.be.null;
            expect(
              result[mockData.createSettingsOptions[0].namespace][mockData.createSettingsOptions[0].key]).not.to.be.undefined;
            expect(
              result[mockData.createSettingsOptions[0].namespace][mockData.createSettingsOptions[0].key]).not.to.be.null;
            const valueObj = JSON.parse(
              result[mockData.createSettingsOptions[0].namespace][mockData.createSettingsOptions[0].key]);
            expect(valueObj['bvd.bvd_aging_age']).to.equal(12);
            expect(valueObj['bvd.bvd_aging_stats']).to.equal(4);
            return done();
          }
        );
      }
    );
  });

  it('bvdSettingsController: settings empty value', done => {
    const emptyData = {};
    const settingsObj = mockData.createSettingsOptions;
    settingsObj[0].value = emptyData;

    bvdSettingsController.setValues(
      settingsObj,
      err => {
        if (err) {
          return done(err);
        }

        bvdSettingsController.getAll(
          (err, result) => {
            if (err) {
              return done(err);
            }

            expect(result).not.to.be.undefined;
            expect(result).not.to.be.null;
            expect(result[mockData.createSettingsOptions[0].namespace]).not.to.be.undefined;
            expect(result[mockData.createSettingsOptions[0].namespace]).not.to.be.null;
            expect(
              result[mockData.createSettingsOptions[0].namespace][mockData.createSettingsOptions[0].key]).not.to.be.undefined;
            expect(
              result[mockData.createSettingsOptions[0].namespace][mockData.createSettingsOptions[0].key]).not.to.be.null;
            const valueObj = JSON.parse(
              result[mockData.createSettingsOptions[0].namespace][mockData.createSettingsOptions[0].key]);
            expect(valueObj).to.be.empty;
            return done();
          }
        );
      }
    );
  });

  it('bvdSettingsController: set and get aging time, remove aging', done => {
    bvdSettingsController.setValues([{
      namespace: 'Configuration',
      key: 'nextDataAgingTime',
      value: moment(moment().valueOf() + 100).toISOString()
    }], err => {
      expect(err).to.be.null;
      bvdSettingsController.getValues([{
        namespace: 'Configuration',
        key: 'nextDataAgingTime'
      }], (err, values) => {
        expect(err).to.be.null;
        expect(values).not.be.undefined;
        expect(moment(values.Configuration.nextDataAgingTime).isValid()).to.equals(true);
        bvdSettingsController.removeValue('Configuration', 'nextDataAgingTime').then(() => done());
      });
    });
  });
}
);
