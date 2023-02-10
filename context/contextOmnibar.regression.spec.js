// <reference types="Cypress" />
const shared = require('../../../shared/shared');

function waitAfterItemSelection() {
  cy.wait(['@getPagesMetadata', '@getData', '@getData']);
  cy.wait(['@getData', '@getData', '@getData']);
  cy.wait(['@getData', '@getData', '@getData']);
  cy.wait(['@getData', '@getData']);
  cy.get('[data-cy="omnibarSpinnerOverlay"]').should('not.exist');
}

describe('Interactive Context Omnibar', shared.defaultTestOptions, () => {
  beforeEach(() => {
    cy.intercept({
      method: 'POST',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/datasource/ws/data`
    }).as('getData');
    cy.intercept({
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/contextOmnibar*`
    }).as('getOmnibarPage');
    cy.intercept({
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/uiTestHasTimeCtx*`
    }).as('getHasTimeCtxPage');
    cy.intercept({
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/system`
    }).as('getSystemData');
    cy.intercept({
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/session/user`
    }).as('getUser');
    cy.intercept({
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pages/toc*`
    }).as('getToc');
    cy.intercept({
      method: 'POST',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pages/metadata`
    }).as('getPagesMetadata');
    cy.bvdLogin();
    cy.visit('/contextOmnibar');
    cy.wait(['@getSystemData', '@getUser']);
    cy.wait(['@getToc', '@getOmnibarPage', '@getToc']);
    cy.wait(['@getData', '@getData', '@getData']);
    cy.wait(['@getData', '@getData', '@getData']);
  });

  it('should check if selection on omnibar panel works, items becomes context on selection and drill down button exists', () => {
    cy.get('[data-cy="omnibar-input-field"]').should('have.attr', 'placeholder', 'Type to search for a context...');
    cy.get('[data-cy="omnibar-input-field"]').type(' ');
    cy.get('td[class="context-item-name"]').should('not.have.text', 'null');
    cy.get('[data-cy="omnibarSpinnerOverlay"]').should('not.exist');
    cy.get('[data-cy="omnibar-content-panel"]');
    cy.get('[data-cy="omnibar-footer"]');
    cy.get('[data-cy="omnibar-content-panel"] [data-cy="Bangalore"]').click();
    waitAfterItemSelection();
    cy.get('[data-cy="omnibar-content-panel"] [data-cy="Bangalore"] input[type="checkbox"]').should('have.attr', 'aria-checked', 'true');
    cy.get('[data-cy="context-items"] [data-cy="context-tag-NG"]').contains('NG: Bangalore');
    cy.get('[data-cy="drillDownButton"]').should('exist');
  });

  it('should remove all the selected items from omnibar panel on clicking dismiss button from context view', () => {
    cy.get('[data-cy="omnibar-input-field"]').click();
    cy.get('[data-cy="omnibarSpinnerOverlay"]').should('not.exist');
    cy.get('[data-cy="omnibar-content-panel"] [data-cy="Atlanta"]').click();
    waitAfterItemSelection();
    cy.get('[data-cy="omnibar-content-panel"] [data-cy="Bangalore"]').click();
    waitAfterItemSelection();
    cy.get('[data-cy="context-items"] [data-cy="context-tag-NG"] button').should('have.attr', 'aria-label', 'Remove Tag').click();
    cy.wait(['@getData', '@getData', '@getData', '@getData', '@getData', '@getData', '@getData', '@getData', '@getData', '@getData']);
    cy.get('[data-cy="omnibar-content-panel"] [data-cy="Atlanta"] input[type="checkbox"]').should('not.have.attr', 'aria-checked', 'true');
    cy.get('[data-cy="omnibar-content-panel"] [data-cy="Bangalore"] input[type="checkbox"]').should('not.have.attr', 'aria-checked', 'true');
  });

  it('should display a static message when skipSearchOnEmpty flag is true', () => {
    cy.get('[data-cy="omnibar-input-field"]').click();
    cy.wait(['@getData', '@getData', '@getData', '@getData', '@getData', '@getData', '@getData', '@getData']);
    cy.get('[data-cy="omnibarSpinnerOverlay"]').should('not.exist');
    cy.get('[data-cy="type-Country"]').contains('There is more data, but we cannot show it yet. Please start typing and matching items will be displayed here.');
    cy.get('[data-cy="type-Node"]').should('not.contain', 'There is more data, but we cannot show it yet. Please start typing and matching items will be displayed here.');
  });

  it('should load all items when skipSearchOnEmpty flag is false', () => {
    cy.get('[data-cy="omnibar-input-field"]').click();
    cy.wait(['@getData', '@getData', '@getData', '@getData', '@getData', '@getData', '@getData', '@getData']);
    cy.get('[data-cy="omnibarSpinnerOverlay"]').should('not.exist');
    cy.get('[data-cy="table-body-type-Node Group"]').find('tr[class]').should('have.length', 19);
    cy.get('[data-cy="table-body-type-Node"]').find('tr[class]').should('have.length', 44);
    cy.get('[data-cy="table-body-type-Incidents"]').find('tr[class]').should('have.length', 28);
  });

  it('should filter the items on context selection', () => {
    cy.url().should('contain', '/contextOmnibar');
    cy.get('[data-cy="omnibar-input-field"]').click();
    cy.get('[data-cy="omnibarSpinnerOverlay"]').should('not.exist');
    cy.get('[data-cy="omnibar-content-panel"] [data-cy="All Unix-based Systems"]').click();
    waitAfterItemSelection();
    cy.url().should('include', '?_ctx=~(~(id~%27All*20Unix-based*20Systems~name~%27All*20Unix-based*20Systems~type~%27nodeGroup))');
    cy.get('[data-cy="table-body-type-Node"]').find('tr[class]').should('have.length', 10);
    cy.get('[data-cy="omnibar-content-panel"] [data-cy="items-count"]').contains('10 of 44 items');
  });

  it('should load the list again when the selected context is removed', () => {
    cy.get('[data-cy="omnibar-input-field"]').click();
    cy.get('[data-cy="omnibarSpinnerOverlay"]').should('not.exist');
    cy.get('[data-cy="omnibar-content-panel"] [data-cy="All Unix-based Systems"]').click();
    waitAfterItemSelection();
    cy.url().should('include', '?_ctx=~(~(id~%27All*20Unix-based*20Systems~name~%27All*20Unix-based*20Systems~type~%27nodeGroup))');
    cy.get('[data-cy="table-body-type-Node"]').find('tr[class]').should('have.length', 10);
    cy.get('[data-cy="omnibar-content-panel"] [data-cy="unix005.atl.mflab.net"]').click();
    cy.get('[data-cy="table-body-type-Incidents"]').find('tr[class]').should('have.length', 0);
    cy.get('[data-cy="context-items"] [data-cy="context-tag-Node"] button').should('have.attr', 'aria-label', 'Remove Tag').click();
    cy.get('[data-cy="table-body-type-Incidents"]').find('tr[class]').should('have.length', 28);
  });

  it('should select all the items on select all checkbox', () => {
    cy.get('[data-cy="omnibar-input-field"]').click();
    cy.wait(['@getData', '@getData', '@getData', '@getData', '@getData', '@getData', '@getData', '@getData']);
    cy.get('[data-cy="omnibarSpinnerOverlay"]').should('not.exist');
    cy.get('[data-cy="omnibar-content-panel"] [data-cy="type-Host"] [data-cy="select-all-checkbox"] ux-checkbox').click();
    cy.get('[data-cy="omnibar-content-panel"] [data-cy="loadgen.mambo.net"] input[type="checkbox"]').should('have.attr', 'aria-checked', 'true');
    cy.get('[data-cy="omnibar-content-panel"] [data-cy="oba.mambo.net"] input[type="checkbox"]').should('have.attr', 'aria-checked', 'true');
    cy.get('[data-cy="omnibar-content-panel"] [data-cy="obac.mambo.net"] input[type="checkbox"]').should('have.attr', 'aria-checked', 'true');
    cy.get('[data-cy="context-items"] [data-cy="context-tag-Host"]').contains('Host: loadgen.mambo.net, oba.mambo.net, obac.mambo.net');
  });

  it('should truncate and show a tooltip for items having long name', () => {
    cy.get('[data-cy="omnibar-input-field"]').click();
    cy.wait(['@getData', '@getData', '@getData', '@getData', '@getData', '@getData', '@getData', '@getData']);
    cy.get('[data-cy="omnibarSpinnerOverlay"]').should('not.exist');
    cy.get('[data-cy="omnibar-content-panel"] [data-cy="Medium CPU Utilization on unix006.chic.mflab.net"] .context-item-name').should('have.css', 'text-overflow', 'ellipsis');
    cy.get('[data-cy="omnibar-content-panel"] [data-cy="Medium CPU Utilization on unix006.chic.mflab.net"] .context-item-name').trigger('mouseenter');
    cy.get('[aria-describedby*=ux-tooltip').contains('Medium CPU Utilization on unix006.chic.mflab.net');
  });

  // Public countries API is currently broken. Test mock data needs to be changed to not use the public API
  // https://documenter.getpostman.com/view/10808728/SzS8rjbc#intro
  // eslint-disable-next-line mocha/no-skipped-tests
  it.skip('Search in case of country context type works when user starts typing (backendSearch flag)', () => {
    cy.get('[data-cy="omnibar-input-field"]').click();
    cy.wait(['@getData', '@getData', '@getData', '@getData', '@getData', '@getData', '@getData', '@getData']);
    cy.get('[data-cy="omnibarSpinnerOverlay"]').should('not.exist');
    cy.get('[data-cy="items-count"]').eq(4).should('not.exist');
    cy.get('[data-cy="omnibar-input-field"]').type('afg');
    cy.get('.context-item-name').should('have.length', 1);
    cy.get('[data-cy="table-body-type-Country"]').find('tr').contains('Afghanistan');
  });

  it('UI Search works and the columns which donot contain results get hidden ', () => {
    cy.get('[data-cy="omnibar-input-field"]').click();
    cy.wait(['@getData', '@getData', '@getData', '@getData', '@getData', '@getData', '@getData', '@getData']);
    cy.get('[data-cy="omnibarSpinnerOverlay"]').should('not.exist');
    cy.get('[data-cy="omnibar-input-field"]').type('unix');
    cy.wait('@getData');
    cy.get('[data-cy="omnibar-content-panel"] table').should('have.length', 3);
    cy.get('[data-cy="type-Node Group"] tr').contains('NG');
    cy.get('[data-cy="type-Node Group"] [data-cy="items-count"]').contains('1 of 19 items');
    cy.get('[data-cy="type-Node"] tr').contains('Node');
    cy.get('[data-cy="type-Node"] [data-cy="items-count"]').contains('10 of 44 items');
    cy.get('[data-cy="type-Incidents"] tr').contains('Inc');
    cy.get('[data-cy="type-Incidents"] [data-cy="items-count"]').contains('8 of 28 items');
    cy.get('[data-cy="table-body-type-Node Group"]').find('tr[class]').should('have.length', 1);
    cy.get('[data-cy="table-body-type-Node"]').find('tr[class]').should('have.length', 10);
    cy.get('[data-cy="table-body-type-Incidents"]').find('tr[class]').should('have.length', 8);
    cy.get('[data-cy="omnibar-input-field"]').clear().type('  ');
    cy.get('[data-cy="All Unix-based Systems"] .context-item-name').should('have.text', 'All Unix-based Systems');
    cy.get('[data-cy="omnibar-input-field"]').type('{esc}');
    cy.get('[data-cy="omnibar-input-field"]').should('have.value', '');
  });

  it('Shift+click functionality in omnibar panel works', () => {
    cy.get('[data-cy="omnibar-input-field"]').click();
    cy.get('[data-cy="omnibarSpinnerOverlay"]').should('not.exist');
    cy.get('[data-cy="omnibar-content-panel"] table [data-cy="All Unix-based Systems"]').click();
    waitAfterItemSelection();
    cy.get('[data-cy="omnibar-content-panel"] table [data-cy="Barcelona"]').click({ shiftKey: true });
    cy.get('[data-cy="contextLabelType-NG"]').contains('5 selected');
  });

  it('Headings in omnibar panel is colored appropriately', () => {
    cy.get('[data-cy="omnibar-input-field"]').click();
    cy.wait(['@getData', '@getData', '@getData', '@getData', '@getData', '@getData', '@getData', '@getData']);
    cy.get('uif-list').should('have.length', 5);
    cy.get('.list-label').contains('NG').invoke('css', 'color').then(color => {
      cy.get('[data-cy="omnibarSpinnerOverlay"]').should('not.exist');
      expect(color).to.equal('rgb(235, 35, 194)');
    });
    cy.get('.list-label').contains('Node').invoke('css', 'color').then(color => {
      cy.get('[data-cy="omnibarSpinnerOverlay"]').should('not.exist');
      expect(color).to.equal('rgb(47, 214, 195)');
    });
    cy.get('.list-label').contains('Inc').invoke('css', 'color').then(color => {
      cy.get('[data-cy="omnibarSpinnerOverlay"]').should('not.exist');
      expect(color).to.equal('rgb(35, 28, 165)');
    });
    cy.get('.list-label').contains('Host').invoke('css', 'color').then(color => {
      cy.get('[data-cy="omnibarSpinnerOverlay"]').should('not.exist');
      expect(color).to.equal('rgb(198, 23, 157)');
    });
    cy.get('.list-label').contains('Country').invoke('css', 'color').then(color => {
      cy.get('[data-cy="omnibarSpinnerOverlay"]').should('not.exist');
      expect(color).to.equal('rgb(255, 176, 0)');
    });
  });

  it('The background becomes disabled when omnibar panel opens and also context filter is not shown', () => {
    cy.get('[data-cy="omnibar-input-field"]').click();
    cy.wait(['@getData', '@getData', '@getData', '@getData', '@getData', '@getData', '@getData', '@getData']);
    cy.get('[data-cy="omnibarSpinnerOverlay"]').should('not.exist');
    cy.get('[data-cy="context-filter-menu"]').should('not.exist');
    cy.get('.view-container').should('have.class', 'disable-view');
    cy.get('[data-cy="omnibar-input-field"]').type('{esc}');
    cy.get('.view-container').should('not.have.class', 'disable-view');
  });

  it('Close button and escape key closes the omnibar panel', () => {
    cy.get('[data-cy="omnibar-input-field"]').click();
    cy.wait(['@getData', '@getData', '@getData', '@getData', '@getData', '@getData', '@getData', '@getData']);
    cy.get('[data-cy="omnibarSpinnerOverlay"]').should('not.exist');
    cy.get('[data-cy="omnibar-input-field"]').type('{esc}');
    cy.get('[data-cy="omnibar-content-panel"]').should('not.exist');
    cy.get('[data-cy="omnibar-input-field"]').click();
    cy.get('[data-cy="omnibarSpinnerOverlay"]').should('not.exist');
    cy.get('[data-cy="omnibar-close-btn"]').click();
    cy.get('[data-cy="omnibar-content-panel"]').should('not.exist');
  });

  it('Clicking on Context filter icon and context should open the omnibar panel', () => {
    cy.get('[data-cy="contextView"]').find('.context-filter-icon').click();
    cy.get('[data-cy="omnibar-content-panel"]');
    cy.get('[data-cy="omnibar-content-panel"] [data-cy="Bangalore"]').click();
    cy.get('[data-cy="omnibar-input-field"]').type('{esc}');
    cy.get('[data-cy="contextLabelType-NG"]').click();
    cy.get('[data-cy="omnibar-content-panel"]');
  });

  it('should open the omnibar panel and show backdrop on click of context items where omnibar is eligible', () => {
    cy.get('simple-list [data-cy="Bangalore"]').click();
    cy.wait(['@getData', '@getData', '@getData', '@getData', '@getData']);
    cy.get('[data-cy="context-tag-NG"]').click();
    cy.get('[data-cy="omnibar-content-panel"]');
    cy.wait(['@getData', '@getData', '@getData', '@getData', '@getData', '@getData', '@getData', '@getData']);
    cy.get('.view-container').should('have.class', 'disable-view');
  });

  it('should check if the panel height is retained during page change', () => {
    cy.get('[data-cy="omnibar-input-field"]').should('have.attr', 'placeholder', 'Type to search for a context...');
    cy.get('[data-cy="omnibar-input-field"]').click();
    cy.get('[data-cy="omnibarSpinnerOverlay"]').should('not.exist');
    cy.get('[data-cy="resizable-omnibar-panel"]').invoke('height').should('eq', 342.84375);
    // eslint-disable-next-line cypress/no-force
    cy.get('[data-cy="omnibar-resizer"]').trigger('mousedown')
      .trigger('mousemove', 0, 150, { force: true })
      .trigger('mouseup', { force: true });
    cy.get('[data-cy="resizable-omnibar-panel"]').invoke('height').should('eq', 488.84375);
    cy.visit('/uiTestHasTimeCtx');
    cy.wait(['@getData', '@getData']);
    cy.visit('/contextOmnibar');
    cy.wait(['@getData', '@getData', '@getData', '@getData', '@getData', '@getData']);
    cy.get('[data-cy="omnibar-input-field"]').should('have.attr', 'placeholder', 'Type to search for a context...');
    cy.get('[data-cy="omnibar-input-field"]').click();
    cy.get('[data-cy="omnibarSpinnerOverlay"]').should('not.exist');
    cy.get('[data-cy="resizable-omnibar-panel"]').invoke('height').should('eq', 488.84375);
  });
});

describe('Interactive Context Omnibar Non-Eligible Page', shared.defaultTestOptions, () => {
  beforeEach(() => {
    cy.intercept({
      method: 'POST',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/datasource/ws/data`
    }).as('getData');
    cy.intercept({
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/uiTestHasTimeCtx*`
    }).as('getHasTimeCtxPage');
    cy.intercept({
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/system`
    }).as('getSystemData');
    cy.intercept({
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/session/user`
    }).as('getUser');
    cy.intercept({
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pages/toc*`
    }).as('getToc');
    cy.intercept({
      method: 'POST',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pages/metadata`
    }).as('getPagesMetadata');
    cy.bvdLogin();
    cy.visit('/uiTestHasTimeCtx');
    cy.wait(['@getSystemData', '@getUser']);
    cy.wait(['@getToc', '@getHasTimeCtxPage']);
  });

  it('should not show omnibar for pages which doesn\'t have any widgets eligible for omnibar', () => {
    cy.get('[data-cy="contextView"]').find('.context-filter-icon').should('not.exist');
    cy.get('[data-cy="omnibar-input-field"]').should('not.exist');
    cy.get('[data-cy="loadgen.mambo.net"]').click();
    cy.wait('@getData');
    cy.get('[data-cy="omnibar-input-field"]').should('not.exist');
  });

  it('should not show backdrop on click of context items for pages where omnibar is not eligible', () => {
    cy.get('[data-cy="loadgen.mambo.net"]').click();
    cy.wait('@getData');
    cy.get('[data-cy="context-tag-Host"]').click();
    cy.get('[data-cy="omnibar-content-panel"]').should('not.exist');
    cy.get('.view-container').should('not.have.class', 'disable-view');
  });
});
