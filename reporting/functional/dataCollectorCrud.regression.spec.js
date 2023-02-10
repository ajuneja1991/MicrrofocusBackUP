import DashBoardPage from '../../../../support/reporting/pageObjects/DashboardPage';

const shared = require('../../shared/shared');
const role = require('../../../../support/reporting/restUtils/role');
const dbConn = require('../../../../support/reporting/restUtils/setUpDBConn');
const _ = require('lodash');

import MainPage from '../../../../support/reporting/pageObjects/MainPage';
import DataCollectorPage from '../../../../support/reporting/pageObjects/DataCollectorPage';
import EditDashBoardPage from '../../../../support/reporting/pageObjects/EditDashboardPage';
import dataCollector from '../../../../support/reporting/restUtils/dataCollector';
import dashboard from '../../../../support/reporting/restUtils/dashboard';
import { uploadFileRequest } from '../../../../support/reporting/restUtils/uploadFile';

const userName = 'CRUDTest';
const userPwd = 'Test@123';
const roleName = 'roleCRUD';
const roleDesc = 'roleCRUD';
const categoryName = 'All';
const accessType = 'full-control';
const queryType = 'Data Query';
const queryName = 'machinesdata';
const cpOfQueryName = 'Copy of machinesdata';
const cpOfCpOfQueryName = 'Copy of Copy of machinesdata';
const cpOfCpOfCpOfQueryName = 'Copy of Copy of Copy of machinesdata';
const dashboardName = 'DataCollectorCRUD';
const widget = 'group1';

const queryDes = 'Fetching Machine Data';
const queryTags = ['AutomationTag1'];
const tagsChannelOptions = ['Copy of Copy of Copy of machinesdata'];
const dataQueryDefault = 'default';
const queryText = 'select * from Machines1 where CPU <= 500 and ram < 500';
const expectedColumns = ['hostname', 'CPU', 'ram', 'id', 'category'];

function setupDataCollector() {
  cy.bvdLogin();
  cy.visit('/#/dataCollector');
  cy.wait(['@pageloadSystem', '@pageloadUser']);
}

describe('Predefined query CRUD Test', shared.defaultTestOptions, () => {
  beforeEach(() => {
    cy.intercept(`${Cypress.env('BVD_CONTEXT_ROOT')}/rest/${Cypress.env('API_VERSION')}/system`).as('pageloadSystem');
    cy.intercept(`${Cypress.env('BVD_CONTEXT_ROOT')}/rest/${Cypress.env('API_VERSION')}/session/user`).as('pageloadUser');
    cy.intercept({ method: 'POST', url: `${Cypress.env('BVD_CONTEXT_ROOT')}/rest/${Cypress.env('API_VERSION')}/channel/state` }).as('channelState');
    cy.intercept({ method: 'POST', url: `${Cypress.env('BVD_CONTEXT_ROOT')}/rest/${Cypress.env('API_VERSION')}/connection/test` }).as('testConnection');
    cy.intercept({ method: 'POST', url: `${Cypress.env('BVD_CONTEXT_ROOT')}/rest/${Cypress.env('API_VERSION')}/dataCollector/test?format=json` }).as('runDataQuery');
  });

  let roleId,
    nonAdminWithDataCollectorRole;
  let retrievedHost,
    retrievedPort,
    retrievedUser,
    retrievedDb,
    retrievedPswd;
  it('create a Role through REST', () => {
    role.roleCreation(roleName, roleDesc, categoryName, accessType).then(newRoleId => {
      roleId = newRoleId;
      role.roleCreation('roleDataCollector', 'roleDataCollector', '', 'View', 'default_action<>Group-__bvd_data_collector').then(nonAdminRoleId => {
        nonAdminWithDataCollectorRole = nonAdminRoleId;
      });
    });
  });

  it('Test connection and retreive the host name', () => {
    setupDataCollector();
    cy.enter('#contentFrame').then(getBody => {
      getBody().find('[data-cy="dropdown-more"]').click();
      getBody().find('[data-cy="optionDBSettings"]').click();
      getBody().find('input[name=hostName]').invoke('val').then(text => {
        retrievedHost = text;
      });
      getBody().find('input[name=port]').invoke('val').then(text => {
        retrievedPort = Number(text);
      });
      getBody().find('input[name=dbName]').invoke('val').then(text => {
        retrievedDb = text;
      });
      getBody().find('input[name=dbUser]').invoke('val').then(text => {
        retrievedUser = text;
      });
      getBody().find('input[name=dbPassword]').invoke('val').then(text => {
        retrievedPswd = text;
      });
      getBody().find('[data-cy="buttonTestConnection"]').click();
      cy.wait('@testConnection');
      getBody().find('[data-cy="connectionResult"]').contains('Test connection succeeded');
      getBody().find('[data-cy="buttonSaveDBSetting"]').click();
    });
  });

  it('Alert can be closed when db authentication fails', () => {
    uploadFileRequest('reporting/BarChart.bvd', `${Cypress.env('BVD_CONTEXT_ROOT')}/urest/${Cypress.env('API_VERSION')}/dashboard`);
    cy.bvdLogin();
    cy.visit('/#/show/BarChart');
    cy.wait(['@pageloadUser', '@channelState']);
    MainPage.checkText(widget, '120');
    dbConn.setUpDbConnection(`${Cypress.env('BVD_CONTEXT_ROOT')}`, 'abc', retrievedPort, retrievedUser, retrievedDb, retrievedPswd);
    cy.visit('/#/dataCollector');
    cy.enter('#contentFrame').then(getBody => {
      getBody().find('[data-cy="dropdown-more"]').click();
      getBody().find('[data-cy="optionDBSettings"]').click();
      getBody().find('[data-cy="enableTLSCheckbox"]').click();
      getBody().find('[data-cy="enableTLSCheckbox"]').should('be.checked');
      getBody().find('[data-cy="cancelButton"]').click();
      getBody().find('[data-cy="dropdown-more"]').click();
      getBody().find('[data-cy="optionDBSettings"]').click();
      getBody().find('[data-cy="enableTLSCheckbox"]').should('not.be.checked');
      getBody().find('input[name=hostName]').invoke('val').then(text => {
        expect(text).to.eq('abc');
      });
    });
    cy.visit('/#/show/BarChart');
    cy.wait(['@pageloadUser', '@channelState']);
    cy.get('div.alert').contains('No such host exists');
    cy.get('button.close').click();
    cy.get('div.alert').should('not.exist');
    // Revert the db connection details
    dbConn.setUpDbConnection(`${Cypress.env('BVD_CONTEXT_ROOT')}`, retrievedHost, retrievedPort, retrievedUser, retrievedDb, retrievedPswd);
    cy.visit('/#/dataCollector');
    cy.enter('#contentFrame').then(getBody => {
      getBody().find('[data-cy="dropdown-more"]').click();
      getBody().find('[data-cy="optionDBSettings"]').click();
      getBody().find('[data-cy="buttonTestConnection"]').click();
      cy.wait('@testConnection');
      getBody().find('[data-cy="connectionResult"]').contains('Test connection succeeded');
      getBody().find('[data-cy="buttonSaveDBSetting"]').click();
    });
  });

  it('Query Create and Upload Dashboard', () => {
    setupDataCollector();
    cy.log('Create a new query');
    DataCollectorPage.clickNewQuery(queryType);
    DataCollectorPage.filldataQueryDetails(queryName, queryDes, queryTags, dataQueryDefault, queryText);
    DataCollectorPage.validateQueryResults(5, expectedColumns);
    DataCollectorPage.clickSaveDataQuery();
    MainPage.validateIfMainPage();
    MainPage.navigateToDashboards();
    DashBoardPage.validateIfDashboardPage();

    cy.log('Upload dashboard');
    DashBoardPage.uploadDashboard(`reporting/${dashboardName}.svg`);
    EditDashBoardPage.selectWidget(widget);
    EditDashBoardPage.setDataChannel('machinesdata');
    EditDashBoardPage.setMultipleDataField('CPU');
    EditDashBoardPage.saveConfig(dashboardName);
    MainPage.logOutOfBVD();
  });

  it('Should be able to edit the value and label column during param query update', () => {
    setupDataCollector();
    const querytypeParam = 'Param Query';
    const paramQueryDisplayName = 'TextWidgetParamQuery';
    const paramQueryVariableName = 'TextWidgetParamQuery';
    const paramQueryText = 'select * from TextWidget';
    DataCollectorPage.clickNewQuery(querytypeParam);
    DataCollectorPage.fillparamDataBaseQueryDetails(paramQueryDisplayName, paramQueryVariableName, 'Text widget data', paramQueryText, 'OS', 'OS');
    DataCollectorPage.clickSaveDataQuery();
    MainPage.validateIfMainPage();

    cy.enter('#contentFrame').then(getBody => {
      getBody().find('[data-cy="queryList"]').contains('TextWidgetParamQuery').click();
      getBody().find('[data-cy="edit-query"]').first().click();
      DataCollectorPage.updateparamDataBaseQueryValueAndLabelColumn('Process', 'Process');
      DataCollectorPage.clickSaveDataQuery();
      MainPage.validateIfMainPage();
    });
  });

  it('Query Read, Delete, Update, Options, Search, Multiple Delete', () => {
    setupDataCollector();

    cy.log('Read the content of saved query');
    queryTags.push(queryName);
    DataCollectorPage.checkDataQueryValues(queryName, queryDes, queryTags, dataQueryDefault, queryText, expectedColumns);

    cy.log('Update saved query');
    DataCollectorPage.duplicateQuery(queryName);
    DataCollectorPage.updateQuery(cpOfQueryName, queryTags, dataQueryDefault);

    cy.log('Delete query');
    DataCollectorPage.deleteAQuery(cpOfQueryName);

    cy.log('Query options');
    DataCollectorPage.duplicateQuery(queryName);
    DataCollectorPage.duplicateQuery(cpOfQueryName);
    DataCollectorPage.duplicateQuery(cpOfCpOfQueryName);
    tagsChannelOptions.concat(queryTags);
    DataCollectorPage.checkDataQueryValues(cpOfCpOfCpOfQueryName, queryDes, tagsChannelOptions, dataQueryDefault, queryText, expectedColumns);

    cy.log('Search query');
    DataCollectorPage.searchAndDeleteElement(cpOfCpOfCpOfQueryName);

    cy.log('Select and delete multiple queries');
    DataCollectorPage.deleteMultipleQuery([cpOfQueryName, cpOfCpOfQueryName]);
    MainPage.logOutOfBVD();
  });

  it('login As Non Admin User And Validate', () => {
    cy.bvdLogin(userName, userPwd);
    cy.visit('/#/show/Welcome');
    cy.wait(['@pageloadSystem', '@pageloadUser']);
    cy.get('#load-spinner').should('not.be.visible');
    cy.get('[data-cy="administration-button"]').click();
    cy.get('[data-cy="data-collector"]').should('not.exist');
    MainPage.viewDashboard(dashboardName);
    MainPage.checkText(widget, '400');
    cy.bvdLogout();
    cy.log('Confirm Dashboard view for non-admin users');
  });

  it('Should thrown an error on duplicating a data query with same name', () => {
    dataCollector.createDataQuery('unchanged', 'select distinct location from bvd_lwr_demo', 'TestDataQuery');
    setupDataCollector();
    cy.enter('#contentFrame').then(getBody => {
      getBody().find('div[text="TestDataQuery"]').click();
      getBody().find('[data-cy="duplicate-button"]').first().click();
    });
    cy.enter('#contentFrame').then(getBody => {
      getBody().find('input#name-input_name').should('be.visible');
      getBody().find('input#name-input_name').click();
      getBody().find('input#name-input_name').clear();
      getBody().find('input#name-input_name').type('TestDataQuery');
      getBody().find('button#buttonExecuteQuery').click();
      cy.wait('@runDataQuery');
      getBody().find('.spinner').should('not.exist');
      getBody().find('div.queryResultData table');
      getBody().find('button#buttonConfirm').click();
      getBody().find('div.modal-body').then($elem => {
        expect($elem.find('p').text()).to.eq('Data query with the same name is already exist, please enter a different name.');
      });
    });
  });

  it('Verify the attach certificate button does not appear when enable tls is unchecked', () => {
    setupDataCollector();
    cy.enter('#contentFrame').then(getBody => {
      getBody().find('[data-cy="dropdown-more"]').click();
      getBody().find('[data-cy="optionDBSettings"]').click();
      getBody().find('input#ssl-input').click();
      getBody().find('input#ssl-input').should('be.checked');
      getBody().find('button.attachCertificateBtn');
      // Revert the checkbox
      getBody().find('input#ssl-input').click();
      getBody().find('input#ssl-input').should('not.be.checked');
      getBody().find('button.attachCertificateBtn').should('not.exist');
    });
  });

  it('Should only search for filtered queries(not found)', () => {
    dataCollector.createDateTypeParameterQuery('TestParamQuery', 'singleDate', 'single_date', '');
    setupDataCollector();
    cy.enter('#contentFrame').then(getBody => {
      getBody().find('[data-cy="filter-query-button"]').click();
      getBody().find('div[text="TestParamQuery (single_date)"]');
      getBody().find('[data-cy="show-data-queries"]').click();
      getBody().find('button.reveal-button').click();
      getBody().find('div.opr-reveal-panel-popup input').type('Test');
      getBody().find('div[text="TestParamQuery (single_date)"]').should('not.exist');
    });
  });

  it('validate InValid Data Query Name not saved', () => {
    setupDataCollector();
    cy.enter('#contentFrame').then(getBody => {
      getBody().find('.dropdown #dropdownNew1').first().click();
      getBody().find('[data-cy="newDataQuery"]').click();
      getBody().find('input#name-input_name').type('<script>alert("Hello");</script>');
      getBody().find('button#buttonConfirm').should('be.disabled');
      getBody().find('[data-cy="invalid-data-query-name-message"]').should('contain', 'Only alphanumeric characters and _ are allowed');
    });
  });

  it('Non admin user with predefined query edit permission', () => {
    cy.bvdLogin('NonAdminDataCollectorTest', userPwd);
    cy.visit('/');
    cy.wait(['@pageloadUser', '@pageloadSystem']);
    cy.url().should('include', '/nopermissions');
    cy.get('#topLevelAlert').should('be.visible');
    cy.get('[data-cy="administration-button"]').should('be.visible').click();
    cy.get('[data-cy="data-collector"]').click();
    cy.wait(['@pageloadUser']);
    cy.enter('#contentFrame').then(getBody => {
      getBody().find('[data-cy="dropdown-more"]').click();
      getBody().find('[data-cy="optionDBSettings"]').should('not.exist');
      DataCollectorPage.clickNewQuery(queryType);
      const name = _.uniqueId('dataCollector_');
      DataCollectorPage.filldataQueryDetails(name, queryDes, queryTags, dataQueryDefault, queryText);
      DataCollectorPage.validateQueryResults(5, expectedColumns);
      DataCollectorPage.clickSaveDataQuery();
      MainPage.validateIfMainPage();
      DataCollectorPage.deleteAQuery(name);
    });
  });

  after(() => {
    // LogOut of session if test fails during execution and logout does not occur through UI
    cy.bvdLogout();
    dashboard.dashboardDelete(dashboardName);
    dashboard.dashboardDelete('BarChart');
    dataCollector.deleteAllQueries();
    role.roleDeletion(roleId);
    role.roleDeletion(nonAdminWithDataCollectorRole);
  });
});
