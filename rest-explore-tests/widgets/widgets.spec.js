const shared = require('../helpers/shared');
const supertest = require('supertest');
const testData = require('../mockData');
const mockData = JSON.parse(JSON.stringify(testData));
const request = supertest.agent(shared.exploreTestURL);

const loginURL = '/rest/v2/pages/';
const apiWidget = '/rest/v2/widgets/';
const adminLogin = shared.tenant.email;
const adminPasswd = shared.tenant.password;

describe('Widget Rest Service Test', () => {
  it('Login admin', done => {
    shared.login(request, loginURL, adminLogin, adminPasswd, done);
  });

  it('Create widgets', done => {
    shared.createItems(request, apiWidget, mockData.widgets, done);
  });

  it('Get widget by ID', done => {
    request
      .get(apiWidget.concat('widget_1_test'))
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.status).to.equal(200);
        expect(res.body.data.id).to.equal('widget_1_test');
        expect(res.body.id).to.equal(undefined);
        expect(res.body.data.type).to.equal('mashup');
        expect(res.body.type).to.equal(undefined);
        done();
      });
  });

  it('Get widget by ID - not existing widget', done => {
    request
      .get(apiWidget.concat('not_existing_widget'))
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.status).to.equal(404);
        expect(res.body.error).to.equal(true);
        done();
      });
  });

  it('Get all widgets', done => {
    request
      .get(apiWidget)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.status).to.equal(200);
        expect(res.body.data.length).not.to.equal(0);
        expect(res.body.items).to.equal(undefined);
        done();
      });
  });

  it('Get widgets by contextTypes', done => {
    request
      .post(apiWidget)
      .send({ method: 'GET',
        contextTypes: ['host']})
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.status).to.equal(200);
        expect(res.body.data.length).not.to.equal(0);
        expect(res.body.items).to.equal(undefined);
        expect(res.body.data[0].id).to.equal('widget_2_test');
        done();
      });
  });

  it('Create widgets with special characters in the id', done => {
    const widgetWithSpecialCharInId = { ...mockData.widget, id: `${mockData.widget.id}!@#$%^&*()_+~:;',.<>[]{}|/!@` };
    request
      .post(apiWidget)
      .send(widgetWithSpecialCharInId)
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.status).to.equal(200);
        expect(res.body.error).to.equal(false);
        request
          .get(apiWidget)
          .end((err, getWidgetRes) => {
            if (err) {
              return done(err);
            }
            expect(getWidgetRes.status).to.equal(200);
            expect(res.body.items).to.equal(undefined);
            const filteredWidgets = getWidgetRes.body.data.filter(widget => widget.id === widgetWithSpecialCharInId.id);
            expect(filteredWidgets.length).to.equal(1);
            done();
          });
      });
  });

  it('Update a non-existing widget by passing invalid widget id', done => {
    request
      .put(`${apiWidget}nonexistingWidgetId`)
      .send(mockData.widget)
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.status).to.equal(500);
        expect(res.body.error).to.equal(true);
        return done();
      });
  });

  it('Create a widget without specifying the type', done => {
    const widgetWithoutType = { ...mockData.widget, type: null };
    request
      .post(apiWidget)
      .send(widgetWithoutType)
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.status).to.equal(400);
        expect(res.body.error).to.equal(true);
        return done();
      });
  });

  it('Creation of widget should fail if category json is passed as widget config', done => {
    const category = {
      id: '7',
      abbreviation: 'P',
      parent: '2',
      title: 'Pages'
    };
    request
      .post(apiWidget)
      .send(category)
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.status).to.be.equal(400);
        expect(res.body.error).to.equal(true);
        expect(res.error.text).not.to.be.equal('Invalid widget specification: Type can\'t be blank');
        expect(res.body.additionalInfo[0]).to.be.equal('Invalid widget specification: Type can\'t be blank');
        return done();
      });
  });

  it('Delete widgets', done => {
    shared.deleteItems(request, apiWidget, mockData.widgets, done);
  });

  it('logout', done => {
    shared.logout(request, done);
  });
});

describe('Widget crud operations', () => {
  it('Login admin', done => {
    shared.login(request, loginURL, adminLogin, adminPasswd, done);
  });

  it('Create widget', done => {
    request
      .post(apiWidget)
      .send(mockData.widget)
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.status).to.equal(200);
        expect(res.body.data[0].id).to.be.equal('page_1_main_test');
        expect(res.body[0]).to.be.equal(undefined);

        request
          .get(apiWidget.concat(mockData.widget.id))
          .end((err, res1) => {
            if (err) {
              return done(err);
            }
            expect(res1.status).to.equal(200);
            expect(res1.body.data.id).to.equal(mockData.widget.id);
            expect(res1.body.id).to.equal(undefined);
            done();
          });
      });
  });

  it('Create multiple widgets', done => {
    request
      .post(apiWidget)
      .send(mockData.widgets)
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.status).to.equal(200);
        expect(res.body.data.length).to.equal(mockData.widgets.length);
        expect(res.body.length).not.to.equal(mockData.widgets.length);

        const testWidgetId1 = mockData.widgets[0].id;
        request
          .get(apiWidget.concat(testWidgetId1))
          .end((err, res1) => {
            if (err) {
              return done(err);
            }
            expect(res1.status).to.equal(200);
            expect(res1.body.data.id).to.equal(testWidgetId1);
            expect(res1.body.id).to.equal(undefined);

            const testWidgetId2 = mockData.widgets[1].id;
            request
              .get(apiWidget.concat(testWidgetId2))
              .end((err, res2) => {
                if (err) {
                  return done(err);
                }
                expect(res2.status).to.equal(200);
                expect(res2.body.data.id).to.equal(testWidgetId2);
                expect(res2.body.id).to.equal(undefined);
                done();
              });
          });
      });
  });

  it('Update widget', done => {
    mockData.widget.type = 'external';
    request
      .put(apiWidget.concat(mockData.widget.id))
      .send(mockData.widget)
      .set('X-Secure-Modify-Token', shared.secureModifyToken())
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.status).to.equal(200);
        expect(res.body.data.type).to.be.equal(mockData.widget.type);
        expect(res.body.type).to.equal(undefined);

        request
          .get(apiWidget.concat(mockData.widget.id))
          .end((err, res1) => {
            if (err) {
              return done(err);
            }
            expect(res1.status).to.equal(200);
            expect(res1.body.data.type).to.be.equal(mockData.widget.type);
            expect(res1.body.type).to.equal(undefined);
            done();
          });
      });
  });

  it('Delete widget', done => {
    request
      .get(apiWidget.concat(mockData.widget.id))
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.status).to.equal(200);
        expect(res.body.error).to.equal(false);
        request
          .delete(apiWidget.concat(mockData.widget.id))
          .set('X-Secure-Modify-Token', shared.secureModifyToken())
          .end((err, res1) => {
            if (err) {
              return done(err);
            }
            expect(res1.status).to.equal(200);
            expect(res1.body.data.result).to.be.equal('Widget deleted');
            expect(res1.body.result).to.equal(undefined);
            request
              .get(apiWidget.concat(mockData.widget.id))
              .end((err, res2) => {
                if (err) {
                  return done(err);
                }
                expect(res2.status).to.equal(404);
                expect(res2.body.error).to.equal(true);
                done();
              });
          });
      });
  });

  it('Delete widgets', done => {
    shared.deleteItems(request, apiWidget, mockData.widgets, done);
  });

  it('logout', done => {
    shared.logout(request, done);
  });
});
