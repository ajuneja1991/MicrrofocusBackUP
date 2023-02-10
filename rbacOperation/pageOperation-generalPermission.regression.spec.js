// <reference types="Cypress" />
const shared = require('../../../shared/shared');
import {
  checkPageOperationsForViewPermission,
  checkPageOperationsForModifyPermission,
  checkPageOperationsForCreatePermission,
  checkPageOperationsForDeleteOrFullControlPermission,
  checkSaveAndRevertActionsEnabled,
  getRandomInt,
  getPermission,
  checkPageOperationsForDeletePermission
} from '../../../shared/rbac/utils';
const data = {
  name: 'testRole',
  description: 'Test role for foundation'
};
const pageIDs = [];

describe('Page Operations - All', shared.defaultTestOptions, () => {
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
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pages/toc?onlyFullControl*`
    }).as('getTOC');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/pageToDelete*`
    }).as('getPageToDelete');
    cy.intercept({
      method: 'DELETE',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pages/*`
    }).as('deletePage');
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

  it('Default actions are visible if user has view permission for all', () => {
    const roleWithPageOperationsViewAllPermissions = { ...data,
      permission: getPermission('View', 'View', 'exec',
        'default_action<>All', 'menu<>All', 'action<>All') };

    shared.testForRole(roleWithPageOperationsViewAllPermissions, () => {
      cy.visit('/uiTestRBACPageOperations');
      cy.wait('@getTocEmpty');
      cy.wait(['@getWidgetPage', '@getData', '@getTOC']);

      cy.get('[data-cy="page-action-button"]').click();
      checkPageOperationsForViewPermission();
    });
  });

  it('Default actions like saveAs are not enabled if user has modify permission for all', () => {
    const roleWithPageOperationsModifyAllPermissions = { ...data,
      permission: getPermission('Modify', 'View', 'exec',
        'default_action<>All', 'menu<>All', 'action<>All') };
      // eslint-disable-next-line camelcase
    roleWithPageOperationsModifyAllPermissions.permission.push({ operation_key: 'View', resource_key: 'default_action<>All' });
    shared.testForRole(roleWithPageOperationsModifyAllPermissions, () => {
      cy.visit('/uiTestRBACPageOperations');
      cy.wait('@getTocEmpty');
      cy.wait(['@getWidgetPage', '@getData', '@getTOC']);

      cy.get('[data-cy="page-action-button"]').click();
      checkPageOperationsForModifyPermission();
    });
  });

  it('Default actions like saveAs are enabled if user has create permission for all', () => {
    const roleWithPageOperationsCreateAllPermissions = { ...data,
      permission: getPermission('Create', 'View', 'exec',
        'default_action<>All', 'menu<>All', 'action<>All') };
    // eslint-disable-next-line camelcase
    roleWithPageOperationsCreateAllPermissions.permission.push({ operation_key: 'View', resource_key: 'default_action<>All' });
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/*`
    }).as('saveForPageOperationsPermission');

    shared.testForRole(roleWithPageOperationsCreateAllPermissions, () => {
      cy.visit('/uiTestRBACPageOperations');
      cy.wait('@getTocEmpty');
      cy.wait(['@getWidgetPage', '@getData', '@getTOC']);

      cy.get('[data-cy="page-action-button"]').click();
      checkPageOperationsForCreatePermission();
      cy.get('[data-cy="page-action-item-saveAs"]').click();
      // id will be replaced by data cy later
      cy.get('#pgmt-radio-button-definition > .ux-radio-button > .ux-radio-button-container').click();
      cy.get('[data-cy="pgmt-properties-definition-title"]').clear().type(`SaveForPageOperationsPermission`);
      cy.get('[data-cy="submit-button"]').click();
      cy.wait('@createPage');
      cy.bvdCheckToast('Definition "SaveForPageOperationsPermission" saved successfully');
      cy.wait([`@saveForPageOperationsPermission`, '@getData', '@getTOC']);
      let createdPageId;
      cy.url().then(theUrl => {
        const theUrlObject = new URL(theUrl);
        createdPageId = theUrlObject.pathname.split('/')[2];
        cy.visit(`/${createdPageId}?_s=1574940600000&_e=1574940900000&_tft=A&_ctx=~(~(type~'host~id~'loadgen.mambo.net~name~'loadgen.mambo.net))`);
        cy.wait('@getTocEmpty');
        cy.wait([`@saveForPageOperationsPermission`, '@getData']);
        cy.get('[data-cy="page-action-button"]').click();
        cy.get('[data-cy="page-action-item-saveAs"]').click();
        // id will be replaced by data cy later
        cy.get('#pgmt-radio-button-definition > .ux-radio-button > .ux-radio-button-container').click();
        cy.get('[data-cy="pgmt-properties-definition-title"]').clear().type(`SaveForPageOperationsPermissionContext`);
        cy.get('[data-cy="submit-button"]').click();
        cy.wait('@createPage');
        cy.bvdCheckToast('Definition "SaveForPageOperationsPermissionContext" saved successfully');
        cy.wait([`@saveForPageOperationsPermission`, '@getData', '@getTOC']);
        cy.get('[data-cy=breadcrumb-title-SaveForPageOperationsPermissionContext]');
        checkSaveAndRevertActionsEnabled();
      });
    });
  });

  it('Default action deletePage is enabled if user has delete permission for all', () => {
    const roleWithPageOperationsDeletePermissions = { ...data,
      permission: getPermission('Delete', 'View', 'exec',
        'default_action<>All', 'menu<>All', 'action<>All') };
    // eslint-disable-next-line camelcase
    roleWithPageOperationsDeletePermissions.permission.push({ operation_key: 'View', resource_key: 'default_action<>All' });
    const pageToDelete = `pageToDelete${getRandomInt()}`;
    pageIDs.push(pageToDelete);
    shared.createNewPage(pageToDelete, pageToDelete, null, null, pageToDeleteRes => {
      expect(pageToDeleteRes.status).to.equal(200);
      shared.testForRole(roleWithPageOperationsDeletePermissions, () => {
        cy.visit(`/${pageToDelete}`);
        cy.wait('@getTocEmpty');
        cy.wait(['@getPageToDelete', '@getTOC']);

        cy.get('[data-cy="page-action-button"]').click();
        checkPageOperationsForDeletePermission();

        cy.get('[data-cy="page-action-item-delete"]').click();
        cy.get('[data-cy="mondrianModalDialogButton"]').click();
        cy.bvdCheckToast('Deleted page successfully');
        cy.wait('@deletePage');
      });
    });
  });

  it('Default actions are visible and enabled if user has full control permission for all', () => {
    const roleWithPageOperationsFullControlAllPermissions = { ...data,
      permission: getPermission('FullControl', 'View', 'exec',
        'default_action<>All', 'menu<>All', 'action<>All') };

    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/*`
    }).as('saveForPageOperationsPermission');

    shared.testForRole(roleWithPageOperationsFullControlAllPermissions, () => {
      cy.visit('/uiTestRBACPageOperations');
      cy.wait('@getTocEmpty');
      cy.wait(['@getWidgetPage', '@getData', '@getTOC']);

      cy.get('[data-cy="page-action-button"]').click();
      checkPageOperationsForDeleteOrFullControlPermission();
      cy.get('[data-cy="page-action-item-saveAs"]').click();
      // id will be replaced by data cy later
      cy.get('#pgmt-radio-button-definition > .ux-radio-button > .ux-radio-button-container').click();
      cy.get('[data-cy="pgmt-properties-definition-title"]').clear().type(`SaveForPageOperationsPermission`);
      cy.get('[data-cy="submit-button"]').click();
      cy.wait('@createPage');
      cy.bvdCheckToast('Definition "SaveForPageOperationsPermission" saved successfully');
      cy.wait([`@saveForPageOperationsPermission`, '@getData', '@getTOC']);
      let createdPageId;
      cy.url().then(theUrl => {
        const theUrlObject = new URL(theUrl);
        createdPageId = theUrlObject.pathname.split('/')[2];
        cy.visit(`/${createdPageId}?_s=1574940600000&_e=1574940900000&_tft=A&_ctx=~(~(type~'host~id~'loadgen.mambo.net~name~'loadgen.mambo.net))`);
        cy.wait('@getTocEmpty');
        cy.wait([`@saveForPageOperationsPermission`, '@getData']);
        cy.get('[data-cy="page-action-button"]').click();
        cy.get('[data-cy="page-action-item-saveAs"]').click();
        // id will be replaced by data cy later
        cy.get('#pgmt-radio-button-definition > .ux-radio-button > .ux-radio-button-container').click();
        cy.get('[data-cy="pgmt-properties-definition-title"]').clear().type(`SaveForPageOperationsPermissionContext`);
        cy.get('[data-cy="submit-button"]').click();
        cy.wait('@createPage');
        cy.bvdCheckToast('Definition "SaveForPageOperationsPermissionContext" saved successfully');
        cy.wait([`@saveForPageOperationsPermission`, '@getData', '@getTOC']);
        cy.get('[data-cy=breadcrumb-title-SaveForPageOperationsPermissionContext]');
        checkSaveAndRevertActionsEnabled();
        cy.visit('/uiTestActions');
        cy.wait(['@getActionPage', '@getData', '@getTOC']);
        cy.get('[data-cy="page-action-button"]').click();
        cy.get('[data-cy="page-action-item-revert"]').should('have.class', 'disabled');
      });
    });
  });

  it('Page and page action menu are not visible if user has no permission', () => {
    const roleWithPageOperationsNoPermissions = { ...data,
      permission: [
        // eslint-disable-next-line camelcase
        { operation_key: 'View', resource_key: 'menu<>All' },
        // eslint-disable-next-line camelcase
        { operation_key: 'exec', resource_key: 'action<>All' }
      ]};

    shared.testForRole(roleWithPageOperationsNoPermissions, () => {
      cy.visit('/uiTestRBACPageOperations');
      cy.wait('@getTocEmpty');
      cy.wait('@getWidgetPage').its('response.statusCode').should('eq', 401);

      cy.get('#modal-title').invoke('text').then(text => {
        expect(text).to.equal('UNAUTHORIZED');
      });
    });
  });

  afterEach(() => {
    cy.bvdLogout();
    cy.bvdLogin();
    shared.deletePages(pageIDs);
    shared.deleteRole(data);
  });
});
