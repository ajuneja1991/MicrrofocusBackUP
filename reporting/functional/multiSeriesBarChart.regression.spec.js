const shared = require('../../shared/shared');
import MainPage from '../../../../support/reporting/pageObjects/MainPage';
import EditDashboardPage from '../../../../support/reporting/pageObjects/EditDashboardPage';
import { uploadFileRequest } from '../../../../support/reporting/restUtils/uploadFile';
import dataCollector from '../../../../support/reporting/restUtils/dataCollector';
import dashboard from '../../../../support/reporting/restUtils/dashboard';

const dashboardName = 'MultiSeriesBarChart';
const widget = 'group271';
const hyperlinkDashboard = 'RBACTest';
const blue = '#0073e7';
const pink = '#c6179d';

describe('MultiSeriesBarChart Test', shared.defaultTestOptions, () => {
  beforeEach(() => {
    cy.intercept(`${Cypress.env('BVD_CONTEXT_ROOT')}/rest/${Cypress.env('API_VERSION')}/system`).as('pageloadSystem');
    cy.intercept(`${Cypress.env('BVD_CONTEXT_ROOT')}/rest/${Cypress.env('API_VERSION')}/session/user`).as('pageloadUser');
    cy.intercept({ method: 'POST', url: `${Cypress.env('BVD_CONTEXT_ROOT')}/rest/${Cypress.env('API_VERSION')}/channel/state` }).as('channelState');
    cy.intercept(`${Cypress.env('BVD_CONTEXT_ROOT')}/rest/${Cypress.env('API_VERSION')}/dashboard/${dashboardName}`).as('pageloadDashboard');
    cy.bvdLogin();
    uploadFileRequest(`reporting/${dashboardName}.bvd`, `${Cypress.env('BVD_CONTEXT_ROOT')}/urest/${Cypress.env('API_VERSION')}/dashboard`);
  });

  it('Validate Data on MultiSeriesBarChart', () => {
    cy.visit(`/#/show/${dashboardName}?params=none`);
    cy.wait(['@pageloadUser', '@channelState']);
    cy.get('#load-spinner').should('not.be.visible');
    MainPage.barCount(widget, 3, blue);
    MainPage.barCount(widget, 3, pink);
    MainPage.getXandYAxisText(widget, ['0', '20', '40', '60', '80', '100']);
    MainPage.getDataPointsTitleWithoutGMT(widget, ['Data1: 45 03/01/2019', 'Data1: 92 03/02/2019', 'Data1: 56 03/03/2019', 'Data2: 46 03/01/2019', 'Data2: 23 03/02/2019', 'Data2: 67 03/03/2019']);
  });

  it('Validate data after setting Show Legend', () => {
    cy.visit(`/#/config/${dashboardName}`);
    cy.wait(['@pageloadDashboard']);
    EditDashboardPage.selectWidget(widget);
    EditDashboardPage.selectShowLegend();
    EditDashboardPage.saveConfig(dashboardName);
    cy.visit(`/#/show/${dashboardName}?params=none`);
    cy.wait(['@pageloadUser', '@channelState']);
    cy.get('#load-spinner').should('not.be.visible');
    MainPage.barCount(widget, 4, blue);
    MainPage.barCount(widget, 4, pink);
    MainPage.getXandYAxisText(widget, ['Data1', 'Data2']);
    MainPage.getDataPointsTitleWithoutGMT(widget, ['Data1: 45 03/01/2019', 'Data1: 92 03/02/2019', 'Data1: 56 03/03/2019', 'Data2: 46 03/01/2019', 'Data2: 23 03/02/2019', 'Data2: 67 03/03/2019']);
  });

  it('Validate data after setting Calculation Rule', () => {
    cy.visit(`/#/config/${dashboardName}`);
    cy.wait(['@pageloadDashboard']);
    EditDashboardPage.selectWidget(widget);
    EditDashboardPage.selectShowLegend();
    EditDashboardPage.setCalculationRule('Data1 + Data2');
    EditDashboardPage.clearDataFields();
    EditDashboardPage.setMultipleDataField('calculatedProperty');
    EditDashboardPage.saveConfig(dashboardName);
    cy.visit(`/#/show/${dashboardName}?params=none`);
    cy.wait(['@pageloadUser', '@channelState']);
    cy.get('#load-spinner').should('not.be.visible');
    MainPage.barCount(widget, 4, blue);
    MainPage.getXandYAxisText(widget, ['calculatedProperty']);
    MainPage.getDataPointsTitleWithoutGMT(widget, ['calculatedProperty: 91 03/01/2019', 'calculatedProperty: 115 03/02/2019', 'calculatedProperty: 123 03/03/2019']);
  });

  it('Validate Hyperlink to Dashboard and URL for MultiSeriesBarChart', () => {
    uploadFileRequest(`reporting/${hyperlinkDashboard}.bvd`, `${Cypress.env('BVD_CONTEXT_ROOT')}/urest/${Cypress.env('API_VERSION')}/dashboard`);
    cy.visit(`/#/config/${dashboardName}`);
    cy.wait(['@pageloadDashboard']);
    EditDashboardPage.selectWidget(widget);
    EditDashboardPage.inputHyperlinkToDashboard(hyperlinkDashboard);
    EditDashboardPage.saveConfig(dashboardName);
    cy.visit(`/#/show/${dashboardName}?params=none`);
    cy.wait(['@pageloadUser', '@channelState']);
    cy.get('#load-spinner').should('not.be.visible');
    cy.get('#group271').click();
    cy.url().should('include', `${hyperlinkDashboard}?params=none`);
  });

  it('Validate Hyperlink to  URL for MultiSeriesBarChart', () => {
    cy.visit(`/#/config/${dashboardName}`);
    cy.wait(['@pageloadDashboard']);
    EditDashboardPage.selectWidget(widget);
    EditDashboardPage.inputHyperlinkURL('https://www.google.de', dashboardName);
    cy.window().then(window => {
      cy.spy(window, 'open').as('redirect');
    });
    cy.visit(`/#/show/${dashboardName}?params=none`);
    cy.wait(['@pageloadUser', '@channelState']);
    cy.get('#load-spinner').should('not.be.visible');
    cy.get('#group271').click();
    cy.get('@redirect')
      .should('be.calledWith',
        Cypress.sinon.match('https://www.google.de'));
  });

  it('Validate Visibility Rule for MultiSeriesBarChart', () => {
    cy.visit(`/#/config/${dashboardName}`);
    cy.wait(['@pageloadDashboard']);
    EditDashboardPage.selectWidget(widget);
    EditDashboardPage.setVisibilityRuleForWidget('Data1<10');
    EditDashboardPage.saveConfig(dashboardName);
    cy.visit(`/#/show/${dashboardName}?params=none`);
    cy.wait(['@pageloadUser', '@channelState']);
    cy.get('#load-spinner').should('not.be.visible');
    MainPage.checkIfWidgetIsHidden(widget);
  });

  afterEach(() => {
    // LogOut of session if test fails during execution and logout does not occur through UI
    cy.bvdLogout();
    dashboard.dashboardDelete(dashboardName);
    dataCollector.deleteAllQueries();
  });
});
