// <reference types="Cypress" />
import 'cypress-iframe';
const shared = require('../../shared/shared');
const path = require('path');
const adminUser = Cypress.env('username');
const adminPasswd = Cypress.env('password');
const role = require('../../../../support/reporting/restUtils/role');

import { dashboardDelete } from '../../../../support/reporting/restUtils/dashboard';

describe('CSV Export UI Settings', () => {
  before(() => {
    let bvdCliFilePath = '';
    if (Cypress.platform === 'win32') {
      bvdCliFilePath = 'cypress/integration/bvd/reporting/cli/bvd-cli-win.exe';
    } else {
      bvdCliFilePath = 'cypress/integration/bvd/reporting/cli/bvd-cli-linux';
    }
    const bvdImportUrl = `${Cypress.env('IDM_BASE_URL')}${Cypress.env('BVD_CONTEXT_ROOT')}`;
    const dashboardsDirectory = 'cypress/fixtures/reporting/';

    cy.exec(`"${bvdCliFilePath}" --import --strictHostKeyChecking="no" --user="${adminUser}" --password="${adminPasswd}" --url="${bvdImportUrl}" --file="${dashboardsDirectory}SearchGroupWidget_chrome1.bvd"`);
    cy.exec(`"${bvdCliFilePath}" --import --strictHostKeyChecking="no" --user="${adminUser}" --password="${adminPasswd}" --url="${bvdImportUrl}" --file="${dashboardsDirectory}SystemCPU-TopN.bvd"`);
    cy.exec(`"${bvdCliFilePath}" --import --strictHostKeyChecking="no" --user="${adminUser}" --password="${adminPasswd}" --url="${bvdImportUrl}" --file="${dashboardsDirectory}DCACompliancePolicyDetails-test.bvd"`);
    cy.exec(`"${bvdCliFilePath}" --import --strictHostKeyChecking="no" --user="${adminUser}" --password="${adminPasswd}" --url="${bvdImportUrl}" --file="${dashboardsDirectory}DCACompliancePolicyDetails-test-nodata.bvd"`);
    cy.exec(`"${bvdCliFilePath}" --import --strictHostKeyChecking="no" --user="${adminUser}" --password="${adminPasswd}" --url="${bvdImportUrl}" --file="${dashboardsDirectory}DCACompliancePolicyDetails-test-nochannel.bvd"`);
    cy.exec(`"${bvdCliFilePath}" --import --strictHostKeyChecking="no" --user="${adminUser}" --password="${adminPasswd}" --url="${bvdImportUrl}" --file="${dashboardsDirectory}CSVDataFromLineBarGroupChart.bvd"`);
  });

  beforeEach(() => {
    cy.intercept(`${shared.reportingContextRoot}/rest/${Cypress.env('API_VERSION')}/system`).as('reportingPageloadSystem');
    cy.intercept(`${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/system`).as('foundationPageloadSystem');
    cy.intercept(`${shared.reportingContextRoot}/rest/${Cypress.env('API_VERSION')}/session/user`).as('pageloadUser');
    cy.intercept(`${shared.reportingContextRoot}/rest/${Cypress.env('API_VERSION')}/dashboard/*`).as('dashboardLoad');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pages/toc*`
    }).as('getTOC');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/BVDREPPAGE*`
    }).as('getPage');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/SCHEDULESPAGE*`
    }).as('getSchedulesPage');
    cy.intercept({
      method: 'GET',
      path: `${shared.webtopdfContextRoot}/${Cypress.env('API_VERSION')}/jobs/*`
    }).as('getJob');
    cy.intercept({
      method: 'POST',
      path: `${shared.webtopdfContextRoot}/${Cypress.env('API_VERSION')}/jobs`
    }).as('postJob');
    cy.intercept({
      method: 'PUT',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/session/user`
    }).as('updateUser');
    cy.intercept({
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/widgets/*`
    }).as('getWidget');
    cy.intercept({
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/session/user`
    }).as('getUser');
    cy.intercept({
      method: 'POST',
      path: `${shared.webtopdfContextRoot}/${Cypress.env('API_VERSION')}/jobs`
    }).as('createJob');
    cy.intercept({
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/authtoken`
    }).as('getXAuthToken');
    cy.intercept(`${Cypress.env('BVD_CONTEXT_ROOT')}/ui/dashboard/?*`).as('svgDashboardLoad');
    cy.bvdLogin();
  });

  const downloadsFolder = Cypress.config('downloadsFolder');
  const userName = 'bvdOnUIFUser';
  const userPwd = 'control@123D';
  const roleName = 'DefaultBvdRole';
  const roleDesc = 'DefaultBvdRole';
  const categoryName = 'All';
  const accessType = 'full-control';
  const resourceKey = 'omi-event';
  const creatingRoleForEmbeddedBVD = true;
  const zipFileNameRegex = /.*-\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}.zip/; // Pattern for checking file name contains appended time stamp

  const zipFileValidation = (fileToCheck, csvFileCount) => {
    cy.task('readDirectory', downloadsFolder).then(fileList => {
      let filename = fileList.find(file => file.startsWith(fileToCheck) && file.endsWith('.zip'));
      expect(zipFileNameRegex.test(filename)).to.be.true;
      filename = path.join(downloadsFolder, filename);
      cy.readFile(filename);
      cy.task('validateZipFile', filename).should('equal', csvFileCount);
    });
  };

  let roleId;
  it('create a Role through REST', () => {
    role.roleCreation(roleName, roleDesc, categoryName, accessType, resourceKey, creatingRoleForEmbeddedBVD).then(newRoleId => {
      roleId = newRoleId;
    });
  });

  it('csv export - no group widget present in dashboard', () => {
    cy.visit('/BVDREPPAGE?_m=Welcome_0_L2_SA_StakeHolderDashboards');
    cy.wait(['@foundationPageloadSystem', '@getUser', '@getUser', '@getUser', '@getTOC', '@getPage']);
    cy.frameLoaded('[data-cy="mondrian-iframe-bvdReporting"]');
    cy.wait(['@reportingPageloadSystem', '@pageloadUser', '@pageloadUser', '@pageloadUser', '@svgDashboardLoad', '@dashboardLoad']);
    cy.get('[data-cy="action-button"]').click();
    cy.get('[data-cy="action-button-export_pdf"]').click();
    cy.wait(['@getWidget', '@getUser']);
    cy.get('pdf-settings-box');
    cy.get('[data-cy="csv-format-radio-button"]').click();
    cy.get('[data-cy="csv-format-radio-button"] input').should('have.attr', 'aria-checked', 'true');
    cy.get('[data-cy="submit-button"]').click();
    cy.wait(['@getXAuthToken', '@updateUser']);
    cy.bvdCheckToast('CSV generation started. You will be notified when the file is ready.');
    cy.get('ux-alert').find('span').contains('The CSV cannot get exported as no tabular data exists on this dashboard.');
  });

  it('csv export - single group widget present in dashboard', () => {
    cy.visit('/BVDREPPAGE?_m=SearchGroupWidget_chrome1_0_L2_SA_StakeHolderDashboards');
    cy.wait(['@foundationPageloadSystem', '@getUser', '@getUser', '@getUser', '@getTOC', '@getPage']);
    cy.frameLoaded('[data-cy="mondrian-iframe-bvdReporting"]');
    cy.wait(['@reportingPageloadSystem', '@pageloadUser', '@pageloadUser', '@pageloadUser', '@svgDashboardLoad', '@dashboardLoad']);
    cy.get('[data-cy="action-button"]').click();
    cy.get('[data-cy="action-button-export_pdf"]').click();
    cy.wait(['@getWidget', '@getUser']);
    cy.get('pdf-settings-box').click();
    cy.get('[data-cy="csv-format-radio-button"]').click();
    cy.get('[data-cy="csv-format-radio-button"] input').should('have.attr', 'aria-checked', 'true');
    cy.get('[data-cy="submit-button"]').click();
    cy.wait(['@getXAuthToken', '@updateUser']);
    cy.bvdCheckToast('CSV generation started. You will be notified when the file is ready.');
    zipFileValidation('SearchGroupWidget_chrome1', 1);
  });

  it('csv export - multiple group widgets present in the dashboard', () => {
    cy.visit('/BVDREPPAGE?_m=SystemCPU-TopN_0_L2_SA_StakeHolderDashboards');
    cy.wait(['@foundationPageloadSystem', '@getUser', '@getUser', '@getUser', '@getTOC', '@getPage']);
    cy.frameLoaded('[data-cy="mondrian-iframe-bvdReporting"]');
    cy.wait(['@reportingPageloadSystem', '@pageloadUser', '@pageloadUser', '@pageloadUser', '@svgDashboardLoad', '@dashboardLoad']);
    cy.get('[data-cy="action-button"]').click();
    cy.get('[data-cy="action-button-export_pdf"]').click();
    cy.wait(['@getWidget', '@getUser']);
    cy.get('pdf-settings-box').click();
    cy.get('[data-cy="csv-format-radio-button"]').click();
    cy.get('[data-cy="csv-format-radio-button"] input').should('have.attr', 'aria-checked', 'true');
    cy.get('[data-cy="submit-button"]').click();
    cy.wait(['@getXAuthToken', '@updateUser']);
    cy.bvdCheckToast('CSV generation started. You will be notified when the file is ready.');
    zipFileValidation('SystemCPU-TopN', 2);
  });

  it('csv export - combination of text widget and group widget present in dashboard', () => {
    cy.visit('/BVDREPPAGE?_m=DCACompliancePolicyDetails-test_0_L2_SA_StakeHolderDashboards');
    cy.wait(['@foundationPageloadSystem', '@getUser', '@getUser', '@getUser', '@getTOC', '@getPage']);
    cy.frameLoaded('[data-cy="mondrian-iframe-bvdReporting"]');
    cy.wait(['@reportingPageloadSystem', '@pageloadUser', '@pageloadUser', '@pageloadUser', '@svgDashboardLoad', '@dashboardLoad']);
    cy.get('[data-cy="action-button"]').click();
    cy.get('[data-cy="action-button-export_pdf"]').click();
    cy.wait(['@getWidget', '@getUser']);
    cy.get('pdf-settings-box').click();
    cy.get('[data-cy="csv-format-radio-button"]').click();
    cy.get('[data-cy="csv-format-radio-button"] input').should('have.attr', 'aria-checked', 'true');
    cy.get('[data-cy="submit-button"]').click();
    cy.wait(['@getXAuthToken', '@updateUser']);
    cy.bvdCheckToast('CSV generation started. You will be notified when the file is ready.');
    zipFileValidation('DCACompliancePolicyDetailss', 1);
  });

  it('csv export - single group widget present in dashboard and data channel is not having data', () => {
    cy.visit('/BVDREPPAGE?_m=DCACompliancePolicyDetails-test-nodata_0_L2_SA_StakeHolderDashboards');
    cy.wait(['@foundationPageloadSystem', '@getUser', '@getUser', '@getUser', '@getTOC', '@getPage']);
    cy.frameLoaded('[data-cy="mondrian-iframe-bvdReporting"]');
    cy.wait(['@reportingPageloadSystem', '@pageloadUser', '@pageloadUser', '@pageloadUser', '@svgDashboardLoad', '@dashboardLoad']);
    cy.get('[data-cy="action-button"]').click();
    cy.get('[data-cy="action-button-export_pdf"]').click();
    cy.wait(['@getWidget', '@getUser']);
    cy.get('pdf-settings-box').click();
    cy.get('[data-cy="csv-format-radio-button"]').click();
    cy.get('[data-cy="csv-format-radio-button"] input').should('have.attr', 'aria-checked', 'true');
    cy.get('[data-cy="submit-button"]').click();
    cy.wait(['@getXAuthToken', '@updateUser']);
    cy.bvdCheckToast('CSV generation started. You will be notified when the file is ready.');
    cy.bvdCheckToast('The CSV cannot be exported since this dashboard contains no data');
  });

  it('csv export - single group widget present in dashboard and data channel does not exist', () => {
    cy.visit('/BVDREPPAGE?_m=DCACompliancePolicyDetails-test-nochannel_0_L2_SA_StakeHolderDashboards');
    cy.wait(['@foundationPageloadSystem', '@getUser', '@getUser', '@getUser', '@getTOC', '@getPage']);
    cy.frameLoaded('[data-cy="mondrian-iframe-bvdReporting"]');
    cy.wait(['@reportingPageloadSystem', '@pageloadUser', '@pageloadUser', '@pageloadUser', '@svgDashboardLoad', '@dashboardLoad']);
    cy.get('[data-cy="action-button"]').click();
    cy.get('[data-cy="action-button-export_pdf"]').click();
    cy.wait(['@getWidget', '@getUser']);
    cy.get('pdf-settings-box').click();
    cy.get('[data-cy="csv-format-radio-button"]').click();
    cy.get('[data-cy="csv-format-radio-button"] input').should('have.attr', 'aria-checked', 'true');
    cy.get('[data-cy="submit-button"]').click();
    cy.wait(['@getXAuthToken', '@updateUser']);
    cy.bvdCheckToast('CSV generation started. You will be notified when the file is ready.');
    cy.get('ux-alert').find('span').contains('The CSV cannot get exported');
  });

  it('csv export - LineChart BarChart Group Widget', () => {
    cy.visit('/BVDREPPAGE?_m=CSVDataFromLineBarGroupChart_0_L2_SA_StakeHolderDashboards');
    cy.wait(['@foundationPageloadSystem', '@getUser', '@getUser', '@getUser', '@getTOC', '@getPage']);
    cy.frameLoaded('[data-cy="mondrian-iframe-bvdReporting"]');
    cy.wait(['@reportingPageloadSystem', '@pageloadUser', '@pageloadUser', '@pageloadUser', '@svgDashboardLoad', '@dashboardLoad']);
    cy.get('[data-cy="action-button"]').click();
    cy.get('[data-cy="action-button-export_pdf"]').click();
    cy.wait(['@getWidget', '@getUser']);
    cy.get('pdf-settings-box').click();
    cy.get('[data-cy="csv-format-radio-button"]').click();
    cy.get('[data-cy="csv-format-radio-button"] input').should('have.attr', 'aria-checked', 'true');
    cy.get('[data-cy="submit-button"]').click();
    cy.wait(['@getXAuthToken', '@updateUser']);
    cy.bvdCheckToast('CSV generation started. You will be notified when the file is ready.');
    zipFileValidation('CSVDataFromLineBarGroupChart', 4);
  });

  it('login As Non Admin User and Do an Export', () => {
    cy.bvdLogout();
    cy.bvdLogin(userName, userPwd);
    cy.visit('/BVDREPPAGE?_m=CSVDataFromLineBarGroupChart_0_L2_SA_StakeHolderDashboards');
    cy.wait(['@foundationPageloadSystem', '@getUser', '@getUser', '@getUser', '@getTOC', '@getPage']);
    cy.frameLoaded('[data-cy="mondrian-iframe-bvdReporting"]');
    cy.wait(['@reportingPageloadSystem', '@pageloadUser', '@pageloadUser', '@pageloadUser', '@svgDashboardLoad', '@dashboardLoad']);
    cy.get('[data-cy="action-button"]').click();
    cy.get('[data-cy="action-button-export_pdf"]').click();
    cy.wait(['@getWidget', '@getUser']);
    cy.get('pdf-settings-box').click();
    cy.get('[data-cy="csv-format-radio-button"]').click();
    cy.get('[data-cy="csv-format-radio-button"] input').should('have.attr', 'aria-checked', 'true');
    cy.get('[data-cy="submit-button"]').click();
    cy.wait(['@getXAuthToken', '@updateUser']);
    cy.bvdCheckToast('CSV generation started. You will be notified when the file is ready.');
    zipFileValidation('CSVDataFromLineBarGroupChart', 4);
  });

  it('check CSV in sidepanel schedule UI', () => {
    cy.visit('/BVDREPPAGE?_m=SearchGroupWidget_chrome1_0_L2_SA_StakeHolderDashboards');
    cy.wait(['@foundationPageloadSystem', '@getUser', '@getUser', '@getUser', '@getTOC', '@getPage']);
    cy.frameLoaded('[data-cy="mondrian-iframe-bvdReporting"]');
    cy.wait(['@reportingPageloadSystem', '@pageloadUser', '@pageloadUser', '@pageloadUser', '@svgDashboardLoad', '@dashboardLoad']);
    cy.get('[data-cy="action-button"]').click();
    cy.get('[data-cy="action-button-new_schedule"]').click();
    cy.wait(['@getWidget', '@getUser']);
    cy.get('pdf-settings-box').click();
    cy.get('[data-cy="csv-format-radio-button"]').click();
    cy.get('[data-cy="csv-format-radio-button"] input').should('have.attr', 'aria-checked', 'true');
    cy.get('[data-cy="cron-expression-input"]').type('5 4 * * *');
    cy.get('[data-cy="email-to-input"]').type('{selectall}{backspace}test1@test.com');
    cy.get('[data-cy="submit-button"]').click();
    cy.wait(['@updateUser', '@getXAuthToken', '@createJob']);
    cy.bvdCheckToast('Successfully scheduled the job');
  });

  it('check CSV in schedules list', () => {
    cy.visit('/SCHEDULESPAGE?_m=schedules');
    cy.wait(['@foundationPageloadSystem', '@getUser', '@getUser', '@getUser', '@getTOC', '@getSchedulesPage']);
    cy.get('[data-cy="list-item-0"]').trigger('mouseenter').within(() => {
      cy.get(`[data-cy="action-item-qtm-icon-download-document-button"]`).click();
      cy.wait(['@getXAuthToken', '@getJob', '@getXAuthToken']);
    });
    cy.bvdCheckToast('CSV generation started. You will be notified when the file is ready.');
  });

  after(() => {
    cy.bvdLogout();
    cy.task('deleteFolder', downloadsFolder);
    Cypress.config().baseUrl = `${Cypress.env('IDM_BASE_URL')}${Cypress.env('BVD_CONTEXT_ROOT')}`;
    dashboardDelete('SearchGroupWidget_chrome1');
    dashboardDelete('SystemCPU-TopN');
    dashboardDelete('DCACompliancePolicyDetails-test');
    dashboardDelete('DCACompliancePolicyDetails-test-nodata');
    dashboardDelete('DCACompliancePolicyDetails-test-nochannel');
    dashboardDelete('CSVDataFromLineBarGroupChart');
    role.roleDeletion(roleId, creatingRoleForEmbeddedBVD);
  });
});
