// <reference types="Cypress" />
const shared = require('../../shared/shared');

describe('Edit Widgets', shared.defaultTestOptions, () => {
  beforeEach(() => {
    cy.intercept({
      method: 'POST',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/datasource/ws/data`
    }).as('getData');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/uiTestEditWidgets*`
    }).as('getPage');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pages/toc*`
    }).as('getTOC');
    cy.bvdLogin();
    cy.visit('/uiTestEditWidgets');
    cy.wait(['@getPage', '@getData', '@getTOC']);
  });

  it('should enable edit action on Description widget', () => {
    cy.get('[data-cy="action-button"]').first().click();
    cy.get('[data-cy="action-button-edit"]');
  });

  it('should show form with widget name input filled on Description Widget', () => {
    cy.get('[data-cy="action-button"]').first().click();
    cy.get('[data-cy="action-button-edit"]').click();
    cy.get('right-side-panel > ux-side-panel').should('have.class', 'open');
    cy.get('[data-cy="widgetNameLabel"]');
    cy.get('[data-cy="widgetNameInput"]').should('have.value', 'Description');
  });

  it('should show form with textbox configured for widget with queryhints with default value', () => {
    cy.get('[data-cy="action-button"]').last().click();
    cy.get('[data-cy="action-button-edit"]').click();
    cy.get('right-side-panel > ux-side-panel').should('have.class', 'open');
    cy.get('[data-cy="editWidget-label-required-prop"]');
    cy.get('[data-cy="editWidget-input-required-prop"]').should('have.value', '');
  });

  it('should show form with number picker configured for widget with queryhints with default value', () => {
    cy.get('[data-cy="action-button"]').last().click();
    cy.get('[data-cy="action-button-edit"]').click();
    cy.get('right-side-panel > ux-side-panel').should('have.class', 'open');
    cy.get('[data-cy="editWidget-label-limit"]');
    cy.get('input[id="limit-input"]').should('have.value', '10');
  });

  it('should show form with dropdown configured for widget with queryhints', () => {
    cy.get('[data-cy="action-button"]').last().click();
    cy.get('[data-cy="action-button-edit"]').click();
    cy.get('right-side-panel > ux-side-panel').should('have.class', 'open');
    cy.get('[data-cy="editWidget-dropdown-orderBy"]').find('.ux-select-container').click();
    cy.get('[data-cy="dropdown-option-ascending"]');
    cy.get('[data-cy="dropdown-option-descending"]');
  });

  it('should change name of the widget on editing the name', () => {
    cy.get('.widget-title-span').first().contains('Description');
    cy.get('[data-cy="action-button"]').first().click();
    cy.get('[data-cy="action-button-edit"]').click();
    cy.get('.ux-menu').should('not.exist');
    cy.get('[data-cy="widgetNameInput"]').should('have.focus');
    cy.get('[data-cy="widgetNameInput"]').type('ABC').blur();
    cy.get('.widget-title-span').first().contains('DescriptionABC');
  });

  it('should allow multiple within-space on the name of the widget', () => {
    cy.get('.widget-title-span').first().contains('Description');
    cy.get('[data-cy="action-button"]').first().click();
    cy.get('[data-cy="action-button-edit"]').click();
    cy.get('[data-cy="widgetNameInput"]').should('have.focus');
    cy.get('[data-cy="widgetNameInput"]').type('A   BC').blur();
    cy.get('.widget-title-span').first().should('contain', 'DescriptionA   BC');
  });

  it('should not allow empty widget name ', () => {
    cy.get('.widget-title-span').first().contains('Description');
    cy.get('[data-cy="action-button"]').first().click();
    cy.get('[data-cy="action-button-edit"]').click();
    cy.get('[data-cy="widgetNameInput"]').should('have.focus');
    cy.get('[data-cy="widgetNameInput"]').clear().blur();
    cy.get('.widget-title-span').first().contains('Description');
    cy.get('[data-cy="widgetNameErrorEmpty"]').contains('Widget name needs to be specified').should('be.visible');
    cy.get('[data-cy="widgetNameInput"]').type('ABC').blur();
    cy.get('[data-cy="widgetNameErrorEmpty"]').should('not.exist');
    cy.get('.widget-title-span').first().contains('ABC');
  });

  it('should show warning when spaces are added at the beginning or end of widgetName ', () => {
    const widgetNameErrorNoSpacesEndStart = 'The entered text contains leading and trailing blanks. These will be automatically truncated.';
    cy.get('.widget-title-span').first().contains('Description');
    cy.get('[data-cy="action-button"]').first().click();
    cy.get('[data-cy="action-button-edit"]').click();
    cy.get('[data-cy="widgetNameInput"]').should('have.focus');
    cy.get('[data-cy="widgetNameInput"]').clear().type('A ').blur(); // verifying for single space
    cy.get('[data-cy="widgetNameErrorNoSpacesEndStart"]').contains(widgetNameErrorNoSpacesEndStart).should('be.visible');
    cy.get('[data-cy="widgetNameInput"]').clear().type('A   ').blur(); // verifying for double space
    cy.get('[data-cy="widgetNameErrorNoSpacesEndStart"]').contains(widgetNameErrorNoSpacesEndStart).should('be.visible');
    cy.get('.widget-title-span').first().contains('A');
    cy.get('[data-cy="widgetNameInput"]').clear().type('A').blur(); // verifying for single character
    cy.get('[data-cy="widgetNameErrorNoSpacesEndStart"]').should('not.exist');
    cy.get('[data-cy="widgetNameInput"]').clear().type(' w ').blur();
    cy.get('[data-cy="widgetNameErrorNoSpacesEndStart"]').contains(widgetNameErrorNoSpacesEndStart).should('be.visible');
    cy.get('[data-cy="widgetNameInput"]').clear().type('  abcd  ').blur();
    cy.get('[data-cy="widgetNameErrorNoSpacesEndStart"]').contains(widgetNameErrorNoSpacesEndStart).should('be.visible');
  });

  it('should not allow only special characters in widgetName ', () => {
    const onlySpaceAndSpecialCharValidator = 'Name cannot be only special characters: $ & + , * / : % ; = ? @ < > # { } | ^ ~';
    cy.get('.widget-title-span').first().contains('Description');
    cy.get('[data-cy="action-button"]').first().click();
    cy.get('[data-cy="action-button-edit"]').click();
    cy.get('[data-cy="widgetNameInput"]').should('have.focus');

    cy.get('[data-cy="widgetNameInput"]').clear().type(' ').blur();
    cy.get('[data-cy="OnlySpaceAndSpecialCharValidatorWidgetName"]').contains(onlySpaceAndSpecialCharValidator).should('be.visible');
    cy.get('.widget-title-span').first().contains('Description');

    cy.get('[data-cy="widgetNameInput"]').clear().type('     ').blur();
    cy.get('[data-cy="OnlySpaceAndSpecialCharValidatorWidgetName"]').contains(onlySpaceAndSpecialCharValidator).should('be.visible');
    cy.get('.widget-title-span').first().contains('Description');

    cy.get('[data-cy="widgetNameInput"]').clear().type('@').blur();
    cy.get('[data-cy="OnlySpaceAndSpecialCharValidatorWidgetName"]').contains(onlySpaceAndSpecialCharValidator).should('be.visible');
    cy.get('[data-cy="widgetNameInput"]').clear().type('$').blur();
    cy.get('[data-cy="OnlySpaceAndSpecialCharValidatorWidgetName"]').contains(onlySpaceAndSpecialCharValidator).should('be.visible');
    cy.get('[data-cy="widgetNameInput"]').clear().type(' [').blur();
    cy.get('[data-cy="OnlySpaceAndSpecialCharValidatorWidgetName"]').contains(onlySpaceAndSpecialCharValidator).should('be.visible');
    cy.get('[data-cy="widgetNameInput"]').clear().type('/ ').blur();
    cy.get('[data-cy="OnlySpaceAndSpecialCharValidatorWidgetName"]').contains(onlySpaceAndSpecialCharValidator).should('be.visible');
    cy.get('[data-cy="widgetNameInput"]').clear().type(' % ').blur();
    cy.get('[data-cy="OnlySpaceAndSpecialCharValidatorWidgetName"]').contains(onlySpaceAndSpecialCharValidator).should('be.visible');

    cy.get('[data-cy="widgetNameInput"]').clear().type(' ^$ ').blur();
    cy.get('[data-cy="OnlySpaceAndSpecialCharValidatorWidgetName"]').contains(onlySpaceAndSpecialCharValidator).should('be.visible');
    cy.get('[data-cy="widgetNameInput"]').clear().type(' @ @ ').blur();
    cy.get('[data-cy="OnlySpaceAndSpecialCharValidatorWidgetName"]').contains(onlySpaceAndSpecialCharValidator).should('be.visible');
    cy.get('[data-cy="widgetNameInput"]').clear().type('$ $').blur();
    cy.get('[data-cy="OnlySpaceAndSpecialCharValidatorWidgetName"]').contains(onlySpaceAndSpecialCharValidator).should('be.visible');

    cy.get('[data-cy="widgetNameInput"]').clear().type('$a$').blur();
    cy.get('[data-cy="OnlySpaceAndSpecialCharValidatorWidgetName"]').should('not.exist');
    cy.get('.widget-title-span').first().contains('$a$');

    cy.get('[data-cy="widgetNameInput"]').clear().type('Категория').blur();
    cy.get('[data-cy="OnlySpaceAndSpecialCharValidatorWidgetName"]').should('not.exist');
    cy.get('.widget-title-span').first().contains('Категория');
  });

  it('should show mandatory star for all queryhints that are required', () => {
    const widgetRequiredPropErrorEmpty = 'Required property cannot be empty';

    cy.get('[data-cy="action-button"]').last().click();
    cy.get('[data-cy="action-button-edit"]').click();
    cy.get('right-side-panel > ux-side-panel').should('have.class', 'open');
    cy.get('[data-cy="editWidget-label-limit"]').should('not.contain', '*');
    cy.get('[data-cy="editWidget-label-required-prop"]').contains('*');
    cy.get('[data-cy="editWidget-input-required-prop"]');
    cy.get('[data-cy="editWidget-label-orderBy"]').contains('*');
    cy.get('[data-cy="widgetRequiredPropErrorEmpty"]')
      .contains(widgetRequiredPropErrorEmpty)
      .should('be.visible');
    cy.get('[data-cy="widgetRequiredPropErrorEmpty"]');
  });

  it('should error when required query hints are filled', () => {
    const widgetRequiredPropErrorEmpty = 'Required property cannot be empty';

    cy.get('[data-cy="action-button"]').last().click();
    cy.get('[data-cy="action-button-edit"]').click();
    cy.get('right-side-panel > ux-side-panel').should('have.class', 'open');
    cy.get('[data-cy="widgetRequiredPropErrorEmpty"]')
      .contains(widgetRequiredPropErrorEmpty)
      .should('be.visible');
    cy.get('[data-cy="widgetRequiredPropErrorEmpty"]');

    cy.get('[data-cy="editWidget-input-required-prop"]').type('abc').blur();
    cy.get('[data-cy="widgetRequiredPropErrorEmptyField"]')
      .should('not.exist');

    cy.get('[data-cy="editWidget-dropdown-orderBy"]').find('.ux-select-container').click();
    cy.get('[data-cy="dropdown-option-ascending"]').click();
    cy.get('[data-cy="widgetRequiredPropErrorEmptyField"]').should('not.exist');
  });

  it('should highlight the widget on clicking the edit icon in the dropdown', () => {
    cy.get('[data-cy="action-button"]').first().click();
    cy.get('[data-cy="action-button-edit"]').click();
    cy.get('right-side-panel > ux-side-panel').should('have.class', 'open');
    cy.get('#description_edit_widget').should('have.class', 'highlight-widget');
  });

  it('On closing the side panel the widget should not be highlighted', () => {
    // open widget action and check if the editWidget exists
    // workaround check to issue related page action button opening.
    cy.get('[data-cy="action-button"]').last().click();
    cy.get('[data-cy="action-button-edit"]');
    cy.get('[data-cy="action-button"]').last().type('{esc}');
    cy.get('[data-cy="page-action-button"]').first().click();
    cy.get('[data-cy="page-action-item-open_metric_browser"]').click();
    cy.get('[data-cy="btn-side-panel-close"]').click();
    cy.get('[data-cy="action-button"]').last().click();
    cy.get('[data-cy="action-button-edit"]').click();
    cy.get('right-side-panel > ux-side-panel').should('have.class', 'open');
    cy.get('[data-cy="btn-side-panel-close"]').click();
    cy.get('#description_edit_widget').should('not.have.class', 'highlight-widget');
  });

  it('should show form with chartTypes accordion ', () => {
    cy.get('[data-cy="action-button"]').last().click();
    cy.get('[data-cy="action-button-edit"]').click();
    cy.get('right-side-panel > ux-side-panel').should('have.class', 'open');
    cy.get('[data-cy="chartTypeLabel"]').click();
    cy.get('ux-card-headline').contains('Table');
  });

  it('should be able to select first item in a ordered multiselect', () => {
    cy.get('[data-cy="action-button"]').last().click();
    cy.get('[data-cy="action-button-edit"]').click();
    cy.get('right-side-panel > ux-side-panel').should('have.class', 'open');
    cy.get('[data-cy="editWidget-orderedmultiselect-group-by"] ux-tag-input > ol > .ux-tag-input > input').click();
    cy.get('.ux-typeahead-options').find('#group-by-typeahead-option-0').trigger('mouseover');
    cy.get('.ux-typeahead-options').find('#group-by-typeahead-option-0').click();
    cy.get('.ux-typeahead-options').find('#group-by-typeahead-option-0').should('have.class', 'disabled');
    cy.get('.ux-tag-text').should('contain.text', 'Source');
  });

  it('should be able to select multiple items in a ordered multiselect', () => {
    cy.get('[data-cy="action-button"]').last().click();
    cy.get('[data-cy="action-button-edit"]').click();
    cy.get('right-side-panel > ux-side-panel').should('have.class', 'open');
    cy.get('[data-cy="editWidget-orderedmultiselect-group-by"] ux-tag-input > ol > .ux-tag-input > input').click();
    cy.get('.ux-typeahead-options').find('#group-by-typeahead-option-0').trigger('mouseover');
    cy.get('.ux-typeahead-options').find('#group-by-typeahead-option-0').click();
    cy.get('.ux-typeahead-options').find('#group-by-typeahead-option-0').should('have.class', 'disabled');
    cy.get('.ux-tag-text').should('contain.text', 'Source');
    cy.get('.ux-typeahead-options').find('#group-by-typeahead-option-1').trigger('mouseover');
    cy.get('.ux-typeahead-options').find('#group-by-typeahead-option-1').click();
    cy.get('.ux-typeahead-options').find('#group-by-typeahead-option-1').should('have.class', 'disabled');
    cy.get('.ux-tag-text').should('contain.text', 'Source');
    cy.get('.ux-tag-text').should('contain.text', 'Node Name');
  });

  it('should be able to remove item if cross icon is clicked on ux-tag button in a ordered multiselect', () => {
    cy.get('[data-cy="action-button"]').last().click();
    cy.get('[data-cy="action-button-edit"]').click();
    cy.get('right-side-panel > ux-side-panel').should('have.class', 'open');
    cy.get('[data-cy="editWidget-orderedmultiselect-group-by"] ux-tag-input > ol > .ux-tag-input > input').click();
    cy.get('.ux-typeahead-options').find('#group-by-typeahead-option-0').trigger('mouseover');
    cy.get('.ux-typeahead-options').find('#group-by-typeahead-option-0').click();
    cy.get('.ux-typeahead-options').find('#group-by-typeahead-option-0').should('have.class', 'disabled');
    cy.get('.ux-tag-text').should('contain.text', 'Source');
    cy.get('.ux-typeahead-options').find('#group-by-typeahead-option-1').trigger('mouseover');
    cy.get('.ux-typeahead-options').find('#group-by-typeahead-option-1').click();
    cy.get('.ux-typeahead-options').find('#group-by-typeahead-option-1').should('have.class', 'disabled');
    cy.get('.ux-tag-text').should('contain.text', 'Source');
    cy.get('.ux-tag-text').should('contain.text', 'Node Name');
    cy.get('[data-cy="ux-tag-remove-1"]').trigger('mouseover');
    cy.get('[data-cy="ux-tag-remove-1"]').click();
    cy.get('.ux-tag-text').should('contain.text', 'Source');
  });

  it('should be able to select upto 3 items in ordered multiselect', () => {
    cy.get('[data-cy="action-button"]').last().click();
    cy.get('[data-cy="action-button-edit"]').click();
    cy.get('right-side-panel > ux-side-panel').should('have.class', 'open');
    cy.get('[data-cy="editWidget-orderedmultiselect-group-by"] ux-tag-input > ol > .ux-tag-input > input').should('have.attr', 'placeholder', 'Select up to 3 items');
    cy.get('[data-cy="editWidget-orderedmultiselect-group-by"] ux-tag-input > ol > .ux-tag-input > input').click();
    cy.get('.ux-typeahead-options').find('#group-by-typeahead-option-0').trigger('mouseover');
    cy.get('.ux-typeahead-options').find('#group-by-typeahead-option-0').click();
    cy.get('.ux-typeahead-options').find('#group-by-typeahead-option-0').should('have.class', 'disabled');
    cy.get('.ux-tag-text').should('contain.text', 'Source');
    cy.get('[data-cy="editWidget-orderedmultiselect-group-by"] ux-tag-input > ol > .ux-tag-input > input').should('have.attr', 'placeholder', 'Select up to 2 items');
    cy.get('.ux-typeahead-options').find('#group-by-typeahead-option-1').trigger('mouseover');
    cy.get('.ux-typeahead-options').find('#group-by-typeahead-option-1').click();
    cy.get('.ux-typeahead-options').find('#group-by-typeahead-option-1').should('have.class', 'disabled');
    cy.get('.ux-tag-text').should('contain.text', 'Source');
    cy.get('.ux-tag-text').should('contain.text', 'Node Name');
    cy.get('[data-cy="editWidget-orderedmultiselect-group-by"] ux-tag-input > ol > .ux-tag-input > input').should('have.attr', 'placeholder', 'Select up to 1 items');
    cy.get('.ux-typeahead-options').find('#group-by-typeahead-option-2').trigger('mouseover');
    cy.get('.ux-typeahead-options').find('#group-by-typeahead-option-2').click();
    cy.get('.ux-typeahead-options').find('#group-by-typeahead-option-2').should('have.class', 'disabled');
    cy.get('.ux-tag-text').should('contain.text', 'Source');
    cy.get('.ux-tag-text').should('contain.text', 'Node Name');
    cy.get('.ux-tag-text').should('contain.text', 'Node UUID');
    cy.get('[data-cy="editWidget-orderedmultiselect-group-by"] ux-tag-input > ol > .ux-tag-input > input').should('have.attr', 'placeholder', '');
    cy.get('.ux-typeahead-options').find('#group-by-typeahead-option-3').trigger('mouseover');
    cy.get('.ux-typeahead-options').find('#group-by-typeahead-option-3').click();
    cy.get('.ux-typeahead-options').find('#group-by-typeahead-option-3').should('have.class', 'disabled');
    cy.get('.ux-tag-text').should('contain.text', 'Source');
    cy.get('.ux-tag-text').should('contain.text', 'Node Name');
    cy.get('.ux-tag-text').should('contain.text', 'Node UUID');
    cy.get('.ux-tag-text').should('contain.text', 'Interface Name');
    cy.get('[data-cy="editWidget-orderedmultiselect-group-by"] ux-tag-input > ol > .ux-tag-input > input').click();
    cy.get('[data-cy="editWidget-orderedmultiselect-group-by"] ux-tag-input > ol > .ux-tag-input > input').should('have.attr', 'placeholder', 'Too many items selected');
    cy.get('[data-cy="itemSelectedLimitError"]').contains('Too many items selected, maximum 3.').should('be.visible');
  });

  it('should be able see to search field if user type something in ux-tag-input in a ordered multiselect', () => {
    cy.get('[data-cy="action-button"]').last().click();
    cy.get('[data-cy="action-button-edit"]').click();
    cy.get('right-side-panel > ux-side-panel').should('have.class', 'open');
    cy.get('[data-cy="editWidget-orderedmultiselect-group-by"] ux-tag-input> ol > .ux-tag-input > input').click().type('i');
    cy.get('.ux-typeahead-option').should('contain.text', 'Node UUID');
    cy.get('.ux-typeahead-option').should('contain.text', 'Interface Name');
    cy.get('.ux-typeahead-option').should('contain.text', 'Interface UUID');
  });

  it('on removing the widget that is getting edited, sidePanel should close', () => {
    cy.get('[data-cy="action-button"]').last().click();
    cy.get('[data-cy="action-button-edit"]').click();
    cy.get('[data-cy="action-button-edit"]').should('not.exist');
    cy.get('[data-cy="action-button"]').last().click();
    cy.get('[data-cy="action-button-removeWidget"]').click();
    cy.get('[data-cy="action-button-removeWidget"]').should('not.exist');
    cy.get('ux-side-panel').should('not.exist');
  });

  it('on removing the widget that is not getting edited, sidePanel should not close', () => {
    cy.get('[data-cy="action-button"]').last().click();
    cy.get('[data-cy="action-button-edit"]').click();
    cy.get('[data-cy="action-button-edit"]').should('not.exist');
    cy.get('[data-cy="action-button"]').first().click();
    cy.get('[data-cy="action-button-removeWidget"]').click();
    cy.get('[data-cy="action-button-removeWidget"]').should('not.exist');
    cy.get('ux-side-panel');
  });

  it('should render additional controls if options in AggregateBy control has additional parameters with them', () => {
    cy.get('[data-cy="action-button"]').last().click();
    cy.get('[data-cy="action-button-edit"]').click();
    cy.get('right-side-panel > ux-side-panel').should('have.class', 'open');
    cy.get('[data-cy="editWidget-dropdown-aggregateBy"]').last().click();
    cy.get('[data-cy="dropdown-option-percentile"]').click();
    cy.get('[data-cy="editWidget-label-percentile"]');
  });

  it('should clear the previously selected control and render new additional control if user selects new option from the AggregateBy dropdown control', () => {
    cy.get('[data-cy="action-button"]').last().click();
    cy.get('[data-cy="action-button-edit"]').click();
    cy.get('right-side-panel > ux-side-panel').should('have.class', 'open');
    cy.get('[data-cy="editWidget-dropdown-aggregateBy"]').click();
    cy.get('[data-cy="dropdown-option-percentile"]').click();
    cy.get('[data-cy="editWidget-label-percentile"]').should('be.visible');
    cy.get('[data-cy="editWidget-dropdown-aggregateBy"]').click();
    cy.get('[data-cy="dropdown-option-sum"]').click();
    cy.get('[data-cy="editWidget-label-percentile"]').should('not.visible');
  });

  it('should not render additional form fields on initial load in edit widget panel', () => {
    cy.get('[data-cy="action-button"]').last().click();
    cy.get('[data-cy="action-button-edit"]').click();
    cy.get('right-side-panel > ux-side-panel').should('have.class', 'open');
    cy.get('[data-cy="editWidget-dropdown-snapshot"]');
    cy.get('[data-cy="editWidget-number-dynamicLimit"]').should('not.exist');
    cy.get('[data-cy="editWidget-dropdown-DynamicSortBy"]').should('not.exist');
  });

  it('should render new form field snapshot in edit widget panel', () => {
    cy.get('[data-cy="action-button"]').last().click();
    cy.get('[data-cy="action-button-edit"]').click();
    cy.get('right-side-panel > ux-side-panel').should('have.class', 'open');
    cy.get('[data-cy="editWidget-dropdown-snapshot"]');
  });

  it('should render additional form fields if snapshot field set to true', () => {
    cy.get('[data-cy="action-button"]').last().click();
    cy.get('[data-cy="action-button-edit"]').click();
    cy.get('right-side-panel > ux-side-panel').should('have.class', 'open');
    cy.get('[data-cy="editWidget-dropdown-snapshot"]').click().get('.form-dropdown-option').contains('Yes').click();
    cy.get('[data-cy="editWidget-number-dynamicLimit"]');
    cy.get('[data-cy="editWidget-dropdown-DynamicSortBy"]');
  });

  it('should not render additional form fields if id is not matched', () => {
    cy.get('[data-cy="action-button"]').last().click();
    cy.get('[data-cy="action-button-edit"]').click();
    cy.get('right-side-panel > ux-side-panel').should('have.class', 'open');
    cy.get('[data-cy="editWidget-dropdown-snapshot"]').click().get('.form-dropdown-option').contains('Yes').click();
    cy.get('[data-cy="editWidget-dropdown-invalidField"]').should('not.exist');
  });

  it('should have the edit action button enabled after closing edit widget panel', () => {
    cy.get('[data-cy="action-button"]').first().click();
    cy.get('[data-cy="action-button-edit"]').click();
    cy.get('.ux-menu').should('not.exist');
    cy.get('right-side-panel > ux-side-panel').should('have.class', 'open');
    // edit button should be disabled
    cy.get('[data-cy="action-button"]').first().should('be.visible').click();
    cy.get('[data-cy="action-button-edit"]').should('have.class', 'disabled');
    cy.get('div.cdk-overlay-backdrop').click();
    cy.get('.ux-menu').should('not.exist');
    cy.get('[data-cy="btn-side-panel-close"]').click();
    // check if the action button is enabled
    cy.get('[data-cy="action-button"]').first().click();
    cy.get('[data-cy="action-button-edit"]').should('not.have.class', 'disabled');
  });

  it('should clear the search field if user type something in ux-tag-input in a ordered multiselect and does not select a value or the search text does not match', () => {
    cy.get('[data-cy="action-button"]').last().click();
    cy.get('[data-cy="action-button-edit"]').click();
    cy.get('right-side-panel > ux-side-panel').should('have.class', 'open');
    cy.get('[data-cy="editWidget-orderedmultiselect-group-by"] ux-tag-input> ol > .ux-tag-input > input').click().type('abc');
    cy.get('.ux-typeahead-option').should('contain.text', '');
    cy.get('[data-cy="editWidget-orderedmultiselect-group-by"] ux-tag-input> ol > .ux-tag-input > input').blur();
    cy.get('[data-cy="editWidget-orderedmultiselect-group-by"] ux-tag-input> ol > .ux-tag-input > input').should('have.value', '');
  });

  it('should update the content in edit panel when clicked on widget if edit panel is already opened for another widget', () => {
    cy.get('[data-cy="action-button"]').last().click();
    cy.get('[data-cy="action-button-edit"]').click();
    cy.get('div#widget_with_query_hints').should('have.class', 'highlight-widget');
    cy.get('[data-cy="widgetNameInput"]').should('have.value', 'Simple List');
    cy.get('right-side-panel > ux-side-panel ux-accordion-panel[formgroupname="chartTypeGroup"]');
    cy.get('text-widget h1').click();
    cy.get('[data-cy="widgetNameInput"]').should('have.value', 'Description');
    cy.get('div#description_edit_widget').should('have.class', 'highlight-widget');
    cy.get('right-side-panel > ux-side-panel ux-accordion-panel[formgroupname="chartTypeGroup"]').should('not.exist');
  });
});
