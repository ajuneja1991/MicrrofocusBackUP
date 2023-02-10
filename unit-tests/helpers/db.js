module.exports = (function() {
  const payloadBulkWriter = require('../../../shared/db/payloadBulkWriter')(),
    app = require('../../../shared/app');

  function cleanRedis(setUp, cb) {
    const redis = require('../../../shared/redis'),
      redisClient = redis.createRedisClient(false);

    redisClient.flushdb((err, results) => {
      redisClient.disconnect();

      if (err) {
        return cb(err);
      }
      return cb();
    }
    );
  }

  function cleanAll(setUp, cb) {
    cleanRedis(setUp, (err, results) => {
      if (err) {
        return cb(err);
      }
      app.dbConnection.cleanDB(err => {
        if (err) {
          console.log('err: ------', err);
          return cb(err);
        }
        // stop payloadBulkWriter
        payloadBulkWriter.stop(true, err => cb());
      }
      );
    }
    );
  }

  function tearDown(cb) {
    return cb.apply();
  }

  return {
    cleanAll(cb) {
      cleanAll(false, cb);
    },
    setUp(cb) {
      cleanAll(true, cb);
    },
    tearDown
  };
})();
