const shared = require('../../shared/shared');

import DataCollectorPage from '../../../../support/reporting/pageObjects/DataCollectorPage';
import dataCollector from '../../../../support/reporting/restUtils/dataCollector';
import MainPage from '../../../../support/reporting/pageObjects/MainPage';
import EditDashboardPage from '../../../../support/reporting/pageObjects/EditDashboardPage';
import dashboard from '../../../../support/reporting/restUtils/dashboard';
import { uploadFileRequest } from '../../../../support/reporting/restUtils/uploadFile';

describe('Cascade Parameters test', shared.defaultTestOptions, () => {
  const startWeekDay = Cypress.env('START_OF_THE_WEEK').substr(0, 3);

  beforeEach(() => {
    cy.intercept(`${Cypress.env('BVD_CONTEXT_ROOT')}/rest/${Cypress.env('API_VERSION')}/system`).as('pageloadSystem');
    cy.intercept(`${Cypress.env('BVD_CONTEXT_ROOT')}/rest/${Cypress.env('API_VERSION')}/session/user`).as('pageloadUser');
    cy.intercept(`${Cypress.env('BVD_CONTEXT_ROOT')}/rest/${Cypress.env('API_VERSION')}/categories?*`).as('categoriesLoad');
    cy.intercept(`${Cypress.env('BVD_CONTEXT_ROOT')}/ui/dashboard/?*`).as('svgDashboardLoad');
    cy.intercept(`${Cypress.env('BVD_CONTEXT_ROOT')}/rest/${Cypress.env('API_VERSION')}/dataCollector/*`).as('editParameterQuery');
    cy.intercept({ method: 'POST', path: `${Cypress.env('BVD_CONTEXT_ROOT')}/rest/${Cypress.env('API_VERSION')}/channel/state` }).as('channelState');
    cy.intercept({ method: 'POST', path: `${Cypress.env('BVD_CONTEXT_ROOT')}/rest/${Cypress.env('API_VERSION')}/dataCollector/channel` }).as('dataCollectorChannel');
    cy.intercept({ method: 'POST', path: `${Cypress.env('BVD_CONTEXT_ROOT')}/rest/${Cypress.env('API_VERSION')}/dataCollector` }).as('saveQuery');
    cy.intercept({ method: 'POST', path: `${Cypress.env('BVD_CONTEXT_ROOT')}/rest/${Cypress.env('API_VERSION')}/dataCollector/*/values` }).as('parameterExecution');
  });

  it('Import Dashboard and create parameter queries', () => {
    uploadFileRequest('reporting/nestedParam.bvd', `${Cypress.env('BVD_CONTEXT_ROOT')}/urest/${Cypress.env('API_VERSION')}/dashboard`);
    uploadFileRequest('reporting/nestedParamDrilldown.bvd', `${Cypress.env('BVD_CONTEXT_ROOT')}/urest/${Cypress.env('API_VERSION')}/dashboard`);
    cy.bvdLogin();
    dataCollector.createDateTypeParameterQuery('Single Date', 'singleDate', 'single_date', '');
    dataCollector.createDateTypeParameterQuery('Calendar Parameter', 'specificDate', 'calendar', '');
  });

  it('Check for multiple dependency in a parameter query', () => {
    cy.bvdLogin();
    cy.visit('/#/dataCollector');
    cy.wait(['@pageloadSystem', '@pageloadUser']);
    DataCollectorPage.clickNewQuery('Param Query');
    cy.enter('#contentFrame').then(getBody => {
      getBody().find('#name-input_displayname').click();
      getBody().find('#name-input_displayname').type('Test Nested Param');
      getBody().find('#variable-input_name').click();
      getBody().find('#variable-input_name').type('test');
      getBody().find('#description-input').click();
      getBody().find('#description-input').type('Testing multiple dependecies');
      getBody().find('#sqlparam').click();

      getBody().find('#query-text').click();
      // eslint-disable-next-line no-template-curly-in-string
      getBody().find('#query-text').type('select * from bvd_lwr_demo where ${id = ${id}} and ${location = ${location}}', { parseSpecialCharSequences: false });
      getBody().find('#buttonExecuteQuery').click();
      getBody().find('[data-cy="multiple-params-warning"]');
    });
  });

  it('Check for cyclic dependency', () => {
    cy.bvdLogin();
    cy.visit('/#/dataCollector');
    cy.wait(['@pageloadSystem', '@pageloadUser']);
    cy.enter('#contentFrame').then(getBody => {
      getBody().find('div[text="location (loc)"]').click();
      getBody().find('[data-cy="edit-query"]').first().click();
      getBody().find('opr-code-editor#query-text').type('{selectall}{backspace}{selectall}{backspace}');
      // eslint-disable-next-line no-template-curly-in-string
      getBody().find('#query-text').click().type('select distinct location from bvd_lwr_demo where ${sold_item = ${si}}', { parseSpecialCharSequences: false });
      getBody().find('#buttonExecuteQuery').click();
      getBody().find('[data-cy="cyclic-dependency-error"]').should('exist');
      getBody().find('[data-cy="value-selection-column"]').should('not.exist');
      getBody().find('[data-cy="label-selection-column"]').should('not.exist');
      getBody().find('[data-cy="default-value-selection"]').should('not.exist');
    });
  });

  it('Check for warning message in case of non-existing parameter', () => {
    cy.bvdLogin();
    cy.visit('/#/dataCollector');
    cy.wait(['@pageloadSystem', '@pageloadUser']);
    cy.enter('#contentFrame').then(getBody => {
      getBody().find('div[text="location (loc)"]').click();
      getBody().find('[data-cy="edit-query"]').first().click();
      getBody().find('opr-code-editor#query-text').type('{selectall}{backspace}{selectall}{backspace}');
      // eslint-disable-next-line no-template-curly-in-string
      getBody().find('#query-text').click().type('select distinct location from bvd_lwr_demo where ${sold_item = ${test}}', { parseSpecialCharSequences: false });
      getBody().find('#buttonExecuteQuery').click();
      getBody().find('[data-cy="parameter-not-exist"]').should('exist');
      getBody().find('[data-cy="ignore-parameters"]').should('exist');
    });
  });

  it('Check cascade parameter structure', () => {
    cy.bvdLogin();
    cy.visit('/#/show/nestedParam?params=none');
    cy.wait(['@pageloadSystem', '@pageloadUser', '@channelState']);
    MainPage.clickSlideOutForParamSelection();
    MainPage.checkForApplyButtonStatus('be.disabled');
    MainPage.checkForResetButtonStatus('be.disabled');
    MainPage.selectDropDownParameter('Munich', 'loc');
    cy.wait('@parameterExecution');
    MainPage.selectDropDownParameter(61, 'idparam');
    cy.wait('@parameterExecution');
    MainPage.selectDropDownParameter(3, 'si');
    MainPage.checkForApplyButtonStatus('not.be.disabled');
    MainPage.checkForResetButtonStatus('not.be.disabled');
    MainPage.clearDropdownValue('loc');
    cy.get('bvd-ng2-dropdown[data-cy="idparam"]').should('not.exist');
    cy.get('bvd-ng2-dropdown[data-cy="si"]').should('not.exist');
    MainPage.checkForApplyButtonStatus('be.disabled');
    MainPage.checkForResetButtonStatus('be.disabled');
  });

  it('Reset after cascade parameter selection', () => {
    cy.bvdLogin();
    cy.visit('/#/show/nestedParam?params=none');
    cy.wait(['@pageloadSystem', '@pageloadUser', '@channelState']);
    MainPage.clickSlideOutForParamSelection();
    MainPage.checkForApplyButtonStatus('be.disabled');
    MainPage.checkForResetButtonStatus('be.disabled');
    MainPage.selectDropDownParameter('Munich', 'loc');
    cy.wait('@parameterExecution');
    MainPage.selectDropDownParameter(61, 'idparam');
    cy.wait('@parameterExecution');
    MainPage.selectDropDownParameter(3, 'si');
    MainPage.checkForApplyButtonStatus('not.be.disabled');
    MainPage.checkForResetButtonStatus('not.be.disabled');
    MainPage.resetParameterValue();
    MainPage.checkIfDropDownIsEmpty('loc');
    cy.get('bvd-ng2-dropdown[data-cy="idparam"]').should('not.exist');
    cy.get('bvd-ng2-dropdown[data-cy="si"]').should('not.exist');
    MainPage.checkForApplyButtonStatus('be.disabled');
    MainPage.checkForResetButtonStatus('be.disabled');
  });

  it('Apply after cascade parameter selection', () => {
    cy.bvdLogin();
    cy.visit('/#/show/nestedParam?params=none');
    cy.wait(['@pageloadSystem', '@pageloadUser', '@channelState']);
    MainPage.clickSlideOutForParamSelection();
    MainPage.checkForApplyButtonStatus('be.disabled');
    MainPage.checkForResetButtonStatus('be.disabled');
    MainPage.selectDropDownParameter('Stuttgart', 'loc');
    cy.wait('@parameterExecution');
    MainPage.selectDropDownParameter(59, 'idparam');
    cy.wait('@parameterExecution');
    MainPage.selectDropDownParameter(1, 'si');
    MainPage.checkForApplyButtonStatus('not.be.disabled');
    MainPage.checkForResetButtonStatus('not.be.disabled');
    MainPage.clickApplyAndCheckStatus();
    MainPage.checkIfDropDownHasSelectedParameter('Stuttgart', 'loc');
    MainPage.checkIfDropDownHasSelectedParameter(59, 'idparam');
    MainPage.checkIfDropDownHasSelectedParameter(1, 'si');
    MainPage.checkForApplyButtonStatus('be.disabled');
    MainPage.checkForResetButtonStatus('not.be.disabled');
    cy.get('[data-cy="slideout-button"]').click();
    MainPage.checkText('shape1', '1/28/2017, 9:00:00 AM');
  });

  it('Drilldown with cascade parameter by with internal url', () => {
    cy.bvdLogin();
    cy.visit('#/show/nestedParam?params=loc%3DStuttgart;idparam%3D59;si%3D1');
    cy.wait(['@pageloadSystem', '@pageloadUser', '@channelState']);
    cy.get('g#shape1').click();
    cy.wait(['@pageloadUser', '@channelState']);
    cy.url().should('include', 'nestedParamDrilldown?params=loc%3DStuttgart;idparam%3D59;si%3D1');
    cy.get('[data-cy="slideout-button"]').click();
    MainPage.checkIfDropDownHasSelectedParameter('Stuttgart', 'loc');
    MainPage.checkIfDropDownHasSelectedParameter(59, 'idparam');
    MainPage.checkIfDropDownHasSelectedParameter(1, 'si');
    MainPage.checkForApplyButtonStatus('be.disabled');
    MainPage.checkForResetButtonStatus('not.be.disabled');
    MainPage.checkText('shape1', '1/28/2017, 9:00:00 AM');
  });

  it('Check for no data available message in slide out for single date time param', () => {
    cy.bvdLogin();
    cy.visit('/#/dataCollector');
    cy.wait(['@pageloadSystem', '@pageloadUser']);
    cy.enter('#contentFrame').then(getBody => {
      getBody().find('[data-cy="queryList"]').should('be.visible');
      getBody().find('div[text="location (loc)"]').click();
      getBody().find('[data-cy="edit-query"]').first().click();
      cy.wait('@editParameterQuery');
      getBody().find('opr-code-editor#query-text').type('{selectall}{backspace}{selectall}{backspace}');
      // eslint-disable-next-line no-template-curly-in-string
      getBody().find('#query-text').click().type('select distinct location from bvd_lwr_demo where ${timestamp < ${single_date}}', { parseSpecialCharSequences: false });
      getBody().find('#buttonExecuteQuery').click();
      getBody().find('#buttonConfirm').click();
    });
    cy.visit('/#/show/nestedParam?params=none');
    cy.wait('@channelState');
    MainPage.clickSlideOutForParamSelection();
    const dateValue = ['Nov 2016', 'Nov 30, 2016', '12', '00', 'AM'];
    MainPage.selectSingleDateParamFromSlideoutForNestedParam(startWeekDay, 'single_date', false, dateValue, '2016');
    cy.get('bvd-ng2-dropdown[data-cy="loc"]').should('not.exist');
    cy.get('[data-cy="no-data-found"]');
  });

  it('Check retention of single date time param with nested tree structure', () => {
    cy.bvdLogin();
    cy.visit('/#/show/nestedParam?params=none');
    cy.wait(['@pageloadSystem', '@pageloadUser', '@channelState']);
    MainPage.clickSlideOutForParamSelection();
    const date = ['Nov 2020', 'Nov 30, 2020', '12', '00', 'AM'];
    MainPage.selectSingleDateParamFromSlideoutForNestedParam(startWeekDay, 'single_date', false, date, '2020');
    cy.get('bvd-ng2-dropdown[data-cy="loc"]').should('exist');
    MainPage.selectDropDownParameter('Stuttgart', 'loc');
    cy.wait('@parameterExecution');
    MainPage.selectDropDownParameter(59, 'idparam');
    cy.wait('@parameterExecution');
    MainPage.selectDropDownParameter(1, 'si');
    MainPage.clickApplyAndCheckStatus();
    MainPage.validateDatePickerWithProvidedValue('11/30/2020 12:00 AM', 'single_date');
    MainPage.checkIfDropDownHasSelectedParameter('Stuttgart', 'loc');
    MainPage.checkIfDropDownHasSelectedParameter(59, 'idparam');
    MainPage.checkIfDropDownHasSelectedParameter(1, 'si');
  });

  it('Edit parameter query and add a dependency for calendar parameter', () => {
    cy.bvdLogin();
    cy.visit('/#/dataCollector');
    cy.wait(['@pageloadSystem', '@pageloadUser']);
    cy.enter('#contentFrame').then(getBody => {
      getBody().find('[data-cy="queryList"]').should('be.visible');
      getBody().find('div[text="sold_item (si)"]').click();
      getBody().find('[data-cy="edit-query"]').first().click();
      cy.wait('@editParameterQuery');
      getBody().find('opr-code-editor#query-text').type('{selectall}{backspace}{selectall}{backspace}');
      // eslint-disable-next-line no-template-curly-in-string
      getBody().find('opr-code-editor#query-text').type('select distinct sold_item from demotable where ${timestamp > ${calendar:start}} and ${timestamp < ${calendar:end}} order by sold_item', { parseSpecialCharSequences: false });
      getBody().find('#buttonExecuteQuery').click();
      getBody().find('#buttonConfirm').click();
      cy.wait('@editParameterQuery');
    });
  });

  it('Check no data found in case of date range parameter', () => {
    cy.bvdLogin();
    cy.visit('/#/dataCollector');
    cy.wait(['@pageloadSystem', '@pageloadUser']);
    cy.enter('#contentFrame').then(getBody => {
      getBody().find('[data-cy="queryList"]').should('be.visible');
      getBody().find('div[text="data_query"]').click();
      getBody().find('[data-cy="edit-query"]').first().click();
      cy.wait('@editParameterQuery');
      getBody().find('opr-code-editor#query-text').type('{selectall}{backspace}{selectall}{backspace}');
      // eslint-disable-next-line no-template-curly-in-string
      getBody().find('opr-code-editor#query-text').type('select timestamp from demotable where ${sold_item=${si}} order by timestamp', { parseSpecialCharSequences: false });
      getBody().find('#buttonExecuteQuery').click();
      getBody().find('#buttonConfirm').click();
      cy.wait('@editParameterQuery');
    });
    cy.visit('/#/show/nestedParam?params=none');
    cy.wait(['@channelState']);
    MainPage.clickSlideOutForParamSelection();
    MainPage.selectPredefinedTime('FIVE_MINUTES', true);
    cy.get('[data-cy="no-data-found"]');
  });

  it('Check nested param tree structure with date range parameter', () => {
    cy.bvdLogin();
    cy.visit('/#/show/nestedParam?params=none');
    cy.wait(['@pageloadUser', '@channelState']);
    MainPage.clickSlideOutForParamSelection();
    const fromdatelist = ['2021', 'Jun 2021', 'Jun 2, 2021', '12', '00', 'AM'];
    const todatelist = ['2021', 'Jun 2021', 'Jun 30, 2021', '11', '59', 'PM'];
    MainPage.selectDateParamsFromSlideout(fromdatelist, todatelist, false, '');
    cy.wait('@parameterExecution');
    MainPage.selectDropDownParameter(24, 'si');
    MainPage.checkForApplyButtonStatus('not.be.disabled');
    MainPage.checkForResetButtonStatus('not.be.disabled');
    MainPage.clickApplyAndCheckStatus();
    MainPage.checkIfDropDownHasSelectedParameter(24, 'si');
    cy.get('[data-cy="date-string"]').invoke('text').then(text => {
      // remove the space char
      expect(text.replace(/\u00a0/g, ' ')).equal('06/02/2021 12:00 AM — 06/30/2021 11:59 PM');
    });
  });

  it('Reset nested param tree structure with date range parameter', () => {
    cy.bvdLogin();
    cy.visit('/#/show/nestedParam?params=none');
    cy.wait(['@pageloadUser', '@channelState']);
    MainPage.clickSlideOutForParamSelection();
    const fromdatelist = ['2021', 'Jun 2021', 'Jun 2, 2021', '12', '00', 'AM'];
    const todatelist = ['2021', 'Jun 2021', 'Jun 10, 2021', '11', '59', 'PM'];
    MainPage.selectDateParamsFromSlideout(fromdatelist, todatelist, false, '');
    cy.wait('@parameterExecution');
    MainPage.selectDropDownParameter(24, 'si');
    MainPage.checkForApplyButtonStatus('not.be.disabled');
    MainPage.checkForResetButtonStatus('not.be.disabled');
    MainPage.resetParameterValue();
    cy.get('bvd-ng2-dropdown[data-cy="si"]').should('not.exist');
    cy.get('[data-cy="date-string"]').should('contain', '');
  });

  it('Pass the parameters in URL and check values in UI for nested params', () => {
    cy.bvdLogin();
    cy.visit('/#/show/nestedParam?params=calendar:start%3D2021-06-07%2009:00:00;calendar:end%3D2021-06-20%2009:00:00;si%3D38');
    cy.wait(['@pageloadUser', '@channelState']);
    MainPage.clickSlideOutForParamSelection();
    MainPage.checkIfDropDownHasSelectedParameter(38, 'si');
    cy.get('[data-cy="date-string"]').invoke('text').then(text => {
      // remove the space char
      expect(text.replace(/\u00a0/g, ' ')).equal('06/07/2021 09:00 AM — 06/20/2021 09:00 AM');
    });
  });

  it('Cross launch to dashboard with date range parameter', () => {
    cy.bvdLogin();
    cy.visit('/#/show/nestedParam?params=calendar:start%3D2021-06-01%2009:00:00;calendar:end%3D2021-06-05%2009:00:00;si%3D22');
    cy.wait(['@pageloadUser', '@channelState']);
    cy.get('g#shape1').click();
    cy.wait(['@pageloadUser', '@channelState']);
    cy.url().should('include', '?params=calendar:start%3D2021-06-01%2009:00:00;calendar:end%3D2021-06-05%2009:00:00;si%3D22');
    MainPage.clickSlideOutForParamSelection();
    MainPage.checkIfDropDownHasSelectedParameter(22, 'si');
    cy.get('[data-cy="date-string"]').invoke('text').then(text => {
      // remove the space char
      expect(text.replace(/\u00a0/g, ' ')).equal('06/01/2021 09:00 AM — 06/05/2021 09:00 AM');
    });
    MainPage.checkText('shape1', '6/3/2021, 11:00:00');
  });

  it('Cross launch to dashboard with out passing any parameters', () => {
    cy.bvdLogin();
    cy.visit('/#/show/nestedParam?params=calendar:start%3D2021-06-07%2009:00:00;calendar:end%3D2021-06-20%2009:00:00;si%3D38');
    cy.wait(['@pageloadUser', '@channelState']);
    EditDashboardPage.editDashboard();
    cy.wait(['@categoriesLoad', '@svgDashboardLoad']);
    EditDashboardPage.selectWidget('shape1');
    EditDashboardPage.openDashboard('nestedParamDrilldown');
    cy.get('input#opr_hyperlink_params').then($element => {
      if ($element.hasClass('ng-not-empty')) {
        cy.get('input#opr_hyperlink_params').click();
        cy.get('input#opr_hyperlink_params').should('not.be.checked');
      }
    });
    EditDashboardPage.applyConfig();
    EditDashboardPage.cancelConfig();
    cy.wait('@channelState');
    cy.get('text.st2').click();
    cy.wait(['@pageloadUser', '@channelState']);
    cy.url().should('include', '?params=none');
    MainPage.clickSlideOutForParamSelection();
    cy.get('[data-cy="date-string"]').should('contain', '');
    cy.get('bvd-ng2-dropdown[data-cy="si"]').should('not.exist');
  });

  it('Check retention of multiple cascade parameters', () => {
    uploadFileRequest('reporting/MultiCascadeParameters.bvd', `${Cypress.env('BVD_CONTEXT_ROOT')}/urest/${Cypress.env('API_VERSION')}/dashboard`);
    cy.bvdLogin();
    cy.visit('/#/show/MultiCascadeParameters?params=none');
    cy.wait(['@pageloadSystem', '@pageloadUser', '@channelState']);
    MainPage.clickSlideOutForParamSelection();
    MainPage.checkForApplyButtonStatus('be.disabled');
    MainPage.checkForResetButtonStatus('be.disabled');
    MainPage.selectDropDownParameter('root 2', 'root');
    cy.wait(['@parameterExecution', '@parameterExecution', '@parameterExecution']);
    cy.get('bvd-ng2-dropdown[data-cy="param3"]');
    cy.get('bvd-ng2-dropdown[data-cy="param2a"]');
    cy.get('bvd-ng2-dropdown[data-cy="param1"]');
    MainPage.selectDropDownParameter('root 2', 'param3');
    MainPage.selectDropDownParameter('root 2', 'param2a');
    cy.wait('@parameterExecution');
    cy.get('bvd-ng2-dropdown[data-cy="param2"]');
    MainPage.selectDropDownParameter('root 2', 'param2');
    MainPage.selectDropDownParameter('root 2', 'param1');
    MainPage.selectDropDownParameter('root² 1', 'root2');
    MainPage.clickApplyAndCheckStatus();
    MainPage.checkIfDropDownHasSelectedParameter('root 2', 'root');
    MainPage.checkIfDropDownHasSelectedParameter('root 2', 'param3');
    MainPage.checkIfDropDownHasSelectedParameter('root 2', 'param2a');
    MainPage.checkIfDropDownHasSelectedParameter('root 2', 'param2');
    MainPage.checkIfDropDownHasSelectedParameter('root 2', 'param1');
    MainPage.checkIfDropDownHasSelectedParameter('root² 1', 'root2');
    MainPage.resetParameterValue();
    cy.get('bvd-ng2-dropdown[data-cy="param3"]').should('not.exist');
    cy.get('bvd-ng2-dropdown[data-cy="param2a"]').should('not.exist');
    cy.get('bvd-ng2-dropdown[data-cy="param1"]').should('not.exist');
    cy.get('bvd-ng2-dropdown[data-cy="param2"]').should('not.exist');
    MainPage.checkIfDropDownIsEmpty('root');
    MainPage.checkIfDropDownIsEmpty('root2');
  });

  it('Cross launch to dashboard with launch external url', () => {
    uploadFileRequest('reporting/DrillDownParentReport.bvd', `${Cypress.env('BVD_CONTEXT_ROOT')}/urest/${Cypress.env('API_VERSION')}/dashboard`);
    uploadFileRequest('reporting/DrillDownChildReport.bvd', `${Cypress.env('BVD_CONTEXT_ROOT')}/urest/${Cypress.env('API_VERSION')}/dashboard`);
    cy.bvdLogin();
    cy.visit('/#/show/DrillDownParentReport?params=single_date%3D2021-06-01%2011:00:00;si%3D20');
    cy.wait(['@pageloadSystem', '@pageloadUser', '@channelState']);
    MainPage.clickSlideOutForParamSelection();
    MainPage.checkIfDropDownHasSelectedParameter(20, 'si');
    cy.get('#instance-group18-1-shape13').click();
    cy.wait(['@pageloadUser', '@channelState']);
    cy.url().should('include', '/#/show/DrillDownChildReport?params=single_date%3D2021-06-01%2011:00:00;si%3D20');
    MainPage.clickSlideOutForParamSelection();
    MainPage.checkIfDropDownHasSelectedParameter(20, 'si');
  });

  it('Cross launch to dashboard with launch external url - Combination of hardcoded values and parameters', () => {
    uploadFileRequest('reporting/DrillDownParentReport.bvd', `${Cypress.env('BVD_CONTEXT_ROOT')}/urest/${Cypress.env('API_VERSION')}/dashboard`);
    uploadFileRequest('reporting/DrillDownChildReport.bvd', `${Cypress.env('BVD_CONTEXT_ROOT')}/urest/${Cypress.env('API_VERSION')}/dashboard`);
    cy.bvdLogin();
    cy.visit('/#/show/DrillDownParentReport?params=single_date%3D2021-06-01%2011:00:00');
    cy.wait(['@pageloadSystem', '@pageloadUser', '@channelState']);
    MainPage.clickSlideOutForParamSelection();
    MainPage.checkIfDropDownIsEmpty('si');
    cy.get('#group18').find('#instance-group18-1-shape14 text').click();
    cy.wait(['@pageloadUser', '@channelState']);
    cy.url().should('include', '/#/show/DrillDownChildReport?params=single_date%3D2021-06-01%2011:00:00;si%3D20');
    MainPage.clickSlideOutForParamSelection();
    MainPage.checkIfDropDownHasSelectedParameter(20, 'si');
  });

  it('Cross launch to dashboard with launch external url - Combination of template variables and parameters', () => {
    uploadFileRequest('reporting/DrillDownParentReport_combinationParams.bvd', `${Cypress.env('BVD_CONTEXT_ROOT')}/urest/${Cypress.env('API_VERSION')}/dashboard`);
    uploadFileRequest('reporting/DrillDownChildReport_combinationParams.bvd', `${Cypress.env('BVD_CONTEXT_ROOT')}/urest/${Cypress.env('API_VERSION')}/dashboard`);
    cy.bvdLogin();
    cy.visit('/#/show/DrillDownParentReport_combinationParams?params=nomcalendar:start%3D2021-10-01%2000:00:00;nomcalendar:end%3D2021-10-31%2023:59:00');
    cy.wait(['@pageloadSystem', '@pageloadUser', '@channelState']);
    cy.get('#group18').find('#instance-group18-1-shape14 text').click();
    cy.wait(['@pageloadUser', '@channelState']);
    cy.url().should('include', '/#/show/DrillDownChildReport_combinationParams?params=nomcalendar:start%3D2021-10-01%2000:00:00;nomcalendar:end%3D2021-10-31%2023:59:00;si%3D20');
    MainPage.clickSlideOutForParamSelection();
    MainPage.checkIfDropDownHasDateRangeAbsoluteValue(`10/01/2021 12:00 AM — 10/31/2021 11:59 PM`, `date-string`);
    cy.get('[id*=-shape13] text').should('contain', '6/1/2021, 11:00:00 AM');
    cy.get('[id*=-shape14] text').should('contain', '20');
  });

  it('Keep Tenant in BVD after login and in hyperlink', () => {
    cy.bvdLogin();
    cy.visit('/?tenant=Provider#/show/DrillDownParentReport_combinationParams?params=nomcalendar:start%3D2021-10-01%2000:00:00;nomcalendar:end%3D2021-10-31%2023:59:00');
    cy.wait(['@pageloadSystem', '@pageloadUser', '@channelState']);
    cy.url().then(urlString => {
      shared.checkTenantInUrl(urlString);
    });
    cy.get('#group18').find('#instance-group18-1-shape14 text').click();
    cy.wait(['@pageloadUser', '@channelState']);
    cy.url().should('include', '/#/show/DrillDownChildReport_combinationParams?params=nomcalendar:start%3D2021-10-01%2000:00:00;nomcalendar:end%3D2021-10-31%2023:59:00;si%3D20&tenant=Provider');
    MainPage.clickSlideOutForParamSelection();
    MainPage.checkIfDropDownHasDateRangeAbsoluteValue(`10/01/2021 12:00 AM — 10/31/2021 11:59 PM`, `date-string`);
    cy.get('[id*=-shape13] text').should('contain', '6/1/2021, 11:00:00 AM');
    cy.get('[id*=-shape14] text').should('contain', '20');
  });

  after(() => {
    // Logout of session if test fails during execution and logout does not occur through UI
    dashboard.dashboardDelete('DrillDownParentReport');
    dashboard.dashboardDelete('DrillDownChildReport');
    dashboard.dashboardDelete('MultiCascadeParameters');
    dashboard.dashboardDelete('nestedParam');
    dashboard.dashboardDelete('nestedParamDrilldown');
    dashboard.dashboardDelete('DrillDownParentReport_combinationParams');
    dashboard.dashboardDelete('DrillDownChildReport_combinationParams');
    dataCollector.deleteAllQueries();
    cy.bvdLogout();
  });
});
