import MainPage from './MainPage';
import DataCollectorPage from './DataCollectorPage';
import DashBoardPage from './DashboardPage';
import EditDashBoardPage from './EditDashboardPage';

const dashboardName = 'datePicker';

export function createDataCollectorsAndDashboard(userName, userPwd) {
  const widgetStart = 'shape1005';
  const widgetEnd = 'shape1006';
  cy.bvdLogin();
  DataCollectorPage.createParamQueryWithAPI(
    {
      displayName: 'param_query_datetime',
      description: 'DateTime Parameter',
      variableName: 'parameter_datetime',
      paramQueryType: 'date',
      resultFormat: 'unchanged',
      selectedDate: 'specificDate',
      selectedoption: 'novalue'
    });

  DataCollectorPage.createDataQueryWithAPI(
    {
      availableColumns: ['start'],
      queryText: `SELECT \${\${parameter_datetime:start}} as start`,
      description: 'data query desc',
      resultFormat: 'unchanged',
      sampleQueryResult: { start: true },
      name: 'dateTimeParameterChannelStart'
    });

  DataCollectorPage.createDataQueryWithAPI(
    {
      availableColumns: ['end'],
      queryText: `SELECT \${\${parameter_datetime:end}} as end`,
      description: 'data query desc',
      resultFormat: 'unchanged',
      sampleQueryResult: { end: true },
      name: 'dateTimeParameterChannelEnd'
    });

  cy.visit('#/config');
  DashBoardPage.validateIfDashboardPage();
  DashBoardPage.uploadDashboard(`reporting/${dashboardName}.svg`);
  cy.intercept(`${Cypress.env('BVD_CONTEXT_ROOT')}/rest/${Cypress.env('API_VERSION')}/session/user`).as('pageloadUser');
  EditDashBoardPage.saveConfig(dashboardName);
  cy.wait('@pageloadUser');
  MainPage.logOutOfBVD();
  cy.bvdLogin(userName, userPwd);
  cy.intercept(`${Cypress.env('BVD_CONTEXT_ROOT')}/ui/dashboard/${dashboardName}?isInstance=true`).as('pageLoadingDone');
  cy.intercept(`${Cypress.env('BVD_CONTEXT_ROOT')}/rest/${Cypress.env('API_VERSION')}/session/user`).as('pageloadUser');
  cy.visit(`#/show/${dashboardName}`);
  cy.wait('@pageLoadingDone');
  MainPage.checkText(widgetStart, 'true');
  MainPage.checkText(widgetEnd, 'true');
  cy.wait('@pageloadUser');
  MainPage.logOutOfBVD();
}
