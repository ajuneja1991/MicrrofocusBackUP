// <reference types="Cypress" />
const shared = require('../../../shared/shared');

describe('DataExplorer', shared.defaultTestOptions, () => {
  beforeEach(() => {
    cy.intercept({
      method: 'POST',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/datasource/ws/data`
    }).as('getWebApiData');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/metricBrowserDemo*`
    }).as('getTestPage');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/*`
    }).as('getNewSavedPage');
    cy.intercept({
      method: 'POST',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/menuEntries`
    }).as('postMenuEntry');
    cy.intercept({
      method: 'DELETE',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pages/*`
    }).as('deleteDefinition');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/widgets/metric_browser_mockdsproxy`
    }).as('getWidget');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pages/toc*`
    }).as('getTOC');
    cy.intercept({
      method: 'PUT',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pages/*`
    }).as('putPages');
    cy.bvdLogin();
    cy.visit('/metricBrowserDemo?_tft=A&_a=open_metric_browser&_ctx=~(~(id~%278553d044-6e7b-46a0-aee3-ffcc24615ed6~name~%27CiscoO~type~%27node)~(id~%272553d044-6e7b-46a0-aee3-ffcc24615ed7~name~%27lab-s1~type~%27node))', {
      onBeforeLoad(win) {
        win.sessionStorage.clear();
      }
    });
    cy.get('[data-cy=app-spinnerOverlay]').should('not.exist');
    cy.wait(['@getTestPage', '@getTOC', '@getWidget']);
    cy.get('[data-cy=spinnerOverlay]').should('not.be.visible');
    cy.wait(['@getWebApiData']);
    cy.get('ux-side-panel').find('[data-cy="dataExplorer"]');
    cy.get('[data-cy="TargetTypesDropdown"]').contains('Node');
    cy.wait(['@getWebApiData', '@getWebApiData', '@getWebApiData']);
    cy.get('[data-cy="selected-option-CiscoO"]');
    cy.get('[data-cy="selected-option-lab-s1"]');
    cy.wait(['@getWebApiData', '@getWebApiData']);
    cy.get('.metric-browser-spinner > [data-cy="spinnerOverlay"]').should('not.be.visible');
  });

  it('should not display metric field groups when no target is selected', () => {
    cy.get('[data-cy="selected-option-CiscoO"]').find('.tag-remove').click();
    cy.get('[data-cy="selected-option-lab-s1"]').find('.tag-remove').click();
    cy.get('.de-panel .table tbody').first().contains('No Metrics Found');
  });

  it('should not display metric field groups when no target is selected but the user searches for a metrics', () => {
    cy.get('[data-cy="selected-option-CiscoO"]').find('.tag-remove').click();
    cy.get('[data-cy="selected-option-lab-s1"]').find('.tag-remove').click();
    cy.get('.de-panel .table tbody').first().contains('No Metrics Found');
    cy.get('[data-cy="dataExplorer"]').find('ux-toolbar-search> input').first().click().type('memory');
    cy.get('.de-panel .table tbody').first().contains('No Metrics Found');
  });

  it('should show metrics list for the selected entity', () => {
    cy.get('[data-cy="field-group-component_health"]').click();
    cy.get('[data-cy="metricName"]').first().contains('Backplane Utilization (avg)');
  });

  it('should show select target label', () => {
    cy.get('[data-cy="select-target"]');
  });

  it('should show select metric label', () => {
    cy.get('[data-cy="select-metric"]');
  });

  it('should show metric click + and drag and drop hint text to user', () => {
    cy.get('#hintText');
  });

  it('should add metric widget to dashboard on click of add icon', () => {
    cy.get('[data-cy="field-group-component_health"]').click();
    cy.get('[data-cy="metricContainer"]').first().click();
    cy.get('[data-cy="metricContainer"]').find('button').first().invoke('show').click();
    cy.get('.dashboard-widget-title span').contains('Backplane Utilization (avg)');
    cy.get('echarts-chart svg');
  });

  it('should have drag icon appear before metric ', () => {
    cy.get('[data-cy="field-group-component_health"]').click();
    cy.get('[data-cy="metricContainer"]');
    cy.get('.qtm-icon-drag--16');
  });

  it('should be able see context items in "By relation" dropdown and select first item', () => {
    cy.get('[data-cy="TargetTypesDropdown"] .ux-select-container> button').click();
    cy.get('[data-cy="targetTypeTitle"]').contains('By relation').trigger('mouseover');
    cy.get('[data-cy="targetTypeTitle"]').contains('By relation').click();
    cy.get('[data-cy="entitySelectorDropdown"] .ux-select-container> button').click();
    cy.get('.title').should('contain.text', 'CiscoO');
    cy.get('.title').should('contain.text', 'lab-s1');
    cy.get('[data-cy="entitySelectorDropdown"] div button')
      .should($button => {
        expect($button).to.contain('CiscoO');
      });
  });

  function expandCiscoInByRelation() {
    cy.get('[data-cy="TargetTypesDropdown"] .ux-select-container> button')
      .click();
    cy.get('[data-cy="targetTypeTitle"]')
      .contains('By relation')
      .click();
    cy.get('[data-cy="entitySelectorDropdown"] .ux-select-container')
      .click();
    cy.get('[data-cy="entityListContainer"]')
      .find('#CiscoO')
      .trigger('mouseover');
    cy.get('[data-cy="entityListContainer"]')
      .find('#CiscoO')
      .click();
    cy.wait(['@getWebApiData', '@getWebApiData', '@getWebApiData']);
  }

  it('should not remove the context item on clicking the selected item in the dropdown', () => {
    cy.get('[data-cy="TargetTypesDropdown"] .ux-select-container> button').click();
    cy.get('[data-cy="targetTypeTitle"]').contains('By relation').trigger('mouseover');
    cy.get('[data-cy="targetTypeTitle"]').contains('By relation').click();
    cy.get('[data-cy="entitySelectorDropdown"] .ux-select-container> button').click();
    cy.get('#opt-CiscoO').click();
    cy.get('[data-cy="entitySelectorDropdown"] div button')
      .should($button => {
        expect($button).to.contain('CiscoO');
      });
  });

  it('should be able to search through entity list dropdown', () => {
    expandCiscoInByRelation();
    cy.get('[data-cy="entityListContainer"]').find('input').first().click().type('t');
    cy.get('.title').should('contain.text', 'Network Interface');
    cy.get('.title').should('contain.text', 'GigabitEthernet1/2/0/6 on (h3c-12k-1.ftc.hpeswlab.net)');
    cy.get('.title').should('contain.text', 'Et1/1 on (Cisco0)');
  });

  it('should not be able to search through entity list dropdown by typing special characters', () => {
    expandCiscoInByRelation();
    cy.get('[data-cy="entityListContainer"]').find('input').first().click().type('*!2');
    cy.get('.entity-title').should('contain.text', 'No objects found');
  });

  it('should be able to search through metric list dropdown', () => {
    cy.get('[data-cy="field-group-component_health"]').should('be.visible');
    cy.get('[data-cy="dataExplorer"]').find('ux-toolbar-search> input').first().click().type('memory util');
    cy.get('[data-cy="metricName"]').contains('Memory Utilization (avg)');
  });

  it('should not be able search through metric list dropdown by typing special characters', () => {
    cy.get('[data-cy="field-group-component_health"]').should('be.visible');
    cy.get('[data-cy="dataExplorer"]').find('ux-toolbar-search> input').first().click().type('*!2');
    cy.get('[data-cy="noMetricsFound"]').first().contains('No Metrics Found');
  });

  it('should not be able to search through metric list dropdown by typing metricName which does not exist', () => {
    cy.get('[data-cy="field-group-component_health"]').should('be.visible');
    cy.get('[data-cy="dataExplorer"]').find('ux-toolbar-search> input').first().click().type('testMetric');
    cy.get('[data-cy="noMetricsFound"]').first().contains('No Metrics Found');
  });

  it('should be able find related entity type for the selected entity ', () => {
    cy.get('[data-cy="TargetTypesDropdown"] .ux-select-container> button').click();
    cy.get('[data-cy="targetTypeTitle"]').contains('By relation').click();
    cy.get('[data-cy="entitySelectorDropdown"] .ux-select-container').click();
    cy.get('[data-cy="entityListContainer"]').find('[data-cy="CiscoO"]').trigger('mouseover');
    cy.get('[data-cy="entityListContainer"]').find('[data-cy="CiscoO"]').click();
    cy.wait(['@getWebApiData', '@getWebApiData', '@getWebApiData']);

    cy.get('.title').should('contain.text', 'Network Interface');
  });

  it('should be able find related entities for the selected entity type', () => {
    cy.get('[data-cy="TargetTypesDropdown"] .ux-select-container> button').click();
    cy.get('[data-cy="targetTypeTitle"]').contains('By relation').trigger('mouseover');
    cy.get('[data-cy="targetTypeTitle"]').contains('By relation').click();
    cy.get('[data-cy="entitySelectorDropdown"] .ux-select-container').click();
    cy.get('[data-cy="entityListContainer"]').find('[data-cy="CiscoO"]').trigger('mouseover');
    cy.get('[data-cy="entityListContainer"]').find('[data-cy="CiscoO"]').click();
    cy.wait(['@getWebApiData', '@getWebApiData', '@getWebApiData']);

    cy.get('[data-cy="entityListContainer"]').find('[data-cy="Network Interface"]').click();
    cy.get('.title').should('contain.text', 'GigabitEthernet1/2/0/6 on (h3c-12k-1.ftc.hpeswlab.net)');
    cy.get('.title').should('contain.text', 'Et1/1 on (Cisco0)');
  });

  it('should be able to scroll to selected related entities for the selected entity type', () => {
    expandCiscoInByRelation();
    cy.get('[data-cy="entityListContainer"]').find('[data-cy="Network Interface"]').click();
    cy.get('.title').contains('Se1/0.1 on (Cisco0)').scrollIntoView();
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(1000);
    cy.get('[data-cy="nodetitle"]').contains('Se1/0.1 on (Cisco0)').click().type('{esc}');
    cy.wait(['@getWebApiData', '@getWebApiData', '@getWebApiData']);
    cy.get('[data-cy="entitySelectorDropdown"] .ux-select-container').click();
    cy.get('[data-cy="entityListContainer"]').find('[data-cy="CiscoO"] span.toggle-children').click();
    cy.get('[data-cy="entityListContainer"]').find('[data-cy="Network Interface"]').click();
    cy.get('.title').should('contain.text', 'Se1/0.1 on (Cisco0)').should('be.visible');
  });

  it('should be able to select multiple entities of the same type', () => {
    cy.get('[data-cy="TargetTypesDropdown"] .ux-select-container> button').click();
    cy.get('[data-cy="targetTypeTitle"]').contains('By relation').click();
    cy.get('[data-cy="tagName"]').should('have.length', 2);
    cy.get('[data-cy="tagName"]').should('contain.text', 'CiscoO');
    cy.get('[data-cy="tagName"]').should('contain.text', 'lab-s1');
  });

  it('should be able to reset the selection when entity of another type is selected', () => {
    expandCiscoInByRelation();
    cy.get('[data-cy="entityListContainer"]').find('[data-cy="Network Interface"]').click();
    cy.get('[data-cy="nodetitle"]').contains('GigabitEthernet1/2/0/6 on (h3c-12k-1.ftc.hpeswlab.net)').trigger('mouseover');
    cy.get('[data-cy="nodetitle"]').contains('GigabitEthernet1/2/0/6 on (h3c-12k-1.ftc.hpeswlab.net)').click();
    cy.get('[data-cy="tagName"]').should('have.length', 1);
    cy.get('[data-cy="tagName"]').should('contain.text', 'GigabitEthernet1/2/0/6 on (h3c-12k-1.ftc.hpeswlab.net)');
  });

  it('should show a combined tag when more than 2 objects are selected', () => {
    expandCiscoInByRelation();
    cy.get('[data-cy="entityListContainer"]').find('[data-cy="Network Interface"]').click();
    cy.get('[data-cy="nodetitle"]').contains('GigabitEthernet1/2/0/6 on (h3c-12k-1.ftc.hpeswlab.net)').trigger('mouseover').click();
    cy.get('[data-cy="nodetitle"]').contains('Et1/1 on (Cisco0)').trigger('mouseover').click();
    cy.get('[data-cy="nodetitle"]').contains('Fa0/0 on (Cisco0)').trigger('mouseover').click();
    cy.get('[data-cy="tagName"]').should('have.length', 3);
    cy.get('[data-cy="tagName"]').should('contain.text', '1 more...');
  });

  it('should remove the tag when remove icon is clicked', () => {
    cy.get('[data-cy="TargetTypesDropdown"] .ux-select-container> button').click();
    cy.get('[data-cy="targetTypeTitle"]').contains('By relation').click();
    cy.get('[data-cy="tagRemove"]').first().click();
    cy.get('[data-cy="tagName"]').should('have.length', 1);
    cy.get('[data-cy="tagName"]').should('contain.text', 'lab-s1');
  });

  it('should clear all tags when clear icon is clicked', () => {
    cy.get('[data-cy="TargetTypesDropdown"] .ux-select-container> button').click();
    cy.get('[data-cy="targetTypeTitle"]').contains('By relation').click();
    cy.get('[data-cy="tagClearAll"]').click();
    cy.get('[data-cy="tagName"]').should('have.length', 0);
    cy.get('[data-cy="tagPlaceholder"]').should('contain.text', 'Select by target relation');
  });

  function addNewWidgetAndSavePage() {
    cy.get('[data-cy="field-group-component_health"]').click();
    cy.get('[data-cy="metricContainer"]').first().click();
    cy.get('[data-cy="metricContainer"]').find('[data-cy="field-add-button-backplane_util_avg_pct"]').first().invoke('show').click();
    cy.wait(['@getWebApiData']);
    cy.get('ux-side-panel').get('[data-cy=btn-side-panel-close]').click();
    cy.get('[data-cy="page-action-button"]').click();
    cy.get('[data-cy="page-action-item-saveAs"]').click();
    cy.get('[data-cy="pgmt-properties-instanceDefinition-instance-title"]').type('Saved Metrics Page');
    cy.get('[data-cy="categoryDropdownButton"]').click();
    cy.get('.filter-container input[type="text"]').type('Pages');
    cy.get('tree-node-children tree-node-collection').find('tree-node').its('length').should('be.eq', 2);
    cy.get('.highlight').first().click();
    cy.get('[data-cy="submit-button"]').click();
    cy.wait(['@getNewSavedPage', '@postMenuEntry']);
    cy.bvdCheckToast('Definition "Saved Metrics Page-definition" and instance "Saved Metrics Page" saved successfully');
    cy.wait(['@getWebApiData', '@getWebApiData', '@getWebApiData', '@getWebApiData']);
    cy.url().should('not.include', 'metricBrowserDemo');
  }

  it('should add a new widget on page, create a copy and save it under new name', () => {
    addNewWidgetAndSavePage();
    let savedMetricsPageId;
    cy.url().then(theUrl => {
      const theUrlObject = new URL(theUrl);
      savedMetricsPageId = theUrlObject.pathname.split('/')[2];
      cy.get('[data-cy="action-button"]').first().click();
      cy.get('[data-cy="action-button-duplicateWidget"]').click();
      cy.get('[data-cy="page-action-button"]').click();
      cy.get('[data-cy="page-action-item-save"]').should('be.enabled').click();
      cy.get('[data-cy="submit-button"]').click();
      cy.visit(`/${savedMetricsPageId}`);
      cy.wait('@getNewSavedPage');
      cy.url().should('not.include', 'SavedMetricsPage');
      cy.get('[data-cy="page-action-button"]').click();
      cy.get('[data-cy="page-action-item-delete"]').click();
      cy.get('[data-cy="mondrianModalDialogButton"]').click();
      cy.wait(['@deleteDefinition']);
    });
  });

  // pgmt: fails due to closing the add metrics modal with right side panel
  // eslint-disable-next-line mocha/no-skipped-tests
  it.skip('should show By Relation option in target types dropdown after deleting the saved add metric page and opening new add metric page', () => {
    addNewWidgetAndSavePage();
    cy.get('[data-cy="field-group-component_health"]').click();

    cy.get('ux-side-panel').find('[data-cy="dataExplorer"]').should('be.visible');
    cy.get('[data-cy="page-action-button"]').click();
    cy.get('[data-cy="page-action-item-delete"]').click();
    cy.get('[data-cy="mondrianModalDialogButton"]').click();
    cy.visit('/metricBrowserDemo?_a=open_metric_browser');
    cy.get('[data-cy=app-spinnerOverlay]').should('not.exist');
    cy.wait(['@getTestPage', '@getTOC', '@getWidget']);
    cy.get('[data-cy=spinnerOverlay]').should('not.be.visible');
    cy.wait(['@getWebApiData']);
    cy.get('ux-side-panel').find('[data-cy="dataExplorer"]');
    cy.get('[data-cy="TargetTypesDropdown"] .ux-select-container> button').click();
    cy.get('[data-cy="targetTypeTitle"]').should('contain.text', 'By relation');
  });

  function deleteContextAndReopenMetricBrowser() {
    cy.get('[data-cy="btn-side-panel-close"]')
      .click();
    cy.get('[data-cy="context-tag-Node"] button.tag-remove')
      .first()
      .click();
    cy.get('[data-cy="page-action-button"]')
      .click();
    cy.get('[data-cy="page-action-item-open_metric_browser"]')
      .click();
    cy.wait(['@getWidget', '@getWebApiData', '@getWebApiData', '@getWebApiData', '@getWebApiData']);
    cy.get('[data-cy="field-group-component_health"]');
  }

  it('Should show Node as selected type in targetType dropdown if cross launched with context even if we remove selected context', () => {
    deleteContextAndReopenMetricBrowser();
    cy.get('[data-cy="TargetTypesDropdown"] .ux-select-container> button').click();
    cy.get('[data-cy="TargetTypesDropdown"] div button')
      .should($button => {
        expect($button).to.contain('Node');
      });
  });

  it('By default, context Items should be selected in target selector and fieldgroups should be loaded', () => {
    cy.get('[data-cy="TargetTypesDropdown"] div button')
      .should($button => {
        expect($button).to.contain('Node');
      });
    cy.get('[data-cy="selected-option-CiscoO"]');
    cy.get('[data-cy="selected-option-lab-s1"]');
    cy.get('[data-cy="field-group-component_health"]');
  });

  it('Display placeholder as Select targets when a metric is added without context', () => {
    cy.visit('/metricBrowserDemo?_a=open_metric_browser', {
      onBeforeLoad(win) {
        win.sessionStorage.clear();
      }
    });
    cy.get('.ux-select-container > button > span').should('contain.text', 'Select targets');
  });

  // Below scenario will raise if we launch dashboard directly
  it('should contain by relation option in target type dropdown without context', () => {
    cy.visit('/metricBrowserDemo?_a=open_metric_browser', {
      onBeforeLoad(win) {
        win.sessionStorage.clear();
      }
    });
    cy.get('[data-cy="TargetTypesDropdown"] .ux-select-container> button').click();
    cy.get('[data-cy="targetTypeTitle"]').contains('By relation');
  });

  it('Filters should depend on the targetType selected', () => {
    cy.get('[data-cy="advanced-select-dropdown"]').click();
    cy.get('.filter-icon-right').click();
    cy.get('[data-cy="select-filter-fieldGroup"] div input').should('have.value', 'Component Health');

    cy.get('[data-cy="advanced-select-dropdown"]').click();
    cy.get('[data-cy="TargetTypesDropdown"] .ux-select-container> button').click();
    cy.get('[data-cy="targetTypeTitle"]').contains('By type').click();
    cy.get('[data-cy="targetTypeTitle"]').contains('By type').click();
    cy.get('[data-cy="targetTypeTitle"]').contains('Interface').click();
    cy.wait('@getWebApiData');
    cy.get('[data-cy="advanced-select-dropdown"]').click();
    cy.get('.filter-icon-right').click();
    cy.get('[data-cy="select-filter-fieldGroup"] div input').should('have.value', 'Interface Health');
  });

  it('Changing between target types should load metrics', () => {
    cy.get('[data-cy="field-group-component_health"]');

    cy.get('[data-cy="TargetTypesDropdown"] .ux-select-container> button').click();
    cy.get('[data-cy="targetTypeTitle"]').contains('Top N').click();
    cy.wait('@getWebApiData'); // expect call should be made
    cy.get('[data-cy="field-group-component_health"]');
  });

  it('Badge should be shown on filter icon if filter is applied', () => {
    cy.get('[data-cy="advanced-select-dropdown"]').click();
    cy.get('.filter-icon-right').click();
    cy.get('[data-cy="select-filter-fieldGroup"] div input').clear();
    cy.get('[data-cy="filter-badge"]').should('not.exist');
    cy.get('[data-cy="advanced-select-dropdown"]').click();
  });

  it('Should show selected items in separate dropdown on click of N more and remove selected on click of X', () => {
    cy.get('[data-cy="TargetTypesDropdown"] .ux-select-container> button').click();
    cy.get('[data-cy="targetTypeTitle"]').contains('By relation').click();
    cy.get('[data-cy="entitySelectorDropdown"] .ux-select-container').click();
    cy.get('[data-cy="entityListContainer"]').find('[data-cy="CiscoO"]').trigger('mouseover');
    cy.get('[data-cy="entityListContainer"]').find('[data-cy="CiscoO"]').click();
    cy.get('[data-cy="entityListContainer"]').find('[data-cy="Network Interface"]').trigger('mouseover');
    cy.get('[data-cy="entityListContainer"]').find('[data-cy="Network Interface"]').click();
    cy.get('[data-cy="nodetitle"]').contains('GigabitEthernet1/2/0/6 on (h3c-12k-1.ftc.hpeswlab.net)').trigger('mouseover').click();
    cy.get('[data-cy="nodetitle"]').contains('Et1/1 on (Cisco0)').trigger('mouseover').click();
    cy.get('[data-cy="nodetitle"]').contains('Fa0/0 on (Cisco0)').trigger('mouseover').click();
    cy.get('.cdk-overlay-backdrop').click();
    cy.get('[data-cy="tagName"]').contains('1 more...').click();
    cy.get('[data-cy="selectedOptionsMenu"]').find('.dropdown-menu-text').should('contain.text', 'Fa0/0 on (Cisco0)');
    cy.get('[data-cy="removeSelected"]').click();
    cy.get('[data-cy="tagName"]').contains('1 more...').should('not.exist');
  });

  it('should display error notification If API throws an error when user add a new widget on page', () => {
    cy.get('[data-cy="field-group-component_health"]').click();
    cy.get('[data-cy="metricContainer"]').find('[data-cy="field-add-button-error_metric_metadata_api"]').first().invoke('show').click();
    cy.get('.ux-side-menu-content-panel').find('notification').find('[data-cy="notification-error-text"]').contains('Details for this metric not found');
  });

  it('Chart widget should display error notifications If API throws an error ', () => {
    cy.get('[data-cy="field-group-component_health"]').click();
    cy.get('[data-cy="metricContainer"]').find('[data-cy="field-add-button-error_metric_data_api"]').first().invoke('show').click();
    cy.wait(['@getWebApiData', '@getWebApiData']);
    cy.wait(['@getWebApiData', '@getWebApiData', '@getWebApiData', '@getWebApiData', '@getWebApiData']);
    cy.get('[data-cy="notification-error-text"]').contains('Data not found for this metric');
  });

  it('Should be able to display units as secs when adding Snmp metrics', () => {
    cy.get('[data-cy="field-group-component_health"]').should('be.visible');
    cy.get('[data-cy="dataExplorer"]').find('ux-toolbar-search> input').first().click().type('snmp');
    cy.get('[data-cy="metricName"]').contains('SNMP Response Time (avg)');
    cy.get('[data-cy="metricContainer"]').should('be.visible');
    cy.get('[data-cy="metricContainer"]').first().click();
    cy.get('[data-cy="metricContainer"]').find('button').first().invoke('show').click();
    cy.get('.leftAxisLabel').should('contain.text', 'secs');
  });

  it('With unsaved changes, removing  widget after duplicating should not remove both original and duplicate', () => {
    cy.get('[data-cy="field-group-component_health"]').should('be.visible');
    cy.get('[data-cy="dataExplorer"]').find('ux-toolbar-search> input').first().click().type('snmp');
    cy.get('[data-cy="metricName"]').contains('SNMP Response Time (avg)');
    cy.get('[data-cy="metricContainer"]').should('be.visible');
    cy.get('[data-cy="metricContainer"]').first().click();
    cy.get('[data-cy="metricContainer"]').find('button').first().invoke('show').click();
    cy.get('[data-cy="dataExplorer"]').find('ux-toolbar-search> input').first().click().clear().type('snmp');
    cy.get('[data-cy="widget-title"]').contains('Component Health - SNMP Response Time (avg)').parent().parent().parent().find('button[data-cy="action-button"]')
      .click();
    cy.get('[data-cy="action-button-duplicateWidget"]').click();
    cy.get('[data-cy="widget-title"]').contains('Component Health - SNMP Response Time (avg)').parent().parent().parent().find('button[data-cy="action-button"]')
      .click();
    cy.get('[data-cy="action-button-removeWidget"]').click();
    cy.get('[data-cy="widget-title"]').contains('Copy of Component Health - SNMP Response Time (avg)');
  });
});
