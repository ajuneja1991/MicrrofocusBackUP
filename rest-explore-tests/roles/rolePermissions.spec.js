const shared = require('../helpers/shared');
const supertest = require('supertest');
const _ = require('lodash');
const testData = require('../mockData');
const mockData = JSON.parse(JSON.stringify(testData));
const request = supertest.agent(shared.exploreTestURL);
const adminLogin = shared.tenant.email;
const adminPasswd = shared.tenant.password;
const apiRole = '/rest/v2/role/';
const loginURL = '/rest/v2/pageGroups';

const deleteRole = async id => {
  const response = await request.delete(apiRole.concat(id))
    .set('X-Secure-Modify-Token', shared.secureModifyToken())
    .expect(200);
  expect(response.body).to.equal(1);
};

const getRole = async () => {
  const response = await request.get(apiRole)
    .expect(200);
  expect(response.body.role_list.role).to.not.equal(null);
  return response.body.role_list.role;
};

describe('Foundation Roles Menu Entries Permissions TestSuite', () => {
  it('Login admin', done => {
    shared.login(request, loginURL, adminLogin, adminPasswd, done);
  });

  it('Create Foundation Role Having Full Control Permission Correct Format', async () => {
    const res = await request.post(apiRole)
      .send(mockData.roleWithPermission)
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .expect(200);

    const roles = await getRole();
    const currentRole = roles.filter(role => role.id === res.body.role.id);
    expect(currentRole.length).to.equal(1);
    currentRole[0].id = undefined;
    expect(_.isEqual(mockData.roleWithPermission, currentRole[0]));

    await deleteRole(res.body.role.id);
  });

  it('Create Foundation Role Fails Having Full Control Permission Wrong Format', done => {
    mockData.roleWithPermission.permission = [{
      // eslint-disable-next-line camelcase
      operation_key: 'FullControl',
      // eslint-disable-next-line camelcase
      resource_key: 'menu<>All-'
    }];

    request.post(apiRole)
      .send(mockData.roleWithPermission)
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.status).to.equal(400);
        expect(res.body.role).to.equal(undefined);
        done();
      });
  });

  it('Create Foundation Role Having View Permission Correct Format', async () => {
    mockData.roleWithPermission.permission = [{
      // eslint-disable-next-line camelcase
      operation_key: 'View',
      // eslint-disable-next-line camelcase
      resource_key: 'menu<>Category-All'
    }];

    const res = await request.post(apiRole)
      .send(mockData.roleWithPermission)
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .expect(200);

    const roles = await getRole();
    const currentRole = roles.filter(role => role.id === res.body.role.id);
    expect(currentRole.length).to.equal(1);
    currentRole[0].id = undefined;
    expect(_.isEqual(mockData.roleWithPermission, currentRole[0]));

    await deleteRole(res.body.role.id);
  });

  it('Create Foundation Fails Role Having View Permission Wrong Format', done => {
    mockData.roleWithPermission.permission = [{
      // eslint-disable-next-line camelcase
      operation_key: 'View',
      // eslint-disable-next-line camelcase
      resource_key: 'menu<>Item-'
    }];

    request.post(apiRole)
      .send(mockData.roleWithPermission)
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.status).to.equal(400);
        expect(res.body.role).to.equal(undefined);
        done();
      });
  });

  it('Create Foundation Role Having LandingPage Permission Correct Format', async () => {
    mockData.roleWithPermission.permission = [{
      // eslint-disable-next-line camelcase
      operation_key: 'LandingPage',
      // eslint-disable-next-line camelcase
      resource_key: 'menu<>Item-All'
    }];

    const res = await request.post(apiRole)
      .send(mockData.roleWithPermission)
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .expect(200);

    const roles = await getRole();
    const currentRole = roles.filter(role => role.id === res.body.role.id);
    expect(currentRole.length).to.equal(1);
    currentRole[0].id = undefined;
    expect(_.isEqual(mockData.roleWithPermission, currentRole[0]));

    await deleteRole(res.body.role.id);
  });

  it('Create Foundation Role Fails Having LandingPage Permission Wrong Format', done => {
    mockData.roleWithPermission.permission = [{
      // eslint-disable-next-line camelcase
      operation_key: 'LandingPage',
      // eslint-disable-next-line camelcase
      resource_key: 'menu<>Category-Ops'
    }];

    request.post(apiRole)
      .send(mockData.roleWithPermission)
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.status).to.equal(400);
        expect(res.body.role).to.equal(undefined);
        done();
      });
  });

  it('Create Foundation Role Fails Having Set Multiple LandingPage Permission', done => {
    mockData.roleWithPermission.permission = [{
      // eslint-disable-next-line camelcase
      operation_key: 'LandingPage',
      // eslint-disable-next-line camelcase
      resource_key: 'menu<>Item-Ops1'
    },
    {
      // eslint-disable-next-line camelcase
      operation_key: 'LandingPage',
      // eslint-disable-next-line camelcase
      resource_key: 'menu<>Item-Ops2'
    }];

    request.post(apiRole)
      .send(mockData.roleWithPermission)
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.status).to.equal(400);
        expect(res.body.role).to.equal(undefined);
        done();
      });
  });

  it('Create Foundation Role Have Not Defined Permissions', done => {
    mockData.roleWithPermission.permission = undefined;

    request.post(apiRole)
      .send(mockData.roleWithPermission)
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.status).to.equal(400);
        expect(res.body.error.message).to.equal('Permission set given is not valid');
        done();
      });
  });

  it('Create Foundation Fails Role Having Action Permission - Wrong Format', done => {
    mockData.roleWithActionPermission.permission = [
      {
        // eslint-disable-next-line camelcase
        operation_key: 'Create',
        // eslint-disable-next-line camelcase
        resource_key: 'default_action<>MemberOfAny'
      },
      {
        // eslint-disable-next-line camelcase
        operation_key: 'View',
        // eslint-disable-next-line camelcase
        resource_key: 'menu<>Item-AnyItem'
      }
    ];

    request.post(apiRole)
      .send(mockData.roleWithActionPermission)
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.status).to.equal(400);
        expect(res.body.role).to.equal(undefined);
        done();
      });
  });

  it('Create Foundation Fails Role Having Action Permission - Correct Format', async () => {
    mockData.roleWithActionPermission.permission = [
      {
        // eslint-disable-next-line camelcase
        operation_key: 'Create',
        // eslint-disable-next-line camelcase
        resource_key: 'default_action<>MemberOfAnyGroup'
      },
      {
        // eslint-disable-next-line camelcase
        operation_key: 'View',
        // eslint-disable-next-line camelcase
        resource_key: 'menu<>Item-AnyItem'
      }
    ];

    const res = await request.post(apiRole)
      .send(mockData.roleWithActionPermission)
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .expect(200);

    const roles = await getRole();
    const currentRole = roles.filter(role => role.id === res.body.role.id);
    expect(currentRole.length).to.equal(1);
    currentRole[0].id = undefined;
    expect(_.isEqual(mockData.roleWithActionPermission, currentRole[0]));

    await deleteRole(res.body.role.id);
  });

  it('Create Foundation Fails Role Having Action Permission for members of a certain group - Wrong Format', done => {
    mockData.roleWithActionPermission.permission = [{
      // eslint-disable-next-line camelcase
      operation_key: 'View',
      // eslint-disable-next-line camelcase
      resource_key: 'default_action<>Grouppagegroup_test_two'
    }];

    request.post(apiRole)
      .send(mockData.roleWithActionPermission)
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.status).to.equal(400);
        expect(res.body.role).to.equal(undefined);
        done();
      });
  });

  it('Create Foundation Fails Role Having Action Permission for members of a certain group - Correct Format', async () => {
    mockData.roleWithActionPermission.permission = [{
      // eslint-disable-next-line camelcase
      operation_key: 'View',
      // eslint-disable-next-line camelcase
      resource_key: 'default_action<>Group-pagegroup_test_two'
    }];

    const res = await request.post(apiRole)
      .send(mockData.roleWithActionPermission)
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .expect(200);

    const roles = await getRole();
    const currentRole = roles.filter(role => role.id === res.body.role.id);
    expect(currentRole.length).to.equal(1);
    currentRole[0].id = undefined;
    expect(_.isEqual(mockData.roleWithActionPermission, currentRole[0]));

    await deleteRole(res.body.role.id);
  });

  it('Create Foundation Fails Role Having Action Permission for assigning pages - Wrong Format', async () => {
    mockData.roleWithActionPermission.permission = [{
      // eslint-disable-next-line camelcase
      operation_key: 'AssignPages',
      // eslint-disable-next-line camelcase
      resource_key: 'default_action<>MemberOfAnyGroup'
    }];

    const res = await request.post(apiRole)
      .send(mockData.roleWithActionPermission)
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .expect(200);

    const roles = await getRole();
    const currentRole = roles.filter(role => role.id === res.body.role.id);
    expect(currentRole.length).to.equal(1);
    currentRole[0].id = undefined;
    expect(_.isEqual(mockData.roleWithActionPermission, currentRole[0]));

    await deleteRole(res.body.role.id);
  });

  it('Create Foundation Fails Role Having Action Permission for assigning pages - Correct Format', async () => {
    mockData.roleWithActionPermission.permission = [{
      // eslint-disable-next-line camelcase
      operation_key: 'AssignPages',
      // eslint-disable-next-line camelcase
      resource_key: 'default_action<>Group-pagegroup_test_two'
    }];

    const res = await request.post(apiRole)
      .send(mockData.roleWithActionPermission)
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .expect(200);

    const roles = await getRole();
    const currentRole = roles.filter(role => role.id === res.body.role.id);
    expect(currentRole.length).to.equal(1);
    currentRole[0].id = undefined;
    expect(_.isEqual(mockData.roleWithActionPermission, currentRole[0]));

    await deleteRole(res.body.role.id);
  });
});

