/* eslint-disable camelcase, node/no-process-env, node/global-require, no-unused-expressions */

describe('statsController tests', () => {
  const async = require('async'),
    _ = require('lodash');
  let app;
  const tenantId = 'tenant1',
    msgs = [{
      channel: 't1<>t2<>uuu<>USA<>New York<>nnn',
      dims: ['d1', 'country', 'city', 'd4'],
      tags: ['t1', 't2'],
      data: {},
      tenantId
    }, {
      channel: 't1<>t2<>uuu<>USA<>Denver<>nnn',
      dims: ['d1', 'country', 'city', 'd4'],
      tags: ['t1', 't2'],
      data: {},
      tenantId
    }, {
      channel: 't1<>t2<>uuu<>Japan<>Tokio<>nnn',
      dims: ['d1', 'country', 'city', 'd4'],
      tags: ['t1', 't2'],
      data: {},
      tenantId
    }, {
      channel: 't1<>t2<>uuu<>Indien<>Mumbai<>nnn',
      dims: ['d1', 'country', 'city', 'd4'],
      tags: ['t1', 't2'],
      data: {},
      tenantId
    }, {
      channel: 't1<>t2<>uuu<>Deutschland<>Berlin<>nnn',
      dims: ['d1', 'country', 'city', 'd4'],
      tags: ['t1', 't2'],
      data: {},
      tenantId
    }, {
      channel: 't3<>t4<>ukk<>USA<>New York<>lll',
      dims: ['d1', 'country', 'city', 'd4'],
      tags: ['t3', 't4'],
      data: {},
      tenantId
    }, {
      channel: 't3<>t4<>ukk<>USA<>Los Angeles<>lll',
      dims: ['d1', 'country', 'city', 'd4'],
      tags: ['t3', 't4'],
      data: {},
      tenantId
    }, {
      channel: 't1<>t2<>ukk<>USA<>Honolulu<>lll',
      dims: ['d1', 'country', 'city', 'd4'],
      tags: ['t1', 't2'],
      data: {},
      tenantId
    }, {
      channel: 't1<>t2<>ukk<>Indien<>Kolkata<>lll',
      dims: ['d1', 'country', 'city', 'd4'],
      tags: ['t1', 't2'],
      data: {},
      tenantId
    }, {
      channel: 't3<>t4<>ukk<>Russland<>Moskau<>lll',
      dims: ['d1', 'country', 'city', 'd4'],
      tags: ['t3', 't4'],
      data: {},
      tenantId
    }, {
      channel: 't1<>t2<>ukk<>UK<>London<>lll',
      dims: ['d1', 'country', 'city', 'd4'],
      tags: ['t1', 't2'],
      data: {},
      tenantId
    }, {
      channel: 't1<>t2<>sww<>USA<>New York<>sss',
      dims: ['d1', 'country', 'city', 'd4'],
      tags: ['t1', 't2'],
      data: {},
      tenantId
    }, {
      channel: 't1<>t2<>sww<>Sweden<>Stockholm<>sss',
      dims: ['d1', 'country', 'city', 'd4'],
      tags: ['t1', 't2'],
      data: {},
      tenantId
    }, {
      channel: 't1<>t2<>sww<>New Zealand<>Wellington<>sss',
      dims: ['d1', 'country', 'city', 'd4'],
      tags: ['t1', 't2'],
      data: {},
      tenantId
    }, {
      channel: 't5<>France<>Paris<>fff<>ppp',
      dims: ['country', 'city', 'd3', 'd4'],
      tags: ['t5'],
      data: {},
      tenantId
    }, {
      channel: 't5<>Iceland<>Reykjavík<>fff<>ppp',
      dims: ['country', 'city', 'd3', 'd4'],
      tags: ['t5'],
      data: {},
      tenantId
    }, {
      channel: 't6<>Australia<>Sydney<>fff<>ppp',
      dims: ['country', 'city', 'd3', 'd4'],
      tags: ['t6'],
      data: {},
      tenantId
    }, {
      channel: 't5<>South Africa<>Cape Town<>aaa<>ccc',
      dims: ['country', 'city', 'd3', 'd4'],
      tags: ['t5'],
      data: {},
      tenantId
    }];

  before(function(done) {
  /* set the timeout for mocha tests to 10sec */
    this.timeout(100000);
    const db = require('../helpers/db');
    db.cleanAll(err => {
      if (err) {
        return done(err);
      }
      app = require('../../../shared/app');
      async.each(msgs, (msg, cb) => {
        app.controllers.stats.updateStats(msg, cb);
      }, err => {
        if (err) {
          return done(err);
        }

        return done();
      });
    });
  });

  after(function(done) {
  /* set the timeout for mocha tests to 10sec */
    this.timeout(100000);
    const redis = require('../../../shared/redis');
    const redisClient = redis.createRedisClient();
    redisClient.keys(`${tenantId}*`, (err, keys) => {
      if (err) {
        return done(err);
      }
      async.each(keys, (key, cb) => {
        redisClient.del(key, err => {
          if (err) {
            return done(err);
          }
          cb();
        });
      }, err => {
        if (err) {
          return done(err);
        }

        return done();
      });
    });
  });

  it('statsController: get values for empty channel array', done => {
    app.controllers.stats.getChannelVariations(tenantId, {
      channels: [],
      variables: [
        'country', 'city'
      ]
    }, (err, variations) => {
      if (err) {
        return done(err);
      }
      expect(variations).to.exist;
      expect(variations.city).to.exist;
      expect(variations.city).to.be.a('Array');
      expect(variations.city.length === 0).equal(true);
      expect(variations.country).to.exist;
      expect(variations.country).to.be.a('Array');
      expect(variations.country.length === 0).equal(true);
      done();
    });
  });

  it('statsController: get values for channels with empty variables array', done => {
    app.controllers.stats.getChannelVariations(tenantId, {
      channels: [
        't1<>t2<>uuu<>USA<>New York<>nnn',
        't3<>t4<>ukk<>USA<>New York<>lll',
        't5<>France<>Paris<>fff<>ppp'
      ],
      variables: []
    }, (err, variations) => {
      if (err) {
        return done(err);
      }
      expect(variations).to.exist;
      expect(_.keys(variations).length === 0).equal(true);
      done();
    });
  });

  it('statsController: get values for tagsdims empty variables array', done => {
    app.controllers.stats.getChannelVariations(tenantId, {
      tagsdims: [
        't4,country,city,d3,d4'
      ],
      variables: []
    }, (err, variations) => {
      if (err) {
        return done(err);
      }
      expect(variations).to.exist;
      expect(_.keys(variations).length === 0).equal(true);
      done();
    });
  });

  it('statsController: get values for channels with variables', done => {
    app.controllers.stats.getChannelVariations(tenantId, {
      channels: [
        't1<>t2<>uuu<>USA<>New York<>nnn',
        't3<>t4<>ukk<>USA<>New York<>lll',
        't5<>France<>Paris<>fff<>ppp'
      ],
      variables: [
        'country', 'city'
      ]
    }, (err, variations) => {
      if (err) {
        return done(err);
      }
      expect(variations).to.exist;
      expect(variations.city).to.exist;
      expect(variations.city).to.be.a('Array');
      expect(variations.city.length === 9).equal(true);
      const cities = [
        'Berlin', 'Denver', 'Los Angeles', 'Moskau', 'Mumbai', 'New York', 'Paris', 'Reykjavík', 'Tokio'
      ];

      variations.city.forEach(city => {
        expect(cities.indexOf(city) >= 0).equal(true);
      });
      expect(variations.country).to.exist;
      expect(variations.country).to.be.a('Array');
      expect(variations.country.length === 7).equal(true);
      const countries = ['Deutschland', 'France', 'Iceland', 'Indien', 'Japan', 'Russland', 'USA'];

      variations.country.forEach(country => {
        expect(countries.indexOf(country) >= 0).equal(true);
      });
      done();
    });
  });

  it('statsController: get values for tagsdims with variables', done => {
    app.controllers.stats.getChannelVariations(tenantId, {
      tagsdims: [
        't5,country,city,d3,d4'
      ],
      variables: [
        'country', 'city'
      ]
    }, (err, variations) => {
      if (err) {
        return done(err);
      }
      expect(variations).to.exist;
      expect(variations.city).to.exist;
      expect(variations.city).to.be.a('Array');
      expect(variations.city.length === 3).equal(true);
      const cities = [
        'Paris', 'Reykjavík', 'Cape Town'
      ];

      variations.city.forEach(city => {
        expect(cities.indexOf(city) >= 0).equal(true);
      });
      expect(variations.country).to.exist;
      expect(variations.country).to.be.a('Array');
      expect(variations.country.length === 3).equal(true);
      const countries = ['France', 'Iceland', 'South Africa'];

      variations.country.forEach(country => {
        expect(countries.indexOf(country) >= 0).equal(true);
      });
      done();
    });
  });
});
