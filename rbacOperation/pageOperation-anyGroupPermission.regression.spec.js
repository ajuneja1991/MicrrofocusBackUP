// <reference types="Cypress" />
const shared = require('../../../shared/shared');
import {
  checkPageOperationsForViewPermission,
  checkPageOperationsForCreatePermission,
  checkSaveAndRevertActionsEnabled,
  getRandomInt,
  getPermission,
  createPageWithTags,
  checkPageLoadUnauthorized,
  checkSaveAsFunctionalityWithOwnerPermission,
  checkPageOperationsForDeletePermission,
  checkPageOperationsForModifyPermission,
  checkPageOperationsForFullControlPermission
} from '../../../shared/rbac/utils';
const data = {
  name: 'testRole',
  description: 'Test role for foundation'
};
const pageIDs = [];

describe('Page Operations - MemberOfAnyGroup', shared.defaultTestOptions, () => {
  beforeEach(() => {
    cy.intercept({
      method: 'POST',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/datasource/ws/data`
    }).as('getData');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/pageWithNomTag*`
    }).as('getpageWithNomTag');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/pageWithoutTag*`
    }).as('getpageWithoutTag');
    cy.intercept({
      method: 'DELETE',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pages/*`
    }).as('deletePage');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pages/toc?onlyFullControl*`
    }).as('getTOC');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pages/toc?showEmpty*`
    }).as('getTocEmpty');
    cy.bvdLogin();
  });

  it('Page view should work if page is under some group, it should not work for the page with no group', () => {
    const roleViewMemberOfAnyGrp = { ...data,
      permission: getPermission('View', 'View', 'exec',
        'default_action<>MemberOfAnyGroup', 'menu<>All', 'action<>All') };

    const pageRandomPostId = getRandomInt();
    createPageWithTags(`pageWithNomTag${pageRandomPostId}`, `pageWithoutTag${pageRandomPostId}`);
    shared.testForRole(roleViewMemberOfAnyGrp, () => {
      cy.visit(`/pageWithNomTag${pageRandomPostId}`);
      cy.wait('@getTocEmpty');
      cy.wait(['@getpageWithNomTag', '@getData', '@getTOC']);
      cy.get('[data-cy="page-action-button"]').click();
      checkPageOperationsForViewPermission();

      checkPageLoadUnauthorized('pageWithoutTag', pageRandomPostId);
    });
  });

  it('Modify page operations saveAs should not work', () => {
    const roleModifyMemberOfAnyGrp = { ...data,
      permission: getPermission('Modify', 'View', 'exec',
        'default_action<>MemberOfAnyGroup', 'menu<>All', 'action<>All') };
    // eslint-disable-next-line camelcase
    roleModifyMemberOfAnyGrp.permission.push({ operation_key: 'View', resource_key: 'default_action<>MemberOfAnyGroup' });
    const pageRandomPostId = getRandomInt();
    createPageWithTags(`pageWithNomTag${pageRandomPostId}`, `pageWithoutTag${pageRandomPostId}`);
    shared.testForRole(roleModifyMemberOfAnyGrp, () => {
      cy.visit(`/pageWithNomTag${pageRandomPostId}`);
      cy.wait('@getTocEmpty');
      cy.wait(['@getpageWithNomTag', '@getData', '@getData']);

      cy.get('[data-cy="page-action-button"]').click();
      checkPageOperationsForModifyPermission();
      checkPageLoadUnauthorized('pageWithoutTag', pageRandomPostId);
    });
  });

  it('Create page operations like saveAs should work', () => {
    const roleCreateMemberOfAnyGrp = { ...data,
      permission: getPermission('Create', 'View', 'exec',
        'default_action<>MemberOfAnyGroup', 'menu<>All', 'action<>All') };
    // eslint-disable-next-line camelcase
    roleCreateMemberOfAnyGrp.permission.push({ operation_key: 'View', resource_key: 'default_action<>MemberOfAnyGroup' });
    const pageRandomPostId = getRandomInt();
    createPageWithTags(`pageWithNomTag${pageRandomPostId}`, `pageWithoutTag${pageRandomPostId}`);
    shared.testForRole(roleCreateMemberOfAnyGrp, () => {
      cy.visit(`/pageWithNomTag${pageRandomPostId}`);
      cy.wait('@getTocEmpty');
      cy.wait(['@getpageWithNomTag', '@getData', '@getData', '@getTOC']);

      cy.get('[data-cy="page-action-button"]').click();
      checkPageOperationsForCreatePermission();
      cy.get('[data-cy="page-action-button"]').type('{esc}');
      cy.get('[data-cy="page-action-item-saveAs"]').should('not.exist');
      cy.get('[data-cy="action-button"]').first().click();
      cy.get('[data-cy="action-button-duplicateWidget"]').click();
      cy.wait('@getData');
      cy.get('[data-cy="page-action-button"]').click();
      cy.get('[data-cy="page-action-item-saveAs"]').should('not.have.class', 'disabled');
      cy.get('[data-cy="page-action-item-revert"]').should('not.have.class', 'disabled');
      cy.get('[data-cy="page-action-button"]').type('{esc}');
      cy.get('[data-cy="page-action-item-saveAs"]').should('not.exist');
      checkSaveAsFunctionalityWithOwnerPermission();
      checkPageLoadUnauthorized('pageWithoutTag', pageRandomPostId);
    });
  });

  it('Delete page operation should work', () => {
    const roleDeleteMemberOfAnyGrp = { ...data,
      permission: getPermission('Delete', 'View', 'exec',
        'default_action<>MemberOfAnyGroup', 'menu<>All', 'action<>All') };
    // eslint-disable-next-line camelcase
    roleDeleteMemberOfAnyGrp.permission.push({ operation_key: 'View', resource_key: 'default_action<>MemberOfAnyGroup' });
    const pageRandomPostId = getRandomInt();
    createPageWithTags(`pageWithNomTag${pageRandomPostId}`, `pageWithoutTag${pageRandomPostId}`);
    shared.testForRole(roleDeleteMemberOfAnyGrp, () => {
      cy.visit(`/pageWithNomTag${pageRandomPostId}`);
      cy.wait('@getTocEmpty');
      cy.wait(['@getpageWithNomTag', '@getData', '@getData', '@getTOC']);

      cy.get('[data-cy="page-action-button"]').click();
      checkPageOperationsForDeletePermission();
      cy.get('[data-cy="page-action-item-delete"]').click();
      cy.get('[data-cy="mondrianModalDialogButton"]').click();
      cy.bvdCheckToast('Deleted page successfully');
      cy.wait('@deletePage');
      checkPageLoadUnauthorized('pageWithoutTag', pageRandomPostId, true);
    });
  });

  it('All page operations should work', () => {
    const roleFullCtrMemberOfAnyGrp = { ...data,
      permission: getPermission('FullControl', 'View', 'exec',
        'default_action<>MemberOfAnyGroup', 'menu<>All', 'action<>All') };

    const pageRandomPostId = getRandomInt();
    createPageWithTags(`pageWithNomTag${pageRandomPostId}`, `pageWithoutTag${pageRandomPostId}`);
    shared.testForRole(roleFullCtrMemberOfAnyGrp, () => {
      cy.visit(`/pageWithNomTag${pageRandomPostId}`);
      cy.wait('@getTocEmpty');
      cy.wait(['@getpageWithNomTag', '@getData', '@getData', '@getTOC']);

      cy.get('[data-cy="page-action-button"]').click();
      checkPageOperationsForFullControlPermission();
      cy.get('[data-cy="page-action-button"]').type('{esc}');
      checkSaveAndRevertActionsEnabled();

      checkSaveAsFunctionalityWithOwnerPermission();
      cy.wait(['@getData', '@getData', '@getData', '@getTOC']);
      cy.visit(`/pageWithNomTag${pageRandomPostId}`);
      cy.wait(['@getpageWithNomTag', '@getData', '@getData', '@getData', '@getTOC']);
      cy.url().should('include', 'pageWithNomTag');
      cy.get('[data-cy="page-action-button"]').click();
      checkPageOperationsForFullControlPermission();
      cy.get('[data-cy="page-action-item-delete"]').click();
      cy.get('[data-cy="page-action-item-delete"]').should('not.exist');
      cy.get('[data-cy="mondrianModalDialogButton"]').click();
      cy.bvdCheckToast('Deleted page successfully');
      cy.wait('@deletePage');

      checkPageLoadUnauthorized('pageWithoutTag', pageRandomPostId);
    });
  });

  afterEach(() => {
    cy.bvdLogout();
    cy.bvdLogin();
    shared.deletePages(pageIDs);
    shared.deleteRole(data);
  });
});
