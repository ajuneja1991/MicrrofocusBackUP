const shared = require('../../../shared/shared');
import {
  checkPageOperationsForCreatePermission,
  checkPageOperationsForDeleteOrFullControlPermission,
  getPermission,
  checkSaveAsFunctionality,
  checkSaveAsWithContextFunctionality,
  checkSaveAndRevertActionsEnabled,
  checkPageLoadUnauthorized
} from '../../../shared/rbac/utils';

const data = {
  name: 'testRole',
  description: 'Test role for foundation'
};
const pageIDs = [];

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

function createTagsForPage(tagId, tagWithContextId) {
  const pageView = { type: 'mashup',
    options: { dashboardOptions: { columns: 12, rowHeight: 400 }},
    views: [{
      id: 'ui-test-simple-list',
      layout: { colSpan: 3, rowSpan: 1, resizable: true }
    },
    {
      id: 'ui-test-chart',
      layout: { colSpan: 6, rowSpan: 1, resizable: true }
    }]};
  const nomTag = [{ name: '__rbac', values: ['nom']}];
  const dcaTag = [{ name: '__rbac', values: ['dca']}];
  shared.createNewPage('pageA', 'PageA', nomTag, pageView, pageARes => {
    expect(pageARes.status).to.equal(200);
    shared.createNewPage('pageB', 'PageB', dcaTag, null, pageBRes => {
      expect(pageBRes.status).to.equal(200);
      createTag('nom', `test${tagId}`, pageSaveRes => {
        expect(pageSaveRes.status).to.equal(200);
        createTag('nom', `test${tagWithContextId}`, contextPageResponse => {
          expect(contextPageResponse.status).to.equal(200);
        });
      });
    });
  });
}

describe('Page Operations - Member of specific group (nom) and tags', shared.defaultTestOptions, () => {
  beforeEach(() => {
    cy.intercept({
      method: 'POST',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/datasource/ws/data`
    }).as('getData');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/pageA*`
    }).as('getPageA');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/pageB*`
    }).as('getpageB');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pages/toc?onlyFullControl*`
    }).as('getTOC');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pages/toc?showEmpty*`
    }).as('getTocEmpty');
    cy.intercept({
      method: 'POST',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pages`
    }).as('createPage');
    cy.bvdLogin();
  });

  it('should be possible to saveAs a page if the page is not part of the group permission', () => {
    const roleModifyMemberOfSpecificGroup = { ...data,
      permission: getPermission('Create', 'View', 'exec',
        'default_action<>Group-nom', 'menu<>All', 'action<>All') };
    // eslint-disable-next-line camelcase
    roleModifyMemberOfSpecificGroup.permission.push({ operation_key: 'View', resource_key: 'default_action<>Group-nom' });
    // testSavePageForPageOP__2394-023904823
    // const randomId = getRandomInt();
    const tagId = 'SavePageForPageOP';
    const tagWithContextId = 'SavePageWithContextForPageOP';
    createTagsForPage(`${tagId}`, `${tagWithContextId}`);
    shared.testForRole(roleModifyMemberOfSpecificGroup, () => {
      cy.visit('/pageA');
      cy.wait('@getTocEmpty');
      cy.wait(['@getPageA', '@getData', '@getTOC']);

      cy.get('[data-cy="page-action-button"]').click();
      checkPageOperationsForCreatePermission();
      cy.get('[data-cy="page-action-item-saveAs"]').click();
      // id will be replaced by data cy later
      cy.get('#pgmt-radio-button-definition > .ux-radio-button > .ux-radio-button-container').click();
      cy.get('[data-cy="pgmt-properties-definition-title"]').clear().type(`SaveAsPageForOP`);
      cy.get('[data-cy="submit-button"]').click();
      cy.wait('@createPage');
      cy.bvdCheckToast('Definition "SaveAsPageForOP" saved successfully');
      // tbd: will be fixed later
      /* cy.get('#modal-title').invoke('text').then(text => {
        expect(text).to.equal('UNAUTHORIZED');
      });*/
    });
  });

  // Skipping because we need the tags to be specified in the UI (currently it is not implemented in the pgmt feature).
  // The test creates the tags for the nom group in advance. For that the page id needs to be known. With the change that the
  // page id is generated with an UUID it is not possible to know the id in advance.
  // eslint-disable-next-line mocha/no-skipped-tests
  it.skip('Default actions like saveAs are enabled if user has Create permission for memberOfSpecificGroup', () => {
    const roleCreateMemberOfSpecificGroup = { ...data,
      permission: getPermission('Create', 'View', 'exec',
        'default_action<>Group-nom', 'menu<>All', 'action<>All') };
    // eslint-disable-next-line camelcase
    roleCreateMemberOfSpecificGroup.permission.push({ operation_key: 'View', resource_key: 'default_action<>Group-nom' });
    const tagId = 'SavePageForPageOP';
    const tagWithContextId = 'SavePageWithContextForPageOP';
    createTagsForPage(`${tagId}`, `${tagWithContextId}`);
    shared.testForRole(roleCreateMemberOfSpecificGroup, () => {
      cy.visit('/pageA');
      cy.wait('@getTocEmpty');
      cy.wait(['@getPageA', '@getData', '@getTOC']);

      cy.get('[data-cy="page-action-button"]').click();
      checkPageOperationsForCreatePermission();

      checkSaveAsFunctionality(tagId);
      cy.visit('/pageA?_s=1574940600000&_e=1574940900000&_tft=A&_ctx=~(~(type~\'host~id~\'loadgen.mambo.net~name~\'loadgen.mambo.net))');
      cy.wait('@getTocEmpty');
      cy.wait(['@getPageA', '@getData', '@getTOC']);
      checkSaveAsWithContextFunctionality(tagWithContextId);
      cy.visit('/pageA');
      cy.wait('@getTocEmpty');
      cy.wait(['@getPageA', '@getData', '@getTOC']);
      checkSaveAndRevertActionsEnabled();
      checkPageLoadUnauthorized('pageB');
    });
  });

  // Skipping because we need the tags to be specified in the UI (currently it is not implemented in the pgmt feature).
  // The test creates the tags for the nom group in advance. For that the page id needs to be known. With the change that the
  // page id is generated with an UUID it is not possible to know the id in advance.
  // eslint-disable-next-line mocha/no-skipped-tests
  it.skip('Default action deletePage is enabled if user has delete permission for memberOfSpecificGroup', () => {
    cy.intercept({
      method: 'DELETE',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pages/*`
    }).as('deletePage');

    const roleDeleteMemberOfSpecificGroup = { ...data,
      permission: getPermission('Delete', 'View', 'exec',
        'default_action<>Group-nom', 'menu<>All', 'action<>All') };
    // eslint-disable-next-line camelcase
    roleDeleteMemberOfSpecificGroup.permission.push({ operation_key: 'View', resource_key: 'default_action<>Group-nom' });
    const tagId = 'SavePageForPageOP';
    const tagWithContextId = 'SavePageWithContextForPageOP';
    createTagsForPage(`${tagId}`, `${tagWithContextId}`);
    shared.testForRole(roleDeleteMemberOfSpecificGroup, () => {
      cy.visit('/pageA');
      cy.wait('@getTocEmpty');
      cy.wait(['@getPageA', '@getData', '@getTOC']);

      cy.get('[data-cy="page-action-button"]').click();
      checkPageOperationsForDeleteOrFullControlPermission();

      checkSaveAsFunctionality(tagId);
      cy.visit('/pageA?_s=1574940600000&_e=1574940900000&_tft=A&_ctx=~(~(type~\'host~id~\'loadgen.mambo.net~name~\'loadgen.mambo.net))');
      cy.wait('@getTocEmpty');
      cy.wait(['@getPageA', '@getData', '@getTOC']);
      checkSaveAsWithContextFunctionality(tagWithContextId);
      cy.visit('/pageA');
      cy.wait('@getTocEmpty');
      cy.wait(['@getPageA', '@getData', '@getTOC']);
      checkSaveAndRevertActionsEnabled();

      cy.get('[data-cy="page-action-button"]').click();
      cy.get('[data-cy="page-action-item-deletePage"]').click();
      cy.get('[data-cy="mondrianModalDialogButton"]').click();
      cy.bvdCheckToast('Deleted page successfully');
      cy.wait('@deletePage');
      checkPageLoadUnauthorized('pageB');
    });
  });

  // Skipping because we need the tags to be specified in the UI (currently it is not implemented in the pgmt feature).
  // The test creates the tags for the nom group in advance. For that the page id needs to be known. With the change that the
  // page id is generated with an UUID it is not possible to know the id in advance.
  // eslint-disable-next-line mocha/no-skipped-tests
  it.skip('Default actions are visible and enabled if user has full control permission for memberOfSpecificGroup', () => {
    cy.intercept({
      method: 'DELETE',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pages/*`
    }).as('deletePage');

    const roleFullControlMemberOfSpecificGroup = { ...data,
      permission: getPermission('FullControl', 'View', 'exec',
        'default_action<>Group-nom', 'menu<>All', 'action<>All') };

    const tagId = 'SavePageForPageOP';
    const tagWithContextId = 'SavePageWithContextForPageOP';
    createTagsForPage(`${tagId}`, `${tagWithContextId}`);
    shared.testForRole(roleFullControlMemberOfSpecificGroup, () => {
      cy.visit('/pageA');
      cy.wait('@getTocEmpty');
      cy.wait(['@getPageA', '@getData', '@getTOC']);

      cy.get('[data-cy="page-action-button"]').click();
      checkPageOperationsForDeleteOrFullControlPermission();

      // const randomId = getRandomInt();
      checkSaveAsFunctionality(tagId, pageIDs);
      cy.visit('/pageA?_s=1574940600000&_e=1574940900000&_tft=A&_ctx=~(~(type~\'host~id~\'loadgen.mambo.net~name~\'loadgen.mambo.net))');
      cy.wait('@getTocEmpty');
      cy.wait(['@getPageA', '@getData', '@getTOC']);
      checkSaveAsWithContextFunctionality(tagWithContextId, pageIDs);
      cy.visit('/pageA');
      cy.wait('@getTocEmpty');
      cy.wait(['@getPageA', '@getData', '@getTOC']);
      checkSaveAndRevertActionsEnabled();

      cy.get('[data-cy="page-action-button"]').click();
      cy.get('[data-cy="page-action-item-deletePage"]').click();
      cy.get('[data-cy="mondrianModalDialogButton"]').click();
      cy.bvdCheckToast('Deleted page successfully');
      cy.wait('@deletePage');
      checkPageLoadUnauthorized('pageB');
    });
  });

  afterEach(() => {
    cy.bvdLogout();
    cy.bvdLogin();
    const tagId = 'testSavePageForPageOP';
    const tagWithContextId = 'testSavePageWithContextForPageOP';
    deleteTag(tagId, deleteSavePageTag => {
      expect(deleteSavePageTag.status).to.equal(200);
      deleteTag(tagWithContextId, deleteSavePageContextTag => {
        expect(deleteSavePageContextTag.status).to.equal(200);
        shared.deletePages([tagId, tagWithContextId, 'pageA', 'pageB']);
        shared.deleteRole(data);
      });
    });
  });
});
