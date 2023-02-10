const shared = require('../../shared/shared');

describe('Mondrian Splitter', shared.defaultTestOptions, () => {
  beforeEach(() => {
    cy.intercept({
      method: 'POST',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/datasource/ws/data`
    }).as('getWebapiData');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/uiTestSplitterSimpleNested*`
    }).as('getPageUiTestSplitterSimpleNested');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/uiTestSplitterVertical*`
    }).as('getPageUiTestSplitterVertical');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pages/toc*`
    }).as('getTOC');
    cy.bvdLogin();
  });

  it('Check if the Splitter Layout is created', () => {
    cy.visit('/uiTestSplitterSimpleNested');
    cy.wait(['@getPageUiTestSplitterSimpleNested', '@getWebapiData', '@getWebapiData', '@getWebapiData', '@getWebapiData', '@getTOC']);
    cy.get('mondrian-splitter');
    cy.get('as-split');
  });

  it('Check if the Vertical Splitter Layout is created', () => {
    cy.visit('/uiTestSplitterVertical');
    cy.wait(['@getPageUiTestSplitterVertical', '@getWebapiData', '@getWebapiData', '@getTOC']);
    cy.get('mondrian-splitter');
    cy.get('as-split').should('have.class', 'as-vertical');
  });

  it('should create a duplicate horizontal/ vertical widget', () => {
    cy.visit('/uiTestSplitterSimpleNested');
    cy.wait(['@getPageUiTestSplitterSimpleNested', '@getWebapiData', '@getWebapiData', '@getWebapiData', '@getWebapiData', '@getTOC']);
    cy.get('as-split.as-horizontal > as-split-area').should('have.length', 2);
    cy.get('as-split.as-vertical > as-split-area').should('have.length', 3);

    cy.get('[data-cy="action-button"]').eq(2).click();
    cy.get('[data-cy="action-button-duplicateWidget"]').click();
    cy.wait('@getWebapiData');
    cy.get('as-split.as-horizontal > as-split-area').should('have.length', 3);

    cy.get('[data-cy="action-button"]').first().click();
    cy.get('[data-cy="action-button-duplicateWidget"]').click();
    cy.wait('@getWebapiData');
    cy.get('as-split.as-vertical > as-split-area').should('have.length', 4);
  });

  it('should update widget title', () => {
    cy.visit('/uiTestSplitterSimpleNested');
    cy.wait(['@getPageUiTestSplitterSimpleNested', '@getWebapiData', '@getWebapiData', '@getWebapiData', '@getWebapiData', '@getTOC']);
    cy.get('[data-cy="action-button"]').eq(2).click();
    cy.get('[data-cy="action-button-edit"]').click();
    cy.get('[data-cy="widgetNameInput"]').clear().type('server x');
    cy.get('[data-cy="btn-side-panel-close"]').click();
    cy.get('.dashboard-widget-title').eq(2).contains('server x');
  });

  it('should delete widget', () => {
    cy.visit('/uiTestSplitterSimpleNested');
    cy.wait(['@getPageUiTestSplitterSimpleNested', '@getWebapiData', '@getWebapiData', '@getWebapiData', '@getWebapiData', '@getTOC']);
    cy.get('as-split.as-horizontal > as-split-area').should('have.length', 2);
    cy.get('[data-cy="action-button"]').eq(2).click();
    cy.get('[data-cy="action-button-removeWidget"]').click();
    cy.get('as-split.as-horizontal > as-split-area').should('have.length', 1);
  });

  it('Should change the layout of splitter widget and revert to check if the widget has original layout', () => {
    cy.visit('/uiTestSplitterSimpleNested');
    cy.wait(['@getPageUiTestSplitterSimpleNested', '@getWebapiData', '@getWebapiData', '@getWebapiData', '@getWebapiData', '@getTOC']);
    cy.get('mondrian-splitter#splitter-dashboard').eq(1).find('as-split-area').eq(0).invoke('width').then(value => {
      expect(value).to.be.within(250, 300);
    });
    // Adding force true because of the widget covering the as-split-gutter while performing the mouse drag.
    // eslint-disable-next-line cypress/no-force
    cy.get('div.as-split-gutter').eq(0).trigger('mousedown', { force: true }).trigger('mousemove', 200, -20, { force: true }).trigger('mouseup', { force: true });
    cy.get('mondrian-splitter#splitter-dashboard').eq(1).find('as-split-area').eq(0).invoke('width').then(value => {
      expect(value).to.be.greaterThan(450);
    });
    cy.get('[data-cy="page-action-button"]').click();
    cy.get('[data-cy="page-action-item-revert"').click();
    cy.get('[data-cy="mondrianModalDialogButton"]').click();
    cy.get('mondrian-splitter#splitter-dashboard').eq(1).find('as-split-area').eq(0).invoke('width').then(value => {
      expect(value).to.be.within(250, 300);
    });
  });

  it('Should save the page with the modified config of splitter widget and check if saved with modified structure', () => {
    cy.visit('/uiTestSplitterSimpleNested');
    cy.wait(['@getPageUiTestSplitterSimpleNested', '@getWebapiData', '@getWebapiData', '@getWebapiData', '@getWebapiData', '@getTOC']);
    let currentHeight;
    cy.get('as-split-area').eq(0).invoke('height').then(value => {
      currentHeight = value; // capture the current height
    });
    // Adding force true because of the widget covering the as-split-gutter while performing the mouse drag.
    // eslint-disable-next-line cypress/no-force
    cy.get('div.as-split-gutter').eq(1).trigger('mousedown', { force: true }).trigger('mousemove', 600, 100, { force: true }).trigger('mouseup', { force: true });
    cy.get('as-split-area').eq(0).invoke('height').then(value => {
      expect(value).to.be.greaterThan(currentHeight);// new height should be not be equal to captured height
      currentHeight = value; // new height
    });
    cy.get('[data-cy="page-action-button"]').click();
    cy.get('[data-cy="page-action-item-save"]').click();
    cy.get('[data-cy="submit-button"]').click();
    cy.bvdCheckToast('Update of the definition was successful');
    cy.get('as-split-area').eq(0).invoke('height').then(value => {
      expect(value).to.be.equal(currentHeight);// no change in height after saving
    });
    // revert the saved changes
    // eslint-disable-next-line cypress/no-force
    cy.get('div.as-split-gutter').eq(1).trigger('mousedown', { force: true }).trigger('mousemove', 700, -100, { force: true }).trigger('mouseup', { force: true });
    cy.get('as-split-area').eq(0).invoke('height').then(value => {
      expect(value).to.be.lessThan(currentHeight);// new height should be not be less than the previously captured height
    });
    cy.get('[data-cy="page-action-button"]').click();
    cy.get('[data-cy="page-action-item-save"]').click();
    cy.get('[data-cy="submit-button"]').click();
    cy.bvdCheckToast('Update of the definition was successful');
  });

  it('Should not show the confirmation dialog just by moving the splitter positions', () => {
    cy.visit('/uiTestSplitterSimpleNested');
    cy.wait(['@getPageUiTestSplitterSimpleNested', '@getWebapiData', '@getWebapiData', '@getWebapiData', '@getWebapiData', '@getTOC']);

    // Adding force true because of the widget covering the as-split-gutter while performing the mouse drag.
    // eslint-disable-next-line cypress/no-force
    cy.get('div.as-split-gutter').eq(1).trigger('mousedown', { force: true }).trigger('mousemove', 600, 100, { force: true }).trigger('mouseup', { force: true });

    cy.get('[data-cy="page-action-button"]').click();
    cy.get('[data-cy="page-action-item-save"]').should('not.have.class', 'disabled');
    cy.visit('/uiTestSplitterVertical');
    cy.wait(['@getPageUiTestSplitterVertical', '@getWebapiData', '@getWebapiData', '@getTOC']);
    cy.get('mondrian-splitter');
    cy.get('[data-cy="mondrianModalDialogButton"]').should('not.exist');
    cy.get('#modal-title').should('not.exist');
  });
});
