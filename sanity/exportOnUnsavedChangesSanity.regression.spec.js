const shared = require('../../shared/shared');

describe('Export with unsaved changes', () => {
  beforeEach(() => {
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/uiTestForExport*`
    }).as('getPage');
    cy.intercept({
      method: 'PUT',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pages/uiTestForExport`
    }).as('savePage');
    cy.intercept({
      method: 'PUT',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/session/user`
    }).as('updateUser');
    cy.intercept({
      method: 'POST',
      path: `${shared.webtopdfContextRoot}/${Cypress.env('API_VERSION')}/jobs`
    }).as('createJob');
    cy.intercept({
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/authtoken`
    }).as('getXAuthToken');
    cy.bvdLogin();
    cy.visit('/uiTestForExport');
    cy.wait('@getPage');
  });

  it('on export and schedule, warning banner should be shown if page contains unsaved changes', () => {
    cy.get('[data-cy="action-button"]').first().click();
    cy.get('[data-cy="action-button-duplicateWidget"]').click();
    cy.get('[data-cy="page-action-button"]').click();
    cy.get('[data-cy="page-action-item-export"]').click();
    cy.get('ux-alert').find('span').contains(`Unsaved changes won't be reflected in the generated PDF.`);
    cy.get('[data-cy="cancel-button"]').click();
    cy.get('[data-cy="page-action-button"]').click();
    cy.get('[data-cy="page-action-item-schedule"]').click();
    cy.get('ux-alert').find('span').contains(`Unsaved changes won't be reflected in the generated PDF.`);
    // below line makes sure error message banner should be below side panel header
    cy.get('div.ux-side-panel-host').find('notification').prevAll().should('have.length', 1);
    cy.get('[data-cy="cancel-button"]').click();
    cy.get('[data-cy="page-action-button"]').click();
    cy.get('[data-cy="page-action-item-save"]').click();
    cy.get('[data-cy="submit-button"]').click();
    cy.wait('@savePage');
    cy.bvdCheckToast('Update of the definition was successful');
    cy.get('[data-cy="page-action-button"]').click();
    cy.get('[data-cy="page-action-item-export"]').click();
    cy.get('ux-alert').should('not.exist');
    cy.get('[data-cy="submit-button"]').click();
    cy.wait(['@getXAuthToken', '@updateUser', '@createJob']);
    cy.bvdCheckToast('PDF generation started. You will be notified.');
    cy.get('[data-cy="page-action-button"]').click();
    cy.get('[data-cy="page-action-item-schedule"]').click();
    cy.get('ux-alert').should('not.exist');
    cy.get('[data-cy="cron-expression-input"]').should('be.visible').click();
    cy.get('[data-cy="cron-expression-input"]').type('{selectall}{backspace}0 0 30 6 *');
    cy.get(`[data-cy="email-to-input"]`).type('abc@test.com');
    cy.get('[data-cy="submit-button"]').click();
    cy.bvdCheckToast('Successfully scheduled the job');
  });
});
