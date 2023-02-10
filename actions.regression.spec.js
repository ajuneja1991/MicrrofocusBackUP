// <reference types="Cypress" />
const shared = require('../../shared/shared');

describe('Inline Actions', shared.defaultTestOptions, () => {
  beforeEach(() => {
    cy.intercept({
      method: 'POST',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/datasource/ws/data`
    }).as('getData');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/uiTestInlineActions*`
    }).as('getPage');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/uiTestWidgets*`
    }).as(`getTestWidgetsPage`);
    cy.bvdLogin();
    cy.visit('/uiTestInlineActions?_m=testInlineActionsEntry');
    cy.wait('@getPage');
    cy.wait(['@getData', '@getData']);
  });

  it('check that the page level configuration is used', () => {
    cy.get('[data-cy="metric-box-unit-title"]').first().contains('Green');
  });

  it('check for absence of sidePanel without actionID', () => {
    cy.get('right-side-panel').should('not.exist');
  });

  it('widget level action should not be visible in list if, disable = true in config', () => {
    cy.get('.action-button-duplicateWidget').should('not.exist');
  });

  it('side panel action can be performed from widget and the action should be disabled after triggered and enabled after panel close', () => {
    cy.get('[id=actions-dropdown-button]').eq(1).click();
    cy.get('[data-cy="action-button-open_metric_box"]').click();
    cy.wait('@getData');
    cy.get('right-side-panel > ux-side-panel').should('have.class', 'open');
    cy.get('[id=actions-dropdown-button]').eq(1).click();
    cy.get('[data-cy="action-button-open_metric_box"]').should('be.disabled');
  });

  it('side panel action can be performed from widget and the action should be enabled after a pagelevel sidepanel action triggered and vice-versa', () => {
    cy.get('[id=actions-dropdown-button]').eq(1).click();
    cy.get('[data-cy="action-button-open_metric_box"]').click();
    cy.get('right-side-panel > ux-side-panel').should('have.class', 'open');
    cy.get('[data-cy="page-action-button"]').click();
    cy.get('[data-cy="page-action-item-open_metric_browser"]').click();
    cy.get('[id=actions-dropdown-button]').eq(1).click();
    cy.get('[data-cy="action-button-open_metric_box"]').should('not.be.disabled');
    cy.get('body').type('{esc}');
    cy.get('[data-cy="btn-side-panel-close"]').click();
    cy.get('[data-cy="page-action-button"]').click();
    cy.get('[data-cy="page-action-item-open_metric_browser"]').click();
    cy.wait('@getData');
    cy.get('right-side-panel > ux-side-panel').should('have.class', 'open');
    cy.get('[id=actions-dropdown-button]').eq(1).click();
    cy.get('[data-cy="action-button-open_metric_box"]').click();
    cy.get('[data-cy="page-action-button"]').click();
    cy.get('[data-cy="page-action-item-open_metric_browser"]').should('not.have.class', 'disabled');
    cy.get('body').type('{esc}');
    cy.get('[id=actions-dropdown-button]').eq(1).click();
    cy.get('[data-cy="action-button-open_metric_box"]').should('be.disabled');
  });

  it('side panel action can be performed from widget and the action should be enabled after another widget level sidepanel action triggered', () => {
    cy.get('[id=actions-dropdown-button]').eq(1).click();
    cy.get('[data-cy="action-button-open_metric_box"]').click();
    cy.wait('@getData');
    cy.get('[id=actions-dropdown-button]').eq(1).click();
    cy.get('[data-cy="action-button-open_metric_box"]').should('be.disabled');
    cy.get('right-side-panel > ux-side-panel').should('have.class', 'open');
    cy.get('[data-cy="action-button-open_simple_list"]').click();
    cy.wait('@getData');
    cy.get('right-side-panel > ux-side-panel').should('have.class', 'open');
    cy.get('[id=actions-dropdown-button]').eq(1).click();
    cy.get('[data-cy="action-button-open_simple_list"]').should('be.disabled');
    cy.get('[data-cy="action-button-open_metric_box"]').should('not.be.disabled');
  });

  it('select drill down action on widget Server A', () => {
    cy.get('[data-cy="action-button-drillDown"]').first().click();
    cy.url().should('include', 'uiTestPage');
    cy.wait(['@getData']);
    cy.get('[data-cy="contextLabelType-labelWithoutType"]').contains('Test');
  });

  it('count actions on widget Server B', () => {
    cy.get('[data-cy="action-button-removeWidget"]');
  });

  it('Remove widget on Server A', () => {
    cy.get('[data-cy="action-button-removeWidget"]').first().click();
    cy.get('metric-box').should('have.length', 0);
  });

  it('Duplicate widget on Server A', () => {
    cy.get('[data-cy="action-button-duplicateWidget"]').click();
    cy.get('metric-box').should('have.length', 2);
  });

  it('Edit widget on Server A enabled', () => {
    cy.get('[data-cy="action-button-edit"]');
  });

  it('With unsaved changes click discard to navigate away from the page', () => {
    cy.get('[data-cy="action-button-removeWidget"]').first().click();
    cy.get('[data-cy="navigation-category-T2"] button').click();
    cy.get('[data-cy="navigation-menuEntry-testWidgetsEntry"]').click();
    cy.get('[data-cy="mondrianModalDialogButton"]');
    cy.get('[data-cy="modal-title"]').contains('UNSAVED DEFINITION CHANGES');
    cy.get('[data-cy="mondrianModalDialogCancelButton"]');
    cy.get('[data-cy="mondrianModalDialogButton"]').click();
    cy.url().should('include', 'uiTestWidgets');
  });

  it('With unsaved changes click cancel to stay on page ', () => {
    cy.get('[data-cy="action-button-removeWidget"]').first().click();
    cy.get('[data-cy="navigation-category-T2"] button').click();
    cy.get('[data-cy="navigation-menuEntry-testWidgetsEntry"]').click();
    cy.get('[data-cy="mondrianModalDialogButton"]');
    cy.get('[data-cy="modal-title"]').contains('UNSAVED DEFINITION CHANGES');
    cy.get('[data-cy="mondrianModalDialogCancelButton"]');
    cy.get('[data-cy="mondrianModalDialogCancelButton"]').click();
    cy.url().should('include', 'uiTestInlineActions');

    // Try navigating again after clicking cancel
    cy.get('[data-cy="navigation-menuEntry-testWidgetsEntry"]').click();
    cy.get('[data-cy="mondrianModalDialogButton"]');
    cy.get('[data-cy="modal-title"]').contains('UNSAVED DEFINITION CHANGES');
    cy.get('[data-cy="mondrianModalDialogCancelButton"]');
    cy.get('[data-cy="mondrianModalDialogCancelButton"]').click();
    cy.url().should('include', 'uiTestInlineActions');
    cy.get('[data-cy="navigation-menuEntry-testWidgetsEntry"] button').first().should('not.have.class', 'ux-side-menu-item-active');
  });

  it('With unsaved changes click logout and click discard to navigate away', () => {
    cy.get('[data-cy="action-button-removeWidget"]').first().click();
    cy.get('[data-cy="user-button"]');
    cy.get('[data-cy="user-button"]').click();
    cy.get('[data-cy="user-logout"]');
    cy.get('[data-cy="user-logout"]').click();
    cy.get('[data-cy="mondrianModalDialogButton"]');
    cy.get('[data-cy="modal-title"]').contains('UNSAVED DEFINITION CHANGES');
    cy.get('[data-cy="mondrianModalDialogCancelButton"]');
    cy.get('[data-cy="mondrianModalDialogButton"]').click();
    cy.location('pathname').should('include', '/idm-service');
  });

  it('With unsaved changes click logout and click cancel to stay on page', () => {
    cy.get('[data-cy="action-button-removeWidget"]').first().click();
    cy.get('[data-cy="user-button"]');
    cy.get('[data-cy="user-button"]').click();
    cy.get('[data-cy="user-logout"]');
    cy.get('[data-cy="user-logout"]').click();
    cy.get('[data-cy="mondrianModalDialogButton"]');
    cy.get('[data-cy="mondrianModalDialogCancelButton"]');
    cy.get('[data-cy="mondrianModalDialogCancelButton"]').click();
    cy.url().should('include', 'uiTestInlineActions');
  });
  it('Duplicate widget should not break other page actions', () => {
    cy.get('[data-cy="action-button-duplicateWidget"]').click();
    cy.get('[data-cy="page-action-button"]');
    cy.get('[data-cy="context-filter-menu"]');
  });

  it('duplicate widget action should append Copy of in the beginning of every widget title', () => {
    cy.get('[data-cy="action-button-duplicateWidget"]').click();
    cy.wait(['@getData']);
    cy.get('.dashboard-widget-title').eq(2).contains('Copy of Server A');
    cy.get('[data-cy="action-button-duplicateWidget"]').last().click();
    cy.wait(['@getData']);
    cy.get('.dashboard-widget-title').eq(3).contains('Copy of Copy of Server A');
  });

  it('shows other page actions even if save is disabled', () => {
    cy.get('[data-cy="page-action-button"]').click();
    // in pgmt mode save is always enabled
    cy.get('[data-cy="page-action-item-saveAs"]').should('be.enabled');
    cy.get('[data-cy="page-action-item-open_metric_browser"]');
  });

  it('With unsaved changes, Save and Revert should not be disabled after widget refresh', () => {
    cy.visit('/uiTestWidgets?_m=testWidgetsEntry');
    cy.wait(['@getData', '@getTestWidgetsPage']);
    cy.get('[data-cy="page-action-button"]').click();
    // in pgmt mode save is always enabled
    cy.get('[data-cy="page-action-item-saveAs"]').should('be.enabled');
    cy.get('[data-cy="page-action-item-revert"]').should('be.disabled');
    cy.get('body').click();
    cy.get('[data-cy="action-button"]').first().click();
    cy.get('[data-cy="action-button-duplicateWidget"]').click();
    cy.get('[data-cy="page-action-button"]').click();
    cy.get('[data-cy="page-action-item-saveAs"]').should('be.enabled');
    cy.get('[data-cy="page-action-item-revert"]').should('be.enabled');
    cy.get('body').click();
    cy.get('[data-cy="action-button"]').first().click();
    cy.get('[data-cy="action-button-refreshWidget"]').click();
    cy.get('[data-cy="page-action-button"]').click();
    cy.get('[data-cy="page-action-item-saveAs"]').should('be.enabled');
    cy.get('[data-cy="page-action-item-revert"]').should('be.enabled');
  });

  it('With unsaved changes click DESIGN button and then click discard to navigate away from the page', () => {
    cy.visit('/uiTestWidgets?_m=testWidgetsEntry');
    cy.wait(['@getData', '@getTestWidgetsPage']);
    cy.get('[data-cy="action-button"]').first().click();
    cy.get('[data-cy="action-button-edit"]').click();
    cy.get('[data-cy="widgetNameInput"]').clear();
    cy.get('[data-cy="widgetNameInput"]').type('ABC').blur();
    cy.get('[data-cy="btn-side-panel-close"]').click();
    cy.get('[data-cy="masthead-design-button"]').click();
    cy.get('[data-cy="mondrianModalDialogButton"]');
    cy.get('[data-cy="modal-title"]').contains('UNSAVED DEFINITION CHANGES');
    cy.get('[data-cy="mondrianModalDialogButton"]').click();
    cy.get('[data-cy="side-panel-header"]').should('contain.text', 'Add Widget');
  });
});

describe('Actions', shared.defaultTestOptions, () => {
  beforeEach(() => {
    cy.intercept({
      method: 'POST',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/datasource/ws/data`
    }).as('getData');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/uiTestActions*`
    }).as('getPage');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/uiTestWidgets*`
    }).as(`getTestWidgetsPage`);
    cy.bvdLogin();
    cy.visit('/uiTestActions?_m=testActionsEntry');
    cy.wait('@getPage');
    cy.wait(['@getData', '@getData']);
  });

  it('check that the page level configuration is used', () => {
    cy.get('[data-cy="metric-box-unit-title"]').first().contains('Green');
  });

  it('check for absence of sidePanel without actionID', () => {
    cy.get('right-side-panel').should('not.exist');
  });

  it('widget level action should not be visible in list if, disable = true in config', () => {
    cy.get('[data-cy="action-button"]').last().click();
    cy.get('.action-button-duplicateWidget').should('not.exist');
  });

  it('side panel action can be performed from widget and the action should be disabled after triggered and enabled after panel close', () => {
    cy.get('[data-cy="action-button"]').last().click();
    cy.get('[data-cy="action-button-open_metric_box"]').click();
    cy.get('[data-cy="action-button-open_metric_box"]').should('not.exist');
    cy.wait('@getData');
    cy.get('right-side-panel > ux-side-panel').should('have.class', 'open');
    cy.get('[data-cy="action-button"]').last().click();
    cy.get('[data-cy="action-button-open_metric_box"]').should('be.disabled');
    cy.get('div.cdk-overlay-backdrop').click();
    cy.get('[data-cy="btn-side-panel-close"]').click();
    cy.get('[data-cy="action-button-open_metric_box"]').should('not.exist');
    cy.get('[data-cy="action-button"]').last().click();
    cy.get('[data-cy="action-button-open_metric_box"]').should('not.be.disabled');
  });

  it('side panel action can be performed from widget and the action should be enabled after a pagelevel sidepanel action triggered and vice-versa', () => {
    cy.get('[data-cy="action-button"]').last().click();
    cy.get('[data-cy="action-button-open_metric_box"]').click();
    cy.get('[data-cy="action-button-open_metric_box"]').should('not.exist');
    cy.get('right-side-panel > ux-side-panel').should('have.class', 'open');
    cy.get('[data-cy="page-action-button"]').click();
    cy.get('[data-cy="page-action-item-open_metric_browser"]').click();
    cy.get('[data-cy="action-button"]').last().click();
    cy.get('[data-cy="action-button-open_metric_box"]').should('not.be.disabled');
    cy.get('div.cdk-overlay-backdrop').click();
    cy.get('[data-cy="btn-side-panel-close"]').click();
    cy.get('[data-cy="page-action-button"]').click();
    cy.get('[data-cy="page-action-item-open_metric_browser"]').click();
    cy.wait('@getData');
    cy.get('right-side-panel > ux-side-panel').should('have.class', 'open');
    cy.get('[data-cy="action-button"]').last().click();
    cy.get('[data-cy="action-button-open_metric_box"]').click();
    cy.get('[data-cy="action-button-open_metric_box"]').should('not.exist');
    cy.get('[data-cy="page-action-button"]').click();
    cy.get('[data-cy="page-action-item-open_metric_browser"]').should('not.have.class', 'disabled');
  });

  it('side panel action can be performed from widget and the action should be enabled after another widget level sidepanel action triggered', () => {
    cy.get('[data-cy="action-button"]').last().click();
    cy.get('[data-cy="action-button-open_metric_box"]').click();
    cy.get('[data-cy="action-button-open_metric_box"]').should('not.exist');
    cy.wait('@getData');
    cy.get('right-side-panel > ux-side-panel').should('have.class', 'open');
    cy.get('[data-cy="action-button"]').last().click();
    cy.get('[data-cy="action-button-open_simple_list"]').click();
    cy.get('[data-cy="action-button-open_simple_list"]').should('not.exist');
    cy.wait('@getData');
    cy.get('right-side-panel > ux-side-panel').should('have.class', 'open');
    cy.get('[data-cy="action-button"]').last().click();
    cy.get('[data-cy="action-button-open_simple_list"]').should('be.disabled');
    cy.get('[data-cy="action-button-open_metric_box"]').should('not.be.disabled');
    cy.get('[data-cy="action-button"]').last().type('{esc}');// to close the menu
  });

  it('select drill down action on widget Server A', () => {
    cy.get('[data-cy="action-button"]').first().click();
    cy.get('.ux-menu').children('div').should('have.length', 5);
    cy.get('[data-cy="action-button-drillDown"]').click();
    cy.url().should('include', 'uiTestPage');
    cy.wait(['@getData']);
    cy.get('[data-cy="contextLabelType-labelWithoutType"]').contains('Test');
  });

  it('count actions on widget Server B', () => {
    cy.get('[data-cy="action-button"]').last().click();
    cy.get('.ux-menu').children('div').should('have.length', 5);
    cy.get('[data-cy="action-button-removeWidget"]');
  });

  it('Remove widget on Server A', () => {
    cy.get('[data-cy="action-button"]').first().click();
    cy.get('[data-cy="action-button-removeWidget"]').click();
    cy.get('metric-box').should('have.length', 1);
  });

  it('Duplicate widget on Server A', () => {
    cy.get('[data-cy="action-button"]').first().click();
    cy.get('[data-cy="action-button-duplicateWidget"]').click();
    cy.get('metric-box').should('have.length', 2);
  });

  it('Edit widget on Server A enabled', () => {
    cy.get('[data-cy="action-button"]').first().click();
    cy.get('[data-cy="action-button-edit"]');
  });

  it('With unsaved changes click discard to navigate away from the page', () => {
    cy.get('[data-cy="action-button"]').first().click();
    cy.get('[data-cy="action-button-removeWidget"]').click();
    cy.get('[data-cy="navigation-category-T2"] button').click();
    cy.get('[data-cy="navigation-menuEntry-testWidgetsEntry"]').click();
    cy.get('[data-cy="mondrianModalDialogButton"]');
    cy.get('[data-cy="modal-title"]').contains('UNSAVED DEFINITION CHANGES');
    cy.get('[data-cy="mondrianModalDialogCancelButton"]');
    cy.get('[data-cy="mondrianModalDialogButton"]').click();
    cy.url().should('include', 'uiTestWidgets');
  });

  it('With unsaved changes click cancel to stay on page ', () => {
    cy.get('[data-cy="action-button"]').first().click();
    cy.get('[data-cy="action-button-removeWidget"]').click();
    cy.get('[data-cy="navigation-category-T2"] button').click();
    cy.get('[data-cy="navigation-menuEntry-testWidgetsEntry"]').click();
    cy.get('[data-cy="mondrianModalDialogButton"]');
    cy.get('[data-cy="modal-title"]').contains('UNSAVED DEFINITION CHANGES');
    cy.get('[data-cy="mondrianModalDialogCancelButton"]');
    cy.get('[data-cy="mondrianModalDialogCancelButton"]').click();
    cy.url().should('include', 'uiTestActions');

    // Try navigating again after clicking cancel
    cy.get('[data-cy="navigation-menuEntry-testWidgetsEntry"]').click();
    cy.get('[data-cy="mondrianModalDialogButton"]');
    cy.get('[data-cy="modal-title"]').contains('UNSAVED DEFINITION CHANGES');
    cy.get('[data-cy="mondrianModalDialogCancelButton"]');
    cy.get('[data-cy="mondrianModalDialogCancelButton"]').click();
    cy.url().should('include', 'uiTestActions');
    cy.get('[data-cy="navigation-menuEntry-testWidgetsEntry"] button').first().should('not.have.class', 'ux-side-menu-item-active');
  });

  it('With unsaved changes click logout and click discard to navigate away', () => {
    cy.get('[data-cy="action-button"]').first().click();
    cy.get('[data-cy="action-button-removeWidget"]').click();
    cy.get('[data-cy="user-button"]');
    cy.get('[data-cy="user-button"]').click();
    cy.get('[data-cy="user-logout"]');
    cy.get('[data-cy="user-logout"]').click();
    cy.get('[data-cy="mondrianModalDialogButton"]');
    cy.get('[data-cy="modal-title"]').contains('UNSAVED DEFINITION CHANGES');
    cy.get('[data-cy="mondrianModalDialogCancelButton"]');
    cy.get('[data-cy="mondrianModalDialogButton"]').click();
    cy.location('pathname').should('include', '/idm-service');
  });

  it('With unsaved changes click logout and click cancel to stay on page', () => {
    cy.get('[data-cy="action-button"]').first().click();
    cy.get('[data-cy="action-button-removeWidget"]').click();
    cy.get('[data-cy="user-button"]');
    cy.get('[data-cy="user-button"]').click();
    cy.get('[data-cy="user-logout"]');
    cy.get('[data-cy="user-logout"]').click();
    cy.get('[data-cy="mondrianModalDialogButton"]');
    cy.get('[data-cy="mondrianModalDialogCancelButton"]');
    cy.get('[data-cy="mondrianModalDialogCancelButton"]').click();
    cy.url().should('include', 'uiTestActions');
  });
  it('Duplicate widget should not break other page actions', () => {
    cy.get('[data-cy="action-button"]').first().click();
    cy.get('[data-cy="action-button-duplicateWidget"]').click();
    cy.get('[data-cy="page-action-button"]');
    cy.get('[data-cy="context-filter-menu"]');
  });

  it('duplicate widget action should append Copy of in the beginning of every widget title', () => {
    cy.get('[data-cy="action-button"]').first().click();
    cy.get('[data-cy="action-button-duplicateWidget"]').click();
    cy.wait(['@getData']);
    cy.get('.dashboard-widget-title').eq(2).contains('Copy of Server A');
    cy.get('[data-cy="action-button"]').eq(2).click();
    cy.get('[data-cy="action-button-duplicateWidget"]').click();
    cy.wait(['@getData']);
    cy.get('.dashboard-widget-title').eq(3).contains('Copy of Copy of Server A');
  });

  it('shows other page actions even if save is disabled', () => {
    cy.get('[data-cy="page-action-button"]').click();
    // in pgmt mode save is always enabled
    cy.get('[data-cy="page-action-item-saveAs"]').should('be.enabled');
    cy.get('[data-cy="page-action-item-open_metric_browser"]');
  });

  it('With unsaved changes, Save and Revert should not be disabled after widget refresh', () => {
    cy.visit('/uiTestWidgets?_m=testWidgetsEntry');
    cy.wait(['@getData', '@getTestWidgetsPage']);
    cy.get('[data-cy="page-action-button"]').click();
    // in pgmt mode save is always enabled
    cy.get('[data-cy="page-action-item-saveAs"]').should('be.enabled');
    cy.get('[data-cy="page-action-item-revert"]').should('be.disabled');
    cy.get('body').click();
    cy.get('[data-cy="action-button"]').first().click();
    cy.get('[data-cy="action-button-duplicateWidget"]').click();
    cy.get('[data-cy="page-action-button"]').click();
    cy.get('[data-cy="page-action-item-saveAs"]').should('be.enabled');
    cy.get('[data-cy="page-action-item-revert"]').should('be.enabled');
    cy.get('body').click();
    cy.get('[data-cy="action-button"]').first().click();
    cy.get('[data-cy="action-button-refreshWidget"]').click();
    cy.get('[data-cy="page-action-button"]').click();
    cy.get('[data-cy="page-action-item-saveAs"]').should('be.enabled');
    cy.get('[data-cy="page-action-item-revert"]').should('be.enabled');
  });
});

describe('Url defined actions', shared.defaultTestOptions, () => {
  beforeEach(() => {
    cy.intercept({
      method: 'POST',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/datasource/ws/data`
    }).as('getData');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/uiTestActions*`
    }).as('getPage');
    cy.bvdLogin();
  });

  it('check for presence of sidePanel with actionID', () => {
    cy.visit('/uiTestActions?_a=open_metric_browser&_ctx=~(~(id~%278553d044-6e7b-46a0-aee3-ffcc24615ed6~name~%27CiscoO~type~%27node)~(id~%272553d044-6e7b-46a0-aee3-ffcc24615ed7~name~%27lab-s1~type~%27node))');
    cy.wait(['@getPage', '@getData']);
    cy.get('right-side-panel > ux-side-panel').should('have.class', 'open');
    cy.get('right-side-panel > ux-side-panel').contains('Simple List');
  });

  it('should be disabled after triggered and re-enabled after the right panel is closed', () => {
    cy.visit('/uiTestActions?_a=open_metric_browser&_ctx=~(~(id~%278553d044-6e7b-46a0-aee3-ffcc24615ed6~name~%27CiscoO~type~%27node)~(id~%272553d044-6e7b-46a0-aee3-ffcc24615ed7~name~%27lab-s1~type~%27node))');
    cy.wait(['@getPage', '@getData']);
    cy.get('right-side-panel > ux-side-panel').should('have.class', 'open');
    cy.get('[data-cy="page-action-button"]').click();
    cy.get('[data-cy="page-action-item-open_metric_browser"]').should('have.class', 'disabled');
    cy.get('div.cdk-overlay-backdrop').click();
    cy.get('[data-cy="btn-side-panel-close"]').click();
    cy.get('[data-cy="page-action-button"]').click();
    cy.get('[data-cy="page-action-item-open_metric_browser"]').should('not.have.class', 'disabled');
  });

  it('Adding default page actionID to the URL must not execute the action', () => {
    cy.visit('/uiTestActions?_a=saveAsPage');
    cy.wait(['@getPage', '@getData']);
    cy.get('right-side-panel > ux-side-panel').should('not.exist');
    cy.get('[data-cy="pageProperties"]').should('not.exist');
  });
});

describe('Support deprecated action names', () => {
  /**
   * Definition use deprecated action names:
   * savePage --> save
   * saveAsPage --> saveAs
   * revertPage --> revert
   * deletePage --> delete
   *
   * Removed actions:
   * addMenuEntry
   * pageProperties
   */
  beforeEach(() => {
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/deprecatedActionNames*`
    }).as('getPage');
    cy.bvdLogin();
    cy.visit('/deprecatedActionNames');
    cy.wait(['@getPage']);
  });

  it('Old action names still works', () => {
    // no error exists due to missing addMenuEntry and pageProperties action
    cy.get('[data-cy="notification-error-text"]').should('not.exist');

    cy.get('[data-cy="page-action-button"]').click();
    cy.get('[data-cy="page-action-item-save"]').should('be.disabled');
    cy.get('[data-cy="page-action-item-saveAs"]').should('be.disabled');
    cy.get('[data-cy="page-action-item-revert"]').should('be.disabled');
    cy.get('[data-cy="page-action-item-delete"]').should('be.disabled');
    // export should be enabled
    cy.get('[data-cy="page-action-item-export"]').should('be.enabled');
    // old actions shall not exist
    cy.get('[data-cy="page-action-item-addMenuEntry"]').should('not.exist');
    cy.get('[data-cy="page-action-item-pageProperties"]').should('not.exist');
  });
});
