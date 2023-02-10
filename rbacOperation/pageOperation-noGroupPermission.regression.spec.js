// <reference types="Cypress" />
const shared = require('../../../shared/shared');
import {
  checkPageOperationsForViewPermission,
  checkPageOperationsForModifyPermission,
  checkPageOperationsForCreatePermission,
  checkPageOperationsForDeleteOrFullControlPermission,
  checkSaveAndRevertActionsEnabled,
  checkPageLoadUnauthorized,
  createPageWithTagsNoGroup,
  getRandomInt,
  getPermission,
  checkPageOperationsForDeletePermission
} from '../../../shared/rbac/utils';
const data = {
  name: 'testRole',
  description: 'Test role for foundation'
};
const pageIDs = ['testSavePageWithContextForPageOperationsPermission'];

describe('Page Operations - MemberOfNoGroup', shared.defaultTestOptions, () => {
  beforeEach(() => {
    cy.intercept({
      method: 'POST',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/datasource/ws/data`
    }).as('getData');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/uiTestRBACPageOperations*`
    }).as('getWidgetPage');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/uiTestActions*`
    }).as('getActionPage');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/pageWithTag*`
    }).as('getpageWithTag');
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
    shared.deletePages(pageIDs);
    shared.deleteRole(data);
  });

  it('Default actions are visible if user has view permission for memberOfNoGroup', () => {
    const roleViewMemberOfNoGroupPermissions = { ...data,
      permission: getPermission('View', 'View', 'exec',
        'default_action<>MemberOfNoGroup', 'menu<>All', 'action<>All') };

    const pageRandomPostId = getRandomInt();
    createPageWithTagsNoGroup(`pageWithTag${pageRandomPostId}`, pageIDs);
    shared.testForRole(roleViewMemberOfNoGroupPermissions, () => {
      cy.visit('/uiTestRBACPageOperations');
      cy.wait('@getTocEmpty');
      cy.wait(['@getWidgetPage', '@getData', '@getTOC']);

      cy.get('[data-cy="page-action-button"]').click();
      checkPageOperationsForViewPermission();

      checkPageLoadUnauthorized('pageWithTag', pageRandomPostId);
    });
  });

  it('Default action Save is enabled if user has modify permission for memberOfNoGroup', () => {
    const roleModifyMemberOfNoGroupPermissions = { ...data,
      permission: getPermission('Modify', 'View', 'exec',
        'default_action<>MemberOfNoGroup', 'menu<>All', 'action<>All') };
    // eslint-disable-next-line camelcase
    roleModifyMemberOfNoGroupPermissions.permission.push({ operation_key: 'View', resource_key: 'default_action<>MemberOfNoGroup' });
    const randomPostFixId = getRandomInt();
    createPageWithTagsNoGroup(`pageWithTag${randomPostFixId}`, pageIDs);
    shared.testForRole(roleModifyMemberOfNoGroupPermissions, () => {
      cy.visit('/uiTestRBACPageOperations');
      cy.wait('@getTocEmpty');
      cy.wait(['@getWidgetPage', '@getData', '@getTOC']);

      cy.get('[data-cy="page-action-button"]').click();
      checkPageOperationsForModifyPermission();
    });
  });

  it('Default actions like saveAs are enabled if user has create permission for memberOfNoGroup', () => {
    const roleCreateMemberOfNoGroupPermissions = { ...data,
      permission: getPermission('Create', 'View', 'exec',
        'default_action<>MemberOfNoGroup', 'menu<>All', 'action<>All') };
    // eslint-disable-next-line camelcase
    roleCreateMemberOfNoGroupPermissions.permission.push({ operation_key: 'View', resource_key: 'default_action<>MemberOfNoGroup' });
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/*`
    }).as('saveAsPage');

    const randomPostFixId = getRandomInt();
    createPageWithTagsNoGroup(`pageWithTag${randomPostFixId}`, pageIDs);
    shared.testForRole(roleCreateMemberOfNoGroupPermissions, () => {
      cy.visit('/uiTestRBACPageOperations');
      cy.wait('@getTocEmpty');
      cy.wait(['@getWidgetPage', '@getData', '@getTOC']);

      cy.get('[data-cy="page-action-button"]').click();
      checkPageOperationsForCreatePermission();
      cy.get('[data-cy="page-action-item-saveAs"]').click();
      // id will be replaced by data cy later
      cy.get('#pgmt-radio-button-definition > .ux-radio-button > .ux-radio-button-container').click();
      cy.get('[data-cy="pgmt-properties-definition-title"]').clear().type(`SaveAsPageForOP`);
      cy.get('[data-cy="submit-button"]').click();
      cy.wait('@createPage');
      cy.bvdCheckToast('Definition "SaveAsPageForOP" saved successfully');
      cy.wait([`@saveAsPage`, '@getData', '@getTOC']);
      let createdPageId;
      cy.url().then(theUrl => {
        const theUrlObject = new URL(theUrl);
        createdPageId = theUrlObject.pathname.split('/')[2];
        cy.visit(`/${createdPageId}?_s=1574940600000&_e=1574940900000&_tft=A&_ctx=~(~(type~'host~id~'loadgen.mambo.net~name~'loadgen.mambo.net))`);
        cy.wait('@getTocEmpty');
        cy.wait([`@saveAsPage`, '@getData']);
        cy.get('[data-cy="page-action-button"]').click();
        cy.get('[data-cy="page-action-item-saveAs"]').click();
        // id will be replaced by data cy later
        cy.get('#pgmt-radio-button-definition > .ux-radio-button > .ux-radio-button-container').click();
        cy.get('[data-cy="pgmt-properties-definition-title"]').clear().type(`SaveAsPageForOPContext`);
        cy.get('[data-cy="submit-button"]').click();
        cy.wait('@createPage');
        cy.bvdCheckToast('Definition "SaveAsPageForOPContext" saved successfully');
        cy.wait([`@saveAsPage`, '@getData', '@getTOC']);
        cy.get('[data-cy=breadcrumb-title-SaveAsPageForOPContext]');
        checkSaveAndRevertActionsEnabled();
        checkPageLoadUnauthorized('pageWithTag', randomPostFixId);
      });
    });
  });

  it('Default action deletePage is enabled if user has delete permission for memberOfNoGroup', () => {
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/pageToDelete*`
    }).as('getPageToDelete');
    cy.intercept({
      method: 'DELETE',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pages/*`
    }).as('deletePage');

    const roleDeleteMemberOfNoGroupPermissions = { ...data,
      permission: getPermission('Delete', 'View', 'exec',
        'default_action<>MemberOfNoGroup', 'menu<>All', 'action<>All') };
    // eslint-disable-next-line camelcase
    roleDeleteMemberOfNoGroupPermissions.permission.push({ operation_key: 'View', resource_key: 'default_action<>MemberOfNoGroup' });
    const pageRandomPostId = getRandomInt();
    createPageWithTagsNoGroup(`pageWithTag${pageRandomPostId}`, pageIDs);
    shared.createNewPage(`pageToDelete${pageRandomPostId}`, `PageToDelete${pageRandomPostId}`, null, null, pageToDeleteRes => {
      expect(pageToDeleteRes.status).to.equal(200);
      pageIDs.push(`pageToDelete${pageRandomPostId}`);
      shared.testForRole(roleDeleteMemberOfNoGroupPermissions, () => {
        cy.visit(`/pageToDelete${pageRandomPostId}`);
        cy.wait('@getTocEmpty');
        cy.wait(['@getPageToDelete', '@getTOC']);

        cy.get('[data-cy="page-action-button"]').click();
        checkPageOperationsForDeletePermission();

        cy.get('[data-cy="page-action-item-delete"]').click();
        cy.get('[data-cy="mondrianModalDialogButton"]').click();
        cy.bvdCheckToast('Deleted page successfully');
        cy.wait(['@deletePage', '@getTOC']);

        checkPageLoadUnauthorized('pageWithTag', pageRandomPostId);
      });
    });
  });

  it('Default actions are visible and enabled if user has full control permission for memberOfNoGroup', () => {
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/pageToDelete*`
    }).as('getPageToDelete');
    cy.intercept({
      method: 'DELETE',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pages/*`
    }).as('deletePage');

    const roleFullControlMemberOfNoGroupPermissions = { ...data,
      permission: getPermission('FullControl', 'View', 'exec',
        'default_action<>MemberOfNoGroup', 'menu<>All', 'action<>All') };

    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/*`
    }).as('saveAsPage');

    const pageRandomPostId = getRandomInt();
    shared.createNewPage(`pageToDelete${pageRandomPostId}`, `pageToDelete${pageRandomPostId}`, null, null, pageToDeleteRes => {
      expect(pageToDeleteRes.status).to.equal(200);
      pageIDs.push(`pageToDelete${pageRandomPostId}`);
      shared.testForRole(roleFullControlMemberOfNoGroupPermissions, () => {
        cy.visit('/uiTestRBACPageOperations');
        cy.wait('@getTocEmpty');
        cy.wait(['@getWidgetPage', '@getData', '@getTOC']);

        cy.get('[data-cy="page-action-button"]').click();
        checkPageOperationsForDeleteOrFullControlPermission();
        cy.get('[data-cy="page-action-item-saveAs"]').click();
        // id will be replaced by data cy later
        cy.get('#pgmt-radio-button-definition > .ux-radio-button > .ux-radio-button-container').click();
        cy.get('[data-cy="pgmt-properties-definition-title"]').clear().type(`SaveAsPageForOP`);
        cy.get('[data-cy="submit-button"]').click();
        cy.wait('@createPage');
        cy.bvdCheckToast('Definition "SaveAsPageForOP" saved successfully');
        cy.wait([`@saveAsPage`, '@getData', '@getTOC']);
        let createdPageId;
        cy.url().then(theUrl => {
          const theUrlObject = new URL(theUrl);
          createdPageId = theUrlObject.pathname.split('/')[2];
          cy.visit(`/${createdPageId}?_s=1574940600000&_e=1574940900000&_tft=A&_ctx=~(~(type~'host~id~'loadgen.mambo.net~name~'loadgen.mambo.net))`);
          cy.wait('@getTocEmpty');
          cy.wait([`@saveAsPage`, '@getData']);
          cy.get('[data-cy="page-action-button"]').click();
          cy.get('[data-cy="page-action-item-saveAs"]').click();
          // id will be replaced by data cy later
          cy.get('#pgmt-radio-button-definition > .ux-radio-button > .ux-radio-button-container').click();
          cy.get('[data-cy="pgmt-properties-definition-title"]').clear().type(`SaveAsPageForOPContext`);
          cy.get('[data-cy="submit-button"]').click();
          cy.wait('@createPage');
          cy.bvdCheckToast('Definition "SaveAsPageForOPContext" saved successfully');
          cy.wait([`@saveAsPage`, '@getData', '@getTOC']);
          cy.get('[data-cy=breadcrumb-title-SaveAsPageForOPContext]');
          checkSaveAndRevertActionsEnabled();
          cy.get('[data-cy="page-action-button"]').click();
          cy.get('[data-cy="page-action-item-delete"]').click();
          cy.get('[data-cy="mondrianModalDialogButton"]').click();
          cy.bvdCheckToast('Deleted page successfully');
          cy.wait('@deletePage');
        });
      });
    });
  });

  afterEach(() => {
    cy.bvdLogout();
  });
});
