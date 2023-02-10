const shared = require('../../../shared/shared');
import {
  checkPageOperationsForModifyPermission,
  checkPageOperationsForViewPermission,
  getPermission,
  checkPageLoadUnauthorized
} from '../../../shared/rbac/utils';

const data = {
  name: 'testRole',
  description: 'Test role for foundation'
};

let pageIDs;
describe('Page Operations - Member of specific group (nom)', shared.defaultTestOptions, () => {
  beforeEach(() => {
    pageIDs = ['pageA', 'pageB'];
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
    cy.bvdLogin();

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
      });
    });
  });

  it('Default actions are visible if user has view permission for memberOfSpecificGroup', () => {
    const roleViewMemberOfSpecificGroup = { ...data,
      permission: getPermission('View', 'View', 'exec',
        'default_action<>Group-nom', 'menu<>All', 'action<>All') };

    shared.testForRole(roleViewMemberOfSpecificGroup, () => {
      cy.visit('/pageA');
      cy.wait('@getTocEmpty');
      cy.wait(['@getPageA', '@getData', '@getTOC']);

      cy.get('[data-cy="page-action-button"]').click();
      checkPageOperationsForViewPermission();

      checkPageLoadUnauthorized('pageB');
    });
  });

  it('saveAs not enabled if user has modify permission for memberOfSpecificGroup', () => {
    const roleModifyMemberOfSpecificGroup = { ...data,
      permission: getPermission('Modify', 'View', 'exec',
        'default_action<>Group-nom', 'menu<>All', 'action<>All') };
    // eslint-disable-next-line camelcase
    roleModifyMemberOfSpecificGroup.permission.push({ operation_key: 'View', resource_key: 'default_action<>Group-nom' });
    shared.testForRole(roleModifyMemberOfSpecificGroup, () => {
      cy.visit('/pageA');
      cy.wait('@getTocEmpty');
      cy.wait(['@getPageA', '@getData', '@getTOC']);

      cy.get('[data-cy="page-action-button"]').click();
      checkPageOperationsForModifyPermission();
    });
  });

  afterEach(() => {
    cy.bvdLogout();
    cy.bvdLogin();
    shared.deletePages(pageIDs);
    shared.deleteRole(data);
  });
});
