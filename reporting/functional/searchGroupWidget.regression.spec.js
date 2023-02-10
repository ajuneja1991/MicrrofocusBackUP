const shared = require('../../shared/shared');
import MainPage from '../../../../support/reporting/pageObjects/MainPage';
import DataCollectorPage from '../../../../support/reporting/pageObjects/DataCollectorPage';
import EditDashBoardPage from '../../../../support/reporting/pageObjects/EditDashboardPage';
const dataCollector = require('../../../../support/reporting/restUtils/dataCollector');
const dashboard = require('../../../../support/reporting/restUtils/dashboard');
import { uploadFileRequest } from '../../../../support/reporting/restUtils/uploadFile';

describe('Search Group Widget Test', shared.defaultTestOptions, () => {
  beforeEach(() => {
    cy.intercept({
      method: 'GET',
      path: `${shared.reportingContextRoot}/rest/${Cypress.env('API_VERSION')}/session/user`
    }).as('pageLoadUser');
    cy.intercept({
      method: 'GET',
      path: `${shared.reportingContextRoot}/rest/${Cypress.env('API_VERSION')}/system`
    }).as('pageloadSystem');
    cy.intercept({
      method: 'GET',
      path: `${shared.reportingContextRoot}/rest/${Cypress.env('API_VERSION')}/dashboard/dashboard_group_widget`
    }).as('dashboardGetPage');
    cy.intercept({
      method: 'POST',
      path: `${shared.reportingContextRoot}/rest/${Cypress.env('API_VERSION')}/channel/state`
    }).as('channelState');
  });
  const dataQueryText = `select * from sample_test_dateparam`;
  const columnsArray = ['id', 'timestamp', 'data1', 'data2'];
  const searchFields = ['id', 'data1'];
  const dashboardName = 'dashboard_group_widget';
  const queryTypeData = 'Data Query';
  const dataQueryDefault = 'widgetGroup';
  const dataQueryDesc = 'Data query that uses a search group widget';
  const dataChannel = 'GroupWidgetOptionsChannel';

  it('Search Group Widget Scroll Pages', () => {
    uploadFileRequest('reporting/dashboard_group_widget.bvd', `${shared.reportingContextRoot}/urest/${Cypress.env('API_VERSION')}/dashboard`);
    cy.bvdLogin();
    cy.visit('/#/dataCollector');
    cy.wait('@pageLoadUser');
    DataCollectorPage.clickNewQuery(queryTypeData);
    DataCollectorPage.filldataQueryDetails(dataChannel, dataQueryDesc, 'AutomationTag1', dataQueryDefault, dataQueryText);
    DataCollectorPage.validateQueryResults(4, columnsArray);
    DataCollectorPage.clickSaveDataQuery();
    cy.visit('/#/show/dashboard_group_widget?params=none');
    cy.wait(['@pageLoadUser', '@pageloadSystem', '@dashboardGetPage']);
    EditDashBoardPage.editDashboard();
    EditDashBoardPage.selectWidget('group16');
    EditDashBoardPage.setDataChannel(dataChannel);
    EditDashBoardPage.setSearchFields(searchFields);
    EditDashBoardPage.selectWidget('shape13');
    EditDashBoardPage.setMultipleDataField('id');
    EditDashBoardPage.selectWidget('shape14');
    EditDashBoardPage.setMultipleDataField('data1');
    EditDashBoardPage.saveConfig(dashboardName);
    cy.visit('/#/show/dashboard_group_widget?params=none');
    cy.wait(['@pageLoadUser', '@channelState']);
    MainPage.validateDataForScrollPage();
    cy.reload();
    cy.wait(['@pageLoadUser', '@channelState']);
    MainPage.typeTextInSearchBoxAndValidate('75');
  });
  after(() => {
    cy.bvdLogout();
    dataCollector.deleteAllQueries();
    dashboard.dashboardDelete(dashboardName);
  });
});
