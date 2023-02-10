const Promise = require('bluebird');
const fs = require('fs');
const glob = require('glob');

/* this test is always executed last and makes sure that the DBs are cleaned up properly */

describe('tearDownUnitTests', () => {
  after(done => {
    // eslint-disable-next-line node/global-require
    const app = require('../../shared/app'),
      // eslint-disable-next-line node/global-require
      dbHelper = require('./helpers/db');

    /* make sure payloadBulkWriter is disabled */
    // eslint-disable-next-line no-empty-function
    app.controllers.item._stopBulkWriter(false, () => {});

    const knex = app.dbConnection.getNativeConnection();

    let createDropTableQueries;
    if (app.dbConnection.driverType === 'oracle') {
      createDropTableQueries = 'select \'DROP TABLE "BVD"."\' || TABLE_NAME || \'" cascade constraints PURGE\' as dropStatement from all_tables where table_name like \'bvd%\' or table_name like \'dashboard%\' or table_name like \'filters\'';
    } else {
      createDropTableQueries = 'select \'DROP TABLE public."\' || TABLE_NAME || \'" cascade;\' as dropstatement from information_schema.tables where table_name like \'bvd%\' or table_name like \'dashboard%\' or table_name like \'migrations%\' or table_name like \'filters\' or table_name like \'dataItems\';';
    }

    /* make sure we really leave with a clean PG DB */
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
        const globPattern = `${app.config.fileUploadDir}*.processed`;
        const filesToDelete = glob.sync(globPattern);

        for (let i = filesToDelete.length - 1; i >= 0; i--) {
          fs.unlinkSync(filesToDelete[i]); // eslint-disable-line node/no-sync
        }

        app.destroy()
          .then(() => {
            dbHelper.tearDown(err => {
              if (err) {
                return done(err);
              }

              return done(); // tell mocha that the tear down code is finished
            });
          }).catch(ex => done(ex));
      });
    });
  });

  it('dummy', done => {
    expect(true).equal(true);

    return done();
  });
});
