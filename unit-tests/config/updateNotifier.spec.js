'use strict';

const app = require('../../../shared/app');

describe('updateNotifier tests', () => {
  let updateNotifier;

  before(done => {
    updateNotifier = require('../../../shared/config/updateNotifier');
    done();
  });

  it('sendConfigUpdate: config object add', done => {
    updateNotifier.sendConfigUpdate({
      unitTest: true,
      'unitTester.secondLevel': 'is true',
      'unitTester.number': 123,
      'unitTester.array': [456, 'abc'],
      'unitTester.obj': {
        789: 'abc'
      }
    });
    setTimeout(() => {
      console.info(app.config);
      expect(app.config.unitTest).to.equal(true);
      expect(app.config.unitTester.secondLevel).to.equal('is true');
      expect(app.config.unitTester.number).to.equal(123);
      expect(app.config.unitTester.array).to.deep.equal([456, 'abc']);
      expect(app.config.unitTester.obj['789']).to.equal('abc');
      done();
    }, 500);
  });

  it('sendConfigUpdate: config object update', done => {
    updateNotifier.sendConfigUpdate({
      unitTest: false,
      'unitTester.secondLevel': 'is not true',
      'unitTester.number': 789,
      'unitTester.array': ['hello', 'world'],
      'unitTester.obj': {
        important: 'setting'
      }
    });
    setTimeout(() => {
      console.info(app.config);
      expect(app.config.unitTest).to.equal(false);
      expect(app.config.unitTester.secondLevel).to.equal('is not true');
      expect(app.config.unitTester.number).to.equal(789);
      expect(app.config.unitTester.array).to.deep.equal(['hello', 'world']);
      expect(app.config.unitTester.obj.important).to.equal('setting');
      expect(app.config.unitTester.obj['789']).to.be.undefined;
      done();
    }, 500);
  });

  it('sendConfigUpdate: register for updates', done => {
    updateNotifier.subscribeToUpdates(update => {
      expect(app.config.getNotified).to.equal('now!');
      expect(update.getNotified).to.equal('now!');
      done();
    });
    updateNotifier.sendConfigUpdate({
      getNotified: 'now!'
    });
  });
});
