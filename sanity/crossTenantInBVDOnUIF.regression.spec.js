/* eslint-disable camelcase */
// <reference types="Cypress" />
const shared = require('../../shared/shared');
import 'cypress-iframe';
import 'cypress-file-upload';

const loginAndOpenDataCollector = (url, user, pwd) => {
  cy.visit(url);
  cy.get('#username').type(user);
  cy.get('#password').type(pwd);
  cy.get('#submit').should('be.visible').click();
  cy.wait(['@getTOC']);
  cy.get('.ux-side-menu-toggle').click();
  cy.wait(['@getTOC']);
  cy.get('[data-cy="navigation-category-1_L0_SA_Administration"] > .ux-side-menu-item').click();
  cy.get('[data-cy="navigation-category-0_L1_SA_AdminDashboards"] > .ux-side-menu-item').click();
  cy.get('[data-cy="navigation-category-1_L2_SA_StakeHolderAdminPages"]').click();
  cy.get('[data-cy="navigation-menuEntry-2_L3_SA_DataCollector"]').click();
};

function checkForSmtpConfigurationAccess() {
  cy.get('[data-cy=navigation-menuEntry-4_L3_SA_Setting]').click();
  cy.frameLoaded('[data-cy=mondrian-iframe-apiKey]');
  cy.frameLoaded('[data-cy=mondrian-iframe-SystemSettings]').iframeCustom().then($contentFrame => {
    cy.wrap($contentFrame).find('#bvd-timeZone').should('be.visible');
    cy.wrap($contentFrame).find('#bvd-customCss').should('be.visible');
    cy.wrap($contentFrame).find('#configure-smtp-settings').should('not.exist');
  });
}

describe('Cross tenant login in BVDOnUIF and access', shared.defaultTestOptions, () => {
  beforeEach(() => {
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pages/toc*`
    }).as('getTOC');
    cy.intercept({ method: 'POST', url: `${Cypress.env('BVD_CONTEXT_ROOT')}/rest/${Cypress.env('API_VERSION')}/dataCollector/test?format=json` }).as('runDataQuery');
    cy.intercept(`${shared.reportingContextRoot}/rest/${Cypress.env('API_VERSION')}/system`).as('reportingPageloadSystem');
    cy.intercept(`${shared.reportingContextRoot}/rest/${Cypress.env('API_VERSION')}/session/user`).as('reportingPageloadUser');
    cy.intercept(`${shared.reportingContextRoot}/rest/${Cypress.env('API_VERSION')}/dashboard/?type=dashboards,templates`).as('dashboardListLoad');
    cy.intercept({ method: 'POST', url: `${Cypress.env('BVD_CONTEXT_ROOT')}/rest/${Cypress.env('API_VERSION')}/tenant/apikey` }).as('generateNewApiKey');
    cy.intercept({ method: 'POST', url: `${Cypress.env('BVD_CONTEXT_ROOT')}/rest/${Cypress.env('API_VERSION')}/connection/test` }).as('connectionTest');
    cy.intercept({ method: 'PUT', url: `${Cypress.env('BVD_CONTEXT_ROOT')}/rest/${Cypress.env('API_VERSION')}/connection` }).as('updateConnection');
    cy.intercept({ method: 'POST', url: `${Cypress.env('BVD_CONTEXT_ROOT')}/rest/${Cypress.env('API_VERSION')}/dataCollector?format=json` }).as('saveDataQuery');
  });

  it('Test login with admin user of provider and admin user of Customer 3 in Customer3 tenant', () => {
    cy.visit('?tenant=Customer3');
    cy.get('#username').should('be.visible');
    cy.get('#username').type('admin');
    cy.get('#password').type('Control@123');
    cy.get('#submit').should('be.visible').click();
    cy.get('span#error-help-block').should('be.visible');
    loginAndOpenDataCollector('?tenant=Customer3', 'customer3Admin@microfocus.com', 'Control@123');
    cy.frameLoaded('[data-cy="mondrian-iframe-dataCollector"]').iframeCustom().then($contentFrame => {
      cy.wrap($contentFrame).find('[data-cy="dropdown-more"]').should('be.visible');
      cy.wrap($contentFrame).find('[data-cy="dropdown-more"]').click();
      cy.wrap($contentFrame).find('#buttonDBSetting').should('not.exist');
    });
    cy.get('[data-cy="navigation-category-0_L1_SA_AdminDashboards"] ux-side-menu-item').should('have.length', 3);
    const expectedDashboardMenuItems = ['Scheduled Reports', 'Predefined Queries', 'Stakeholder Dashboards & Reports'];
    cy.get('[data-cy="navigation-category-0_L1_SA_AdminDashboards"] ux-side-menu-item button div span').each(($elem, index) => {
      expect(expectedDashboardMenuItems[index]).equal($elem.text());
    });
    cy.get('[data-cy="navigation-category-1_L2_SA_StakeHolderAdminPages"]').click();
    cy.get(`[data-cy="navigation-category-1_L2_SA_StakeHolderAdminPages"] ux-side-menu-item`).should('have.length', 3);
    const expectedMenuItems = ['Dashboard Management', 'Resources', 'Roles'];
    cy.get('[data-cy*="StakeHolderAdminPages"]').find(`ux-side-menu-item button span[id*='fourth']`).each(($elem, index) => {
      expect(expectedMenuItems[index]).equal($elem.text());
    });
    cy.get('[data-cy="navigation-category-__base_setup_config"]').click();
    checkForSmtpConfigurationAccess();
    cy.bvdUiLogout();
  });

  it('Login with admin user of Provider with target tenant as Customer3', () => {
    loginAndOpenDataCollector('?target_tenant=Customer3', 'admin', 'Control@123');
    cy.frameLoaded('[data-cy="mondrian-iframe-dataCollector"]').iframeCustom().then($contentFrame => {
      cy.wait(['@getTOC', '@reportingPageloadUser']);
      cy.wrap($contentFrame).find('[data-cy="dropdown-more"]').should('be.visible');
      cy.wait(['@reportingPageloadUser']);
      cy.wrap($contentFrame).find('[data-cy="dropdown-more"]').click();
      cy.wrap($contentFrame).find('[data-cy="optionDBSettings"]').click();
      cy.wrap($contentFrame).find('input[name="hostName"]').should('be.visible');
      cy.wrap($contentFrame).find('input#hostname-input_hostName').should('have.value', Cypress.env('VERTICA_HOST'));
      cy.wrap($contentFrame).find('input[name="port"]').should('be.visible');
      cy.wrap($contentFrame).find('input[name="port"]').should('have.value', Cypress.env('VERTICA_PORT'));
      cy.wrap($contentFrame).find('[data-cy="enableTLSCheckbox"]').should('not.be.checked');
      cy.wrap($contentFrame).find('input[name="dbName"]').should('have.value', 'opsadb');
      cy.wrap($contentFrame).find('input[name="dbUser"]').should('have.value', 'dbadmin');
      cy.wrap($contentFrame).find('[data-cy="buttonTestConnection"]').click();
      cy.wait('@connectionTest');
      cy.wrap($contentFrame).find('.alert.testConnectionAlert.alert-success').should('be.visible');
      cy.wrap($contentFrame).find('.alert.testConnectionAlert.alert-success').contains('Test connection succeeded');
      cy.wrap($contentFrame).find('.spinner').should('not.exist');
      cy.wrap($contentFrame).find('[data-cy="buttonSaveDBSetting"]').click();
      cy.wait('@updateConnection');
      cy.wrap($contentFrame).find('.spinner').should('not.exist');
      cy.wrap($contentFrame).find('.dropdown #dropdownNew1').first().click();
      cy.wrap($contentFrame).find('[data-cy="newDataQuery"]').should('be.visible').click();
      cy.wrap($contentFrame).find('#name-input_name').should('be.visible').click();
      cy.wrap($contentFrame).find('#name-input_name').type('testQueryName');
      cy.wrap($contentFrame).find('#description-input').click();
      cy.wrap($contentFrame).find('#description-input').type('testquerydescription');
      cy.wrap($contentFrame).find(`input.opr-tag-bar-input[type='text']`).click();
      cy.wrap($contentFrame).find(`input.opr-tag-bar-input[type='text']`).type(`querydescription{enter}`);
      cy.wrap($contentFrame).find('#queryformat-default').click();
      cy.wrap($contentFrame).find('#query-text').should('be.visible').click();
      cy.wrap($contentFrame).find('#query-text').type(`select * from Machines1 where CPU <= 500 and ram < 500`, { parseSpecialCharSequences: false });
      cy.wrap($contentFrame).find('#buttonExecuteQuery').should('be.visible');
      cy.wrap($contentFrame).find('#buttonExecuteQuery').click();
      cy.wait('@runDataQuery');
      cy.wrap($contentFrame).find('.spinner').should('not.exist');
      cy.wrap($contentFrame).find('.col-sm-12 .queryResultData table tr th').should('have.length', 5);
      cy.wrap($contentFrame).find('.col-sm-12 .queryResultData table tr th').each($elem => {
        expect(['hostname', 'CPU', 'ram', 'id', 'category']).contains($elem.text().trim());
      });
      cy.wrap($contentFrame).find('#buttonConfirm').click();
      cy.wait('@saveDataQuery');
      cy.wrap($contentFrame).find('.spinner').should('not.exist');
      cy.wrap($contentFrame).find('div.list-title-container div').contains('testQueryName');
    });
    cy.get('[data-cy="navigation-category-0_L1_SA_AdminDashboards"] ux-side-menu-item').should('have.length', 3);
    const expectedDashboardMenuItems = ['Scheduled Reports', 'Predefined Queries', 'Stakeholder Dashboards & Reports'];
    cy.get('[data-cy="navigation-category-0_L1_SA_AdminDashboards"] ux-side-menu-item button div span').each(($elem, index) => {
      expect(expectedDashboardMenuItems[index]).equal($elem.text());
    });
    cy.get('[data-cy="navigation-category-1_L2_SA_StakeHolderAdminPages"]').click();
    cy.get(`[data-cy="navigation-category-1_L2_SA_StakeHolderAdminPages"] ux-side-menu-item`).should('have.length', 3);
    const expectedMenuItems = ['Dashboard Management', 'Resources', 'Roles'];
    cy.get('[data-cy*="StakeHolderAdminPages"]').find(`ux-side-menu-item button span[id*='fourth']`).each(($elem, index) => {
      expect(expectedMenuItems[index]).equal($elem.text());
    });
    cy.get('[data-cy="navigation-category-__base_setup_config"]').click();
    checkForSmtpConfigurationAccess();
    cy.bvdUiLogout();
    // admin User of Provider should not have the query
    loginAndOpenDataCollector('/', 'admin', 'Control@123');
    cy.frameLoaded('[data-cy="mondrian-iframe-dataCollector"]').iframeCustom().then($contentFrame => {
      cy.wait(['@getTOC']);
      cy.wrap($contentFrame).find('#topLevelAlert').should('not.exist');
      cy.wrap($contentFrame).find('div.opr-tree-view-control-area').should('not.contain', 'testQueryName');
    });
    cy.get('[data-cy="navigation-category-__base_setup_config"]').click();
    cy.get('[data-cy=navigation-menuEntry-4_L3_SA_Setting]').click();
    let apiKey;
    cy.frameLoaded('[data-cy="mondrian-iframe-apiKey"]').iframeCustom().then($contentFrame => {
      cy.wait(['@getTOC', '@reportingPageloadSystem']);
      shared.waitForDataCalls({ name: '@reportingPageloadUser', count: 3 });
      cy.wrap($contentFrame).find('[data-cy="new_api_key"]').click();
      cy.wrap($contentFrame).find('button[type="submit"]');
      cy.wrap($contentFrame).find('button[type="submit"]').click();
      cy.wait('@generateNewApiKey');
      cy.wrap($contentFrame).find('#api_key').invoke('text').then(val => {
        apiKey = val;
      });
    });
    cy.bvdUiLogout();
    // Admin User of Customer4 should not have the query
    loginAndOpenDataCollector('?tenant=Customer4', 'customer4Admin@microfocus.com', 'Control@123');
    cy.frameLoaded('[data-cy="mondrian-iframe-dataCollector"]').iframeCustom().then($contentFrame => {
      cy.wait(['@getTOC', '@reportingPageloadUser']);
      cy.wrap($contentFrame).find('#topLevelAlert').should('not.exist');
      cy.wait(['@reportingPageloadUser']);
      cy.wrap($contentFrame).find('div.opr-tree-view-control-area').should('not.contain', 'testQueryName');
    });
    cy.get('[data-cy="navigation-category-__base_setup_config"]').click();
    cy.get('[data-cy=navigation-menuEntry-4_L3_SA_Setting]').click();
    cy.frameLoaded('[data-cy="mondrian-iframe-apiKey"]').iframeCustom().then($contentFrame => {
      cy.wait(['@getTOC']);
      shared.waitForDataCalls({ name: '@reportingPageloadUser', count: 3 });
      shared.waitForDataCalls({ name: '@reportingPageloadSystem', count: 2 });
      cy.wrap($contentFrame).find('#api_key').should('not.contain.text', apiKey);
    });
    cy.bvdUiLogout();
    // Login with admin user of Customer3 Tenant to check and delete Created Query
    loginAndOpenDataCollector('?tenant=Customer3', 'customer3Admin@microfocus.com', 'Control@123');
    cy.frameLoaded('[data-cy="mondrian-iframe-dataCollector"]').iframeCustom().then($contentFrame => {
      cy.wait(['@getTOC', '@reportingPageloadUser']);
      cy.wrap($contentFrame).find('#topLevelAlert').should('not.exist');
      cy.wrap($contentFrame).find('div.list-title-container div').should('not.contain', 'textQuery');
      cy.wrap($contentFrame).find('div.list-title-container div').contains('testQueryName').click();
      cy.wrap($contentFrame).find(`[data-cy='buttonDeleteSelectedQueries']`).click();
      cy.wrap($contentFrame).find('div.modal-footer button#btnDialogSubmit').should('be.visible').click();
      cy.wrap($contentFrame).find('.spinner').should('not.exist');
    });
    cy.bvdUiLogout();
  });

  it('admin user of Provider should be able to make changes to the DB Conn Settings of Customer 4', () => {
    loginAndOpenDataCollector('?target_tenant=Customer4', 'admin', 'Control@123');
    cy.frameLoaded('[data-cy="mondrian-iframe-dataCollector"]').iframeCustom().then($contentFrame => {
      cy.wrap($contentFrame).find('[data-cy="dropdown-more"]').should('be.visible');
      cy.wrap($contentFrame).find('[data-cy="dropdown-more"]').click();
      cy.wrap($contentFrame).find('[data-cy="optionDBSettings"]').click();
      cy.wrap($contentFrame).find('input[name="hostName"]').should('be.visible');
      cy.wrap($contentFrame).find('input[name="hostName"]').clear();
      cy.wrap($contentFrame).find('input[name="hostName"]').click();
      cy.wrap($contentFrame).find('input[name="hostName"]').type(Cypress.env('VERTICA_HOST'));
      cy.wrap($contentFrame).find('input[name="port"]').clear();
      cy.wrap($contentFrame).find('input[name="port"]').type(Cypress.env('VERTICA_PORT'));
      cy.wrap($contentFrame).find('[data-cy="enableTLSCheckbox"]').should('not.be.checked');
      cy.wrap($contentFrame).find('input[name="dbName"]').clear();
      cy.wrap($contentFrame).find('input[name="dbName"]').type('opsadb');
      cy.wrap($contentFrame).find('input[name="dbUser"]').clear();
      cy.wrap($contentFrame).find('input[name="dbUser"]').type('dbadmin');
      cy.wrap($contentFrame).find('input[name="dbPassword"]').clear();
      cy.wrap($contentFrame).find('input[name="dbPassword"]').type('installed');
      cy.wrap($contentFrame).find('input[name="dbPasswordConfirm"]').clear();
      cy.wrap($contentFrame).find('input[name="dbPasswordConfirm"]').type('installed');
      cy.wrap($contentFrame).find('[data-cy="buttonTestConnection"]').click();
      cy.wrap($contentFrame).find('.alert.testConnectionAlert.alert-success').should('be.visible');
      cy.wrap($contentFrame).find('.alert.testConnectionAlert.alert-success').contains('Test connection succeeded');
      cy.wrap($contentFrame).find('.spinner').should('not.exist');
      cy.wrap($contentFrame).find('[data-cy="buttonSaveDBSetting"]').click();
      cy.wrap($contentFrame).find('.spinner').should('not.exist');
      cy.wrap($contentFrame).find('[data-cy="dropdown-more"]').click();
      cy.wrap($contentFrame).find(`[data-cy='dropdown-more'] li:nth-child(2) > a`).click();
      cy.wrap($contentFrame).find('div.modal-content').should('be.visible');
      cy.wrap($contentFrame).find('input#importQueriesFileInput').attachFile(`foundation/bvdOnUIF/dataCollectors_Customer4.bvddc`);
      cy.wrap($contentFrame).find('div.modal-footer button').should('be.visible');
      cy.wrap($contentFrame).find('div.modal-footer button').contains('Ok').click();
      cy.wrap($contentFrame).find('.spinner').should('not.exist');
      cy.wrap($contentFrame).find('div.modal-footer button').should('be.visible');
      cy.wrap($contentFrame).find('div.modal-footer button').should('be.visible');
      cy.wrap($contentFrame).find('div.modal-footer button').contains('Ok').click();
      cy.wrap($contentFrame).find('.spinner').should('not.exist');
      cy.wrap($contentFrame).find('div.list-title-container div').contains('textQuery').click();
      cy.wrap($contentFrame).find(`[data-cy='buttonDeleteSelectedQueries']`).click();
      cy.wrap($contentFrame).find('div.modal-footer button#btnDialogSubmit').should('be.visible').click();
      cy.wrap($contentFrame).find('.spinner').should('not.exist');
    });
    cy.get('[data-cy="navigation-category-0_L2_SA_StakeHolderDashboards"]').should('not.be.visible');
    cy.bvdUiLogout();
  });

  it('Login with admin user of Customer1 Tenant to check DB Settings is disabled', () => {
    loginAndOpenDataCollector('?tenant=Customer1', 'customer1Admin@microfocus.com', 'Control@123');
    cy.frameLoaded('[data-cy="mondrian-iframe-dataCollector"]').iframeCustom().then($contentFrame => {
      cy.wrap($contentFrame).find('[data-cy="dropdown-more"]').should('not.exist');
      cy.wrap($contentFrame).find('#buttonDBSetting').should('not.exist');
    });
    cy.bvdUiLogout();
  });

  it('Login with Target Tenant as Customer3 and Tenant as Customer4', () => {
    cy.visit('?target_tenant=Customer3&tenant=Customer4');
    cy.get('#username').type('customer4Admin@microfocus.com');
    cy.get('#password').type('Control@123');
    cy.get('#submit').should('be.visible').click();
    cy.get('body').should('contain', 'The user is not authorized for cross tenant access using target_tenant');
  });

  it('Login with Target Tenant as Customer3 and Non Admin User of Provider', () => {
    cy.visit('?target_tenant=Customer3');
    cy.get('#username').type('bvdOnUIFUser');
    cy.get('#password').type('control@123D');
    cy.get('#submit').should('be.visible').click();
    cy.get('body').should('contain', 'The user is not authorized for cross tenant access using target_tenant');
  });
});
