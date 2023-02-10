const shared = require('../../../../shared/shared');

describe('DataTable editable', () => {
  beforeEach(() => {
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/editableDataTableWidget*`
    }).as('getPage');
    cy.intercept({
      method: 'POST',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/datasource/ws/data`
    }).as('getWebapiData');
    cy.bvdLogin();
    cy.visit('/editableDataTableWidget');
    cy.wait(['@getPage', '@getWebapiData']);
  });

  function replaceTextInCell(actualText, textToChange) {
    cy.get('div[row-id=0]').eq(1).trigger('mouseenter');
    cy.get(`[data-cy="Edit-${actualText}-button-wrapper"]`).click();
    if (textToChange !== '') {
      cy.get(`[data-cy="${actualText}-inline-editing-input"]`).clear().type(textToChange);
    } else {
      cy.get(`[data-cy="${actualText}-inline-editing-input"]`).clear();
    }
    cy.get(`[data-cy="${actualText}-save-inline-editing-button-wrapper"]`).click();
    cy.wait('@getWebapiData');
  }

  it('should not save any data when cell value not changed', () => {
    cy.get('div[row-id=0]').eq(1).trigger('mouseenter');
    cy.get('[data-cy="Edit-Auto Upload of content finished.-button-wrapper"]').click();
    cy.get('[data-cy="Auto Upload of content finished.-save-inline-editing-button-wrapper"]').click();
    cy.get('div[row-index=0]').contains('Auto Upload of content finished.');
  });

  it('should save data when cell value changed', () => {
    const changedText = 'changed text';
    const actualText = 'Auto Upload of content finished.';
    replaceTextInCell(actualText, changedText);
    cy.get('div[row-index=0]').should('not.contain', 'Auto Upload of content finished.');
    cy.get('div[row-index=0]').contains(changedText);
    // revert back to original text
    replaceTextInCell(changedText, actualText);
  });

  it('Check escape works', () => {
    const actualText = 'Auto Upload of content finished.';
    cy.get('div[row-id=0]').eq(1).trigger('mouseenter');
    cy.get(`[data-cy="Edit-${actualText}-button-wrapper"]`).click();
    cy.get(`[data-cy="${actualText}-inline-editing-input"]`).type('{esc}');
    cy.get(`[data-cy="${actualText}-inline-editing-input"]`).should('not.exist');
  });

  it('Check clicking away works', () => {
    const actualText = 'Auto Upload of content finished.';
    cy.get('div[row-id=0]').eq(1).trigger('mouseenter');
    cy.get(`[data-cy="Edit-${actualText}-button-wrapper"]`).click();
    cy.get('[data-cy="page-action-button"]').click();
    cy.get(`[data-cy="${actualText}-inline-editing-input"]`).should('not.exist');
  });

  it('Save using click away', () => {
    const actualText = 'Auto Upload of content finished.';
    const changedText = `${actualText}-modified`;
    cy.get('div[row-id=0]').eq(1).trigger('mouseenter');
    cy.get(`[data-cy="Edit-${actualText}-button-wrapper"]`).click();
    cy.get(`[data-cy="${actualText}-inline-editing-input"]`).clear().type(changedText);
    cy.get('[data-cy="page-action-button"]').click();
    cy.wait('@getWebapiData');
    cy.get('div[row-index=0]').contains(changedText);
    cy.visit('/editableDataTableWidget');
    cy.wait(['@getPage', '@getWebapiData']);
    cy.get('div[row-id=0]').eq(1).trigger('mouseenter');
    cy.get(`[data-cy="Edit-${changedText}-button-wrapper"]`).click();
    cy.get(`[data-cy="${changedText}-inline-editing-input"]`).clear().type(actualText);
    cy.get('[data-cy="page-action-button"]').click();
    cy.wait('@getWebapiData');
    cy.get('div[row-index=0]').contains(actualText);
  });

  it('Edit of undefined value works', () => {
    const changedText = 'New Value';
    const actualText = '';
    replaceTextInCell(actualText, changedText);
    cy.get('div[row-index=0]').contains(changedText);
    // reverting back data
    replaceTextInCell(changedText, actualText);
    cy.get('div[row-id=0]').eq(1).trigger('mouseenter');
    cy.get(`[data-cy="Edit-${actualText}-button-wrapper"]`);
  });
});
