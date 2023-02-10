const shared = require('../../shared/shared');
const dataCollector = require('../../../../support/reporting/restUtils/dataCollector');
const dashboard = require('../../../../support/reporting/restUtils/dashboard');
import MainPage from '../../../../support/reporting/pageObjects/MainPage';
import DataCollectorPage from '../../../../support/reporting/pageObjects/DataCollectorPage';
import { uploadFileRequest } from '../../../../support/reporting/restUtils/uploadFile';

const querytypeParam = 'Param Query';
const paramQueryDisplayName = 'fetchingcpudata';
const paramQueryVariableName = 'cpuparameter';
const paramQueryDescription = 'Fetching CPU Data';
const queryText = 'select * from Machines1';
const updatedQueryText = `select * from Machines1 where \${CPU = \${cpuparameter}}`;
const labelcolmn = 'CPU';
const valuescolmn = 'CPU';
const defaultformat = 'defaultnovalue';
const defaultvalueformat = 'defaultvalue';
const expectedColumns = ['hostname', 'CPU', 'ram', 'id', 'category'];
const dataPointLocator = `g#group17>g>rect[width^='94']`;
const defaultvalueprovided = '400';
const dataQueryName = 'machinesdata';
const dashboardName = 'TimeSeriesDashboard';
const sampleQueryResult = { hostname: 'host1', CPU: 100, ram: 70, id: 1, category: 'hostA' };
const tags = ['AutomationTag1', 'AutomationTag2', 'AutomationTag3'];

describe('Dashboard Parameterization Test', shared.defaultTestOptions, () => {
  beforeEach(() => {
    cy.intercept({ method: 'GET', path: `${Cypress.env('BVD_CONTEXT_ROOT')}/rest/${Cypress.env('API_VERSION')}/system` }).as('pageloadSystem');
    cy.intercept({ method: 'GET', path: `${Cypress.env('BVD_CONTEXT_ROOT')}/rest/${Cypress.env('API_VERSION')}/session/user` }).as('pageloadUser');
    cy.intercept({ method: 'POST', path: `${Cypress.env('BVD_CONTEXT_ROOT')}/rest/${Cypress.env('API_VERSION')}/channel/state` }).as('channelState');
  });

  before(() => {
    dataCollector.deleteAllQueries();
  });

  it('Import Dashboards- Dashboard Parametrization', () => {
    uploadFileRequest(`reporting/${dashboardName}.bvd`, `${Cypress.env('BVD_CONTEXT_ROOT')}/urest/${Cypress.env('API_VERSION')}/dashboard`);
  });

  it('Create DatabaseParamQuery and Validate Data on Dashboard', () => {
    cy.bvdLogin();
    cy.visit('/#/dataCollector');
    cy.wait(['@pageloadSystem', '@pageloadUser']);
    MainPage.validateIfMainPage();
    DataCollectorPage.clickNewQuery(querytypeParam);
    DataCollectorPage.fillparamDataBaseQueryDetails(paramQueryDisplayName, paramQueryVariableName, paramQueryDescription, queryText, labelcolmn, valuescolmn);
    DataCollectorPage.clickSaveDataQuery();
    // Read the data of the created Databasetype param query
    DataCollectorPage.checkParamQueryDatabaseTypeValues(paramQueryDisplayName, paramQueryVariableName, paramQueryDescription, queryText, expectedColumns, labelcolmn, valuescolmn, defaultformat);
    dataCollector.createDataQuery('groupwidget', updatedQueryText, 'machinesdata', 'Fetching Machine Data', expectedColumns, sampleQueryResult, tags);
    cy.visit(`/#/show/${dashboardName}?params=none`);
    cy.wait(['@pageloadUser', '@channelState']);
    cy.get('#load-spinner').should('not.be.visible');
    MainPage.verifyingTextValueForBarChart(['100', '70']);
    MainPage.barChartCount(dataPointLocator, 2);
    MainPage.clickSlideOutForParamSelection();
    MainPage.selectDropDownParameter(300, paramQueryVariableName);
    MainPage.clickApplyBtnForParamValue();
    cy.wait(['@pageloadUser', '@channelState']);
    MainPage.verifyingTextValueForBarChart(['300', '320']);
    MainPage.barChartCount(dataPointLocator, 2);
  });

  it('Update DatabaseParamQuery ,Validate Data and Delete', () => {
    cy.bvdLogin();
    cy.visit('/#/dataCollector');
    cy.wait(['@pageloadSystem', '@pageloadUser']);
    MainPage.validateIfMainPage();
    DataCollectorPage.editDataQueryText(dataQueryName, updatedQueryText);
    DataCollectorPage.editDatabaseParamQuery(paramQueryDisplayName, paramQueryVariableName, labelcolmn, valuescolmn, 'Value', defaultvalueprovided);
    DataCollectorPage.checkParamQueryDatabaseTypeValues(paramQueryDisplayName, paramQueryVariableName, paramQueryDescription, queryText, expectedColumns, labelcolmn, valuescolmn, defaultvalueformat, defaultvalueprovided);
    cy.visit(`/#/show/${dashboardName}?params=none`);
    cy.wait(['@pageloadUser', '@channelState']);
    MainPage.verifyingTextValueForBarChart(['400', '320']);
    MainPage.barChartCount(dataPointLocator, 2);
    MainPage.clickSlideOutForParamSelection();
    MainPage.selectDropDownParameter(500, paramQueryVariableName);
    MainPage.clickApplyBtnForParamValue();
    cy.wait(['@pageloadUser', '@channelState']);
    MainPage.verifyingTextValueForBarChart(['500', '600']);
    MainPage.barChartCount(dataPointLocator, 2);
    cy.visit('/#/dataCollector');
    cy.wait('@pageloadUser');
    DataCollectorPage.deleteAParamQuery(paramQueryDisplayName, paramQueryVariableName);
    cy.bvdLogout();
  });

  it('Should show the dashboard which has two data queries having dependency on same parameter', () => {
    uploadFileRequest('reporting/TextWidgetWithSameParameter.bvd', `${Cypress.env('BVD_CONTEXT_ROOT')}/urest/${Cypress.env('API_VERSION')}/dashboard`);
    cy.bvdLogin();
    cy.visit('/#/show/TextWidgetWithSameParameter?params=none');
    cy.wait(['@pageloadUser', '@channelState']);
    MainPage.checkText('shape2', 1);
    MainPage.checkText('shape4', 'Boeblingen');
    MainPage.clickSlideOutForParamSelection();
    MainPage.checkIfDropDownHasSelectedParameter('Boeblingen', 'location');
  });

  it('Should check the format shown in MM/DD/YYYY in single date picker', () => {
    uploadFileRequest('reporting/SpecialVariables.bvd', `${Cypress.env('BVD_CONTEXT_ROOT')}/urest/${Cypress.env('API_VERSION')}/dashboard`);
    cy.bvdLogin();
    cy.visit('/#/show/SpecialVariables?params=Calendar:start%3D2021-10-18%2000:00:00;Calendar:end%3D2021-10-19%2016:00:00;reporttimeline%3D2021-10-19%2012:51:00');
    cy.wait(['@pageloadUser', '@channelState']);
    MainPage.checkText('shape1', '10/18/2021, 12:00:00 AM');
    MainPage.checkText('shape6', '10/19/2021, 12:51:00 PM');
    MainPage.checkText('shape4', '10/19/2021, 4:00:00 PM');
  });

  it('Should check if the parameter with no records in the query output is present in slideout panel', () => {
    uploadFileRequest('reporting/dashboard_parameter_query_empty.bvd', `${Cypress.env('BVD_CONTEXT_ROOT')}/urest/${Cypress.env('API_VERSION')}/dashboard`);
    cy.bvdLogin();
    cy.visit('/#/show/dashboard_parameter_query_empty?params=none');
    cy.wait(['@pageloadUser', '@channelState']);
    MainPage.clickSlideOutForParamSelection();
    cy.get('bvd-ng2-dropdown[data-cy="diskdataValue"] input').click();
    MainPage.checkIfDropDownHasEmptyData('diskdataValue');
    cy.get('div.slideout-param-dropdown label').should('have.text', 'diskdataDisplayname');
  });

  after(() => {
    cy.bvdLogout();
    dataCollector.deleteAllQueries();
    dashboard.dashboardDelete(dashboardName);
    dashboard.dashboardDelete('SpecialVariables');
    dashboard.dashboardDelete('TextWidgetWithSameParameter');
    dashboard.dashboardDelete('dashboard_parameter_query_empty');
  });
});
