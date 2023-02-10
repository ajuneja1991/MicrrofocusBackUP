const shared = require('../../shared/shared');
import MainPage from '../../../../support/reporting/pageObjects/MainPage';
import EditDashBoardPage from '../../../../support/reporting/pageObjects/EditDashboardPage';
import { dashboardDelete } from '../../../../support/reporting/restUtils/dashboard';
import { uploadFileRequest } from '../../../../support/reporting/restUtils/uploadFile';
import DataCollectorPage from '../../../../support/reporting/pageObjects/DataCollectorPage';
import * as TimeCalculations from '../../../../support/reporting/TimeCalculations';
const dataCollector = require('../../../../support/reporting/restUtils/dataCollector');

const previousYear = 'YEAR';
const startTimeDay = '12:00:00 AM';
const endTimeDay = '11:59:00 PM';
const textWidgetDashboard = 'TextWidgetDrillDown';
const fromdatelist = ['2020', 'Nov 2020', 'Nov 1, 2020', '12', '00', 'AM'];
const todatelist = ['2020', 'Nov 2020', 'Nov 30, 2020', '11', '59', 'PM'];
const paramQueryName = 'Calendar Parameter';
const startWeekDay = Cypress.env('START_OF_THE_WEEK').substr(0, 3);
const paramVariable = 'singleDateParameter';

function checkYear(widgetStart, widgetEnd, currentYear = undefined) {
  const today = new Date();
  if (!currentYear) {
    const startDate = TimeCalculations.getDateAsString(1, 1, today.getFullYear() - 1);
    const endDate = TimeCalculations.getDateAsString(31, 12, today.getFullYear() - 1);
    MainPage.checkText(widgetStart, `${startDate[0]}, ${startTimeDay}`);
    MainPage.checkText(widgetEnd, `${endDate[0]}, ${endTimeDay}`);
  } else {
    const startDate = TimeCalculations.getDateAsString(1, 1, today.getFullYear());
    const endDate = TimeCalculations.getDateAsString(31, 12, today.getFullYear());
    MainPage.checkText(widgetStart, `${startDate[0]}, ${startTimeDay}`);
    MainPage.checkText(widgetEnd, `${endDate[0]}, ${endTimeDay}`);
  }
}

describe('Apply, Reset and Drill-down', shared.defaultTestOptions, () => {
  beforeEach(() => {
    cy.intercept(`${Cypress.env('BVD_CONTEXT_ROOT')}/rest/${Cypress.env('API_VERSION')}/system`).as('pageloadSystem');
    cy.intercept(`${Cypress.env('BVD_CONTEXT_ROOT')}/rest/${Cypress.env('API_VERSION')}/session/user`).as('pageloadUser');
    cy.intercept(`${Cypress.env('BVD_CONTEXT_ROOT')}/rest/${Cypress.env('API_VERSION')}/dashboard/*`).as('dashboardLoad');
    cy.intercept(`${Cypress.env('BVD_CONTEXT_ROOT')}/rest/${Cypress.env('API_VERSION')}/categories?*`).as('categoriesLoad');
    cy.intercept(`${Cypress.env('BVD_CONTEXT_ROOT')}/ui/dashboard/?*`).as('svgDashboardLoad');
    cy.intercept({ method: 'POST', url: `${Cypress.env('BVD_CONTEXT_ROOT')}/rest/${Cypress.env('API_VERSION')}/channel/state` }).as('channelState');
    cy.intercept({ method: 'POST', url: `${Cypress.env('BVD_CONTEXT_ROOT')}/rest/${Cypress.env('API_VERSION')}/dataCollector/channel` }).as('dataCollectorChannel');
  });

  const drillDownParamDashboard = 'DrillDownParam';
  const location = 'location';
  const soldItem = 'sold_item';

  it('Import Dashboards', () => {
    uploadFileRequest('reporting/DrillDownParam.bvd', `${Cypress.env('BVD_CONTEXT_ROOT')}/urest/${Cypress.env('API_VERSION')}/dashboard`);
    uploadFileRequest('reporting/TextWidgetDrillDown.bvd', `${Cypress.env('BVD_CONTEXT_ROOT')}/urest/${Cypress.env('API_VERSION')}/dashboard`);
    uploadFileRequest('reporting/DashboardWithDefaultValues.bvd', `${Cypress.env('BVD_CONTEXT_ROOT')}/urest/${Cypress.env('API_VERSION')}/dashboard`);
    uploadFileRequest('reporting/Drilldown.bvd', `${Cypress.env('BVD_CONTEXT_ROOT')}/urest/${Cypress.env('API_VERSION')}/dashboard`);
    uploadFileRequest('reporting/DatePicker.bvd', `${Cypress.env('BVD_CONTEXT_ROOT')}/urest/${Cypress.env('API_VERSION')}/dashboard`);
  });

  it('Check for default values in dropdown', () => {
    cy.bvdLogin();
    cy.visit('/#/show/DashboardWithDefaultValues?params=none');
    cy.wait(['@pageloadSystem', '@pageloadUser', '@dataCollectorChannel', '@channelState']);
    MainPage.clickSlideOutForParamSelection();
    MainPage.checkIfDropDownHasSelectedParameter('BBN', 'locationparam');
    MainPage.checkIfDropDownHasSelectedParameter(23, 'cpuparam');
    MainPage.checkText('shape3', 'Boeblingen');
    MainPage.checkText('shape2', '23');
  });

  it('Should check the status for apply and reset button', () => {
    cy.bvdLogin();
    cy.visit(`/#/show/${textWidgetDashboard}?params=none`);
    cy.wait(['@pageloadSystem', '@pageloadUser', '@dataCollectorChannel', '@channelState']);
    // check for status of apply and reset button
    MainPage.clickSlideOutForParamSelection();
    MainPage.checkForApplyButtonStatus('be.disabled');
    MainPage.checkForResetButtonStatus('be.disabled');
    MainPage.selectDropDownParameter('MNCH', location);
    MainPage.checkForApplyButtonStatus('not.be.disabled');
    MainPage.checkForResetButtonStatus('not.be.disabled');
    MainPage.resetParameterValue();
    MainPage.checkIfDropDownIsEmpty(location);
    MainPage.checkIfDropDownIsEmpty(soldItem);
    MainPage.checkForApplyButtonStatus('be.disabled');
    MainPage.selectDropDownParameter(40, soldItem);
    MainPage.clickApplyAndCheckStatus();
    MainPage.checkIfDropDownHasSelectedParameter(40, 'sold_item');
    cy.url().should('include', 'params=sold_item%3D40');
    MainPage.checkText('shape5', '40');
    MainPage.resetParameterValue();
    MainPage.checkForApplyButtonStatus('not.be.disabled');
    MainPage.selectDropDownParameter(55, soldItem);
    MainPage.selectDropDownParameter('IND', location);
    MainPage.clickApplyAndCheckStatus();
    MainPage.checkIfDropDownHasSelectedParameter(55, 'sold_item');
    MainPage.checkIfDropDownHasSelectedParameter('IND', 'location');
    cy.url().should('include', 'params=sold_item%3D55;location%3DIndia');
    MainPage.checkText('shape5', '55');
    MainPage.checkText('shape4', 'India');
  });

  it('Cross launch to dashboard', () => {
    // Test Launch External URLby specified drilldown dashboard
    cy.bvdLogin();
    cy.visit(`/#/show/${drillDownParamDashboard}?params=none`);
    cy.wait(['@pageloadSystem', '@pageloadUser', '@dataCollectorChannel']);
    MainPage.clickSlideOutForParamSelection();
    MainPage.selectDropDownParameter(55, soldItem);
    MainPage.selectDropDownParameter('JKRT', location);
    MainPage.clickApplyAndCheckStatus();
    cy.get('path');
    cy.url().should('include', 'params=sold_item%3D55;location%3DJakarta');
    cy.get('g[id="group1"]').click();
    cy.url().should('include', 'params=sold_item%3D55;location%3DJakarta');
    MainPage.checkText('shape5', '55');
    MainPage.checkText('shape4', 'Jakarta');
    MainPage.clickSlideOutForParamSelection();
    MainPage.checkIfDropDownHasSelectedParameter(55, 'sold_item');
    MainPage.checkIfDropDownHasSelectedParameter('JKRT', 'location');
    MainPage.selectDropDownParameter(60, soldItem);
    MainPage.clickApplyAndCheckStatus();
    MainPage.checkText('shape5', '60');
    MainPage.checkText('shape4', 'Jakarta');
  });

  it('Cross launch to external URL', () => {
    cy.bvdLogin();
    cy.visit(`/#/show/${drillDownParamDashboard}?params=none`);
    cy.wait(['@pageloadSystem', '@pageloadUser', '@dataCollectorChannel', '@channelState']);
    EditDashBoardPage.editDashboard();
    cy.wait(['@categoriesLoad', '@svgDashboardLoad']);
    EditDashBoardPage.selectWidget('group1');
    EditDashBoardPage.inputHyperlinkURL(`https://www.google.com`);
    cy.wait(['@pageloadUser']);
    cy.visit(`/#/show/${drillDownParamDashboard}?params=none`);
    cy.wait(['@pageloadUser', '@dataCollectorChannel', '@channelState']);
    MainPage.checkIfExternalLinkBannerIsPresent();
    MainPage.hideExternalBanner();
    cy.get('[data-cy=external-link]').should('not.exist');
    cy.get('g[id="group1"]').click();
    cy.wait('@pageloadUser');
  });

  it('Cross launch to dashboard using hardcoded parameter values', () => {
    cy.bvdLogin();
    // Completely hardcoded parameter values
    cy.visit(`/#/show/DatePicker?params=none`);
    cy.wait(['@pageloadSystem', '@pageloadUser', '@dataCollectorChannel', '@channelState']);
    cy.get('g[id="shape1005"]').click();
    cy.wait('@channelState');
    cy.url().should('include', 'params=param_value%3Dhardcoded_value');
    MainPage.checkText('shape1', 'hardcoded_value');

    // Combination of hardcoded and applied parameter values
    cy.visit(`/#/show/DatePicker?params=none`);
    cy.wait(['@pageloadUser', '@dataCollectorChannel', '@channelState']);
    MainPage.clickSlideOutForParamSelection();
    MainPage.selectDropDownParameter('param_value', 'param_value');
    MainPage.clickApplyAndCheckStatus();
    MainPage.checkText('shape1006', 'param_value');
    cy.get('g[id="shape1006"]').click();
    cy.wait('@channelState');
    cy.url().should('include', 'params=param_value%3Dparam_value;rio%3Drio');
    MainPage.checkText('shape1', 'param_value');
    MainPage.clickSlideOutForParamSelection();
    MainPage.checkIfDropDownHasSelectedParameter('param_value', 'param_value');
  });

  it('Drilldown to dashboard without passing active parameters', () => {
    cy.bvdLogin();
    cy.visit(`/#/show/${drillDownParamDashboard}?params=none`);
    cy.wait(['@pageloadSystem', '@pageloadUser', '@dataCollectorChannel', '@channelState']);
    EditDashBoardPage.editDashboard();
    cy.wait(['@categoriesLoad', '@svgDashboardLoad']);
    EditDashBoardPage.selectWidget('group1');
    EditDashBoardPage.openDashboard(textWidgetDashboard);
    EditDashBoardPage.applyConfig();
    EditDashBoardPage.cancelConfig();
    cy.wait(['@pageloadUser', '@channelState']);
    cy.get('g[id="group1"]').click();
    cy.wait(['@pageloadUser', '@channelState']);
    cy.url().should('include', `${textWidgetDashboard}?params=none`);

    /* Select value from slide out of Drilldown svg ,apply on screen ,validate url then click on it and validate
    textwidget dashboard does not have the specified value in url and svg*/
    cy.visit(`/#/show/${drillDownParamDashboard}?params=none`);
    cy.wait(['@pageloadUser', '@dataCollectorChannel', '@channelState']);
    MainPage.clickSlideOutForParamSelection();
    MainPage.selectDropDownParameter(55, soldItem);
    MainPage.selectDropDownParameter('IND', location);
    MainPage.clickApplyAndCheckStatus();
    cy.get('path');
    cy.url().should('include', 'params=sold_item%3D55;location%3DIndia');
    cy.get('g#group1').click();
    cy.wait(['@pageloadUser', '@channelState']);
    cy.url().should('include', `${textWidgetDashboard}?params=none`);
    MainPage.checkText('shape5', '60');
    MainPage.checkText('shape4', '????');
    MainPage.clickSlideOutForParamSelection();
    MainPage.checkIfDropDownHasSelectedParameter('', 'sold_item');
    MainPage.checkIfDropDownHasSelectedParameter('', 'location');
  });

  it('Drilldown to dashboard with passing active parameters', () => {
    cy.bvdLogin();
    cy.visit(`/#/show/${drillDownParamDashboard}?params=none`);
    cy.wait(['@pageloadSystem', '@pageloadUser', '@dataCollectorChannel', '@channelState']);
    EditDashBoardPage.editDashboard();
    cy.wait(['@categoriesLoad', '@svgDashboardLoad']);
    EditDashBoardPage.selectWidget('group1');
    cy.get('#opr_hyperlink_params').click();
    EditDashBoardPage.applyConfig();
    EditDashBoardPage.cancelConfig();
    cy.wait(['@pageloadUser', '@channelState']);
    MainPage.clickSlideOutForParamSelection();
    MainPage.selectDropDownParameter(55, soldItem);
    MainPage.selectDropDownParameter('JKRT', location);
    MainPage.clickApplyAndCheckStatus();
    cy.get('path');
    cy.url().should('include', 'params=sold_item%3D55;location%3DJakarta');
    cy.get('g#group1').click();
    cy.wait(['@pageloadUser', '@channelState']);
    MainPage.checkText('shape5', '55');
    MainPage.checkText('shape4', 'Jakarta');
    MainPage.clickSlideOutForParamSelection();
    MainPage.checkIfDropDownHasSelectedParameter(55, 'sold_item');
    MainPage.checkIfDropDownHasSelectedParameter('JKRT', 'location');
    MainPage.checkForApplyButtonStatus('be.disabled');
    MainPage.checkForResetButtonStatus('not.be.disabled');
    cy.url().should('include', 'params=sold_item%3D55;location%3DJakarta');
    // default data of Drilldown svg has to be seen on textwidget dashboard with url and the data along with slide out value
    cy.visit(`/#/show/${drillDownParamDashboard}?params=none`);
    cy.wait(['@pageloadUser', '@dataCollectorChannel', '@channelState']);
    MainPage.clickSlideOutForParamSelection();
    MainPage.checkIfDropDownHasSelectedParameter('', 'sold_item');
    MainPage.checkIfDropDownHasSelectedParameter('', 'location');
    cy.get('g#group1').click();
    cy.wait(['@pageloadUser', '@channelState']);
    cy.url().should('include', `${textWidgetDashboard}?params=none`);
    MainPage.checkText('shape5', '60');
    MainPage.checkText('shape4', '????');
    MainPage.clickSlideOutForParamSelection();
    MainPage.checkIfDropDownHasSelectedParameter('', 'sold_item');
    MainPage.checkIfDropDownHasSelectedParameter('', 'location');
  });

  it('Drilldown to validate DateRange', () => {
    const previousYearNumber = new Date().getFullYear() - 1;
    const currentYearNumber = new Date().getFullYear();
    cy.bvdLogin();
    cy.visit(`/#/show/${drillDownParamDashboard}?params=none`);
    cy.wait(['@pageloadSystem', '@pageloadUser', '@dataCollectorChannel', '@channelState']);
    MainPage.clickSlideOutForParamSelection();
    MainPage.selectPredefinedTime(previousYear);
    MainPage.leftBarParameterApplyValue(false);
    cy.get('path');
    cy.url().should('include', 'params=Calendar:start%3DYEAR;Calendar:end%3DYEAR');
    checkYear('shape187', 'shape188');
    cy.get('g#shape187').click();
    cy.wait(['@pageloadUser', '@channelState']);
    checkYear('shape8', 'shape9');
    cy.url().should('include', `params=Calendar:start%3D${previousYearNumber}-01-01%2000:00;Calendar:end%3D${previousYearNumber}-12-31%2023:59`);
    MainPage.clickSlideOutForParamSelection();
    cy.get('[data-cy="date-string"]').invoke('text').then(text => {
      // remove the space char
      expect(text.replace(/\u00a0/g, ' ')).equal(`01/01/${previousYearNumber} 12:00 AM — 12/31/${previousYearNumber} 11:59 PM`);
    });

    // Check error message with invalid params in url
    cy.visit(`#/show/${textWidgetDashboard}?params=Calendar:start%3DYEAR;Calendar:endYEAR`);
    cy.wait(['@dataCollectorChannel', '@channelState']);
    cy.get('[data-cy="error-banner"]').should('include.text', 'One or more parameter values are invalid');

    // 2.Select a Date from dropdown in slide out and click on HyperLink to pass it to TextWidgetDrilldown
    cy.visit(`/#/show/${drillDownParamDashboard}?params=none`);
    cy.wait(['@channelState', '@dataCollectorChannel']);
    MainPage.clickSlideOutForParamSelection();
    MainPage.selectDateParamsFromSlideout(fromdatelist, todatelist, false, true);
    MainPage.leftBarParameterApplyValue(false);
    cy.url().should('include', `${drillDownParamDashboard}?params=Calendar:start%3D2020-11-01%2000:00:00;Calendar:end%3D2020-11-30%2023:59:00`);
    MainPage.checkText('shape187', '11/1/2020, 12:00:00 AM');
    MainPage.checkText('shape188', '11/30/2020, 11:59:00 PM');
    MainPage.clickSlideOutForParamSelection();
    cy.get('[data-cy="date-string"]').invoke('text').then(text => {
      // remove the space char
      expect(text.replace(/\u00a0/g, ' ')).equal('11/01/2020 12:00 AM — 11/30/2020 11:59 PM');
    });
    MainPage.checkIfDropDownHasDateRangeAbsoluteValue(`11/01/2020 12:00 AM — 11/30/2020 11:59 PM`, `date-string`);
    cy.get('g#shape187').click();
    cy.wait(['@pageloadUser', '@channelState']);
    cy.url().should('include', `${textWidgetDashboard}?params=Calendar:start%3D2020-11-01%2000:00:00;Calendar:end%3D2020-11-30%2023:59:00`);
    MainPage.checkText('shape8', '11/1/2020, 12:00:00 AM');
    MainPage.checkText('shape9', '11/30/2020, 11:59:00 PM');
    MainPage.clickSlideOutForParamSelection();
    MainPage.checkIfDropDownHasDateRangeAbsoluteValue(`11/01/2020 12:00 AM — 11/30/2020 11:59 PM`, `date-string`);

    // 3. Validate the default value is displayed and click on Hyperlink ,the default value should be passed to TextWidgetDrilldown
    MainPage.navigateToDataCollector();
    DataCollectorPage.editQuery({ paramQueryName, predefinedId: 'T_YEAR' });
    cy.visit(`/#/show/${drillDownParamDashboard}?params=none`);
    cy.wait(['@channelState', '@dataCollectorChannel']);
    MainPage.clickSlideOutForParamSelection();
    MainPage.checkIfDropDownHasDateRange('This Year', `date-string`);
    checkYear('shape187', 'shape188', 'currentYear');
    cy.get('g#shape187').click();
    cy.wait(['@pageloadUser', '@channelState']);
    checkYear('shape8', 'shape9', 'currentYear');
    cy.url().should('include', `params=Calendar:start%3D${currentYearNumber}-01-01%2000:00;Calendar:end%3D${currentYearNumber}-12-31%2023:59`);
    // checkYearInUrl('currentYear');
    MainPage.clickSlideOutForParamSelection();
    cy.get('[data-cy="date-string"]').invoke('text').then(text => {
      // remove the space char
      expect(text.replace(/\u00a0/g, ' ')).equal(`01/01/${currentYearNumber} 12:00 AM — 12/31/${currentYearNumber} 11:59 PM`);
    });

    // 4. Override Default and Select Previous Year from drop down in slide out under Relative range and click on Hyperlink to pass it to TextWidgetDrilldown
    cy.visit(`/#/show/${drillDownParamDashboard}?params=none`);
    cy.wait(['@dataCollectorChannel', '@channelState']);
    MainPage.clickSlideOutForParamSelection();
    MainPage.selectPredefinedTime(previousYear);
    MainPage.leftBarParameterApplyValue(false);
    cy.get('path');
    cy.url().should('include', 'params=Calendar:start%3DYEAR;Calendar:end%3DYEAR');
    checkYear('shape187', 'shape188');
    cy.get('g#shape187').click();
    cy.wait(['@pageloadUser', '@channelState']);
    checkYear('shape8', 'shape9');
    cy.url().should('include', `${textWidgetDashboard}?params=Calendar:start%3D${previousYearNumber}-01-01%2000:00;Calendar:end%3D${previousYearNumber}-12-31%2023:59`);
    MainPage.clickSlideOutForParamSelection();
    cy.get('[data-cy="date-string"]').invoke('text').then(text => {
      // remove the space char
      expect(text.replace(/\u00a0/g, ' ')).equal(`01/01/${previousYearNumber} 12:00 AM — 12/31/${previousYearNumber} 11:59 PM`);
    });
  });

  it('Drilldown to validate singleDate Parameter', () => {
    // validate url contains date ,date value in slide out for single date
    cy.bvdLogin();
    cy.visit(`/#/show/${drillDownParamDashboard}?params=none`);
    cy.wait(['@pageloadSystem', '@pageloadUser', '@dataCollectorChannel', '@channelState']);
    MainPage.checkText('shape190', '12/7/2020, 2:00:00 PM');
    cy.get('g#shape190').click();
    cy.wait(['@pageloadUser', '@channelState']);
    cy.url().should('include', `${textWidgetDashboard}?params=singleDateParameter%3D2020-12-07%2014:00:00`);
    MainPage.checkText('shape11', '12/7/2020, 2:00:00 PM');
    MainPage.clickSlideOutForParamSelection();
    MainPage.checkIfDropDownHasSelectedParameter('12/07/2020 02:00 PM', 'singleDateParameter');
    // Defect 1434094 - Value from Single date selector is not carry forwarded on Applying filter after drill down from any parent to child BVD report
    MainPage.selectDropDownParameter(55, soldItem);
    const dateValue = ['Dec 2020', 'Dec 6, 2020', '11', '00', 'AM'];
    MainPage.selectSingleDateParamFromSlideout(startWeekDay, paramVariable, false, dateValue);
    MainPage.clickApplyAndCheckStatus();
    MainPage.checkText('shape5', '55');
    MainPage.checkText('shape4', 'Jakarta');
    MainPage.checkText('shape11', '12/6/2020, 11:00:00 AM');
    MainPage.checkIfDropDownHasSelectedParameter(55, 'sold_item');
    MainPage.checkIfDropDownHasSelectedParameter('', 'location');
    MainPage.checkIfDropDownHasSelectedParameter('12/06/2020 11:00 AM', 'singleDateParameter');
  });

  after(() => {
    cy.bvdLogout();
    dataCollector.deleteAllQueries();
    dashboardDelete('DashboardWithDefaultValues');
    dashboardDelete('DatePicker');
    dashboardDelete('Drilldown');
    dashboardDelete(drillDownParamDashboard);
    dashboardDelete(textWidgetDashboard);
  });
});

