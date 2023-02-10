const shared = require('../helpers/shared');
const supertest = require('supertest');
const testData = require('../mockData');
const { randomUUID } = require('crypto');
const { clone } = require('ramda');
const mockData = JSON.parse(JSON.stringify(testData));
const request = supertest.agent(shared.exploreTestURL);

const loginURL = '/rest/v2/settings/definition/';
const apiSettingsValue = '/rest/v2/settings/value/';
const adminLogin = shared.tenant.email;
const adminPasswd = shared.tenant.password;

const nonAdminUser = {
  login: `${randomUUID()}@microfocus.com`,
  password: 'Rio@02'
};

describe('Setting value get/set operations (admin user)', () => {
  it('Login admin', done => {
    shared.login(request, loginURL, adminLogin, adminPasswd, done);
  });

  it('Get by id, update by id', async () => {
    // update for setting value when setting definition is not present
    let res = await request.put(`${apiSettingsValue}${mockData.settings[0].id}/tenant`).send({ value: 'Australia/Sydney' }).set('X-Secure-Modify-Token', shared.secureModifyToken());
    expect(res.body.error).to.equal(true);
    expect(res.body.message).to.equal('Not found');

    // Create settings
    res = await request.post(loginURL).send(mockData.settings).set('X-Secure-Modify-Token', shared.secureModifyToken());
    expect(res.status).to.equal(200);

    // Get setting value by id
    res = await request.get(`${apiSettingsValue}${mockData.settings[0].id}/tenant`);
    expect(res.status).to.equal(404);
    expect(res.body.error).to.equal(true);
    expect(res.body.message).to.equal('Not found');
    res = await request.get(`${apiSettingsValue}${mockData.settings[0].id}/user`);
    expect(res.status).to.equal(404);
    expect(res.body.error).to.equal(true);
    expect(res.body.message).to.equal('Not found');

    // Update setting value by id and get setting
    res = await request.put(`${apiSettingsValue}${mockData.settings[0].id}/tenant`).send({ value: 'Australia/Sydney' }).set('X-Secure-Modify-Token', shared.secureModifyToken());
    expect(res.status).to.equal(200);
    expect(res.body.message).to.equal('OK');
    res = await request.get(`${apiSettingsValue}${mockData.settings[0].id}/tenant`);
    expect(res.status).to.equal(200);
    expect(res.body.error).to.equal(false);
    expect(res.body.data).to.deep.equal({ value: 'Australia/Sydney' });
    // get settings (tenant specific setting should take preference over setting definition)
    res = await request.get(`${apiSettingsValue}`);
    expect(res.status).to.equal(200);
    expect(res.body.error).to.equal(false);
    expect(res.body.data).to.deep.equal({ WEB_TO_PDF_PROXY_URL: { value: '' }, dateFormat: { value: 'DD-MM-YYYY' }, tz: { value: 'Australia/Sydney' }});
    res = await request.put(`${apiSettingsValue}${mockData.settings[0].id}/user`).send({ value: 'Africa/Durban' }).set('X-Secure-Modify-Token', shared.secureModifyToken());
    expect(res.status).to.equal(200);
    expect(res.body.message).to.equal('OK');
    res = await request.get(`${apiSettingsValue}${mockData.settings[0].id}/user`);
    expect(res.status).to.equal(200);
    expect(res.body.error).to.equal(false);
    expect(res.body.data).to.deep.equal({ value: 'Africa/Durban' });
    // get settings (user specific setting should take preference over tenant specific setting)
    res = await request.get(`${apiSettingsValue}`);
    expect(res.status).to.equal(200);
    expect(res.body.error).to.equal(false);
    expect(res.body.data).to.deep.equal({ WEB_TO_PDF_PROXY_URL: { value: '' }, dateFormat: { value: 'DD-MM-YYYY' }, tz: { value: 'Africa/Durban' }});
  });

  // Cleanup
  it('Delete setting definitions', done => {
    shared.deleteItems(request, loginURL, mockData.settings, done);
  });

  it('logout', done => {
    shared.logout(request, done);
  });
});

describe('Setting value get/set operations (non admin user)', () => {
  it('Login admin', done => {
    shared.login(request, loginURL, adminLogin, adminPasswd, done);
  });

  it('create setting definition', async () => {
    const clonedSettings = clone(mockData.settings);
    clonedSettings[0].options.level = 'user';
    clonedSettings[1].options.level = 'tenant';
    const res = await request.post(loginURL).send(clonedSettings).set('X-Secure-Modify-Token', shared.secureModifyToken());
    expect(res.status).to.equal(200);
  });

  it('logout', done => {
    shared.logout(request, done);
  });

  it('non admin login', done => {
    shared.login(request, loginURL, nonAdminUser.login, nonAdminUser.password, done);
  });

  it('get all, update by id', async () => {
    // get all
    let res = await request.get(`${apiSettingsValue}`);
    expect(res.status).to.equal(200);
    expect(res.body.error).to.equal(false);
    expect(res.body.data).to.have.property('tz');
    expect(res.body.data).to.have.property('dateFormat');

    // update by id (tenant level)
    res = await request.put(`${apiSettingsValue}${mockData.settings[0].id}/tenant`).send({ value: 'Australia/Sydney' }).set('X-Secure-Modify-Token', shared.secureModifyToken());
    expect(res.status).to.equal(403);
    expect(res.body.message).to.equal('Forbidden');

    // update by id (user level) fail scenario
    res = await request.put(`${apiSettingsValue}${mockData.settings[1].id}/user`).send({ value: 'MM-DD-YYYY' }).set('X-Secure-Modify-Token', shared.secureModifyToken());
    expect(res.status).to.equal(403);
    expect(res.body.message).to.equal('Forbidden');
    expect(res.body.additionalInfo[0]).to.equal('Cannot set user level preference for setting: dateFormat');

    // update by id (user level)
    res = await request.put(`${apiSettingsValue}${mockData.settings[0].id}/user`).send({ value: 'Africa/Durban' }).set('X-Secure-Modify-Token', shared.secureModifyToken());
    expect(res.status).to.equal(200);
    expect(res.body.message).to.equal('OK');

    // get user level preferences
    res = await request.get(`${apiSettingsValue}?level=user`);
    expect(res.status).to.equal(200);
    expect(res.body.error).to.equal(false);
    expect(res.body.data).to.not.have.property('dateFormat');
  });

  it('logout non admin', done => {
    shared.logout(request, done);
  });

  // Cleanup
  it('admin login', done => {
    shared.login(request, loginURL, adminLogin, adminPasswd, done);
  });

  it('delete setting definition by id', async () => {
    let res = await request.delete(`${loginURL}${mockData.settings[0].id}`).set('X-Secure-Modify-Token', shared.secureModifyToken());
    expect(res.status).to.equal(200);
    expect(res.body.message).to.equal(`Setting ${mockData.settings[0].id} deleted`);

    res = await request.delete(`${loginURL}${mockData.settings[1].id}`).set('X-Secure-Modify-Token', shared.secureModifyToken());
    expect(res.status).to.equal(200);
    expect(res.body.message).to.equal(`Setting ${mockData.settings[1].id} deleted`);

    // delete for a non existing setting
    res = await request.delete(`${loginURL}${mockData.settings[1].id}`).set('X-Secure-Modify-Token', shared.secureModifyToken());

    expect(res.status).to.equal(404);
    expect(res.body.message).to.equal('Not found');
    expect(res.body.additionalInfo[0]).to.equal(`Setting definition not found: ${mockData.settings[1].id}`);
    // get settings
    res = await request.get(`${loginURL}`);
    expect(res.status).to.equal(200);
    expect(res.body.data.length).to.equal(1);
  });

  it('logout admin', done => {
    shared.logout(request, done);
  });
});

// add tests for validator
describe('Testing the setting value validator', () => {
  it('Login admin', done => {
    shared.login(request, loginURL, adminLogin, adminPasswd, done);
  });

  it('Validate the presence of mandatory fields', async () => {
    let res = await request.put(`${apiSettingsValue}${mockData.settings[0].id}/user`).send({}).set('X-Secure-Modify-Token', shared.secureModifyToken());
    expect(res.body.error).to.equal(true);
    expect(res.body.message).to.equal('Invalid setting specification: Value can\'t be blank');
    res = await request.put(`${apiSettingsValue}${mockData.settings[0].id}/tenant`).send({ scope: 'General' }).set('X-Secure-Modify-Token', shared.secureModifyToken());
    expect(res.body.error).to.equal(true);
    expect(res.body.message).to.equal('Invalid setting specification: Value can\'t be blank');
    res = await request.put(`${apiSettingsValue}${mockData.settings[0].id}/tenant`).send({ value: 'Europe/Berlin' }).set('X-Secure-Modify-Token', shared.secureModifyToken());
    expect(res.body.error).to.equal(true);
    expect(res.body.message).to.equal('Not found');
  });

  it('logout', done => {
    shared.logout(request, done);
  });
});

// Tests for pending GET
describe('Receive update on setting value change', () => {
  it('Login admin', done => {
    shared.login(request, loginURL, adminLogin, adminPasswd, done);
  });

  it('Create setting definition', async () => {
    const clonedSetting = clone(mockData.settings[0]);
    clonedSetting.id = 'newTimezone';
    clonedSetting.options.level = 'user';
    const res = await request.post(loginURL).send(clonedSetting).set('X-Secure-Modify-Token', shared.secureModifyToken());
    expect(res.status).to.equal(200);
  });

  it('Call pending get, update by id, receive notification', async () => {
    setTimeout(async () => {
      /* Updating setting value in definition should trigger notification since there is a no tenant or user level prefernce for the same */
      const _res = await request.put(`${loginURL}newTimezone`).send({ defaultValue: { value: 'Asia/Calcutta' }}).set('X-Secure-Modify-Token', shared.secureModifyToken());
      expect(_res.status).to.equal(200);
      expect(_res.text).to.equal('OK');
    }, 0);
    // call notification api
    let res = await request.get(`${apiSettingsValue}newTimezone?onChange`);
    // should recieve previous value and current value
    expect(res.body).to.deep.equal({ id: 'newTimezone', previousValue: { value: 'UTC' }, currentValue: { value: 'Asia/Calcutta' }});
    setTimeout(async () => {
      /* Setting user level preference should trigger notification */
      const _res = await request.put(`${apiSettingsValue}newTimezone/user`).send({ value: 'Europe/Berlin' }).set('X-Secure-Modify-Token', shared.secureModifyToken());
      expect(_res.status).to.equal(200);
      expect(_res.text).to.equal('OK');
    }, 100);
    // call notification api
    res = await request.get(`${apiSettingsValue}newTimezone?onChange`);
    expect(res.body).to.deep.equal({ id: 'newTimezone', previousValue: { value: 'Asia/Calcutta' }, currentValue: { value: 'Europe/Berlin' }});

    res = await request.get(`${apiSettingsValue}newTimezone`);
    expect(res.status).to.equal(200);
    expect(res.body.data).to.deep.equal({ value: 'Europe/Berlin' });
  });

  // Cleanup
  it('delete setting definition by id', async () => {
    const res = await request.delete(`${loginURL}newTimezone`).set('X-Secure-Modify-Token', shared.secureModifyToken());
    expect(res.status).to.equal(200);
    expect(res.body.message).to.equal(`Setting newTimezone deleted`);
  });

  it('logout', done => {
    shared.logout(request, done);
  });
});

