const shared = require('../../shared/shared');

function checkPageOperationsForViewPermission() {
  cy.get('[data-cy="page-action-item-save"]').should('not.exist');
  cy.get('[data-cy="page-action-item-saveAs"]').should('not.exist');
  cy.get('[data-cy="page-action-item-revert"]').should('have.class', 'disabled');
  cy.get('[data-cy="page-action-item-delete"]').should('not.exist');
}

function checkPageOperationsForModifyPermission() {
  cy.get('[data-cy="page-action-item-save"]').should('be.enabled');
  cy.get('[data-cy="page-action-item-saveAs"]').should('not.exist');
  cy.get('[data-cy="page-action-item-revert"]').should('have.class', 'disabled');
  cy.get('[data-cy="page-action-item-delete"]').should('not.exist');
}

function checkPageOperationsForCreatePermission() {
  cy.get('[data-cy="page-action-item-save"]').should('not.exist');
  cy.get('[data-cy="page-action-item-saveAs"]').should('not.have.class', 'disabled');
  cy.get('[data-cy="page-action-item-revert"]').should('have.class', 'disabled');
  cy.get('[data-cy="page-action-item-delete"]').should('not.exist');
}

function checkPageOperationsForDeletePermission() {
  cy.get('[data-cy="page-action-item-save"]').should('not.exist');
  cy.get('[data-cy="page-action-item-saveAs"]').should('not.exist');
  cy.get('[data-cy="page-action-item-revert"]').should('have.class', 'disabled');
  cy.get('[data-cy="page-action-item-delete"]').should('be.enabled');
}

function checkPageOperationsForFullControlPermission() {
  cy.get('[data-cy="page-action-item-save"]').should('be.enabled');
  cy.get('[data-cy="page-action-item-saveAs"]').should('be.enabled');
  cy.get('[data-cy="page-action-item-revert"]').should('have.class', 'disabled');
  cy.get('[data-cy="page-action-item-delete"]').should('be.enabled');
}

function checkPageOperationsForDeleteOrFullControlPermission() {
  cy.get('[data-cy="page-action-item-save"]').should('be.enabled');
  cy.get('[data-cy="page-action-item-saveAs"]').should('be.enabled');
  cy.get('[data-cy="page-action-item-revert"]').should('have.class', 'disabled');
  cy.get('[data-cy="page-action-item-delete"]').should('be.enabled');
}

// To generate a postfix identifier to be concatenated to the pageId
function getRandomInt() {
  return new Date().getMilliseconds() + new Date().getSeconds();
}

function getPermission(oprKey1, oprKey2, oprKey3, resKey1, resKey2, resKey3) {
  const permission = [
    // eslint-disable-next-line camelcase
    { operation_key: oprKey1, resource_key: resKey1 },
    // eslint-disable-next-line camelcase
    { operation_key: oprKey2, resource_key: resKey2 },
    // eslint-disable-next-line camelcase
    { operation_key: oprKey3, resource_key: resKey3 }
  ];
  return permission;
}

function checkSaveAsFunctionality(pageId, pageIDs = []) {
  cy.intercept({
    method: 'GET',
    path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/test${pageId}*`
  }).as(`getTest${pageId}`);
  cy.intercept({
    method: 'GET',
    path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pages/toc*`
  }).as('getTOC');

  cy.get('[data-cy="page-action-item-saveAs"]').click();
  cy.get('[data-cy="pageTitle"]').clear().type(`test${pageId}`);
  cy.get('[data-cy="pagePropertiesSaveButton"]').click();
  cy.bvdCheckToast('Page saved successfully.');
  cy.wait([`@getTest${pageId}`, '@getData', '@getTOC']);
  pageIDs.push(pageId);
  return pageIDs; // Use returned value if pageIDs not passed
}

function checkSaveAsWithContextFunctionality(pageId, pageIDs = []) {
  cy.intercept({
    method: 'GET',
    path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/test${pageId}*`
  }).as(`getTest${pageId}`);
  cy.intercept({
    method: 'GET',
    path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pages/toc*`
  }).as('getTOC');
  pageIDs.push(pageId);
  cy.get('[data-cy="page-action-button"]').click();
  cy.get('[data-cy="page-action-item-saveAs"]').click();
  cy.get('[data-cy="pageTitle"]').clear().type(`test${pageId}`);
  cy.get('[data-cy="pagePropertiesSaveButton"]').click();
  cy.bvdCheckToast('Page saved successfully.');
  cy.wait([`@getTest${pageId}`, '@getData', '@getTOC']);
  return pageIDs; // Use returned value if pageIDs not passed
}

function checkSaveAsFunctionalityWithOwnerPermission(pageIDs = []) {
  cy.intercept({
    method: 'GET',
    path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/*`
  }).as('getSavedPage');
  cy.intercept({
    method: 'GET',
    path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/widgets/pgmt_save_as`
  }).as('getSaveAsWidget');
  cy.intercept({
    method: 'POST',
    path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pages`
  }).as('createPage');
  cy.get('[data-cy="page-action-button"]').click();
  cy.get('[data-cy="page-action-item-saveAs"]').click();
  cy.wait('@getSaveAsWidget').its('response.statusCode').should('eq', 200);
  // id will be replaced by data cy later
  cy.get('#pgmt_save_as').should('be.visible');
  cy.get('.pgmt-loading-spinner-saveAs > .spinner-overlay').should('be.hidden');
  cy.get('#pgmt-radio-button-definition > .ux-radio-button > .ux-radio-button-container').click();
  cy.get('[data-cy="pgmt-properties-definition-title"]').clear().type('savedTestPage');
  cy.get('[data-cy="submit-button"]').click();
  cy.wait('@createPage');
  cy.bvdCheckToast('Definition "savedTestPage" saved successfully');
  cy.wait('@getSavedPage').its('response.statusCode').should('eq', 200);
  cy.get('[data-cy=breadcrumb-title-savedTestPage]');
  return pageIDs; // Use returned value if pageIDs not passed
}

function checkSaveAndRevertActionsEnabled() {
  cy.get('[data-cy="action-button"]').first().click();
  cy.get('[data-cy="action-button-duplicateWidget"]').click();
  cy.wait('@getData');
  cy.get('[data-cy="page-action-button"]').click();
  cy.get('[data-cy="page-action-item-save"]').should('not.have.class', 'disabled');
  cy.get('[data-cy="page-action-item-revert"]').should('not.have.class', 'disabled');
  cy.get('[data-cy="page-action-item-save"]').click();
  cy.get('[data-cy="submit-button"]').click();
  cy.bvdCheckToast('Update of the definition was successful');
}

function checkPageLoadUnauthorized(pageId, postFixId = '', esc = false) {
  cy.visit(`/${pageId}${postFixId}`);
  cy.wait(`@get${pageId}`).its('response.statusCode').should('eq', 401);
  if (esc) {
    cy.get('[data-cy=mondrianModalDialogButton]').contains('OK').type('{esc}');
  } else {
    cy.get('[data-cy=mondrianModalDialogButton]').click();
  }
}

function createPageWithTagsNoGroup(pageIdWithTag, pageIDs = []) {
  const pageTag = [{ name: '__rbac', values: ['AnyGroup']}];
  shared.createNewPage(pageIdWithTag, pageIdWithTag, pageTag, null, pageWithTagRes => {
    expect(pageWithTagRes.status).to.equal(200);
  });
  pageIDs.push(pageIdWithTag);
}

function createPageWithTags(pageIdWithNomTag, pageIdWithoutTag, pageIDs = []) {
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
  shared.createNewPage(pageIdWithNomTag, pageIdWithNomTag, nomTag, view, pageWithNomTagRes => {
    expect(pageWithNomTagRes.status).to.equal(200);
    pageIDs.push(pageIdWithNomTag);

    shared.createNewPage(pageIdWithoutTag, pageIdWithoutTag, null, null, pageWithoutTagRes => {
      expect(pageWithoutTagRes.status).to.equal(200);
      pageIDs.push(pageWithoutTagRes);
    });
  });
}

module.exports = {
  checkPageOperationsForViewPermission,
  checkPageOperationsForModifyPermission,
  checkPageOperationsForCreatePermission,
  checkPageOperationsForDeletePermission,
  checkPageOperationsForFullControlPermission,
  checkPageOperationsForDeleteOrFullControlPermission,
  checkSaveAsFunctionality,
  checkSaveAsWithContextFunctionality,
  checkSaveAsFunctionalityWithOwnerPermission,
  checkSaveAndRevertActionsEnabled,
  checkPageLoadUnauthorized,
  createPageWithTagsNoGroup,
  getRandomInt,
  getPermission,
  createPageWithTags
};
