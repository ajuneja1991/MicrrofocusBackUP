// <reference types="Cypress" />
/* eslint-disable camelcase */
const shared = require('../../shared/shared');
import 'cypress-iframe';
const role = require('../../../../support/reporting/restUtils/role');
const nonAdminuserName = 'bvdOnUIFUser';
const nonAdminuserPwd = 'control@123D';

const checkForActionsOnDashboard = ($iframe, dashboardId) => {
  cy.wrap($iframe).find(`button#edit-${dashboardId}`);
  cy.wrap($iframe).find(`button#delete-${dashboardId}`);
};

describe('BVD on UIF for Non Admin', shared.defaultTestOptions, () => {
  // There is not even a single menu entry with the full control permission in the system.
  function noOpenEditMode() {
    cy.get('[data-cy="side-nav-more-button"]').should('exist');
    cy.get('[data-cy="open-edit-mode-button"]').should('not.exist');
    cy.get('[data-cy="close-edit-mode-button"]').should('not.exist');
  }
  let roleId = '';
  function cleanupRole(id) {
    if (id) {
      role.roleDeletion(id, true);
    }
  }

  beforeEach(() => {
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pages/toc*`
    }).as('getTOC');
    cy.intercept({ method: 'POST', url: `${Cypress.env('BVD_CONTEXT_ROOT')}/rest/${Cypress.env('API_VERSION')}/dataCollector/test?format=json` }).as('runDataQuery');
    cy.intercept(`${shared.reportingContextRoot}/rest/${Cypress.env('API_VERSION')}/system`).as('reportingPageloadSystem');
    cy.intercept(`${shared.reportingContextRoot}/rest/${Cypress.env('API_VERSION')}/session/user`).as('reportingPageloadUser');
    cy.intercept(`${shared.reportingContextRoot}/rest/${Cypress.env('API_VERSION')}/dashboard/?type=dashboards,templates`).as('dashboardListLoad');
    cleanupRole(roleId);
    cy.bvdLogout();
    cy.clearCookies();
  });

  it('non-admin user test for embedded BVD', () => {
    cy.bvdLogin(nonAdminuserName, nonAdminuserPwd);
    cy.visit('/');
    cy.wait(['@getTOC']);
    cy.get('.ux-side-menu-toggle').click();
    noOpenEditMode(); // non-admin users should not see edit of menu entries

    cy.get('[data-cy="firstLevelItem-1_L0_SA_Administration"]').click();
    cy.get('[data-cy="navigation-category-0_L1_SA_AdminDashboards"] > .ux-side-menu-item').click();
    cy.get('[data-cy="navigation-category-__base_setup_config"] > .ux-side-menu-item').click();
    cy.get('[data-cy="navigation-menuEntry-1_L3_SA_Role"] > .ux-side-menu-item').should('not.exist');
    cy.get('[data-cy="navigation-menuEntry-4_L3_SA_Setting"]').should('not.exist');
    cy.get('[data-cy="navigation-menuEntry-0_L3_SA_User_setting"]').click();

    cy.frameLoaded('[data-cy="mondrian-iframe-userSetting"]').iframeCustom().then($iframe => {
      cy.wrap($iframe).should('contain', 'Account');
      cy.wrap($iframe).find('[data-cy="label-timezone"]').should('contain', 'Time zone');
      cy.get('[data-cy="navigation-category-0_L1_SA_AdminDashboards"]').click();
      cy.get('[data-cy="navigation-menuEntry-2_L3_SA_DataCollector"]').click();
      cy.frameLoaded('[data-cy="mondrian-iframe-dataCollector"]').iframeCustom().then($dataCollectorIframe => {
        cy.wrap($dataCollectorIframe).find('#topLevelAlert');
      });
    });
  });

  it('non-admin with predefined query permission in embedded BVD', () => {
    role.roleCreation('DefaultBvdRole', 'DefaultBvdRole', '', 'View', 'default_action<>Group-__bvd_data_collector', true).then(id => {
      roleId = id;
      cy.bvdLogout();
      cy.bvdLogin(nonAdminuserName, nonAdminuserPwd);
      cy.visit('/');
      cy.wait(['@getTOC']);
      cy.get('.ux-side-menu-toggle').click();
      cy.get('[data-cy="firstLevelItem-1_L0_SA_Administration"]').click();
      cy.get('[data-cy="navigation-category-0_L1_SA_AdminDashboards"] > .ux-side-menu-item').click();
      cy.get('[data-cy="navigation-menuEntry-2_L3_SA_DataCollector"] > .ux-side-menu-item').click();
      cy.frameLoaded('[data-cy="mondrian-iframe-dataCollector"]').iframeCustom().then($dataCollectorIframe => {
        cy.wrap($dataCollectorIframe).find('#topLevelAlert').should('not.exist');
      });
    });
  });

  it('Non admin user should see the error banner when navigating to dashboards page', () => {
    role.roleCreation('DefaultBvdRole', 'DefaultBvdRole', '', 'view', '', true).then(id => {
      roleId = id;
      cy.bvdLogout();
      cy.bvdLogin(nonAdminuserName, nonAdminuserPwd);
      cy.visit('/');
      cy.wait(['@getTOC']);
      cy.get('.ux-side-menu-toggle').click();
      cy.get('[data-cy="firstLevelItem-1_L0_SA_Administration"]').click();
      cy.get('[data-cy="navigation-category-0_L1_SA_AdminDashboards"] > .ux-side-menu-item').click();
      cy.get('[data-cy="navigation-category-1_L2_SA_StakeHolderAdminPages"]').click();
      cy.get('[data-cy="navigation-menuEntry-0_L3_SA_Dashboard"]').click();
      cy.wait(['@reportingPageloadUser', '@reportingPageloadSystem', '@reportingPageloadUser']);
      cy.frameLoaded('[data-cy="mondrian-iframe-Dashboards"]').iframeCustom().then($iframe => {
        cy.wrap($iframe).find('[data-cy="no-permission-dashboards"]').should('contain', 'You are not allowed to access this part of BVD!');
      });
    });
  });

  it('Non admin user with full control permissions should be able to add, delete or edit the dashboard on dashboards page in UIF', () => {
    role.roleCreation('DefaultBvdRole', 'DefaultBvdRole', '', 'full-control', 'omi-event', true).then(id => {
      roleId = id;
      cy.bvdLogout();
      cy.bvdLogin(nonAdminuserName, nonAdminuserPwd);
      cy.visit('/');
      cy.wait(['@getTOC']);
      cy.get('.ux-side-menu-toggle').click();
      cy.get('[data-cy="firstLevelItem-1_L0_SA_Administration"]').click();
      cy.get('[data-cy="navigation-category-0_L1_SA_AdminDashboards"] > .ux-side-menu-item').click();
      cy.get('[data-cy="navigation-category-1_L2_SA_StakeHolderAdminPages"]').click();
      cy.get(`[data-cy="navigation-category-1_L2_SA_StakeHolderAdminPages"] ux-side-menu-item`).should('have.length', 2);
      const expectedMenuItems = ['Dashboard Management', 'Resources'];
      cy.get('[data-cy*="StakeHolderAdminPages"]').find(`ux-side-menu-item button span[id*='fourth']`).each(($elem, index) => {
        expect(expectedMenuItems[index]).equal($elem.text());
      });
      cy.get('[data-cy="navigation-menuEntry-2_L3_SA_DataCollector"]').click();
      cy.frameLoaded('[data-cy="mondrian-iframe-dataCollector"]').iframeCustom().then($dataCollectorIframe => {
        cy.wrap($dataCollectorIframe).find('div.alert').should('contain', `You don't have permissions to access predefined queries. Contact your administrator to get permissions assigned.`);
      });
      cy.get('[data-cy="navigation-category-1_L2_SA_StakeHolderAdminPages"] > .ux-side-menu-item').click();
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
      });
    });
  });

  it('Non admin user with specific permission should not be able to see the Details in Settings', () => {
    const permissionArrayForUIF = [
      { operation_key: 'View', resource_key: 'default_action<>All' },
      { operation_key: 'View', resource_key: 'menu<>All' }
    ];
    role.roleCreationWithPermissionArray('NonAdminPage', 'NonAdminPage', permissionArrayForUIF, false).then(nonAdminRoleId => {
      cy.bvdLogout();
      cy.bvdLogin('nonAdminTestUser', nonAdminuserPwd);
      cy.visit('/');
      shared.waitForDataCalls({ name: '@getTOC', count: 2 });
      cy.get('.ux-side-menu-toggle').click();
      cy.get('[data-cy="navigation-category-1_L0_SA_Administration"] > .ux-side-menu-item').click();
      cy.get('[data-cy="navigation-category-0_L1_SA_AdminDashboards"] > .ux-side-menu-item').click();
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
      cy.get('[data-cy="navigation-category-__base_setup_config"] > .ux-side-menu-item').click();
      cy.get('[data-cy=navigation-menuEntry-4_L3_SA_Setting]').click();
      cy.frameLoaded('[data-cy="mondrian-iframe-apiKey"]').iframeCustom().then($contentFrame => {
        cy.wait(['@getTOC']);
        cy.wrap($contentFrame).find('div.alert').should('contain', 'You are not allowed to access this part of BVD!');
      });
      cy.frameLoaded('[data-cy="mondrian-iframe-SystemSettings"]').iframeCustom().then($iframe => {
        cy.wrap($iframe).find('div.alert').should('contain', 'You are not allowed to access this part of BVD!');
      });
      cy.bvdUiLogout();
      role.roleDeletion(nonAdminRoleId, false);
    });
  });
});
