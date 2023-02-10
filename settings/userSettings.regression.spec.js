/* eslint-disable cypress/no-force */
// eslint-disable-next-line spaced-comment
/// <reference types="Cypress" />
const shared = require('../../../shared/shared');
let settingsData;

function createUserSetting(setting) {
  cy.getCookie('secureModifyToken').then(val => {
    cy.request({
      method: 'POST',
      url: `/rest/${Cypress.env('API_VERSION')}/settings/definition`,
      headers: {
        'X-Secure-Modify-Token': val.value
      },
      body: setting,
      failOnStatusCode: false
    });
    cy.log('Settings Created Successfully');
  });
}

function deleteUserSetting() {
  cy.getCookie('secureModifyToken').then(val => {
    cy.request({
      method: 'GET',
      url: `/rest/${Cypress.env('API_VERSION')}/settings/definition`,
      failOnStatusCode: false,
      headers: {
        'X-Secure-Modify-Token': val.value
      }
    }).then(response => {
      const resSettings = response.body.data;
      cy.log(resSettings);
      resSettings.forEach(settings => {
        cy.request({
          method: 'DELETE',
          url: `/rest/${Cypress.env('API_VERSION')}/settings/definition/${settings.id}`,
          headers: {
            'X-Secure-Modify-Token': val.value
          }
        });
      });
    });
  });
}

describe('Default User Settings', shared.defaultTestOptions, () => {
  beforeEach(() => {
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/menuEntries?filter*`
    }).as('getMenuEntry');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pages/toc?onlyFullControl*`
    }).as('getTocOnlyFullControl');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pages/toc*`
    }).as('getToc');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/settings/definition`
    }).as('getSettingsDefinition');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/setttings/value*`
    }).as('getTenantSettings');
    cy.bvdLogin();
    cy.visit('/');
    cy.wait(['@getMenuEntry', '@getTocOnlyFullControl']);
    cy.fixture('./foundation/settings/userSettings').then(data => {
      settingsData = data;
      settingsData.forEach(setting => {
        createUserSetting(setting);
      });
    });
  });

  it('User Settings', () => {
    cy.visit('/_uif_settings');
    cy.wait(['@getTocOnlyFullControl', '@getSettingsDefinition']);
    cy.get('[data-cy="node-data-name"]').should('be.visible');
    cy.get('[data-cy="node-data-name"]').contains('Distributed Online Business Logic').click();
    cy.get('[data-cy="setting-description"]').trigger('mouseover').then(() => {
      cy.get('[data-cy="edit-setting-button"]').invoke('show');
      cy.get('[data-cy="edit-setting-button"]').find('button').click();
      cy.get('[data-cy="accept-changes-button"]').should('be.visible');
      cy.get('[data-cy="reject-changes-button"]').should('be.visible');
      cy.get('#userDOBLMultiValue-input').click();
      cy.get('#userDOBLMultiValue-typeahead-option-1').click();
      cy.get('[data-cy="accept-changes-button"]').click();
      cy.bvdCheckToast('Setting userDOBLMultiValue has been updated');
    });
    cy.get('[data-cy="user-button"]').click();
    cy.get('[data-cy="user-settings"]').click();
    cy.get('#override-header>h2').should('be.visible').and('have.text', 'Settings');
    cy.get('[data-cy="btn-side-panel-close"]').should('be.visible');
    cy.get('[data-cy="panel-widget-settings-ui-widget"]').should('be.visible');
    cy.get('[data-cy="panel-widget-settings-ui-widget"] uif-settings>div>div[class="setting-wrapper"]').find('[data-cy="setting-description"]').click({ force: true });
    cy.get('[data-cy="panel-widget-settings-ui-widget"] uif-settings>div>div[class="setting-wrapper"]').find('[data-cy="setting-description"]').trigger('mouseover').then(() => {
      cy.get('[data-cy="edit-setting-button"]').eq(1).invoke('show');
      cy.get('[data-cy="edit-setting-button"]').eq(1).find('button').click();
      cy.get('[data-cy="accept-changes-button"]').should('be.visible');
      cy.get('[data-cy="reject-changes-button"]').should('be.visible');
      cy.get('#userDOBLMultiValue-input').click();
      cy.get('#userDOBLMultiValue-typeahead-option-1').click();
      cy.get('[data-cy="accept-changes-button"]').click();
      cy.bvdCheckToast('Setting userDOBLMultiValue has been updated');
    });
  });
  afterEach(() => {
    deleteUserSetting();
    cy.bvdLogout();
  });
});
