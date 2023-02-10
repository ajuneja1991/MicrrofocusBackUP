// <reference types="Cypress" />

const shared = require('../../../shared/shared');

describe('Advanced Select', shared.defaultTestOptions, () => {
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
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/SavedMetricsPage*`
    }).as('getNewSavedPage');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/widgets/metric_browser_mockdsproxy`
    }).as('getWidget');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pages/toc*`
    }).as('getTOC');
    cy.bvdLogin();
    cy.visit('/metricBrowserDemo?_tft=A&_a=open_metric_browser&_ctx=~(~(id~%278553d044-6e7b-46a0-aee3-ffcc24615ed6~name~%27CiscoO~type~%27node)~(id~%272553d044-6e7b-46a0-aee3-ffcc24615ed7~name~%27lab-s1~type~%27node))');
    cy.wait(['@getTestPage', '@getTOC', '@getWidget']);
    cy.wait(['@getWebApiData', '@getWebApiData', '@getWebApiData', '@getWebApiData', '@getWebApiData', '@getWebApiData']);
    cy.get('ux-side-panel').find('[data-cy="dataExplorer"]');
    cy.get('.metric-browser-spinner > [data-cy="spinnerOverlay"]').should('not.be.visible');
  });

  it('Advanced select dropdown should persist the recently selected options on changing the target Types or closing the metric browser panel', () => {
    cy.get('[data-cy="advanced-select-dropdown"]').find('.ng-arrow-wrapper').click();
    cy.get('[data-cy="advanced-select-dropdown"]').find('[data-cy="options-count"]').first().should('contain.text', '2 items');
    cy.get('[data-cy="advanced-select-dropdown"]').find('.ng-arrow-wrapper').click();

    // select interface targetType and select an option
    cy.get('[data-cy="TargetTypesDropdown"]').find('.ux-select-icon').click();
    cy.get('[data-cy="targetTypeTitle"]').contains('Interface').click();
    cy.get('[data-cy="advanced-select-dropdown"]').find('.ng-arrow-wrapper').click();
    cy.get('[data-cy="advanced-select-dropdown"]').find('[data-cy="optionName"]').first().click();
    cy.get('[data-cy="advanced-select-dropdown"]').find('[data-cy="options-count"]').first().should('contain.text', '1 items');
    cy.get('[data-cy="advanced-select-dropdown"]').find('.ng-arrow-wrapper').click();

    // select node and then select interface to check if old selection remains
    cy.get('[data-cy="TargetTypesDropdown"]').find('.ux-select-icon').click();
    cy.get('[data-cy="targetTypeTitle"]').contains('Node').click();
    cy.wait(['@getWebApiData', '@getWebApiData', '@getWebApiData', '@getWebApiData', '@getWebApiData', '@getWebApiData']);
    cy.get('[data-cy="TargetTypesDropdown"]').find('.ux-select-icon').click();
    cy.get('[data-cy="targetTypeTitle"]').contains('Interface').click();
    cy.wait(['@getWebApiData', '@getWebApiData', '@getWebApiData', '@getWebApiData', '@getWebApiData', '@getWebApiData']);
    cy.get('[data-cy="advanced-select-dropdown"]').find('.ng-arrow-wrapper').click();
    cy.get('[data-cy="advanced-select-dropdown"]').find('[data-cy="options-count"]').first().should('contain.text', '1 items');
    cy.get('[data-cy="advanced-select-dropdown"]').find('.ng-arrow-wrapper').click();

    // reopen the sidepanel, select interface and check that selection is still there
    cy.get('[data-cy="btn-side-panel-close"]').click();
    cy.get('[data-cy="page-action-button"]').click();
    cy.get('[data-cy="page-action-item-open_metric_browser"]').click();
    cy.wait('@getWebApiData');
    cy.get('[data-cy="TargetTypesDropdown"]').find('.ux-select-icon').click();
    cy.get('[data-cy="targetTypeTitle"]').contains('Interface').click();
    cy.wait(['@getWebApiData', '@getWebApiData', '@getWebApiData', '@getWebApiData', '@getWebApiData', '@getWebApiData']);
    cy.get('[data-cy="advanced-select-dropdown"]').find('.ng-arrow-wrapper').click();
    cy.get('[data-cy="advanced-select-dropdown"]').find('[data-cy="options-count"]').first().should('contain.text', '1 items');
    cy.get('[data-cy="advanced-select-dropdown"]').find('.ng-arrow-wrapper').click();
  });

  it('RecentOptions count should not change if any recently selected item is removed unselecting the selected option', () => {
    cy.get('[data-cy="advanced-select-dropdown"]').find('.ng-arrow-wrapper').click();
    cy.get('[data-cy="advanced-select-dropdown"]').find('[data-cy="options-count"]').first().should('contain.text', '2 items');
    cy.get('[data-cy="advanced-select-dropdown"]').find('.ng-option-selected').eq(1).click();
    cy.get('[data-cy="advanced-select-dropdown"]').find('[data-cy="options-count"]').first().should('contain.text', '2 items');
    cy.get('[data-cy="advanced-select-dropdown"]').find('.ng-arrow-wrapper').click();
  });

  it('Should disable the option on select', () => {
    cy.get('[data-cy="advanced-select-dropdown"]').find('.ng-arrow-wrapper').click();
    cy.get('[data-cy="advanced-select-dropdown"]').find('[data-cy="optionName"]').contains('mpls2950-1.ftc.hpeswlab.net').click();
    cy.get('[data-cy="advanced-select-dropdown"]').find('[data-cy="optionName"]').contains('mpls2950-1.ftc.hpeswlab.net').should('not.have.class', 'option-disabled');
    cy.get('[data-cy="selected-option-CiscoO"]').find('.tag-remove').click();
    cy.wait(['@getWebApiData', '@getWebApiData']);
    cy.get('[data-cy="advanced-select-dropdown"]').find('[data-cy="optionName"]').contains('CiscoO').parent().should('not.have.class', 'option-disabled');
  });

  it('Should show separate dropdown on click of N more and options can be removed from the selected list on click of X', () => {
    cy.get('[data-cy="advanced-select-dropdown"]').find('.ng-arrow-wrapper').click();
    cy.get('[data-cy="advanced-select-dropdown"]').find('[data-cy="optionName"]').contains('mpls2950-1.ftc.hpeswlab.net').click();
    cy.get('[data-cy="advanced-select-dropdown"]').find('[data-cy="optionName"]').contains('CiscoO').click();
    cy.get('[data-cy="advanced-select-dropdown"]').find('[data-cy="optionName"]').contains('mplshadow.ftc.hpeswlab.net').click();
    cy.get('[data-cy="advanced-select-dropdown"]').find('[data-cy="moreSelected"]').click();
    cy.get('[data-cy="selectedOptionsMenu"]').find('.dropdown-menu-text').first().trigger('mouseover');
    cy.get('[data-cy="removeSelected"]').invoke('attr', 'style', 'visibility: visible').first().click();
  });

  it('Should be able to search in Advanced select dropdown', () => {
    cy.get('[data-cy="advanced-select-dropdown"]').find('.ng-arrow-wrapper').click();
    cy.get('[data-cy="advanced-select-dropdown"]').find('.advanced-select-search').click().type('o');
    cy.get('[data-cy="advanced-select-dropdown"]').find('[data-cy="optionName"]').contains('mplshadow.ftc.hpeswlab.net');
    cy.get('[data-cy="advanced-select-dropdown"]').find('[data-cy="optionName"]').contains('CiscoO').parent().should('not.have.class', 'option-disabled');
  });

  it('Click the cross icon clears input field', () => {
    cy.get('[data-cy="advanced-select-dropdown"]').find('.ng-arrow-wrapper').click();
    cy.get('[data-cy="advanced-select-dropdown"]').find('.advanced-select-search').click().type('o');
    cy.get('[data-cy="advanced-select-dropdown"]').find('[data-cy="clearSearch"]').click();
    cy.get('[data-cy="advanced-select-dropdown"]').find('.advanced-select-search').should('have.value', '');
  });

  it('Should not be able to search in Advanced select dropdown by typing special characters', () => {
    cy.get('[data-cy="advanced-select-dropdown"]').find('.ng-arrow-wrapper').click();
    cy.get('[data-cy="advanced-select-dropdown"]').find('.advanced-select-search').click().type('*!2');
    cy.get('[data-cy="advanced-select-dropdown"]').find('.scroll-host').contains('No targets found');
  });

  it('Should be able to search in Advanced select dropdown and check the count of matching terms in favorites and target nodes', () => {
    cy.get('[data-cy="advanced-select-dropdown"]').find('.ng-arrow-wrapper').click();
    cy.get('[data-cy="advanced-select-dropdown"]').find('.advanced-select-search').click().type('l');
    cy.get('.advanced-select-header').get('[data-cy="options-count"]').first().contains('3');
    cy.get('[data-cy="advanced-select-dropdown"]').find('[data-cy="optionName"]').contains('lab-s1');
    cy.get('[data-cy="advanced-select-dropdown"]').find('[data-cy="optionName"]').contains('mplshadow.ftc.hpeswlab.net');
    cy.get('.advanced-select-header').get('[data-cy="options-count"]').last().contains('28');
  });

  it('Should disable the filter option on select in Filter By Key Value dropdown', () => {
    cy.get('[data-cy="advanced-select-dropdown"]').find('.ng-arrow-wrapper').click();
    cy.get('[data-cy="advanced-select-filter"]').click();
    cy.get('[data-cy="select-filter-fieldGroup"] div input').should('have.value', 'Component Health');
    cy.get('[data-cy="filterByKeyValueDropdown"] .ux-select-container> .ux-select-icons').click();
    cy.get('[data-cy="optionTitle"]').contains('Node UUID').click();
    cy.get('[data-cy="tagName-node_unique_id"]').contains('Node UUID');
    cy.get('[data-cy="filterByKeyValueDropdown"] .ux-select-container> .ux-select-icons').click();
    cy.get('[data-cy="optionTitle"]').contains('Node UUID').parent().should('have.class', 'isSelected');
  });

  it('should be able to apply multiple Filters in Filter By Key Value dropdown', () => {
    cy.get('[data-cy="advanced-select-dropdown"]').find('.ng-arrow-wrapper').click();
    cy.get('[data-cy="advanced-select-filter"]').click();
    cy.get('[data-cy="select-filter-fieldGroup"] div input').should('have.value', 'Component Health');
    cy.get('[data-cy="filterByKeyValueDropdown"] .ux-select-container> .ux-select-icons').click();
    cy.get('[data-cy="optionTitle"]').contains('Node UUID').click();
    cy.get('[data-cy="tagName-node_unique_id"]').contains('Node UUID');
    cy.get('[data-cy="filterByKeyValueDropdown"] .ux-select-container> .ux-select-icons').click();
    cy.get('[data-cy="optionTitle"]').contains('Security Group Name').click();
    cy.get('[data-cy="tagName-node_unique_id"]').contains('Node UUID');
    cy.get('[data-cy="tagName-security_group_name"]').contains('Security Group Name');
  });

  it('should be able to search Filters in Filter By Key Value dropdown', () => {
    cy.get('[data-cy="advanced-select-dropdown"]').find('.ng-arrow-wrapper').click();
    cy.get('[data-cy="advanced-select-filter"]').click();
    cy.get('[data-cy="filterByKeyValueDropdown"] .ux-select-container> .ux-select-icons').click();
    cy.get('.filter-container> .form-control').click().type('m');
    cy.get('[data-cy="optionTitle"]').contains('Node Name');
  });

  it('should not be able to search through Filter By Key Value dropdown by typing special characters', () => {
    cy.get('[data-cy="advanced-select-dropdown"]').find('.ng-arrow-wrapper').click();
    cy.get('[data-cy="advanced-select-filter"]').click();
    cy.get('[data-cy="filterByKeyValueDropdown"] .ux-select-container> .ux-select-icons').click();
    cy.get('.filter-container> .form-control').click().type('*!2');
    cy.get('.not-found-title').should('contain.text', 'No Attributes found');
  });

  it('should be able to update Filter by key components based on inputs from filter by component', () => {
    cy.get('[data-cy="advanced-select-dropdown"]').find('.ng-arrow-wrapper').click();
    cy.get('[data-cy="advanced-select-filter"]').click();
    cy.get('[data-cy="select-filter-fieldGroup"] div input').should('have.value', 'Component Health');
    cy.get('[data-cy="filterByKeyValueDropdown"] .ux-select-container > .ux-select-icons').click();
    cy.get('[data-cy="optionTitle"]').contains('Node UUID').click();
    cy.get('[data-cy="tagRemove-node_unique_id"]').click();
    cy.get('[data-cy="select-filter-fieldGroup"] div .ux-select-icons').click();
    cy.get('.ux-typeahead-options > ux-typeahead-options-list > ol > li').last().click();
    cy.wait(['@getWebApiData', '@getWebApiData', '@getWebApiData', '@getWebApiData', '@getWebApiData']);
    cy.get('[data-cy="filterByKeyValueDropdown"] .ux-select-container> .ux-select-icons').click();
    cy.get('[data-cy="optionTitle"]').contains('Node UUID');
  });

  it('should be able to show the tags, once user select filter from Filters in Filter By Key Value dropdown ', () => {
    cy.get('[data-cy="advanced-select-dropdown"]').find('.ng-arrow-wrapper').click();
    cy.get('[data-cy="advanced-select-filter"]').click();
    cy.get('[data-cy="filterByKeyValueDropdown"] .ux-select-container> .ux-select-icons').click();
    cy.get('[data-cy="optionTitle"]').contains('Node UUID').click();
    cy.get('[data-cy="tagName-node_unique_id"]').contains('Node UUID');
  });

  it('should be able to edit the tags, and apply the filter when mouse click event triggered ', () => {
    cy.get('[data-cy="advanced-select-dropdown"]').find('.ng-arrow-wrapper').click();
    cy.get('[data-cy="advanced-select-filter"]').click();
    cy.get('[data-cy="filterByKeyValueDropdown"] .ux-select-container> .ux-select-icons').click();
    cy.get('[data-cy="optionTitle"]').contains('Node UUID').click();
    cy.get('[data-cy="filterByKeyValueContainer"]').should('not.exist');
    cy.get('[data-cy="tagName-node_unique_id"]').contains('Node UUID');
    cy.get('.tag-container').parent().invoke('attr', 'style', 'overflow: visible').click().type('Routers');
    cy.get('body').click();
    cy.wait('@getWebApiData');
  });

  it('should be able to edit the tags,and apply the filter when keyboard event triggered ', () => {
    cy.get('[data-cy="advanced-select-dropdown"]').find('.ng-arrow-wrapper').click();
    cy.get('[data-cy="advanced-select-filter"]').click();
    cy.get('[data-cy="filterByKeyValueDropdown"] .ux-select-container> .ux-select-icons').click();
    cy.get('[data-cy="optionTitle"]').contains('Node UUID').click();
    cy.get('[data-cy="filterByKeyValueContainer"]').should('not.exist');
    cy.get('[data-cy="tagName-node_unique_id"]').contains('Node UUID');
    cy.get('.tag-container').parent().invoke('attr', 'style', 'overflow: visible').click().type('Routers{enter}');
    cy.wait('@getWebApiData');
  });

  it('should be able to close the tag ', () => {
    cy.get('[data-cy="advanced-select-dropdown"]').find('.ng-arrow-wrapper').click();
    cy.get('[data-cy="advanced-select-filter"]').click();
    cy.get('[data-cy="filterByKeyValueDropdown"] .ux-select-container> .ux-select-icons').click();
    cy.get('[data-cy="optionTitle"]').contains('Node UUID').click();
    cy.get('[data-cy="tagName-node_unique_id"]').contains('Node UUID');
    cy.get('[data-cy="tagRemove-node_unique_id"]').click();
    cy.get('[data-cy="tagName-node_unique_id"]').should('not.exist');
  });

  it('should not show any items if API does not return them', () => {
    cy.get('[data-cy="advanced-select-dropdown"]').find('.ng-arrow-wrapper').click();
    cy.get('[data-cy="advanced-select-filter"]').click();
    cy.get('[data-cy="filterByKeyValueDropdown"] .ux-select-container> .ux-select-icons').click();
    cy.get('[data-cy="optionTitle"]').contains('Node Name').click();
    cy.get('[data-cy="filterByKeyValueContainer"]').should('not.exist');
    cy.get('[data-cy="tagName-node_name"]').contains('Node Name');
    cy.get('.tag-container').parent().invoke('attr', 'style', 'overflow: visible').click().type('empty{enter}');
    cy.wait('@getWebApiData');
    cy.get('[data-cy="selected-option-CiscoO"]'); // selected objects should remain
    cy.get('[data-cy="selected-option-lab-s1"]'); // selected objects should remain
    cy.get('[data-cy="noTargetsFound"]');
    cy.get('[data-cy="advanced-select-dropdown"]').find('.ng-arrow-wrapper').click();

    // changing the target type should not remember the old type
    cy.get('[data-cy="TargetTypesDropdown"]').find('.ux-select-icon').click();
    cy.get('[data-cy="targetTypeTitle"]').contains('Interface').click();
    cy.wait(['@getWebApiData', '@getWebApiData', '@getWebApiData', '@getWebApiData', '@getWebApiData', '@getWebApiData']);
    cy.get('[data-cy="selected-option-mpls2950-1.ftc.hpeswlab.net"]').should('not.exist'); // node objects should not be selected
    cy.get('[data-cy="selected-option-lab-s1"]').should('not.exist'); // node objects should not be selected
    cy.get('[data-cy="noTargetsFound"]').should('not.exist');
    cy.get('[data-cy="advanced-select-dropdown"]').find('.ng-arrow-wrapper').click();
  });

  it('By changing the target type, selected targets should not list the targets which belongs to other entity type', () => {
    cy.get('[data-cy="TargetTypesDropdown"]').find('.ux-select-icon').click();
    cy.get('[data-cy="targetTypeTitle"]').contains('Ports').click();
    cy.get('.metric-browser-spinner > [data-cy="spinnerOverlay"]').should('not.be.visible');
    cy.get('[data-cy="advanced-select-dropdown"]').click();
    cy.get('[data-cy="noTargetsFound"]').contains(' No targets found');
  });

  it('should display error notification if API throws an error on selecting the target type', () => {
    cy.get('[data-cy="TargetTypesDropdown"]').find('.ux-select-icon').click();
    cy.get('[data-cy="targetTypeTitle"]').contains('Qaprobe').click();
    cy.get('.ux-side-menu-content-panel').find('notification').find('[data-cy="notification-error-text"]').contains('Instance qaprobe not found');
  });

  it('should display error notification if API throws an error on selecting a target option in advanced select dropdown', () => {
    cy.get('[data-cy="advanced-select-dropdown"]').find('.ng-arrow-wrapper').click();
    cy.get('[data-cy="advanced-select-dropdown"]').find('[data-cy="optionName"]').contains('node with errors').click();
    cy.get('.ux-side-menu-content-panel').find('notification').find('[data-cy="notification-error-text"]').contains('FieldGroup not found for instanceID node-error');
    cy.get('[data-cy="advanced-select-dropdown"]').find('.ng-arrow-wrapper').click();
    cy.get('.de-panel .table tbody').first().contains('No Metrics Found');
    cy.get('[data-cy="moreSelected"]').click();
    cy.get('[data-cy="removeSelected"]').click();
  });

  it('should display error notification if API throws an error on selecting an attribute in filter by key value dropdown', () => {
    cy.get('[data-cy="advanced-select-dropdown"]').find('.ng-arrow-wrapper').click();
    cy.get('[data-cy="advanced-select-filter"]').click();
    cy.get('[data-cy="select-filter-fieldGroup"] div input').should('have.value', 'Component Health');
    cy.get('[data-cy="filterByKeyValueDropdown"] .ux-select-container> .ux-select-icons').click();
    cy.get('[data-cy="optionTitle"]').contains('Attribute not found').click();
    cy.get('body').click();
    cy.get('.ux-side-menu-content-panel').find('notification').find('[data-cy="notification-error-text"]').contains('Data not found for this Attribute');
  });

  it('Should be able to search in Advanced select dropdown and select all filtered items', () => {
    cy.get('[data-cy="advanced-select-dropdown"]').find('.ng-arrow-wrapper').click();
    cy.get('[data-cy="advanced-select-dropdown"]').find('.advanced-select-search').click().type('mplsce22');
    cy.get('[data-cy="advanced-select-dropdown"]').find('.advanced-select-header-container').get('[data-cy="groupName"]').contains('node Targets');
    cy.get('[data-cy="advanced-select-dropdown"]').find('.advanced-select-header-container').get('[data-cy="groupCheckbox"]').click();
    cy.get('[data-cy="advanced-select-dropdown"]').find('[data-cy="moreSelected"]').should('contain.text', '1 more...');
  });

  it('Should be able to Select multiple options using shiftkey', () => {
    cy.get('[data-cy="advanced-select-dropdown"]').find('.ng-arrow-wrapper').click();
    cy.get('[data-cy="advanced-select-dropdown"]').find('[data-cy="optionName"]').contains('mpls2950-1.ftc.hpeswlab.net').click();
    cy.get('[data-cy="advanced-select-dropdown"]').find('[data-cy="optionName"]').contains('mplsce01.ftc.hpeswlab.net').click({ shiftKey: true });
    cy.get('[data-cy="advanced-select-dropdown"]').find('[data-cy="optionName"]').contains('mplsce03.ftc.hpeswlab.net').click({ shiftKey: true });
  });

  it('Should be able to Select All the options', () => {
    cy.get('[data-cy="advanced-select-dropdown"]').find('.ng-arrow-wrapper').click();
    cy.get('[data-cy="advanced-select-dropdown"]').find('.advanced-select-header-container').get('[data-cy="groupName"]').contains('Recent');
    cy.get('[data-cy="advanced-select-dropdown"]').find('.advanced-select-header-container').get('[data-cy="groupCheckbox"]').click();
    cy.get('[data-cy="advanced-select-dropdown"]').find('[data-cy="moreSelected"]').should('contain.text', '28 more...');

    // Deselect all
    cy.get('[data-cy="advanced-select-dropdown"]').find('.advanced-select-header-container').get('[data-cy="groupCheckbox"]').click();
    cy.get('[data-cy="moreSelected"]').should('not.exist');
  });
});

