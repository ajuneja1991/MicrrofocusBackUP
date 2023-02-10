/* eslint-disable camelcase */
// <reference types="Cypress" />
const shared = require('../../../../shared/shared');
import { uploadFileRequest } from '../../../../../../support/reporting/restUtils/uploadFile';
const role = require('../../../../../../support/reporting/restUtils/role');
const dataCollector = require('../../../../../../support/reporting/restUtils/dataCollector');
let bvdURL = '';
const nonAdminuserName = 'test';
const nonAdminuserPwd = 'control@123D';
const uifRole = {
  name: 'testRole',
  description: 'testRole'
};

function createKnownTag(tagName, tagValue, cb) {
  const knownTagURL = `/rest/${Cypress.env('API_VERSION')}/tagVal/${tagName}/${tagValue}`;
  cy.request('GET', `/rest/${Cypress.env('API_VERSION')}/appConfig/MyApp`).then(() => {
    cy.getCookie('secureModifyToken').then(val => {
      cy.request({
        method: 'POST',
        url: knownTagURL,
        headers: {
          'X-Secure-Modify-Token': val.value
        }
      }).then(response => {
        expect(response.status).to.equal(200);
        cb(response);
      });
    });
  });
}

function associatePageToPageGroup(group, ref, cb) {
  const apiTag = `/rest/${Cypress.env('API_VERSION')}/tag`;
  cy.request('GET', `/rest/${Cypress.env('API_VERSION')}/appConfig/MyApp`).then(() => {
    cy.getCookie('secureModifyToken').then(val => {
      cy.request({
        method: 'POST',
        url: apiTag,
        body: [{
          name: '__rbac',
          value: group,
          ref,
          refType: 'page'
        }],
        headers: {
          'X-Secure-Modify-Token': val.value
        }
      }).then(response => {
        expect(response.status).to.equal(200);
        cb(response);
      });
    });
  });
}

function deleteKnownTag(name, value, cb) {
  cy.getCookie('secureModifyToken').then(val => {
    cy.request({
      method: 'DELETE',
      url: `/rest/${Cypress.env('API_VERSION')}/tagVal/${name}/${value}`,
      headers: {
        'x-secure-modify-token': val.value
      }
    }).then(response => {
      expect(response.status).to.equal(200);
      cb(response);
    });
  });
}

function fillMarkUpWidgetDetailsforMarkDown(markDownText, widgetName) {
  cy.get('[data-cy=page-action-button]').click();
  cy.wait('@getTOC');
  cy.get('[data-cy=page-action-item-addWidget] > .dropdown-menu-text').click();
  cy.get('[data-cy=widget-type-markupText]').should('be.visible');
  cy.get('[data-cy=widget-type-markupText]').click();
  cy.get('[data-cy=widgetContentValue]').type(markDownText);
  cy.get('[data-cy=widgetNameInput]').focus().clear();
  cy.get('[data-cy=widgetNameInput]').type(widgetName);
}

function addParameterforMarkDown(paramName) {
  cy.get('button[data-cy="insert-variable"]>span').eq(0).click();
  cy.get(`[data-cy="${paramName}"]`).click();
  cy.get(`[data-cy="${paramName}"]`).should('not.exist');
  cy.wait(['@getChannelInfo', '@getChannelStateResponse']);
}

function addParameterDetailsforMarkDown(queryName, paramName) {
  cy.get('[class="ux-select-container"]>button').click();
  cy.get(`.dropdown-list-container>div>span:contains(${queryName})`).eq(0).scrollIntoView().click();
  cy.wait(['@getChannelInfo', '@getChannelStateResponse']);
  cy.get('[data-cy="sample-result-table"]').find('[class="preview-heading"]').should('be.visible');
  addParameterforMarkDown(paramName);
}

function fillMarkUpWidgetDetails(markDownText, widgetName) {
  cy.get('[data-cy=page-action-button]').click();
  cy.get('[data-cy=page-action-item-addWidget] > .dropdown-menu-text').click();
  cy.get('[data-cy=widget-type-markupText]').should('be.visible');
  cy.get('[data-cy=widget-type-markupText]').click();
  cy.get('[data-cy=widgetContentValue]').focus().type(markDownText);
  cy.get('[data-cy=widgetNameInput]').focus().clear();
  cy.get('[data-cy=widgetNameInput]').type(widgetName);
}

describe('Add & Edit MarkUp Text widget', shared.defaultTestOptions, () => {
  beforeEach(() => {
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/markUpText*`
    }).as('getMarkUpTextPage');
    cy.intercept({
      method: 'POST',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/dataCollector/channel`
    }).as('getChannelInfo');
    cy.intercept({
      method: 'POST',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/channel/state`
    }).as('getChannelStateResponse');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pages/toc*`
    }).as('getTOC');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/dataCollector?type=dataQueries`
    }).as('getDataCollectors');
    cy.bvdLogin();
    cy.visit('/markUpText');
    cy.wait(['@getMarkUpTextPage', '@getTOC']);
  });

  it('add, edit & verify mark down text widget', () => {
    fillMarkUpWidgetDetails('Test text 123', 'Sample Mark Up');
    cy.get('div>h2').should('have.text', 'Edit Markdown');
    cy.get('[data-cy=markdown-help]').should('be.visible');
    cy.get('[data-cy=widgetContentValue]').should('be.visible');
    cy.get('h3.data-heading').should('have.text', ' DATA ');
    cy.get('[data-cy=query-dropdown]').should('be.visible');
    cy.get('[data-cy=settings] > h3').should('have.text', ' SETTINGS ');
    cy.get('[data-cy=widgetNameLabel]').should('be.visible');
    cy.get('[data-cy=widgetNameInput]').should('be.visible');
    cy.get('[data-cy=cancel-button]').should('be.visible');
    cy.get('.widget-title-span').should('have.text', '<New Markdown>');
    cy.get('[data-cy=insert-variable]').should('be.disabled');
    cy.get('text-widget>p>p').should('have.text', 'Test text 123');
    cy.get('[class="dashboard-widget-title"]>span').should('have.text', 'Sample Mark Up');
    cy.get('text-widget>p>p').should('have.text', 'Test text 123');
    cy.get('[data-cy=cancel-button]').click();
    cy.get('[data-cy="action-button"]>span').click();
    cy.get('button[data-cy="action-button-edit"]>span:contains(Edit)').click();
    cy.wait(['@getDataCollectors']);
    cy.get('[data-cy=widgetContentValue]').focus().clear();
    cy.get('[data-cy=widgetContentValue]').type('Updated Text new');
    cy.get('[data-cy=widgetNameInput]').focus().clear();
    cy.get('[data-cy=widgetNameInput]').type('Updated name');
    cy.get('[class="dashboard-widget-title"]>span').should('have.text', 'Updated name');
    cy.get('text-widget>p>p').should('have.text', 'Updated Text new');
  });

  it('add markup text with mark down cheat sheet or html tags with special characters', () => {
    cy.get('[data-cy=page-action-button]').click();
    cy.get('[data-cy=page-action-item-addWidget] > .dropdown-menu-text').click();
    cy.get('[data-cy=widget-type-markupText]').click();
    cy.get('[data-cy=widgetContentValue]').focus().type(`| Syntax | Description | {enter}| ----------- | ----------- |{enter}| Header | Title |{enter}| Paragraph | Text |{enter}`);
    cy.get('[data-cy=widgetContentValue]').type(`<html><body><font color="#00FF00">Font color example</font>  <font color="rgb(0,255,0)"> color attribute</font><h1>My First Heading</h1><p>My first paragraph.</p></body></html>{enter}{enter}`);
    cy.get('[data-cy=widgetContentValue]').type(`# Markdown Cheat Sheet{enter}# H1 {enter}## H2 {enter}> blockquote{enter}{enter}1. First item{enter}2. Second item{enter}{enter}Bold Text **bold text**{enter}{enter}Link  [Markdown Guide](https://www.markdownguide.org){enter}Image  ![alt text](https://www.markdownguide.org/assets/images/tux.png){enter}~~The world is flat.~~{enter}`);
    cy.get('[data-cy=widgetContentValue]').type('~!@#$%^&*()_Test43{}|[]:,./<>?');
    cy.get('[data-cy=widgetNameInput]').focus().clear();
    cy.get('[data-cy=widgetNameInput]').type('SpecialChar_~!@#$%^&*()_Test43{}|[]:,./<>?');
    cy.get('[class="dashboard-widget-title"]>span').should('have.text', 'SpecialChar_~!@#$%^&*()_Test43{}|[]:,./<>?');
    cy.get('text-widget>p>p:contains(~!@#$%^&*()_Test43{}|[]:,./<>?)').scrollIntoView().should('be.visible');
    cy.get('text-widget>p>h1:contains(Markdown Cheat Sheet)').scrollIntoView().should('be.visible');
    cy.get('text-widget>p>p>strong').should('have.text', 'bold text');
    cy.get('text-widget>p>blockquote>p').should('have.text', 'blockquote');
    cy.get('text-widget>p>ol>li').eq(0).should('have.text', 'First item');
    cy.get('text-widget').find('img').scrollIntoView().should('be.visible');
    cy.get('text-widget>p>table>tbody>tr>td:contains(Paragraph)').scrollIntoView().should('be.visible');
    cy.get('text-widget>p>font[color="#00FF00"]').scrollIntoView().should('be.visible');
    cy.get('text-widget>p>font[color="rgb(0,255,0)"]').scrollIntoView().should('be.visible');
  });
});

describe('Add or Edit Markup Text with embedded parameters', shared.defaultTestOptions, () => {
  bvdURL = shared.getBaseUrlForRequest(Cypress.config().baseUrl);

  before(() => {
    uploadFileRequest('foundation/bvdOnUIF/markDownTextDC.bvddc', `${bvdURL}/rest/${Cypress.env('API_VERSION')}/dataCollector`, 1, 'dataCollectorsFile');
  });

  beforeEach(() => {
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/markUpText*`
    }).as('getMarkUpTextPage');
    cy.intercept({
      method: 'POST',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/dataCollector/channel`
    }).as('getChannelInfo');
    cy.intercept({
      method: 'POST',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/channel/state`
    }).as('getChannelStateResponse');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pages/toc*`
    }).as('getTOC');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/dataCollector?type=dataQueries`
    }).as('getDataCollectors');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/dataCollector/*`
    }).as('getDataCollector');
    cy.bvdLogin();
    cy.visit('/markUpText');
    cy.wait(['@getMarkUpTextPage', '@getTOC']);
  });

  it('Should add and edit Markup text with embedded parameters', () => {
    fillMarkUpWidgetDetails('TestParam', 'Param Mark Down1');
    addParameterDetailsforMarkDown('Test Data', 'id');
    cy.get('tbody>tr>td>div').eq(1).should('have.text', 'ci_collection');
    cy.get('[class="dashboard-widget-title"]>span').should('have.text', 'Param Mark Down1');
    cy.get('text-widget>p>p').should('have.text', 'TestParam 10');
    cy.get('[data-cy=cancel-button]').click();
    cy.get('[data-cy="action-button"]>span').click();
    cy.get('button[data-cy="action-button-edit"]>span:contains(Edit)').click();
    cy.wait(['@getDataCollectors', '@getDataCollector']);
    cy.get('uif-query-selector').find('uis-spinner-overlay').find('.spinner-overlay').should('be.hidden');
    cy.get('[data-cy=widgetContentValue]').type('UpdatedText');
    cy.get('[data-cy=widgetNameInput]').focus().clear();
    cy.get('[data-cy=widgetNameInput]').type('Updated Param name');
    cy.wait(['@getChannelInfo', '@getChannelStateResponse']);
    addParameterforMarkDown('type');
    cy.get('[class="dashboard-widget-title"]>span').should('have.text', 'Updated Param name');
    cy.get('text-widget>p>p').should('have.text', 'TestParam 10 UpdatedText membership');
  });

  it('When adding a metric box if we get multiple rows in result then very first row will be shown on widget text', () => {
    fillMarkUpWidgetDetails('TestMultipleRows', 'Param Mark Down1');
    addParameterDetailsforMarkDown('Test Data', 'id');
    cy.get('tbody>tr>td>div').eq(1).should('have.text', 'ci_collection');
    cy.get('text-widget>p>p').should('have.text', 'TestMultipleRows 10');
  });

  it('Should display correct data for parameter driven query when user change data as per omnibar selection', () => {
    fillMarkUpWidgetDetails('TestParam', 'Param Mark Down1');
    addParameterDetailsforMarkDown('selected_region', 'name');
    cy.get('tbody>tr>td>div').eq(1).should('have.text', 'All regions');
    cy.get('[class="dashboard-widget-title"]>span').should('have.text', 'Param Mark Down1');
    cy.get('text-widget>p>p').should('have.text', 'TestParam All regions');
    cy.get('[class="qtm-font-icon qtm-icon-context"]').click();
    cy.get('[data-cy=EMEA] > .context-item-name').click();
    cy.get('text-widget>p>p').should('have.text', 'TestParam EMEA');
  });

  it('Multiple parameter mapping of same query result to individual markup text', () => {
    fillMarkUpWidgetDetails('TestParam', 'Param Mark Down1');
    addParameterDetailsforMarkDown('selected_region', 'name');
    cy.get('[data-cy=cancel-button]').click();
    fillMarkUpWidgetDetails('TestParam2', 'Param Mark Down2');
    addParameterDetailsforMarkDown('selected_region', 'nme');
    cy.get('[data-cy=cancel-button]').click();
    cy.get('[class="qtm-font-icon qtm-icon-context"]').click();
    cy.get('[data-cy=USA] > .context-item-name').click();
    cy.get('[data-cy=omnibar-close-btn]').click();
    cy.get('text-widget>p>p:contains(USA)').should('have.length', 2);
  });
});

describe('Markdown Text widget actions & page actions', shared.defaultTestOptions, () => {
  bvdURL = shared.getBaseUrlForRequest(Cypress.config().baseUrl);

  before(() => {
    uploadFileRequest('foundation/bvdOnUIF/markDownTextDC.bvddc', `${bvdURL}/rest/${Cypress.env('API_VERSION')}/dataCollector`, 1, 'dataCollectorsFile');
  });

  beforeEach(() => {
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/markUpText*`
    }).as('getMarkUpTextPage');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pages/toc*`
    }).as('getTOC');
    cy.intercept({
      method: 'POST',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/dataCollector/channel`
    }).as('getChannelInfo');
    cy.intercept({
      method: 'POST',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/channel/state`
    }).as('getChannelStateResponse');
    cy.bvdLogin();
    cy.visit('/markUpText');
    cy.wait(['@getMarkUpTextPage', '@getTOC']);
  });

  it('markdown widget actions & page actions should work correctly', () => {
    fillMarkUpWidgetDetailsforMarkDown('TestParam', 'Param Mark Down1');
    addParameterDetailsforMarkDown('selected_region', 'name');
    cy.get('[data-cy=cancel-button]').click();
    cy.get('@getChannelInfo');
    cy.get('[data-cy=action-button]>span').scrollIntoView()
      .should('be.visible')
      .click();
    cy.get('[data-cy=action-button-refreshWidget]>span:contains(Refresh)').click();
    cy.wait(['@getChannelInfo', '@getChannelStateResponse']);
    cy.get('span.widget-title-span:contains(Param Mark Down1)').should('be.visible');
    cy.get('[data-cy=action-button]>span').scrollIntoView()
      .should('be.visible').click();
    cy.get('[data-cy=action-button-duplicateWidget]>span').eq(1).scrollIntoView()
      .should('be.visible').click();
    cy.wait(['@getChannelInfo', '@getChannelStateResponse']);
    cy.get('span.widget-title-span:contains(Copy of Param Mark Down1)').scrollIntoView().should('be.visible');
    cy.get('[data-cy=action-button]>span').eq(1).scrollIntoView()
      .should('be.visible').click();
    cy.get('[data-cy=action-button-removeWidget]>span').eq(1).scrollIntoView()
      .should('be.visible').click();
    cy.get('span.widget-title-span:contains(Copy of Param Mark Down1)').should('not.exist');
    cy.get('[data-cy=action-button]>span').eq(0).scrollIntoView()
      .should('be.visible').click();
    cy.get('[data-cy=action-button-removeWidget]>span').eq(1).scrollIntoView()
      .should('be.visible').click();
    cy.get('[data-cy=page-action-button]').click();
    cy.get('[data-cy=page-action-item-save]>span:contains(Save)').click();
    cy.get('[data-cy=submit-button]').click();
    cy.get('div[role="alert"]:contains(Update of the definition was successful )').should('be.visible');
    cy.get('[data-cy=page-action-button]').click();
    cy.get('[data-cy="page-action-item-saveAs"]>span:contains(Save As)').click();
    cy.get('[data-cy="submit-button"]').click();
    cy.get('div[role="alert"]:contains(Definition "Copy of Test Mark Up Text" saved successfully)').should('be.visible');
    cy.get('[data-cy=page-action-button]').click();
    cy.get('[data-cy="page-action-item-delete"]>span:contains(Delete)').click();
    cy.get('div.modal-footer>button:contains(Delete)').click();
    cy.get('div[role="alert"]:contains(Deleted page successfully)').should('be.visible');
  });
});

describe('Markdown Text widget access for Non-admin user', shared.defaultTestOptions, () => {
  bvdURL = shared.getBaseUrlForRequest(Cypress.config().baseUrl);
  const tagName = 'NonAdminTag';
  const permissionArray = [
    { operation_key: 'View',
      resource_key: `default_action<>Group-${tagName}` },
    { operation_key: 'Create',
      resource_key: `default_action<>Group-${tagName}` },
    {
      operation_key: 'FullControl',
      resource_key: 'menu<>All'
    },
    {
      operation_key: 'exec',
      resource_key: 'action<>All'
    }
  ];

  before(() => {
    uploadFileRequest('foundation/bvdOnUIF/markDownTextDC.bvddc', `${bvdURL}/rest/${Cypress.env('API_VERSION')}/dataCollector`, 1, 'dataCollectorsFile');
    createKnownTag('__rbac', tagName, tagResB => {
      expect(tagResB.status).to.equal(200);
      associatePageToPageGroup(tagName, 'markUpText', pageSaveRes => {
        expect(pageSaveRes.status).to.equal(200);
      });
    });
  });

  beforeEach(() => {
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/markUpText*`
    }).as('getMarkUpTextPage');
    cy.intercept({
      method: 'POST',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/dataCollector/channel`
    }).as('getChannelInfo');
    cy.intercept({
      method: 'POST',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/channel/state`
    }).as('getChannelStateResponse');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pages/toc*`
    }).as('getTOC');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/dataCollector?type=dataQueries`
    }).as('getDataCollectors');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/dataCollector/*`
    }).as('getDataCollector');
    cy.bvdLogin();
    shared.deleteRole(uifRole);
  });

  after(() => {
    cy.clearCookies();
    cy.bvdLogin();
    dataCollector.deleteAllQueries(bvdURL);
    shared.deleteRole(uifRole);
    deleteKnownTag('__rbac', tagName, tagNAResponse => {
      expect(tagNAResponse.status).to.equal(200);
    });
    cy.bvdLogout();
  });

  it('should update value on widget after changing query and duplicate parameter in edit markdown widget', () => {
    cy.bvdLogout();
    role.roleCreationWithPermissionArray(uifRole.name, uifRole.description, permissionArray, false).then(() => {
      cy.clearCookies();
      cy.bvdLogin(nonAdminuserName, nonAdminuserPwd);
      cy.visit('/markUpText');
      cy.wait(['@getMarkUpTextPage', '@getTOC']);
      fillMarkUpWidgetDetails('TestMultipleRows', 'Param Multiple Rows');
      addParameterDetailsforMarkDown('Test Data', 'id');
      cy.get('tbody>tr>td>div').eq(0).should('have.text', '1');
      cy.get('[class="dashboard-widget-title"]>span').should('have.text', 'Param Multiple Rows');
      cy.get('text-widget>p>p').should('have.text', 'TestMultipleRows 10');
      cy.get('[data-cy=cancel-button]').click();
      cy.get('[data-cy="action-button"]>span').click();
      cy.get('button[data-cy="action-button-edit"]>span:contains(Edit)').click();
      cy.wait(['@getDataCollectors', '@getDataCollector']);
      cy.get('uif-query-selector').find('uis-spinner-overlay').find('.spinner-overlay').should('be.hidden');
      cy.get('[data-cy=widgetContentValue]').click().clear().type('UpdatedText');
      cy.get('[data-cy=widgetNameInput]').focus().clear();
      cy.get('[data-cy=widgetNameInput]').type('Updated Param name');
      cy.get('[class="ux-select-container"]>button').click();
      cy.get('.dropdown-list-container>div>span:contains(dynamicText)').click();
      addParameterforMarkDown('id');
      addParameterforMarkDown('name');
      addParameterforMarkDown('memory');
      addParameterforMarkDown('memory');
      cy.get('[class="dashboard-widget-title"]>span').should('have.text', 'Updated Param name');
      cy.get('text-widget>p>p').should('have.text', 'UpdatedText sac-hvm01209.swinfra.net  External3  40GB  40GB');
    });
  });

  it('should show default value selected in omnibar for default value query on a new page', () => {
    cy.bvdLogout();
    role.roleCreationWithPermissionArray(uifRole.name, uifRole.description, permissionArray, false).then(() => {
      cy.clearCookies();
      cy.bvdLogin(nonAdminuserName, nonAdminuserPwd);
      cy.visit('/markUpText');
      cy.wait(['@getMarkUpTextPage', '@getTOC']);
      cy.get('[data-cy=page-action-button]').click();
      cy.get('[data-cy=page-action-item-newPage] > .dropdown-menu-text').click();
      cy.get('[data-cy=widget-type-markupText]').should('be.visible');
      cy.get('[data-cy=widget-type-markupText]').click();
      cy.get('[data-cy=widgetContentValue]').focus().type('DefaultValue');
      cy.get('[data-cy=widgetNameInput]').focus().clear();
      cy.get('[data-cy=widgetNameInput]').type('Default Value widget');
      addParameterDetailsforMarkDown('CPUData', 'cpu');
      cy.get('[data-cy="context-tag-Operating System"]').should('be.visible');
      cy.get('[data-cy="context-tag-Operating System"]>div>span').eq(0).should('have.text', ' Operating System: ');
      cy.get('[data-cy="context-tag-Operating System"]>div>span').eq(1).should('have.text', ' Linux_&% ');
      cy.get('text-widget>p>p').should('have.text', 'DefaultValue 20');
    });
  });

  it('Verify markdown widget content is updated properly when user change parameter from text to datetime stamp in markdown parameter', () => {
    cy.bvdLogout();
    role.roleCreationWithPermissionArray(uifRole.name, uifRole.description, permissionArray, false).then(() => {
      cy.clearCookies();
      cy.bvdLogin(nonAdminuserName, nonAdminuserPwd);
      cy.visit('/markUpText');
      cy.wait(['@getMarkUpTextPage', '@getTOC']);
      fillMarkUpWidgetDetails('TestParam', 'Param Mark Down1');
      addParameterDetailsforMarkDown('data_query', 'sold_item');
      cy.get('[data-cy=cancel-button]').click();
      cy.get('[data-cy="markdown-text"]').children().should('have.text', 'TestParam 58');
      cy.get('[data-cy="action-button"]>span').click();
      cy.get('button[data-cy="action-button-edit"]>span:contains(Edit)').click();
      cy.wait(['@getDataCollectors', '@getDataCollector']);
      cy.get('[data-cy=widgetContentValue]').focus().clear();
      addParameterDetailsforMarkDown('Page Load Time', 'timestamp');
      cy.get('[data-cy="spinnerOverlay"]').last().should('be.hidden');
      cy.get('[data-cy="markdown-text"]>p:contains(2021-05-12 06:39:27)').should('have.length', 1);
      cy.get('[data-cy=cancel-button]').click();
      cy.get('[data-cy="action-button"]').last().click();
      cy.get('[data-cy="action-button-refreshWidget"]').click();
      cy.wait(['@getChannelInfo', '@getChannelStateResponse']);
      cy.get('[data-cy="spinnerOverlay"]').last().should('be.hidden');
      cy.get('[data-cy="markdown-text"]').children().should('have.text', '2021-05-12 06:39:27');
    });
  });
});
