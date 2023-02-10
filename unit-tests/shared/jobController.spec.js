/* eslint-disable camelcase */ // variables with underscore are there at more than 20 places

const { randomUUID } = require('crypto');
const tenantData = {
  name: randomUUID(),
  description: 'tenant description',
  apiKey: randomUUID().replace(/-/g, ''),
  default: false
};

let app;

describe('jobController tests', () => {
  before(function(done) {
    /* set the timeout for mocha tests to 10sec */
    this.timeout(10000);
    // eslint-disable-next-line node/global-require
    const db = require('../helpers/db');
    db.cleanAll(err => {
      if (err) {
        return done(err);
      }
      // eslint-disable-next-line node/global-require
      app = require('../../../shared/app');
      app.controllers.bvdTenant.create(tenantData, (err, doc) => {
        if (err) {
          return done(err);
        }
        // eslint-disable-next-line no-unused-vars
        const tenant = doc;
        return done();
      });
    });
  });

  after(function(done) {
    /* set the timeout for mocha tests to 10sec */
    this.timeout(10000);
    app.controllers.bvdTenant.remove({
      name: tenantData.name
    }, err => {
      if (err) {
        return done(err);
      }

      // eslint-disable-next-line node/global-require
      const db = require('../helpers/db');

      db.cleanAll(err => {
        if (err) {
          return done(err);
        }

        return done(); // tell mocha that the tear down code is finished
      });
    });
  });

  it('jobController: inserting a job with username as null should return error', done => {
    const data = {
      jobId: randomUUID(),
      login: null,
      timeZone: 'Asia/Kolkata',
      bvdUrl: '',
      suiteUrl: 'https://uis.bbntc.swinfra.net:8888',
      schedule: '* * * * *',
      jobRunTime: '2021-07-08 12:00:00',
      data: {
        subject: 'Welcome dashboard',
        to: 'abcd@gmail.com, efgh@gmail.com',
        bcc: 'xyz@abc.com',
        cc: '1234@abc.com',
        body: 'Weekly Report'
      }
    };
    app.controllers.job.create(data, err => {
      if (err) {
        expect(err).to.be.equal('Failed to create the job');
        return done();
      }
      return done(new Error('Test failed:inserted job with username as null'));
    });
  });

  it('jobController: insert, get and delete a job', done => {
    const job = {
      jobId: randomUUID(),
      login: 'admin',
      timeZone: 'Asia/Kolkata',
      bvdUrl: 'https://uis.bbntc.swinfra.net:8888/reporting/#/show/Welcome',
      suiteUrl: 'https://uis.bbntc.swinfra.net:8888',
      schedule: '* * * * *',
      jobRunTime: '2021-07-08 12:00:00',
      data: {
        subject: 'Welcome dashboard',
        to: 'abcd@gmail.com, efgh@gmail.com',
        bcc: 'xyz@abc.com',
        cc: '1234@abc.com',
        body: 'Weekly Report'
      }
    };
    app.controllers.job.create(job, (err, res) => {
      if (err) {
        return done(err);
      }
      expect(res).to.be.not.undefined;
      app.controllers.job.status({ jobId: job.jobId }, (err, reply) => {
        if (err) {
          return done(err);
        }
        expect(reply.data).not.equal(job.data);
        app.controllers.job.delete({ jobId: res }, (err, result) => {
          if (err) {
            return done(err);
          }
          expect(result).to.be.equal(200);
          return done();
        });
      });
    });
  });

  it('jobController: get all the jobs', done => {
    app.controllers.job.getAll({}, false, (err, res) => {
      if (err) {
        return done(err);
      }
      expect(res).not.equal(null);
      return done();
    });
  });

  it('jobController: get status of single job which does not exist', done => {
    const jobId = randomUUID();
    app.controllers.job.status({ jobId }, (err, res) => {
      if (err) {
        return done(err);
      }
      expect(res).to.be.equal(undefined);
      return done();
    });
  });

  it('jobController: try to delete a job which does not exist', done => {
    const jobId = randomUUID();
    app.controllers.job.delete({ jobId }, (err, res) => {
      if (err) {
        return done(err);
      }
      expect(res).to.be.equal(404);
      return done();
    });
  });

  it('jobController: get job to be executed', done => {
    const job = {
      jobId: randomUUID(),
      login: 'admin',
      timeZone: 'Asia/Kolkata',
      bvdUrl: 'https://uis.bbntc.swinfra.net:8888/reporting/#/show/Welcome',
      suiteUrl: 'https://uis.bbntc.swinfra.net:8888',
      schedule: '* * * * *',
      jobRunTime: '1990-07-08 12:00:00', // this job will be returned first as its the oldest job in table
      data: {
        subject: 'Welcome dashboard',
        to: 'abcd@gmail.com, efgh@gmail.com',
        bcc: 'xyz@abc.com',
        cc: '1234@abc.com',
        body: 'Weekly Report'
      }
    };
    app.controllers.job.create(job, (err, res) => {
      if (err) {
        return done(err);
      }
      if (res) {
        app.controllers.job.getJobToBeExecuted((error, result) => {
          if (error) {
            return done(error);
          }
          expect(result).to.be.not.undefined;
          expect(result.jobId).to.be.equal(job.jobId);
          return done();
        });
      }
    });
  });

  it('jobController: update errorCount of a job', done => {
    const job = {
      jobId: randomUUID(),
      login: 'admin',
      timeZone: 'Asia/Kolkata',
      bvdUrl: 'https://uis.bbntc.swinfra.net:8888/reporting/#/show/Welcome',
      suiteUrl: 'https://uis.bbntc.swinfra.net:8888',
      schedule: '* * * * *',
      jobRunTime: '2000-07-08 12:00:00', // placeholder value
      data: {
        subject: 'Welcome dashboard',
        to: 'abcd@gmail.com, efgh@gmail.com',
        bcc: 'xyz@abc.com',
        cc: '1234@abc.com',
        body: 'Weekly Report'
      }
    };

    app.controllers.job.create(job, (err, res) => {
      if (err) {
        return done(err);
      }
      expect(res).to.be.equal(job.jobId);
      const noOfError = 3;
      const updater = { executor: 'NULL',
        errorCount: noOfError };
      app.controllers.job.updateJob({ jobId: job.jobId }, updater, (error, result) => {
        if (error) {
          return done(error);
        }
        expect(result.errorCount).to.be.equal(updater.errorCount);
        return done();
      });
    });
  });

  it('jobController: update a job', done => {
    const job = {
      jobId: randomUUID(),
      login: 'admin',
      timeZone: 'Asia/Kolkata',
      bvdUrl: 'https://uis.bbntc.swinfra.net:8888/reporting/#/show/Welcome',
      suiteUrl: 'https://uis.bbntc.swinfra.net:8888',
      schedule: '* * * * *',
      jobRunTime: '2000-07-08 12:00:00', // placeholder value
      data: {
        subject: 'Welcome dashboard',
        to: 'abcd@gmail.com, efgh@gmail.com',
        bcc: 'xyz@abc.com',
        cc: '1234@abc.com',
        body: 'Weekly Report'
      }
    };

    app.controllers.job.create(job, (err, res) => {
      if (err) {
        return done(err);
      }
      expect(res).to.be.equal(job.jobId);
      const updater = {
        jobRunTime: '2000-07-08 12:00:00',
        executor: 'NULL',
        lastRunTime: '2000-07-08 12:00:00',
        errorCount: '0'
      };
      app.controllers.job.updateJob({ jobId: job.jobId }, updater, (error, result) => {
        if (error) {
          return done(error);
        }
        expect(result.lastRunTime).to.be.equal(updater.lastRunTime);
        return done();
      });
    });
  });

  it('jobController: book a job', done => {
    const job = {
      jobId: randomUUID(),
      login: 'admin',
      timeZone: 'Asia/Kolkata',
      bvdUrl: 'https://uis.bbntc.swinfra.net:8888/reporting/#/show/Welcome',
      suiteUrl: 'https://uis.bbntc.swinfra.net:8888',
      schedule: '* * * * *',
      jobRunTime: '2000-07-08 12:00:00', // placeholder value
      data: {
        subject: 'Welcome dashboard',
        to: 'abcd@gmail.com, efgh@gmail.com',
        bcc: 'xyz@abc.com',
        cc: '1234@abc.com',
        body: 'Weekly Report'
      }
    };

    app.controllers.job.create(job, (err, res) => {
      if (err) {
        return done(err);
      }
      expect(res).to.be.equal(job.jobId);
      const processId = 1234;
      app.controllers.job.bookJob(job.jobId, processId, (error, result) => {
        if (error) {
          return done(error);
        }
        expect(result).to.be.equal('booked');
        return done();
      });
    });
  });

  it('jobController: delete multiple jobs', done => {
    const job = {
      jobId: randomUUID(),
      login: 'admin',
      timeZone: 'Asia/Kolkata',
      bvdUrl: 'https://uis.bbntc.swinfra.net:8888/reporting/#/show/Welcome',
      suiteUrl: 'https://uis.bbntc.swinfra.net:8888',
      schedule: '* * * * *',
      jobRunTime: '2000-07-08 12:00:00', // placeholder value
      data: {
        subject: 'Welcome dashboard',
        to: 'abcd@gmail.com, efgh@gmail.com',
        bcc: 'xyz@abc.com',
        cc: '1234@abc.com',
        body: 'Weekly Report'
      }
    };
    const jobIds = [job.jobId];
    app.controllers.job.create(job, (err, res) => {
      if (err) {
        return done(err);
      }
      expect(res).to.be.equal(job.jobId);
      job.jobId = randomUUID();
      jobIds.push(job.jobId);
      app.controllers.job.create(job, (err, result) => {
        if (err) {
          return done(err);
        }
        expect(result).to.be.equal(job.jobId);
        app.controllers.job.deleteMultipleJobs(jobIds, {}, (err, delRes) => {
          if (err) {
            return done(err);
          }
          expect(delRes).to.be.equal(200);
          app.controllers.job.status({ jobId: job.jobId }, (err, statusRes) => {
            if (err) {
              return done(err);
            }
            expect(statusRes).to.be.equal(undefined);
            return done();
          });
        });
      });
    });
  });

  it('jobController: delete multiple jobs with one of them non existing', done => {
    const job = {
      jobId: randomUUID(),
      login: 'user1',
      timeZone: 'Asia/Kolkata',
      tenant: 'Provider',
      bvdUrl: 'https://uis.bbntc.swinfra.net:8888/reporting/#/show/Welcome',
      suiteUrl: 'https://uis.bbntc.swinfra.net:8888',
      schedule: '* * * * *',
      jobRunTime: '2000-07-08 12:00:00', // placeholder value
      data: {
        subject: 'Welcome dashboard',
        to: 'abcd@gmail.com, efgh@gmail.com',
        bcc: 'xyz@abc.com',
        cc: '1234@abc.com',
        body: 'Weekly Report'
      }
    };
    const jobIds = [job.jobId];
    app.controllers.job.create(job, (err, res) => {
      if (err) {
        return done(err);
      }
      expect(res).to.be.equal(job.jobId);
      job.jobId = randomUUID();
      jobIds.push(job.jobId);
      jobIds.push('abcdef');
      app.controllers.job.create(job, (err, result) => {
        if (err) {
          return done(err);
        }
        expect(result).to.be.equal(job.jobId);
        const query = {
          login: 'user1',
          tenant: 'Provider'
        };
        app.controllers.job.deleteMultipleJobs(jobIds, query, err => {
          if (err) {
            expect(err.message).to.be.equal('404');
            return done();
          }
        });
      });
    });
  });
});
