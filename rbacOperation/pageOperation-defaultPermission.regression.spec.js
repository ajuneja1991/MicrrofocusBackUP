const shared = require('../../../shared/shared');
import {
  checkPageOperationsForViewPermission,
  checkPageOperationsForModifyPermission,
  checkPageOperationsForCreatePermission,
  checkPageOperationsForDeleteOrFullControlPermission,
  getPermission,
  checkSaveAndRevertActionsEnabled,
  checkPageOperationsForDeletePermission,
  checkPageOperationsForFullControlPermission
} from '../../../shared/rbac/utils';
const data = {
  name: 'testRole',
  description: 'Test role for foundation'
};

const groupedRoleData = {
  name: '__grouped',
  description: 'Default permission for all grouped pages'
};

const ungroupedRoleData = {
  name: '__ungrouped',
  description: 'Default permission for all ungrouped pages'
};

const unownedRoleData = {
  name: '__unowned',
  description: 'Default permission for all unowned pages'
};

let pageIDs;

describe('Page Operations - Default Permissions', shared.defaultTestOptions, () => {
  beforeEach(() => {
    pageIDs = ['uiTestGroupedPage', 'uiTestUnGroupedPage'];
    cy.intercept({
      method: 'POST',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/datasource/ws/data`
    }).as('getData');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/uiTestGroupedPage*`
    }).as('getGroupedPage');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/uiTestUnGroupedPage*`
    }).as('getunGroupedPage');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/uiTestunownedPage*`
    }).as('getunownedPage');
    cy.intercept({
      method: 'DELETE',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pages/*`
    }).as('deletePage');
    cy.intercept({
      method: 'POST',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pages`
    }).as('createPage');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pages/toc?onlyFullControl*`
    }).as('getTOC');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pages/toc?showEmpty*`
    }).as('getTocEmpty');
    cy.bvdLogin();
    const nomTag = [{ name: '__rbac', values: ['nom']}];
    const view = { type: 'mashup',
      options: { dashboardOptions: { columns: 12, rowHeight: 400 }},
      views: [{
        id: 'ui-test-simple-list',
        layout: { colSpan: 3, rowSpan: 1, resizable: true }
      },
      {
        id: 'ui-test-chart',
        layout: { colSpan: 6, rowSpan: 1, resizable: true }
      }]};

    shared.createNewPage('uiTestGroupedPage', 'uiTestGroupedPage', nomTag, view, groupedPage => {
      expect(groupedPage.status).to.equal(200);
      shared.createNewPage('uiTestUnGroupedPage', 'uiTestUnGroupedPage', null, view, unGroupedPage => {
        expect(unGroupedPage.status).to.equal(200);
      });
    });
  });

  it('Default Page actions enabled with FullControl for all to a user and grouped default template permission', () => {
    const roleFullControlAllPermissions = { ...data,
      permission: getPermission('FullControl', 'View', 'exec',
        'default_action<>All', 'menu<>All', 'action<>All') };
    const groupedRoleDefaultPermission = { ...groupedRoleData,
      permission: []};

    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/*`
    }).as('getTestDefaultPermission');

    shared.createRole(groupedRoleDefaultPermission);
    shared.testForRole(roleFullControlAllPermissions, () => {
      cy.visit('/uiTestGroupedPage');
      cy.wait('@getTocEmpty');
      cy.wait(['@getGroupedPage', '@getData', '@getData', '@getTOC']);

      cy.get('[data-cy="page-action-button"]').click();
      checkPageOperationsForDeleteOrFullControlPermission();
      cy.get('[data-cy="page-action-item-saveAs"]').click();
      // id will be replaced by data cy later
      cy.get('#pgmt-radio-button-definition > .ux-radio-button > .ux-radio-button-container').click();
      cy.get('[data-cy="pgmt-properties-definition-title"]').clear().type(`testDefaultPermission`);
      cy.get('[data-cy="submit-button"]').click();
      cy.wait('@createPage');
      cy.bvdCheckToast('Definition "testDefaultPermission" saved successfully');
      cy.wait([`@getTestDefaultPermission`, '@getData', '@getData', '@getTOC']);
      let createdPageId;
      cy.url().then(theUrl => {
        const theUrlObject = new URL(theUrl);
        createdPageId = theUrlObject.pathname.split('/')[2];
        cy.visit(`/${createdPageId}?_s=1574940600000&_e=1574940900000&_tft=A&_ctx=~(~(type~'host~id~'loadgen.mambo.net~name~'loadgen.mambo.net))`);
        cy.wait('@getTocEmpty');
        cy.wait([`@getTestDefaultPermission`, '@getData', '@getTOC']);
        cy.get('[data-cy="page-action-button"]').click();
        cy.get('[data-cy="page-action-item-save"]').click();
        // id will be replaced by data cy later
        cy.get('[data-cy="pgmt-properties-definition-title"]').clear().type(`testDefaultPermissionContext`);
        cy.intercept({
          method: 'PUT',
          path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pages/*`
        }).as('putTestDefaultPermission');
        cy.get('[data-cy="submit-button"]').click();
        cy.bvdCheckToast('Update of the definition was successful');
        cy.wait([`@putTestDefaultPermission`]);
        cy.get('[data-cy=breadcrumb-title-testDefaultPermissionContext]');
        checkSaveAndRevertActionsEnabled();
      });
    });
  });

  it('Default Page actions enabled with View for a group to a user and grouped default template permission', () => {
    const roleWithPageOperationsNoPermissions = { ...data,
      permission: [
      ]};
    const groupedRoleDefaultPermission = { ...groupedRoleData,
      permission: getPermission('View', 'View', 'exec',
        'default_action<>Group-nom', 'menu<>All', 'action<>All') };

    shared.createRole(groupedRoleDefaultPermission);
    shared.testForRole(roleWithPageOperationsNoPermissions, () => {
      cy.visit('/uiTestGroupedPage');
      cy.wait('@getTocEmpty');
      cy.wait(['@getGroupedPage', '@getData', '@getData', '@getTOC']);

      cy.get('[data-cy="page-action-button"]').click();
      checkPageOperationsForViewPermission();
    });
  });

  it('Default Page actions enabled with Create for a group to a user and grouped default template permission', () => {
    const roleWithPageOperationsNoPermissions = { ...data,
      permission: [
      ]};

    const groupedRoleDefaultPermission = { ...groupedRoleData,
      permission: getPermission('Create', 'View', 'exec',
        'default_action<>Group-nom', 'menu<>All', 'action<>All') };
    // eslint-disable-next-line camelcase
    groupedRoleDefaultPermission.permission.push({ operation_key: 'View', resource_key: 'default_action<>Group-nom' });
    shared.createRole(groupedRoleDefaultPermission);

    shared.testForRole(roleWithPageOperationsNoPermissions, () => {
      cy.visit('/uiTestGroupedPage');
      cy.wait('@getTocEmpty');
      cy.wait(['@getGroupedPage', '@getData', '@getData', '@getTOC']);

      cy.get('[data-cy="page-action-button"]').click();
      checkPageOperationsForCreatePermission();
    });
  });

  it('Default Page actions enabled with Modify for a group to a user and grouped default template permission', () => {
    const roleWithPageOperationsNoPermissions = { ...data,
      permission: [
      ]};

    const groupedRoleDefaultPermission = { ...groupedRoleData,
      permission: getPermission('Modify', 'View', 'exec',
        'default_action<>Group-nom', 'menu<>All', 'action<>All') };
    // eslint-disable-next-line camelcase
    groupedRoleDefaultPermission.permission.push({ operation_key: 'View', resource_key: 'default_action<>Group-nom' });
    shared.createRole(groupedRoleDefaultPermission);

    shared.testForRole(roleWithPageOperationsNoPermissions, () => {
      cy.visit('/uiTestGroupedPage');
      cy.wait('@getTocEmpty');
      cy.wait(['@getGroupedPage', '@getData', '@getData', '@getTOC']);
      cy.get('[data-cy="page-action-button"]').click();
      checkPageOperationsForModifyPermission();
    });
  });

  it('Default Page actions enabled with Delete for a group to a user and grouped default template permission', () => {
    const roleWithPageOperationsNoPermissions = { ...data,
      permission: [
      ]};

    const groupedRoleDefaultPermission = { ...groupedRoleData,
      permission: getPermission('Delete', 'View', 'exec',
        'default_action<>Group-nom', 'menu<>All', 'action<>All') };
    // eslint-disable-next-line camelcase
    groupedRoleDefaultPermission.permission.push({ operation_key: 'View', resource_key: 'default_action<>Group-nom' });
    shared.createRole(groupedRoleDefaultPermission);

    shared.testForRole(roleWithPageOperationsNoPermissions, () => {
      cy.visit('/uiTestGroupedPage');
      cy.wait('@getTocEmpty');
      cy.wait(['@getGroupedPage', '@getData', '@getData', '@getTOC']);

      cy.get('[data-cy="page-action-button"]').click();
      checkPageOperationsForDeletePermission();
    });
  });

  it('Default Page actions enabled with Delete for group to a user and default template permission load ungrouped page', () => {
    const roleWithPageOperationsNoPermissions = { ...data,
      permission: [
      ]};

    const groupedRoleDefaultPermission = { ...groupedRoleData,
      permission: getPermission('Delete', 'View', 'exec',
        'default_action<>Group-nom', 'menu<>All', 'action<>All') };

    shared.createRole(groupedRoleDefaultPermission);

    shared.testForRole(roleWithPageOperationsNoPermissions, () => {
      cy.visit('/uiTestUnGroupedPage');
      cy.wait('@getTocEmpty');
      cy.get('[data-cy=mondrianModalDialogButton]').click();
    });
  });

  it('Default Page actions enabled with FullControl for group to unowned and default template permission', () => {
    const roleWithPageOperationsNoPermissions = { ...data,
      permission: [
      ]};

    const groupedRoleDefaultPermission = { ...groupedRoleData,
      permission: []};

    const unownedRoleDefaultPermission = { ...unownedRoleData,
      permission: getPermission('FullControl', 'View', 'exec',
        'default_action<>Group-nom', 'menu<>All', 'action<>All') };

    shared.createRole(groupedRoleDefaultPermission);

    shared.createRole(unownedRoleDefaultPermission);

    shared.testForRole(roleWithPageOperationsNoPermissions, () => {
      cy.visit('/uiTestGroupedPage');
      cy.wait('@getTocEmpty');
      cy.wait(['@getGroupedPage', '@getData', '@getTOC']);

      cy.get('[data-cy="page-action-button"]').click();
      checkPageOperationsForFullControlPermission();
    });
  });

  it('Default Page actions enabled with FullControl for MemberOfNoGroup to a user and ungropued default template permission', () => {
    const roleWithPageOperationsFullControlAllPermissions = { ...data,
      permission: getPermission('FullControl', 'View', 'exec',
        'default_action<>MemberOfNoGroup', 'menu<>All', 'action<>All') };

    const ungroupedRoleDefaultPermission = { ...ungroupedRoleData,
      permission: []};

    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/*`
    }).as('saveForPageOperationsPermission');

    shared.createRole(ungroupedRoleDefaultPermission);
    shared.testForRole(roleWithPageOperationsFullControlAllPermissions, () => {
      cy.visit('/uiTestUnGroupedPage');
      cy.wait('@getTocEmpty');
      cy.wait(['@getunGroupedPage', '@getData', '@getData', '@getTOC']);

      cy.get('[data-cy="page-action-button"]').click();
      checkPageOperationsForFullControlPermission();
      cy.get('[data-cy="page-action-item-saveAs"]').click();
      // id will be replaced by data cy later
      cy.get('#pgmt-radio-button-definition > .ux-radio-button > .ux-radio-button-container').click();
      cy.get('[data-cy="pgmt-properties-definition-title"]').clear().type(`SaveForPageOperationsPermission`);
      cy.get('[data-cy="submit-button"]').click();
      cy.wait('@createPage');
      cy.bvdCheckToast('Definition "SaveForPageOperationsPermission" saved successfully');
      cy.wait([`@saveForPageOperationsPermission`, '@getData', '@getData', '@getTOC']);
      cy.get('[data-cy=breadcrumb-title-SaveForPageOperationsPermission]');
      let createdPageId;
      cy.url().then(theUrl => {
        const theUrlObject = new URL(theUrl);
        createdPageId = theUrlObject.pathname.split('/')[2];
        cy.visit(`/${createdPageId}?_s=1574940600000&_e=1574940900000&_tft=A&_ctx=~(~(type~'host~id~'loadgen.mambo.net~name~'loadgen.mambo.net))`);
        cy.wait('@getTocEmpty');
        cy.wait([`@saveForPageOperationsPermission`, '@getData', '@getData', '@getTOC']);
        cy.get('[data-cy="page-action-button"]').click();
        cy.get('[data-cy="page-action-item-saveAs"]').click();
        // id will be replaced by data cy later
        cy.get('#pgmt-radio-button-definition > .ux-radio-button > .ux-radio-button-container').click();
        cy.get('[data-cy="pgmt-properties-definition-title"]').clear().type(`SaveForPageOperationsPermissionContext`);
        cy.get('[data-cy="submit-button"]').click();
        cy.wait('@createPage');
        cy.bvdCheckToast('Definition "SaveForPageOperationsPermissionContext" saved successfully');
        cy.wait([`@saveForPageOperationsPermission`, '@getData', '@getData', '@getTOC']);
        cy.get('[data-cy=breadcrumb-title-SaveForPageOperationsPermissionContext]');
        checkSaveAndRevertActionsEnabled();
      });
    });
  });

  it('Default Page actions enabled with View for all to a user and ungrouped default template permission', () => {
    const roleWithPageOperationsNoPermissions = { ...data,
      permission: [
      ]};

    const ungroupedRoleDefaultPermission = { ...ungroupedRoleData,
      permission: getPermission('View', 'View', 'exec',
        'default_action<>All', 'menu<>All', 'action<>All') };

    shared.createRole(ungroupedRoleDefaultPermission);

    shared.testForRole(roleWithPageOperationsNoPermissions, () => {
      cy.visit('/uiTestUnGroupedPage');
      cy.wait('@getTocEmpty');
      cy.wait(['@getunGroupedPage', '@getData']);

      cy.get('[data-cy="page-action-button"]').click();
      checkPageOperationsForViewPermission();
    });
  });

  it('Default Page actions enabled with Modify for memberofnogroup to a user and ungrouped default template permission', () => {
    const roleWithPageOperationsNoPermissions = { ...data,
      permission: [
      ]};

    const ungroupedRoleDefaultPermission = { ...ungroupedRoleData,
      permission: getPermission('Modify', 'View', 'exec',
        'default_action<>MemberOfNoGroup', 'menu<>All', 'action<>All') };
    // eslint-disable-next-line camelcase
    ungroupedRoleDefaultPermission.permission.push({ operation_key: 'View', resource_key: 'default_action<>MemberOfNoGroup' });
    shared.createRole(ungroupedRoleDefaultPermission);

    shared.testForRole(roleWithPageOperationsNoPermissions, () => {
      cy.visit('/uiTestUnGroupedPage');
      cy.wait('@getTocEmpty');
      cy.wait(['@getunGroupedPage', '@getData', '@getData', '@getTOC']);
      cy.get('[data-cy="page-action-button"]').click();
      checkPageOperationsForModifyPermission();
    });
  });

  it('Default Page actions enabled with Delete for MemberOfNoGroup to a user and ungrouped default template permission', () => {
    const roleWithPageOperationsNoPermissions = { ...data,
      permission: [
      ]};

    const ungroupedRoleDefaultPermission = { ...ungroupedRoleData,
      permission: getPermission('Delete', 'View', 'exec',
        'default_action<>MemberOfNoGroup', 'menu<>All', 'action<>All') };
    // eslint-disable-next-line camelcase
    ungroupedRoleDefaultPermission.permission.push({ operation_key: 'View', resource_key: 'default_action<>MemberOfNoGroup' });
    shared.createRole(ungroupedRoleDefaultPermission);

    shared.testForRole(roleWithPageOperationsNoPermissions, () => {
      cy.visit('/uiTestUnGroupedPage');
      cy.wait('@getTocEmpty');
      cy.wait(['@getunGroupedPage', '@getData', '@getData', '@getTOC']);

      cy.get('[data-cy="page-action-button"]').click();
      checkPageOperationsForDeletePermission();
    });
  });

  afterEach(() => {
    cy.bvdLogout();
    cy.bvdLogin();
    shared.deletePages(pageIDs);
    shared.deletePages(['uiTestGroupedPage', 'uiTestUnGroupedPage', 'uiTestUnownedPage']);
    shared.deleteRole(data);
    shared.deleteRole(groupedRoleData);
    shared.deleteRole(ungroupedRoleData);
    shared.deleteRole(unownedRoleData);
  });
});
