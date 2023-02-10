/* eslint-disable camelcase */
// <reference types="Cypress" />
const shared = require('../../../shared/shared');
import 'cypress-file-upload';
import { uploadFileRequest } from '../../../../../support/reporting/restUtils/uploadFile';
const dataCollector = require('../../../../../support/reporting/restUtils/dataCollector');
let bvdURL = '';
const role = require('../../../../../support/reporting/restUtils/role');
const nonAdminuserName = 'nonAdminTestUser';
const nonAdminuserPwd = 'control@123D';
let nonAdminWithDataCollectorRole;
let uifRole;
const permissionArray = [{
  operation_key: 'full-control',
  resource_key: 'omi-event'
},
{
  operation_key: 'View',
  resource_key: 'default_action<>Group-__bvd_data_collector'
}];
const permissionArrayForUIF = [{ operation_key: 'View',
  resource_key: 'default_action<>MemberOfNoGroup' }, {
  operation_key: 'View', resource_key: 'menu<>Item-uiTestDataCollectors'
}];

function visitMarkUpPage() {
  cy.visit('/markUpText');
  shared.waitForDataCalls({ name: '@getTOC', count: 2 });
  cy.wait(['@getPage']);
}

function createRoleForNonAdmin() {
  cy.wrap(role.roleCreationWithPermissionArray('NonAdminPage', 'NonAdminPage', permissionArrayForUIF, false)).then(uifRoleId => {
    cy.wrap(role.roleCreationWithPermissionArray('DefaultBvdRole', 'DefaultBvdRole', permissionArray, true)).then(nonAdminRoleId => {
      nonAdminWithDataCollectorRole = nonAdminRoleId;
      uifRole = uifRoleId;
    });
  });
}

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

function createTag(group, ref, cb) {
  const apiTag = `/rest/${Cypress.env('API_VERSION')}/tag/`;

  cy.request('GET', `/rest/${Cypress.env('API_VERSION')}/appConfig/MyApp`).then(() => {
    cy.getCookie('secureModifyToken').then(val => {
      cy.request({
        method: 'POST',
        url: apiTag,
        body: {
          name: '__rbac',
          value: group,
          ref,
          refType: 'page'
        },
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

function deleteTag(ref, cb) {
  const apiTag = `/rest/${Cypress.env('API_VERSION')}/tag?refType=page&ref=${ref}`;

  cy.request('GET', `/rest/${Cypress.env('API_VERSION')}/appConfig/MyApp`).then(() => {
    cy.getCookie('secureModifyToken').then(val => {
      cy.request({
        method: 'DELETE',
        url: apiTag,
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

function addMarkDownWidget(markDownText, widgetName, page) {
  if (page === 'existing') {
    cy.get('[data-cy=page-action-button]').click();
    cy.get('[data-cy=page-action-item-addWidget] > .dropdown-menu-text').click();
  } else if (page === 'new') {
    cy.get('[data-cy=page-action-button]').click();
    cy.get('[data-cy=page-action-item-newPage] > .dropdown-menu-text').click();
    cy.wait('@getTOC');
  }
  cy.get('[data-cy=widget-type-markupText]').should('be.visible');
  cy.get('[data-cy=widget-type-markupText]').click();
  cy.wait('@getDataCollectors');
  cy.get('[data-cy=widgetContentValue]').clear().type(markDownText);
  cy.get('[data-cy=widgetNameInput]').scrollIntoView().clear();
  cy.get('[data-cy=widgetNameInput]').type(widgetName);
  cy.get('[data-cy=widgetContentValue]').click();
}

function addParameterDetailsforMarkDown(queryName, paramName) {
  cy.get('[class="ux-select-container"]>button').click();
  cy.get(`.dropdown-list-container>div>span:contains(${queryName})`).eq(0).scrollIntoView().click();
  cy.wait(['@getDataCollector', '@getChannelInfo', '@getChannelStateResponse']);
  cy.get('[data-cy="sample-result-table"]').find('[class="preview-heading"]').should('be.visible');
  cy.get('button[data-cy="insert-variable"]>span').eq(0).click();
  cy.get(`div[role=menu]>button[id=${paramName}]>span`).click();
  cy.wait(['@getChannelInfo', '@getChannelStateResponse']);
  cy.get('[data-cy=widgetContentValue]').click();
}

function verifyAddedMarkDownWidget(index, markDownValue, widgetName) {
  cy.get(`[class="dashboard-widget-title"]>span:contains(${widgetName})`).should('be.visible');
  cy.get(`text-widget>p>p:contains(${markDownValue})`).should('be.visible');
}

function verifyDrillDownCheckboxOnSave(condition) {
  cy.get('[data-cy=page-action-button]').click();
  cy.get('[data-cy=page-action-item-save] > .dropdown-menu-text').click();
  cy.wait(['@getSave']);
  cy.get('[data-cy="pgmt-drilldown"]').should(condition);
  cy.get('[data-cy=cancel-button]').click();
}

function verifyDrillDownCheckboxOnSaveAs(condition, page) {
  cy.get('[data-cy=page-action-button]').click();
  cy.get('button#page-action-item-saveAs').click();
  cy.wait('@getSaveAs');
  cy.get('[data-cy=pgmt-radiobox-instanceDefinition]').find('.ux-radio-button-container').click();
  if (condition === 'not.exist') {
    cy.get('[data-cy="pgmt-drilldown"]').should(condition);
  } else if (condition === 'be.visible') {
    cy.get('[data-cy="pgmt-drilldown"]').scrollIntoView().should(condition);
  }
  if (page === 'existing') {
    cy.get('[data-cy=pgmt-radiobox-instance]').find('.ux-radio-button-container').click();
    cy.get('[data-cy="pgmt-drilldown"]').should('not.exist');
  }
  cy.get('[data-cy=pgmt-radiobox-definition]').find('.ux-radio-button-container').click();
  if (condition === 'not.exist') {
    cy.get('[data-cy="pgmt-drilldown"]').should(condition);
  } else if (condition === 'be.visible') {
    cy.get('[data-cy="pgmt-drilldown"]').scrollIntoView().should(condition);
  }
  cy.get('[data-cy=cancel-button]').click();
}

function deleteCurrentPage() {
  cy.get('[data-cy=page-action-button]').click();
  cy.get('[data-cy=page-action-item-delete]').click();
  cy.get('[data-cy=mondrianModalDialogButton]').click();
  cy.wait('@deletePage');
  shared.waitForDataCalls({ name: '@getTOC', count: 2 });
  cy.get('div[role=alert]:contains(" Deleted page successfully ")').should('be.visible');
  cy.get('div[role=alert]:contains(" Deleted page successfully ")').should('not.exist');
}

function saveAsPage(pageName, drillDownFlag) {
  cy.get('[data-cy=page-action-button]').click();
  cy.get('button#page-action-item-saveAs').click();
  cy.wait('@getSaveAs');
  cy.get('[data-cy=pgmt-radiobox-instanceDefinition]').find('.ux-radio-button-container').click();
  cy.get('[data-cy=pgmt-properties-instanceDefinition-instance-title]').type(pageName);
  cy.get('.ux-select-container > .form-control').click();
  cy.get('[data-cy=category-T2]').click();
  if (drillDownFlag) {
    cy.get('.ux-checkbox-container').click();
  }
  cy.get('[data-cy=submit-button]').click();
  cy.wait(['@postPages', '@getTOC', '@getChannelInfo', '@getChannelStateResponse']);
}

function waitAfterItemSelection() {
  cy.wait(['@getPagesMetadata', '@getChannelStateResponse']);
  cy.get('[data-cy="omnibarSpinnerOverlay"]').should('not.exist');
}

function selectValueFromOmnibar(value) {
  cy.get('[class="qtm-font-icon qtm-icon-context"]').click();
  cy.get(`[data-cy=${value}] > .context-item-name`).click();
  waitAfterItemSelection();
  cy.get('[data-cy=omnibar-close-btn]').click();
  cy.get(`text-widget>p>p:contains(${value})`).should('have.length', 1);
}

function checkTargetPageOnDrilldown(targetPage, condition) {
  cy.get('[data-cy=drillDownButton]').should('be.visible');
  cy.get('[data-cy=drillDownButton]').click();
  cy.get(`a[role='menuitem']:contains(${targetPage})`).should(condition);
}

function editMarkdownWidget(queryName, paramName) {
  cy.get('[data-cy=action-button] > .qtm-font-icon').eq(0).click();
  cy.get('[data-cy=action-button-edit] > .dropdown-menu-text').eq(0).click();
  cy.wait(['@getDataCollectors', '@getDataCollector', '@getChannelInfo', '@getChannelStateResponse']);
  cy.get('.ux-select-clear-icon').click();
  addParameterDetailsforMarkDown(queryName, paramName);
  cy.get('[data-cy=cancel-button]');
  cy.get('[data-cy=page-action-button]').click();
  cy.get('[data-cy=page-action-item-save] > .dropdown-menu-text').click();
  cy.wait(['@getSave']);
  cy.get('[data-cy="pgmt-drilldown"]').scrollIntoView().should('be.visible');
  cy.get('[data-cy=submit-button]').click();
  cy.wait(['@putPages']);
}

describe('Configure drilldown in widgets', shared.defaultTestOptions, () => {
  bvdURL = shared.getBaseUrlForRequest(Cypress.config().baseUrl);

  beforeEach(() => {
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pages/toc*`
    }).as('getTOC');
    cy.intercept({ method: 'POST', url: `${Cypress.env('BVD_CONTEXT_ROOT')}/rest/${Cypress.env('API_VERSION')}/dataCollector` }).as('postDataCollector');
    cy.intercept({
      method: 'POST',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/dataCollector/channel`
    }).as('getChannelInfo');
    cy.intercept({
      method: 'POST',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/channel/state`
    }).as('getChannelStateResponse');
    cy.intercept({
      method: 'POST',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pages/metadata`
    }).as('getPagesMetadata');
    cy.intercept({
      method: 'POST',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/datasource/ws/data`
    }).as('getData');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/widgets/pgmt_save`
    }).as('getSave');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/widgets/pgmt_save_as`
    }).as('getSaveAs');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/dataCollector?type=dataQueries`
    }).as('getDataCollectors');
    cy.intercept({
      method: 'POST',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pages`
    }).as('postPages');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/markUpText?*`
    }).as('getPage');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/dataCollector/*`
    }).as('getDataCollector');
    cy.intercept({
      method: 'DELETE',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pages/*`
    }).as('deletePage');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/menuEntries?filter=pages`
    }).as('getMenuEntries');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/*`
    }).as('getPageComponents');
    cy.intercept({
      method: 'PUT',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pages/*`
    }).as('putPages');
    cy.bvdLogin();
  });

  before(() => {
    uploadFileRequest('foundation/bvdOnUIF/markDownTextDC.bvddc', `${Cypress.env('EXPLORE_CONTEXT_ROOT')}/rest/${Cypress.env('API_VERSION')}/dataCollector`, 1, 'dataCollectorsFile');
  });

  it('should display configure drilldown checkbox only when a parameter query is mapped in any widget of page', () => {
    visitMarkUpPage();
    verifyDrillDownCheckboxOnSave('not.exist');
    verifyDrillDownCheckboxOnSaveAs('not.exist', 'existing');
    addMarkDownWidget('TestDrill1', 'TestWidget1', 'existing');
    cy.get('[data-cy=cancel-button]').focus().click();
    verifyAddedMarkDownWidget(0, 'TestDrill1', 'TestWidget1');
    addMarkDownWidget('TestDrill2', 'TestWidget2', 'existing');
    addParameterDetailsforMarkDown('Test Data', 'id');
    cy.get('[data-cy=cancel-button]').click();
    verifyAddedMarkDownWidget(1, 'TestDrill2 1', 'TestWidget2');
    verifyDrillDownCheckboxOnSave('not.exist', 'existing');
    verifyDrillDownCheckboxOnSaveAs('not.exist');
    addMarkDownWidget('TestDrill3', 'TestWidget3', 'existing');
    addParameterDetailsforMarkDown('CPUData', 'cpu');
    cy.get('[data-cy=cancel-button]').click();
    verifyAddedMarkDownWidget(2, 'TestDrill3 20', 'TestWidget3');
    verifyDrillDownCheckboxOnSave('be.visible', 'existing');
    verifyDrillDownCheckboxOnSaveAs('be.visible');
  });

  it('should configure drilldown on clicking on save as while saving a new page and saving existing page', () => {
    visitMarkUpPage();
    addMarkDownWidget('TestDrill1', 'TestWidget1', 'new');
    addParameterDetailsforMarkDown('selected_region', 'name');
    cy.get('[data-cy=cancel-button]').click();
    verifyAddedMarkDownWidget(1, 'TestDrill1 All regions', 'TestWidget1');
    verifyDrillDownCheckboxOnSaveAs('be.visible');
    cy.get('[data-cy=page-action-button]').click();
    cy.get('[data-cy=page-action-item-saveAs]').click();
    cy.wait(['@getSaveAs', '@getTOC']);
    cy.get('[data-cy=pgmt-radiobox-instanceDefinition]').find('.ux-radio-button-container').click();
    cy.get('[data-cy=pgmt-properties-instanceDefinition-instance-title]').type('TestDrillDown');
    cy.get('.ux-select-container > .form-control').click();
    cy.get('[data-cy=category-T2]').click();
    cy.get('.ux-checkbox-container').click();
    cy.get('[data-cy=submit-button]').click();
    cy.wait(['@postPages']);
    cy.wait(['@getTOC', '@getChannelInfo', '@getChannelStateResponse']);
    selectValueFromOmnibar('USA');
    checkTargetPageOnDrilldown('Drill Down 1', 'be.visible');
    cy.get('[data-cy=drilldown-drillDown1]').scrollIntoView().click();
    cy.wait('@getChannelInfo');
    cy.get('[data-cy="breadcrumb-title-Drill Down 1"]').should('be.visible');
    cy.get('[data-cy=breadcrumb-title-TestDrillDown]').click();
    shared.waitForDataCalls({ name: '@getTOC', count: 2 });
    cy.wait(['@getChannelStateResponse']);
    cy.get('[data-cy=page-action-button]').click();
    cy.wait(['@getChannelInfo', '@getChannelStateResponse']);
    cy.get('[data-cy=page-action-item-saveAs]').parent().click();
    cy.wait('@getSaveAs');
    cy.get('[data-cy=pgmt-radiobox-definition]').find('.ux-radio-button-container').click();
    cy.get('.ux-radio-button-container').should('be.visible');
    cy.get('.ux-checkbox-container').click();
    cy.get('[data-cy="pgmt-properties-definition-title"]').clear().type('TestDrillDown-definition');
    cy.get('[data-cy=submit-button]').click();
    cy.wait(['@postPages']);
    shared.waitForDataCalls({ name: '@getTOC', count: 2 });
    cy.get('div[role="alert"]:contains(Definition "TestDrillDown-definition" saved successfully)').should('be.visible');
    cy.wait(['@getChannelInfo', '@getChannelStateResponse']);
    cy.get('[class="qtm-font-icon qtm-icon-context"]').click();
    cy.get('[data-cy=USA] > .context-item-name').click();
    cy.wait(['@getChannelStateResponse']);
    cy.get('[data-cy=omnibar-close-btn]').click();
    cy.get('text-widget>p>p:contains(USA)').should('have.length', 1);
    checkTargetPageOnDrilldown('TestDrillDown', 'be.visible');
    cy.get('[data-cy=drilldown-drillDown1]').click();
    cy.wait(['@getPageComponents', '@getPagesMetadata', '@getChannelStateResponse', '@getTOC', '@getChannelInfo', '@getPagesMetadata', '@getChannelStateResponse']);
    cy.get('[data-cy=breadcrumb-title-TestDrillDown-definition]').click();
    cy.wait(['@getPageComponents', '@getPagesMetadata', '@getPagesMetadata', '@getChannelStateResponse', '@getChannelStateResponse', '@getTOC', '@getChannelInfo', '@getChannelStateResponse']);
    deleteCurrentPage();
  });

  it(`check when the drilldown target 'Use as workflow page' checkbox is off, then that page should not be visible in drilldown context`, () => {
    visitMarkUpPage();
    addMarkDownWidget('TestDrill1', 'TestWidget1', 'new');
    addParameterDetailsforMarkDown('selected_region', 'name');
    cy.get('[data-cy=cancel-button]').click();
    verifyAddedMarkDownWidget(1, 'TestDrill1 All region', 'TestWidget1');
    saveAsPage('DrillDownUncheck', false);
    cy.visit('/drillDown1');
    cy.wait(['@getTOC', '@getChannelInfo']);
    selectValueFromOmnibar('USA');
    checkTargetPageOnDrilldown('DrillDownUncheck', 'not.exist');
  });

  it(`check while designing a page if 'Use as workflow page' checkbox is on then that page should be visible in drilldown context`, () => {
    visitMarkUpPage();
    addMarkDownWidget('TestDrill1', 'TestWidget1', 'new');
    addParameterDetailsforMarkDown('selected_region', 'name');
    cy.get('[data-cy=cancel-button]').click();
    verifyAddedMarkDownWidget(1, 'TestDrill1 All region', 'TestWidget1');
    saveAsPage('DrillDownChecked', true);
    cy.visit('/drillDown1');
    cy.wait(['@getTOC', '@getChannelInfo']);
    selectValueFromOmnibar('USA');
    checkTargetPageOnDrilldown('DrillDownChecked', 'be.visible');
    cy.contains('DrillDownChecked').click();
  });

  it(`Verify that only subset drilldown pages having less than data collector to superset pages are visible`, () => {
    cy.visit('/drillDown1');
    shared.waitForDataCalls({ name: '@getTOC', count: 2 });
    cy.wait(['@getChannelInfo']);
    selectValueFromOmnibar('USA');
    checkTargetPageOnDrilldown('Drill Down 2', 'not.exist');
  });

  it(`Verify that after selecting parameter from omnibar it shows related pages in drilldown which contains same data collector used`, () => {
    cy.visit('/drillDown2');
    shared.waitForDataCalls({ name: '@getTOC', count: 2 });
    cy.wait(['@getChannelInfo']);
    selectValueFromOmnibar('USA');
    checkTargetPageOnDrilldown('Drill Down 1', 'be.visible');
  });

  it(`Verify that if parameter deleted from target page then on save or save as it should not display drilldown checkbox`, () => {
    cy.visit('/drillDown1');
    shared.waitForDataCalls({ name: '@getTOC', count: 2 });
    cy.wait(['@getChannelInfo', '@getPageComponents', '@getChannelStateResponse']);
    cy.get('[data-cy=action-button] > .qtm-font-icon').click();
    cy.get('[data-cy=action-button-edit] > .dropdown-menu-text').click();
    cy.wait(['@getDataCollectors', '@getDataCollector', '@getChannelInfo', '@getChannelStateResponse']);
    cy.get('div.ux-select-icons > ux-icon.ux-select-clear-icon').click();
    cy.get('.ux-select-clear-icon').should('not.exist');
    cy.get('[data-cy="data-collector-dropdown"]').contains(' Select a predefined query ').should('be.visible');
    cy.get('[data-cy=widgetContentValue]').click().clear();
    cy.get('[data-cy=cancel-button]').click();
    verifyDrillDownCheckboxOnSave('not.exist', 'existing');
  });

  it(`Verify that if parameter changed from target page then it should not display that page on drilldown`, () => {
    cy.visit('/drillDown3');
    shared.waitForDataCalls({ name: '@getTOC', count: 2 });
    cy.wait(['@getChannelInfo']);
    addMarkDownWidget('TestDrill1', 'TestWidget1', 'new');
    addParameterDetailsforMarkDown('selected_region', 'name');
    cy.get('[data-cy=cancel-button]').click();
    verifyAddedMarkDownWidget(1, 'TestDrill1 All region', 'TestWidget1');
    saveAsPage('DrillDownNotToDisplay', true);
    cy.visit('/drillDown3');
    shared.waitForDataCalls({ name: '@getTOC', count: 2 });
    cy.wait(['@getChannelInfo']);
    selectValueFromOmnibar('USA');
    checkTargetPageOnDrilldown('DrillDownNotToDisplay', 'be.visible');
    cy.visit('/drillDown3');
    shared.waitForDataCalls({ name: '@getTOC', count: 2 });
    cy.wait(['@getChannelInfo']);
    cy.get('.ux-side-menu-toggle-icon').click();
    cy.get('[data-cy=sideNavigation-search-input]').type('DrillDownNotToDisplay');
    cy.get('span[id=secondLevelItem_DrillDownNotToDisplay').first().click();
    cy.wait(['@getPageComponents', '@getChannelInfo', '@getTOC', '@getChannelStateResponse']);
    editMarkdownWidget('data_query', 'sold_item');
    cy.visit('/drillDown3');
    shared.waitForDataCalls({ name: '@getTOC', count: 2 });
    cy.wait(['@getChannelInfo']);
    selectValueFromOmnibar('USA');
    checkTargetPageOnDrilldown('DrillDownNotToDisplay', 'not.exist');
  });

  it(`Verify that if widget consisting parameter removed from existing page then it should not display drilldown on save`, () => {
    cy.visit('/drillDown1');
    shared.waitForDataCalls({ name: '@getTOC', count: 2 });
    cy.wait(['@getChannelInfo']);
    cy.get('[data-cy=action-button] > .qtm-font-icon').eq(0).click();
    cy.get('[data-cy=action-button-removeWidget] > .dropdown-menu-text').click();
    verifyDrillDownCheckboxOnSave('not.exist', 'existing');
    verifyDrillDownCheckboxOnSaveAs('not.exist');
  });

  it('Verify that deleted pages are not visible in drilldown', () => {
    visitMarkUpPage();
    addMarkDownWidget('TestDrill1', 'TestWidget1', 'new');
    addParameterDetailsforMarkDown('selected_region', 'name');
    cy.get('[data-cy=cancel-button]').click();
    verifyAddedMarkDownWidget(1, 'TestDrill1 All region', 'TestWidget1');
    saveAsPage('DrillDownDelete', true);
    cy.visit('/drillDown1');
    cy.wait(['@getTOC', '@getChannelInfo']);
    selectValueFromOmnibar('USA');
    checkTargetPageOnDrilldown('DrillDownDelete', 'be.visible');
    cy.contains('DrillDownDelete').click();
    cy.wait(['@getPageComponents', '@getChannelInfo', '@getTOC', '@getPagesMetadata', '@getChannelStateResponse']);
    deleteCurrentPage();
    cy.visit('/drillDown1');
    cy.wait(['@getTOC', '@getChannelInfo']);
    selectValueFromOmnibar('USA');
    checkTargetPageOnDrilldown('DrillDownDelete', 'not.exist');
  });

  it(`Verify that drilldown icon is not visible on page if embedded parameter query is deleted from predefined query`, () => {
    cy.visit('/drillDown1');
    shared.waitForDataCalls({ name: '@getTOC', count: 2 });
    cy.wait(['@getChannelInfo']);
    selectValueFromOmnibar('USA');
    cy.get('[data-cy=drillDownButton]').should('be.visible');
    cy.get('[data-cy="contextLabelType-Region"]').next().click();
    cy.wait(['@getChannelStateResponse']);
    cy.wrap(dataCollector.getAllDataCollectors(bvdURL)).then(result => {
      const dataCollectorItem = result.dataCollectors.find(dc => dc.name === 'Region (region)');
      expect(dataCollectorItem).not.to.be.undefined;
      dataCollector.deleteSingleQuery(bvdURL, dataCollectorItem._id, result.secureModifyToken);
      cy.get('[data-cy=action-button]').eq(0).click();
      cy.get('[data-cy="action-button-refreshWidget"] > span:contains(Refresh)').click();
      cy.wait(['@getChannelInfo', '@getChannelStateResponse']);
      cy.get('[class="qtm-font-icon qtm-icon-context"]').should('not.exist');
      cy.get('[data-cy=drillDownButton]').should('not.exist');
    });
    cy.wrap(dataCollector.getAllDataCollectors(bvdURL)).then(result => {
      const dataCollectorItem = result.dataCollectors.find(dc => dc.name === 'selected_region');
      expect(dataCollectorItem).not.to.be.undefined;
      dataCollector.deleteSingleQuery(bvdURL, dataCollectorItem._id, result.secureModifyToken);
      cy.get('[data-cy=action-button] > .qtm-font-icon').eq(0).click();
      cy.get('[data-cy="action-button-refreshWidget"] > span:contains(Refresh)').click();
      cy.wait(['@getChannelInfo', '@getChannelStateResponse']);
      cy.get('[class="qtm-font-icon qtm-icon-context"]').should('not.exist');
      cy.get('[data-cy=drillDownButton]').should('not.exist');
      cy.get('[data-cy="markdown-text"]').children().should('have.text', 'Test ');
    });
  });

  it(`Verify drilldown behavior when there are duplicate or multiple types of widgets linked with a page`, () => {
    uploadFileRequest('foundation/bvdOnUIF/markDownTextDC.bvddc', `${Cypress.env('EXPLORE_CONTEXT_ROOT')}/rest/${Cypress.env('API_VERSION')}/dataCollector`, 1, 'dataCollectorsFile');
    cy.bvdLogout();
    cy.bvdLogin();
    cy.visit('/drillDownMix2?_s=1577898960000&_e=1666466160000&_tft=A');
    shared.waitForDataCalls({ name: '@getTOC', count: 2 });
    shared.waitForDataCalls({ name: '@getChannelInfo', count: 3 });
    shared.waitForDataCalls({ name: '@getChannelStateResponse', count: 3 });
    selectValueFromOmnibar('USA');
    cy.get('[data-cy=drillDownButton]').should('be.visible');
    checkTargetPageOnDrilldown('Drill Down 1', 'be.visible');
    cy.contains('Drill Down 1').click();
    cy.wait(['@getChannelInfo', '@getChannelStateResponse']);
    cy.get('[data-cy="markdown-text"]').children().should('have.text', 'Test USA');
    cy.get('[data-cy="breadcrumb-title-Drill Down Mix 2"]').click();
    shared.waitForDataCalls({ name: '@getTOC', count: 1 });
    shared.waitForDataCalls({ name: '@getChannelInfo', count: 3 });
    shared.waitForDataCalls({ name: '@getChannelStateResponse', count: 3 });
    cy.get('[data-cy=context-tag-Locations] > .tag-flat > .tag-remove > .ux-icon').click();
    cy.get('[data-cy="context-tag-CPU Usage Performance"] > .tag-flat > .tag-remove > .ux-icon').click();
    cy.get('[data-cy=context-tag-Region] > .tag-flat > .tag-remove > .ux-icon').click();
    shared.waitForDataCalls({ name: '@getChannelStateResponse', count: 3 });
    cy.get('[class="qtm-font-icon qtm-icon-context"]').click();
    cy.get(`[data-cy="67"] > .context-item-name`).click();
    waitAfterItemSelection();
    cy.get('[data-cy=omnibar-close-btn]').click();
    cy.get('[data-cy=drillDownButton]').should('be.visible');
    checkTargetPageOnDrilldown('Drill Down Table', 'be.visible');
    cy.contains('Drill Down Table').click();
    cy.wait(['@getChannelInfo', '@getChannelStateResponse']);
    cy.get('[data-cy="breadcrumb-title-Drill Down Mix 2"]').click();
    shared.waitForDataCalls({ name: '@getTOC', count: 1 });
    shared.waitForDataCalls({ name: '@getChannelInfo', count: 3 });
    shared.waitForDataCalls({ name: '@getChannelStateResponse', count: 3 });
    cy.get('[data-cy=context-tag-Locations] > .tag-flat > .tag-remove > .ux-icon').click();
    cy.get('[data-cy="context-tag-CPU Usage Performance"] > .tag-flat > .tag-remove > .ux-icon').click();
    shared.waitForDataCalls({ name: '@getChannelStateResponse', count: 3 });
    cy.get('[class="qtm-font-icon qtm-icon-context"]').click();
    cy.get(`[data-cy=Bangalore] > .context-item-name`).click();
    waitAfterItemSelection();
    cy.get('[data-cy=omnibar-close-btn]').click();
    cy.get('[data-cy=drillDownButton]').should('be.visible');
    checkTargetPageOnDrilldown('Drill Down Metric', 'be.visible');
    cy.contains('Drill Down Metric').click();
    cy.wait(['@getChannelInfo', '@getChannelStateResponse']);
    cy.get('[data-cy="metric-box-value"]').should('have.text', '58.0');
    cy.get('[data-cy="breadcrumb-title-Drill Down Mix 2"]').click();
    shared.waitForDataCalls({ name: '@getTOC', count: 1 });
    shared.waitForDataCalls({ name: '@getChannelInfo', count: 3 });
    shared.waitForDataCalls({ name: '@getChannelStateResponse', count: 3 });
    selectValueFromOmnibar('EMEA');
    checkTargetPageOnDrilldown('Drill Down Mix 1', 'be.visible');
    cy.contains('Drill Down Mix 1').click();
    shared.waitForDataCalls({ name: '@getTOC', count: 1 });
    shared.waitForDataCalls({ name: '@getChannelInfo', count: 3 });
    shared.waitForDataCalls({ name: '@getChannelStateResponse', count: 3 });
    cy.get('[data-cy="metric-box-value"]').should('have.text', '58.0');
    cy.get('[data-cy="markdown-text"]').children().should('have.text', 'Test EMEA');
  });

  after(() => {
    dataCollector.deleteAllQueries(bvdURL);
  });
});

// Skipping this test due to existing defect in Drilldown for non admin. Defect ID - 1717471, 1717472 https://internal.almoctane.com/ui/entity-navigation?p=97002/8001&entityType=work_item&id=1717471
// eslint-disable-next-line mocha/no-skipped-tests
describe.skip('Non admin access for drilldown in widgets', shared.defaultTestOptions, () => {
  bvdURL = shared.getBaseUrlForRequest(Cypress.config().baseUrl);
  const tagID = 'testGroup36';
  const pageID = 'drillDown1';
  before(() => {
    uploadFileRequest('foundation/bvdOnUIF/markDownTextDC.bvddc', `${bvdURL}/rest/${Cypress.env('API_VERSION')}/dataCollector`, 1, 'dataCollectorsFile');
    cy.wrap(createRoleForNonAdmin());
    createKnownTag('__rbac', tagID, tagRes => {
      expect(tagRes.status).to.equal(200);
      createTag(tagID, pageID, pageSaveRes => {
        expect(pageSaveRes.status).to.equal(200);
      });
    });
  });

  beforeEach(() => {
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pages/toc*`
    }).as('getTOC');
    cy.intercept({ method: 'POST', url: `${Cypress.env('BVD_CONTEXT_ROOT')}/rest/${Cypress.env('API_VERSION')}/dataCollector` }).as('postDataCollector');
    cy.intercept({
      method: 'POST',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/dataCollector/channel`
    }).as('getChannelInfo');
  });

  after(() => {
    dataCollector.deleteAllQueries(bvdURL);
    cy.bvdLogout();
    role.roleDeletion(uifRole, false);
    role.roleDeletion(nonAdminWithDataCollectorRole, true);
    deleteTag(pageID, deletePageTag => {
      expect(deletePageTag.status).to.equal(200);
    });
  });

  it(`Verify that if a non admin does not have access of target page then it should not show it in drill down list`, () => {
    cy.bvdLogout();
    cy.bvdLogin(nonAdminuserName, nonAdminuserPwd);
    cy.visit('/drillDown2');
    cy.wait(['@getTOC', '@getChannelInfo']);
    selectValueFromOmnibar('USA');
    cy.get('[data-cy=drillDownButton]').should('not.exist');
  });
});
