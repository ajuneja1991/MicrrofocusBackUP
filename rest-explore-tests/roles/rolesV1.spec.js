const shared = require('../helpers/shared');
const supertest = require('supertest');
const testData = require('../mockData');
const mockData = JSON.parse(JSON.stringify(testData));
const request = supertest.agent(shared.exploreTestURL);
const adminLogin = shared.tenant.email;
const adminPasswd = shared.tenant.password;
const apiRole = '/rest/v1/role/';
const loginURL = '/rest/v1/pageGroups';
const async = require('async');

describe('Foundation Roles Test - V1', () => {
  it('Login admin', done => {
    shared.login(request, loginURL, adminLogin, adminPasswd, done);
  });

  it('Get Foundation role', done => {
    request.get(apiRole)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.status).to.equal(200);
        expect(res.body.role_list.role.length).to.equal(0);
        done();
      });
  });

  it('Create Foundation Role', done => {
    request.post(apiRole)
      .send(mockData.role)
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.status).to.equal(200);
        expect(res.body.role).to.not.equal(null);
        expect(res.body.role.name).to.equal('NOM_View_Role');

        request.get(apiRole.concat(res.body.role.id))
          .end((err, response) => {
            if (err) {
              return done(err);
            }
            expect(response.status).to.equal(200);
            expect(response.body).to.not.equal(null);
            expect(response.body.role.type).to.equal('foundation');
            expect(response.body.role.name).to.equal('NOM_View_Role');
            done();
          });
      });
  });

  it('Create Role with role name containing space', done => {
    request.post(apiRole)
      .send(mockData.invalidRole)
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.status).to.equal(400);
        done();
      });
  });

  it('Create Role with role name containing semi colon', done => {
    mockData.invalidRole.name = 'bvd;tester';
    request.post(apiRole)
      .send(mockData.invalidRole)
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.status).to.equal(400);
        done();
      });
  });

  it('Create Role with role name containing []', done => {
    mockData.invalidRole.name = 'bvd[]tester';
    request.post(apiRole)
      .send(mockData.invalidRole)
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.status).to.equal(400);
        done();
      });
  });

  it('Create Role with Type', done => {
    const data = {
      name: 'NewType',
      description: 'View role for foundation',
      permission: [],
      type: 'NonExistingType'
    };
    request.post(apiRole)
      .send(data)
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.status).to.equal(200);
        expect(res.body).to.not.equal(null);
        expect(res.body.role.type).to.equal('foundation');
        expect(res.body.role.name).to.equal('NewType');
        done();
      });
  });

  it('Updated role by Id', done => {
    const data = {
      name: 'NOM_View',
      description: 'View role for foundation',
      permission: []
    };
    request.post(apiRole)
      .send(data)
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.status).to.equal(200);
        expect(res.body.role).to.not.equal(null);
        expect(res.body.role.name).to.equal('NOM_View');
        data.name = 'NewRoleModified';
        data.type = 'NonExistingType';
        request.put(apiRole.concat(res.body.role.id))
          .send(data)
          .set('X-Secure-Modify-Token', shared.secureModifyToken())
          .end((err, response) => {
            if (err) {
              return done(err);
            }
            expect(response.status).to.equal(200);
            expect(response.body).to.not.equal(null);
            expect(response.body.role.type).to.equal('foundation');
            expect(response.body.role.name).to.equal('NewRoleModified');

            delete data.permission;
            request.put(apiRole.concat(response.body.role.id))
              .send(data)
              .set('X-Secure-Modify-Token', shared.secureModifyToken())
              .end((err, resp) => {
                if (err) {
                  return done(err);
                }
                expect(resp.status).to.equal(400);
                expect(resp.body.error).to.not.equal(null);
                expect(resp.body.error.message).to.equal('Permission set given is not valid');
                done();
              });
          });
      });
  });

  it('Delete role by Id', done => {
    const data = {
      name: 'NOM',
      description: 'NOM role for foundation',
      permission: []
    };
    request.post(apiRole)
      .send(data)
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.status).to.equal(200);
        expect(res.body.role).to.not.equal(null);
        expect(res.body.role.name).to.equal('NOM');
        request.delete(apiRole.concat(res.body.role.id))
          .set('X-Secure-Modify-Token', shared.secureModifyToken())
          .end((err, response) => {
            if (err) {
              return done(err);
            }
            expect(response.status).to.equal(200);
            expect(response.body).to.not.equal(null);
            expect(response.body).to.equal(1);
            done();
          });
      });
  });

  it('Create non-default actions', done => {
    const data = {
      name: 'NonDefaultAction',
      description: 'Non Default action role for foundation',
      permission: [
        {
          // eslint-disable-next-line camelcase
          operation_key: 'exec',
          // eslint-disable-next-line camelcase
          resource_key: 'action<>drillDown'
        },
        {
          // eslint-disable-next-line camelcase
          operation_key: 'exec',
          // eslint-disable-next-line camelcase
          resource_key: 'action<>open_metric_browser'
        }
      ]
    };
    request.post(apiRole)
      .send(data)
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.status).to.equal(200);
        expect(res.body.role).to.not.equal(null);
        expect(res.body.role.name).to.equal('NonDefaultAction');

        request.get(apiRole.concat(res.body.role.id))
          .end((err, response) => {
            if (err) {
              return done(err);
            }
            expect(response.status).to.equal(200);
            expect(response.body).to.not.equal(null);
            expect(response.body.role.type).to.equal('foundation');
            expect(response.body.role.name).to.equal('NonDefaultAction');
            expect(response.body.role.permission[0].operation_key).to.equal('exec');
            expect(response.body.role.permission[0].resource_key).to.equal('action<>drillDown');
            expect(response.body.role.permission[1].operation_key).to.equal('exec');
            expect(response.body.role.permission[1].resource_key).to.equal('action<>open_metric_browser');
            done();
          });
      });
  });

  it('Create super admin non-default actions', done => {
    const data = {
      name: 'NonDefaultActionSuperAdmin',
      description: 'Non Default action role for foundation',
      permission: [
        {
          // eslint-disable-next-line camelcase
          operation_key: 'exec',
          // eslint-disable-next-line camelcase
          resource_key: 'action<>All'
        }
      ]
    };
    request.post(apiRole)
      .send(data)
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.status).to.equal(200);
        expect(res.body.role).to.not.equal(null);
        expect(res.body.role.name).to.equal('NonDefaultActionSuperAdmin');

        request.get(apiRole.concat(res.body.role.id))
          .end((err, response) => {
            if (err) {
              return done(err);
            }
            expect(response.status).to.equal(200);
            expect(response.body).to.not.equal(null);
            expect(response.body.role.type).to.equal('foundation');
            expect(response.body.role.name).to.equal('NonDefaultActionSuperAdmin');
            expect(response.body.role.permission[0].operation_key).to.equal('exec');
            expect(response.body.role.permission[0].resource_key).to.equal('action<>All');
            done();
          });
      });
  });

  it('Create non-default actions with incorrect operating key data', done => {
    const data = {
      name: 'NonDefaultAction_Incorrect_Key',
      description: 'Non Default action role for foundation',
      permission: [
        {
          // eslint-disable-next-line camelcase
          operation_key: 'exe',
          // eslint-disable-next-line camelcase
          resource_key: 'action<>drillDown'
        },
        {
          // eslint-disable-next-line camelcase
          operation_key: 'exec',
          // eslint-disable-next-line camelcase
          resource_key: 'action<>open_metric_browser'
        }
      ]
    };
    request.post(apiRole)
      .send(data)
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.status).to.equal(400);
        expect(res.body.error).to.not.equal(null);
        expect(res.body.error.message).to.equal('Permission set given is not valid');
        done();
      });
  });

  it('Create actions with wrong permission type', done => {
    const data = {
      name: 'NonDefaultAction_Incorrect_Type',
      description: 'Non Default action role for foundation',
      permission: {}
    };
    request.post(apiRole)
      .send(data)
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.status).to.equal(400);
        expect(res.body.error).to.not.equal(null);
        expect(res.body.error.message).to.equal('Permission set given is not valid');
        done();
      });
  });

  it('Create actions with no permission', done => {
    const data = {
      name: 'RoleWithUndefinedPermissions',
      description: 'Role with undefined permissions'
    };
    request.post(apiRole)
      .send(data)
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.status).to.equal(400);
        expect(res.body.error).to.not.equal(null);
        expect(res.body.error.message).to.equal('Permission set given is not valid');
        done();
      });
  });

  it('Create non-default actions with incorrect resource key data', done => {
    const data = {
      name: 'NonDefaultAction_Incorrect_Resource_Key',
      description: 'Non Default action role for foundation',
      permission: [
        {
          // eslint-disable-next-line camelcase
          operation_key: 'exec',
          // eslint-disable-next-line camelcase
          resource_key: 'action<>drillDown'
        },
        {
          // eslint-disable-next-line camelcase
          operation_key: 'exec',
          // eslint-disable-next-line camelcase
          resource_key: 'actions<>open_metric_browser'
        }
      ]
    };
    request.post(apiRole)
      .send(data)
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.status).to.equal(400);
        expect(res.body.error).to.not.equal(null);
        expect(res.body.error.message).to.equal('Permission set given is not valid');
        done();
      });
  });

  it('Create non-default actions with incorrect resource key data', done => {
    const data = {
      name: 'NonDefaultAction_Incorrect_Resource_Key_Data',
      description: 'Non Default action role for foundation',
      permission: [
        {
          // eslint-disable-next-line camelcase
          operation_key: 'exec',
          // eslint-disable-next-line camelcase
          resource_key: 'action<>drillDown'
        },
        {
          // eslint-disable-next-line camelcase
          operation_key: 'exec',
          // eslint-disable-next-line camelcase
          resource_key: 'actionsopen_metric_browser'
        }
      ]
    };
    request.post(apiRole)
      .send(data)
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.status).to.equal(400);
        expect(res.body.error).to.not.equal(null);
        expect(res.body.error.message).to.equal('Permission set given is not valid');
        done();
      });
  });

  it('Create non-default actions and menu entry sets', done => {
    const data = {
      name: 'MenuEntryAndNonDefault',
      description: 'Non Default action  and menu entry role for foundation',
      permission: [
        {
          // eslint-disable-next-line camelcase
          operation_key: 'exec',
          // eslint-disable-next-line camelcase
          resource_key: 'action<>drillDown'
        },
        {
          // eslint-disable-next-line camelcase
          operation_key: 'View',
          // eslint-disable-next-line camelcase
          resource_key: 'menu<>Item-KubeEntry'
        }
      ]
    };
    request.post(apiRole)
      .send(data)
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.status).to.equal(200);
        expect(res.body.role).to.not.equal(null);
        expect(res.body.role.name).to.equal('MenuEntryAndNonDefault');

        request.get(apiRole.concat(res.body.role.id))
          .end((err, response) => {
            if (err) {
              return done(err);
            }
            expect(response.status).to.equal(200);
            expect(response.body).to.not.equal(null);
            expect(response.body.role.type).to.equal('foundation');
            expect(response.body.role.name).to.equal('MenuEntryAndNonDefault');
            expect(response.body.role.permission[0].operation_key).to.equal('exec');
            expect(response.body.role.permission[0].resource_key).to.equal('action<>drillDown');
            expect(response.body.role.permission[1].operation_key).to.equal('View');
            expect(response.body.role.permission[1].resource_key).to.equal('menu<>Item-KubeEntry');
            done();
          });
      });
  });

  it('Create non-default actions and incorrect menu entry sets', done => {
    const data = {
      name: 'MenuEntryAndNonDefault',
      description: 'Non Default action  and menu entry role for foundation',
      permission: [
        {
          // eslint-disable-next-line camelcase
          operation_key: 'exec',
          // eslint-disable-next-line camelcase
          resource_key: 'action<>drillDown'
        },
        {
          // eslint-disable-next-line camelcase
          operation_key: 'View',
          // eslint-disable-next-line camelcase
          resource_key: 'menu<>ItemKubeEntry'
        }
      ]
    };
    request.post(apiRole)
      .send(data)
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.status).to.equal(400);
        expect(res.body.error).to.not.equal(null);
        expect(res.body.error.message).to.equal('Permission must be of type menuEntryRBACFormat');
        done();
      });
  });

  it('Create incorrect non-default actions and menu entry sets', done => {
    const data = {
      name: 'MenuEntryAndNonDefault',
      description: 'Non Default action  and menu entry role for foundation',
      permission: [
        {
          // eslint-disable-next-line camelcase
          operation_key: 'View',
          // eslint-disable-next-line camelcase
          resource_key: 'menu<>Item-KubeEntry'
        },
        {
          // eslint-disable-next-line camelcase
          operation_key: 'exec',
          // eslint-disable-next-line camelcase
          resource_key: 'act<>drillDown'
        }
      ]
    };
    request.post(apiRole)
      .send(data)
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.status).to.equal(400);
        expect(res.body.error).to.not.equal(null);
        expect(res.body.error.message).to.equal('Permission set given is not valid');
        done();
      });
  });

  it('Create role without body', done => {
    request.post(apiRole)
      .send(undefined)
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.status).to.equal(400);
        expect(res.body.error).to.not.equal(null);
        expect(res.body.error.message).to.equal('Invalid role format.');
        request.post(apiRole)
          .set('X-Secure-Modify-Token', shared.secureModifyToken())
          .end((err, resp) => {
            if (err) {
              return done(err);
            }
            expect(resp.status).to.equal(400);
            expect(resp.body.error).to.not.equal(null);
            expect(resp.body.error.message).to.equal('Invalid role format.');
            done();
          });
      });
  });

  it('Update non existing role', done => {
    const data = {
      name: 'NOM_View',
      description: 'View role for foundation',
      permission: []
    };
    request.put(apiRole.concat('IDontExist'))
      .send(data)
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .end((err, response) => {
        if (err) {
          return done(err);
        }
        expect(response.status).to.equal(404);
        expect(response.body.error.message).to.equal('Unknown role.');
        request.put(apiRole.concat(undefined))
          .send(data)
          .set('X-Secure-Modify-Token', shared.secureModifyToken())
          .end((err, resp) => {
            if (err) {
              return done(err);
            }
            expect(resp.status).to.equal(404);
            expect(resp.body.error.message).to.equal('Unknown role.');
            done();
          });
      });
  });

  it('delete non existing role', done => {
    request.delete(apiRole.concat('IDontExist'))
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .end((err, response) => {
        if (err) {
          return done(err);
        }
        expect(response.status).to.equal(404);
        expect(response.body.error.message).to.equal('Unknown role.');
        request.delete(apiRole.concat(undefined))
          .set('X-Secure-Modify-Token', shared.secureModifyToken())
          .end((err, resp) => {
            if (err) {
              return done(err);
            }
            expect(resp.status).to.equal(404);
            expect(resp.body.error.message).to.equal('Unknown role.');
            done();
          });
      });
  });

  it('get non existing role', done => {
    request.get(apiRole.concat('IDontExist'))
      .end((err, response) => {
        if (err) {
          return done(err);
        }
        expect(response.status).to.equal(404);
        expect(response.body.error.message).to.equal('Unknown role.');
        request.get(apiRole.concat(undefined))
          .end((err, resp) => {
            if (err) {
              return done(err);
            }
            expect(resp.status).to.equal(404);
            expect(resp.body.error.message).to.equal('Unknown role.');
            done();
          });
      });
  });

  it('Delete roles (cleanup)', done => {
    request.get(apiRole)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.status).to.equal(200);
        expect(res.body.role_list.role.length).to.equal(6);

        async.each(res.body.role_list.role, (role, next) => {
          request.delete(`${apiRole}${role.id}`)
            .set('X-Secure-Modify-Token', shared.secureModifyToken())
            .end(next);
        }, done);
      });
  });
});
