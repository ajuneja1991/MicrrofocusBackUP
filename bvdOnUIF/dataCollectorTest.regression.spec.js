/* eslint-disable camelcase */
// <reference types="Cypress" />
const shared = require('../../shared/shared');
import 'cypress-file-upload';
import 'cypress-iframe';
import { uploadFileRequest } from '../../../../support/reporting/restUtils/uploadFile';
const role = require('../../../../support/reporting/restUtils/role');
const dataCollector = require('../../../../support/reporting/restUtils/dataCollector');
const nonAdminuserName = 'nonAdminTestUser';
const nonAdminuserPwd = 'control@123D';
let nonAdminWithDataCollectorRole;
let permissionArray;

const checkForActionsOnDashboard = ($iframe, dashboardId) => {
  cy.wrap($iframe).find(`button#edit-${dashboardId}`);
  cy.wrap($iframe).find(`button#delete-${dashboardId}`);
};

describe('Test DataCollector on UIF', shared.defaultTestOptions, () => {
  beforeEach(() => {
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pages/toc*`
    }).as('getTOC');
    cy.intercept({ method: 'POST', url: `${Cypress.env('BVD_CONTEXT_ROOT')}/rest/${Cypress.env('API_VERSION')}/dataCollector/test?format=json` }).as('runDataQuery');
    cy.intercept(`${shared.reportingContextRoot}/rest/${Cypress.env('API_VERSION')}/system*`).as('reportingPageloadSystem');
    cy.intercept(`${shared.reportingContextRoot}/rest/${Cypress.env('API_VERSION')}/session/user`).as('reportingPageloadUser');
    cy.intercept(`${shared.reportingContextRoot}/rest/${Cypress.env('API_VERSION')}/dataCollector/*`).as('singleDataCollectorLoad');
    cy.intercept(`${shared.reportingContextRoot}/rest/${Cypress.env('API_VERSION')}/dataCollector?format=json`).as('allDataCollectorLoad');
    cy.intercept({ method: 'POST', url: `${shared.reportingContextRoot}/rest/${Cypress.env('API_VERSION')}/dataCollector?format=json` }).as('createDataCollector');
  });

  afterEach(() => {
    cy.bvdLogout();
    cy.bvdLogin();
    role.roleDeletion(nonAdminWithDataCollectorRole, true);
  });

  it('Non Admin User With Predefined Query Edit Permission', () => {
    permissionArray = [{ operation_key: 'View', resource_key: 'default_action<>Group-__bvd_data_collector' }];
    role.roleCreationWithPermissionArray('DefaultBvdRole', 'DefaultBvdRole', permissionArray, true).then(nonAdminRoleId => {
      nonAdminWithDataCollectorRole = nonAdminRoleId;
      cy.bvdLogout();
      cy.bvdLogin(nonAdminuserName, nonAdminuserPwd);
      cy.visit('/');
      cy.wait(['@getTOC']);
      cy.get('.ux-side-menu-toggle').click();
      cy.get('[data-cy="navigation-category-1_L0_SA_Administration"] > .ux-side-menu-item').click();
      cy.get('[data-cy="navigation-category-0_L1_SA_AdminDashboards"] > .ux-side-menu-item').click();
      cy.get('[data-cy="navigation-category-1_L2_SA_StakeHolderAdminPages"]').click();
      cy.get(`[data-cy="navigation-category-1_L2_SA_StakeHolderAdminPages"] ux-side-menu-item`).should('have.length', 2);
      const expectedMenuItems = ['Dashboard Management', 'Resources'];
      cy.get('[data-cy*="StakeHolderAdminPages"]').find(`ux-side-menu-item button span[id*='fourth']`).each(($elem, index) => {
        expect(expectedMenuItems[index]).equal($elem.text());
      });
      cy.get('[data-cy="navigation-menuEntry-0_L3_SA_Dashboard"]').click();
      cy.wait(['@reportingPageloadUser', '@reportingPageloadSystem', '@reportingPageloadUser']);
      cy.frameLoaded('[data-cy="mondrian-iframe-Dashboards"]').iframeCustom().then($dataCollectorIframe => {
        cy.wrap($dataCollectorIframe).find('[data-cy="no-permission-dashboards"]').should('contain', 'You are not allowed to access this part of BVD!');
      });
      cy.get('[data-cy="navigation-menuEntry-2_L3_SA_DataCollector"]').click();
      cy.frameLoaded('[data-cy="mondrian-iframe-dataCollector"]').iframeCustom().then($dataCollectorIframe => {
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
        cy.wrap($dataCollectorIframe).find('.spinner').should('not.exist');
        cy.wrap($dataCollectorIframe).find('.col-sm-12 .queryResultData table tr th').should('have.length', 5);
        cy.wrap($dataCollectorIframe).find('.col-sm-12 .queryResultData table tr th').each($elem => {
          expect(['hostname', 'CPU', 'ram', 'id', 'category']).contains($elem.text().trim());
        });
        cy.wrap($dataCollectorIframe).find('#buttonConfirm').click();
        cy.wrap($dataCollectorIframe).find('.spinner').should('not.exist');
        cy.wrap($dataCollectorIframe).find('[data-cy="dropdown-more"]').click();
        cy.wrap($dataCollectorIframe).find('[data-cy="optionDBSettings"]').should('not.exist');
        cy.wrap($dataCollectorIframe).find(`[data-cy='dropdown-more'] li:nth-child(2) > a`).click();
        cy.wrap($dataCollectorIframe).find('div.modal-content').should('be.visible');
        cy.wrap($dataCollectorIframe).find('input#importQueriesFileInput').attachFile(`foundation/bvdOnUIF/dataCollectors.bvddc`);
        cy.wrap($dataCollectorIframe).find('div.modal-footer button').should('be.visible');
        cy.wrap($dataCollectorIframe).find('div.modal-footer button').contains('Ok').click();
        cy.wrap($dataCollectorIframe).find('.spinner').should('not.exist');
        cy.wrap($dataCollectorIframe).find('div.modal-footer button').should('be.visible');
        cy.wrap($dataCollectorIframe).find('div.modal-footer button').contains('Overwrite').click();
        cy.wait(['@runDataQuery']);
        cy.wrap($dataCollectorIframe).find('div.modal-footer button').should('be.visible');
        cy.wrap($dataCollectorIframe).find('div.modal-footer button').contains('Ok').click();
        cy.wrap($dataCollectorIframe).find('.spinner').should('not.exist');
        cy.wrap($dataCollectorIframe).find('div.list-title-container div').contains('textQuery').click();
        cy.wrap($dataCollectorIframe).find(`[data-cy='buttonDeleteSelectedQueries']`).click();
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
    cy.bvdLogin();
    cy.visit('/');
    cy.wait(['@getTOC']);
    cy.get('.ux-side-menu-toggle').click();
    role.roleCreationWithPermissionArray('DefaultBvdRole', 'DefaultBvdRole', permissionArray, true).then(nonAdminRoleId => {
      nonAdminWithDataCollectorRole = nonAdminRoleId;
      cy.bvdUiLogout();
      cy.bvdLogin(nonAdminuserName, nonAdminuserPwd);
      cy.visit('/');
      cy.wait(['@getTOC']);
      cy.get('.ux-side-menu-toggle').click();
      cy.get('[data-cy="navigation-category-1_L0_SA_Administration"] > .ux-side-menu-item').click();
      cy.get('[data-cy="navigation-category-0_L1_SA_AdminDashboards"] > .ux-side-menu-item').click();
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
    role.roleCreationWithPermissionArray('DefaultBvdRole', 'DefaultBvdRole', permissionArray, true).then(nonAdminRoleId => {
      nonAdminWithDataCollectorRole = nonAdminRoleId;
      cy.bvdLogout();
      cy.bvdLogin(nonAdminuserName, nonAdminuserPwd);
      cy.visit('/');
      cy.wait(['@getTOC']);
      cy.get('.ux-side-menu-toggle').click();
      cy.get('[data-cy="navigation-category-1_L0_SA_Administration"] > .ux-side-menu-item').click();
      cy.get('[data-cy="navigation-category-0_L1_SA_AdminDashboards"] > .ux-side-menu-item').click();
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
      cy.get('[data-cy="navigation-category-0_L2_SA_StakeHolderDashboards"] > .ux-side-menu-item').click();

      cy.url().then(urlString => {
        const urlObject = new URL(urlString);
        if (urlObject.hostname === 'localhost') {
          cy.get('ux-side-menu-item#category-0_L2_SA_StakeHolderDashboards').within(() => {
            cy.get(`span[id*='secondLevel']`).contains('documentation3');
          });
        } else {
          cy.get('ux-side-menu-item#category-0_L2_SA_StakeHolderDashboards').within(() => {
            cy.get(`span[id*='secondLevel']`).contains('Welcome');
          });
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
    role.roleCreationWithPermissionArray('DefaultBvdRole', 'DefaultBvdRole', permissionArray, true).then(nonAdminRoleId => {
      nonAdminWithDataCollectorRole = nonAdminRoleId;
      cy.bvdLogout();
      cy.bvdLogin(nonAdminuserName, nonAdminuserPwd);
      cy.visit('/');
      cy.wait(['@getTOC']);
      cy.get('.ux-side-menu-toggle').click();
      cy.get('[data-cy="navigation-category-1_L0_SA_Administration"] > .ux-side-menu-item').click();
      cy.get('[data-cy="navigation-category-0_L1_SA_AdminDashboards"] > .ux-side-menu-item').click();
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
          cy.wrap($dataCollectorIframe).find('#topLevelAlert').should('not.exist');
          cy.wrap($dataCollectorIframe).find('div.list-title-container div').contains('dataQueryName').click();
          cy.wrap($dataCollectorIframe).find(`[data-cy='buttonDeleteSelectedQueries']`).click();
          cy.wrap($dataCollectorIframe).find('div.modal-footer button#btnDialogSubmit').should('be.visible').click();
          cy.wrap($dataCollectorIframe).find('.spinner').should('not.exist');
        });
      });

      cy.get('[data-cy="navigation-category-0_L2_SA_StakeHolderDashboards"] > .ux-side-menu-item').click();
      cy.url().then(urlString => {
        const urlObject = new URL(urlString);
        if (urlObject.hostname === 'localhost') {
          cy.get('ux-side-menu-item#category-0_L2_SA_StakeHolderDashboards').within(() => {
            cy.get(`span[id*='secondLevel']`).contains('documentation3');
          });
        } else {
          cy.get('ux-side-menu-item#category-0_L2_SA_StakeHolderDashboards').within(() => {
            cy.get(`span[id*='secondLevel']`).contains('Welcome');
          });
        }
      });
    });
  });

  it('Show proper sql error message on running an invalid query', () => {
    cy.bvdLogin();
    cy.visit('/');
    cy.wait(['@getTOC']);
    cy.get('.ux-side-menu-toggle').click();
    cy.get('[data-cy="navigation-category-1_L0_SA_Administration"] > .ux-side-menu-item').click();
    cy.get('[data-cy="navigation-category-0_L1_SA_AdminDashboards"] > .ux-side-menu-item').click();
    cy.get('[data-cy="navigation-category-1_L2_SA_StakeHolderAdminPages"]').click();
    cy.get('[data-cy="navigation-menuEntry-2_L3_SA_DataCollector"]').click();
    cy.frameLoaded('[data-cy="mondrian-iframe-dataCollector"]').iframeCustom().then($dataCollectorIframe => {
      cy.wrap($dataCollectorIframe).find('#topLevelAlert').should('not.exist');
      cy.wrap($dataCollectorIframe).find('.dropdown #dropdownNew1').first().click();
      cy.wrap($dataCollectorIframe).find('[data-cy="newDataQuery"]').should('be.visible').click();
      cy.wrap($dataCollectorIframe).find('#name-input_name').should('be.visible').click();
      cy.wrap($dataCollectorIframe).find('#name-input_name').type('dataQueryName');
      cy.wrap($dataCollectorIframe).find(`input.opr-tag-bar-input[type='text']`).click();
      cy.wrap($dataCollectorIframe).find(`input.opr-tag-bar-input[type='text']`).type(`querydescription{enter}`);
      cy.wrap($dataCollectorIframe).find('#queryformat-default').click();
      cy.wrap($dataCollectorIframe).find('#query-text').should('be.visible').click();
      cy.wrap($dataCollectorIframe).find('#query-text').type(`select ids from bvd_lwr_demo`, { parseSpecialCharSequences: false });
      cy.wrap($dataCollectorIframe).find('#buttonExecuteQuery').click();
      cy.wait(['@runDataQuery']);
      cy.wrap($dataCollectorIframe).find('[data-cy="invalid-query"]').contains('Failed to get sample data: query is invalid. Column "ids" does not exist');
      cy.wrap($dataCollectorIframe).find('#query-text').type('{selectall}{backspace}{selectall}{backspace}');
      cy.wrap($dataCollectorIframe).find('#query-text').type('select id from bvdLWR');
      cy.wrap($dataCollectorIframe).find('#buttonExecuteQuery').click();
      cy.wait(['@runDataQuery']);
      cy.wrap($dataCollectorIframe).find('[data-cy="invalid-query"]').contains('Failed to get sample data: query is invalid. Relation "bvdLWR" does not exist');
    });
  });

  it('Tests to check for defaults on predefined query page', () => {
    const bvdURL = shared.getBaseUrlForRequest(Cypress.config().baseUrl);
    uploadFileRequest('foundation/bvdOnUIF/singleParameterQuery.bvddc', `${bvdURL}/rest/${Cypress.env('API_VERSION')}/dataCollector`, 1, 'dataCollectorsFile');
    cy.bvdLogin();
    cy.visit('/');
    cy.wait(['@getTOC']);
    cy.get('.ux-side-menu-toggle').click();
    cy.get('[data-cy="navigation-category-1_L0_SA_Administration"] > .ux-side-menu-item').click();
    cy.get('[data-cy="navigation-category-0_L1_SA_AdminDashboards"] > .ux-side-menu-item').click();
    cy.get('[data-cy="navigation-category-1_L2_SA_StakeHolderAdminPages"]').click();
    cy.get('[data-cy="navigation-menuEntry-2_L3_SA_DataCollector"]').click();
    cy.frameLoaded('[data-cy="mondrian-iframe-dataCollector"]').iframeCustom().then($dataCollectorIframe => {
      cy.wrap($dataCollectorIframe).find('div.list-title-container div').contains('test (test)').click();
      cy.wrap($dataCollectorIframe).find('[data-cy="default-value"]').contains('1'); /* Test whether default is shown */
      cy.wrap($dataCollectorIframe).find(`[data-cy='duplicate-button']`).click();
      cy.wait(['@reportingPageloadSystem', '@singleDataCollectorLoad']);
      /* Should not duplicate the query with same variable name and should show the error when using the variable name which already exist */
      cy.wrap($dataCollectorIframe).find('input#variable-input_name').should('have.value', 'copy of test');
      cy.wrap($dataCollectorIframe).find('input#variable-input_name').type('{selectall}{backspace}{selectall}{backspace}');
      cy.wrap($dataCollectorIframe).find('input#variable-input_name').type('test');
      cy.wrap($dataCollectorIframe).find('[data-cy="parameter-exist-error"]').contains('A parameter query with the same variable name already exists, please enter a different name');
      cy.wrap($dataCollectorIframe).find('button#buttonConfirm').should('be.disabled');
      cy.wrap($dataCollectorIframe).find('button#buttonCancel').click();
      cy.wait('@allDataCollectorLoad');
      cy.wrap($dataCollectorIframe).find('div.list-title-container div').contains('test (test)').click();
      // Test to check whether duplicated predefined query can be saved.
      cy.wrap($dataCollectorIframe).find(`[data-cy='duplicate-button']`).first().click();
      cy.wait(['@reportingPageloadSystem', '@singleDataCollectorLoad']);
      cy.wrap($dataCollectorIframe).find('button#buttonConfirm').click();
      cy.wait(['@createDataCollector', '@allDataCollectorLoad']);
      cy.wrap($dataCollectorIframe).find('div#myModalLabel1').should('not.exist');
      dataCollector.deleteAllQueries(bvdURL);
    });
  });
});
