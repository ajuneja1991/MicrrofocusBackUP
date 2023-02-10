// <reference types="Cypress" />
const shared = require('../../../shared/shared');

describe('Context Scope', shared.defaultTestOptions, () => {
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
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/widgetsPairedScope*`
    }).as('getPagesData');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pages/toc*`
    }).as('getTOC');
    cy.bvdLogin();
    cy.visit('/widgetsPairedScope');
    cy.wait(['@getPagesData', '@getWebApiData', '@getWebApiData', '@getWebApiData', '@getWebApiData', '@getWebApiData', '@getWebApiData', '@getWebApiData', '@getWebApiData', '@getTOC']);
    cy.get('[data-cy=spinnerOverlay]').should('not.be.visible');
    cy.get('#mashup-dashboard').find('[data-cy="loadgen.mambo.net"]')
      .should('have.length', 4);
  });

  it('First list listens and emits to scope A', () => {
    // Adding items by selecting checkbox
    cy.get('[data-cy="loadgen.mambo.net"] ux-checkbox').eq(0).invoke('show').click();
    cy.wait(['@getWebApiData']);
    cy.get('[data-cy="contextLabelType-Host"]').contains('loadgen.mambo.net (A)');
    cy.get('[data-cy="loadgen.mambo.net"]').eq(0).should('have.attr', 'aria-selected', 'true');
    cy.get('[data-cy="loadgen.mambo.net"]').eq(1).should('have.attr', 'aria-selected', 'false');
    cy.get('[data-cy="loadgen.mambo.net"]').eq(2).should('have.attr', 'aria-selected', 'false');
    cy.get('[data-cy="loadgen.mambo.net"]').eq(3).should('have.attr', 'aria-selected', 'false');
    cy.get('[data-cy="drillDownButton"]');

    cy.get('[data-cy="oba.mambo.net"] ux-checkbox').eq(0).invoke('show').click();
    cy.wait(['@getWebApiData']);
    cy.get('[data-cy="contextLabelType-Host"]').contains('oba.mambo.net (A)');
    cy.get('[data-cy="contextLabelType-Host"]').contains('loadgen.mambo.net (A)');
    cy.get('[data-cy="loadgen.mambo.net"]').eq(0).should('have.attr', 'aria-selected', 'true');
    cy.get('[data-cy="loadgen.mambo.net"]').eq(1).should('have.attr', 'aria-selected', 'false');
    cy.get('[data-cy="loadgen.mambo.net"]').eq(2).should('have.attr', 'aria-selected', 'false');
    cy.get('[data-cy="loadgen.mambo.net"]').eq(3).should('have.attr', 'aria-selected', 'false');
    cy.get('[data-cy="oba.mambo.net"]').eq(0).should('have.attr', 'aria-selected', 'true');
    cy.get('[data-cy="oba.mambo.net"]').eq(1).should('have.attr', 'aria-selected', 'false');
    cy.get('[data-cy="oba.mambo.net"]').eq(2).should('have.attr', 'aria-selected', 'false');
    cy.get('[data-cy="oba.mambo.net"]').eq(3).should('have.attr', 'aria-selected', 'false');
    cy.get('[data-cy="drillDownButton"]');

    // Unselecting items from list
    cy.get('[data-cy="loadgen.mambo.net"] ux-checkbox').eq(0).invoke('show').click();
    cy.wait(['@getWebApiData']);
    cy.get('[data-cy="loadgen.mambo.net"]').eq(0).should('have.attr', 'aria-selected', 'false');
    cy.get('[data-cy="contextLabelType-Host"]').should('not.contain', 'loadgen.mambo.net');
    cy.get('[data-cy="oba.mambo.net"] ux-checkbox').eq(0).invoke('show').click();
    cy.wait(['@getWebApiData']);
    cy.get('[data-cy="oba.mambo.net"]').eq(0).should('have.attr', 'aria-selected', 'false');
    cy.get('[data-cy="contextLabelType-Host"]').should('not.exist');
  });

  it('Second list listens and emits to scope B', () => {
    // Adding items by selecting checkbox
    cy.get('[data-cy="loadgen.mambo.net"] ux-checkbox').eq(1).invoke('show').click();
    cy.wait(['@getWebApiData']);
    cy.get('[data-cy="contextLabelType-Host"]').contains('loadgen.mambo.net (B)');
    cy.get('[data-cy="loadgen.mambo.net"]').eq(0).should('have.attr', 'aria-selected', 'false');
    cy.get('[data-cy="loadgen.mambo.net"]').eq(1).should('have.attr', 'aria-selected', 'true');
    cy.get('[data-cy="loadgen.mambo.net"]').eq(2).should('have.attr', 'aria-selected', 'false');
    cy.get('[data-cy="loadgen.mambo.net"]').eq(3).should('have.attr', 'aria-selected', 'false');
    cy.get('[data-cy="drillDownButton"]');

    cy.get('[data-cy="obac.mambo.net"] ux-checkbox').eq(1).invoke('show').click();
    cy.wait(['@getWebApiData']);
    cy.get('[data-cy="contextLabelType-Host"]').contains('obac.mambo.net (B)');
    cy.get('[data-cy="contextLabelType-Host"]').contains('loadgen.mambo.net (B)');
    cy.get('[data-cy="obac.mambo.net"]').eq(0).should('have.attr', 'aria-selected', 'false');
    cy.get('[data-cy="obac.mambo.net"]').eq(1).should('have.attr', 'aria-selected', 'true');
    cy.get('[data-cy="obac.mambo.net"]').eq(2).should('have.attr', 'aria-selected', 'false');
    cy.get('[data-cy="obac.mambo.net"]').eq(3).should('have.attr', 'aria-selected', 'false');
    cy.get('[data-cy="loadgen.mambo.net"]').eq(0).should('have.attr', 'aria-selected', 'false');
    cy.get('[data-cy="loadgen.mambo.net"]').eq(1).should('have.attr', 'aria-selected', 'true');
    cy.get('[data-cy="loadgen.mambo.net"]').eq(2).should('have.attr', 'aria-selected', 'false');
    cy.get('[data-cy="loadgen.mambo.net"]').eq(3).should('have.attr', 'aria-selected', 'false');
    cy.get('[data-cy="drillDownButton"]');

    // Unselecting items from list
    cy.get('[data-cy="loadgen.mambo.net"] ux-checkbox').eq(1).invoke('show').click();
    cy.wait(['@getWebApiData']);
    cy.get('[data-cy="loadgen.mambo.net"]').eq(1).should('have.attr', 'aria-selected', 'false');
    cy.get('[data-cy="contextLabelType-Host"]').should('not.contain', 'loadgen.mambo.net (B)');
    cy.get('[data-cy="obac.mambo.net"] ux-checkbox').eq(1).invoke('show').click();
    cy.wait(['@getWebApiData']);
    cy.get('[data-cy="obac.mambo.net"]').eq(1).should('have.attr', 'aria-selected', 'false');
    cy.get('[data-cy="contextLabelType-Host"]').should('not.exist');
  });

  it('Third list listens and emits to scope C', () => {
    // Adding items by selecting checkbox
    cy.get('[data-cy="loadgen.mambo.net"] ux-checkbox').eq(2).invoke('show').click();
    cy.wait(['@getWebApiData']);
    cy.get('[data-cy="contextLabelType-Host"]').contains('loadgen.mambo.net (C)');
    cy.get('[data-cy="loadgen.mambo.net"]').eq(0).should('have.attr', 'aria-selected', 'false');
    cy.get('[data-cy="loadgen.mambo.net"]').eq(1).should('have.attr', 'aria-selected', 'false');
    cy.get('[data-cy="loadgen.mambo.net"]').eq(2).should('have.attr', 'aria-selected', 'true');
    cy.get('[data-cy="loadgen.mambo.net"]').eq(3).should('have.attr', 'aria-selected', 'false');
    cy.get('[data-cy="drillDownButton"]');

    cy.get('[data-cy="obac.mambo.net"] ux-checkbox').eq(2).invoke('show').click();
    cy.wait(['@getWebApiData']);
    cy.get('[data-cy="contextLabelType-Host"]').contains('obac.mambo.net (C)');
    cy.get('[data-cy="contextLabelType-Host"]').contains('loadgen.mambo.net (C)');
    cy.get('[data-cy="obac.mambo.net"]').eq(0).should('have.attr', 'aria-selected', 'false');
    cy.get('[data-cy="obac.mambo.net"]').eq(1).should('have.attr', 'aria-selected', 'false');
    cy.get('[data-cy="obac.mambo.net"]').eq(2).should('have.attr', 'aria-selected', 'true');
    cy.get('[data-cy="obac.mambo.net"]').eq(3).should('have.attr', 'aria-selected', 'false');
    cy.get('[data-cy="loadgen.mambo.net"]').eq(0).should('have.attr', 'aria-selected', 'false');
    cy.get('[data-cy="loadgen.mambo.net"]').eq(1).should('have.attr', 'aria-selected', 'false');
    cy.get('[data-cy="loadgen.mambo.net"]').eq(2).should('have.attr', 'aria-selected', 'true');
    cy.get('[data-cy="loadgen.mambo.net"]').eq(3).should('have.attr', 'aria-selected', 'false');

    cy.get('[data-cy="drillDownButton"]');

    // Unselecting items from list
    cy.get('[data-cy="loadgen.mambo.net"] ux-checkbox').eq(2).invoke('show').click();
    cy.wait(['@getWebApiData']);
    cy.get('[data-cy="loadgen.mambo.net"]').eq(2).should('have.attr', 'aria-selected', 'false');
    cy.get('[data-cy="contextLabelType-Host"]').should('not.contain', 'loadgen.mambo.net (C)');
    cy.get('[data-cy="obac.mambo.net"] ux-checkbox').eq(2).invoke('show').click();
    cy.wait(['@getWebApiData']);
    cy.get('[data-cy="obac.mambo.net"]').eq(2).should('have.attr', 'aria-selected', 'false');
    cy.get('[data-cy="contextLabelType-Host"]').should('not.exist');
  });

  it('Multiple selection from different scopes merges the context', () => {
    cy.get('[data-cy="loadgen.mambo.net"]').eq(2).find('td').contains('loadgen.mambo.net').click();
    cy.wait('@getWebApiData');
    cy.get('[data-cy="loadgen.mambo.net"]').eq(1).find('td').contains('loadgen.mambo.net').click();
    cy.wait('@getWebApiData');
    cy.get('[data-cy="loadgen.mambo.net"]').eq(0).find('td').contains('loadgen.mambo.net').click();
    cy.wait('@getWebApiData');
    cy.get('[data-cy="contextLabelType-Host"]').contains(' loadgen.mambo.net (C,B,A) ');
  });

  it('Deletion of context from context bar', () => {
    // Deletion of contexts from context bar
    cy.get('[data-cy="loadgen.mambo.net"]').eq(0).find('td').contains('loadgen.mambo.net').click();
    cy.wait('@getWebApiData');
    cy.get('[data-cy="loadgen.mambo.net"]').eq(1).find('td').contains('loadgen.mambo.net').click();
    cy.wait('@getWebApiData');
    cy.get('[data-cy="loadgen.mambo.net"]').eq(2).find('td').contains('loadgen.mambo.net').click();
    cy.get('[data-cy="context-tag-Host"] button.tag-remove').click();
    cy.wait('@getWebApiData');
  });

  it('widget with no scope should show default in contextbar', () => {
    cy.get('[data-cy="loadgen.mambo.net"] ux-checkbox').eq(3).invoke('show').click();
    cy.wait(['@getWebApiData']);
    cy.get('[data-cy="loadgen.mambo.net"]').eq(0).should('have.attr', 'aria-selected', 'false');
    cy.get('[data-cy="loadgen.mambo.net"]').eq(1).should('have.attr', 'aria-selected', 'false');
    cy.get('[data-cy="loadgen.mambo.net"]').eq(2).should('have.attr', 'aria-selected', 'false');
    cy.get('[data-cy="loadgen.mambo.net"]').eq(3).should('have.attr', 'aria-selected', 'true');
    cy.get('[data-cy="contextLabelType-Host"]').contains('loadgen.mambo.net');
  });
});

describe('Obsolete default scope configuration in URL', shared.defaultTestOptions, () => {
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
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/obsoletedDefaultScope*`
    }).as('getPagesData');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pages/toc*`
    }).as('getTOC');
    cy.bvdLogin();
  });

  it('Obsolete default scope widget config should be ignored', () => {
    cy.visit('obsoletedDefaultScope');
    cy.wait(['@getPagesData', '@getWebApiData', '@getWebApiData', '@getTOC']);
    cy.get('[data-cy=spinnerOverlay]').should('not.be.visible');
    cy.get('[data-cy="loadgen.mambo.net"]').find('td').contains('loadgen.mambo.net').click();
    cy.wait('@getWebApiData');
    cy.get('[data-cy="contextLabelType-Host"]').contains('loadgen.mambo.net');
    cy.url().should('not.include', 'scope');
  });

  it('Obsolete default scope in URL should be ignored', () => {
    cy.visit('obsoletedDefaultScope?_ctx=~(~(type~%27host~id~%27loadgen.mambo.net~name~%27loadgen.mambo.net~scope~(~%27default)))&_s=1634801280000&_e=1634808480000&_tft=A');
    cy.wait(['@getPagesData', '@getWebApiData', '@getWebApiData', '@getTOC']);
    cy.get('[data-cy=spinnerOverlay]').should('not.be.visible');
    cy.get('[data-cy="contextLabelType-Host"]').contains('loadgen.mambo.net');
  });
});
