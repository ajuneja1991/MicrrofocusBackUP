// <reference types="Cypress" />
const shared = require('../../../shared/shared');

describe('Context', shared.defaultTestOptions, () => {
  beforeEach(() => {
    cy.intercept({
      method: 'POST',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/datasource/ws/data`
    }).as('getWebApiData');
    cy.intercept({
      method: 'POST',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pages/metadata`
    }).as('getPagesMetadata');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/*`
    }).as('getPagesData');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pages/toc*`
    }).as('getTOC');
    cy.bvdLogin();
    cy.visit('/uiTestWidgets');
    cy.wait(['@getPagesData', '@getWebApiData', '@getWebApiData', '@getWebApiData', '@getTOC']);
    cy.get('[data-cy=spinnerOverlay]').should('not.be.visible');
  });

  it('create new context item and delete old context item on table click', () => {
    cy.wait('@getWebApiData');
    cy.get('simple-list').contains('loadgen.mambo.net');
    cy.get('[data-cy="loadgen.mambo.net"]').click();
    cy.get('simple-list').contains('oba.mambo.net');
    cy.get('[data-cy="oba.mambo.net"]').click();
    cy.get('[data-cy="contextLabelType-Host"]').contains('oba.mambo.net');
    cy.get('[data-cy="contextItem-loadgen.mambo.net"]').should('not.exist');
  });

  it('select multiple context items on table ctrl + click', () => {
    cy.wait('@getWebApiData');
    cy.get('simple-list').contains('loadgen.mambo.net');
    cy.get('[data-cy="loadgen.mambo.net"]').click();
    cy.get('body').type('{ctrl}', { release: false });
    cy.get('simple-list').contains('oba.mambo.net');
    cy.get('[data-cy="oba.mambo.net"]').click();
    cy.get('[data-cy="contextLabelType-Host"]').contains('loadgen.mambo.net');
    cy.get('[data-cy="contextLabelType-Host"]').contains('oba.mambo.net');
  });

  it('show page suggestions based on selected context ', () => {
    cy.wait('@getWebApiData');
    cy.get('simple-list').contains('loadgen.mambo.net');
    cy.get('[data-cy="loadgen.mambo.net"]').click();
    cy.get('[data-cy="contextLabelType-Host"]').contains('loadgen.mambo.net');
    cy.wait(['@getPagesMetadata', '@getWebApiData']);
    cy.get('#split-button-toggle').click();
    cy.get('[data-cy="drilldown-componentTestPage"]').click();
    cy.get('[data-cy="contextLabelType-Host"]').contains('loadgen.mambo.net');
  });

  it('delete context on clicking X in context tag', () => {
    cy.get('simple-list [data-cy="loadgen.mambo.net"]').click();
    cy.wait(['@getPagesMetadata', '@getWebApiData']);
    cy.get('[data-cy="contextLabelType-Host"]').contains('loadgen.mambo.net');
    cy.get('[data-cy="context-tag-Host"] button.tag-remove').click();
    cy.wait('@getWebApiData');
    cy.get('[data-cy="contextItem-loadgen.mambo.net"]').should('not.exist');
    cy.location().should(loc => {
      expect(loc.search).not.contains('loadgen.mambo.net');
    });
  });

  it('delete context on clicking X in context tag after navigation', () => {
    cy.get('simple-list [data-cy="loadgen.mambo.net"]').click();
    cy.wait(['@getPagesMetadata', '@getWebApiData']);
    cy.get('#split-button-toggle').click();
    cy.get('[data-cy="drilldown-uiTestWidgetsAlternative"]').click();
    cy.wait(['@getPagesMetadata', '@getWebApiData', '@getWebApiData', '@getWebApiData']);
    cy.get('[data-cy="contextLabelType-Host"]').contains('loadgen.mambo.net');
    cy.get('simple-list [data-cy="BVD"]').click();
    cy.get('[data-cy="contextLabelType-Item"]').contains('BVD');
    cy.get('[data-cy="context-tag-Item"] button.tag-remove').click();
    cy.wait('@getWebApiData');
    cy.get('[data-cy="contextLabelType-Item"]').should('not.exist');
    cy.get('[data-cy="contextLabelType-Host"]').contains('loadgen.mambo.net');
    cy.location().should(loc => {
      expect(loc.search).not.contains('BVD');
    });
  });

  it('Contexts from previously navigated page should exists in the current page, when simple-list is there in both pages', () => {
    cy.get('simple-list [data-cy="loadgen.mambo.net"]').click();
    cy.wait(['@getPagesMetadata', '@getWebApiData']);
    cy.get('#split-button-toggle').click();
    cy.get('[data-cy="drilldown-uiTestWidgetsAlternative"]').click();
    cy.wait(['@getPagesMetadata', '@getWebApiData', '@getWebApiData', '@getWebApiData']);
    cy.get('[data-cy="contextLabelType-Host"]').contains('loadgen.mambo.net');
    cy.location().should(loc => {
      expect(loc.search).contains('loadgen.mambo.net');
    });
  });
});
