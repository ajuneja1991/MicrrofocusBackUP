const shared = require('../helpers/shared');
const supertest = require('supertest');
const testData = require('../mockData');
const { clone } = require('ramda');
const { randomUUID } = require('crypto');
const mockData = JSON.parse(JSON.stringify(testData));
const request = supertest.agent(shared.exploreTestURL);

const loginURL = '/rest/v2/settings/definition/';
const apiSettingsDefinition = '/rest/v2/settings/definition/';
const adminLogin = shared.tenant.email;
const adminPasswd = shared.tenant.password;

const nonAdminUser = {
  login: `${randomUUID()}@microfocus.com`,
  password: 'Rio@02'
};

describe('Setting definition get/set operations (admin user)', () => {
  it('Login admin', done => {
    shared.login(request, loginURL, adminLogin, adminPasswd, done);
  });

  it('Create setting definition, get by id, update by id', async () => {
    // Create settings
    let res = await request.post(apiSettingsDefinition).send(mockData.settings).set('X-Secure-Modify-Token', shared.secureModifyToken());
    expect(res.status).to.equal(200);
    expect(res.body.data[0].id).to.be.equal(mockData.settings[0].id);
    expect(res.body.data[0].tenant).to.be.undefined;
    expect(res.body.data[0].label).to.be.undefined;
    expect(res.body.data[0].description).to.be.undefined;
    expect(res.body.data[0].scope).to.be.undefined;
    expect(res.body.data[0].section).to.be.undefined;
    expect(res.body.data[0].defaultValue).to.be.undefined;
    expect(res.body.data[0].options).to.be.undefined;

    // Get setting by id
    res = await request.get(`${apiSettingsDefinition}${mockData.settings[1].id}`);
    expect(res.status).to.equal(200);
    expect(res.body.data.id).to.be.equal(mockData.settings[1].id);
    expect(res.body.data.tenant).to.be.undefined;
    expect(res.body.data.label).to.deep.equal({ l10n: 'dateFormat.label', default: 'Date Format' });
    expect(res.body.data.description).to.deep.equal({ l10n: 'dateFormat.description', default: 'Specify date format value' });
    expect(res.body.data.scope).to.equal('General settings');
    expect(res.body.data.section).to.deep.equal({ l10n: 'dateFormat.section', default: 'Date & Time' });
    expect(res.body.data.defaultValue).to.deep.equal({ value: 'DD-MM-YYYY' });
    expect(res.body.data.options).to.deep.equal({ type: 'date', level: 'user' });

    // Update setting by id
    const settingsObjClone = clone(mockData.settings[1]);
    settingsObjClone.defaultValue = { value: 'YYYY-MM-DD' };
    res = await request.put(`${apiSettingsDefinition}${settingsObjClone.id}`).send({ defaultValue: settingsObjClone.defaultValue }).set('X-Secure-Modify-Token', shared.secureModifyToken());
    expect(res.status).to.equal(200);
    expect(res.body.message).to.equal('OK');

    // Update should create setting if setting does not exist
    res = await request.put(`${apiSettingsDefinition}newSetting`).send(settingsObjClone).set('X-Secure-Modify-Token', shared.secureModifyToken());
    expect(res.status).to.equal(200);
    expect(res.body.data).to.deep.equal({ id: 'newSetting' });

    // Get all settings
    res = await request.get(`${apiSettingsDefinition}`);
    expect(res.status).to.equal(200);
    // during web to pdf server start, we also create a setting for web to pdf proxy url (therefore 3 settings created here and 1 from there)
    expect(res.body.data.length).to.equal(4);
    const data = res.body.data;
    const updatedSetting = data.filter(setting => setting.id === settingsObjClone.id)[0];
    expect(updatedSetting.tenant).to.be.undefined;
    expect(updatedSetting.scope).to.deep.equal(settingsObjClone.scope);
    expect(updatedSetting.description).to.deep.equal(settingsObjClone.description);
    expect(updatedSetting.label).to.deep.equal(settingsObjClone.label);
    expect(updatedSetting.section).to.deep.equal(settingsObjClone.section);
    expect(updatedSetting.defaultValue).to.deep.equal(settingsObjClone.defaultValue);
    const newCreatedSetting = data.filter(setting => setting.id === 'newSetting')[0];
    expect(newCreatedSetting.tenant).to.be.undefined;

    // Duplicate insert should return error
    res = await request.post(apiSettingsDefinition).send(mockData.settings).set('X-Secure-Modify-Token', shared.secureModifyToken());
    expect(res.body.error).to.equal(true);
    expect(res.body.message).to.include.oneOf(['duplicate key value violates unique constraint "bvdExploreSettings_pkey"', 'ORA-00001: unique constraint']);
  });

  // Cleanup
  it('Delete setting definitions', done => {
    shared.deleteItems(request, apiSettingsDefinition, [...mockData.settings, { id: 'newSetting' }], done);
  });

  it('logout', done => {
    shared.logout(request, done);
  });
});

describe('Setting definition get/set operations (non admin user)', () => {
  it('Login admin', done => {
    shared.login(request, loginURL, adminLogin, adminPasswd, done);
  });

  it('create setting definition', async () => {
    const res = await request.post(apiSettingsDefinition).send(mockData.settings[0]).set('X-Secure-Modify-Token', shared.secureModifyToken());
    expect(res.status).to.equal(200);
  });

  it('logout', done => {
    shared.logout(request, done);
  });

  it('non admin login', done => {
    shared.login(request, loginURL, nonAdminUser.login, nonAdminUser.password, done);
  });

  it('get all, get by id, update by id, delete by id', async () => {
    // get all
    let res = await request.get(`${apiSettingsDefinition}`);
    expect(res.status).to.equal(200);
    expect(res.body.data.length).to.equal(2);
    expect(res.body.data[1].id).to.equal(mockData.settings[0].id);
    expect(res.body.data[1].tenant).to.be.undefined;

    // get by id
    res = await request.get(`${apiSettingsDefinition}${mockData.settings[0].id}`);
    expect(res.status).to.equal(200);
    expect(res.body.data.id).to.equal(mockData.settings[0].id);
    expect(res.body.data.label).to.deep.equal(mockData.settings[0].label);
    expect(res.body.data.description).to.deep.equal(mockData.settings[0].description);
    expect(res.body.data.scope).to.deep.equal(mockData.settings[0].scope);
    expect(res.body.data.section).to.equal(mockData.settings[0].section);
    expect(res.body.data.options).to.deep.equal({ ...mockData.settings[0].options, level: 'user' });
    expect(res.body.data.defaultValue).to.deep.equal(mockData.settings[0].defaultValue);

    // update by id
    res = await request.put(`${apiSettingsDefinition}${mockData.settings[0].id}`).send({ defaultValue: { value: 'Australia/Sydney' }}).set('X-Secure-Modify-Token', shared.secureModifyToken());
    expect(res.status).to.equal(403);
    expect(res.body.message).to.equal('Forbidden');

    // delete by id
    res = await request.delete(`${apiSettingsDefinition}${mockData.settings[0].id}`).set('X-Secure-Modify-Token', shared.secureModifyToken());
    expect(res.status).to.equal(403);
    expect(res.body.message).to.equal('Forbidden');
  });

  it('logout non admin', done => {
    shared.logout(request, done);
  });

  // Cleanup
  it('admin login', done => {
    shared.login(request, loginURL, adminLogin, adminPasswd, done);
  });

  it('delete setting definition by id', async () => {
    let res = await request.delete(`${apiSettingsDefinition}${mockData.settings[0].id}`).set('X-Secure-Modify-Token', shared.secureModifyToken());
    expect(res.status).to.equal(200);
    expect(res.body.message).to.equal(`Setting ${mockData.settings[0].id} deleted`);

    // delete for a non existing setting
    res = await request.delete(`${apiSettingsDefinition}${mockData.settings[1].id}`).set('X-Secure-Modify-Token', shared.secureModifyToken());

    expect(res.status).to.equal(404);
    expect(res.body.message).to.equal('Not found');
    expect(res.body.additionalInfo[0]).to.equal(`Setting definition not found: ${mockData.settings[1].id}`);
    // get settings
    res = await request.get(`${apiSettingsDefinition}`);
    expect(res.status).to.equal(200);
    // webToPDFProxyURL setting isn't deleted
    expect(res.body.data.length).to.equal(1);
  });

  it('logout admin', done => {
    shared.logout(request, done);
  });
});

// add tests for validator
describe('Testing the setting definition validator', () => {
  it('Login admin', done => {
    shared.login(request, loginURL, adminLogin, adminPasswd, done);
  });

  it('Validate the presence of all mandatory fields', async () => {
    const settingsObj = {
      description: {
        l10n: 'timezone.description',
        default: 'Specify timezone value'
      }
    };
    const res = await request.post(apiSettingsDefinition).send(settingsObj).set('X-Secure-Modify-Token', shared.secureModifyToken());
    expect(res._body.error).to.equal(true);
    expect(res._body.message).to.equal('Invalid setting specification: Id can\'t be blank,Label can\'t be blank,Scope can\'t be blank,Section can\'t be blank,Default value value can\'t be blank,Options can\'t be blank,Options type can\'t be blank');
  });

  it('Do not allow setting creation when id has space', async () => {
    const settingsObjClone = clone(mockData.settings[1]);
    settingsObjClone.id = ' Invalid id ';
    const res = await request.post(apiSettingsDefinition).send(settingsObjClone).set('X-Secure-Modify-Token', shared.secureModifyToken());
    expect(res._body.error).to.equal(true);
    expect(res._body.message).to.equal('Setting id contains whitespace:  Invalid id ');
  });

  it('Check for correct types', async () => {
    const settingsObjClone = clone(mockData.settings[1]);
    settingsObjClone.id = {
      value: 'xyz'
    };
    settingsObjClone.defaultValue = 'defaultValue';
    settingsObjClone.options = 'options';

    const res = await request.post(apiSettingsDefinition).send(settingsObjClone).set('X-Secure-Modify-Token', shared.secureModifyToken());
    expect(res._body.error).to.equal(true);
    expect(res._body.message).to.equal('Invalid setting specification: Id must be of type string,Default value must be of type object,Default value value can\'t be blank,Options must be of type object,Options type can\'t be blank');
  });

  it('logout', done => {
    shared.logout(request, done);
  });
});
