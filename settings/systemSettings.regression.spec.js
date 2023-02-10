// eslint-disable-next-line spaced-comment
/// <reference types="Cypress" />
const shared = require('../../../shared/shared');
let settingsData;

function createSystemSetting(setting) {
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

function deleteSystemSetting() {
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
describe('System settings - WebToPDF Proxy', () => {
  beforeEach(() => {
    cy.intercept({
      method: 'GET',
      url: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/settings/value`
    }).as('getSettingsValue');
    cy.intercept({
      method: 'GET',
      url: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/settings/definition`
    }).as('getSettingsDefinition');
    cy.intercept({
      method: 'GET',
      url: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/settings/value?level=tenant`
    }).as('getTenantLevelSettings');
    cy.intercept({
      method: 'GET',
      url: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pages/toc?*`
    }).as('getPagesToc');
    cy.bvdLogin();
    cy.visit('/_uif_settings');
    cy.wait(['@getSettingsValue', '@getPagesToc', '@getSettingsDefinition', '@getTenantLevelSettings', '@getPagesToc']);
  });

  it('Ensure Web to pdf proxy url regex check and updating value works', () => {
    cy.get('uif-settings');
    cy.get('[data-cy="setting-tree-General settings"]').click();
    cy.get('[data-cy="setting-label"]').contains('Proxy Url').should('not.exist');
    cy.get('[data-cy="settings-tab"]').find('li').contains('System Settings').click();
    cy.get('[data-cy="setting-tree-General settings"]').click();
    cy.get('[data-cy="setting-tree-Export and Scheduled Reporting"]').click();
    cy.get('[data-cy="setting-content-list"]');
    cy.get('[data-cy="section-name"]').contains('Export and Scheduled Reporting');
    cy.get('[data-cy="setting-label"]').contains('Proxy Url');
    cy.get('[data-cy="setting-description"]').contains(' Specify proxy url to download fonts which are used in the report. ');
    cy.get('[data-cy="setting-values"]').first().find('[data-cy="edit-setting-button"]').invoke('show');
    cy.get('[data-cy="setting-values"]').first().find('[data-cy="edit-setting-button"] button').click();
    cy.get('[id="WEB_TO_PDF_PROXY_URL-input"]').type('{selectall}{backspace}asas');
    cy.get('[data-cy="regex-error-message"]').should('contain', 'Specify URLs starting with the protocols http:// or https://');
    cy.get('[id="WEB_TO_PDF_PROXY_URL-input"]').type('{selectall}{backspace}');
    cy.get('[id="WEB_TO_PDF_PROXY_URL-input"]').type('http://xyz.com');
    cy.get('[data-cy="regex-error-message"]').should('not.exist');
    cy.get('[data-cy="accept-changes-button"]').click();
    cy.bvdCheckToast('Setting WEB_TO_PDF_PROXY_URL has been updated');
    cy.reload();
    cy.get('[data-cy="settings-tab"]').find('li').contains('System Settings').click();
    cy.get('[data-cy="setting-tree-General settings"]').click();
    cy.get('[data-cy="setting-tree-Export and Scheduled Reporting"]').click();
    cy.get('[data-cy="display-label"]').should('have.text', ' http://xyz.com ');
  });
});

describe('System Settings Scenarios', shared.defaultTestOptions, () => {
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
    cy.fixture('./foundation/settings/systemSettings').then(data => {
      settingsData = data;
      settingsData.forEach(setting => {
        createSystemSetting(setting);
      });
    });
  });

  it('System Settings UI', () => {
    cy.visit('/_uif_settings');
    cy.wait(['@getTocOnlyFullControl', '@getSettingsDefinition']);
    cy.get('[data-cy="settings-tab"]').find('li').should('have.length', 2);
    cy.get('[data-cy="settings-tab"]').find('li').contains('System Settings').click();
    cy.get('[data-cy="node-data-name"]').contains('Distributed Online Business Logic').click();
    cy.get('[data-cy="section-name"]').contains('DOBL 1').should('be.visible');
    cy.get('[data-cy="setting-values"]').should('have.length', 10);
    cy.get('[data-cy="setting-values"').each(settingsValue => {
      cy.wrap(settingsValue).scrollIntoView();
    });
    cy.get('[data-cy="node-data-name"]').contains('Alerting').click();
    cy.get('[data-cy="section-list"]').should('have.length', 2);
    cy.get('[data-cy="section-name"]').contains('Event Handling').should('be.visible');
    cy.get('[data-cy="section-name"]').contains('Event Handling').parent().find('[data-cy="setting-values"]').should('have.length', 3);
    cy.get('[data-cy="section-name"]').contains('Triggered alerts').should('be.visible');
    cy.get('[data-cy="section-name"]').contains('Triggered alerts').parent().find('[data-cy="setting-values"]').should('have.length', 1);
    cy.get('[data-cy="section-name"]').contains('Triggered alerts').parent().find('[data-cy="setting-label"]').should('have.text', 'Date Fromatter 2 Label Goes Here');
    cy.get('[data-cy="section-name"]').contains('Triggered alerts').parent().find('[data-cy="setting-description"]').should('have.text', ' Date formatter desc 2 ');
    cy.get('[data-cy="node-data-name"]').each(syssett => {
      cy.wrap(syssett).scrollIntoView();
    });
    cy.get('[data-cy="setting-data-name"] span i.qtm-icon-folder').each(settingExpandBtn => {
      cy.wrap(settingExpandBtn).scrollIntoView().click();
    });
  });

  afterEach(() => {
    deleteSystemSetting();
    cy.bvdLogout();
  });
});

