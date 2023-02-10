// <reference types="Cypress" />
const shared = require('../../../../shared/shared');

describe('Key-Value Widget - General', shared.defaultTestOptions, () => {
  before(() => {
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/uiTestWidgetsKeyValueWidget*`
    }).as('getPage');
    cy.intercept({
      method: 'POST',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/datasource/ws/data`
    }).as('getData');
    cy.intercept({
      method: 'POST',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/datasource/vertica/data`
    }).as('verticaData');
    cy.bvdLogin();
    cy.visit('/uiTestWidgetsKeyValueWidget');
    cy.wait(['@getPage', '@getData', '@getData', '@getData', '@getData', '@getData', '@getData', '@getData', '@verticaData']);
    cy.get('simple-list').contains('loadgen.mambo.net');
    cy.get('[data-cy="loadgen.mambo.net"]').click();
    cy.wait(['@getData', '@getData', '@getData', '@getData', '@getData', '@getData', '@verticaData']);
  });

  it('Key-value widget exist', () => {
    cy.contains('Key Value');
    cy.get('#ui-test-key-value');
  });

  it('Key-value widget data', () => {
    // resultset array case
    cy.get('#ui-test-key-value-drilldown [data-cy="value3"] [data-cy="value"]').contains(249);
    cy.get('#ui-test-key-value-vertica-datasource [data-cy="value0"] [data-cy="value"]').invoke('text').then(value => {
      expect(parseInt(value, 10)).to.be.lessThan(100);
    });
    // resultset object case
    cy.get('#ui-test-key-value-long [data-cy="value1"] [data-cy="value"]').contains('omidock.mambo.net');
  });

  it('Key-Value widget pairs are aligned vertically', () => {
    let firstKeyX = 0,
      secondKeyX = 0;

    cy.get('#ui-test-key-value-long').get('[data-cy=key0]').then(el => {
      firstKeyX = el[0].getBoundingClientRect().x;

      cy.get('#ui-test-key-value-long').get('[data-cy=key1]').then(key1 => {
        secondKeyX = key1[0].getBoundingClientRect().x;

        // check if second element is under first element
        expect(firstKeyX).to.equal(secondKeyX);
      });
    });
  });

  it('Key-Value widget is responsive', () => {
    let firstKeyY = 0,
      lastKeyY = 0,
      firstKeyX = 0,
      lastKeyX = 0;

    cy.get('#ui-test-key-value-long').get('[data-cy=key0]').then(el => {
      firstKeyY = el[0].getBoundingClientRect().y;
      firstKeyX = el[0].getBoundingClientRect().x;

      cy.get('#ui-test-key-value-long').get('[data-cy=key49]').then(key49 => {
        lastKeyX = key49[0].getBoundingClientRect().x;
        lastKeyY = key49[0].getBoundingClientRect().y;

        // check if last element is in different row and column as first element
        expect(firstKeyX).to.not.equal(lastKeyX);
        expect(firstKeyY).to.not.equal(lastKeyY);
      });
    });
  });

  it('Vertical Layout option aligns keys and values vertically', () => {
    let firstKeyX = 0,
      firstValueX = 0;

    cy.get('#ui-test-key-value-vertical').get('[data-cy=key0]').then(el => {
      firstKeyX = el[2].getBoundingClientRect().x;

      cy.get('#ui-test-key-value-vertical').get('[data-cy=value0]').then(value0 => {
        firstValueX = value0[2].getBoundingClientRect().x;

        expect(firstKeyX).to.equal(firstValueX);
      });
    });
  });

  it('KeyColumnWidth option sets width of key column', () => {
    cy.get('#ui-test-key-value-drilldown [data-cy=key3]').invoke('css', 'width').then(width =>
      expect(width).to.equal('250px')
    );
  });

  it('Check for tooltips in key value widgets', () => {
    cy.get('#ui-test-key-value span').contains('ID:').trigger('mouseenter').should('have.attr', 'aria-describedby').and('match', /ux-tooltip-/);
    cy.get('#ui-test-key-value span').contains('Name:').trigger('mouseenter').should('have.attr', 'aria-describedby').and('match', /ux-tooltip-/);
    cy.get('#ui-test-key-value-vertical span').contains('ID').trigger('mouseenter').should('have.attr', 'aria-describedby').and('match', /ux-tooltip-/);
    cy.get('#ui-test-key-value-vertical span').contains('Name').trigger('mouseenter').should('have.attr', 'aria-describedby').and('match', /ux-tooltip-/);
    cy.get('#ui-test-key-value-long span').contains('Long Host Name Long Host Name:').trigger('mouseenter').should('have.attr', 'aria-describedby').and('match', /ux-tooltip-/);
    cy.get('#ui-test-key-value-dates span').contains('Format: lll:').trigger('mouseenter').should('have.attr', 'aria-describedby').and('match', /ux-tooltip-/);
    cy.get('#ui-test-key-value-dates span').contains('Format: MMMM Do YYYY, h:mm:ss a:').trigger('mouseenter').should('have.attr', 'aria-describedby').and('match', /ux-tooltip-/);
    cy.get('#ui-test-key-value-drilldown span').contains('Crosslaunch Action:').trigger('mouseenter').should('have.attr', 'aria-describedby').and('match', /ux-tooltip-/);
    cy.get('#ui-test-key-value-drilldown span').contains('This is a veeeeeeeeery very long key:').trigger('mouseenter').should('have.attr', 'aria-describedby').and('match', /ux-tooltip-/);
    cy.get('#ui-test-key-value-vertica-datasource span').contains('RandomValue:').trigger('mouseenter').should('have.attr', 'aria-describedby').and('match', /ux-tooltip-/);
  });
});

describe('Context Tests for key-value widget', () => {
  beforeEach(() => {
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/uiTestWidgetsKeyValueWidget*`
    }).as('getPage');
    cy.intercept({
      method: 'POST',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/datasource/ws/data`
    }).as('getData');
    cy.intercept({
      method: 'POST',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/datasource/vertica/data`
    }).as('verticaData');
    cy.bvdLogin();
    cy.visit('/uiTestWidgetsKeyValueWidget');
    cy.wait(['@getPage', '@getData', '@verticaData']);
  });

  it('Context is applied on key-value widget', () => {
    cy.intercept({
      method: 'POST',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/datasource/ws/data`
    }).as('getWebapiData');
    cy.get('simple-list').contains('loadgen.mambo.net');
    cy.get('[data-cy="loadgen.mambo.net"]').click();
    cy.wait(['@getWebapiData', '@getWebapiData', '@verticaData']);
    cy.get('#ui-test-key-value').find('table')
      .should('contain', 'loadgen.mambo.net')
      .and('contain', '87.02');
    cy.get('simple-list').contains('oba.mambo.net');
    cy.get('[data-cy="oba.mambo.net"]').click();
    cy.wait(['@getWebapiData', '@getWebapiData', '@verticaData']);
    cy.get('#ui-test-key-value').find('table')
      .should('contain', 'oba.mambo.net')
      .and('contain', '49.52');
  });

  it('Value cannot be clicked if no action is assigned', () => {
    cy.get('#ui-test-key-value-long').within(() => {
      cy.get('[data-cy=value0]').find('a').should('not.exist');
      cy.get('[data-cy=value0]').find('.link').should('not.exist');
    });
  });

  it('Drilldown without context works', () => {
    cy.get('#ui-test-key-value-drilldown').get('[data-cy=value0]').get('[data-cy=valueLink]').eq(1).click();
    cy.url().should('include', 'uiTestActions');
    cy.url().should('not.include', 'loadgen.mambo.net');
  });

  it('Drilldown with context works', () => {
    cy.get('#ui-test-key-value-drilldown').get('[data-cy=value0]').get('[data-cy=valueLink]').eq(2).click();
    cy.url().should('include', 'uiTestActions')
      .should('include', 'id~%27loadgen.mambo.net')
      .should('include', 'name~%27loadgen.mambo.net')
      .should('include', 'type~%27host');
  });
});

describe('Action attached to key value widget', () => {
  beforeEach(() => {
    cy.intercept({
      method: 'POST',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/datasource/ws/data`
    }).as('getData');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/uiTestWidgetsKeyValueWidget*`
    }).as('getPage');
    cy.intercept({
      method: 'POST',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/datasource/vertica/data`
    }).as('verticaData');
    cy.bvdLogin();
    cy.visit('/uiTestWidgetsKeyValueWidget');
    cy.wait(['@getPage', '@getData', '@getData', '@getData', '@getData', '@getData', '@getData', '@getData', '@verticaData']);
    cy.window().then(win => {
      cy.stub(win, 'alert').as('Alert');
    });
  });

  it('should check for single action', () => {
    cy.get('#ui-test-key-value-drilldown').scrollIntoView();
    cy.get('#ui-test-key-value-drilldown').should('be.visible').within(() => {
      cy.get('key-value table').should('be.visible').contains('Crosslaunch Action');
      cy.get('[data-cy="key-value-action"] [data-cy="edit-action-button-wrapper"]').click();
      cy.on('window:alert', str => {
        expect(str).to.equal('For action edit\nBy executing a key-value action, these items will get passed to the action:- \n  key : Drilldown with Context  value: 249 \n   Context : No context selected');
      });
    });
  });

  it('should check for multiple actions', () => {
    // use keyboard to open and close action menu
    cy.get('[data-cy="key-value-action"] [data-cy="action-dropdown-button-wrapper"]').type('{enter}');
    cy.get('[data-cy="action-button-delete"]').type('{esc}');
    // use normal functions for checking functionality
    cy.get('[data-cy="key-value-action"] [data-cy="action-dropdown-button-wrapper"]').click();
    cy.get('[data-cy="action-button-delete"]').click();
    cy.on('window:alert', str => {
      expect(str).to.equal('For action delete\nBy executing a key-value action, these items will get passed to the action:- \n  key : This is a veeeeeeeeery very long key  value: 249 \n   Context : No context selected');
    });
  });

  it('should show action button on truncated values', () => {
    cy.get('#ui-test-key-value-long').within(() => {
      cy.get('[data-cy="value4"] [data-cy="key-value-action"] [data-cy="edit-action-button-wrapper"]').should('be.visible');
    });
  });
});

describe('Key value widget metadata in data and icon handling', () => {
  beforeEach(() => {
    cy.intercept({
      method: 'POST',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/datasource/ws/data`
    }).as('getData');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/keyWidgetPageWithIconTest*`
    }).as('getPage');
    cy.bvdLogin();
    cy.visit('keyWidgetPageWithIconTest');
    cy.wait(['@getData', '@getPage']);
  });
  it('Icon should be shown with label', () => {
    cy.get('#events-key-value key-value').within(() => {
      cy.get('[data-cy="icon"]').should('have.class', 'qtm-icon-severity-critical-badge');
      cy.get('[data-cy="value0"] [data-cy="value"]').contains('Critical');
    });
  });

  it('Dynamic actions should exist', () => {
    cy.get('#events-key-value key-value').within(() => {
      cy.get('[data-cy="edit-action-button-wrapper"]').click();
    });
  });
});
