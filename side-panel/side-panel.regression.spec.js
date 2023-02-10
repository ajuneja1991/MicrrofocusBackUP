// <reference types="Cypress" />
const shared = require('../../../shared/shared');

describe('SidePanel', shared.defaultTestOptions, () => {
  beforeEach(() => {
    cy.intercept('POST', `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/datasource/ws/data`).as('getWebapiData');
    cy.intercept('GET', `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/widgets/external_component_test`).as('loadExternalComponentTest');
    cy.intercept('GET', `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/widgets/external_component_flip_card`).as('loadExternalComponentFlipCard');
    cy.intercept('GET', `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/widgets/ui-test-key-value-vertica-datasource`).as('loadKeyValueList');
    cy.intercept('GET', `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/widgets/ui-test-ootb-widgets-vertica-datasource`).as('loadWidgetsList');
    cy.intercept('POST', `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/datasource/vertica/data`).as('postVerticaData');
    cy.intercept('GET', `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/uiTestSidePanel*`).as('getSidePanelPageData');
    cy.intercept('GET', `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pages/toc*`).as('getTOC');
    cy.intercept('GET', `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/widgets/ui-test-simple-list`).as('loadSimpleList');
    cy.intercept('POST', `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pages/metadata`).as('metadata');
    cy.bvdLogin();

    const url = '/uiTestSidePanel?_m=testSidePanelEntry&_a=open_metric_browser&_ctx=~(~(id~%278553d044-6e7b-46a0-aee3-ffcc24615ed6~name~%27CiscoO~type~%27node)~(id~%272553d044-6e7b-46a0-aee3-ffcc24615ed7~name~%27lab-s1~type~%27node))';
    cy.visit(url);
    cy.wait(['@getSidePanelPageData', '@getWebapiData', '@getTOC', '@getTOC', '@loadSimpleList', '@metadata']);
  });

  it('opens side panel, if side panel action is present in url', () => {
    cy.get('right-side-panel > ux-side-panel').should('have.class', 'open');
    cy.get('[data-cy="panel-widget-ui-test-simple-list"]');
  });

  it('open a different internal widget in the side panel', () => {
    cy.get('[data-cy="page-action-button"]').click();
    cy.get('[data-cy="page-action-item-load_simple_list"]').click();
    cy.wait(['@loadSimpleList']);
    cy.get('[data-cy="panel-widget-ui-test-simple-list"]');
  });

  it('open a different external widgets in the side panel', () => {
    cy.get('[data-cy="btn-side-panel-close"]').click();
    cy.get('[data-cy="page-action-button"]').click();
    cy.get('div.ux-menu').find('[data-cy="page-action-item-load_flip_card"]').click();
    cy.wait(['@loadExternalComponentFlipCard', '@postVerticaData']);
    cy.get('[data-cy="panel-widget-external_component_flip_card"]');
    cy.get('[data-cy="attached-UI"]').should('not.exist');
    cy.get('[data-cy="btn-side-panel-close"]').click();
    cy.get('[data-cy="page-action-button"]').click();
    cy.get('div.ux-menu').find('[data-cy="page-action-item-load_test_component"]').click();
    cy.wait('@loadExternalComponentTest');
    cy.get('[data-cy="panel-widget-external_component_test"]');
    cy.get('[data-cy="attached-UI"]').should('not.exist');
  });

  it('should check for query UI in side panel for ootb widgets with vertica datasource', () => {
    // keyvalue widget
    cy.get('[data-cy="page-action-button"]').click();
    cy.get('[data-cy="page-action-item-load_key_value_list"]').click();
    cy.wait(['@loadKeyValueList', '@postVerticaData']);
    cy.get('[data-cy="panel-widget-ui-test-key-value-vertica-datasource"]');
    cy.get('[data-cy="attached-UI"]').should('not.exist');
    cy.get('[data-cy="btn-side-panel-close"]').click();
    // text widget
    cy.get('[data-cy="page-action-button"]').click();
    cy.get('[data-cy="page-action-item-load_text_widget"]').click();
    cy.wait(['@postVerticaData']);
    cy.get('[data-cy="panel-widget-ui-test-text-widget-vertica-datasource1"]');
    cy.get('[data-cy="attached-UI"]').should('not.exist');
    cy.get('[data-cy="btn-side-panel-close"]').click();
    // table widget
    cy.get('[data-cy="page-action-button"]').click();
    cy.get('[data-cy="page-action-item-load_table_widget"]').click();
    cy.wait(['@postVerticaData']);
    cy.get('[data-cy="panel-widget-ui-test-table-widget-vertica-datasource"]');
    cy.get('[data-cy="attached-UI"]').should('not.exist');
    cy.get('[data-cy="btn-side-panel-close"]').click();
    // metric box
    cy.get('[data-cy="page-action-button"]').click();
    cy.get('[data-cy="page-action-item-load_metric_box"]').click();
    cy.wait(['@postVerticaData']);
    cy.get('[data-cy="panel-widget-ui-test-metric-box-vertica-datasource"]');
    cy.get('[data-cy="attached-UI"]').should('not.exist');
    cy.get('[data-cy="btn-side-panel-close"]').click();
  });

  it('should check for query UI in side panel for data explorer widget with vertica datasource', () => {
    cy.get('[data-cy="page-action-button"]').click();
    cy.get('[data-cy="page-action-item-load_data_explorer"]').click();
    cy.get('[data-cy="panel-widget-metric_browser_demo"]');
    cy.get('[data-cy="datasourceSelectDropdown"] .ux-select-container')
      .click();
    cy.get('.ux-typeahead-options> ux-typeahead-options-list > ol > li').last().click();
    cy.get('[data-cy="attached-UI"]');
  });

  it('should check widget without data in config is rendered in side panel', () => {
    cy.get('[data-cy="page-action-button"]').click();
    cy.get('[data-cy="page-action-item-load_text"]').click();
    cy.get('[data-cy="panel-widget-ui-test-text"]');
    cy.get('[data-cy="attached-UI"]').should('not.exist');
  });

  it('closes the panel on click of close icon and reopens on click of action', () => {
    cy.get('ux-side-panel').get('[data-cy=btn-side-panel-close]').click();
    cy.get('ux-side-panel').should('not.exist');
    cy.get('[data-cy="page-action-button"]').click();
    cy.get('[data-cy="page-action-item-metric-browser"]').click();
    cy.wait('@loadSimpleList');
    cy.get('ux-side-panel').should('be.visible')
      .get('right-side-panel > ux-side-panel').contains('Simple List');
  });

  it('removes side panel on changing to a page with no side panel action', () => {
    cy.intercept('GET', `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/uiTestWidgets*`).as('getPagesData');
    cy.get('button.ux-side-menu-toggle').click();
    cy.get('[data-cy="navigation-menuEntry-testSidePanelEntry"]').should('be.visible');
    cy.get('[data-cy="navigation-menuEntry-testWidgetsEntry"] > .ux-side-menu-item > .ux-side-menu-item-content').click();
    cy.wait(['@getPagesData', '@getWebapiData']);
    cy.get('ux-side-panel').should('not.exist');
  });
});
