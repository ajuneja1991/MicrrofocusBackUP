/* eslint-disable node/no-process-env , node/global-require */
const Promise = require('bluebird');

/* this test is always executed first and makes sure that the DBs are clean */

process.env.NODE_ENV = 'test';
process.env.SS_ENV = 'test';
// eslint-disable-next-line node/no-path-concat
process.env.EXPLORE_CONFIG_PATH = `${__dirname}/../mockdata`;
describe('setupUnitTests', () => {
  before(function(done) {
  /* set the timeout for mocha tests to 10sec */
    this.timeout(100000);
    const app = require('../../shared/app');

    app.init('www').then(() => {
      const dbConnection = app.dbConnection;

      global.dbConnection = dbConnection;

      const knex = app.dbConnection.getNativeConnection();

      let createDropTableQueries;
      if (app.dbConnection.driverType === 'oracle') {
        createDropTableQueries = 'select \'DROP TABLE "BVD"."\' || TABLE_NAME || \'" cascade constraints PURGE\' as dropStatement from all_tables where table_name like \'bvd%\' or table_name like \'dashboard%\' or table_name like \'filters\'';
      } else {
        createDropTableQueries = 'select \'DROP TABLE public."\' || TABLE_NAME || \'" cascade;\' as dropstatement from information_schema.tables where table_name like \'bvd%\' or table_name like \'dashboard%\' or table_name like \'migrations%\' or table_name like \'filters\' or table_name like \'dataItems\';';
      }

      knex.transaction(trx => trx.raw(createDropTableQueries).then(rows => {
        if (app.dbConnection.driverType === 'postgresql') {
          rows = rows.rows;
        }
        if (rows.length === 0) {
          return Promise.resolve();
        }
        return Promise.map(rows, tableToDrop => {
          if (app.dbConnection.driverType === 'oracle') {
            return trx.raw(tableToDrop.DROPSTATEMENT);
          }
          return trx.raw(tableToDrop.dropstatement);
        });
      })).then(() => {
        let createDropSequenceQueries = 'NOTIFY dummy';
        if (app.dbConnection.driverType === 'oracle') {
          createDropSequenceQueries = 'select \'DROP SEQUENCE "BVD"."\' || SEQUENCE_NAME || \'"\' as dropStatement from all_sequences where sequence_name like \'bvd%\'';
        }
        knex.transaction(trx => trx.raw(createDropSequenceQueries).then(rows => {
          if (app.dbConnection.driverType === 'postgresql') {
            rows = rows.rows;
          }
          if (rows.length === 0) {
            return Promise.resolve();
          }
          return Promise.map(rows, sequencesToDrop => {
            if (app.dbConnection.driverType === 'oracle') {
              return trx.raw(sequencesToDrop.DROPSTATEMENT);
            }
            return trx.raw(sequencesToDrop.dropstatement);
          });
        })).then(() => {
          const dbHelper = require('./helpers/db');

          dbHelper.setUp(err => {
            if (err) {
              console.error('Error setting up DB:', err);
              return done(err);
            }
            /* Load controllers */
            require('../../shared/controllers/user-management/ldapController')(app, dbConnection);
            require('../../shared/controllers/user-management/tenantController')(app, dbConnection);
            require('../../shared/controllers/user-management/roleController')(app, dbConnection);
            require('../../shared/controllers/user-management/userController')(app, dbConnection);
            require('../../shared/controllers/user-management/resourceController')(app, dbConnection);

            require('../../shared/controllers/itemController')(app, dbConnection);
            require('../../shared/controllers/statsController')(app);
            require('../../shared/controllers/channelFilterController')(app, dbConnection);
            require('../../shared/controllers/svgController')(app);
            require('../../shared/controllers/dashboardCategoryController')(app, dbConnection);
            require('../../shared/controllers/dashboardController')(app, dbConnection);
            require('../../shared/controllers/dataCollectorController')(app, dbConnection);
            require('../../shared/controllers/connectionController')(app, dbConnection);
            require('../../shared/controllers/identityController')(app, dbConnection);
            require('../../shared/controllers/pageRegistryController')(app, dbConnection);
            require('../../shared/controllers/appConfigController')(app, dbConnection);
            require('../../shared/controllers/tagController')(app, dbConnection);
            require('../../shared/controllers/jobController')(app, dbConnection);
            require('../../shared/controllers/notificationController')(app, dbConnection);
            app.controllers.bvdSettingsController = require('../../shared/controllers/bvdSettingsController')(dbConnection);

            done(); // tell mocha that the setup code is finished
          }
          );
        });
      });
    }
    ).catch(ex => done(ex));
  }
  );

  it('dummy', done => {
    expect(true).equal(true);

    return done();
  });
});
