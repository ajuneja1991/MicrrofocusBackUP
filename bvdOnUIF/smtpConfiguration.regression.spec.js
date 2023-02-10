import 'cypress-iframe';
const shared = require('../../shared/shared');

describe('SMTP Server Configuration Workflow', () => {
  beforeEach(() => {
    cy.intercept({
      method: 'GET',
      path: `${shared.reportingContextRoot}/rest/${Cypress.env('API_VERSION')}/system`
    }).as('pageloadSystem');
    cy.intercept({
      method: 'GET',
      path: `${shared.reportingContextRoot}/rest/${Cypress.env('API_VERSION')}/session/user`
    }).as('pageloadUser');
    cy.intercept({
      method: 'GET',
      path: `${shared.reportingContextRoot}/rest/${Cypress.env('API_VERSION')}/tenant/systemsettings`
    }).as('loadSystemSettings');
    cy.intercept({
      method: 'POST',
      path: `${shared.reportingContextRoot}/rest/${Cypress.env('API_VERSION')}/tenant/systemsettings`
    }).as('updateSystemSettings');
  });

  const bvdURL = shared.getBaseUrlForRequest(Cypress.config().baseUrl);

  function getRandomInt() {
    return Math.floor(Math.random() * 10);
  }

  function initialSetup() {
    cy.get('#configure-smtp-settings').scrollIntoView().check();
    cy.get('[data-cy="smtp-host"]').clear().type('Host');
    cy.get('[data-cy="smtp-port"]').clear().type('23');
    cy.get('[data-cy="smtp-security-option"]').click();
    cy.get('a.list-group-item').eq(0).click();
    cy.get('[data-cy="smtp-user"]').clear().type('User');
    cy.get('[data-cy=smtp-password]').clear().type('1234');
    cy.get('[data-cy="save-system-settings"]').click();
    cy.wait(['@updateSystemSettings', '@loadSystemSettings']);
    cy.get('#configure-smtp-settings').scrollIntoView().uncheck();
  }

  it('Should accept the SMTP server inputs from the UI form', () => {
    cy.bvdLogin();
    cy.visit(`${bvdURL}/#/settings`);
    cy.get('#bvd-timeZone').should('be.visible');
    initialSetup();
    cy.get('#configure-smtp-settings').scrollIntoView().should('be.visible').check();
    let host;
    cy.get('[data-cy="smtp-host"]').then(value => {
      host = value[0].value;
    });
    cy.get('[data-cy="smtp-host"]').clear().type('new host name');
    cy.get('#configure-smtp-settings').scrollIntoView().uncheck();
    cy.get('[data-cy="save-system-settings"]').click();
    cy.wait(['@updateSystemSettings', '@loadSystemSettings']);
    cy.get('#configure-smtp-settings').scrollIntoView().check();
    cy.get('[data-cy="smtp-host"]').then(value => {
      expect(host).to.equal(value[0].value);
    });
    cy.get('[data-cy="smtp-from-label"]').scrollIntoView();
    cy.get('[data-cy="smtp-host"]').clear().type('different host');
    cy.get('.qtm-icon-revert').click();
    cy.get('[data-cy="smtp-host"]').then(value => {
      expect(host).to.equal(value[0].value);
    });
    cy.get('[data-cy="smtp-port"]').clear().type('22');
    cy.get('[data-cy="smtp-security-option"]').click();
    cy.get('a.list-group-item').eq(1).click();
    const newUser = `newUser-${getRandomInt()}`;
    cy.get('[data-cy="smtp-user"]').clear().type(newUser);
    cy.get('[data-cy="save-system-settings"]').click();
    cy.wait(['@updateSystemSettings', '@loadSystemSettings']);
    cy.get('[data-cy="save-system-settings"]').should('be.disabled');
    cy.get('#configure-smtp-settings').uncheck();
    cy.get('#configure-smtp-settings').scrollIntoView().check();
    cy.get('[data-cy="smtp-port"]').should('have.value', '22');
    cy.get('[data-cy="smtp-user"]').should('have.value', newUser);
  });
});
