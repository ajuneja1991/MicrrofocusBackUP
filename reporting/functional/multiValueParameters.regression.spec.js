const shared = require('../../shared/shared');
import { uploadFileRequest } from '../../../../support/reporting/restUtils/uploadFile';
import { dashboardDelete } from '../../../../support/reporting/restUtils/dashboard';
import DataCollectorPage from '../../../../support/reporting/pageObjects/DataCollectorPage';
import MainPage from '../../../../support/reporting/pageObjects/MainPage';
const dataCollector = require('../../../../support/reporting/restUtils/dataCollector');

const databaseParamQueryDisplayName = 'Dropdown Parameter';
const databaseparamQueryVariableName = 'sold_item';
const databseparamQueryDescription = 'Param query';
const queryText = 'select distinct sold_item from MultiValueParameters order by sold_item asc';
const labelcolmn = 'sold_item';
const valuescolmn = 'sold_item';
const vListparamQueryDisplayName = 'ValueList Parameter';
const vListparamQueryVariableName = 'location';
const vListparamQueryDescription = 'Value list parameter query';
const vListlabels = ['IND', 'IND,', 'MUN/', `MUN\\`, `JAK%`];
const vListvalues = ['India', 'Indi,a', 'Muni/ch', 'Muni\\ch', 'Jak%arta'];
const multiValMultiChartDashboard = 'MultiValueParameters_MultiSeriesChart';
const multiValTextDashboard = 'MultiValueParameters_TextValue';
const multiBarwidget = 'group25';
const lineChartWidget = 'group122';
const soldItem = 'sold_item';
const location = 'location';
const multiValGroupWidgetDashboard = 'MultiValue_GroupWidget';
const blue = '#0073e7';

describe('Validate MultiValue Parameters', shared.defaultTestOptions, () => {
  const querytypeParam = 'Param Query';
  beforeEach(() => {
    cy.intercept({ method: 'GET', path: `${Cypress.env('BVD_CONTEXT_ROOT')}/rest/${Cypress.env('API_VERSION')}/system` }).as('pageloadSystem');
    cy.intercept({ method: 'GET', path: `${Cypress.env('BVD_CONTEXT_ROOT')}/rest/${Cypress.env('API_VERSION')}/session/user` }).as('pageloadUser');
    cy.intercept({ method: 'POST', path: `${Cypress.env('BVD_CONTEXT_ROOT')}/rest/${Cypress.env('API_VERSION')}/channel/state` }).as('channelState');
    cy.intercept({ method: 'POST', path: `${Cypress.env('BVD_CONTEXT_ROOT')}/rest/${Cypress.env('API_VERSION')}/dataCollector/channel` }).as('dataCollectorChannel');
  });

  it('Import Dashboards', () => {
    cy.bvdLogin();
    uploadFileRequest(`reporting/${multiValMultiChartDashboard}.bvd`, `${Cypress.env('BVD_CONTEXT_ROOT')}/urest/${Cypress.env('API_VERSION')}/dashboard`);
    uploadFileRequest(`reporting/${multiValTextDashboard}.bvd`, `${Cypress.env('BVD_CONTEXT_ROOT')}/urest/${Cypress.env('API_VERSION')}/dashboard`);
    uploadFileRequest(`reporting/${multiValGroupWidgetDashboard}.bvd`, `${Cypress.env('BVD_CONTEXT_ROOT')}/urest/${Cypress.env('API_VERSION')}/dashboard`);
  });

  it('Validate MultiValue Parameters Value CheckBox', () => {
    cy.bvdLogin();
    cy.visit('/#/dataCollector');
    cy.wait(['@pageloadSystem', '@pageloadUser']);
    DataCollectorPage.clickNewQuery(querytypeParam);
    DataCollectorPage.validateMultiValueCheckBox('database Param Query', false);
    DataCollectorPage.clickNewQuery(querytypeParam);
    DataCollectorPage.validateMultiValueCheckBox('valueList Param Query', false);
  });

  it('Create Data for MultiValue Parameters', () => {
    cy.bvdLogin();
    cy.visit('/#/dataCollector');
    cy.wait(['@pageloadSystem', '@pageloadUser']);
    DataCollectorPage.clickNewQuery(querytypeParam);
    DataCollectorPage.fillparamDataBaseQueryDetails(databaseParamQueryDisplayName, databaseparamQueryVariableName, databseparamQueryDescription, queryText, labelcolmn, valuescolmn, true);
    DataCollectorPage.clickSaveDataQuery();
    DataCollectorPage.clickNewQuery(querytypeParam);
    DataCollectorPage.fillparamValueListDetails(vListparamQueryDisplayName, vListparamQueryVariableName, vListparamQueryDescription, vListlabels, vListvalues, true);
    DataCollectorPage.clickSaveDataQuery();
  });

  it('Validate Data of MultiValueParameter on Dashboard', () => {
    cy.bvdLogin();
    cy.visit(`/#/show/${multiValMultiChartDashboard}?params=none`);
    cy.wait(['@pageloadSystem', '@pageloadUser', '@channelState']);
    MainPage.barCount(multiBarwidget, 7, blue);
    MainPage.lineChartPoints(lineChartWidget, 7);
    MainPage.clickSlideOutForParamSelection();
    MainPage.selectMultipleValuesInDropDownParameter([20, 25], soldItem);
    MainPage.leftBarParameterApplyValue(false);
    MainPage.barCount(multiBarwidget, 2, blue);
    MainPage.lineChartPoints(lineChartWidget, 2);
    cy.visit(`/#/show/${multiValTextDashboard}?params=none`);
    cy.wait(['@pageloadUser', '@channelState']);
    MainPage.checkText('shape20', 'Jak%arta');
    MainPage.checkText('shape24', '50');
    MainPage.clickSlideOutForParamSelection();
    MainPage.selectMultipleValuesInDropDownParameter(['IND,', 'MUN/'], location);
    MainPage.selectMultipleValuesInDropDownParameter([20, 25], soldItem);
    MainPage.leftBarParameterApplyValue(false);
    MainPage.checkText('shape18', `Indi,a,Muni/ch`);
    MainPage.checkText('shape20', 'Indi,a');
    MainPage.checkText('shape22', '20,25');
    MainPage.checkText('shape24', '25');
    cy.visit(`/#/show/${multiValGroupWidgetDashboard}?params=none`);
    cy.wait(['@channelState', '@pageloadUser']);
    MainPage.clickSlideOutForParamSelection();
    MainPage.selectMultipleValuesInDropDownParameter(['IND,', 'IND,'], location);
    MainPage.selectMultipleValuesInDropDownParameter([20, 35], soldItem);
    MainPage.leftBarParameterApplyValue(false);
    MainPage.checkText('instance-group14-1-shape11', 20);
    MainPage.checkText('instance-group14-1-shape12', 'India');
    MainPage.checkText('instance-group14-2-shape11', 25);
    MainPage.checkText('instance-group14-2-shape12', 'Indi,a');
    MainPage.checkText('instance-group14-4-shape11', 35);
    MainPage.checkText('instance-group14-4-shape12', 'Muni/ch');
  });

  it('Validate DrillDown of MultiParameters', () => {
    cy.bvdLogin();
    cy.visit(`/#/show/${multiValTextDashboard}?params=none`);
    cy.wait(['@pageloadUser', '@pageloadSystem', '@channelState']);
    MainPage.checkText('shape20', 'Jak%arta');
    MainPage.checkText('shape24', '50');
    MainPage.clickSlideOutForParamSelection();
    MainPage.selectMultipleValuesInDropDownParameter(['IND,', 'MUN/'], location);
    MainPage.leftBarParameterApplyValue(false);
    MainPage.checkText('shape18', `Indi,a,Muni/ch`);
    MainPage.checkText('shape20', 'Muni/ch');
    // Drilldown using external URL format
    cy.get('g[id="shape18"] text').click();
    cy.wait(['@pageloadUser', '@channelState']);
    cy.url().should('include', 'MultiValueParameters_MultiSeriesChart?params=location%3DIndi,a%1FMunibvd_slashch');
    MainPage.checkText('shape18', `Indi,a,Muni/ch`);

    cy.visit(`/#/show/${multiValTextDashboard}?params=none`);
    cy.wait(['@channelState', '@pageloadUser']);
    MainPage.clickSlideOutForParamSelection();
    MainPage.selectMultipleValuesInDropDownParameter([20, 25], soldItem);
    MainPage.leftBarParameterApplyValue(false);
    MainPage.checkText('shape22', '20,25');
    MainPage.checkText('shape24', 25);
    // Drilldown using open dashboard with passing active parameters
    cy.get('g[id="shape22"] text').click();
    cy.wait(['@pageloadUser', '@channelState']);
    cy.url().should('include', 'MultiValueParameters_MultiSeriesChart?params=sold_item%3D20%1F25');
    MainPage.checkText('shape22', '20,25');
    MainPage.checkText('shape24', 25);
  });

  after(() => {
    cy.bvdLogout();
    dataCollector.deleteAllQueries();
    dashboardDelete(multiValMultiChartDashboard);
    dashboardDelete(multiValTextDashboard);
    dashboardDelete(multiValGroupWidgetDashboard);
  });
});
