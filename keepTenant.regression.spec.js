const shared = require('../../shared/shared');

describe('keep tenant parameter after login', () => {
  beforeEach(() => {
    cy.intercept({
      method: 'POST',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/datasource/ws/data`
    }).as(`getData`);
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/uiTestPageCrud*`
    }).as(`getPage`);
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/uiTestPageReadOnly*`
    }).as(`getReadOnlyPage`);
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/uiTestWidgets*`
    }).as(`getPagesData`);
    cy.intercept({
      method: 'POST',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pages/metadata`
    }).as('getPagesMetadata');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pages/toc*`
    }).as('getTocData');
    cy.intercept({
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/system`
    }).as('getSystemLoad');
    cy.intercept({
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/session/user`
    }).as('getUser');
    cy.intercept({
      path: `${shared.exploreContextRoot}/assets/l10n/mondrian_en.json`
    }).as('getAsset');
    cy.intercept({
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/load/application/localization/en`
    }).as('getLocalization');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/menuEntries?filter=pages`
    }).as('getMenuEntries');
    cy.bvdLogin();
  });

  it('Should check if tenant is added to the url after login', () => {
    cy.visit('/uiTestPageCrud');
    cy.wait(['@getSystemLoad', '@getUser', '@getAsset', '@getLocalization', '@getPage', '@getData', '@getData', '@getTocData']);
    // eslint-disable-next-line no-warning-comments
    cy.url().should('include', 'uiTestPageCrud');
    cy.url().then(urlString => {
      shared.checkTenantInUrl(urlString);
    });
  });

  it('Should check if tenant is retained after login', () => {
    cy.visit('/uiTestPageCrud?_m=testPageCrudEntry&tenant=Provider');
    cy.wait(['@getSystemLoad', '@getUser', '@getAsset', '@getLocalization', '@getPage', '@getData', '@getData', '@getTocData']);
    // eslint-disable-next-line no-warning-comments
    cy.url().should('include', 'uiTestPageCrud');
    cy.url().then(urlString => {
      shared.checkTenantInUrl(urlString);
    });
  });

  it('Should check if tenant is retained in the url after navigating to a different page', () => {
    cy.visit('/uiTestPageCrud');
    cy.wait(['@getSystemLoad', '@getUser', '@getAsset', '@getLocalization', '@getPage', '@getData', '@getData', '@getTocData']);
    // eslint-disable-next-line no-warning-comments
    cy.url().should('include', 'uiTestPageCrud');
    cy.visit('/uiTestPageReadOnly');
    cy.wait(['@getSystemLoad', '@getUser', '@getAsset', '@getLocalization', '@getReadOnlyPage', '@getData', '@getTocData']);
    cy.url().should('include', 'uiTestPageReadOnly');
    cy.url().then(urlString => {
      shared.checkTenantInUrl(urlString);
    });
    cy.visit('/uiTestPageCrud?tenant=DifferentTenant');
    cy.wait(['@getSystemLoad', '@getUser', '@getAsset', '@getLocalization', '@getPage', '@getData', '@getData', '@getTocData']);
    cy.url().should('include', 'uiTestPageCrud');
    cy.get('[data-cy="modal-title"]').should('contain.text', 'ACCESS TO DIFFERENT TENANT');
    cy.get('[data-cy="mondrianModalDialogButton"]').click();
    cy.url().should('not.include', 'DifferentTenant');
  });

  it('Should check if tenant is retained in the url after changing the context', () => {
    cy.visit('/uiTestWidgets');
    cy.wait(['@getPagesData', '@getData', '@getData', '@getData', '@getData', '@getData', '@getData', '@getData', '@getTocData']);
    cy.get('[data-cy=spinnerOverlay]').should('not.be.visible');
    cy.get('simple-list').contains('loadgen.mambo.net');
    cy.get('[data-cy="loadgen.mambo.net"]').click();
    cy.get('simple-list').contains('oba.mambo.net');
    cy.get('[data-cy="oba.mambo.net"]').click();
    cy.url().then(urlString => {
      shared.checkTenantInUrl(urlString);
    });
  });

  it('Should check if tenant is retained in the url after navigating to a different page in breadcrumbs', () => {
    cy.visit('/uiTestWidgets?_m=widgetWithContext&_ctx=~(~(type~%27host~id~%27loadgen.mambo.net~name~%27loadgen.mambo.net))&_s=1626266580000&_e=1626273780000&_tft=A&tenant=Provider');
    cy.wait(['@getPagesData', '@getPagesMetadata', '@getData', '@getData', '@getData', '@getData', '@getData', '@getData', '@getData', '@getTocData']);
    cy.get('[data-cy=spinnerOverlay]').should('not.be.visible');
    cy.get('[data-cy="drillDownButton"]').click();
    cy.get('[data-cy=drilldown-uiTestPage]').should('have.attr', 'href').and('include', 'tenant=Provider');
    cy.get('[data-cy="drilldown-uiTestPage"]').click();
    cy.wait(['@getPagesMetadata', '@getData', '@getData', '@getData']);
    cy.get('[data-cy="breadcrumb-uiTestWidgets"]');
    cy.get('[data-cy="breadcrumb-uiTestPage"]');
    cy.url().then(urlString => {
      shared.checkTenantInUrl(urlString);
    });
  });

  it('Should check if tenant is retained in the url after changing context from omnibar', () => {
    cy.visit('/contextOmnibarDemo1?_s=1619807400000&_e=1622485740000&_tft=A&tenant=Provider');
    cy.wait(['@getData', '@getTocData']);
    cy.get('[data-cy=omnibar-input-field]').click();
    cy.get('[data-cy=Bangalore] > .context-item-name').click();
    cy.wait(['@getData', '@getData', '@getData', '@getData', '@getData', '@getData']);
    cy.get('[data-cy=drillDownButton]').click();
    cy.get('[data-cy=drilldown-metricBrowserDemo]').click();
    cy.wait(['@getData', '@getData', '@getData']);
    cy.url().then(urlString => {
      shared.checkTenantInUrl(urlString);
    });
  });

  afterEach(() => {
    cy.bvdLogout();
  });
});
