/* eslint-disable camelcase */
// <reference types="Cypress" />
const shared = require('../../shared/shared');
import 'cypress-file-upload';
import 'cypress-iframe';
const role = require('../../../../support/reporting/restUtils/role');
const adminUser = 'customer3Admin@microfocus.com';
const adminPwd = 'Control@123';
const tenantName = 'Customer3';
const nonAdminUserName = 'bvdOnUIFUserCustomer3';
const nonAdminUserPwd = 'control@123D';
let nonAdminWithDataCollectorRole;
let permissionArray;

const checkForActionsOnDashboard = ($iframe, dashboardId) => {
  cy.wrap($iframe).find(`button#edit-${dashboardId}`);
  cy.wrap($iframe).find(`button#delete-${dashboardId}`);
};

const loginToCustomer3 = (user, pwd) => {
  cy.visit('?tenant=Customer3');
  cy.get('#username').type(user);
  cy.get('#password').type(pwd);
  cy.get('#submit').should('be.visible').click();
  cy.wait(['@getTOC']);
  cy.get('.ux-side-menu-toggle').click();
};

describe('Test Non Admin Permissions for predefined query Across Tenants', shared.defaultTestOptions, () => {
  beforeEach(() => {
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pages/toc*`
    }).as('getTOC');
    cy.intercept({ method: 'POST', url: `${Cypress.env('BVD_CONTEXT_ROOT')}/rest/${Cypress.env('API_VERSION')}/dataCollector/test?format=json` }).as('runDataQuery');
    cy.intercept({ method: 'POST', url: `${Cypress.env('BVD_CONTEXT_ROOT')}/rest/${Cypress.env('API_VERSION')}/dataCollector?format=json` }).as('confirmQuery');
    cy.intercept({ method: 'GET', url: `${Cypress.env('BVD_CONTEXT_ROOT')}/rest/${Cypress.env('API_VERSION')}/dataCollector?format=json` }).as('getQueryList');
    cy.intercept({ method: 'POST', url: `${Cypress.env('BVD_CONTEXT_ROOT')}/rest/${Cypress.env('API_VERSION')}/dataCollector` }).as('overWriteDCConfirm');
    cy.intercept(`${shared.reportingContextRoot}/rest/${Cypress.env('API_VERSION')}/system`).as('reportingPageloadSystem');
    cy.intercept(`${shared.reportingContextRoot}/rest/${Cypress.env('API_VERSION')}/session/user`).as('reportingPageloadUser');
    cy.intercept(`${shared.reportingContextRoot}/rest/${Cypress.env('API_VERSION')}/dashboard/?type=dashboards,templates`).as('dashboardListLoad');
    loginToCustomer3(adminUser, adminPwd);
  });

  afterEach(() => {
    cy.bvdUiLogout();
    loginToCustomer3(adminUser, adminPwd);
    role.roleDeletion(nonAdminWithDataCollectorRole, true, adminUser, adminPwd, tenantName);
    cy.bvdUiLogout();
  });

  it('Non Admin User With predefined query Edit Permission', () => {
    permissionArray = [{ operation_key: 'View', resource_key: 'default_action<>Group-__bvd_data_collector' }];
    role.roleCreationWithPermissionArray('DefaultBvdRole', 'DefaultBvdRole', permissionArray, true, adminUser, adminPwd, tenantName).then(nonAdminRoleId => {
      nonAdminWithDataCollectorRole = nonAdminRoleId;
      cy.bvdUiLogout();
      loginToCustomer3(nonAdminUserName, nonAdminUserPwd);
      cy.get('[data-cy="navigation-category-1_L0_SA_Administration"] > .ux-side-menu-item').click();
      cy.wait('@getTOC');
      cy.get('[data-cy="navigation-category-0_L1_SA_AdminDashboards"] > .ux-side-menu-item').click();
      cy.wait('@getTOC');
      cy.get('[data-cy="navigation-category-0_L1_SA_AdminDashboards"] ux-side-menu-item').should('have.length', 3);
      const expectedDashboardMenuItems = ['Scheduled Reports', 'Predefined Queries', 'Stakeholder Dashboards & Reports'];
      cy.get('[data-cy="navigation-category-0_L1_SA_AdminDashboards"] ux-side-menu-item button div span').each(($elem, index) => {
        expect(expectedDashboardMenuItems[index]).equal($elem.text());
      });
      cy.get('[data-cy="navigation-category-1_L2_SA_StakeHolderAdminPages"]').click();
      cy.get(`[data-cy="navigation-category-1_L2_SA_StakeHolderAdminPages"] ux-side-menu-item`).should('have.length', 2);
      const expectedMenuItems = ['Dashboard Management', 'Resources'];
      cy.get('[data-cy*="StakeHolderAdminPages"]').find(`ux-side-menu-item button span[id*='fourth']`).each(($elem, index) => {
        expect(expectedMenuItems[index]).equal($elem.text());
      });
      cy.get('[data-cy="navigation-menuEntry-0_L3_SA_Dashboard"]').click();
      cy.wait(['@reportingPageloadUser', '@reportingPageloadSystem', '@getTOC']);
      cy.wait('@reportingPageloadUser');
      cy.frameLoaded('[data-cy="mondrian-iframe-Dashboards"]').iframeCustom().then($dataCollectorIframe => {
        cy.wrap($dataCollectorIframe).find('[data-cy="no-permission-dashboards"]').should('contain', 'You are not allowed to access this part of BVD!');
      });
      cy.get('[data-cy="navigation-menuEntry-2_L3_SA_DataCollector"]').click();
      cy.frameLoaded('[data-cy="mondrian-iframe-dataCollector"]').iframeCustom().then($dataCollectorIframe => {
        cy.wait('@reportingPageloadUser');
        cy.wait(['@reportingPageloadUser', '@getTOC']);
        cy.wrap($dataCollectorIframe).find('#topLevelAlert').should('not.exist');
        cy.wrap($dataCollectorIframe).find('.dropdown #dropdownNew1').first().click();
        cy.wrap($dataCollectorIframe).find('[data-cy="newDataQuery"]').should('be.visible').click();
        cy.wrap($dataCollectorIframe).find('#name-input_name').should('be.visible').click();
        cy.wrap($dataCollectorIframe).find('#name-input_name').type('dataQueryName');
        cy.wrap($dataCollectorIframe).find('#description-input').click();
        cy.wrap($dataCollectorIframe).find('#description-input').type('querydescription');
        cy.wrap($dataCollectorIframe).find(`input.opr-tag-bar-input[type='text']`).click();
        cy.wrap($dataCollectorIframe).find(`input.opr-tag-bar-input[type='text']`).type(`querydescription{enter}`);
        cy.wrap($dataCollectorIframe).find('#queryformat-default').click();
        cy.wrap($dataCollectorIframe).find('#query-text').should('be.visible').click();
        cy.wrap($dataCollectorIframe).find('#query-text').type(`select * from Machines1 where CPU <= 500 and ram < 500`, { parseSpecialCharSequences: false });
        cy.wrap($dataCollectorIframe).find('#buttonExecuteQuery').should('be.visible');
        cy.wrap($dataCollectorIframe).find('#buttonExecuteQuery').click();
        cy.wait('@runDataQuery');
        cy.wrap($dataCollectorIframe).find('.spinner').should('not.exist');
        cy.wrap($dataCollectorIframe).find('.col-sm-12 .queryResultData table tr th').should('have.length', 5);
        cy.wrap($dataCollectorIframe).find('.col-sm-12 .queryResultData table tr th').each($elem => {
          expect(['hostname', 'CPU', 'ram', 'id', 'category']).contains($elem.text().trim());
        });
        cy.wrap($dataCollectorIframe).find('#buttonConfirm').click();
        cy.wait('@confirmQuery');
        cy.wrap($dataCollectorIframe).find('.spinner').should('not.exist');
        cy.wrap($dataCollectorIframe).find('[data-cy="dropdown-more"]').click();
        cy.wait('@getQueryList');
        cy.wrap($dataCollectorIframe).find('[data-cy="optionDBSettings"]').should('not.exist');
        cy.wrap($dataCollectorIframe).find(`[data-cy='dropdown-more'] li:nth-child(2) > a`).click();
        cy.wrap($dataCollectorIframe).find('div.modal-content').should('be.visible');
        cy.wrap($dataCollectorIframe).find('input#importQueriesFileInput').attachFile(`foundation/bvdOnUIF/dataCollectors.bvddc`);
        cy.wrap($dataCollectorIframe).find('div.modal-footer button').should('be.visible');
        cy.wrap($dataCollectorIframe).find('div.modal-footer button').contains('Ok').click();
        cy.wait('@overWriteDCConfirm');
        cy.wrap($dataCollectorIframe).find('.spinner').should('not.exist');
        cy.wrap($dataCollectorIframe).find('div.modal-footer button').should('be.visible');
        cy.wrap($dataCollectorIframe).find('div.modal-footer button').contains('Overwrite').click();
        cy.wait(['@overWriteDCConfirm']);
        cy.wrap($dataCollectorIframe).find('div.modal-footer button').should('be.visible');
        cy.wrap($dataCollectorIframe).find('div.modal-footer button').contains('Ok').click();
        cy.wait('@getQueryList');
        cy.wrap($dataCollectorIframe).find('.spinner').should('not.exist');
        cy.wrap($dataCollectorIframe).find('div.list-title-container div').contains('dataQueryName').click();
        cy.wrap($dataCollectorIframe).find('.spinner').should('not.exist');
        cy.wrap($dataCollectorIframe).find(`button.btn-secondary[title='Delete']`).should('be.visible').click();
        cy.wrap($dataCollectorIframe).find('div.modal-footer button#btnDialogSubmit').should('be.visible').click();
        cy.wrap($dataCollectorIframe).find('.spinner').should('not.exist');
      });
    });
  });

  it('Non Admin User With DataCollector Edit Permission And Dashboard View Permission', () => {
    permissionArray = [{
      operation_key: 'view',
      resource_key: 'omi-event'
    }, {
      operation_key: 'View',
      resource_key: 'default_action<>Group-__bvd_data_collector'
    }];
    role.roleCreationWithPermissionArray('DefaultBvdRole', 'DefaultBvdRole', permissionArray, true, adminUser, adminPwd, tenantName).then(nonAdminRoleId => {
      nonAdminWithDataCollectorRole = nonAdminRoleId;
      cy.bvdUiLogout();
      loginToCustomer3(nonAdminUserName, nonAdminUserPwd);
      cy.get('[data-cy="navigation-category-1_L0_SA_Administration"] > .ux-side-menu-item').click();
      cy.get('[data-cy="navigation-category-0_L1_SA_AdminDashboards"] > .ux-side-menu-item').click();
      cy.get('[data-cy="navigation-category-0_L1_SA_AdminDashboards"] ux-side-menu-item').should('have.length', 3);
      const expectedDashboardMenuItems = ['Scheduled Reports', 'Predefined Queries', 'Stakeholder Dashboards & Reports'];
      cy.get('[data-cy="navigation-category-0_L1_SA_AdminDashboards"] ux-side-menu-item button div span').each(($elem, index) => {
        expect(expectedDashboardMenuItems[index]).equal($elem.text());
      });
      cy.get('[data-cy="navigation-category-1_L2_SA_StakeHolderAdminPages"]').click();
      cy.get(`[data-cy="navigation-category-1_L2_SA_StakeHolderAdminPages"] ux-side-menu-item`).should('have.length', 2);
      const expectedMenuItems = ['Dashboard Management', 'Resources'];
      cy.get('[data-cy*="StakeHolderAdminPages"]').find(`ux-side-menu-item button span[id*='fourth']`).each(($elem, index) => {
        expect(expectedMenuItems[index]).equal($elem.text());
      });
      cy.get('[data-cy="navigation-menuEntry-0_L3_SA_Dashboard"]').click();
      cy.wait(['@reportingPageloadUser', '@reportingPageloadSystem', '@reportingPageloadUser']);
      cy.frameLoaded('[data-cy="mondrian-iframe-Dashboards"]').iframeCustom().then($iframe => {
        cy.wrap($iframe).find('[data-cy="no-permission-dashboards"]').should('contain', 'You are not allowed to access this part of BVD!');
      });
      cy.get('[data-cy="navigation-menuEntry-2_L3_SA_DataCollector"]').click();
      cy.frameLoaded('[data-cy="mondrian-iframe-dataCollector"]').iframeCustom().then($dataCollectorIframe => {
        cy.wrap($dataCollectorIframe).find('#topLevelAlert').should('not.exist');
      });
    });
  });

  it('Non Admin User With DataCollector Edit Permission And Dashboard Not Assigned to Category View Permission', () => {
    permissionArray = [{
      operation_key: 'view',
      resource_key: 'omi-event<>not-assigned'
    }, {
      operation_key: 'View',
      resource_key: 'default_action<>Group-__bvd_data_collector'
    }];
    role.roleCreationWithPermissionArray('DefaultBvdRole', 'DefaultBvdRole', permissionArray, true, adminUser, adminPwd, tenantName).then(nonAdminRoleId => {
      nonAdminWithDataCollectorRole = nonAdminRoleId;
      cy.bvdUiLogout();
      loginToCustomer3(nonAdminUserName, nonAdminUserPwd);
      cy.get('[data-cy="navigation-category-1_L0_SA_Administration"] > .ux-side-menu-item').click();
      cy.get('[data-cy="navigation-category-0_L1_SA_AdminDashboards"] > .ux-side-menu-item').click();
      cy.get('[data-cy="navigation-category-0_L1_SA_AdminDashboards"] ux-side-menu-item').should('have.length', 3);
      const expectedDashboardMenuItems = ['Scheduled Reports', 'Predefined Queries', 'Stakeholder Dashboards & Reports'];
      cy.get('[data-cy="navigation-category-0_L1_SA_AdminDashboards"] ux-side-menu-item button div span').each(($elem, index) => {
        expect(expectedDashboardMenuItems[index]).equal($elem.text());
      });
      cy.get('[data-cy="navigation-category-1_L2_SA_StakeHolderAdminPages"]').click();
      cy.get(`[data-cy="navigation-category-1_L2_SA_StakeHolderAdminPages"] ux-side-menu-item`).should('have.length', 2);
      const expectedMenuItems = ['Dashboard Management', 'Resources'];
      cy.get('[data-cy*="StakeHolderAdminPages"]').find(`ux-side-menu-item button span[id*='fourth']`).each(($elem, index) => {
        expect(expectedMenuItems[index]).equal($elem.text());
      });
      cy.get('[data-cy="navigation-menuEntry-0_L3_SA_Dashboard"]').click();
      cy.wait(['@reportingPageloadUser', '@reportingPageloadSystem', '@reportingPageloadUser']);
      cy.frameLoaded('[data-cy="mondrian-iframe-Dashboards"]').iframeCustom().then($iframe => {
        cy.wrap($iframe).find('[data-cy="no-permission-dashboards"]').should('contain', 'You are not allowed to access this part of BVD!');
      });
      cy.get('[data-cy="navigation-menuEntry-2_L3_SA_DataCollector"]').click();
      cy.frameLoaded('[data-cy="mondrian-iframe-dataCollector"]').iframeCustom().then($dataCollectorIframe => {
        cy.wrap($dataCollectorIframe).find('#topLevelAlert').should('not.exist');
      });
      cy.get('[data-cy="navigation-category-0_L2_SA_StakeHolderDashboards"]').click();
      cy.url().then(urlString => {
        const urlObject = new URL(urlString);
        if (urlObject.hostname === 'localhost') {
          cy.get(`span[id*='secondLevelItem']`).contains('documentation3');
        } else {
          cy.get(`span[id*='secondLevelItem']`).contains('Welcome');
        }
      });
    });
  });

  it('Non Admin User With DataCollector Edit Permission And Dashboard Full Permission', () => {
    permissionArray = [{
      operation_key: 'full-control',
      resource_key: 'omi-event'
    }, {
      operation_key: 'View',
      resource_key: 'default_action<>Group-__bvd_data_collector'
    }];
    role.roleCreationWithPermissionArray('DefaultBvdRole', 'DefaultBvdRole', permissionArray, true, adminUser, adminPwd, tenantName).then(nonAdminRoleId => {
      nonAdminWithDataCollectorRole = nonAdminRoleId;
      cy.bvdUiLogout();
      loginToCustomer3(nonAdminUserName, nonAdminUserPwd);
      cy.get('[data-cy="navigation-category-1_L0_SA_Administration"] > .ux-side-menu-item').click();
      cy.get('[data-cy="navigation-category-0_L1_SA_AdminDashboards"] > .ux-side-menu-item').click();
      cy.get('[data-cy="navigation-category-0_L1_SA_AdminDashboards"] ux-side-menu-item').should('have.length', 3);
      const expectedDashboardMenuItems = ['Scheduled Reports', 'Predefined Queries', 'Stakeholder Dashboards & Reports'];
      cy.get('[data-cy="navigation-category-0_L1_SA_AdminDashboards"] ux-side-menu-item button div span').each(($elem, index) => {
        expect(expectedDashboardMenuItems[index]).equal($elem.text());
      });
      cy.get('[data-cy="navigation-category-1_L2_SA_StakeHolderAdminPages"]').click();
      cy.get(`[data-cy="navigation-category-1_L2_SA_StakeHolderAdminPages"] ux-side-menu-item`).should('have.length', 2);
      const expectedMenuItems = ['Dashboard Management', 'Resources'];
      cy.get('[data-cy*="StakeHolderAdminPages"]').find(`ux-side-menu-item button span[id*='fourth']`).each(($elem, index) => {
        expect(expectedMenuItems[index]).equal($elem.text());
      });
      cy.get('[data-cy="navigation-menuEntry-0_L3_SA_Dashboard"]').click();
      cy.wait(['@reportingPageloadUser', '@reportingPageloadSystem', '@reportingPageloadUser']);
      cy.url().then(urlString => {
        const urlObject = new URL(urlString);
        cy.frameLoaded('[data-cy="mondrian-iframe-Dashboards"]').iframeCustom().then($iframe => {
          if (urlObject.hostname === 'localhost') {
            checkForActionsOnDashboard($iframe, 'documentation3');
          } else {
            checkForActionsOnDashboard($iframe, 'Welcome');
          }
        });
        cy.get('[data-cy="navigation-menuEntry-2_L3_SA_DataCollector"]').click();
        cy.frameLoaded('[data-cy="mondrian-iframe-dataCollector"]').iframeCustom().then($dataCollectorIframe => {
          cy.wait(['@getTOC', '@reportingPageloadUser']);
          cy.wrap($dataCollectorIframe).find('#topLevelAlert').should('not.exist');
          cy.wrap($dataCollectorIframe).find('div.list-title-container div').contains('textQuery').click();
          cy.wrap($dataCollectorIframe).find(`[data-cy='buttonDeleteSelectedQueries']`).click();
          cy.wrap($dataCollectorIframe).find('div.modal-footer button#btnDialogSubmit').should('be.visible').click();
          cy.wrap($dataCollectorIframe).find('.spinner').should('not.exist');
        });
      });
      cy.get('[data-cy="navigation-category-0_L2_SA_StakeHolderDashboards"]').click();
      cy.url().then(urlString => {
        const urlObject = new URL(urlString);
        if (urlObject.hostname === 'localhost') {
          cy.get(`span[id*='secondLevelItem']`).contains('documentation3');
        } else {
          cy.get(`span[id*='secondLevelItem']`).contains('Welcome');
        }
      });
    });
  });
});
